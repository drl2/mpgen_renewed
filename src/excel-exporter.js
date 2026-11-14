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
   * @returns {Object}
   */
  static exportCharacter(character, characterName = 'MPGen_Character') {
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

      console.log('📋 Sheets created');

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
   * Using array-of-arrays format for reliability
   * @param {Object} character - Character data
   * @returns {Object} XLSX worksheet
   */
  static createExcelRecordSheet(character) {
    console.log('📊 Creating Excel Record Sheet with character:', character.name);
    
    // Create 2D array - rows and columns
    // Initialize with empty cells
    const data = [];
    for (let i = 0; i < 41; i++) {
      data[i] = [];
      for (let j = 0; j < 18; j++) {
        data[i][j] = '';
      }
    }

    // Row 4 (index 3): Basic info line 1
    data[3][3] = character.biological_sex || 'Unknown';   // D4: Side
    data[3][16] = character.birth_place || '';             // Q4: Birthplace

    // Row 5 (index 4): Basic info line 2
    data[4][3] = character.species || '';                  // D5: Species
    data[4][16] = character.culture || '';                 // Q5: Culture

    // Row 6 (index 5): Age / Gender
    data[5][3] = parseInt(character.age || 0);             // D6: Age
    data[5][16] = character.gender || '';                  // Q6: Gender

    // Row 7 (index 6): Weight
    data[6][3] = parseInt(character.weight || 0);          // D7: Weight

    // Row 8 (index 7): Background
    data[7][5] = character.background || '';               // F8: Background

    // Row 12-13 (index 11-12): Motivation & Origin
    data[11][6] = character.motivation || '';              // G12: Motivation
    data[12][6] = character.origin_type || '';             // G13: Origin Type

    // Rows 33-37 (index 32-36): Attributes
    data[32][0] = parseInt(character.strength || 0);       // A33: STR
    data[33][0] = parseInt(character.endurance || 0);      // A34: END
    data[34][0] = parseInt(character.agility || 0);        // A35: AGI
    data[35][0] = parseInt(character.intelligence || 0);   // A36: INT
    data[36][0] = parseInt(character.cool || 0);           // A37: COOL

    // Row 40 (index 39): Total CP
    data[39][4] = parseInt(character.total_cp || 0);       // E40: Total CP

    // Convert array to XLSX worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
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

    console.log('✅ Sheet 1 created with', data.length, 'rows');
    return ws;
  }

  /**
   * Create "MPGen Character" Sheet - Custom Format
   * Extended sheet with additional calculated properties
   * @param {Object} character - Character data
   * @returns {Object} XLSX worksheet
   */
  static createMPGenCharacterSheet(character) {
    console.log('📊 Creating MPGen Character Sheet with character:', character.name);
    
    // Create 2D array - rows and columns
    const data = [];
    for (let i = 0; i < 41; i++) {
      data[i] = [];
      for (let j = 0; j < 15; j++) {
        data[i][j] = '';
      }
    }

    // Row 3 (index 2): Basic info line 1
    data[2][3] = character.biological_sex || '';          // D3: Side
    data[2][10] = character.birth_place || '';             // K3: Birthplace
    data[2][13] = character.wealth || '';                  // N3: Wealth

    // Row 4 (index 3): Basic info line 2
    data[3][3] = character.species || '';                  // D4: Species
    data[3][10] = character.culture || '';                 // K4: Culture
    data[3][13] = character.luck || '';                    // N4: Luck

    // Row 5 (index 4): Age / Gender
    data[4][3] = parseInt(character.age || 0);             // D5: Age
    data[4][10] = character.gender || '';                  // K5: Gender

    // Row 6 (index 5): Weight / Mass
    data[5][3] = parseInt(character.weight || 0);          // D6: Weight
    data[5][10] = character.mass || '';                    // K6: Mass

    // Row 8-10 (index 7-9): Motivations
    data[7][3] = character.motivation || '';               // D8: Motivation
    data[8][3] = character.background || '';               // D9: Background
    data[9][3] = character.origin_type || '';              // D10: Origin Type

    // Rows 14-18 (index 13-17): Attributes (both sides)
    data[13][0] = parseInt(character.strength || 0);       // A14: STR
    data[14][0] = parseInt(character.endurance || 0);      // A15: END
    data[15][0] = parseInt(character.agility || 0);        // A16: AGI
    data[16][0] = parseInt(character.intelligence || 0);   // A17: INT
    data[17][0] = parseInt(character.cool || 0);           // A18: COOL

    // Copy to D column
    data[13][3] = parseInt(character.strength || 0);       // D14
    data[14][3] = parseInt(character.endurance || 0);      // D15
    data[15][3] = parseInt(character.agility || 0);        // D16
    data[16][3] = parseInt(character.intelligence || 0);   // D17
    data[17][3] = parseInt(character.cool || 0);           // D18

    // Attribute Saves (F column)
    data[14][5] = parseInt(character.endurance_save || character.endurance || 0);    // F15
    data[15][5] = parseInt(character.agility_save || character.agility || 0);        // F16
    data[16][5] = parseInt(character.intelligence_save || character.intelligence || 0); // F17
    data[17][5] = parseInt(character.cool_save || character.cool || 0);              // F18

    // Rows 13-15 (index 12-14): Power stats
    data[12][10] = parseInt(character.power_level || 0);   // K13: Power Level
    data[13][10] = parseInt(character.hits || 0);          // K14: Hits
    data[14][10] = character.initiative || '';             // K15: Initiative

    // Rows 13-17 (index 12-16): Defenses
    data[12][13] = character.base_hth || '';               // N13: Base HTH
    data[13][13] = parseInt(character.carrying_capacity || 0); // N14
    data[14][13] = parseInt(character.physical_defense || 0);  // N15
    data[15][13] = parseInt(character.mental_defense || 0);    // N16
    data[16][13] = parseInt(character.inventing_points || 0);  // N17

    // Rows 21/23 (index 20/22): Movement
    data[20][13] = parseInt(character.move || 0);          // N21: Move
    data[22][13] = parseFloat(character.healing_rate || 0); // N23: Healing Rate

    // Rows 32-34 (index 31-33): Capacities
    data[31][13] = parseInt(character.bc_capacity || 0);   // N32: BC Cap
    data[32][13] = parseInt(character.ability_capacity || 0); // N33: Ability Cap
    data[33][13] = parseInt(character.damage_capacity || 0);   // N34: Damage Cap

    // Row 39 (index 38): Total CP
    data[38][0] = parseInt(character.total_cp || 0);       // A39: Total CP

    // Convert to worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
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

    console.log('✅ Sheet 2 created with', data.length, 'rows');
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
