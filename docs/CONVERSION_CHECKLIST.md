# Python → JavaScript Conversion Checklist

**Status:** PHASE 3 PLANNING  
**Target Completion:** 4 weeks  
**Modules to Convert:** 3 (DiceRoller, CharacterGenerator, DataStore queries)

---

## 📋 PHASE 3.1: DATA FILE EXTRACTION (Week 1)

### Extract JSON Files (19 total)

#### Core Tables (D100 Rollable)
- [ ] `data/birthplaces.json` - 5 birthplace categories + min/max rolls
- [ ] `data/known_regions.json` - Foreigner destination regions
- [ ] `data/lost_regions.json` - Stranger destination regions  
- [ ] `data/time_periods.json` - Anachronism time options
- [ ] `data/other_worlds.json` - Alien worlds
- [ ] `data/other_dimensions.json` - Extra-dimensional locations
- [ ] `data/species.json` - Base species + CP adjustments
- [ ] `data/cultures.json` - Cultures + "Modern" default
- [ ] `data/backgrounds.json` - Background options (D100)
- [ ] `data/motivations.json` - Motivations by side (D100)

#### New Preset Tables
- [ ] `data/powerlevels.json` - 4 power levels (Normal, Low, Standard, High)
- [ ] `data/sides.json` - 3 sides (Hero, Villain, Neutral)
- [ ] `data/origin_types.json` - Origin type options (D100)
- [ ] `data/gender_identities.json` - Gender identity options (D100)
- [ ] `data/gender_expressions.json` - Gender expression options (D100)
- [ ] `data/biological_sexes.json` - Biological sex options (D100)
- [ ] `data/sexual_attractions.json` - Attraction options (D100)

#### Contextual Tables (FK Lookups)
- [ ] `data/lost_region_species.json` - Species by lost region + D100
- [ ] `data/lost_region_cultures.json` - Cultures by lost region + D100
- [ ] `data/time_period_species.json` - Species by time period + D100
- [ ] `data/time_period_cultures.json` - Cultures by time period + D100
- [ ] `data/other_world_species.json` - Species by world + D100
- [ ] `data/other_world_cultures.json` - Cultures by world + D100
- [ ] `data/other_dimension_species.json` - Species by dimension + D100
- [ ] `data/other_dimension_cultures.json` - Cultures by dimension + D100
- [ ] `data/species_abilities.json` - Species racial abilities/weaknesses
- [ ] `data/abilities.json` - General abilities by type (offensive, defensive, misc, weakness)
- [ ] `data/bc_details.json` - BC scores → derived stats lookup
- [ ] `data/stats.json` - D10 rolls → stat abbreviations

### Validation Checklist
- [ ] All files valid JSON (no syntax errors)
- [ ] All files contain `id` and `name` fields
- [ ] D100 tables have min_roll/max_roll covering 1-100 with no gaps
- [ ] Foreign key references are valid IDs
- [ ] Sample queries work: `findByRoll()`, `findById()`, `findByContextId()`

---

## 📋 PHASE 3.2: DICEROLLER MODULE (1 day)

### Create `src/diceroller.js`

- [ ] **Function: `rollDice(notation)`**
  - [ ] Parse notation: "NdX" format
  - [ ] Handle single die: "d6" → default N=1
  - [ ] Handle multiple dice: "2d10" → sum 2 rolls
  - [ ] Return integer sum
  
- [ ] **Tests:**
  - [ ] `rollDice("d4")` returns 1-4
  - [ ] `rollDice("2d10")` returns 2-20
  - [ ] `rollDice("d100")` returns 1-100
  - [ ] `rollDice("5d6")` returns 5-30

- [ ] **Code Quality:**
  - [ ] No external dependencies
  - [ ] Comments on algorithm
  - [ ] Error handling for invalid notation

---

## 📋 PHASE 3.2: DATA STORE QUERIES (1 day)

### Enhance `src/app.js` with Query Methods

**DataLoader.prototype methods to add:**

- [ ] **`findByRoll(tableName, roll)`**
  - [ ] Look up value in D100 range table
  - [ ] Return first matching entry
  - [ ] Raise error if not found

