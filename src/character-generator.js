/**
 * CharacterGenerator.js
 * 
 * Core character generation logic for MPGEN character generator.
 * Implements the complete 378-line Python character generation algorithm
 * as JavaScript methods.
 * 
 * Generation sequence:
 * 1. Power Level & BC starting points
 * 2. Side (Good, Evil, Neutral)
 * 3. Birthplace (triggers cascading region/species/culture logic)
 * 4. Species (with CP adjustments)
 * 5. Culture
 * 6. Gender/Sexuality (4 independent characteristics)
 * 7. Stats (5 chosen basic characteristics -> derived values)
 * 8. Weight/Mass calculation
 * 9. Backgrounds (3 selections)
 * 10. Motivations (context-dependent on Side)
 * 11. Origin Type
 * 12. Abilities & Weaknesses (context-dependent on Power Level)
 * 13. Caps & To-Hit calculations
 */

import { DiceRoller } from './diceroller.js';

export class CharacterGenerator {
  constructor(dataLoader) {
    this.dataLoader = dataLoader;
  }

  /**
   * Generate a complete character with given parameters
   * @param {Object} params - Character generation parameters
   * @param {number} params.powerlevelId - Power level ID (1-4 or null for random)
   * @param {number} params.sideId - Side ID (1-3 or null for random)
   * @param {number} params.birthplaceId - Birthplace ID (1-6 or null for random)
   * @param {number} params.speciesId - Species ID (or null for auto-determined)
   * @param {number} params.cultureId - Culture ID (or null for auto-determined)
   * @param {number} params.genderIdentityId - Gender identity ID (or null for random)
   * @param {number} params.genderExpressionId - Gender expression ID (or null for random)
   * @param {number} params.biologicalSexId - Biological sex ID (or null for random)
   * @param {number} params.sexualAttractionId - Sexual attraction ID (or null for random)
   * @param {boolean} params.keepDuplicates - Allow duplicate backgrounds/motivations
   * @param {number} params.motivationId - Motivation ID (or null for random)
   * @param {number} params.originTypeId - Origin type ID (or null for random)
   * @param {number} params.lostRegionId - Lost region ID (for conditional birthplace)
   * @param {number} params.knownRegionId - Known region ID (for conditional birthplace)
   * @param {number} params.otherWorldId - Other world ID (for conditional birthplace)
   * @param {number} params.otherDimensionId - Other dimension ID (for conditional birthplace)
   * @param {number} params.timePeriodId - Time period ID (for conditional birthplace)
   * @returns {Promise<Object>} - Generated character object
   */
  async generate(params) {
    const character = {};

    // === STEP 1: Power Level ===
    console.log('🎲 Phase 1: Power Level');
    character.powerlevelId = params.powerlevelId || null;
    if (!character.powerlevelId) {
      character.powerlevelId = DiceRoller.roll(1, 4); // d4
    }

    const powerLevelRecord = this.dataLoader.findById('powerlevel', character.powerlevelId);
    if (!powerLevelRecord) throw new Error(`Invalid power level ID: ${character.powerlevelId}`);

    character.powerlevel = powerLevelRecord.power_level;
    character.totalCp = powerLevelRecord.total_cps;

    // Set BC starting point based on power level
    let cpPerAbility, bcStart;
    switch (character.powerlevelId) {
      case 1: cpPerAbility = 0; bcStart = 14; break;   // Normal
      case 2: cpPerAbility = 10; bcStart = 16; break;  // Low
      case 3: cpPerAbility = 20; bcStart = 18; break;  // Standard
      case 4: cpPerAbility = 30; bcStart = 20; break;  // High
      default: throw new Error(`Invalid power level ID: ${character.powerlevelId}`);
    }
    character.cpPerAbility = cpPerAbility;
    character.bcStart = bcStart;

    // === STEP 2: Side ===
    console.log('🎲 Phase 2: Side');
    character.sideId = params.sideId || null;
    if (!character.sideId) {
      character.sideId = DiceRoller.roll(1, 3); // d3
    }

    const sideRecord = this.dataLoader.findById('side', character.sideId);
    if (!sideRecord) throw new Error(`Invalid side ID: ${character.sideId}`);
    character.side = sideRecord.side;

    // === STEP 3: Birthplace (Complex cascading logic) ===
    console.log('🎲 Phase 3: Birthplace');
    this._generateBirthplace(character, params);

    // === STEP 4: Species ===
    console.log('🎲 Phase 4: Species');
    this._generateSpecies(character, params);
    character.cpPerAbility += (this.dataLoader.findById('species', character.speciesId)?.cp_adjustment || 0);
    character.cpPerAbility = Math.max(0, character.cpPerAbility);

    // === STEP 5: Culture ===
    console.log('🎲 Phase 5: Culture');
    this._generateCulture(character, params);

    // === STEP 6: Age (rolled here in Python code) ===
    console.log('🎲 Phase 6: Age');
    character.age = DiceRoller.rollMultiple(2, 10) + 10; // 2d10 + 10

    // === STEP 7: Gender & Sexuality (4 independent characteristics) ===
    console.log('🎲 Phase 7: Gender & Sexuality');
    this._generateGender(character, params);

    // === STEP 8: Basic Stats (5 characteristics chosen by rolling) ===
    console.log('🎲 Phase 8: Basic Stats');
    this._generateStats(character);

    // === STEP 9: Derived Stats (calculated from Basic Characteristics) ===
    console.log('🎲 Phase 9: Derived Stats');
    this._generateDerivedStats(character);

    // === STEP 10: Weight & Mass ===
    console.log('🎲 Phase 10: Weight & Mass');
    this._generateWeight(character);

    // === STEP 11: Backgrounds (3 selections) ===
    console.log('🎲 Phase 11: Backgrounds');
    this._generateBackgrounds(character, params);

    // === STEP 12: Motivations ===
    console.log('🎲 Phase 12: Motivations');
    this._generateMotivations(character, params);

    // === STEP 13: Origin Type ===
    console.log('🎲 Phase 13: Origin Type');
    this._generateOriginType(character, params);

    // === STEP 14: Abilities & Weaknesses ===
    console.log('🎲 Phase 14: Abilities & Weaknesses');
    this._generateAbilities(character);

    // === STEP 15: Caps & To-Hit Calculations ===
    console.log('🎲 Phase 15: Caps & To-Hit');
    this._generateCapsAndToHit(character);

    console.log('✅ Generation complete');
    return character;
  }

