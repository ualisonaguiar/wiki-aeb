import "dotenv/config";
import express from "express";
import type { ErrorRequestHandler } from "express";
import cors from "cors";
import path from "path";
import { fileURLToPath } from "url";

import routes from "./routes/index.js";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const IS_DEV = process.env.NODE_ENV !== "production";

const app = express();

app.use(cors());
app.use(express.json());

app.use("/api", routes);

const apiErrorHandler: ErrorRequestHandler = (err, _req, res, _next) => {
  console.error(err);

  res.status(500).json({
    error: "Erro interno do servidor",
    code: "INTERNAL_SERVER_ERROR",
  });
};

app.use("/api", apiErrorHandler);

if (!IS_DEV) {
  const distPath = path.join(__dirname, "..", "dist");

  app.use(express.static(distPath));
  app.use((_req, res) => {
    res.sendFile(path.join(distPath, "index.html"));
  });
}

export default app;