- [ ] **`findByContextAndRoll(tableName, contextId, roll)`**
  - [ ] Filter by contextId first (region_id, world_id, etc.)
  - [ ] Then find by D100 roll
  - [ ] Raise error if not found

- [ ] **`findById(tableName, id)`**
  - [ ] Direct ID lookup
  - [ ] Return entry or raise error

- [ ] **`filterByType(tableName, typeField, typeId)`**
  - [ ] Return all entries matching type
  - [ ] Used for abilities by type

- [ ] **`findByName(tableName, name)`**
  - [ ] Look up by name field
  - [ ] Case-insensitive match
  - [ ] Return entry or raise error

- [ ] **`findByFieldValue(tableName, fieldName, value)`**
  - [ ] Generic lookup by any field
  - [ ] Useful for edge cases

### Tests
- [ ] Query power levels by ID
- [ ] Query species by D100 roll
- [ ] Query lost region species by (region_id, roll)
- [ ] Query cultures by name
- [ ] Query abilities by type

---

## 📋 PHASE 3.3: CHARACTER GENERATOR MODULE (3-4 days)

### Create `src/character-generator.js`

#### Line 1-50: Initialization & Data Validation
- [ ] Class: `CharacterGenerator`
- [ ] Constructor: `constructor(parameters, dataStore)`
- [ ] Validate all 18 parameters
- [ ] Initialize character object with empty attributes

#### Line 51-120: Power Level Resolution
- [ ] Method: `resolvePowerLevel(powerlevel_id)`
- [ ] Roll D4 if null
- [ ] Set bc_start based on level:
  - [ ] Level 1 (Normal): bc_start=14, cp_per_ability=0
  - [ ] Level 2 (Low): bc_start=16, cp_per_ability=10
  - [ ] Level 3 (Standard): bc_start=18, cp_per_ability=20
  - [ ] Level 4 (High): bc_start=20, cp_per_ability=30
- [ ] Set total_cp from table

#### Line 121-140: Side Resolution
- [ ] Method: `resolveSide(side_id)`
- [ ] Roll D3 if null
- [ ] Lookup side name

#### Line 141-220: Birthplace Resolution (COMPLEX)
- [ ] Method: `resolveBirthplace(birthplace_id, parameters)`
- [ ] **Conditional Logic (Major Sub-Methods):**
  - [ ] `resolveForeigerBirthplace()` → Known Region lookup
  - [ ] `resolveStrangerBirthplace()` → Lost Region + cascaded species/culture
  - [ ] `resolveAnachronismBirthplace()` → Time Period + cascaded species/culture
  - [ ] `resolveAlienBirthplace()` → Other World + cascaded species/culture
  - [ ] `resolveExtraDimensionalBirthplace()` → Other Dimension + cascaded species/culture
  - [ ] `resolveEarthBirthplace()` → Default species/culture

#### Line 221-260: Species Resolution
- [ ] Method: `resolveSpecies(species_id, context)`
- [ ] Use provided ID or roll D100
- [ ] Apply cp_adjustment
- [ ] Load racial abilities/weaknesses
- [ ] Return species object with all properties

#### Line 261-280: Culture Resolution
- [ ] Method: `resolveCulture(culture_id)`
- [ ] Use provided ID or roll D100
- [ ] Default to "Modern" if not found
- [ ] Return culture object

#### Line 281-310: Age Generation
- [ ] Roll 2d10 + 10
- [ ] Store age

#### Line 311-360: Gender/Sexuality Generation (4 separate rolls)
- [ ] Method: `resolveGenderIdentity(gender_identity_id)`
- [ ] Method: `resolveGenderExpression(gender_expression_id)`
- [ ] Method: `resolveBiologicalSex(biological_sex_id)`
- [ ] Method: `resolveSexualAttraction(sexual_attraction_id)`
- [ ] Combine into gender string with proper spacing

#### Line 361-400: Characteristic Stats (D10 Rolls)
- [ ] Method: `generateCharacteristicStats()`
- [ ] Roll 5 unique D10 values
- [ ] Assign to ST, EN, AG, IN, CL in rolling order
- [ ] Decrement bc_start by 2 per stat
- [ ] Store all 5 stats

