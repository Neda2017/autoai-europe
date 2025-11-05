// ------------------------------
// AutoAI Europe Backend Server
// ------------------------------

import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import router from "./routes.js";  // ✅ our main router

// Fix __dirname for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Create express app
const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// ✅ Root healthcheck
app.get("/", (req, res) => {
  res.json({
    ok: true,
    service: "autoai-europe-backend",
    status: "running"
  });
});

// ✅ Serve OpenAPI YAML for GPT Actions
app.get("/openapi/autoai-openapi.yaml", (req, res) => {
  res.sendFile(path.join(__dirname, "openapi", "autoai-openapi.yaml"));
});

// ✅ Attach router for all API endpoints
app.use("/", router);

// ✅ Render port
const PORT = process.env.PORT || 10000;
app.listen(PORT, () => {
  console.log("✅ AutoAI Europe backend running on port " + PORT);
});
