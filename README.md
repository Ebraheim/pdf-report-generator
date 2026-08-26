# PDF Report Generator

A backend application that generates professional multi-page PDF sales reports from data stored in SQLite.

The project uses Node.js, Express, SQLite, Playwright, HTML, and CSS.

## Features

- Stores 200 sample orders in SQLite
- Uses SQL aggregation for report statistics
- Calculates total orders and total revenue
- Displays the five highest-earning products
- Shows sales from the last seven days
- Includes a complete order table
- Generates a styled, multi-page A4 PDF
- Repeats table headings across pages
- Prevents table rows from splitting across pages
- Provides API endpoints for creating and downloading reports
- Prevents duplicate generation using an `Idempotency-Key`
- Returns clear HTTP status codes and error responses

## Technologies

- Node.js
- Express
- SQLite
- Playwright
- HTML and CSS

## Project Structure

```text
pdf-report-generator/
├── app.js
├── database.js
├── seed.js
├── reportData.js
├── reportTemplate.js
├── pdfGenerator.js
├── generateTestReport.js
├── testReportData.js
├── package.json
└── README.md
```

The following generated files are excluded from Git:

```text
node_modules/
report.db
reports/
my-report.pdf
```

## Installation

Clone the repository and install the dependencies:

```bash
npm install
```

Install Chromium and its required system dependencies:

```bash
npx playwright install --with-deps chromium
```

This project uses the built-in `node:sqlite` module and should be run with Node.js 22 or newer.

## Seed the Database

Create and populate the SQLite database with 200 sample orders:

```bash
npm run seed
```

The seed script is safe to run repeatedly. It resets the order data before inserting exactly 200 new records.

## Start the API

```bash
npm start
```

The server runs at:

```text
http://localhost:3000
```

## API Endpoints

### Health Check

```http
GET /health
```

Example:

```bash
curl http://localhost:3000/health
```

Response:

```json
{
  "status": "ok"
}
```

### Generate a Report

```http
POST /reports
```

An `Idempotency-Key` header is required:

```bash
curl -i -X POST \
  -H "Idempotency-Key: sales-report-001" \
  http://localhost:3000/reports
```

A newly generated report returns `201 Created`:

```json
{
  "id": "generated-report-id",
  "file": "/reports/generated-report-id/file",
  "created_at": "2026-08-26T08:48:17.430Z",
  "reused": false
}
```

Sending another request with the same idempotency key returns the existing report with `200 OK`:

```json
{
  "id": "generated-report-id",
  "file": "/reports/generated-report-id/file",
  "created_at": "2026-08-26T08:48:17.430Z",
  "reused": true
}
```

This prevents accidental duplicate reports caused by double-clicking or retrying the same request.

### Get Report Information

```http
GET /reports/:id
```

Example:

```bash
curl http://localhost:3000/reports/REPORT_ID
```

### Download a Report

```http
GET /reports/:id/file
```

Example:

```bash
curl http://localhost:3000/reports/REPORT_ID/file \
  --output my-report.pdf
```

## Test PDF Generation Directly

A PDF can also be generated without calling the API:

```bash
node generateTestReport.js
```

The output is created at:

```text
reports/test.pdf
```

## Report Contents

The generated PDF contains:

1. Report title and generation date
2. Total number of orders
3. Total sales revenue
4. Top five products by revenue
5. Orders and revenue from the last seven days
6. A complete table containing all 200 orders
7. Multiple A4 pages with clean page breaks

## Duplicate Protection

Each report request uses an `Idempotency-Key`.

The key is stored in SQLite with a unique index. If the same request is submitted again, the API returns the original report instead of generating another PDF.

Requests currently being generated are also tracked in memory, preventing simultaneous requests with the same key from creating duplicate files.

## Error Responses

The API returns:

- `400 Bad Request` when the `Idempotency-Key` header is missing
- `404 Not Found` when a report record or PDF file cannot be found
- `500 Internal Server Error` when PDF generation fails

## Author

Ebraheim Pasha