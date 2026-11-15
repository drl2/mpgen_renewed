/**
 * Excel Export Module
 * Updates character values in the existing workbook template.
 */

function getXlsxPopulate() {
  if (typeof window !== 'undefined' && window.XlsxPopulate) {
    return window.XlsxPopulate;
  }
  throw new Error('xlsx-populate library not loaded. Check that the CDN script is included in HTML.');
}

/**
 * @param {Object} character - Character data object
 * @returns {Promise<void>}
 */
export async function exportCharacter(character) {
  try {
    const templateResponse = await fetch('templates/CharTemplate.xlsx');
    if (!templateResponse.ok) {
      throw new Error(`Failed to load template: HTTP ${templateResponse.status}`);
    }

    const XlsxPopulate = getXlsxPopulate();
    const workbook = await XlsxPopulate.fromDataAsync(await templateResponse.arrayBuffer());

    insertCharacterData(workbook, character);

    const fileName = `${character.name || 'Character'}.xlsx`;
    const buffer = await workbook.outputAsync({ type: 'arraybuffer' });
    triggerDownload(buffer, fileName);

    console.log('✅ Excel export completed:', fileName);
  } catch (error) {
    console.error('❌ Excel export failed:', error);
    throw new Error(`Excel export failed: ${error.message}`);
  }
}

function insertCharacterData(workbook, character) {
  const characterSheet = workbook.sheet(0);
  const recordSheet = workbook.sheet(2);
  const characterSheetValues = {
    'E1': character.name,
    'L1': character.player,
    'D3': character.side,
    'K3': character.birthplace,
    'N3': character.wealth,
    'D4': character.species,
    'K4': character.culture,
    'N4': character.luck,
    'D5': character.age,
    'K5': character.gender,
    'D6': character.weight,
    'K6': character.mass,
    'D8': getSelectedMotivation(character),
    'D9': joinSelectedBackgrounds(character),
    'D10': character.originType,
    'K13': character.power,
    'K14': character.hits,
    'K15': character.initiative,
    'N13': character.baseHth,
    'A14': character.strength,
    'A15': character.endurance,
    'A16': character.agility,
    'A17': character.intelligence,
    'A18': character.cool,
    'D14': character.strength,
    'N14': character.carryingCapacity,
    'D15': character.endurance,
    'F15': character.enSave,
    'J15': character.initiative,
    'N15': character.physicalDefense,
    'D16': character.agility,
    'F16': character.agSave,
    'N16': character.mentalDefense,
    'D17': character.intelligence,
    'F17': character.inSave,
    'N17': character.inventingPoints,
    'D18': character.cool,
    'F18': character.clSave,
    'N21': character.move,
    'N23': character.healingRate,
    'N32': character.bcCap,
    'N33': character.abilityCap,
    'N34': character.damageCap,
    'A39': character.totalCp
  };

  writeCellValues(characterSheet, characterSheetValues);

  writeAbilityEntries(characterSheet, character, 22, 'C');

  writeCellValues(recordSheet, {
    'D4': character.side,
    'Q4': character.birthplace,
    'D5': character.species,
    'Q5': character.culture,
    'D6': character.age,
    'Q6': character.gender,
    'D7': character.weight,
    'F8': joinSelectedBackgrounds(character),
    'G12': getSelectedMotivation(character),
    'G13': character.originType,
    'A33': character.strength,
    'A34': character.endurance,
    'A35': character.agility,
    'A36': character.intelligence,
    'A37': character.cool,
    'E40': character.totalCp
  });

  writeAbilityEntries(recordSheet, character, 17, 'D');
}

function writeCellValues(sheet, values) {
  for (const [cellAddress, value] of Object.entries(values)) {
    if (value !== undefined && value !== null) {
      sheet.cell(cellAddress).value(value);
    }
  }
}

function joinValues(values, fallback) {
  if (Array.isArray(values)) {
    return values.join(', ');
  }
  return fallback;
}

function joinSelectedBackgrounds(character) {
  const selectedBackgrounds = character.selectedBackgrounds || [];
  return joinValues(selectedBackgrounds);
}

function getSelectedMotivation(character) {
  if (character.selectedMotivation) {
    return character.selectedMotivation;
  }
  const motivations = character.motivations || (character.motivation ? [character.motivation] : []);
  return motivations.length === 1 ? motivations[0] : '';
}

function writeAbilityEntries(sheet, character, firstRow, descriptionColumn) {
  const racialAbilities = (character.racialAbilities || []).map(parseRacialAbility);
  const abilities = (character.selectedAbilities || []).map(name => ({
    cost: character.cpPerAbility,
    name
  }));
  const racialWeaknesses = (character.racialWeaknesses || []).map(parseRacialAbility);
  const weaknesses = (character.weaknesses || []).map(name => ({ name }));

  const abilityEntries = [...racialAbilities, ...abilities];
  const weaknessStartRow = (firstRow === 22 ? 35 : 30) - racialWeaknesses.length;
  const lastAbilityRow = firstRow + abilityEntries.length - 1;
  const lastWeaknessRow = weaknessStartRow + racialWeaknesses.length + weaknesses.length - 1;
  const maxRow = firstRow === 22 ? 36 : 31;
  if (lastAbilityRow >= weaknessStartRow || lastWeaknessRow > maxRow) {
    throw new Error(`Character has too many ability and weakness entries for the template (${abilityEntries.length + racialWeaknesses.length + weaknesses.length} entries).`);
  }

  abilityEntries.forEach((entry, index) => {
    const row = firstRow + index;
    if (entry.cost !== undefined && entry.cost !== null) {
      sheet.cell(`A${row}`).value(entry.cost);
    }
    sheet.cell(`${descriptionColumn}${row}`).value(entry.name);
  });

  [...racialWeaknesses, ...weaknesses].forEach((entry, index) => {
    const row = weaknessStartRow + index;
    if (entry.cost !== undefined && entry.cost !== null) {
      sheet.cell(`A${row}`).value(entry.cost);
    }
    sheet.cell(`${descriptionColumn}${row}`).value(entry.name);
  });
}

function parseRacialAbility(value) {
  if (typeof value !== 'string') {
    throw new Error('Invalid racial ability entry: expected a cost and description.');
  }
  const [cost, ...descriptionParts] = value.split('@@');
  if (descriptionParts.length === 0) {
    throw new Error(`Invalid racial ability entry: ${value}`);
  }
  return {
    cost: Number(cost),
    name: descriptionParts.join('@@')
  };
}

function triggerDownload(buffer, fileName) {
  const file = new Blob([buffer], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });
  const url = URL.createObjectURL(file);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

export const ExcelExporter = { exportCharacter };
