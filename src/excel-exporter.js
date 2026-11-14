/**
 * Excel Export Module - Uses SheetJS (XLSX) to load and modify template
 * Loads CharTemplate.xlsx, inserts character data, preserves all formatting
 */

/**
 * Main export function - loads template and inserts character data
 * @param {Object} character - Character data object
 * @returns {Promise<void>}
 */
export async function exportCharacter(character) {
  try {
    // Check if SheetJS is available
    if (typeof window === 'undefined' || !window.XLSX) {
      throw new Error('SheetJS library not loaded. Check that the CDN script is included in HTML.');
    }

    // Load the template file
    const templateResponse = await fetch('templates/CharTemplate.xlsx');
    if (!templateResponse.ok) {
      throw new Error(`Failed to load template: HTTP ${templateResponse.status}`);
    }

    const templateBuffer = await templateResponse.arrayBuffer();
    const workbook = window.XLSX.read(new Uint8Array(templateBuffer), { type: 'array' });

    // Get Sheet 1 (MPGen Character)
    const sheet1 = workbook.Sheets[workbook.SheetNames[0]];

    // Insert character data into sheet1
    insertCharacterData(sheet1, character);

    // Generate filename with character name and timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `${character.name || 'Character'}_${timestamp}.xlsx`;

    // Write and download
    window.XLSX.writeFile(workbook, fileName);

    console.log('✅ Excel export completed:', fileName);
  } catch (error) {
    console.error('❌ Excel export failed:', error);
    throw new Error(`Excel export failed: ${error.message}`);
  }
}

/**
 * Insert character data into template sheet
 * Maps character fields to template cell addresses
 */
function insertCharacterData(sheet, character) {
  const cellMapping = {
    // Sheet 1 data cells (adjacent to labels)
    'B1': character.name,
    'L1': character.player,
    'B3': character.side,
    'J3': character.birthplace,
    'N3': character.wealth,
    'B4': character.species,
    'J4': character.culture,
    'N4': character.luck,
    'B5': character.age,
    'J5': character.gender,
    'B6': character.weight,
    'J6': character.mass,
    'B8': character.motivation,
    'B9': character.background,
    'B10': character.originType,
    'B13': character.cp,
    'D13': character.bc,
    'E13': character.score,
    'G13': character.save,
    'J13': character.power,
    'N13': character.baseHTH,
    'D14': character.st,
    'J14': character.hits,
    'N14': character.carryingCapacity,
    'D15': character.en,
    'J15': character.initiative,
    'N15': character.physicalDefense,
    'D16': character.ag,
    'J16': character.agToHit,
    'N16': character.mentalDefense,
    'D17': character.in,
    'J17': character.inToHit,
    'N17': character.inventingPoints,
    'D18': character.cl,
    'J18': character.clToHit,
    'D21': character.ability,
    'N21': character.moveGround,
    'N22': character.moveLeap
  };

  // Insert data into cells
  for (const [cellAddress, value] of Object.entries(cellMapping)) {
    if (value !== undefined && value !== null) {
      sheet[cellAddress] = { v: value, t: 's' };
    }
  }
}

export const ExcelExporter = { exportCharacter };
