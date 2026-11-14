# Python → JavaScript Conversion Quick Reference

**Purpose:** Side-by-side comparison of Python and JavaScript patterns for character generator conversion

---

## 🎲 DICE ROLLING

### Python
```python
from random import randrange

def RollDice(dice):
    result = 0
    dice_split = dice.split("d")
    times = int(dice_split[0]) if dice_split[0] is not '' else 1
    sides = int(dice_split[1])
    for t in range(times):
        roll = randrange(1, sides+1)
        result += roll
    return result
```

### JavaScript
```javascript
function rollDice(notation) {
  let result = 0;
  const [times, sides] = notation.split('d').map((x, i) => {
    return i === 0 && x === '' ? 1 : parseInt(x);
  });
  
  for (let i = 0; i < times; i++) {
    result += Math.floor(Math.random() * sides) + 1;
  }
  return result;
}
```

**Key Differences:**
- `randrange(1, sides+1)` → `Math.floor(Math.random() * sides) + 1`
- `range(times)` → `for (let i = 0; i < times; i++)`
- Empty string check → ternary with default 1

---

## 🔍 DATABASE LOOKUPS

### Python - Direct ID Lookup
```python
obj = api.models.PowerLevel.objects.get(pk=self.powerlevel_id)
self.powerlevel = obj.power_level
self.total_cp = obj.total_cps
```

### JavaScript - Direct ID Lookup
```javascript
const powerLevel = dataStore.findById('powerlevels', character.powerlevel_id);
character.powerlevel = powerLevel.power_level;
character.total_cp = powerLevel.total_cps;
```

---

### Python - Range-Based Lookup (D100)
```python
roll = RollDice("d100")
obj = api.models.Species.objects.get(min_roll__lte=roll, max_roll__gte=roll)
self.species_id = obj.id
```

### JavaScript - Range-Based Lookup (D100)
```javascript
const roll = rollDice("d100");
const species = dataStore.findByRoll('species', roll);
character.species_id = species.id;
```

---

### Python - Contextual Lookup (Foreign Key + Range)
```python
roll = RollDice("d100")
obj = api.models.LostRegionSpecies.objects.get(
    region_id=region_id,
    min_roll__lte=roll,
    max_roll__gte=roll
)
self.species_id = obj.species_id
```

### JavaScript - Contextual Lookup (Foreign Key + Range)
```javascript
const roll = rollDice("d100");
const entry = dataStore.findByContextAndRoll(
  'lost_region_species',
  region_id,
  roll
);
character.species_id = entry.species_id;
```

---

### Python - Filtered Query
```python
abilities = api.models.SpeciesAbility.objects.filter(species_id=self.species_id)
for obj in abilities:
    if obj.cps < 0:
        self.racialweaknesses.append(...)
    else:
        self.racialabilities.append(...)
```

### JavaScript - Filtered Query
```javascript
const abilities = dataStore.filterByType(
  'species_abilities',
  'species_id',
  character.species_id
);
abilities.forEach(ability => {
  if (ability.cps < 0) {
    character.racialweaknesses.push(...);
  } else {
    character.racialabilities.push(...);
  }
});
```

---

### Python - Name Lookup
```python
obj = api.models.Culture.objects.get(culture_name="Modern")
self.culture_id = obj.id
```

### JavaScript - Name Lookup
```javascript
const modern = dataStore.findByName('cultures', 'Modern');
character.culture_id = modern.id;
```

---

## 🎯 NULL COALESCING

### Python
```python
if self.species_id == None:
    roll = RollDice("d100")
    obj = api.models.Species.objects.get(min_roll__lte=roll, max_roll__gte=roll)
    self.species_id = obj.id
else:
    obj = api.models.Species.objects.get(pk=self.species_id)
self.species = obj.species_name
```

