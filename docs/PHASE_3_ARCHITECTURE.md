# Phase 3 Architecture Diagram

**Purpose:** Visual guide to Phase 3 system components and data flow

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     MPGEN v2 (Phase 3)                      │
└─────────────────────────────────────────────────────────────┘

┌──────────────────┐
│   HTML Form      │
│  (index.html)    │
│                  │
│ • 18 Selects     │
│ • Allow Dupes    │
│ • Generate Btn   │
└────────┬─────────┘
         │
         ▼
┌──────────────────────────────────────────────────────────────┐
│              JavaScript Application Layer                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────┐  ┌──────────────────┐  ┌─────────────┐  │
│  │  UIController  │  │  StateManager    │  │   Router    │  │
│  │                │  │  (Observer)      │  │ (Hash-base) │  │
│  │ Collect Form   │  │ Store Character  │  │ Navigation  │  │
│  │ Display Result │  │ Notify Changes   │  │             │  │
│  └────────┬───────┘  └────────▲─────────┘  └─────────────┘  │
│           │                   │                               │
│           │                   │                               │
│  ┌────────▼──────────────────┴─────────────────────────────┐ │
│  │     CharacterGenerator (NEW - Phase 3)                  │ │
│  ├────────────────────────────────────────────────────────┤ │
│  │                                                          │ │
│  │  generate(parameters, dataStore) {                      │ │
│  │    ├─ resolvePowerLevel()      → BC stats              │ │
│  │    ├─ resolveSide()             → Alignment            │ │
│  │    ├─ resolveBirthplace()       → Complex cascade      │ │
│  │    │  ├─ Foreigner   → Known Region                   │ │
│  │    │  ├─ Stranger    → Lost Region + Species/Culture  │ │
│  │    │  ├─ Anachronism → Time Period + Species/Culture  │ │
│  │    │  ├─ Alien       → World + Species/Culture        │ │
│  │    │  └─ ExtraDim    → Dimension + Species/Culture    │ │
│  │    ├─ resolveSpecies()         → CP adjustment        │ │
│  │    ├─ resolveCulture()         → Default: Modern      │ │
│  │    ├─ generateStats()          → 5 unique D10 rolls   │ │
│  │    ├─ derivedStats()           → BC lookup table      │ │
│  │    ├─ calculateStats()         → Power, Defense, Move │ │
│  │    ├─ generateBackgrounds()    → 3 rolls (D100)       │ │
│  │    ├─ generateMotivations()    → 2 rolls (D100)       │ │
│  │    ├─ generateAbilities()      → 6 total by type      │ │
│  │    └─ calculateCaps()          → CP/BC/Damage Caps    │ │
│  │                                                          │ │
│  │  Returns: Complete character object                     │ │
│  └────────────┬──────────────────────────────────────────┘ │
│               │                                               │
│               ├─ Uses DiceRoller (NEW)                       │
│               │  └─ rollDice(notation) → D4/D10/D100        │
│               │                                               │
│               └─ Uses DataStore Queries (Enhanced)           │
│                  ├─ findById(table, id)                      │
│                  ├─ findByRoll(table, roll)                  │
│                  ├─ findByContextAndRoll(table, ctx, roll)   │
│                  ├─ filterByType(table, type)                │
│                  └─ findByName(table, name)                  │
│                                                               │
└─────────────────┬──────────────────────────────────────────┘
                  │
                  ▼
        ┌─────────────────────┐
        │  LocalStorageManager │
        │                     │
        │ Save Character      │
        │ Load Saved Chars    │
        │ List Saved Chars    │
        └────────┬────────────┘
                 │
                 ▼
         ┌──────────────────┐
         │  localStorage    │
         │  (Browser DB)    │
         │                  │
         │  50-100 Chars    │
         │  ~5-10 MB cap    │
         └──────────────────┘
```

---

## 📊 Data Flow: Character Generation

```
Form Submission
│
├─ Collect 18 Parameters
│  ├─ powerlevel_id
│  ├─ side_id
│  ├─ birthplace_id
│  ├─ species_id
│  ├─ culture_id
│  ├─ gender_identity_id
│  ├─ gender_expression_id
│  ├─ biological_sex_id
│  ├─ sexual_attraction_id
│  ├─ motivation_id
│  ├─ origin_type_id
│  ├─ known_region_id
│  ├─ lost_region_id
│  ├─ other_world_id
│  ├─ other_dimension_id
│  ├─ time_period_id
│  ├─ allow_duplicates (checkbox)
│  └─ [Others when null]
│
├─ Load DataStore (from cache, <1ms if cached)
│  └─ All 19 JSON files now available
│
├─ Call CharacterGenerator.generate()
│  │
│  ├─ Power Level Lookup (D4 if null)
│  │  └─ Query: findById('powerlevels', id)
│  │
│  ├─ Side Lookup (D3 if null)
│  │  └─ Query: findById('sides', id)
│  │
│  ├─ Birthplace Resolution (D100 if null)
│  │  ├─ Query: findByRoll('birthplaces', roll)
│  │  │
│  │  ├─ [Complex Conditional Cascade]
│  │  │
│  │  ├─ IF "Foreigner"
│  │  │  └─ Query: findByRoll('known_regions', roll)
│  │  │
│  │  ├─ ELSE IF "Stranger"
│  │  │  ├─ Query: findByRoll('lost_regions', roll)
│  │  │  ├─ Query: findByContextAndRoll('lost_region_species', region_id, roll)
│  │  │  └─ Query: findByContextAndRoll('lost_region_cultures', region_id, roll)
│  │  │
│  │  ├─ ELSE IF "Anachronism"
│  │  │  ├─ Query: findByRoll('time_periods', roll)
│  │  │  ├─ Query: findByContextAndRoll('time_period_species', period_id, roll)
│  │  │  └─ Query: findByContextAndRoll('time_period_cultures', period_id, roll)
│  │  │
│  │  ├─ ELSE IF "Alien"
│  │  │  ├─ Query: findByRoll('other_worlds', roll)
│  │  │  ├─ Query: findByContextAndRoll('other_world_species', world_id, roll)
│  │  │  └─ Query: findByContextAndRoll('other_world_cultures', world_id, roll)
│  │  │
│  │  ├─ ELSE IF "ExtraDimensional"
│  │  │  ├─ Query: findByRoll('other_dimensions', roll)
│  │  │  ├─ Query: findByContextAndRoll('other_dim_species', dim_id, roll)
│  │  │  └─ Query: findByContextAndRoll('other_dim_cultures', dim_id, roll)
│  │  │
│  │  └─ ELSE (Earth)
│  │     └─ Default species/culture lookup
│  │
│  ├─ Species Resolution
│  │  ├─ Query: findById('species', id) [if set]
│  │  └─ Apply cp_adjustment to cp_per_ability
│  │
│  ├─ Culture Resolution
│  │  ├─ Query: findById('cultures', id) [if set]
│  │  └─ Default to "Modern" if not found
│  │
│  ├─ Age Generation
│  │  └─ rollDice("2d10") + 10 → 12-30 years
│  │
│  ├─ Gender/Sexuality (4 separate D100 rolls)
│  │  ├─ Gender Identity    → Query: findByRoll('gender_identities', roll)
│  │  ├─ Gender Expression  → Query: findByRoll('gender_expressions', roll)
│  │  ├─ Biological Sex     → Query: findByRoll('biological_sexes', roll)
│  │  └─ Sexual Attraction  → Query: findByRoll('sexual_attractions', roll)
│  │
│  ├─ Characteristic Stats (5 D10 rolls for unique values)
│  │  ├─ Roll D10 → Lookup stat type (ST/EN/AG/IN/CL)
│  │  ├─ Assign to bc_start (14, 16, 18, or 20)
│  │  ├─ Decrement bc_start by 2 per stat
│  │  └─ 5 unique values: 8-20 range
│  │
│  ├─ Derived Stats (BC Detail Lookup)
│  │  ├─ For each stat: findById('bc_details', bcScore)
│  │  ├─ Extract: Hit Points, Saves, Healing Rate, Initiative
│  │  └─ Sum: Total Hit Points = ST+EN+AG+CL hits
│  │
│  ├─ Calculated Stats
│  │  ├─ Power = ST + EN + AG + IN
│  │  ├─ Physical Defense = AG Save - 10
│  │  ├─ Mental Defense = IN Save - 10
│  │  ├─ Movement = (ST + EN + AG) / 3
│  │  └─ Inventing Points = (IN / 2) + 0.5
│  │
│  ├─ Weight/Mass Calculation
│  │  ├─ Die: d4 (female) or d6 (male)
│  │  ├─ Count: 5 - (d2 if age < 20)
│  │  ├─ Weight = roll × 10 pounds
│  │  ├─ Find closest BC Detail for mass
│  │  └─ Store mass category
│  │
│  ├─ Backgrounds (3 rolls)
│  │  ├─ While length < 3:
│  │  │  ├─ rollDice("d100")
│  │  │  ├─ Query: findByRoll('backgrounds', roll)
│  │  │  └─ Add if new or allow_duplicates
│  │  └─ Store backgrounds array
│  │
│  ├─ Motivations (0-2 rolls)
│  │  ├─ Skip if side == "Neutral"
│  │  ├─ While length < 2:
│  │  │  ├─ rollDice("d100")
│  │  │  ├─ Query: findByContextAndRoll('motivations', side_id, roll)
│  │  │  └─ Add if new or allow_duplicates
│  │  └─ Store motivations array
│  │
│  ├─ Origin Type (D100 roll)
│  │  └─ Query: findByRoll('origin_types', roll)
│  │
│  ├─ Abilities (0 or 6 total by type)
│  │  ├─ Skip if power_level_id == 1 (Normal)
│  │  ├─ 2 Offensive (type 1):  Query: filterByType('abilities', 1)
│  │  ├─ 2 Defensive (type 2):  Query: filterByType('abilities', 2)
│  │  ├─ 2 Misc (type 4):       Query: filterByType('abilities', 4)
│  │  └─ Store abilities array
│  │
│  ├─ Weaknesses (0 or 2 total)
│  │  ├─ Skip if power_level_id == 1 (Normal)
│  │  ├─ 2 Weakness (type 3):   Query: filterByType('abilities', 3)
│  │  └─ Store weaknesses array
│  │
│  ├─ CP Caps
│  │  ├─ BC Cap = (total_cp / 5) + 10
│  │  ├─ Ability Cap = (total_cp / 5)
│  │  └─ Damage Cap = (total_cp / 12.5) + 3
│  │
│  └─ To-Hit Bonuses
│     ├─ AG To-Hit = AG Save + 3
│     ├─ IN To-Hit = IN Save + 3
│     └─ CL To-Hit = CL Save + 3
│
├─ Complete Character Object Created
│  └─ ~50-80 properties total
│
├─ Save to StateManager
│  └─ Notify UIController
│
├─ UIController Updates DOM
│  ├─ Display character name (if exists)
│  ├─ Show all stats
│  ├─ Show abilities/weaknesses
│  ├─ Show backgrounds/motivations
│  └─ Display "Export to Excel" button
│
├─ Save to LocalStorage
│  ├─ Store character object
│  ├─ Store timestamp
│  ├─ Add to saved characters list
│  └─ Maintain 50-100 character limit
│
└─ Complete (Time: <500ms including data load)
```

---

## 📦 File Structure (Phase 3 Deliverables)

```
mpgen_renewed/
│
├── data/                           [NEW - Phase 3.1]
│   ├── powerlevels.json           (4 entries)
│   ├── sides.json                 (3 entries)
│   ├── birthplaces.json           (5+ entries with rolls)
│   ├── known_regions.json         (D100 rollable)
│   ├── lost_regions.json          (D100 rollable)
│   ├── time_periods.json          (D100 rollable)
│   ├── other_worlds.json          (D100 rollable)
│   ├── other_dimensions.json      (D100 rollable)
│   ├── species.json               (D100 rollable, cp adjustment)
│   ├── cultures.json              (lookup table)
│   ├── gender_identities.json     (D100 rollable)
│   ├── gender_expressions.json    (D100 rollable)
│   ├── biological_sexes.json      (D100 rollable)
│   ├── sexual_attractions.json    (D100 rollable)
│   ├── origin_types.json          (D100 rollable)
│   ├── backgrounds.json           (D100 rollable)
│   ├── motivations.json           (D100 by side)
│   ├── abilities.json             (D100 by type)
│   ├── species_abilities.json     (FK to species)
│   ├── bc_details.json            (BC score → stats)
│   ├── stats.json                 (D10 → abbreviation)
│   ├── lost_region_species.json   (FK combinations)
│   ├── lost_region_cultures.json  (FK combinations)
│   ├── time_period_species.json   (FK combinations)
│   ├── time_period_cultures.json  (FK combinations)
│   ├── other_world_species.json   (FK combinations)
│   ├── other_world_cultures.json  (FK combinations)
│   ├── other_dimension_species.json  (FK combinations)
│   └── other_dimension_cultures.json (FK combinations)
│
├── src/
│   ├── app.js                     [MODIFY - Add query methods]
│   ├── diceroller.js              [NEW - Phase 3.2]
│   ├── character-generator.js     [NEW - Phase 3.3]
│   └── data-store-queries.js      [OPTIONAL - Split queries into separate file]
│
├── index.html                     [MODIFY - Add form submission handler]
├── mpgen.css                      [No changes needed]
├── less/mpgen.less                [No changes needed]
│
├── PYTHON_API_ANALYSIS.md         [NEW - Complete analysis]
├── CONVERSION_CHECKLIST.md        [NEW - Task breakdown]
├── CONVERSION_QUICK_REFERENCE.md  [NEW - Code patterns]
├── PHASE_3_SUMMARY.md             [NEW - Executive summary]
└── PHASE_3_ARCHITECTURE.md        [NEW - This file]
```

---

## 🔄 Module Dependencies

```
┌─────────────────────────────────┐
│   CharacterGenerator            │
│   (src/character-generator.js)  │
│                                 │
│  Depends on:                    │
│  • DiceRoller                   │
│  • DataStore (via dataStore)    │
│  • All 19 JSON files (cached)   │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   DiceRoller                    │
│   (src/diceroller.js)           │
│                                 │
│  Depends on:                    │
│  • Math.random() [built-in]     │
│  • No external libraries         │
└─────────────────────────────────┘

┌─────────────────────────────────┐
│   DataStore (Enhanced)          │
│   (src/app.js)                  │
│                                 │
│  Depends on:                    │
│  • 19 JSON data files           │
│  • localStorage API (caching)   │
│  • No external libraries         │
└─────────────────────────────────┘
```

---

## 🔌 Integration Points

### 1. Form Submission Handler (index.html)
```javascript
// Listen for Generate button click
document.getElementById('generateButton').addEventListener('click', () => {
  // Collect form data
  const parameters = collectFormParameters();
  
  // Load data (cached)
  dataStore.loadAll().then(() => {
    // Generate character
    const gen = new CharacterGenerator(parameters, dataStore);
    const character = gen.generate();
    
    // Update UI
    stateManager.setState('currentCharacter', character);
    
    // Save to localStorage
    localStorageManager.saveCharacter(character);
  });
});
```

### 2. Conditional Field Visibility (index.html)
```javascript
// Listen for Birthplace dropdown change
document.getElementById('birthplaceSelect').addEventListener('change', (e) => {
  const birthplace = e.target.value;
  
  // Show/hide regional fields
  document.getElementById('knownRegionSelect').style.display = 
    (birthplace === 'Foreigner') ? 'block' : 'none';
  
  document.getElementById('lostRegionSelect').style.display = 
    (birthplace === 'Stranger') ? 'block' : 'none';
  
  // ... etc for all 5 regional options
});
```

---

## 📈 Performance Targets

| Operation | Target | Notes |
|-----------|--------|-------|
| Data load (first time) | <200ms | File I/O |
| Data load (cached) | <1ms | Memory access |
| Character generation | <300ms | Algorithm + queries |
| Total (with load) | <500ms | Full flow |
| 10 sequential chars | <4s | ~400ms each |
| localStorage write | <50ms | Small data |
| DOM update | <100ms | UIController |

---

## 🧪 Test Scenarios

### Unit Tests (DiceRoller)
```javascript
assert(rollDice("d4") >= 1 && rollDice("d4") <= 4);
assert(rollDice("2d10") >= 2 && rollDice("2d10") <= 20);
assert(rollDice("d100") >= 1 && rollDice("d100") <= 100);
```

### Integration Tests (Full Generation)
```javascript
const parameters = {
  powerlevel_id: null,  // Random
  side_id: null,        // Random
  // ... all other params
};

const gen = new CharacterGenerator(parameters, dataStore);
const char = gen.generate();

// Validate
assert(char.strength >= 8 && char.strength <= 20);
assert(char.abilities.length >= 0 && char.abilities.length <= 6);
assert(char.birthplace !== null && char.birthplace !== '');
```

### Regression Tests (Python Comparison)
```javascript
// Generate same character with both systems
const jsChar = jsGenerator.generate(params);
const pyChar = pythonAPI.generateCharacter(params);

// Compare key attributes
assert(jsChar.strength === pyChar.strength);
assert(jsChar.birthplace === pyChar.birthplace);
assert(jsChar.abilities.length === pyChar.abilities.length);
```

---

## 🚨 Critical Paths

**Order Dependencies (Must Maintain):**

1. ✅ Power level → bc_start (used for stats)
2. ✅ Birthplace → contextual species/culture lookup
3. ✅ Species → cp_adjustment (before ability cost calc)
4. ✅ Characteristic stats → BC detail lookup
5. ✅ Age + Gender → Weight calculation
6. ✅ Side filter → Motivation lookup
7. ✅ Power level → Ability count (0 for Normal, 6 for others)

**If Order Violated:**
- ❌ Stats calculated incorrectly
- ❌ Species CP adjustment lost
- ❌ Wrong abilities generated
- ❌ Weight calculation fails

---

**Architecture Document Complete**  
**For Phase 3 Implementation**  
**Reference: Consult when building modules**
