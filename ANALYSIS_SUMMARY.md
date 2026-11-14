# MPGEN Phase 1 Analysis - Quick Reference

## What MPGEN Does
Character generator for "Mighty Protectors" tabletop RPG. Users select options (power level, species, culture, gender identity, motivation, etc.) and the app generates a complete character sheet with stats, abilities, and an downloadable Excel file.

---

## Current Architecture

### Backend (Python/Django)
- **Location:** `/mnt/AAD0BF13D0BEE4AB/Projects/Python/mpgen`
- **Size:** ~1,362 lines of Python
- **Key Components:**
  - `character.py` (378 LOC) - Character generation algorithm
  - `models.py` (330 LOC) - Database schema (28 tables)
  - `views.py` (204 LOC) - REST API endpoints (17 GET endpoints)
  - `charsheetmaker.py` (163 LOC) - Excel export functionality
  - `diceroller.py` (17 LOC) - Dice rolling utility

### Frontend (React.js)
- **Location:** `/mnt/AAD0BF13D0BEE4AB/Projects/React/mpgenui`
- **Size:** ~3,900 lines of JavaScript/JSX
- **Key Components:**
  - `App.js` (~400 LOC) - Main app & state management
  - `CharacterCard.js` (~850 LOC) - Character display (largest component)
  - `SelectionCard.js` + 17 selection dropdowns (~2,000 LOC)
  - Supporting components (NavBar, BlogCard, AdCode, etc.)
- **Dependencies:**
  - React 16.6.0
  - Material-UI 3.3.1
  - axios (HTTP client)
  - js-file-download (file download utility)

### Database (SQLite)
- **28 tables:** Mostly read-only configuration data
- **Key tables:**
  - PowerLevel, Side, Birthplace, Species, Culture
  - GenderIdentity, GenderExpression, BiologicalSex, SexualAttraction
  - Motivation, OriginType, KnownRegion, LostRegion, OtherWorld, OtherDimension, TimePeriod
  - Lookup/relationship tables for conditional species/culture selection

### API Endpoints (17 total)
```
GET /api/v1/power_levels/
GET /api/v1/sides/
GET /api/v1/birthplaces/
GET /api/v1/species/
GET /api/v1/cultures/
GET /api/v1/gender_identities/
GET /api/v1/gender_expressions/
GET /api/v1/biological_sexes/
GET /api/v1/sexual_attractions/
GET /api/v1/motivations/
GET /api/v1/origin_types/
GET /api/v1/known_regions/
GET /api/v1/lost_regions/
GET /api/v1/other_worlds/
GET /api/v1/other_dimensions/
GET /api/v1/time_periods/
GET /api/v1/character/  (with query parameters)

POST /charsheet/  (Excel export)
```

---

## Character Generation Algorithm

1. **Power Level** → Determines CP budget, ability costs, BC starting value
2. **Side/Alignment** → Good/Neutral/Evil (3 options)
3. **Birthplace** → Triggers conditional region/species lookups
4. **Species & Culture** → Selected based on birthplace/world/dimension/time period
5. **Gender Attributes** → Gender identity, expression, biological sex, sexual attraction
6. **Background** → Motivation & origin type
7. **Abilities** → Species-specific abilities (rolled per ability, respecting "keep duplicates" flag)
8. **Base Attributes** → Strength, Endurance, Agility, Intelligence, Cool, Luck (derived from rolls)
9. **Derived Stats** → Base handling damage, carrying capacity, defense, initiative, healing rate, etc.

**Key Complexity:** Conditional lookups based on birthplace/world/time period determine available species/cultures.

---

## Frontend State Management

### React State (App.js)
```javascript
{
  // Input selections
  powerlevel_id, side_id, motivation_id, origin_type_id,
  birthplace_id, species_id, culture_id,
  gender_identity_id, gender_expression_id, biological_sex_id, sexual_attraction_id,
  keep_duplicates, other_world_id, other_dimension_id, known_region_id, lost_region_id, time_period_id,
  
  // Output selections (post-generation)
  selected_motivation, selected_background, selected_abilities,
  background1/2/3 (checkboxes), ability0-5 (checkboxes),
  
  // Display
  character_data (full generated character), showCharacter (boolean)
}
```

### Component Flow
1. **SelectionCard** (wrappers) → Load data from API
2. User selects options or clicks "Generate"
3. **App.js** collects state → POST to `/api/v1/character/`
4. Backend returns generated character data
5. **CharacterCard** renders the character

---

## Data Characteristics

| Aspect | Detail |
|--------|--------|
| **Complexity** | MEDIUM |
| **Database Type** | SQLite (read-only config data) |
| **API Pattern** | Simple CRUD + character generation |
| **State Model** | Form inputs → Character generation → Display |
| **External Services** | WordPress blog feed, Google Cloud Storage (optional) |
| **Hosting** | PythonAnywhere (drl2.pythonanywhere.com) |

---

## To Translate to Vanilla JS

### Must Translate
- Character.Generate() algorithm (378 LOC) → ~400 LOC JavaScript
- Dice rolling utility (17 LOC) → trivial
- All 28 database tables → JSON data files
- API endpoints simulation → Direct function calls with JSON data
- Excel export → SheetJS library or CSV alternative
- Selection dropdown components → HTML select elements
- Character display → Vanilla JavaScript DOM rendering

