import express from "express";
import cors from "cors";
import { fileURLToPath } from "url";
import path from "path";
import router from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json({ limit: "10mb" }));

// YAML endpoint
app.get("/openapi/autoai-openapi.yaml", (req, res) => {
  res.sendFile(path.join(__dirname, "openapi", "autoai-openapi.yaml"));
});

// ✅ Main router
app.use("/", router);

const PORT = process.env.PORT || 10000;

app.listen(PORT, () => {
  console.log("AutoAI Europe backend running");
});

