# Phase 3: Python API Service Logic Analysis

**Status:** COMPLETE - Ready for JavaScript conversion  
**Date:** November 13, 2024  
**Scope:** Identify all service logic that must be translated from Python to JavaScript

---

## 📋 Executive Summary

The legacy MPGEN Python API consists of three core service modules that handle character generation, data retrieval, and Excel export. This analysis identifies all business logic, algorithms, and data workflows that need JavaScript equivalents for Phase 3.

**Key Finding:** The character generation algorithm is complex with 350+ lines of conditional logic, but highly structured and amenable to direct translation.

---

## 1. Core Service Modules

### 1.1 DiceRoller (`diceroller.py`)

**Purpose:** Random number generation for game mechanics  
**Complexity:** ⭐ Simple

**Python Implementation:**
```python
def RollDice(dice):
    """Roll NdX dice"""
    result = 0
    dice_split = dice.split("d")
    times = int(dice_split[0]) if dice_split[0] is not '' else 1
    sides = int(dice_split[1])
    for t in range(times):
        roll = randrange(1, sides+1)
        result += roll
    return result
```

**Required Behaviors:**
- Parse dice notation (e.g., "2d10", "d4", "d100")
- Roll specified number of dice with specified sides
- Return sum of rolls
- Default to 1 die if count not specified

**JavaScript Conversion Strategy:** Straightforward 1:1 mapping

**Test Cases:**
- `rollDice("d4")` → Returns 1-4
- `rollDice("2d10")` → Returns 2-20
- `rollDice("d100")` → Returns 1-100
- `rollDice("5d6")` → Returns 5-30

---

### 1.2 Character Generator (`character.py`)

**Purpose:** Main character generation algorithm  
**Complexity:** ⭐⭐⭐⭐⭐ Very Complex (350+ lines)

**High-Level Algorithm Flow:**

```
1. Initialize with user selections (18 parameters)
2. Resolve Power Level → BC start, CP totals, CP per ability
3. Resolve Side → Hero/Villain/Neutral classification
4. Resolve Birthplace → Conditional cascades:
   - Foreigner → Known Region (5 options)
   - Stranger → Lost Region (species/culture lookup)
   - Anachronism → Time Period (species/culture lookup)
   - Alien → Other World (species/culture lookup)
   - Extra-Dimensional → Other Dimension (species/culture lookup)
5. Resolve Species → CP adjustments, racial abilities/weaknesses
6. Resolve Culture → Default to "Modern" if not set
7. Generate Age → 2d10 + 10
8. Generate Gender/Sexuality (4 separate rolls):
   - Gender Identity → short form
   - Gender Expression → short form
   - Biological Sex → short form
   - Sexual Attraction → short form
9. Generate Characteristic Stats (5 unique rolls):
   - Strength, Endurance, Agility, Intelligence, Cool
   - Each starts at bc_start, decrements by 2 per stat
10. Calculate Derived Stats from BC Detail table:
    - Hit points, Saves, Healing Rate, Initiative
11. Calculate Calculated Stats:
    - Power, Physical Defense, Mental Defense, Movement
12. Generate Weight/Mass based on gender and age
13. Generate 3 Backgrounds (with duplicate handling)
14. Generate 2 Motivations (if not Neutral, with duplicate handling)
15. Resolve Origin Type → d100 roll
16. Generate 6 Abilities total:
    - 2 Offensive (type 1)
    - 2 Defensive (type 2)
    - 2 Miscellaneous (type 4)
17. Generate 2 Weaknesses (type 3)
18. Calculate Caps:
    - BC Cap, Ability Cap, Damage Cap
19. Calculate To-Hit bonuses (Agility, Intelligence, Cool)
```

**Key Parameters (18 total):**