#### Line 401-450: Derived Stats (BC Lookup)
- [ ] Method: `derivedStats()`
- [ ] Look up BCDetail for each characteristic stat
- [ ] Extract hit points, saves, healing rate, initiative
- [ ] Sum hit points from all sources
- [ ] Store all derived values

#### Line 451-480: Calculated Stats
- [ ] Method: `calculateStats()`
- [ ] Power = ST + EN + AG + IN
- [ ] Physical Defense = AG Save - 10
- [ ] Mental Defense = IN Save - 10
- [ ] Movement = (ST + EN + AG) / 3 rounded
- [ ] Inventing Points = (IN / 2) + 0.5 rounded

#### Line 481-510: Weight/Mass Calculation
- [ ] Method: `calculateWeight()`
- [ ] Die type: d4 for female, d6 for male
- [ ] Die count: 5 - (d2 if age < 20)
- [ ] Weight = roll × 10
- [ ] Find closest BC Detail for mass category

#### Line 511-540: Background Generation
- [ ] Method: `generateBackgrounds(keep_duplicates)`
- [ ] Roll 3 backgrounds using D100
- [ ] Respect keep_duplicates flag
- [ ] Store backgrounds array

#### Line 541-570: Motivation Generation
- [ ] Method: `generateMotivations(side_id, motivation_id, keep_duplicates)`
- [ ] Skip if side is "Neutral"
- [ ] Use provided motivation_id or roll 2 × D100
- [ ] Filter by side_id
- [ ] Respect keep_duplicates flag
- [ ] Store motivations array

#### Line 571-590: Origin Type Generation
- [ ] Method: `resolveOriginType(origin_type_id)`
- [ ] Use provided ID or roll D100
- [ ] Store origin_type

#### Line 591-630: Ability Generation
- [ ] Method: `generateAbilities(powerlevel_id, keep_duplicates)`
- [ ] Skip if powerlevel_id === 1 (Normal)
- [ ] Roll 2 offensive (type 1)
- [ ] Roll 2 defensive (type 2)
- [ ] Roll 2 miscellaneous (type 4)
- [ ] Respect keep_duplicates flag
- [ ] Store abilities array

#### Line 631-650: Weakness Generation
- [ ] Method: `generateWeaknesses(powerlevel_id, keep_duplicates)`
- [ ] Skip if powerlevel_id === 1 (Normal)
- [ ] Roll 2 weaknesses (type 3)
- [ ] Respect keep_duplicates flag
- [ ] Store weaknesses array

#### Line 651-670: CP Caps & Damage Cap
- [ ] Method: `calculateCaps(total_cp)`
- [ ] BC Cap = (total_cp / 5) + 10 rounded
- [ ] Ability Cap = (total_cp / 5) rounded
- [ ] Damage Cap = (total_cp / 12.5) + 3 rounded

#### Line 671-690: To-Hit Bonuses
- [ ] Method: `calculateToHitBonuses()`
- [ ] AG To-Hit = AG Save + 3
- [ ] IN To-Hit = IN Save + 3
- [ ] CL To-Hit = CL Save + 3

#### Line 691-700: Main Generation Method
- [ ] Method: `generate()`
- [ ] Call all resolution methods in correct order
- [ ] Return complete character object

### Tests - Each Section
- [ ] Power level 1-4 resolution
- [ ] Side D3 roll
- [ ] Foreigner → known region
- [ ] Stranger → lost region + species lookup
- [ ] Anachronism → time period + species lookup
- [ ] Alien → world + species lookup
- [ ] Extra-Dimensional → dimension + species lookup
- [ ] Species D100 roll + cp_adjustment
- [ ] Culture defaults to Modern
- [ ] 5 unique characteristic stats
- [ ] Correct BC lookup for stats
- [ ] Weight reasonable for gender/age
- [ ] 3 backgrounds generated
- [ ] 2 motivations (or 0 if Neutral)
- [ ] 6 abilities for Non-Normal (0 for Normal)
- [ ] 2 weaknesses for Non-Normal (0 for Normal)
- [ ] CP caps calculated correctly