### JavaScript
```javascript
if (!character.species_id) {
  const roll = rollDice("d100");
  character.species_id = dataStore.findByRoll('species', roll).id;
}
const species = dataStore.findById('species', character.species_id);
character.species = species.species_name;
```

**Pattern:** Check falsy, perform lookup, then use result

---

## 🔀 CONDITIONAL CASCADES

### Python Pattern
```python
if self.birthplace == "Foreigner":
    # Handle Foreigner path
elif self.birthplace == "Stranger":
    # Handle Stranger path
elif self.birthplace == "Anachronism":
    # Handle Anachronism path
else:
    # Handle default
```

### JavaScript Pattern
```javascript
switch(character.birthplace) {
  case 'Foreigner':
    // Handle Foreigner path
    break;
  case 'Stranger':
    // Handle Stranger path
    break;
  case 'Anachronism':
    // Handle Anachronism path
    break;
  default:
    // Handle default
}
```

**Alternative:** Separate methods for clarity
```javascript
const handleBirthplace = (birthplace, params) => {
  if (birthplace === 'Foreigner') return handleForeigner(params);
  if (birthplace === 'Stranger') return handleStranger(params);
  // ...
};
```

---

## 📝 ATTRIBUTE ASSIGNMENT

### Python
```python
self.powerlevel = obj.power_level
self.total_cp = obj.total_cps
self.cp_per_ability = 0
self.bc_start = 14
```

### JavaScript
```javascript
character.powerlevel = powerLevel.power_level;
character.total_cp = powerLevel.total_cps;
character.cp_per_ability = 0;
character.bc_start = 14;
```

---

## 📊 ARRAY/LIST OPERATIONS

### Python - Append & Check
```python
self.backgrounds = []
while len(self.backgrounds) < 3:
    roll = RollDice("d100")
    obj = api.models.Background.objects.get(min_roll__lte=roll, max_roll__gte=roll)
    if (self.keep_duplicates) or (obj.background not in self.backgrounds):
        self.backgrounds.append(obj.background)
```

### JavaScript - Push & Check
```javascript
character.backgrounds = [];
while (character.backgrounds.length < 3) {
  const roll = rollDice("d100");
  const background = dataStore.findByRoll('backgrounds', roll);
  if (character.keep_duplicates || 
      !character.backgrounds.includes(background.background)) {
    character.backgrounds.push(background.background);
  }
}
```

---

## 🔢 INTEGER CONVERSION

### Python
```python
if powerlevel_id is not None and powerlevel_id.isnumeric():
    self.powerlevel_id = int(self.powerlevel_id)
```

### JavaScript
```javascript
if (powerlevel_id !== null && powerlevel_id !== undefined) {
  character.powerlevel_id = parseInt(powerlevel_id, 10);
}
```

---

## ➕ MATH OPERATIONS

### Python
```python
self.move = round((self.strength + self.endurance + self.agility)/3)
self.inventing_points = round((self.intelligence/2) + .5)
self.power = self.strength + self.endurance + self.agility + self.intelligence
```

### JavaScript
```javascript
character.move = Math.round(
  (character.strength + character.endurance + character.agility) / 3
);
character.inventing_points = Math.round((character.intelligence / 2) + 0.5);
character.power = character.strength + character.endurance + 
                  character.agility + character.intelligence;
```

---

## 🔍 FINDING CLOSEST VALUE

### Python
```python
closest_lower = api.models.BCDetail.objects.filter(
    carrying_capacity_st__lte=half_massed
).order_by('-carrying_capacity_st').first()

closest_higher = api.models.BCDetail.objects.filter(
    carrying_capacity_st__gte=half_massed
).order_by('carrying_capacity_st').first()

if (closest_higher.carrying_capacity_st - half_massed) < \
   abs(closest_lower.carrying_capacity_st - half_massed):
    self.mass = closest_higher.base_hth_damage_st
else:
    self.mass = closest_lower.base_hth_damage_st
```