| Category | Parameter | Type | Notes |
|----------|-----------|------|-------|
| Power Level | powerlevel_id | int/string | D4 roll if null |
| Alignment | side_id | int | D3 roll if null |
| Society | motivation_id | int | D100 roll per side if null |
| Society | origin_type_id | int | D100 roll if null |
| Birthplace | birthplace_id | int | D100 roll if null |
| Regional | known_region_id | int | D100 if birthplace="Foreigner" |
| Regional | lost_region_id | int | D100 if birthplace="Stranger" |
| Regional | time_period_id | int | D100 if birthplace="Anachronism" |
| Regional | other_world_id | int | D100 if birthplace="Alien" |
| Regional | other_dimension_id | int | D100 if birthplace="Extra-Dimensional" |
| Biology | species_id | int | D100 roll per birthplace context |
| Biology | culture_id | int | D100 roll if null; default "Modern" |
| Gender | gender_identity_id | int | D100 roll if null |
| Gender | gender_expression_id | int | D100 roll if null |
| Gender | biological_sex_id | int | D100 roll if null |
| Gender | sexual_attraction_id | int | D100 roll if null |
| Options | keep_duplicates | bool | Allow repeat values in lists |

**Conditional Logic Tree:**

```
Birthplace Selection (d100 roll used to lookup)
├─ Foreigner
│  └─ Known Region (d100 if not specified)
├─ Stranger
│  ├─ Lost Region (d100 if not specified)
│  ├─ Species lookup: LostRegionSpecies (d100)
│  └─ Culture lookup: LostRegionCulture (d100)
├─ Anachronism
│  ├─ Time Period (d100 if not specified)
│  ├─ Species lookup: TimePeriodSpecies (d100)
│  └─ Culture lookup: TimePeriodCulture (d100)
├─ Alien
│  ├─ Other World (d100 if not specified)
│  ├─ Species lookup: OtherWorldSpecies (d100)
│  └─ Culture lookup: OtherWorldCulture (d100)
├─ Extra-Dimensional
│  ├─ Other Dimension (d100 if not specified)
│  ├─ Species lookup: OtherDimensionSpecies (d100)
│  └─ Culture lookup: OtherDimensionCulture (d100)
└─ Default (Earth/Common Birthplace)
   ├─ Species (d100 if not set)
   └─ Culture (default "Modern" if not set)
```

**Conversion Challenges:**

1. **Database Lookups**: Python uses Django ORM; JavaScript needs equivalent lookups
   - Range-based lookups: `min_roll <= value <= max_roll`
   - Foreign key joins: Species → SpeciesAbility relationships
   - Filtered queries: region-specific species/cultures

2. **Complex Conditional Logic**: 40+ nested if/elif conditions
   - Requires careful mapping to JavaScript switch/if chains
   - Maintain Python logic structure for auditability

3. **Side Effects**: Multiple attribute assignments within conditionals
   - Must preserve variable mutation order for correctness

4. **Data Dependencies**: Some rolls depend on earlier results
   - Species lookup depends on birthplace context (region_id, time_period_id, etc.)

---

### 1.3 Character Sheet Maker (`charsheetmaker.py`)

**Purpose:** Generate Excel export with character data  
**Complexity:** ⭐⭐ Moderate (Excel template manipulation)

**Current Functionality:**
- Takes character data JSON
- Takes selected motivation, background, abilities
- Populates Excel template with values
- Returns Excel file as HTTP response

**JavaScript Conversion Strategy:**
- Use existing library (e.g., ExcelJS, SheetJS) for Excel generation
- Requires Excel template file migration or recreation
- Phase 4 deliverable (not Phase 3)

---

## 2. Data Access Patterns

### 2.1 Lookup Tables (Range-Based)

These tables use min_roll/max_roll for D100 lookups:

