# MPGEN Legacy Codebase Analysis - Phase 1 Report

**Date:** 2026-11-13  
**Project:** MPGEN Rewrite (Consolidating Python API + React UI → Vanilla JS SPA)

---

## Executive Summary

MPGEN is a character generator for the Mighty Protectors tabletop RPG system. The current architecture separates:
- **Backend:** Django REST API (Python) serving data from a SQLite database
- **Frontend:** React.js web UI consuming the API

The analysis identifies all components, features, data models, and dependencies needed to consolidate this into a streamlined standalone HTML/JavaScript application.

---

## 1. Current Architecture Overview

### 1.1 Backend Structure (Django/Python)

**Location:** `/mnt/AAD0BF13D0BEE4AB/Projects/Python/mpgen`

**Framework:** Django 2.1.2 with Django REST Framework 3.9.0

**Database:** SQLite (db.sqlite3)

**Core Modules:**
- `character.py` (378 lines) - Character generation logic
- `models.py` (330 lines) - Data models (17 tables)
- `views.py` (204 lines) - API endpoints
- `charsheetmaker.py` (163 lines) - Excel character sheet generation
- `diceroller.py` (17 lines) - Dice rolling utility
- `serializers.py` (161 lines) - REST serializers
- `urls.py` (101 lines) - URL routing

**Total Backend Code:** ~1,362 lines of Python

### 1.2 Frontend Structure (React.js)

**Location:** `/mnt/AAD0BF13D0BEE4AB/Projects/React/mpgenui`

**Framework:** React 16.6.0 with Material-UI 3.3.1

**Key Dependencies:**
- axios 0.18.0 - HTTP client
- axios-cache-adapter 2.1.1 - Response caching
- js-file-download 0.4.4 - File download utility
- react-scripts 2.0.5 - Build tooling

**Frontend Structure:**
```
src/
├── App.js                  - Main component & state management
├── serviceConstants.js     - API configuration
├── components/
│   ├── NavBar.js          - Navigation
│   ├── SelectionCard.js   - Form card wrapper
│   ├── CharacterCard.js   - Character display (28KB, complex)
│   ├── NotesCard.js       - Notes section
│   ├── BlogCard.js        - Blog integration
│   ├── AdCode.js          - Advertising integration
│   ├── Loading.js         - Loading spinner
│   ├── WhatsNext.js       - Help/info section
│   └── selections/        - 17 dropdown components
│       ├── PowerLevels.js
│       ├── Sides.js
│       ├── Birthplaces.js
│       ├── Species.js
│       ├── Cultures.js
│       ├── GenderIdentities.js
│       ├── GenderExpressions.js
│       ├── BiologicalSexes.js
│       ├── SexualAttractions.js
│       ├── Motivations.js
│       ├── OriginTypes.js
│       ├── KnownRegions.js
│       ├── LostRegions.js
│       ├── OtherWorlds.js
│       ├── OtherDimensions.js
│       ├── TimePeriods.js
│       └── AllowDupes.js (checkbox)
```

---

## 2. Data Models & Database Schema

### 2.1 Core Tables

**Configuration Tables** (Read-only lookup tables):
1. **PowerLevel** - Power level definitions (Normal, Low, Standard, High)
   - power_level (name)
   - core_ability_cps
   - bc_points
   - total_cps

2. **Side** - Character alignment (3 options)
   - side (name)

3. **Motivation** - Character motivation
   - motivation

4. **OriginType** - Origin type for character background
   - origin_type

5. **BirthPlace** - Character birthplace (with roll ranges)
   - min_roll, max_roll
   - birth_place

6. **Species** - Character species/race
   - min_roll, max_roll
   - species_name
   - cp_adjustment
   - extra_cp_as_normal

7. **Culture** - Character culture
   - culture_name

8. **GenderIdentity** - Gender identity options
   - min_roll, max_roll
   - gender_identity
   - short_form

