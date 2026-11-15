# Build Guide - MPGEN LESS to CSS Compilation

## Overview

This guide explains how to compile LESS stylesheets to CSS using VS Code build commands and npm scripts. The compiled CSS file is placed in the **project root folder** for easy access.

## Quick Start

### Option 1: VS Code Build Command (Recommended)

**One-time compile:**
1. Open the project in VS Code
2. Press `Ctrl+Shift+B` (Windows/Linux) or `Cmd+Shift+B` (Mac)
3. Select "Build LESS to CSS"
4. CSS file is generated at `mpgen.css` (root folder)

**Watch mode (auto-compile on file changes):**
1. Open the project in VS Code
2. Press `Ctrl+Shift+B` (Windows/Linux) or `Cmd+Shift+B` (Mac)
3. Select "Watch LESS Files"
4. Terminal opens and watches for changes
5. Any change to `.less` files auto-compiles to CSS
6. Close the terminal or press Ctrl+C to stop watching

### Option 2: npm Scripts

**Install dependencies first:**
```bash
npm install
```

**Then use these commands:**

Build once:
```bash
npm run build
```

Watch for changes:
```bash
npm run watch
```

Serve locally while watching (development mode):
```bash
npm run dev
```

### Option 3: Command Line (LESS CLI)

**Install LESS globally:**
```bash
npm install -g less
```

**Build CSS:**
```bash
lessc less/mpgen.less mpgen.css
```

**Watch for changes:**
```bash
lessc --watch less/ .
```

---

## Production Build and Deployment

Create a minified static-site build:

```bash
npm ci
npm run build:prod
```

The production build is written to `dist/`. It bundles and minifies the app JavaScript, minifies LESS output and HTML, copies the JSON data, Ko-fi image, Excel template, and local spreadsheet libraries, and rewrites the production HTML to use those built files. It does not modify the development `index.html` or `mpgen.css`. The generated `dist/` folder is ignored by Git.

Preview the production build locally over HTTP:

```bash
npm run preview:prod
```

Open `http://localhost:8000`. Verify that preset lists load, character generation/save/load works, the blogroll loads, and Excel export downloads a workbook.

For deployment, upload the **contents of `dist/`** to the web server's document root (or the intended subdirectory). Configure the server to serve `index.html` for the site root and serve `.js`, `.css`, `.json`, `.xlsx`, and `.webp` files with their standard MIME types. This app uses `fetch()` for local data and the workbook template, so serve it over HTTP/HTTPS; opening `index.html` directly from disk will not work.

The blog feed and Google AdSense still depend on their respective external services. Use HTTPS, authorize the deployed domain in AdSense, and apply the site's required privacy/cookie disclosures before enabling ads. Do not upload `node_modules/` or the project source folders; deploy the generated `dist/` contents.

---

## VS Code Task Details

### Task 1: Build LESS to CSS

**Trigger:**
- Press `Ctrl+Shift+B` → Select "Build LESS to CSS"
- Or use Command Palette: `Ctrl+Shift+P` → Type "Tasks: Run Build Task"

**What it does:**
- Compiles `less/mpgen.less` to `mpgen.css` (root folder)
- Runs silently (no terminal output if successful)
- Shows error panel if compilation fails
- Completes and closes automatically

**Output:**
- Creates: `mpgen.css` (in project root)
- Size: ~45-50 KB (unminified)
- Loaded by: `index.html`

### Task 2: Watch LESS Files

**Trigger:**
- Press `Ctrl+Shift+B` → Select "Watch LESS Files"
- Or use Command Palette: `Ctrl+Shift+P` → Type "Tasks: Run Task" → Select "Watch LESS Files"

**What it does:**
- Watches `less/` directory for changes
- Auto-compiles whenever `.less` files change
- Terminal stays open showing compilation messages
- Shows "✓ compiled" or error messages in real-time

**Stop watching:**
- Press `Ctrl+C` in the terminal
- Or close the terminal

---

## File Locations

```
Project Root:
├── index.html
├── mpgen.css           ← Generated CSS (in root, not in less/)
├── src/app.js
├── less/
│   └── mpgen.less      ← Source file (edit this)
├── .vscode/
│   └── tasks.json      ← VS Code task configuration
└── package.json        ← npm configuration
```

## Workflow Examples

### Example 1: One-time Compilation
```
1. Edit less/mpgen.less (make styling changes)
2. Press Ctrl+Shift+B
3. Select "Build LESS to CSS"
4. Wait for completion (should be instant)
5. Check: mpgen.css created in root folder
6. Refresh browser to see changes
```

### Example 2: Development with Watch Mode
```
1. Open Terminal in VS Code
2. Press Ctrl+Shift+B
3. Select "Watch LESS Files"
4. Terminal shows: "Watching directory 'less/' for changes..."
5. Edit less/mpgen.less
6. See "✓ compiled" automatically in terminal
7. Refresh browser to see changes
8. Press Ctrl+C to stop watching when done
```

### Example 3: Using npm Scripts
```
# Terminal 1: Watch LESS files
npm run watch

# Terminal 2: Serve website
npm run serve

# Open: http://localhost:8000

# Make changes to less/mpgen.less
# CSS auto-compiles, refresh browser to see
```

