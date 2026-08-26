const path = require("path");
const crypto = require("crypto");
const express = require("express");

const db = require("./database");
const { getReportData, getAllOrders } = require("./reportData");
const { buildReportHtml } = require("./reportTemplate");
const { generatePdf } = require("./pdfGenerator");

const app = express();
const PORT = 3000;

const reportsInProgress = new Map();

app.use(express.json());

app.get("/health", (req, res) => {
  res.status(200).json({ status: "ok" });
});

async function createReport(idempotencyKey) {
  const reportId = crypto.randomUUID();
  const relativePath = path.join("reports", `${reportId}.pdf`);
  const absolutePath = path.join(__dirname, relativePath);

  const reportData = getReportData();
  const orders = getAllOrders();
  const html = buildReportHtml(reportData, orders);

  await generatePdf(html, absolutePath);

  const createdAt = new Date().toISOString();

  db.prepare(`
    INSERT INTO reports (
      id,
      path,
      created_at,
      idempotency_key
    )
    VALUES (?, ?, ?, ?)
  `).run(
    reportId,
    relativePath,
    createdAt,
    idempotencyKey
  );

  return {
    id: reportId,
    file: `/reports/${reportId}/file`,
    created_at: createdAt,
  };
}

app.post("/reports", async (req, res) => {
  const idempotencyKey =
    req.get("Idempotency-Key")?.trim();

  if (!idempotencyKey) {
    return res.status(400).json({
      error: "Idempotency-Key header is required",
    });
  }

  try {
    const existingReport = db
      .prepare(`
        SELECT id, created_at
        FROM reports
        WHERE idempotency_key = ?
      `)
      .get(idempotencyKey);

    if (existingReport) {
      return res.status(200).json({
        id: existingReport.id,
        file: `/reports/${existingReport.id}/file`,
        created_at: existingReport.created_at,
        reused: true,
      });
    }

    let generationPromise =
      reportsInProgress.get(idempotencyKey);

    const isNewRequest = !generationPromise;

    if (isNewRequest) {
      generationPromise = createReport(idempotencyKey);
      reportsInProgress.set(
        idempotencyKey,
        generationPromise
      );
    }

    const report = await generationPromise;

    return res.status(isNewRequest ? 201 : 200).json({
      ...report,
      reused: !isNewRequest,
    });
  } catch (error) {
    console.error("Report generation failed:", error);

    return res.status(500).json({
      error: "Failed to generate report",
    });
  } finally {
    reportsInProgress.delete(idempotencyKey);
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

  const absolutePath = path.resolve(
    __dirname,
    report.path
  );

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