  /**
   * Generate birthplace with cascading regional/species/culture logic
   * This is the most complex part of character generation
   */
  _generateBirthplace(character, params) {
    let birthplaceRecord;

    if (params.birthplaceId) {
      birthplaceRecord = this.dataLoader.findById('birthplace', params.birthplaceId);
    } else {
      const roll = DiceRoller.rollD100();
      birthplaceRecord = this.dataLoader.findByRoll('birthplace', roll);
    }

    if (!birthplaceRecord) throw new Error('Invalid birthplace');

    const birthplaceType = birthplaceRecord.birth_place;
    let birthplaceName = birthplaceType;
    let regionId = null;

    // Process each birthplace type with its cascading logic
    if (birthplaceType === 'Foreigner') {
      // Foreigner: known region selection
      const regionRecord = this._selectFromRegionType('knownregion', params.knownRegionId);
      birthplaceName = regionRecord.region_name;
      regionId = regionRecord.id;

      if (params.speciesId === null) {
        const roll = DiceRoller.rollD100();
        const speciesRecord = this.dataLoader.findByContextAndRoll('knownregionspecies', regionId, roll);
        if (speciesRecord) params.speciesId = speciesRecord.species_id;
      }

      if (params.cultureId === null) {
        const roll = DiceRoller.rollD100();
        const cultureRecord = this.dataLoader.findByContextAndRoll('knownregioncult', regionId, roll);
        if (cultureRecord) params.cultureId = cultureRecord.culture_id;
      }

    } else if (birthplaceType === 'Stranger') {
      // Stranger: lost region selection
      const regionRecord = this._selectFromRegionType('lostregion', params.lostRegionId);
      birthplaceName = regionRecord.region_name;
      regionId = regionRecord.id;

      // Handle "Other" lost region
      if (birthplaceName === 'Other') {
        params.speciesId = this.dataLoader.findByName('species', 'Choose (Lost Region)')?.id;
        params.cultureId = this.dataLoader.findByName('culture', 'Choose (Lost Region)')?.id;
      } else {
        if (params.speciesId === null) {
          const roll = DiceRoller.rollD100();
          const speciesRecord = this.dataLoader.findByContextAndRoll('lostregionspecies', regionId, roll);
          if (speciesRecord) params.speciesId = speciesRecord.species_id;
        }

        if (params.cultureId === null) {
          const roll = DiceRoller.rollD100();
          const cultureRecord = this.dataLoader.findByContextAndRoll('lostregionculture', regionId, roll);
          if (cultureRecord) params.cultureId = cultureRecord.culture_id;
        }
      }

    } else if (birthplaceType === 'Anachronism') {
      // Anachronism: time period selection
      const periodRecord = this._selectFromRegionType('timeperiod', params.timePeriodId);
      birthplaceName = `${birthplaceType}: ${periodRecord.time_period}`;
      regionId = periodRecord.id;

      if (params.speciesId === null) {
        const roll = DiceRoller.rollD100();
        const speciesRecord = this.dataLoader.findByContextAndRoll('timeperiodspecies', regionId, roll);
        if (speciesRecord) params.speciesId = speciesRecord.species_id;
      }

      if (params.cultureId === null) {
        const roll = DiceRoller.rollD100();
        const cultureRecord = this.dataLoader.findByContextAndRoll('timeperiodculture', regionId, roll);
        if (cultureRecord) params.cultureId = cultureRecord.culture_id;
      }

    } else if (birthplaceType === 'Alien') {
      // Alien: other world selection
      const worldRecord = this._selectFromRegionType('otherworld', params.otherWorldId);
      birthplaceName = worldRecord.world;
      regionId = worldRecord.id;

      // Handle "Other" world
      if (birthplaceName === 'Other') {
        params.speciesId = this.dataLoader.findByName('species', 'Choose (Other World)')?.id;
        params.cultureId = this.dataLoader.findByName('culture', 'Choose (Other World)')?.id;
      } else {
        if (params.speciesId === null) {
          const roll = DiceRoller.rollD100();
          const speciesRecord = this.dataLoader.findByContextAndRoll('otherworldspecies', regionId, roll);
          if (speciesRecord) {
            params.speciesId = speciesRecord.species_id;
            if (params.cultureId === null) params.cultureId = speciesRecord.culture_id;
          }
        }

        if (params.cultureId === null) {
          const roll = DiceRoller.rollD100();
          const cultureRecord = this.dataLoader.findByContextAndRoll('otherworldculture', regionId, roll);
          if (cultureRecord) params.cultureId = cultureRecord.culture_id;
        }
      }

    } else if (birthplaceType === 'Extra-Dimensional') {
      // Extra-Dimensional: other dimension selection
      const dimRecord = this._selectFromRegionType('otherdimension', params.otherDimensionId);
      birthplaceName = dimRecord.dimension;
      regionId = dimRecord.id;

      // Handle dimension species/culture
      if (params.speciesId === null) {
        const roll = DiceRoller.rollD100();
        const speciesRecord = this.dataLoader.findByContextAndRoll('otherdimensionspecies', regionId, roll);
        if (speciesRecord) {
          params.speciesId = speciesRecord.species_id;
        } else {
          params.speciesId = this.dataLoader.findByName('species', 'Choose (Other Dimension)')?.id;
        }
      }

      if (params.cultureId === null) {
        const roll = DiceRoller.rollD100();
        const cultureRecord = this.dataLoader.findByContextAndRoll('otherdimensionculture', regionId, roll);
        if (cultureRecord) params.cultureId = cultureRecord.culture_id;
      }
    }

    character.birthplace = birthplaceName;
    character.birthplaceId = params.birthplaceId || birthplaceRecord.id;
  }