| Table | Purpose | Lookup Type |
|-------|---------|------------|
| BirthPlace | Determine if Foreigner/Stranger/Anachronism/etc | D100 |
| KnownRegion | Foreigner regional selection | D100 |
| LostRegion | Stranger regional selection | D100 |
| TimePeriod | Anachronism time period | D100 |
| OtherWorld | Alien world selection | D100 |
| OtherDimension | Extra-Dimensional location | D100 |
| Species | Species selection (base or context-specific) | D100 |
| Stat | Characteristic stat assignment (D10) | D10 |
| Background | Background selection | D100 |
| Motivation | Motivation selection (filtered by side) | D100 |
| OriginType | Origin type selection | D100 |
| GenderIdentity | Gender identity selection | D100 |
| GenderExpression | Gender expression selection | D100 |
| BiologicalSex | Biological sex selection | D100 |
| SexualAttraction | Sexual attraction selection | D100 |
| Ability | Ability selection (filtered by type) | D100 |

### 2.2 Lookup Tables (Direct ID)

| Table | Purpose |
|-------|---------|
| PowerLevel | Power level stats (BC start, CP totals) |
| Side | Side name lookup |
| Culture | Culture name lookup |
| BCDetail | Derived stat calculations from BC score |
| SpeciesAbility | Species racial abilities/weaknesses |
| SpeciesAbility | Species racial abilities/weaknesses |
| LostRegionSpecies | Species options for lost regions |
| LostRegionCulture | Culture options for lost regions |
| TimePeriodSpecies | Species options for time periods |
| TimePeriodCulture | Culture options for time periods |
| OtherWorldSpecies | Species options for worlds |
| OtherWorldCulture | Culture options for worlds |
| OtherDimensionSpecies | Species options for dimensions |
| OtherDimensionCulture | Culture options for dimensions |

### 2.3 Lookup Patterns

**Range-Based Lookup Pattern:**
```javascript
// Given a D100 roll, find matching entry
function findByRoll(table, roll) {
  return table.find(entry => 
    entry.min_roll <= roll && roll <= entry.max_roll
  );
}
```

**Context-Specific Lookup Pattern:**
```javascript
// Given a context ID, find matching entries
function findByContext(table, contextId, roll) {
  return table.find(entry =>
    entry.context_id === contextId &&
    entry.min_roll <= roll && roll <= entry.max_roll
  );
}
```

---

## 3. Required JavaScript Modules

### 3.1 DiceRoller Module

**Needed Functions:**
- `rollDice(notation)` - Roll NdX notation

**Dependencies:** None (pure math)

### 3.2 CharacterGenerator Module

**Needed Functions:**
- `generateCharacter(parameters, dataStore)` - Main generation function
- `resolvePowerLevel(id, dataStore)` - Power level logic
- `resolveSide(id, dataStore)` - Side logic
- `resolveBirthplace(parameters, dataStore)` - Complex birthplace cascade
- `resolveSpecies(id, context, dataStore)` - Species resolution
- `resolveCulture(id, context, dataStore)` - Culture resolution
- `generateStats(powerlevelId, dataStore)` - Stat generation
- `derivedStats(characterData, dataStore)` - Calculated stats
- `generateAbilities(powerlevelId, dataStore)` - Ability selection
- `calculateCaps(totalCp)` - CP caps calculation

**Dependencies:**
- DiceRoller
- DataStore (all JSON data loaded via cache)

### 3.3 DataStore Module

**Already Exists:** DataLoader class in src/app.js

**Needed Enhancements:**
- Query methods for range lookups:
  - `findByRoll(tableName, roll)` 
  - `findByContextAndRoll(tableName, contextId, roll)`
  - `findById(tableName, id)`
  - `findByContextId(tableName, contextId)`
  - `filterByType(tableName, typeId)`
- Validation methods:
  - `validateDataStructure(tableName, data)`

---

## 4. Data File Structure Requirements

Based on Python models analysis, each JSON file should contain:

### 4.1 Range-Based Tables

**Structure:**
```json
[
  {
    "id": 1,
    "min_roll": 1,
    "max_roll": 25,
    "name": "Option Name",
    [other fields...]
  }
]
```

