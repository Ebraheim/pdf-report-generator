const path = require("path");
const { DatabaseSync } = require("node:sqlite");

const databasePath = path.join(__dirname, "report.db");
const db = new DatabaseSync(databasePath);

db.exec(`
  CREATE TABLE IF NOT EXISTS orders (
    id INTEGER PRIMARY KEY,
    customer TEXT NOT NULL,
    product TEXT NOT NULL,
    amount REAL NOT NULL,
    created_at TEXT NOT NULL
  );

  CREATE TABLE IF NOT EXISTS reports (
    id TEXT PRIMARY KEY,
    path TEXT NOT NULL,
    created_at TEXT NOT NULL
  );
`);

const reportColumns = db
  .prepare("PRAGMA table_info(reports)")
  .all();

const hasIdempotencyKey = reportColumns.some(
  (column) => column.name === "idempotency_key"
);

if (!hasIdempotencyKey) {
  db.exec(`
    ALTER TABLE reports
    ADD COLUMN idempotency_key TEXT
  `);
}

db.exec(`
  CREATE UNIQUE INDEX IF NOT EXISTS
  reports_idempotency_key_index
  ON reports (idempotency_key)
  WHERE idempotency_key IS NOT NULL
`);

module.exports = db;