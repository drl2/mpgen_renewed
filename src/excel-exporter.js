/**
 * Excel Exporter Module
 * Converts character objects to Excel workbooks matching legacy MPGEN format
 * Uses SheetJS library for Excel generation
 */

import { TEMPLATE_LABELS } from './excel-template-data.js';

export class ExcelExporter {
  /**
   * Export character to Excel file with all template sheets
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

      // Create all sheets matching template structure:
      // 1. MPGen Character - populated with extended data
      const sheet1 = this.createMPGenCharacterSheet(character);
      
      // 2. Excel Record Sheet Instructions - empty/placeholder
      const sheet2 = this.createInstructionsSheet();
      
      // 3. Excel Record Sheet - populated with basic data
      const sheet3 = this.createExcelRecordSheet(character);

      console.log('📋 All sheets created');

      // Add sheets to workbook in template order
      XLSX.utils.book_append_sheet(workbook, sheet1, 'MPGen Character');
      XLSX.utils.book_append_sheet(workbook, sheet2, 'Excel Record Sheet Instructions');
      XLSX.utils.book_append_sheet(workbook, sheet3, 'Excel Record Sheet');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${characterName}_MPGen_${timestamp}.xlsx`;

      // Write file
      XLSX.writeFile(workbook, filename);

      console.log('✅ File written with 3 sheets:', filename);

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
   * Create "Excel Record Sheet Instructions" - Information sheet
   * Placeholder sheet with formatting
   * @returns {Object} XLSX worksheet
   */
  static createInstructionsSheet() {
    console.log('📊 Creating Excel Record Sheet Instructions sheet');
    
    // Create simple placeholder data
    const data = [];
    for (let i = 0; i < 5; i++) {
      data[i] = [];
      for (let j = 0; j < 10; j++) {
        data[i][j] = '';
      }
    }

    // Convert to worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Set column widths
    ws['!cols'] = [
      { wch: 15 }, // A
      { wch: 15 }, // B
      { wch: 15 }, // C
      { wch: 15 }, // D
      { wch: 15 }, // E
      { wch: 15 }, // F
      { wch: 15 }, // G
      { wch: 15 }, // H
      { wch: 15 }, // I
      { wch: 15 }, // J
    ];

    console.log('✅ Instructions sheet created');
    return ws;
  }

