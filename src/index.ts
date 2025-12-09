import dotenv from "dotenv";
dotenv.config(); 

import express from "express";
import cors from "cors";
import pool from "./utils/db";
import salesRouter from "./routes/sales.routes";

const app = express();
app.use(cors());
app.use(express.json());
app.use("/api/sales", salesRouter);

app.get("/health", (req, res) => {
  res.json({ status: "Backend running" });
});

app.get("/db-test", async (req, res) => {
  try {
    const r = await pool.query("SELECT NOW() as now");
    res.json({ ok: true, now: r.rows[0].now });
  } catch (err) {
    console.error("DB test error:", err);
    res.status(500).json({ ok: false, error: (err as Error).message });
  }
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, async () => {
  console.log(`Backend running on port ${PORT}`);

  try {
    const client = await pool.connect();
    await client.query("SELECT 1");
    client.release();
    console.log("Connected to Postgres successfully");
  } catch (err) {
    console.error(
      "Could not connect to Postgres on startup:",
      (err as Error).message
    );
  }
});