**Example: PowerLevels**
```json
[
  {
    "id": 1,
    "name": "Normal",
    "power_level": "Normal",
    "total_cps": 200
  },
  {
    "id": 2,
    "name": "Low",
    "power_level": "Low",
    "total_cps": 300
  },
  {
    "id": 3,
    "name": "Standard",
    "power_level": "Standard",
    "total_cps": 500
  },
  {
    "id": 4,
    "name": "High",
    "power_level": "High",
    "total_cps": 800
  }
]
```

**Example: Species with D100 Rolls**
```json
[
  {
    "id": 1,
    "name": "Human",
    "species_name": "Human",
    "cp_adjustment": 0,
    "extra_cp_as_normal": 0,
    "min_roll": 1,
    "max_roll": 55
  },
  {
    "id": 2,
    "name": "Alien",
    "species_name": "Alien",
    "cp_adjustment": 5,
    "extra_cp_as_normal": 10,
    "min_roll": 56,
    "max_roll": 85
  }
]
```

### 4.2 Contextual Tables (Region-Specific Species)

**Structure:**
```json
[
  {
    "id": 1,
    "region_id": 5,
    "min_roll": 1,
    "max_roll": 50,
    "species_id": 12,
    "culture_id": 8
  }
]
```

### 4.3 Simple Lists (No Rolls)

**Structure:**
```json
[
  {
    "id": 1,
    "name": "Option Name",
    [other fields...]
  }
]
```

---

## 5. Python-to-JavaScript Conversion Map

### DiceRoller

| Python | JavaScript | Complexity |
|--------|------------|-----------|
| `def RollDice(dice):` | `function rollDice(notation)` | ⭐ |
| `randrange(1, sides+1)` | `Math.floor(Math.random() * sides) + 1` | ⭐ |
| `dice.split("d")` | `notation.split("d")` | ⭐ |
| Loop with `range()` | Loop with `for` | ⭐ |

### CharacterGenerator

| Python | JavaScript | Complexity |
|--------|------------|-----------|
| Django ORM: `.objects.get(pk=id)` | Direct lookup: `dataStore.findById(table, id)` | ⭐⭐ |
| Django ORM: `.objects.filter()` | Array filter: `data.filter(entry => ...)` | ⭐⭐ |
| Range lookup: `objects.get(min_roll__lte=roll, max_roll__gte=roll)` | `dataStore.findByRoll(table, roll)` | ⭐⭐ |
| Class attributes: `self.attribute = value` | Object properties: `character.attribute = value` | ⭐ |
| List append: `list.append(item)` | Array push: `array.push(item)` | ⭐ |
| Conditional: `if obj.id == "12":` | Conditional: `if (objId === 12)` | ⭐ |

---

## 6. Phase 3 Implementation Roadmap

### Phase 3.1: Data File Extraction (1-2 days)
- Extract all 19 tables from Python database to JSON format
- Validate JSON structure against requirements
- Test lookups with sample queries

### Phase 3.2: JavaScript Module Translation (3-5 days)
- Translate DiceRoller (1 day)
- Translate CharacterGenerator (3-4 days)
- Create DataStore query methods (1 day)
- Build character object serializer

### Phase 3.3: Integration & Testing (2-3 days)
- Wire character generation to form submission
- Test with sample character generations
- Verify all 18 preset parameters work correctly
- Validate random generation produces valid characters

### Phase 3.4: Conditional Fields (1-2 days)
- Implement show/hide logic for birthplace regions
- Test all 5 conditional field scenarios

---

## 7. Known Complexities & Solutions

### 7.1 Database Relationships

**Challenge:** Python uses Django ForeignKey relationships; JavaScript needs equivalent lookups

**Solution:** Pre-load all data via DataLoader with cache; implement query methods that replicate Django ORM patterns

**Example - Species Lookup:**
```python
# Python
obj = api.models.LostRegionSpecies.objects.get(
  region_id=region_id,
  min_roll__lte=roll,
  max_roll__gte=roll
)
```

```javascript
// JavaScript
const entry = dataStore.findByContextAndRoll(
  'lost_region_species',
  region_id,
  roll
);
```

### 7.2 Null Coalescing & Defaults