  /**
   * Create "Excel Record Sheet" - Official Format with Formatting
   * Using array-of-arrays format with cell styling
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
    
    // Apply formatting to data cells
    const cellsToFormat = [
      'D4', 'Q4', 'D5', 'Q5', 'D6', 'Q6', 'D7', 'F8',
      'G12', 'G13', 'A33', 'A34', 'A35', 'A36', 'A37', 'E40'
    ];
    
    cellsToFormat.forEach(cellRef => {
      if (ws[cellRef]) {
        ws[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          },
          fill: { fgColor: { rgb: 'FFFFFF' } },
          font: { name: 'Calibri', sz: 11 },
          alignment: { horizontal: 'left', vertical: 'center', wrapText: false }
        };
      }
    });
    
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
      { wch: 20 }, // Q
    ];
    
    // Set row heights
    ws['!rows'] = [];
    for (let i = 0; i < 41; i++) {
      ws['!rows'][i] = { hpt: 15 };
    }

    console.log('✅ Sheet 1 created with', data.length, 'rows and formatting applied');
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
    
    // Create 2D array - ensure at least 16 columns (0-15)
    const data = [];
    for (let i = 0; i < 41; i++) {
      data[i] = [];
      for (let j = 0; j < 16; j++) {
        data[i][j] = '';
      }
    }

    // Template labels
    const labels = TEMPLATE_LABELS.strings;
    
    // Row 1 (index 0): Title row
    data[0][0] = labels[0];   // A1: Character Name
    data[0][10] = labels[1];  // K1: Player

    // Row 3 (index 2): Basic info line 1 - A,C,D on left; I,J,M on right
    data[2][0] = labels[2];   // A3: Side
    data[2][2] = labels[3];   // C3: Birthplace (label)
    data[2][3] = character.biological_sex || '';  // D3: Side (data)
    data[2][8] = labels[3];   // I3: Birthplace (label)
    data[2][9] = character.birth_place || '';     // J3: Birthplace (data)
    data[2][12] = labels[4];  // M3: Wealth (label)
    data[2][13] = character.wealth || '';         // N3: Wealth (data)

    // Row 4 (index 3): Basic info line 2
    data[3][0] = labels[5];   // A4: Species
    data[3][2] = labels[6];   // C4: Culture (label)
    data[3][3] = character.species || '';  // D4: Species (data)
    data[3][8] = labels[6];   // I4: Culture (label)
    data[3][9] = character.culture || '';  // J4: Culture (data)
    data[3][12] = labels[7];  // M4: Luck (label)
    data[3][13] = character.luck || '';    // N4: Luck (data)

    // Row 5 (index 4): Age / Gender
    data[4][0] = labels[8];   // A5: Age
    data[4][2] = labels[9];   // C5: Gender (label)
    data[4][3] = parseInt(character.age || 0);    // D5: Age (data)
    data[4][8] = labels[9];   // I5: Gender (label)
    data[4][9] = character.gender || '';   // J5: Gender (data)

    // Row 6 (index 5): Weight / Mass
    data[5][0] = labels[10];  // A6: Weight
    data[5][2] = labels[11];  // C6: Mass (label)
    data[5][3] = parseInt(character.weight || 0); // D6: Weight (data)
    data[5][8] = labels[11];  // I6: Mass (label)
    data[5][9] = character.mass || '';    // J6: Mass (data)

    // Row 8 (index 7): Motivation
    data[7][0] = labels[12];  // A8: Motivation
    data[7][3] = character.motivation || '';      // D8: Motivation (data)

    // Row 9 (index 8): Background
    data[8][0] = labels[13];  // A9: Background
    data[8][3] = character.background || '';      // D9: Background (data)

    // Row 10 (index 9): Origin Type
    data[9][0] = labels[14];  // A10: Origin Type
    data[9][3] = character.origin_type || '';     // D10: Origin Type (data)

    // Row 13 (index 12): Attribute headers
    data[12][0] = labels[15]; // A13: CP
    data[12][2] = labels[16]; // C13: BC
    data[12][3] = labels[17]; // D13: Score
    data[12][5] = labels[18]; // F13: Save
    data[12][8] = labels[19]; // I13: Power
    data[12][12] = labels[20];// M13: Base HTH

    // Row 14 (index 13): ST Attribute
    data[13][2] = labels[21]; // C14: ST
    data[13][3] = parseInt(character.strength || 0);     // D14: ST (data)
    data[13][8] = labels[22]; // I14: Hits
    data[13][9] = parseInt(character.hits || 0);         // J14: Hits (data)
    data[13][12] = labels[23];// M14: Carrying Capacity
    data[13][13] = parseInt(character.carrying_capacity || 0); // N14: CC (data)

    // Row 15 (index 14): EN Attribute
    data[14][2] = labels[24]; // C15: EN
    data[14][3] = parseInt(character.endurance || 0);    // D15: EN (data)
    data[14][5] = parseInt(character.endurance_save || character.endurance || 0); // F15: EN save
    data[14][8] = labels[25]; // I15: Initiative
    data[14][9] = character.initiative || '';            // J15: Initiative (data)
    data[14][12] = labels[26];// M15: Physical Defense
    data[14][13] = parseInt(character.physical_defense || 0); // N15: PD (data)

    // Row 16 (index 15): AG Attribute
    data[15][2] = labels[27]; // C16: AG
    data[15][3] = parseInt(character.agility || 0);      // D16: AG (data)
    data[15][5] = parseInt(character.agility_save || character.agility || 0); // F16: AG save
    data[15][8] = labels[28]; // I16: AG To Hit
    data[15][12] = labels[29];// M16: Mental Defense
    data[15][13] = parseInt(character.mental_defense || 0); // N16: MD (data)

    // Row 17 (index 16): IN Attribute
    data[16][2] = labels[30]; // C17: IN
    data[16][3] = parseInt(character.intelligence || 0); // D17: IN (data)
    data[16][5] = parseInt(character.intelligence_save || character.intelligence || 0); // F17: IN save
    data[16][8] = labels[31]; // I17: IN To Hit
    data[16][12] = labels[32];// M17: Inventing Points
    data[16][13] = parseInt(character.inventing_points || 0); // N17: IP (data)

    // Row 18 (index 17): CL Attribute
    data[17][2] = labels[33]; // C18: CL
    data[17][3] = parseInt(character.cool || 0);         // D18: CL (data)
    data[17][5] = parseInt(character.cool_save || character.cool || 0); // F18: CL save
    data[17][8] = labels[34]; // I18: CL To Hit

    // Row 21 (index 20): Ability
    data[20][2] = labels[35]; // C21: Ability

    // Row 21 (index 20): Movement (Ground)
    data[20][12] = labels[36];// M21: Move (Ground)
    data[20][13] = parseInt(character.move || 0);        // N21: Move (data)

    // Row 22 (index 21): Leap
    data[21][12] = labels[37];// M22: Move (Leap)
    data[21][13] = parseFloat(character.healing_rate || 0); // N22: Leap (data)

    // Row 39 (index 38): Total CP
    data[38][0] = labels[47]; // A39: Total CP
    data[38][3] = parseInt(character.total_cp || 0);     // D39: Total CP (data)

    // Convert to worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Apply formatting to all cells with content
    const allCells = Object.keys(ws).filter(k => !k.startsWith('!'));
    allCells.forEach(cellRef => {
      if (ws[cellRef] && typeof ws[cellRef] === 'object') {
        ws[cellRef].s = {
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          },
          fill: { fgColor: { rgb: 'FFFFFF' } },
          font: { name: 'Calibri', sz: 11 },
          alignment: { horizontal: 'left', vertical: 'center', wrapText: false }
        };
      }
    });
    
    // Set column widths from template data
    ws['!cols'] = TEMPLATE_LABELS.sheet1.columnWidths.map(w => ({ wch: w }));
    
    // Set row heights
    ws['!rows'] = [];
    for (let i = 0; i < 41; i++) {
      ws['!rows'][i] = { hpt: 15 };
    }

    console.log('✅ MPGen Character sheet created with template labels and formatting');
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