### Tests - Integration
- [ ] Full character generation with all nulls (full random)
- [ ] Full character generation with all parameters specified
- [ ] Random generation produces valid stats (BC 8-20)
- [ ] Output matches Python API (spot-check 5 samples)

---

## 📋 PHASE 3.4: UI INTEGRATION (1 day)

### Modify `index.html`
- [ ] Add form submit event listener
- [ ] Collect all 18 preset parameters from form
- [ ] Call CharacterGenerator

### Modify `src/app.js`
- [ ] Import DiceRoller
- [ ] Import CharacterGenerator
- [ ] Add submitCharacterForm() handler
- [ ] Display generated character in UI
- [ ] Save character to localStorage
- [ ] Show success message

### Modify `less/mpgen.less`
- [ ] Style character display section (if needed)
- [ ] Style results panel
- [ ] Add animation for character reveal

---

## 📋 PHASE 3.5: CONDITIONAL FIELDS (1-2 days)

### Show/Hide Regional Fields
- [ ] Add JavaScript listener to birthplaceSelect
- [ ] Show/hide regional dropdowns:
  - [ ] known_region (if "Foreigner")
  - [ ] lost_region (if "Stranger")
  - [ ] time_period (if "Anachronism")
  - [ ] other_world (if "Alien")
  - [ ] other_dimension (if "Extra-Dimensional")
- [ ] All fields hidden by default

### Test
- [ ] Each birthplace triggers correct region field
- [ ] Only one region field shown at a time
- [ ] Hidden fields excluded from generation

---

## 📋 TESTING SUITE (2-3 days)

### Unit Tests
- [ ] DiceRoller: 10 test cases
- [ ] CharacterGenerator: 25+ test cases
- [ ] DataStore queries: 15 test cases

### Integration Tests
- [ ] 50 random character generations
- [ ] 50 specified character generations
- [ ] Verify no duplicates in 100+ generation sample

### Validation Tests
- [ ] BC never exceeds cap
- [ ] Abilities match power level
- [ ] All 18 parameters honored
- [ ] No data missing from output

### Browser Tests
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

### Performance Tests
- [ ] Character generation < 500ms (including data load)
- [ ] 10 sequential generations complete < 5s
- [ ] Memory usage < 50 MB

---

## 📋 SUCCESS CRITERIA

✅ **Phase 3 Complete When:**

- [ ] All 19 JSON files extracted and committed
- [ ] DiceRoller module passes all unit tests
- [ ] CharacterGenerator produces identical output to Python (5 sample verification)
- [ ] All 18 parameters work correctly
- [ ] Conditional birthplace fields show/hide correctly
- [ ] 50+ characters generated with no errors
- [ ] Characters persist to localStorage
- [ ] Browser console clean (zero errors/warnings)
- [ ] Performance meets <500ms target
- [ ] Code review passed
- [ ] PLAN.md updated to 85%+ (Phase 3 complete)

---

## 📋 DOCUMENTATION

- [ ] Update PLAN.md with Phase 3 progress weekly
- [ ] Create API_REFERENCE.md for CharacterGenerator
- [ ] Create DATA_FORMAT.md for JSON structure
- [ ] Create TESTING.md for test cases

---

## 📊 Timeline Estimate

| Phase | Duration | Status |
|-------|----------|--------|
| 3.1 Data Extraction | 2 days | 🔵 Pending |
| 3.2 DiceRoller | 1 day | 🔵 Pending |
| 3.2 DataStore Queries | 1 day | 🔵 Pending |
| 3.3 CharacterGenerator | 3-4 days | 🔵 Pending |
| 3.4 UI Integration | 1 day | 🔵 Pending |
| 3.5 Conditional Fields | 1-2 days | 🔵 Pending |
| Testing & Validation | 2-3 days | 🔵 Pending |
| **Total** | **12-14 days** | 🔵 **4 weeks (4-5 work periods)** |

---

**Checklist Status:** Ready for Phase 3.1 Kickoff  
**Next Action:** Extract 19 JSON data files from Python database