9. **GenderExpression** - Gender expression options
   - min_roll, max_roll
   - gender_expression
   - short_form

10. **BiologicalSex** - Biological sex options
    - min_roll, max_roll
    - biological_sex
    - short_form

11. **SexualAttraction** - Sexual attraction options
    - min_roll, max_roll
    - sexual_attraction
    - short_form

12. **KnownRegion** - Known world regions
    - min_roll, max_roll
    - region_name

13. **LostRegion** - Lost world regions
    - min_roll, max_roll
    - region_name

14. **OtherWorld** - Other worlds/dimensions
    - min_roll, max_roll
    - world

15. **OtherDimension** - Alternate dimensions
    - min_roll, max_roll
    - dimension

16. **TimePeriod** - Time periods
    - min_roll, max_roll
    - time_period

17. **Stat** - Character statistics
    - stat_name, abbrev
    - min_roll, max_roll
    - is_base

**Lookup/Relationship Tables:**
- SpeciesAbility (species → abilities mapping)
- LostRegionSpecies (lost_region → species mapping)
- LostRegionCulture (lost_region → culture mapping)
- OtherWorldSpecies (other_world → species mapping)
- OtherWorldCulture (other_world → culture mapping)
- OtherDimensionSpecies (other_dimension → species mapping)
- OtherDimensionCulture (other_dimension → culture mapping)
- TimePeriodSpecies (time_period → species mapping)
- TimePeriodCulture (time_period → culture mapping)
- BCPowerLevelMinMax (power_level → BC ranges)
- BCDetail (BC score details table)

**Total Database Entities:** 28 tables

### 2.2 Data Characteristics

- **Mostly Read-Only:** Configuration data is static (loaded once on app start)
- **Dice Roll Ranges:** Most tables use `min_roll`/`max_roll` for d100 random selection
- **Simple Relationships:** Foreign key relationships for ability/culture/species combinations
- **No Complex Queries:** Simple lookups and range queries only

---

## 3. API Endpoints

### 3.1 Data Retrieval Endpoints (GET)

```
GET /api/v1/power_levels/          → List power levels
GET /api/v1/sides/                 → List sides
GET /api/v1/birthplaces/           → List birthplaces
GET /api/v1/species/               → List species
GET /api/v1/cultures/              → List cultures
GET /api/v1/gender_identities/     → List gender identities
GET /api/v1/gender_expressions/    → List gender expressions
GET /api/v1/biological_sexes/      → List biological sexes
GET /api/v1/sexual_attractions/    → List sexual attractions
GET /api/v1/motivations/           → List motivations
GET /api/v1/origin_types/          → List origin types
GET /api/v1/known_regions/         → List known regions
GET /api/v1/lost_regions/          → List lost regions
GET /api/v1/other_worlds/          → List other worlds
GET /api/v1/other_dimensions/      → List other dimensions
GET /api/v1/time_periods/          → List time periods
```

### 3.2 Character Generation Endpoints

```
GET /api/v1/character/             → Generate character with query params
  Query Parameters:
    - powerlevel_id (int)
    - side_id (int)
    - motivation_id (int)
    - origin_type_id (int)
    - birthplace_id (int)
    - species_id (int)
    - culture_id (int)
    - gender_identity_id (int)
    - gender_expression_id (int)
    - biological_sex_id (int)
    - sexual_attraction_id (int)
    - keep_duplicates (bool)
    - other_world_id (int)
    - other_dimension_id (int)
    - known_region_id (int)
    - lost_region_id (int)
    - time_period_id (int)
```

### 3.3 Character Sheet Export Endpoint

```
POST /charsheet/                   → Generate character sheet (Excel format)
  Body: Character data JSON
  Response: Excel .xlsx file download
```

### 3.4 External API

```
GET https://gaming.drl2.com/wp-json/wp/v2/posts?per_page=5&context=embed
  → WordPress blog feed (for BlogCard component)
```

---

## 4. Business Logic - Character Generation Algorithm

