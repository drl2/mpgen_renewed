# MPGEN Renewed

A standalone, static HTML and JavaScript character generator for Mighty Protectors. Character data, generation, save/load, and Excel export run in the browser.

## Requirements

- Node.js 18 or newer and npm to build the site
- A static web server or hosting provider to deploy it

## Development

```bash
npm ci
npm run build
npm run serve
```

Open `http://localhost:8000`. The app uses `fetch()` for local data files, so do not open `index.html` directly from disk.

## Production build

```bash
npm ci
npm run build:prod
npm run preview:prod
```

Open `http://localhost:8000` to verify the production output. `npm run build:prod` creates a minified, deployable static site in `dist/`; it bundles/minifies the app JavaScript, minifies CSS and HTML, and includes the required data, images, Excel template, and spreadsheet libraries.

Upload the **contents of `dist/`** to the web server's document root or target subdirectory. Do not upload `node_modules/` or the source folders. No Node.js server is required in production. Serve the site over HTTPS in production; the app must also be served over HTTP/HTTPS locally because it loads data and the workbook with `fetch()`.

After deployment, verify that:

- The page and `assets/app.min.js` load successfully.
- Preset dropdowns populate and character generation, save, and load work.
- The Excel export downloads and opens with all template sheets.
- The blog feed loads (it uses the WordPress REST API on `gaming.drl2.com`).
- AdSense is enabled for the production domain in the AdSense account.

The blog feed, AdSense, and some support logos require external network access. The production build includes local copies of the spreadsheet libraries, so those do not require a CDN at runtime.

See [docs/BUILD.md](docs/BUILD.md) for VS Code build tasks and more deployment details.
