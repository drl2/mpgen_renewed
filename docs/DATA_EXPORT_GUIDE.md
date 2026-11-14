# Data Export & Migration Guide

## Database Tables Inventory

The MPGEN database contains **31 tables** with the following structure:

### Core Configuration Tables (Load-Once Data)

| Table | Rows | Purpose |
|-------|------|---------|
| api_powerlevel | 4 | Power levels (Normal, Low, Standard, High) |
| api_side | 3 | Character sides/alignment (Good, Neutral, Evil) |
| api_birthplace | 6 | Birthplace options (with roll ranges) |
| api_species | 23 | Character species/races |
| api_culture | 8 | Character cultures |
| api_genderidentity | 3 | Gender identities |
| api_genderexpression | 4 | Gender expressions |
| api_biologicalsex | 3 | Biological sex options |
| api_sexualattraction | 4 | Sexual attraction options |
| api_motivation | 26 | Character motivations |
| api_origintype | 7 | Origin types for background |
| api_knownregion | 51 | Known world regions |
| api_lostregion | 7 | Lost world regions |
| api_otherworld | 10 | Other worlds/dimensions |
| api_otherdimension | 7 | Alternate dimensions |
| api_timeperiod | 14 | Time periods |
| api_stat | 5 | Character statistics definitions |
| api_ability | 126 | Ability definitions |
| api_abilitytype | 4 | Ability type categories |
| api_background | 23 | Background options |
| api_bodytype | 5 | Body type options |
| api_weightroll | 15 | Weight roll data |

### Relationship/Lookup Tables

| Table | Rows | Purpose |
|-------|------|---------|
| api_speciesability | 41 | Maps species → abilities |
| api_lostregionspecies | 12 | Maps lost region → species |
| api_lostregionculture | 10 | Maps lost region → culture |
| api_otherworldspecies | 17 | Maps other world → species |
| api_otherworldculture | 10 | Maps other world → culture |
| api_otherdimensionspecies | 5 | Maps other dimension → species |
| api_otherdimensionculture | 2 | Maps other dimension → culture |
| api_timeperiodspecies | 26 | Maps time period → species |
| api_timeperiodculture | 28 | Maps time period → culture |
| api_bcpowerlevelminmax | 4 | Battle Class ranges per power level |
| api_bcdetail | 35 | Battle Class detail calculations |

**Total: 31 Tables, ~385 Configuration Rows**

---

## Data Export Strategy

### Option 1: Full SQLite to JSON Export

```bash
# Export entire database to JSON format
python3 << 'EOF'
import sqlite3
import json
from datetime import datetime

conn = sqlite3.connect('db.sqlite3')
conn.row_factory = sqlite3.Row
cursor = conn.cursor()

data = {}

# Get all tables starting with 'api_'
cursor.execute("SELECT name FROM sqlite_master WHERE type='table' AND name LIKE 'api_%' ORDER BY name")
tables = [row[0] for row in cursor.fetchall()]

for table in tables:
    cursor.execute(f"SELECT * FROM {table}")
    rows = cursor.fetchall()
    table_name = table.replace('api_', '')
    
    data[table_name] = []
    for row in rows:
        data[table_name].append(dict(row))

conn.close()

# Write to JSON file
with open('mpgen_data.json', 'w') as f:
    json.dump(data, f, indent=2)

print(f"Exported {len(tables)} tables to mpgen_data.json")
EOF
```

### Option 2: Selective Table Export

Export only essential tables (reduces file size):

```python
essential_tables = [
    'api_powerlevel',
    'api_side',
    'api_birthplace',
    'api_species',
    'api_culture',
    'api_genderidentity',
    'api_genderexpression',
    'api_biologicalsex',
    'api_sexualattraction',
    'api_motivation',
    'api_origintype',
    'api_knownregion',
    'api_lostregion',
    'api_otherworld',
    'api_otherdimension',
    'api_timeperiod',
    'api_stat',
    'api_ability',
    'api_speciesability',
    'api_lostregionspecies',
    'api_lostregionculture',
    'api_otherworldspecies',
    'api_otherworldculture',
    'api_otherdimensionspecies',
    'api_otherdimensionculture',
    'api_timeperiodspecies',
    'api_timeperiodculture',
    'api_bcpowerlevelminmax',
    'api_bcdetail',
]
```

### Option 3: Organized JSON Structure

Instead of flat table export, organize by concept:

```json
{
  "powerLevels": [
    {
      "id": 1,
      "name": "Normal",
      "totalCps": 100,
      "perAbilityCp": 0,
      "bcStart": 14
    }
  ],
  "sides": [
    { "id": 1, "name": "Good" },
    { "id": 2, "name": "Neutral" },
    { "id": 3, "name": "Evil" }
  ],
  "birthplaces": [...],
  "species": [
    {
      "id": 1,
      "name": "Human",
      "cpAdjustment": 0,
      "abilities": [
        { "id": 5, "name": "Extra CP", "cps": 10 }
      ]
    }
  ],
  "genders": {
    "identities": [...],
    "expressions": [...],
    "biologicalSexes": [...],
    "sexualAttractions": [...]
  },
  "regions": {
    "known": [...],
    "lost": [...],
    "otherWorlds": [...],
    "otherDimensions": [...]
  },
  "timePeriods": [...],
  "stats": [...],
  "lookupTables": {
    "speciesAbilities": {...},
    "lostRegionSpecies": {...},
    "lostRegionCultures": {...},
    ...
  }
}
```

---

## Recommended Export Format for New SPA

### Directory Structure

```
src/
├── data/
│   ├── index.js              # Main data loader
│   ├── powerLevels.json      # Power level definitions
│   ├── sides.json            # Side/alignment options
│   ├── birthplaces.json      # Birthplace options
│   ├── species.json          # Species with abilities
│   ├── cultures.json         # Cultures
│   ├── genders.json          # All gender-related options
│   ├── regions.json          # Known, lost, other worlds, dimensions
│   ├── timePeriods.json      # Time period options
│   ├── stats.json            # Stat definitions
│   ├── abilities.json        # All abilities
│   ├── lookups.json          # Lookup tables (species→abilities, etc.)
│   └── bcRanges.json         # Battle class ranges
```

### Sample Data Structure (species.json)

```json
[
  {
    "id": 1,
    "name": "Human",
    "minRoll": 1,
    "maxRoll": 30,
    "cpAdjustment": 0,
    "extraCpAsNormal": 0,
    "abilities": [
      {
        "id": 101,
        "name": "Bonus CP",
        "cps": 5,
        "minRoll": null,
        "maxRoll": null
      },
      {
        "id": 102,
        "name": "Extra Skill",
        "cps": 3,
        "minRoll": 1,
        "maxRoll": 50
      }
    ]
  },
  {
    "id": 2,
    "name": "Alien",
    "minRoll": 31,
    "maxRoll": 60,
    "cpAdjustment": 5,
    "extraCpAsNormal": 1,
    "abilities": [...]
  }
]
```

### Sample Data Loader (src/data/index.js)

```javascript
// src/data/index.js

let data = null;

async function loadData() {
  if (data) return data; // Cache

  try {
    const powerLevels = await fetch('/data/powerLevels.json').then(r => r.json());
    const sides = await fetch('/data/sides.json').then(r => r.json());
    const birthplaces = await fetch('/data/birthplaces.json').then(r => r.json());
    const species = await fetch('/data/species.json').then(r => r.json());
    const cultures = await fetch('/data/cultures.json').then(r => r.json());
    const genders = await fetch('/data/genders.json').then(r => r.json());
    const regions = await fetch('/data/regions.json').then(r => r.json());
    const timePeriods = await fetch('/data/timePeriods.json').then(r => r.json());
    const stats = await fetch('/data/stats.json').then(r => r.json());
    const abilities = await fetch('/data/abilities.json').then(r => r.json());
    const lookups = await fetch('/data/lookups.json').then(r => r.json());
    const bcRanges = await fetch('/data/bcRanges.json').then(r => r.json());

    data = {
      powerLevels,
      sides,
      birthplaces,
      species,
      cultures,
      genders,
      regions,
      timePeriods,
      stats,
      abilities,
      lookups,
      bcRanges,
    };

    return data;
  } catch (error) {
    console.error('Failed to load data:', error);
    throw error;
  }
}

export { loadData };
```

---

## Field Mapping Reference

### From SQLite to JavaScript

| Django Model Field | Python Type | JavaScript Type | Notes |
|-------------------|------------|-----------------|-------|
| AutoField (id) | int | number | Primary key |
| CharField | string | string | Text field |
| IntegerField | int | number | Integer |
| BooleanField | bool | boolean | True/False |
| ForeignKey | int | number | References another table ID |
| ManyToMany | - | array | Join table (separate in JSON) |

### Key Field Mappings

```
Django Model: api_powerlevel
  id → id (number)
  power_level → name (string)
  core_ability_cps → coreAbilityCps (number)
  bc_points → bcPoints (number)
  total_cps → totalCps (number)

Django Model: api_species
  id → id (number)
  min_roll → minRoll (number)
  max_roll → maxRoll (number)
  species_name → name (string)
  cp_adjustment → cpAdjustment (number)
  extra_cp_as_normal → extraCpAsNormal (number)
  abilities → (via api_speciesability join table)
```

---

## Lookup Table Export

Create a reverse-lookup structure for efficient queries:

```json
{
  "speciesByAbility": {
    "101": [1, 3, 5],  // ability 101 is available for species [1, 3, 5]
    "102": [2, 4]
  },
  
  "speciesByRegion": {
    "lost": {
      "1": [5, 6, 7],  // in lost region 1, can choose species [5, 6, 7]
      "2": [8, 9]
    },
    "known": "all",    // all species available in known regions
    "other_worlds": {...},
    "other_dimensions": {...}
  },
  
  "culturesByRegion": {
    "lost": {...},
    "other_worlds": {...},
    "other_dimensions": {...},
    "time_periods": {...}
  },
  
  "culturesBySpecies": {
    "1": ["human", "alien"],
    "2": ["alien", "robot"]
  }
}
```

---

## Generation Algorithm Data Requirements

For translating Character.Generate() to JavaScript:

### Required at Runtime
1. Selected power level → look up total_cp, cp_per_ability, bc_start
2. Selected species → look up abilities, cp_adjustment
3. Selected birthplace → determine if "Foreigner" (needs region lookup)
4. Selected region/world/dimension/time period → look up available species/cultures
5. All rolled attributes → look up by min_roll/max_roll range

### Data Access Patterns
- **By ID:** Find species by ID → lookup species object
- **By ID Range:** Find birthplace → roll d100, match to min_roll ≤ roll ≤ max_roll
- **By Foreign Key:** Find abilities for species → filter ability entries by species_id
- **Conditional Filter:** Find cultures for region → lookup in relationship table

---

## Export Command

### Complete Export Script

```bash
#!/bin/bash
# export_data.sh

cd /mnt/AAD0BF13D0BEE4AB/Projects/Python/mpgen

python3 << 'PYTHON_EOF'
import sqlite3
import json
import os

conn = sqlite3.connect('db.sqlite3')
conn.row_factory = sqlite3.Row

def export_table(table_name):
    cursor = conn.cursor()
    cursor.execute(f"SELECT * FROM {table_name}")
    rows = cursor.fetchall()
    return [dict(row) for row in rows]

# Create output directory
os.makedirs('../../mpgen_renewed/src/data', exist_ok=True)

# Map API tables to output JSON files
exports = {
    'powerLevels': 'api_powerlevel',
    'sides': 'api_side',
    'birthplaces': 'api_birthplace',
    'species': 'api_species',
    'cultures': 'api_culture',
    'genders': 'api_genderidentity',  # Will combine all gender tables
    'motivations': 'api_motivation',
    'originTypes': 'api_origintype',
    'knownRegions': 'api_knownregion',
    'lostRegions': 'api_lostregion',
    'otherWorlds': 'api_otherworld',
    'otherDimensions': 'api_otherdimension',
    'timePeriods': 'api_timeperiod',
    'stats': 'api_stat',
    'abilities': 'api_ability',
    'speciesAbilities': 'api_speciesability',
    'lostRegionSpecies': 'api_lostregionspecies',
    'lostRegionCultures': 'api_lostregionculture',
    'otherWorldSpecies': 'api_otherworldspecies',
    'otherWorldCultures': 'api_otherworldculture',
    'otherDimensionSpecies': 'api_otherdimensionspecies',
    'otherDimensionCultures': 'api_otherdimensionculture',
    'timeperiodSpecies': 'api_timeperiodspecies',
    'timeperiodCultures': 'api_timeperiodculture',
    'bcPowerLevelMinMax': 'api_bcpowerlevelminmax',
    'bcDetails': 'api_bcdetail',
}

for output_file, table in exports.items():
    data = export_table(table)
    with open(f'../../mpgen_renewed/src/data/{output_file}.json', 'w') as f:
        json.dump(data, f, indent=2)
    print(f"Exported {table} → {output_file}.json ({len(data)} rows)")

conn.close()
print("\nData export complete!")
PYTHON_EOF
```

---

## Next Steps

1. **Run export script** to generate JSON data files
2. **Verify JSON structure** - ensure all relationships are correct
3. **Create data loader** - load all JSON files on app startup
4. **Test lookups** - verify species/culture selection logic
5. **Integrate with character generator** - use loaded data instead of API calls

---

## Estimated File Sizes

```
powerLevels.json:           ~1 KB
sides.json:                 ~0.2 KB
birthplaces.json:           ~0.5 KB
species.json:               ~20 KB (includes abilities)
cultures.json:              ~1 KB
genders.json:               ~2 KB
regions.json:               ~30 KB (known + lost + other)
timePeriods.json:           ~2 KB
stats.json:                 ~1 KB
abilities.json:             ~15 KB
lookups.json:               ~25 KB
bcRanges.json:              ~3 KB
───────────────────────────────────
Total:                      ~100 KB (uncompressed)
                            ~25 KB (gzipped)
```

---

**Status:** Ready for data export execution in next phase
