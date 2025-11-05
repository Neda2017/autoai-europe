import express from "express";
import cors from "cors";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";

import routes from "./routes.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(express.json());
app.use(cors());

// ✅ Serve OpenAPI YAML correctly
app.get("/openapi/autoai-openapi.yaml", (req, res) => {
  const filePath = path.join(__dirname, "openapi", "autoai-openapi.yaml");
  console.log("Serving YAML from:", filePath);

  if (!fs.existsSync(filePath)) {
    return res.status(404).send("YAML file not found");
  }

  res.setHeader("Content-Type", "text/yaml");
  res.sendFile(filePath);
});

// Register routes
app.use("/", router);

const PORT = process.env.PORT || 10000;

app.listen(PORT, "0.0.0.0", () => {
  console.log(`AutoAI Europe backend running on port ${PORT}`);
});
