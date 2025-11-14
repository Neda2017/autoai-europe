import express from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

const app = express();
const port = process.env.PORT || 10000;

// ✅ Needed to resolve __dirname in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// --- Middleware ---
app.use(cors());
app.use(express.json());

// ✅ Serve all static files from /public folder
// This makes /autoai-chat.html and /static/... accessible by URL
app.use(express.static(path.join(__dirname, "public")));

// --- Example route (keep your existing API routes here) ---
app.get("/api/health", (req, res) => {
  res.json({ ok: true, message: "AutoAI Europe API online" });
});

// --- Catch-all route for safety ---
app.get("*", (req, res, next) => {
  // If the route doesn’t exist and isn’t a static file,
  // just send a 404 instead of crashing the server
  if (req.path.includes(".")) return next();
  res.status(404).send("Route not found");
});

// --- Start the server ---
app.listen(port, () => {
  console.log(`✅ AutoAI Europe server running on port ${port}`);
});
