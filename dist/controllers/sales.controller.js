"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.getSales = getSales;
const sales_service_1 = require("../services/sales.service");
async function getSales(req, res) {
    try {
        const { q, sort, page, pageSize, date_from, date_to, } = req.query;
        const regions = Array.isArray(req.query.regions)
            ? req.query.regions
            : req.query.regions
                ? String(req.query.regions).split(",")
                : [];
        const genders = Array.isArray(req.query.genders)
            ? req.query.genders
            : req.query.genders
                ? String(req.query.genders).split(",")
                : [];
        const categories = Array.isArray(req.query.categories)
            ? req.query.categories
            : req.query.categories
                ? String(req.query.categories).split(",")
                : [];
        const tags = Array.isArray(req.query.tags)
            ? req.query.tags
            : req.query.tags
                ? String(req.query.tags).split(",")
                : [];
        const paymentMethods = Array.isArray(req.query.paymentMethods)
            ? req.query.paymentMethods
            : req.query.paymentMethods
                ? String(req.query.paymentMethods).split(",")
                : [];
        const age_min = req.query.age_min ? Number(req.query.age_min) : undefined;
        const age_max = req.query.age_max ? Number(req.query.age_max) : undefined;
        const params = {
            q: q ? String(q) : undefined,
            regions,
            genders,
            age_min,
            age_max,
            categories,
            tags,
            paymentMethods,
            date_from: date_from ? String(date_from) : undefined,
            date_to: date_to ? String(date_to) : undefined,
            sort: sort ? String(sort) : undefined,
            page: page ? Number(page) : 1,
            pageSize: pageSize ? Number(pageSize) : 10,
        };
        const data = await (0, sales_service_1.querySales)(params);
        res.json(data);
    }
    catch (err) {
        console.error("getSales error:", err);
        res.status(500).json({ ok: false, error: "Server error" });
    }
}