### Must Remove/Replace
- Django REST framework → Replace with local data + functions
- React framework → Vanilla JavaScript + simple state management
- Material-UI styling → CSS + semantic HTML
- axios → Native fetch() API
- react-scripts build tool → Use Webpack, Vite, or simple bundle

### Can Keep (Optional)
- Blog feed integration (WordPress API call still works)
- Ad integrations (but typically would remove)
- Excel export functionality (migrate to SheetJS or CSV)

---

## Database Schema (Read-Only Config Data)

**Core Tables (16):**
- PowerLevel, Side, Motivation, OriginType, BirthPlace
- Species, Culture, GenderIdentity, GenderExpression, BiologicalSex, SexualAttraction
- KnownRegion, LostRegion, OtherWorld, OtherDimension, TimePeriod

**Relationship/Lookup Tables (12):**
- SpeciesAbility, LostRegionSpecies, LostRegionCulture
- OtherWorldSpecies, OtherWorldCulture, OtherDimensionSpecies, OtherDimensionCulture
- TimePeriodSpecies, TimePeriodCulture
- BCPowerLevelMinMax, BCDetail, Stat

**Typical Table Structure:**
```
{
  id: 1,
  min_roll: 1,      // for d100 random selection
  max_roll: 25,
  name: "Birthplace Name",
  // other properties specific to table
}
```

---

## Code Complexity Analysis

| Component | LOC | Complexity | Notes |
|-----------|-----|-----------|-------|
| character.py | 378 | HIGH | Main algorithm; many conditionals |
| models.py | 330 | LOW | Simple ORM models |
| views.py | 204 | LOW | Straightforward API endpoints |
| charsheetmaker.py | 163 | MEDIUM | Excel cell mapping logic |
| serializers.py | 161 | LOW | REST serialization |
| urls.py | 101 | LOW | URL routing |
| diceroller.py | 17 | TRIVIAL | Simple dice utility |
| **Backend Total** | **~1,362** | **MEDIUM** | |
| | | | |
| CharacterCard.js | ~850 | HIGH | Large component, conditional rendering |
| App.js | ~400 | HIGH | Main state management |
| SelectionCard.js | ~150 | MEDIUM | Reusable wrapper |
| 17 Selection components | ~2,000 | LOW | Copy-paste duplicates |
| Other components | ~500 | LOW | NavBar, BlogCard, etc. |
| **Frontend Total** | **~3,900** | **MEDIUM** | |

**Highest Risk Areas for Translation:**
1. Character generation algorithm (conditional branching, multiple lookups)
2. CharacterCard rendering logic (complex props, conditional UI)
3. Lookup table queries (correct species/culture by birthplace logic)

---

## Technology Stack to Replace

| Current | Purpose | Replacement |
|---------|---------|-------------|
| Django 2.1.2 | Web framework | Native HTTP functions |
| Django REST Framework | API framework | JSON data + functions |
| React 16.6.0 | UI framework | Vanilla JavaScript + DOM API |
| Material-UI 3.3.1 | Component library | CSS + semantic HTML |
| axios | HTTP client | Native fetch() |
| openpyxl | Excel generation | SheetJS or CSV export |
| sqlite3 | Database | JSON data files |

---

## Migration Strategy

### Phase 2: Foundation
- [ ] Extract database to JSON format
- [ ] Set up HTML/CSS/JS scaffolding
- [ ] Create state management system
- [ ] Translate dice roller

### Phase 3: Backend Logic
- [ ] Translate Character class algorithm
- [ ] Create lookup functions for species/culture/abilities
- [ ] Implement character generation engine
- [ ] Create derived values calculations

### Phase 4: Frontend UI
- [ ] Create selection dropdowns (HTML select)
- [ ] Create character display component
- [ ] Implement "Generate" button logic
- [ ] Add ability selection checkboxes

### Phase 5: Export & Polish
- [ ] Implement Excel export (SheetJS or CSV)
- [ ] Add download functionality
- [ ] Test all generation paths
- [ ] Performance optimization

---

## Known Issues / Technical Debt

**Backend:**
- No input validation in views (security risk)
- Magic numbers hardcoded in character.py
- Many incremental database migrations (maintenance burden)
- No error handling for invalid IDs
- No logging

**Frontend:**
- Tight Material-UI coupling (hard to remove)
- No TypeScript (type safety)
- All state in one App.js (monolithic)
- Selection components are duplicates
- CharacterCard.js is 28KB (needs splitting)
- No error handling for API failures
- axios not centralized

---

## Questions Before Proceeding

1. Keep blog feed integration? (WordPress API call)
2. Keep ad integrations? (Google AdSense, etc.)
3. Support offline mode? (requires localStorage)
4. Excel export required? (current format or CSV OK?)
5. Minimum browser version? (ES6 baseline?)
6. Performance targets? (bundle size, load time, etc.)
7. Design direction? (keep Material-UI style or new design?)
8. Save character history? (localStorage or backend?)

---

## Success Metrics

- ✅ All legacy features functional in new SPA
- ✅ No external framework dependencies (React, Vue, Angular)
- ✅ Bundle size < 500KB unminified, < 150KB minified
- ✅ Full test coverage for character generation
- ✅ Feature parity with legacy app
- ✅ Performance equal or better than legacy

---

**See Also:**
- [PHASE1_ANALYSIS.md](./PHASE1_ANALYSIS.md) - Complete detailed analysis
- [PLAN.md](./PLAN.md) - Full implementation plan
