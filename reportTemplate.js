function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function formatCurrency(value) {
  return `$${Number(value).toFixed(2)}`;
}

function buildReportHtml(reportData, orders) {
  const reportDate = new Date().toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "long",
    year: "numeric",
    timeZone: "UTC",
  });

  const topProductRows = reportData.topProducts
    .map(
      (item, index) => `
        <tr>
          <td>${index + 1}</td>
          <td>${escapeHtml(item.product)}</td>
          <td>${item.orderCount}</td>
          <td>${formatCurrency(item.revenue)}</td>
        </tr>
      `
    )
    .join("");

  const dailyRows = reportData.ordersPerDay
    .map(
      (item) => `
        <tr>
          <td>${escapeHtml(item.date)}</td>
          <td>${item.orderCount}</td>
          <td>${formatCurrency(item.revenue)}</td>
        </tr>
      `
    )
    .join("");

  const orderRows = orders
    .map(
      (order) => `
        <tr>
          <td>${order.id}</td>
          <td>${escapeHtml(order.customer)}</td>
          <td>${escapeHtml(order.product)}</td>
          <td>${formatCurrency(order.amount)}</td>
          <td>${escapeHtml(order.created_at)}</td>
        </tr>
      `
    )
    .join("");

  return `
    <!DOCTYPE html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <title>Sales Report</title>

        <style>
          @page {
            size: A4;
            margin: 18mm 14mm;
          }

          * {
            box-sizing: border-box;
          }

          body {
            margin: 0;
            color: #1f2937;
            background: #ffffff;
            font-family: Arial, Helvetica, sans-serif;
            font-size: 11px;
            line-height: 1.4;
          }

          .header {
            margin-bottom: 22px;
            padding: 22px;
            color: #ffffff;
            background: linear-gradient(135deg, #0f766e, #115e59);
            border-radius: 10px;
          }

          .header h1 {
            margin: 0 0 6px;
            font-size: 28px;
          }

          .header p {
            margin: 0;
            color: #ccfbf1;
          }

          .summary {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 14px;
            margin-bottom: 22px;
          }

          .card {
            padding: 18px;
            background: #f0fdfa;
            border: 1px solid #99f6e4;
            border-radius: 8px;
          }

          .card-label {
            margin-bottom: 6px;
            color: #0f766e;
            font-size: 11px;
            font-weight: bold;
            text-transform: uppercase;
          }

          .card-value {
            font-size: 24px;
            font-weight: bold;
          }

          h2 {
            margin: 22px 0 10px;
            color: #115e59;
            font-size: 17px;
          }

          table {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 18px;
          }

          thead {
            display: table-header-group;
          }

          tr {
            break-inside: avoid;
            page-break-inside: avoid;
          }

          th {
            padding: 9px 8px;
            color: #ffffff;
            background: #0f766e;
            text-align: left;
            font-size: 10px;
            text-transform: uppercase;
          }

          td {
            padding: 8px;
            border-bottom: 1px solid #d1d5db;
          }

          tbody tr:nth-child(even) {
            background: #f9fafb;
          }

          .footer-note {
            margin-top: 20px;
            padding-top: 10px;
            color: #6b7280;
            border-top: 1px solid #d1d5db;
            text-align: center;
          }
        </style>
      </head>

      <body>
        <header class="header">
          <h1>Sales Report</h1>
          <p>Generated on ${reportDate}</p>
        </header>

        <section class="summary">
          <div class="card">
            <div class="card-label">Total Orders</div>
            <div class="card-value">${reportData.totalOrders}</div>
          </div>

          <div class="card">
            <div class="card-label">Total Revenue</div>
            <div class="card-value">
              ${formatCurrency(reportData.totalRevenue)}
            </div>
          </div>
        </section>

        <h2>Top Five Products by Revenue</h2>
        <table>
          <thead>
            <tr>
              <th>Rank</th>
              <th>Product</th>
              <th>Orders</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>${topProductRows}</tbody>
        </table>

        <h2>Orders During the Last Seven Days</h2>
        <table>
          <thead>
            <tr>
              <th>Date</th>
              <th>Orders</th>
              <th>Revenue</th>
            </tr>
          </thead>
          <tbody>${dailyRows}</tbody>
        </table>

        <h2>All Orders</h2>
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Customer</th>
              <th>Product</th>
              <th>Amount</th>
              <th>Date</th>
            </tr>
          </thead>
          <tbody>${orderRows}</tbody>
        </table>

        <p class="footer-note">
          Generated automatically by the PDF Report Generator API.
        </p>
      </body>
    </html>
  `;
}

module.exports = {
  buildReportHtml,
};