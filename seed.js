const db = require("./database");

const customers = [
  "Ahmed",
  "Sara",
  "Mohammed",
  "Aisha",
  "Omar",
  "Fatima",
  "Ali",
  "Mariam",
];

const products = [
  "Laptop Stand",
  "Wireless Mouse",
  "Mechanical Keyboard",
  "USB-C Hub",
  "Webcam",
  "Headphones",
];

function randomItem(items) {
  return items[Math.floor(Math.random() * items.length)];
}

function randomAmount() {
  return Number((Math.random() * 195 + 5).toFixed(2));
}

function randomDate() {
  const date = new Date();
  const daysAgo = Math.floor(Math.random() * 30);
  date.setUTCDate(date.getUTCDate() - daysAgo);
  return date.toISOString().slice(0, 10);
}

const insertOrder = db.prepare(`
  INSERT INTO orders (customer, product, amount, created_at)
  VALUES (?, ?, ?, ?)
`);

try {
  db.exec("BEGIN TRANSACTION");

  // This makes the seed safe to run repeatedly.
  db.exec("DELETE FROM orders");

  for (let index = 0; index < 200; index += 1) {
    insertOrder.run(
      randomItem(customers),
      randomItem(products),
      randomAmount(),
      randomDate()
    );
  }

  db.exec("COMMIT");

  const result = db
    .prepare("SELECT COUNT(*) AS count FROM orders")
    .get();

  console.log(`Database seeded successfully: ${result.count} orders`);
} catch (error) {
  db.exec("ROLLBACK");
  console.error("Failed to seed database:", error);
  process.exit(1);
}