---

## Troubleshooting

### "lessc not found"

**Problem:** Getting error "lessc: command not found"

**Solution 1 - Install globally:**
```bash
npm install -g less
```

**Solution 2 - Install locally and use npm:**
```bash
npm install
npm run build
```

**Solution 3 - Use the built-in VS Code task (requires global install):**
```bash
npm install -g less
# Then press Ctrl+Shift+B
```

### CSS file not updating

**Problem:** Changes to `.less` file aren't reflected in CSS

**Solution:**
1. Make sure you edited `less/mpgen.less` (not a different file)
2. Run the build command: `Ctrl+Shift+B` → "Build LESS to CSS"
3. Check that `mpgen.css` in the **root folder** was updated
4. Refresh your browser (Ctrl+R or Cmd+R)
5. Check browser console for any errors

### CSS file in wrong location

**Problem:** CSS file created in `less/` folder instead of root

**Cause:** Using old configuration with `lessc less/mpgen.less less/mpgen.css`

**Solution:**
1. Delete any incorrectly placed CSS files
2. Use the updated configuration:
   - VS Code: Press Ctrl+Shift+B → "Build LESS to CSS"
   - npm: `npm run build`
   - lessc: `lessc less/mpgen.less mpgen.css`
3. Verify: `mpgen.css` should be in root folder (same level as index.html)

### Compilation errors

**Problem:** Getting errors like "variable not found" or "mixin not defined"

**Check the error message:**
1. Look at the VS Code problem panel
2. Error format: `filename.less:line:column - Error: message`
3. Fix the LESS syntax error in the file
4. Recompile: `Ctrl+Shift+B` → "Build LESS to CSS"

**Common issues:**
- Missing semicolon in LESS variable definition
- Undefined mixin reference
- Import file not found
- Syntax error in selector or property

---

## Performance Tips

### For Large Stylesheets
If compilation takes more than a few seconds:

1. Use watch mode while developing (auto-compiles as you type)
2. Keep LESS organized in sections (already done in mpgen.less)
3. Use variables and mixins to reduce repetition
4. Consider splitting into multiple files in Phase 3

### Browser Performance
After compiling CSS:
1. Minify for production: Use a minifier tool
2. Current unminified: ~45-50 KB
3. Minified: ~25-30 KB
4. Gzipped: ~6-8 KB

---

## Next Steps

### Phase 2: Data Preparation
After CSS is built:
1. Create JSON data files (use DATA_EXPORT_GUIDE.md)
2. Test application locally
3. Verify all features work

### Phase 3: Modularization
Plan to split into:
- `src/modules/` - JavaScript modules
- `src/components/` - Reusable UI components
- `less/components/` - Component-specific styles

### Production Build
Later phases will add:
- CSS minification
- JavaScript bundling
- Asset optimization
- Source maps for debugging

---

## Reference

### VS Code Keyboard Shortcuts for Tasks

| Action | Windows/Linux | Mac |
|--------|---------------|-----|
| Run Build Task | `Ctrl+Shift+B` | `Cmd+Shift+B` |
| Run Task | `Ctrl+Shift+P` then "Tasks: Run Task" | `Cmd+Shift+P` then "Tasks: Run Task" |
| Terminate Task | `Ctrl+C` in terminal | `Cmd+C` in terminal |
| Show Problems | `Ctrl+Shift+M` | `Cmd+Shift+M` |

### npm Script Commands

```bash
npm run build    # Single compile: less/mpgen.less → mpgen.css
npm run watch    # Watch mode: auto-compile on changes (outputs to root)
npm run serve    # Start HTTP server at localhost:8000
npm run dev      # Start watch + serve (development mode)
```

### LESS CLI Reference

```bash
# Compile once (output to root)
lessc less/mpgen.less mpgen.css

# Compile with strict imports
lessc --strict-imports less/mpgen.less mpgen.css

# Watch directory (output to current directory)
lessc --watch less/ .

# Watch specific file
lessc --watch less/mpgen.less mpgen.css

# Compress output
lessc --compress less/mpgen.less mpgen.css

# Generate source maps
lessc --source-map less/mpgen.less mpgen.css
```

---

## File Structure After Build

Before build:
```
mpgen_renewed/
├── index.html
├── less/
│   └── mpgen.less      (19 KB - source)
└── mpgen.css           (does not exist)
```

After build:
```
mpgen_renewed/
├── index.html          (loads mpgen.css from root)
├── mpgen.css           (45-50 KB - generated from mpgen.less) ✅
└── less/
    └── mpgen.less      (19 KB - source, unchanged)
```

The generated `mpgen.css` in the **root folder** is what `index.html` loads in the browser.

---

## Version Information

- **LESS Version:** 4.1.3+
- **Node.js:** 14.0.0+ (if using npm)
- **VS Code:** 1.50.0+ (latest recommended)
- **Browsers:** All modern browsers (CSS3 support)

---

## Questions?

See:
- SETUP.md - Project setup and architecture
- PLAN.md - Phase timeline and roadmap
- PHASE1_ANALYSIS.md - Technical details
