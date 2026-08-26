const db = require("./database");

function getReportData() {
  const summary = db
    .prepare(`
      SELECT
        COUNT(*) AS totalOrders,
        ROUND(COALESCE(SUM(amount), 0), 2) AS totalRevenue
      FROM orders
    `)
    .get();

  const topProducts = db
    .prepare(`
      SELECT
        product,
        COUNT(*) AS orderCount,
        ROUND(SUM(amount), 2) AS revenue
      FROM orders
      GROUP BY product
      ORDER BY revenue DESC
      LIMIT 5
    `)
    .all();

  const ordersPerDay = db
    .prepare(`
      SELECT
        created_at AS date,
        COUNT(*) AS orderCount,
        ROUND(SUM(amount), 2) AS revenue
      FROM orders
      WHERE date(created_at) >= date('now', '-6 days')
      GROUP BY created_at
      ORDER BY created_at ASC
    `)
    .all();

  return {
    totalOrders: summary.totalOrders,
    totalRevenue: summary.totalRevenue,
    topProducts,
    ordersPerDay,
  };
}

function getAllOrders() {
  return db
    .prepare(`
      SELECT id, customer, product, amount, created_at
      FROM orders
      ORDER BY created_at DESC, id DESC
    `)
    .all();
}

module.exports = {
  getReportData,
  getAllOrders,
};