**Challenge:** Python checks `if value == None:` then rolls/defaults; JavaScript needs similar patterns

**Solution:** Use JavaScript nullish coalescing and optional chaining

```python
# Python
if self.culture_id == None:
    obj = api.models.Culture.objects.get(culture_name="Modern")
    self.culture_id = obj.id
```

```javascript
// JavaScript
if (character.culture_id === null || character.culture_id === undefined) {
  const modern = dataStore.findByName('cultures', 'Modern');
  character.culture_id = modern.id;
}
```

### 7.3 Side-Effect Order

**Challenge:** Multiple conditional branches set attributes in specific order; changing order breaks calculations

**Solution:** Maintain exact Python control flow in JavaScript; add comments documenting order dependencies

**Example:**
```javascript
// Order matters: species_id must be set before looking up cp_adjustment
character.species_id = speciesId;
character.cp_per_ability += species.cp_adjustment;
```

---

## 8. Testing Strategy

### 8.1 Unit Tests (DiceRoller)
- Test dice notation parsing
- Test all dice types (d4, d6, d10, d20, d100, etc.)
- Test multi-dice notation (2d10, 3d6, etc.)
- Verify statistical distribution over 1000+ rolls

### 8.2 Integration Tests (CharacterGenerator)
- Generate 50 characters with all parameters null (full random)
- Generate 50 characters with specific selections
- Verify all 18 parameters accepted and used
- Verify no data missing in output

### 8.3 Validation Tests
- Verify BC caps are never exceeded
- Verify ability counts match power level (0 for Normal, 6 for others)
- Verify characteristic stats unique and between 8-20
- Verify gender string properly formatted
- Verify weight realistic for gender/age

### 8.4 Edge Cases
- Power level 1 (Normal) - special case with 0 abilities
- Alien with "Other" world - forces special species/culture
- Stranger with "Other" region - forces special species/culture
- Null side with no motivations generated
- Birthplace not Foreigner/Stranger/etc - uses base species/culture

---

## 9. Success Criteria

✅ **Phase 3 Complete When:**
1. All 19 JSON data files extracted and validated
2. JavaScript CharacterGenerator module produces identical output to Python (spot-check 5+ samples)
3. All 18 preset parameters accepted and used
4. Conditional fields show/hide correctly
5. Character data persists to localStorage
6. Browser console shows zero errors
7. Character generation completes in <500ms (including data loading)

---

## 10. Files to Modify/Create

### New Files (Phase 3)
- `src/diceroller.js` - Dice rolling utility (~20 lines)
- `src/character-generator.js` - Character generation logic (~400 lines)
- `src/data-store-queries.js` - Data lookup methods (~100 lines)
- `data/*.json` - 19 JSON files (~50 KB total)

### Existing Files (Modify)
- `src/app.js` - Add CharacterGenerator integration to form submission
- `index.html` - Wire form submit button to character generation

### Documentation
- `PHASE_3_PROGRESS.md` - Updated weekly with status

---

## 11. Risk Assessment

| Risk | Impact | Mitigation |
|------|--------|-----------|
| Complex conditionals | Bug-prone conversion | Code review, spot-check against Python output |
| Data file extraction errors | Wrong character stats | Validate JSON structure; test lookups |
| Database relationship confusion | Missing attributes | Create query methods matching Django patterns |
| Performance (50+ characters) | Slow generation | Profile and optimize; target <500ms |
| Browser compatibility | Features break | Test on major browsers (Chrome, Firefox, Safari, Edge) |

---

## 12. Next Steps

1. **Week 1:** Extract all 19 JSON data files from Python database
2. **Week 2:** Translate DiceRoller + CharacterGenerator modules
3. **Week 3:** Integrate with UI form; test 50+ character generations
4. **Week 4:** Implement conditional fields; finalize Phase 3

---

**Analysis Complete** ✅  
**Prepared for:** Phase 3.1 - Data File Extraction  
**Status:** Ready to proceed with JSON extraction
