# MPGEN Project Structure & Setup Guide

## Overview
This is the restructured MPGEN Character Generator - a consolidated, vanilla JavaScript SPA combining the legacy Python Django backend and React frontend into a modern, maintainable architecture.

## Project Structure

```
mpgen_renewed/
├── index.html                    # Main HTML entry point
├── src/
│   ├── app.js                    # Application bootstrap and main controller
│   ├── generator/                # Character generation modules (Phase 3)
│   ├── ui/                       # UI components (Phase 3)
│   ├── services/                 # Data services (Phase 2)
│   └── utils/                    # Utility functions (Phase 2)
├── less/
│   ├── mpgen.less                # Main stylesheet (LESS format)
│   └── mpgen.css                 # Compiled CSS (generated)
├── data/
│   ├── worlds.json               # Configuration data (Phase 2)
│   ├── timePeriods.json
│   ├── species.json
│   ├── cultures.json
│   ├── birthplaces.json
│   ├── abilities.json
│   └── dimensions.json
├── dist/                         # Build output directory
├── public/                       # Static assets
├── tests/                        # Test files (Phase 5)
└── docs/                         # Documentation

```

## Current Status (Phase 2 Starting)

### ✅ Completed
- [x] index.html - Main HTML structure with semantic markup
- [x] mpgen.less - Complete stylesheet with variables, mixins, and responsive design
- [x] src/app.js - Application bootstrap with StateManager, DataLoader, CharacterGenerator, Router, and UIController
- [x] Project directory structure created
- [x] Phase 1 analysis documentation complete

### ⏳ Next Steps (Phase 2)

1. **Compile LESS to CSS**
   ```bash
   npm install -g less
   lessc less/mpgen.less less/mpgen.css
   ```

2. **Create JSON Data Files** (Export from legacy database)
   Use DATA_EXPORT_GUIDE.md to create:
   - data/worlds.json
   - data/timePeriods.json
   - data/species.json
   - data/cultures.json
   - data/birthplaces.json
   - data/abilities.json
   - data/dimensions.json

3. **Test Application**
   - Serve locally: `python -m http.server 8000`
   - Open: `http://localhost:8000`
   - Check browser console for errors

4. **Modularize JavaScript** (Phase 3)
   - Split app.js into separate modules
   - Create reusable UI components
   - Implement proper module system

## CSS Architecture

The mpgen.less file includes:

### Structure
- **Variables** - Colors, spacing, typography, breakpoints
- **Mixins** - Flexbox helpers, transitions, responsive grids
- **Reset** - Base styles and HTML5 elements
- **Layout** - Header, nav, main, sidebar, footer
- **Components** - Forms, buttons, cards, panels
- **Utilities** - Margin, padding, text, display classes
- **Animations** - Fade, slide, spin effects
- **Responsive** - Mobile-first approach with breakpoints
- **Print** - Print-friendly styles

### Design Tokens

**Colors:**
- Primary: #2c3e50 (dark blue)
- Secondary: #3498db (bright blue)
- Success: #27ae60 (green)
- Info: #16a085 (teal)
- Warning: #f39c12 (orange)
- Danger: #e74c3c (red)
- Dark: #1a1a1a
- Light: #ecf0f1

**Spacing Scale:**
- xs: 0.25rem
- sm: 0.5rem
- md: 1rem (base)
- lg: 1.5rem
- xl: 2rem
- 2xl: 3rem
- 3xl: 4rem

**Breakpoints:**
- sm: 576px
- md: 768px
- lg: 992px
- xl: 1200px
- 2xl: 1400px

## JavaScript Architecture

### Application Structure

```
StateManager (Observer Pattern)
  ├─ currentCharacter
  ├─ savedCharacters
  ├─ data (configuration tables)
  └─ ui (section, loading, error states)

DataLoader
  └─ Loads all JSON configuration files

CharacterGenerator
  ├─ generate(options) - Main algorithm
  └─ generateName() - Name generation

LocalStorageManager
  ├─ saveCharacter()
  ├─ getCharacters()
  ├─ getCharacter(id)
  └─ deleteCharacter(id)

Router (Hash-based)
  ├─ #generator
  ├─ #characters
  ├─ #blog
  └─ #about

UIController
  ├─ handleGenerate()
  ├─ handleRandom()
  ├─ handleSave()
  ├─ handleExport()
  ├─ renderCharacterCard()
  ├─ renderCharactersList()
  └─ loadBlog()
```