  _selectFromRegionType(table, idParam) {
    if (idParam) {
      return this.dataLoader.findById(table, idParam);
    } else {
      const roll = DiceRoller.rollD100();
      return this.dataLoader.findByRoll(table, roll);
    }
  }

  _generateSpecies(character, params) {
    if (params.speciesId === null) {
      const roll = DiceRoller.rollD100();
      const record = this.dataLoader.findByRoll('species', roll);
      character.speciesId = record.id;
    } else {
      character.speciesId = params.speciesId;
    }

    const speciesRecord = this.dataLoader.findById('species', character.speciesId);
    if (!speciesRecord) throw new Error(`Invalid species ID: ${character.speciesId}`);
    character.species = speciesRecord.species_name;

    // Racial abilities/weaknesses
    character.racialAbilities = [];
    character.racialWeaknesses = [];

    const speciesAbilities = this.dataLoader.filterByField('speciesability', 'species_id', character.speciesId);
    for (const ability of speciesAbilities) {
      const costAndDesc = `${ability.cps}@@${ability.ability_description}`;
      if (ability.cps < 0) {
        character.racialWeaknesses.push(costAndDesc);
      } else {
        character.racialAbilities.push(costAndDesc);
      }
    }

    // Handle normal power level extra CP
    if (character.powerlevelId === 1) {
      character.totalCp += (speciesRecord.extra_cp_as_normal || 0);
    }
  }