### 4.1 Character Class Structure

**Location:** `/mnt/AAD0BF13D0BEE4AB/Projects/Python/mpgen/api/character.py`

The `Character` class encapsulates the generation algorithm:

```python
class Character:
    def __init__(self, powerlevel_id, side_id, birthplace_id, species_id, culture_id, 
                 gender_identity_id, gender_expression_id, biological_sex_id, 
                 sexual_attraction_id, keep_duplicates, motivation_id, origin_type_id, 
                 lost_region_id, known_region_id, other_world_id, other_dimension_id, 
                 time_period_id)
    
    def Generate(self):  # Main algorithm entry point
```

### 4.2 Generation Steps

The algorithm generates character data in this sequence:

1. **Power Level** (d4 roll if not specified)
   - Determines: total_cp, cp_per_ability, bc_start values
   - Normal (1): cp_per_ability=0, bc_start=14
   - Low (2): cp_per_ability=10, bc_start=16
   - Standard (3): cp_per_ability=20, bc_start=18
   - High (4): cp_per_ability=30, bc_start=20

2. **Side/Alignment** (d3 roll if not specified)
   - Good, Neutral, Evil

3. **Birthplace** (d100 roll if not specified)
   - "Foreigner" → triggers Known Region lookup
   - Otherwise direct birthplace

4. **Species & Culture** (conditional on birthplace)
   - If birthplace="Lost World" → use LostRegion lookup
   - If birthplace="Other World" → use OtherWorld lookup
   - If birthplace="Other Dimension" → use OtherDimension lookup
   - If birthplace="Time Travel" → use TimePeriod lookup

5. **Gender & Sexual Attributes** (d100 rolls if not specified)
   - Gender Identity
   - Gender Expression
   - Biological Sex
   - Sexual Attraction

6. **Character Background**
   - Motivation
   - Origin Type

7. **Abilities** (Conditional on Species)
   - Lookup species abilities
   - Roll for each ability's presence

8. **Attribute Generation**
   - 6 base attributes: Strength, Endurance, Agility, Intelligence, Cool, Luck
   - Wealth (calculated from power level + rolls)

9. **Derived Values Calculation**
   - Base Hits
   - Power
   - Initiative
   - Base Handling Damage
   - Carrying Capacity
   - Physical/Mental Defense
   - Inventing Points
   - Movement (base speed)
   - Healing Rate
   - Ability Cap, BC Cap, Damage Cap

### 4.3 Key Logic Elements

**Dice Rolling:**
```python
def RollDice(dice):  # Format: "1d4", "1d100", etc.
    # Parses dice notation and returns random result
```

**Keep Duplicates Flag:**
- When false: prevents duplicate abilities from being selected
- Affects ability selection logic

**Conditional Tables:**
- Some species/cultures only available in specific birthplaces
- Some species/cultures only available in specific time periods
- Lookup tables manage these constraints

---

## 5. Frontend State Management

### 5.1 React App State (App.js)

```javascript
{
  // Input selections (form fields)
  character_data: null,
  showCharacter: false,
  powerlevel_id: 0,
  side_id: 0,
  motivation_id: 0,
  origin_type_id: 0,
  birthplace_id: 0,
  species_id: 0,
  culture_id: 0,
  gender_identity_id: 0,
  gender_expression_id: 0,
  biological_sex_id: 0,
  sexual_attraction_id: 0,
  keep_duplicates: false,
  other_world_id: 0,
  other_dimension_id: 0,
  known_region_id: 0,
  lost_region_id: 0,
  time_period_id: 0,
  
  // Output selections (post-generation choices)
  selected_motivation: null,
  selected_background: [],
  background1: false,
  background2: false,
  background3: false,
  selected_abilities: [],
  ability0: false,
  ability1: false,
  ability2: false,
  ability3: false,
  ability4: false,
  ability5: false,
}
```

### 5.2 Key Component Interactions

