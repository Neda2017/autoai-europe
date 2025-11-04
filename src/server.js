import express from 'express';
import cors from 'cors';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

app.get('/openapi/autoai.yaml', (req, res) => {
  res.sendFile(path.join(__dirname, 'openapi', 'autoai.yaml'));
});

app.get('/', (req, res) => {
  res.json({ ok: true, service: "autoai-europe-backend" });
});

app.listen(process.env.PORT || 3000, () => {
  console.log("AutoAI Europe backend running");
});