  _generateCulture(character, params) {
    if (params.cultureId === null) {
      // Default to "Modern" culture
      const modern = this.dataLoader.findByName('culture', 'Modern');
      character.cultureId = modern.id;
    } else {
      character.cultureId = params.cultureId;
    }

    const cultureRecord = this.dataLoader.findById('culture', character.cultureId);
    if (!cultureRecord) throw new Error(`Invalid culture ID: ${character.cultureId}`);
    character.culture = cultureRecord.culture_name;
  }

  _generateGender(character, params) {
    // Gender Identity
    character.genderIdentityId = params.genderIdentityId || null;
    if (!character.genderIdentityId) {
      const roll = DiceRoller.rollD100();
      character.genderIdentityId = this.dataLoader.findByRoll('genderidentity', roll)?.id;
    }
    character.genderIdentity = this.dataLoader.findById('genderidentity', character.genderIdentityId)?.short_form || '';

    // Gender Expression
    character.genderExpressionId = params.genderExpressionId || null;
    if (!character.genderExpressionId) {
      const roll = DiceRoller.rollD100();
      character.genderExpressionId = this.dataLoader.findByRoll('genderexpression', roll)?.id;
    }
    character.genderExpression = this.dataLoader.findById('genderexpression', character.genderExpressionId)?.short_form || '';

    // Biological Sex
    character.biologicalSexId = params.biologicalSexId || null;
    if (!character.biologicalSexId) {
      const roll = DiceRoller.rollD100();
      character.biologicalSexId = this.dataLoader.findByRoll('biologicalsex', roll)?.id;
    }
    character.biologicalSex = this.dataLoader.findById('biologicalsex', character.biologicalSexId)?.short_form || '';

    // Sexual Attraction
    character.sexualAttractionId = params.sexualAttractionId || null;
    if (!character.sexualAttractionId) {
      const roll = DiceRoller.rollD100();
      character.sexualAttractionId = this.dataLoader.findByRoll('sexualattraction', roll)?.id;
    }
    character.sexualAttraction = this.dataLoader.findById('sexualattraction', character.sexualAttractionId)?.short_form || '';

    // Composite gender string
    let genderParts = [];
    if (character.sexualAttraction) genderParts.push(character.sexualAttraction);
    if (character.biologicalSex) genderParts.push(character.biologicalSex);
    if (character.genderIdentity) genderParts.push(character.genderIdentity);
    if (character.genderExpression) genderParts.push(character.genderExpression);
    character.gender = genderParts.filter(p => p).join(' ');
  }

