import "dotenv/config";
import { readFile } from "node:fs/promises";
import { fileURLToPath } from "node:url";
import path from "node:path";
import pg from "pg";

const { Pool } = pg;

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const schemaPath = path.join(__dirname, "schema.sql");
const connectionString =
  process.env.DATABASE_URL ||
  "postgres://beetee:beetee_dev_password@localhost:5432/beetee_dev";

const pool = new Pool({ connectionString });

try {
  const schema = await readFile(schemaPath, "utf8");
  await pool.query(schema);
  console.log("Database schema is ready.");
} finally {
  await pool.end();
}
