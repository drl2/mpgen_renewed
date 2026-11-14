import { CharacterGenerator } from './src/character-generator.js';
import { DiceRoller } from './src/diceroller.js';

class DataLoader {
  constructor() {
    this.cache = {};
  }

  async loadData() {
    // Simplified - just test the structure
    this.cache = {
      stat: [
        { abbrev: 'ST', min_roll: 1, max_roll: 2 },
        { abbrev: 'EN', min_roll: 3, max_roll: 4 },
        { abbrev: 'AG', min_roll: 5, max_roll: 6 },
        { abbrev: 'IN', min_roll: 7, max_roll: 8 },
        { abbrev: 'CL', min_roll: 9, max_roll: 10 }
      ],
      background: [
        { min_roll: 1, max_roll: 100, background: 'Test Background' }
      ]
    };
  }

  findByRoll(tableName, roll) {
    const table = this.cache[tableName];
    if (!table || !Array.isArray(table)) return null;
    return table.find(record => record.min_roll <= roll && roll <= record.max_roll) || null;
  }

  findByContextAndRoll(tableName, contextId, roll) {
    return null; // Simplified
  }

  findById(tableName, id) {
    return null; // Simplified
  }

  filterByField(tableName, field, value) {
    return [];
  }
}

async function test() {
  const loader = new DataLoader();
  await loader.loadData();
  
  const gen = new CharacterGenerator(loader);
  const params = {
    powerlevelId: null,
    sideId: null,
    birthplaceId: null,
    speciesId: null,
    cultureId: null,
    genderIdentityId: null,
    genderExpressionId: null,
    biologicalSexId: null,
    sexualAttractionId: null,
    keepDuplicates: false,
    motivationId: null,
    originTypeId: null,
    lostRegionId: null,
    knownRegionId: null,
    otherWorldId: null,
    otherDimensionId: null,
    timePeriodId: null
  };

  console.log('Testing character generation...');
  console.time('generation');
  
  try {
    const char = await gen.generate(params);
    console.log('✓ Generation completed successfully');
    console.log('Character generated:', char.powerlevelId ? 'Yes' : 'No');
  } catch (error) {
    console.error('✗ Generation failed:', error.message);
  }

  console.timeEnd('generation');
}

test();