  _generateStats(character) {
    const stats = {
      ST: null, EN: null, AG: null, IN: null, CL: null
    };
    const statsDone = [];
    let bcStart = character.bcStart;

    let statAttempts = 0;
    while (statsDone.length < 5 && statAttempts < 1000) {
      const roll = DiceRoller.roll(1, 10); // d10
      const statRecord = this.dataLoader.findByRoll('stat', roll);
      if (statRecord && !statsDone.includes(statRecord.abbrev)) {
        statsDone.push(statRecord.abbrev);
        stats[statRecord.abbrev] = bcStart;
        bcStart -= 2;
      }
      statAttempts++;
    }

    character.strength = stats.ST;
    character.endurance = stats.EN;
    character.agility = stats.AG;
    character.intelligence = stats.IN;
    character.cool = stats.CL;
  }

  _generateDerivedStats(character) {
    const findBCDetail = (bc) => {
      // Try exact match first
      const matching = this.dataLoader.filterByField('bcdetail', 'bc_score', bc);
      if (matching.length > 0) return matching[0];
      
      // Otherwise scan all records for range match
      const bcTable = this.dataLoader.cache['bcdetail'];
      if (!bcTable || !Array.isArray(bcTable)) return null;
      return bcTable.find(r => 
        typeof r.bc_score_min === 'number' && typeof r.bc_score_max === 'number' &&
        r.bc_score_min <= bc && bc <= r.bc_score_max
      ) || null;
    };

    const stStats = findBCDetail(character.strength);
    const enStats = findBCDetail(character.endurance);
    const agStats = findBCDetail(character.agility);
    const inStats = findBCDetail(character.intelligence);
    const clStats = findBCDetail(character.cool);

    character.hits = 0;
    character.carryingCapacity = stStats.carrying_capacity_st;
    character.baseHth = stStats.base_hth_damage_st;
    character.hits += stStats.hit_points_st;

    character.enSave = enStats.save_numbers_en_ag_in_cl;
    character.healingRate = enStats.healing_rate_en;
    character.hits += enStats.hit_points_en;

    character.agSave = agStats.save_numbers_en_ag_in_cl;
    character.hits += agStats.hit_points_ag;

    character.inSave = inStats.save_numbers_en_ag_in_cl;
    character.hits += inStats.hit_points_in;

    character.clSave = clStats.save_numbers_en_ag_in_cl;
    character.initiative = clStats.initiative_cl;
    character.hits += clStats.hit_points_cl;

    character.power = character.strength + character.endurance + character.agility + character.intelligence;
    character.physicalDefense = character.agSave - 10;
    character.mentalDefense = character.inSave - 10;
    character.move = Math.round((character.strength + character.endurance + character.agility) / 3);
    character.inventingPoints = Math.round((character.intelligence / 2) + 0.5);
  }

  _generateWeight(character) {
    const weightDie = character.genderIdentity === 'F' ? 4 : 6; // d4 for female, d6 for male
    const wdCount = 5 - (character.age >= 20 ? 0 : DiceRoller.roll(1, 2));
    character.weight = DiceRoller.rollMultiple(wdCount, weightDie) * 10;

    const halfMassed = character.weight / 2;
    const bcDetails = this.dataLoader.cache['bcdetail'] || [];
    const closestLower = bcDetails.filter(r => r.carrying_capacity_st <= halfMassed)
      .sort((a, b) => b.carrying_capacity_st - a.carrying_capacity_st)[0];
    const closestHigher = bcDetails.filter(r => r.carrying_capacity_st >= halfMassed)
      .sort((a, b) => a.carrying_capacity_st - b.carrying_capacity_st)[0];

    if (closestHigher && (!closestLower || (closestHigher.carrying_capacity_st - halfMassed) < (halfMassed - closestLower.carrying_capacity_st))) {
      character.mass = closestHigher.base_hth_damage_st;
    } else if (closestLower) {
      character.mass = closestLower.base_hth_damage_st;
    }
  }

