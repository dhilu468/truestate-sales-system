import pool from "../utils/db";

export type SalesQueryParams = {
  q?: string;
  regions?: string[];
  genders?: string[];
  age_min?: number;
  age_max?: number;
  categories?: string[];
  tags?: string[];
  paymentMethods?: string[];
  date_from?: string;
  date_to?: string;
  sort?: string;
  page?: number;
  pageSize?: number;
};

function buildWhereAndParams(params: SalesQueryParams) {
  const whereClauses: string[] = [];
  const values: any[] = [];
  let idx = 1;

  if (params.q) {
    whereClauses.push(`(customer_name ILIKE $${idx} OR phone_number ILIKE $${idx})`);
    values.push(`%${params.q}%`);
    idx++;
  }

  if (params.regions && params.regions.length) {
    whereClauses.push(`customer_region = ANY($${idx}::text[])`);
    values.push(params.regions);
    idx++;
  }

  if (params.genders && params.genders.length) {
    whereClauses.push(`gender = ANY($${idx}::text[])`);
    values.push(params.genders);
    idx++;
  }

  if (typeof params.age_min === "number") {
    whereClauses.push(`age >= $${idx}`);
    values.push(params.age_min);
    idx++;
  }

  if (typeof params.age_max === "number") {
    whereClauses.push(`age <= $${idx}`);
    values.push(params.age_max);
    idx++;
  }

  if (params.categories && params.categories.length) {
    whereClauses.push(`product_category = ANY($${idx}::text[])`);
    values.push(params.categories);
    idx++;
  }

  if (params.tags && params.tags.length) {
    const tagClauses: string[] = [];
    for (const t of params.tags) {
      tagClauses.push(`tags ILIKE $${idx}`);
      values.push(`%${t}%`);
      idx++;
    }
    whereClauses.push(`(${tagClauses.join(" OR ")})`);
  }

  if (params.paymentMethods && params.paymentMethods.length) {
    whereClauses.push(`payment_method = ANY($${idx}::text[])`);
    values.push(params.paymentMethods);
    idx++;
  }

  if (params.date_from) {
    whereClauses.push(`date >= $${idx}`);
    values.push(params.date_from);
    idx++;
  }

  if (params.date_to) {
    whereClauses.push(`date <= $${idx}`);
    values.push(params.date_to);
    idx++;
  }

  const where = whereClauses.length ? `WHERE ${whereClauses.join(" AND ")}` : "";
  return { where, values };
}

function mapSort(sort?: string) {
  const map: Record<string, string> = {
    date_desc: "date DESC",
    date_asc: "date ASC",
    quantity_asc: "quantity ASC",
    quantity_desc: "quantity DESC",
    customer_asc: "customer_name ASC",
    customer_desc: "customer_name DESC",
  };
  return map[sort || "date_desc"] ?? "date DESC";
}

export async function querySales(params: SalesQueryParams) {
  const page = Math.max(1, Number(params.page || 1));
  const pageSize = Math.max(1, Number(params.pageSize || 10));
  const offset = (page - 1) * pageSize;

  const { where, values } = buildWhereAndParams(params);
  const orderBy = mapSort(params.sort);

  const sql = `
    SELECT
      transaction_id, date, customer_id, customer_name, phone_number, gender, age, customer_region, customer_type,
      product_id, product_name, brand, product_category, tags,
      quantity, price_per_unit, discount_percentage, total_amount, final_amount,
      payment_method, order_status, delivery_type, store_id, store_location, salesperson_id, employee_name,
      COUNT(*) OVER() AS total_count
    FROM sales
    ${where}
    ORDER BY ${orderBy}
    LIMIT $${values.length + 1} OFFSET $${values.length + 2};
  `;

  const queryValues = [...values, pageSize, offset];

  const client = await pool.connect();
  try {
    const result = await client.query(sql, queryValues);

    const total = result.rows.length ? Number(result.rows[0].total_count ?? 0) : 0;

    const items = result.rows.map((r: any) => {
      delete r.total_count;
      return r;
    });

    return {
      items,
      total,
      page,
      pageSize,
    };
  } finally {
    client.release();
  }
}