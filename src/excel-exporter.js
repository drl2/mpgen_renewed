/**
 * Excel Exporter Module
 * Converts character objects to Excel workbooks matching legacy MPGEN format
 * Uses SheetJS library for Excel generation
 */

export class ExcelExporter {
  /**
   * Export character to Excel file
   * @param {Object} character - Character object with all properties
   * @param {string} characterName - Name for the exported file
   * @returns {Promise<void>}
   */
  static async exportCharacter(character, characterName = 'MPGen_Character') {
    try {
      // Check if XLSX library is available
      if (typeof XLSX === 'undefined') {
        throw new Error('SheetJS library not loaded. Please refresh the page.');
      }

      console.log('📊 Exporting character to Excel:', { characterName, character });

      // Create new workbook
      const workbook = XLSX.utils.book_new();

      // Create both sheets
      const sheet1 = this.createExcelRecordSheet(character);
      const sheet2 = this.createMPGenCharacterSheet(character);

      console.log('📋 Sheets created:', { sheet1Keys: Object.keys(sheet1).length, sheet2Keys: Object.keys(sheet2).length });

      // Add sheets to workbook
      XLSX.utils.book_append_sheet(workbook, sheet1, 'Excel Record Sheet');
      XLSX.utils.book_append_sheet(workbook, sheet2, 'MPGen Character');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${characterName}_MPGen_${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);

      console.log('✅ File written:', filename);

      return {
        success: true,
        message: `Character exported successfully as ${filename}`,
        filename: filename
      };
    } catch (error) {
      console.error('Excel export failed:', error);
      return {
        success: false,
        message: `Export failed: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Create "Excel Record Sheet" - Official Format
   * Matches legacy Mighty Protectors character sheet layout
   * @param {Object} character - Character data
   * @returns {Object} XLSX worksheet
   */
  static createExcelRecordSheet(character) {
    // Initialize empty worksheet
    const ws = {};

    // Basic Information (top section)
    ws['D4'] = character.biological_sex || 'Unknown'; // Side: Hero/Villain
    ws['D5'] = character.species || '';
    ws['D6'] = parseInt(character.age || 0);
    ws['D7'] = parseInt(character.weight || 0);

    ws['Q4'] = character.birth_place || '';
    ws['Q5'] = character.culture || '';
    ws['Q6'] = character.gender || '';

    ws['F8'] = character.background || '';

    // Motivations and Origin
    ws['G12'] = character.motivation || '';
    ws['G13'] = character.origin_type || '';

    // Attributes (Strength, Endurance, Agility, Intelligence, Cool)
    ws['A33'] = parseInt(character.strength || 0);
    ws['A34'] = parseInt(character.endurance || 0);
    ws['A35'] = parseInt(character.agility || 0);
    ws['A36'] = parseInt(character.intelligence || 0);
    ws['A37'] = parseInt(character.cool || 0);

    // Total CP
    ws['E40'] = parseInt(character.total_cp || 0);

    // Populate abilities and weaknesses
    let rownum = 17;

    // Racial Abilities (if available)
    if (character.racial_abilities && Array.isArray(character.racial_abilities)) {
      for (const ability of character.racial_abilities) {
        if (typeof ability === 'string') {
          const [cp, name] = ability.split('@@');
          ws['A' + rownum] = parseInt(cp || 0);
          ws['D' + rownum] = name || '';
          rownum++;
        }
      }
    }

    // Selected Abilities
    const cpPerAbility = parseInt(character.cp_per_ability || 0);
    if (character.selected_abilities && Array.isArray(character.selected_abilities)) {
      for (const ability of character.selected_abilities) {
        ws['A' + rownum] = cpPerAbility;
        ws['D' + rownum] = ability;
        rownum++;
      }
    } else if (character.selected_abilities && typeof character.selected_abilities === 'string') {
      const abilities = character.selected_abilities.split(',').map(a => a.trim());
      for (const ability of abilities) {
        if (ability) {
          ws['A' + rownum] = cpPerAbility;
          ws['D' + rownum] = ability;
          rownum++;
        }
      }
    }

    // Unselected Abilities (grayed out in legacy)
    if (character.unselected_abilities && Array.isArray(character.unselected_abilities)) {
      for (const ability of character.unselected_abilities) {
        ws['D' + rownum] = ability;
        rownum++;
      }
    }

    // Racial Weaknesses
    rownum = 32 - (character.racial_weaknesses?.length || 0) - (character.weaknesses?.length || 0);

    if (character.racial_weaknesses && Array.isArray(character.racial_weaknesses)) {
      for (const weakness of character.racial_weaknesses) {
        if (typeof weakness === 'string') {
          const [cp, name] = weakness.split('@@');
          ws['A' + rownum] = parseInt(cp || 0);
          ws['D' + rownum] = name || '';
          rownum++;
        }
      }
    }

    // Selected Weaknesses
    if (character.weaknesses && Array.isArray(character.weaknesses)) {
      for (const weakness of character.weaknesses) {
        ws['D' + rownum] = weakness;
        rownum++;
      }
    }

    // Set column widths for better readability
    ws['!cols'] = [
      { wch: 5 },  // A
      { wch: 10 }, // B
      { wch: 10 }, // C
      { wch: 15 }, // D
      { wch: 5 },  // E
      { wch: 10 }, // F
      { wch: 10 }, // G
      { wch: 10 }, // H
      { wch: 10 }, // I
      { wch: 10 }, // J
      { wch: 10 }, // K
      { wch: 10 }, // L
      { wch: 10 }, // M
      { wch: 10 }, // N
      { wch: 10 }, // O
      { wch: 10 }, // P
      { wch: 10 }, // Q
    ];

    // Set worksheet dimensions
    ws['!ref'] = 'A1:Q40';

    return ws;
  }

  /**
   * Create "MPGen Character" Sheet - Custom Format
   * Extended sheet with additional calculated properties
   * @param {Object} character - Character data
   * @returns {Object} XLSX worksheet
   */
  static createMPGenCharacterSheet(character) {
    const ws = {};

    // Section 1: Basic Character Info
    ws['D3'] = character.biological_sex || ''; // Side: Hero/Villain
    ws['K3'] = character.birth_place || '';
    ws['N3'] = character.wealth || '';

    ws['D4'] = character.species || '';
    ws['K4'] = character.culture || '';
    ws['N4'] = character.luck || '';

    ws['D5'] = parseInt(character.age || 0);
    ws['K5'] = character.gender || '';

    ws['D6'] = parseInt(character.weight || 0);
    ws['K6'] = character.mass || '';

    // Section 2: Motivations and Background
    ws['D8'] = character.motivation || '';
    ws['D9'] = character.background || '';
    ws['D10'] = character.origin_type || '';

    // Section 3: Attributes (both sides for reference)
    // Left side (A column)
    ws['A14'] = parseInt(character.strength || 0);
    ws['A15'] = parseInt(character.endurance || 0);
    ws['A16'] = parseInt(character.agility || 0);
    ws['A17'] = parseInt(character.intelligence || 0);
    ws['A18'] = parseInt(character.cool || 0);

    // Right side copy (D column)
    ws['D14'] = parseInt(character.strength || 0);
    ws['D15'] = parseInt(character.endurance || 0);
    ws['D16'] = parseInt(character.agility || 0);
    ws['D17'] = parseInt(character.intelligence || 0);
    ws['D18'] = parseInt(character.cool || 0);

    // Attribute Saves (F column) - derived values
    ws['F15'] = parseInt(character.endurance_save || character.endurance || 0);
    ws['F16'] = parseInt(character.agility_save || character.agility || 0);
    ws['F17'] = parseInt(character.intelligence_save || character.intelligence || 0);
    ws['F18'] = parseInt(character.cool_save || character.cool || 0);

    // Section 4: Power and Combat Stats
    ws['K13'] = parseInt(character.power_level || 0);
    ws['K14'] = parseInt(character.hits || 0);
    ws['K15'] = character.initiative || '';

    // Section 5: Defenses and Capacities
    ws['N13'] = character.base_hth || '';
    ws['N14'] = parseInt(character.carrying_capacity || 0);
    ws['N15'] = parseInt(character.physical_defense || 0);
    ws['N16'] = parseInt(character.mental_defense || 0);
    ws['N17'] = parseInt(character.inventing_points || 0);

    // Section 6: Movement and Recovery
    ws['N21'] = parseInt(character.move || 0);
    ws['N23'] = parseFloat(character.healing_rate || 0);

    // Section 7: Capacity Limits
    ws['N32'] = parseInt(character.bc_capacity || 0);
    ws['N33'] = parseInt(character.ability_capacity || 0);
    ws['N34'] = parseInt(character.damage_capacity || 0);

    // Section 8: Total CP
    ws['A39'] = parseInt(character.total_cp || 0);

    // Populate abilities and weaknesses
    let rownum = 22;

    // Racial Abilities
    if (character.racial_abilities && Array.isArray(character.racial_abilities)) {
      for (const ability of character.racial_abilities) {
        if (typeof ability === 'string') {
          const [cp, name] = ability.split('@@');
          ws['A' + rownum] = parseInt(cp || 0);
          ws['C' + rownum] = name || '';
          rownum++;
        }
      }
    }

    // Selected Abilities
    const cpPerAbility = parseInt(character.cp_per_ability || 0);
    if (character.selected_abilities && Array.isArray(character.selected_abilities)) {
      for (const ability of character.selected_abilities) {
        ws['A' + rownum] = cpPerAbility;
        ws['C' + rownum] = ability;
        rownum++;
      }
    } else if (character.selected_abilities && typeof character.selected_abilities === 'string') {
      const abilities = character.selected_abilities.split(',').map(a => a.trim());
      for (const ability of abilities) {
        if (ability) {
          ws['A' + rownum] = cpPerAbility;
          ws['C' + rownum] = ability;
          rownum++;
        }
      }
    }

    // Unselected Abilities
    if (character.unselected_abilities && Array.isArray(character.unselected_abilities)) {
      for (const ability of character.unselected_abilities) {
        ws['C' + rownum] = ability;
        rownum++;
      }
    }

    // Racial Weaknesses
    rownum = 37 - (character.racial_weaknesses?.length || 0) - (character.weaknesses?.length || 0);

    if (character.racial_weaknesses && Array.isArray(character.racial_weaknesses)) {
      for (const weakness of character.racial_weaknesses) {
        if (typeof weakness === 'string') {
          const [cp, name] = weakness.split('@@');
          ws['A' + rownum] = parseInt(cp || 0);
          ws['C' + rownum] = name || '';
          rownum++;
        }
      }
    }

    // Selected Weaknesses
    if (character.weaknesses && Array.isArray(character.weaknesses)) {
      for (const weakness of character.weaknesses) {
        ws['C' + rownum] = weakness;
        rownum++;
      }
    }

    // Set column widths
    ws['!cols'] = [
      { wch: 5 },  // A
      { wch: 2 },  // B
      { wch: 25 }, // C
      { wch: 15 }, // D
      { wch: 5 },  // E
      { wch: 5 },  // F
      { wch: 5 },  // G
      { wch: 5 },  // H
      { wch: 5 },  // I
      { wch: 5 },  // J
      { wch: 15 }, // K
      { wch: 5 },  // L
      { wch: 5 },  // M
      { wch: 15 }, // N
    ];

    // Set worksheet dimensions
    ws['!ref'] = 'A1:N40';

    return ws;
  }

  /**
   * Fallback: Export character as JSON if XLSX not available
   * @param {Object} character - Character data
   * @param {string} characterName - Name for the exported file
   * @returns {void}
   */
  static exportCharacterJSON(character, characterName = 'MPGen_Character') {
    try {
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${characterName}_MPGen_${timestamp}.json`;

      const dataStr = JSON.stringify(character, null, 2);
      const dataBlob = new Blob([dataStr], { type: 'application/json' });
      const url = URL.createObjectURL(dataBlob);

      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      link.click();

      URL.revokeObjectURL(url);

      return {
        success: true,
        message: `Character exported as JSON: ${filename}`,
        filename: filename
      };
    } catch (error) {
      console.error('JSON export failed:', error);
      return {
        success: false,
        message: `JSON export failed: ${error.message}`,
        error: error
      };
    }
  }

  /**
   * Check if XLSX library is available
   * @returns {boolean}
   */
  static isXLSXAvailable() {
    return typeof XLSX !== 'undefined';
  }

  /**
   * Get library status for UI display
   * @returns {Object} Status info
   */
  static getLibraryStatus() {
    return {
      available: this.isXLSXAvailable(),
      message: this.isXLSXAvailable()
        ? 'Excel export ready'
        : 'Excel library loading (JSON export available)'
    };
  }
}

// Export for use in other modules
export default ExcelExporter;