### Data Flow

1. **Application Initialization**
   - DataLoader fetches all JSON configuration files
   - StateManager initializes with empty state
   - CharacterGenerator created with loaded data
   - UIController caches DOM elements and attaches listeners
   - Router initializes and handles navigation

2. **Character Generation**
   - User selects options or clicks Random
   - UIController.handleGenerate() or handleRandom() called
   - CharacterGenerator.generate() creates character object
   - State updated via StateManager
   - UIController.renderCharacterCard() displays result
   - Save and Export buttons enabled

3. **Character Saving**
   - User clicks Save
   - LocalStorageManager.saveCharacter() stores to browser localStorage
   - State updated with saved characters list
   - UIController.renderCharactersList() updates Characters section

4. **Navigation**
   - User clicks nav link
   - Router.navigate() updates hash
   - UIController updates current section in state
   - Appropriate section content displayed

## Implementation Checklist (Phase 2)

### Core Framework
- [ ] Compile LESS stylesheet to CSS
- [ ] Extract legacy database to JSON files (data/)
- [ ] Test basic app initialization
- [ ] Verify state management system works
- [ ] Test data loading from JSON files
- [ ] Test character generation (basic)
- [ ] Test character saving to localStorage
- [ ] Test routing between sections
- [ ] Test responsive design on mobile

### Data Loading
- [ ] Create data export script from legacy SQLite
- [ ] Generate worlds.json (5-10 records)
- [ ] Generate timePeriods.json (10-15 records)
- [ ] Generate species.json (20+ records)
- [ ] Generate cultures.json (30+ records)
- [ ] Generate birthplaces.json (20+ records)
- [ ] Generate abilities.json (25+ records)
- [ ] Generate dimensions.json (5-10 records)
- [ ] Verify all data loads correctly

### Testing
- [ ] Manual testing of all features
- [ ] Test on Chrome/Firefox/Safari
- [ ] Test on mobile devices
- [ ] Test localStorage limits
- [ ] Check console for errors
- [ ] Verify accessibility (keyboard nav, ARIA labels)

## Compilation Instructions

### LESS to CSS

Using Node.js/npm:
```bash
npm install -g less
lessc less/mpgen.less less/mpgen.css
```

Or with Docker:
```bash
docker run -it --rm -v $(pwd):/work -w /work node:latest sh -c "npm install -g less && lessc less/mpgen.less less/mpgen.css"
```

After compilation, index.html will automatically load the generated mpgen.css.

## Running Locally

### Quick Start
```bash
# Navigate to project directory
cd /mnt/AAD0BF13D0BEE4AB/Projects/mpgen_renewed

# Start local server (Python 3)
python -m http.server 8000

# Or with Python 2
python -m SimpleHTTPServer 8000

# Open browser
open http://localhost:8000
```

### With Node.js
```bash
npx http-server -p 8000
```

## Debugging

### Browser Console
The Application instance is exposed globally:
```javascript
// In browser console
window.mpgenApp           // Application instance
window.mpgenApp.state     // StateManager
window.mpgenApp.storage   // LocalStorageManager
window.mpgenApp.router    // Router

// Check saved characters
window.mpgenApp.storage.getCharacters()

// Manually generate character
window.mpgenApp.generator.generate()

// Check current state
window.mpgenApp.state.state
```

## Performance Considerations

- Vanilla JavaScript (no framework overhead)
- Minimal dependencies (LESS only for styling)
- Client-side character storage (no backend required)
- All data loaded at startup
- localStorage for persistence (limited to ~5-10MB)
- Responsive design optimized for all devices

## Browser Support

- Chrome/Edge 90+
- Firefox 88+
- Safari 14+
- iOS Safari 14+
- Android Chrome 90+

Requires:
- ES6 support (arrow functions, template literals, classes)
- localStorage API
- Fetch API
- CSS Grid & Flexbox

## Next Phases

- **Phase 3**: Modularize JavaScript, create reusable components
- **Phase 4**: Implement character generation algorithm, blog integration, Excel export
- **Phase 5**: Add comprehensive testing
- **Phase 6**: Production deployment and optimization

## Questions & Troubleshooting

See PLAN.md for project timeline and phase details.
See PHASE1_ANALYSIS.md for technical deep-dive into legacy system.
See DATA_EXPORT_GUIDE.md for database migration strategy.