- **App.js** - Main state container, character generation orchestration
- **SelectionCard.js** - Reusable dropdown wrapper for all selection components
- **CharacterCard.js** - Displays generated character data (28KB component)
- **selections/** - 17 selection dropdown components, each fetching from API
- **NavBar.js** - Header with app title and links
- **BlogCard.js** - Fetches and displays WordPress blog posts
- **AdCode.js** - Ad integrations (likely removable)

### 5.3 API Interaction Pattern

1. Component mounts → useEffect hook (or componentDidMount)
2. Calls API via axios
3. Caches response with axios-cache-adapter
4. Renders dropdown options from response

---

## 6. Excel Character Sheet Generation

### 6.1 CharSheetMaker Logic

**Location:** `/mnt/AAD0BF13D0BEE4AB/Projects/Python/mpgen/api/charsheetmaker.py`

The `CharSheetMaker` class:
1. Loads template Excel workbook
2. Populates two sheets: "Official Sheet" + "MPGen Character"
3. Maps character data to specific cell coordinates
4. Saves populated workbook for download

**Sheet Fields:**
- Personal: Side, Birthplace, Species, Culture, Age, Weight, Gender, Mass
- Attributes: Strength, Endurance, Agility, Intelligence, Cool, Wealth, Luck
- Derived: Power, Hits, Initiative, Base Handling Damage, Carrying Capacity, Defense (Physical/Mental)
- Character: Motivation, Background, Origin Type
- Abilities: List of racial/species abilities with CP costs

---

## 7. Feature Inventory

### 7.1 User-Facing Features

✅ **Character Generation**
- Random generation (roll all fields)
- Selective fields (specify some, randomize others)
- Conditional species/culture selection based on birthplace
- Ability selection post-generation

✅ **User Interface**
- 17 dropdown selectors for character attributes
- "Generate" button (full random)
- "Generate with Selections" (mixed approach)
- Display generated character data
- Download as Excel character sheet

✅ **Data Display**
- Character statistics (6 attributes + derived values)
- Species racial abilities
- Background/motivation description
- Estimated character cost in CP

✅ **Character Sheet Export**
- Excel workbook format
- Pre-formatted with game stat blocks
- Two different sheet formats (official + custom)

✅ **Blog Integration**
- Display WordPress blog posts on sidebar
- Links to external gaming blog

✅ **UI Features**
- Material-UI styling
- Responsive design
- Loading indicators
- Card-based layout

### 7.2 Technical Features

✅ **API Caching**
- axios-cache-adapter for read-only config data
- Reduces server load

✅ **CORS Support**
- django-cors-headers enabled
- Allows cross-origin requests

✅ **Database Persistence**
- SQLite for configuration data
- Simple schema

---

## 8. Dependencies & External Services

### 8.1 Backend Dependencies (Python)

```
Django==2.1.2                          # Web framework
djangorestframework==3.9.0             # REST API
django-cors-headers==2.4.0             # CORS support
openpyxl==2.5.12                       # Excel generation
google-cloud-storage==1.13.0           # Cloud storage (if used)
requests==2.20.0                       # HTTP client
```

### 8.2 Frontend Dependencies (Node)

```
react==16.6.0                          # UI framework (TO REMOVE)
@material-ui/core==3.3.1               # Material Design (TO REMOVE)
axios==0.18.0                          # HTTP client
axios-cache-adapter==2.1.1             # Response caching
js-file-download==0.4.4                # File download
react-scripts==2.0.5                   # Build tools (TO REMOVE)
```

### 8.3 External Services

- **PythonAnywhere** - Hosting (https://drl2.pythonanywhere.com)
- **WordPress Blog API** - Blog feed integration (https://gaming.drl2.com)
- **Google Cloud Storage** - Potential file storage (dependency present)

---

## 9. Code Size & Complexity Analysis

### 9.1 Lines of Code Breakdown

**Backend:**
- character.py: 378 LOC - High complexity (main algorithm)
- models.py: 330 LOC - Data models
- views.py: 204 LOC - API endpoints
- charsheetmaker.py: 163 LOC - Excel generation
- serializers.py: 161 LOC - REST serializers
- **Total: ~1,362 LOC** (excluding migrations)

**Frontend:**
- CharacterCard.js: ~850 LOC - Display logic (largest component)
- App.js: ~400 LOC - Main component
- SelectionCard.js: ~150 LOC - Wrapper component
- 17 selection components: ~2,000 LOC combined
- Other components: ~500 LOC
- **Total: ~3,900 LOC** (JavaScript/JSX)

**Database:**
- 28 tables (mostly read-only configuration)
- No complex relationships (only simple foreign keys)

### 9.2 Complexity Observations

**High Complexity Areas:**
- Character.Generate() method (conditional branching based on selections)
- CharacterCard.js (rendering conditional ability lists, stats, etc.)
- Conditional table lookups (species/culture by birthplace/time period)

**Low Complexity Areas:**
- API endpoints (simple CRUD + serialization)
- Dice rolling (simple utility function)
- Selection components (mostly identical dropdown wrappers)

**Complexity Rating:** MEDIUM
- Main algorithm is procedural but straightforward
- Most complexity is in conditional lookups
- UI complexity is high due to Material-UI usage

---

## 10. Key Integration Points

### 10.1 Frontend → Backend Flow

1. User selects options or clicks "Generate"
2. App.js collects form state
3. axios POSTs to `/api/v1/character/` with parameters
4. Backend Character.Generate() processes request
5. Response includes all generated attributes
6. App.js receives JSON response
7. CharacterCard.js renders character data

### 10.2 Character Sheet Export Flow

1. User clicks "Download as Excel"
2. Frontend POSTs character_data to `/charsheet/`
3. Backend CharSheetMaker instantiates with template
4. Populates Excel cells with character data
5. Returns .xlsx file for download
6. Browser triggers file download dialog

### 10.3 Configuration Data Flow

1. App mounts
2. Each SelectionCard component fetches its corresponding data
3. axios-cache-adapter caches responses
4. Dropdown renders with fetched options

---

## 11. Browser Support & APIs Used

### 11.1 Current Support

- Modern browsers (React 16.6.0 default)
- Targets: Chrome, Firefox, Safari, Edge (2018+)
- ES6+ JavaScript

### 11.2 Key Browser APIs to Preserve

- Fetch / XMLHttpRequest (for API calls)
- File Download API (for Excel export)
- DOM Manipulation (querySelector, innerHTML, etc.)
- Local Storage (potentially for caching in new version)
- JSON (stringify/parse)

---

## 12. Configuration & Environment

### 12.1 Backend Configuration

**Django Settings:**
- DEBUG mode
- CORS_ALLOWED_ORIGINS configured
- INSTALLED_APPS includes 'api', 'rest_framework', 'corsheaders'
- Database: SQLite

**Hosting:**
- PythonAnywhere deployment
- Static file serving
- Database migrations applied

### 12.2 Frontend Configuration

**serviceConstants.js:**
```javascript
if(hostname === 'localhost') {
    backendHost = "http://localhost:8000";
} else {
    backendHost = 'https://drl2.pythonanywhere.com';
}
```

**Configurable:** API endpoint, blog feed URL

---

## 13. Testing & Quality

### 13.1 Existing Tests

**Backend:**
- `api/tests/test_dieroll.py` - Dice rolling unit tests

**Frontend:**
- `App.test.js` - Basic React component tests
- No comprehensive test suite

### 13.2 Test Coverage

**Observed:** ~5% of codebase covered by tests

**Risk Areas for New Version:**
- Character generation algorithm (complex conditional logic)
- Dice rolling (randomness testing)
- Lookup table queries
- State management (React to JS conversion)

---

## 14. Areas of Technical Debt

### 14.1 Backend Issues

- Migrations directory contains many incremental migrations (poor maintenance)
- No input validation in views (security risk)
- Magic numbers in Character class (hardcoded BC values)
- No error handling for invalid IDs
- No logging

### 14.2 Frontend Issues

- Material-UI styling creates tight coupling (hard to remove)
- No TypeScript (type safety)
- State management is monolithic (all in App.js)
- Selection components are copy-paste duplicates
- No separation of concerns (API calls in components)
- CharacterCard.js is 28KB (needs splitting)
- axios configuration not centralized
- No error handling for failed API calls

### 14.3 Architecture Issues

- Tight coupling between frontend and backend
- No API versioning strategy
- No caching strategy beyond axios-cache-adapter
- No offline support
- Limited error boundaries
- No logging/monitoring

---

## 15. Migration Considerations

### 15.1 Data Preservation

**Current State:**
- All configuration data is in SQLite
- No user-generated data (stateless API)
- No saved character history

**Migration Strategy:**
- Extract configuration data from SQLite
- Export as JSON data files
- Bundle in new SPA
- Optional: Implement localStorage for saving generated characters

### 15.2 Feature Parity Checklist

✅ **Must Have (Core Features):**
- [ ] Character generation algorithm
- [ ] All 17 selection options
- [ ] Attribute generation
- [ ] Ability selection
- [ ] Statistics display
- [ ] Excel export functionality
- [ ] Dice rolling

⚠️ **Nice to Have:**
- [ ] Blog feed integration
- [ ] Advertising integrations
- [ ] Material-UI design (can be simplified)

❌ **Removable (Refactoring Opportunity):**
- [ ] Django/Python backend framework overhead
- [ ] React framework overhead
- [ ] Material-UI dependency
- [ ] axios (use native fetch)
- [ ] Separate backend/frontend repos

---

## 16. Identified Risks & Mitigation

| Risk | Severity | Mitigation |
|------|----------|-----------|
| Complex character generation algorithm | HIGH | Create test cases from existing backend; implement unit tests |
| Conditional species/culture lookups | HIGH | Document all conditions; create lookup table test matrix |
| Excel export dependency | MEDIUM | Use alternative library (SheetJS) or generate CSV instead |
| Blog/Ad integrations | LOW | Make optional features; remove if simplifying scope |
| Material-UI removal complexity | MEDIUM | Start with semantic HTML; custom CSS is simpler |
| Random number seeding | MEDIUM | Document randomness expectations; test distribution |
| Browser compatibility | LOW | Use modern JavaScript; test in target browsers |
| Excel file format changes | LOW | Document current format; create migration path |

---

## 17. Recommended Prioritization

### Phase 2 Priorities (Core Framework)

1. **Highest Priority:**
   - Dice rolling utility (trivial, 17 LOC)
   - Data models to JSON export (straightforward conversion)
   - Character generation algorithm translation (core logic)

2. **High Priority:**
   - State management system (foundation for everything)
   - Basic HTML layout
   - Selection dropdown components

3. **Medium Priority:**
   - Character display component (complex rendering)
   - API endpoint simulation (data loading)
   - Excel export (can use SheetJS library or alternative)

### Phase 3 Priorities (Business Logic)

1. Character.Generate() translation (378 LOC → ~400 LOC JavaScript)
2. Lookup table system (replace ORM with object/array lookups)
3. Conditional logic (species/culture/ability selections)

---

## 18. Deliverables & Success Metrics

### 18.1 Phase 1 Deliverables

✅ **This Document** - Complete codebase analysis
- [x] Architecture overview
- [x] Data model documentation
- [x] API endpoint catalog
- [x] Business logic analysis
- [x] Component inventory
- [x] Dependency list
- [x] Risk assessment

### 18.2 Recommended Next Steps

1. **Document Data Export** - Extract SQLite data as JSON
2. **Create Algorithm Documentation** - Pseudo-code for Character.Generate()
3. **Design State Machine** - Map form → generation → output flow
4. **Create Component Wireframes** - UI layout without Material-UI
5. **Write Test Specifications** - Test cases for edge conditions

---

## 19. Appendix: File Structure Summary

### Backend Directory Tree

```
Python/mpgen/
├── api/
│   ├── migrations/          # Django migrations
│   ├── tests/
│   │   └── test_dieroll.py
│   ├── models.py            # Data models (330 LOC)
│   ├── views.py             # API endpoints (204 LOC)
│   ├── urls.py              # URL routing (101 LOC)
│   ├── serializers.py       # REST serializers (161 LOC)
│   ├── character.py         # Character generator (378 LOC)
│   ├── charsheetmaker.py    # Excel export (163 LOC)
│   ├── diceroller.py        # Dice utility (17 LOC)
│   └── admin.py
├── mpgen/                   # Django project settings
├── static/                  # Static assets
├── manage.py                # Django CLI
├── db.sqlite3               # Database
└── requirements.txt         # Python dependencies
```

### Frontend Directory Tree

```
React/mpgenui/
├── public/                  # Static files
├── src/
│   ├── components/
│   │   ├── selections/      # 17 dropdown components
│   │   ├── App.js           # Main component (~400 LOC)
│   │   ├── CharacterCard.js # Character display (~850 LOC)
│   │   ├── SelectionCard.js # Wrapper (~150 LOC)
│   │   ├── NavBar.js
│   │   ├── NotesCard.js
│   │   ├── BlogCard.js
│   │   ├── AdCode.js
│   │   ├── Loading.js
│   │   └── WhatsNext.js
│   ├── App.js               # App container
│   ├── serviceConstants.js  # Configuration
│   ├── index.js
│   └── index.css
├── package.json             # Dependencies
└── build/                   # Compiled output
```

---

## 20. Questions for Stakeholder Review

### Answered Questions ✅

1. ✅ **Blog Integration:** Include WordPress blog feed in new version
   - **Answer:** YES
   - **Impact:** Keep axios/Fetch for API calls; ~1 day effort; 5 KB overhead
   - **Implementation:** Fetch from `gaming.drl2.com` WordPress API

2. ✅ **Advertising:** Preserve ad integrations (Google AdSense, etc.)
   - **Answer:** YES
   - **Impact:** Keep AdCode component; ~0.5 days effort; minimal overhead
   - **Implementation:** Support ad network scripts; graceful error handling

3. ✅ **Character History:** Save characters locally or in backend
   - **Answer:** LOCALLY (browser localStorage)
   - **Impact:** No backend database needed; ~2-3 days effort; 50-100 character capacity
   - **Implementation:** JSON storage in localStorage; Save/Load/Delete UI

4. ✅ **Excel Format:** Keep current format or simplify to CSV
   - **Answer:** CURRENT EXCEL FORMAT REQUIRED
   - **Impact:** Use SheetJS library; ~3-4 days effort; 50 KB library addition
   - **Implementation:** Template-based population; cell-by-cell mapping

### Outstanding Questions (Optional)

5. **Offline Support:** Should the app work offline (requires localStorage)?
   - *Related to decision 3* - Character history already enables partial offline mode
   - Configuration data embedded, so mostly offline-capable

6. **Browser Support:** What's the minimum browser version to target?
   - Assumed: Modern browsers (ES6+, localStorage)
   - Recommend: Chrome 90+, Firefox 88+, Safari 14+, Edge 90+

7. **Performance:** Are there performance benchmarks for the new version?
   - Target: < 1 second initial load, < 100ms generation time
   - Bundle size: < 100 KB minified

8. **Styling:** What's the design direction for the new UI?
   - Remove Material-UI dependency
   - Use semantic HTML + custom CSS
   - Keep current functionality, modernize appearance

---

**Analysis Completed:** 2026-11-13  
**Decisions Finalized:** 2026-11-13  
**Prepared By:** AI Assistant (Copilot)  
**Status:** Ready for Phase 2 Planning