### JavaScript
```javascript
const bcDetails = dataStore.getAll('bc_details');

const closestLower = [...bcDetails]
  .filter(bc => bc.carrying_capacity_st <= halfMassed)
  .sort((a, b) => b.carrying_capacity_st - a.carrying_capacity_st)[0];

const closestHigher = [...bcDetails]
  .filter(bc => bc.carrying_capacity_st >= halfMassed)
  .sort((a, b) => a.carrying_capacity_st - b.carrying_capacity_st)[0];

const diffHigher = closestHigher.carrying_capacity_st - halfMassed;
const diffLower = Math.abs(closestLower.carrying_capacity_st - halfMassed);

character.mass = diffHigher < diffLower 
  ? closestHigher.base_hth_damage_st 
  : closestLower.base_hth_damage_st;
```

---

## 🛡️ TRY-EXCEPT HANDLING

### Python
```python
try:
    obj = api.models.OtherDimensionSpecies.objects.get(dimension_id=dim_id)
except:
    obj = api.models.Species.objects.get(species_name="Choose (Other Dimension)")
    self.species_id = obj.id
```

### JavaScript
```javascript
try {
  const species = dataStore.findByContextId('other_dimension_species', dim_id);
  // Use species...
} catch (e) {
  const chooseSpecies = dataStore.findByName('species', 'Choose (Other Dimension)');
  character.species_id = chooseSpecies.id;
}
```

**Alternative without throw:**
```javascript
let species = dataStore.findByContextIdOrNull('other_dimension_species', dim_id);
if (!species) {
  species = dataStore.findByName('species', 'Choose (Other Dimension)');
  character.species_id = species.id;
}
```

---

## 📤 SERIALIZATION

### Python (Django REST Framework)
```python
serializer = CharacterSerializer(char)
return Response(serializer.data)
```

### JavaScript
```javascript
// Character object already serializable
const characterData = {
  powerlevel: character.powerlevel,
  side: character.side,
  birthplace: character.birthplace,
  // ... all properties
};

// Return as JSON
return JSON.stringify(characterData);

// Or directly save to state
this.stateManager.setState('currentCharacter', character);
```

---

## 🔗 CLASS INITIALIZATION

### Python
```python
class Character(object):
    def __init__(self, powerlevel_id, side_id, ...):
        self.powerlevel_id = powerlevel_id
        self.side_id = side_id
        # ...

char = Character(powerlevel_id, side_id, ...)
char.Generate()
```

### JavaScript
```javascript
class CharacterGenerator {
  constructor(parameters, dataStore) {
    this.parameters = parameters;
    this.dataStore = dataStore;
    this.character = {};
  }

  generate() {
    // ...
    return this.character;
  }
}

const gen = new CharacterGenerator(parameters, dataStore);
const character = gen.generate();
```

---

## 🧪 ASSERTION/VALIDATION

### Python (implicit)
```python
assert self.strength >= 8 and self.strength <= 20
assert len(self.abilities) == 6  # For non-Normal
assert len(self.weaknesses) == 2  # For non-Normal
```

### JavaScript
```javascript
console.assert(character.strength >= 8 && character.strength <= 20,
  'Strength out of range');
console.assert(character.abilities.length === 6,
  'Abilities count incorrect for power level');
console.assert(character.weaknesses.length === 2,
  'Weaknesses count incorrect for power level');
```

---

## 📋 CONVERSION CHECKLIST

When converting a Python method to JavaScript:

- [ ] Identify all database lookups
- [ ] Map to DataStore query methods
- [ ] Convert loop syntax
- [ ] Convert conditional syntax
- [ ] Convert list/array operations
- [ ] Convert math operations
- [ ] Handle None/null values
- [ ] Preserve order of assignments (critical!)
- [ ] Add comments for complex logic
- [ ] Test with sample data
- [ ] Verify output matches Python

---

**Last Updated:** November 13, 2024  
**For Phase 3:** Data File Extraction & JavaScript Module Translation
