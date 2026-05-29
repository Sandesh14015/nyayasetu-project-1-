import dotenv from "dotenv";
import path from "path";
import { fileURLToPath } from "url";
import { logger } from "./lib/logger";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load the root repository .env file before importing app or any modules that depend on env.
// Dist output lives under artifacts/api-server/dist, so ../../../.env points to repo root.
dotenv.config({ path: path.resolve(__dirname, "../../../.env") });

const rawPort = process.env["PORT"] ?? "8080";

const { default: app } = await import("./app");

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});
