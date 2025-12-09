"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const dotenv_1 = __importDefault(require("dotenv"));
dotenv_1.default.config();
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const db_1 = __importDefault(require("./utils/db"));
const sales_routes_1 = __importDefault(require("./routes/sales.routes"));
const app = (0, express_1.default)();
app.use((0, cors_1.default)());
app.use(express_1.default.json());
app.use("/api/sales", sales_routes_1.default);
app.get("/health", (req, res) => {
    res.json({ status: "Backend running" });
});
app.get("/db-test", async (req, res) => {
    try {
        const r = await db_1.default.query("SELECT NOW() as now");
        res.json({ ok: true, now: r.rows[0].now });
    }
    catch (err) {
        console.error("DB test error:", err);
        res.status(500).json({ ok: false, error: err.message });
    }
});
const PORT = process.env.PORT || 5000;
app.listen(PORT, async () => {
    console.log(`Backend running on port ${PORT}`);
    try {
        const client = await db_1.default.connect();
        await client.query("SELECT 1");
        client.release();
        console.log("Connected to Postgres successfully");
    }
    catch (err) {
        console.error("Could not connect to Postgres on startup:", err.message);
    }
});
