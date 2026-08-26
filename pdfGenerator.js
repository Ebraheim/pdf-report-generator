const fs = require("fs");
const path = require("path");
const { chromium } = require("playwright");

async function generatePdf(html, outputPath) {
  const absolutePath = path.resolve(outputPath);

  fs.mkdirSync(path.dirname(absolutePath), {
    recursive: true,
  });

  const browser = await chromium.launch({
    headless: true,
  });

  try {
    const page = await browser.newPage();

    await page.setContent(html, {
      waitUntil: "load",
    });

    await page.emulateMedia({
      media: "print",
    });

    await page.pdf({
      path: absolutePath,
      format: "A4",
      printBackground: true,
    });

    return absolutePath;
  } finally {
    await browser.close();
  }
}

module.exports = {
  generatePdf,
};