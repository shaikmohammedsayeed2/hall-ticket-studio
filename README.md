# Hall Ticket Studio

A static web app that turns Excel student lists into printable hall tickets. Matches the supplied template: school heading, exam/title/year row, student name, father/guardian name, class, and blank lower area. Eight tickets per A4 page.

## Use

1. Open the app and customize school name, examination, ticket title, and academic year.
2. Download the sample Excel file, replace its demo rows, then upload it. Accepts `.xlsx`, `.xls`, and `.csv` up to 5 MB and 2,000 students.
3. Select the worksheet and check the three column mappings. The first nonempty row must contain column headers. Every nonblank student row needs all three fields. No rows are silently discarded.
4. Click **Print / Save PDF**. Choose A4 portrait, 100% scale, headers and footers off. Select Save as PDF to download a PDF. Preview all pages before printing.

The initial preview is a blank template; **Load demo** generates eight fictional students. Files and student information stay in browser memory and are cleared on refresh. There is no backend, tracking, remote font, or runtime CDN.

## Local preview

Run `npm start` (Python 3 required), then open http://localhost:5174. No install or build needed. Tests: `npm test` (Node 18+).

## GitHub and Netlify

Upload this entire folder to a new GitHub repository, including `vendor/`. In Netlify, import that repository. Leave the build command empty and set the publish directory to `.`; `netlify.toml` already supplies the publish setting. You can also drag this folder onto Netlify's manual deployment page. No environment variables or server needed.

Only deploy the app files. Do not add real student spreadsheets or generated hall tickets to your public repository.

## Dependency

SheetJS Community Edition 0.20.3 is vendored at `vendor/xlsx.full.min.js` (Apache-2.0). Official source and standalone installation: https://docs.sheetjs.com/docs/getting-started/installation/standalone/

Browser printing supports Unicode names using installed system fonts. Very long names wrap, but the fixed ticket size can overflow; inspect print preview. Student fields are limited to 120 characters. Physical printer output may vary by printer margin settings.
