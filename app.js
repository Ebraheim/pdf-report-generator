const path = require("path");
const crypto = require("crypto");
const express = require("express");

const db = require("./database");
const { getReportData, getAllOrders } = require("./reportData");
const { buildReportHtml } = require("./reportTemplate");
const { generatePdf } = require("./pdfGenerator");

const app = express();
const PORT = 3000;

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

app.post("/reports", async (req, res) => {
  try {
    const reportId = crypto.randomUUID();
    const relativePath = path.join("reports", `${reportId}.pdf`);
    const absolutePath = path.join(__dirname, relativePath);

    const reportData = getReportData();
    const orders = getAllOrders();
    const html = buildReportHtml(reportData, orders);

    await generatePdf(html, absolutePath);

    const createdAt = new Date().toISOString();

    db.prepare(`
      INSERT INTO reports (id, path, created_at)
      VALUES (?, ?, ?)
    `).run(reportId, relativePath, createdAt);

    res.status(201).json({
      id: reportId,
      file: `/reports/${reportId}/file`,
    });
  } catch (error) {
    console.error("Report generation failed:", error);

    res.status(500).json({
      error: "Failed to generate report",
    });
  }
});

app.get("/reports/:id/file", (req, res) => {
  const report = db
    .prepare("SELECT * FROM reports WHERE id = ?")
    .get(req.params.id);

  if (!report) {
    return res.status(404).json({
      error: "Report not found",
    });
  }

  const absolutePath = path.resolve(__dirname, report.path);

  res.sendFile(absolutePath, (error) => {
    if (error && !res.headersSent) {
      res.status(404).json({
        error: "Report file not found",
      });
    }
  });
});

app.get("/reports/:id", (req, res) => {
  const report = db
    .prepare(`
      SELECT id, path, created_at
      FROM reports
      WHERE id = ?
    `)
    .get(req.params.id);

  if (!report) {
    return res.status(404).json({
      error: "Report not found",
    });
  }

  res.status(200).json({
    ...report,
    file: `/reports/${report.id}/file`,
  });
});

app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});