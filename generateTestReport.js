const path = require("path");
const { getReportData, getAllOrders } = require("./reportData");
const { buildReportHtml } = require("./reportTemplate");
const { generatePdf } = require("./pdfGenerator");

async function createTestReport() {
  const reportData = getReportData();
  const orders = getAllOrders();
  const html = buildReportHtml(reportData, orders);
  const outputPath = path.join(__dirname, "reports", "test.pdf");

  const savedPath = await generatePdf(html, outputPath);

  console.log(`PDF generated successfully: ${savedPath}`);
}

createTestReport().catch((error) => {
  console.error("Failed to generate PDF:", error);
  process.exit(1);
});