  _generateBackgrounds(character, params) {
    character.backgrounds = [];
    let bgAttempts = 0;
    while (character.backgrounds.length < 3 && bgAttempts < 1000) {
      const roll = DiceRoller.rollD100();
      const bg = this.dataLoader.findByRoll('background', roll);
      if (bg && (params.keepDuplicates || !character.backgrounds.includes(bg.background))) {
        character.backgrounds.push(bg.background);
      }
      bgAttempts++;
    }
  }

  _generateMotivations(character, params) {
    character.motivations = [];
    if (character.side === 'Neutral') return;

    if (params.motivationId) {
      const mot = this.dataLoader.findById('motivation', params.motivationId);
      if (mot) {
        character.motivations.push(mot.motivation);
      }
    } else {
      let motAttempts = 0;
      while (character.motivations.length < 2 && motAttempts < 1000) {
        const roll = DiceRoller.rollD100();
        const mot = this.dataLoader.findByContextAndRoll('motivation', character.sideId, roll);
        if (mot && (params.keepDuplicates || !character.motivations.includes(mot.motivation))) {
          character.motivations.push(mot.motivation);
        }
        motAttempts++;
      }
    }
  }

  _generateOriginType(character, params) {
    if (params.originTypeId) {
      character.originTypeId = params.originTypeId;
    } else {
      const roll = DiceRoller.rollD100();
      character.originTypeId = this.dataLoader.findByRoll('origintype', roll)?.id;
    }
    character.originType = this.dataLoader.findById('origintype', character.originTypeId)?.origin_type;
  }

  _generateAbilities(character) {
    character.abilities = [];
    character.weaknesses = [];

    if (character.powerlevelId === 1) return; // Normal power level has no powers

    // Offensive abilities (type_id = 1)
    let abAttempts = 0;
    while (character.abilities.length < 2 && abAttempts < 1000) {
      const roll = DiceRoller.rollD100();
      const ability = this.dataLoader.findByContextAndRoll('ability', 1, roll);
      if (ability && !character.abilities.includes(ability.ability)) {
        character.abilities.push(ability.ability);
      }
      abAttempts++;
    }

    // Defensive abilities (type_id = 2)
    abAttempts = 0;
    while (character.abilities.length < 4 && abAttempts < 1000) {
      const roll = DiceRoller.rollD100();
      const ability = this.dataLoader.findByContextAndRoll('ability', 2, roll);
      if (ability && !character.abilities.includes(ability.ability)) {
        character.abilities.push(ability.ability);
      }
      abAttempts++;
    }

    // Miscellaneous abilities (type_id = 4)
    abAttempts = 0;
    while (character.abilities.length < 6 && abAttempts < 1000) {
      const roll = DiceRoller.rollD100();
      const ability = this.dataLoader.findByContextAndRoll('ability', 4, roll);
      if (ability && !character.abilities.includes(ability.ability)) {
        character.abilities.push(ability.ability);
      }
      abAttempts++;
    }

    // Weaknesses (type_id = 3)
    abAttempts = 0;
    while (character.weaknesses.length < 2 && abAttempts < 1000) {
      const roll = DiceRoller.rollD100();
      const ability = this.dataLoader.findByContextAndRoll('ability', 3, roll);
      if (ability && !character.weaknesses.includes(ability.ability)) {
        character.weaknesses.push(ability.ability);
      }
      abAttempts++;
    }
  }

  _generateCapsAndToHit(character) {
    character.bcCap = Math.round(character.totalCp / 5) + 10;
    character.abilityCap = Math.round(character.totalCp / 5);
    character.damageCap = Math.round(character.totalCp / 12.5) + 3;

    character.agToHit = character.agSave + 3;
    character.inToHit = character.inSave + 3;
    character.clToHit = character.clSave + 3;

    character.wealth = 'd4';
    character.luck = '10-';
  }
}

export default CharacterGenerator;
