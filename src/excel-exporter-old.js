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
    
    // Create data array for instruction text - need at least 20 rows for content
    const data = [];
    for (let i = 0; i < 25; i++) {
      data[i] = [];
      for (let j = 0; j < 10; j++) {
        data[i][j] = '';
      }
    }

    // Add instruction content from template
    const instructions = TEMPLATE_LABELS.sheet2.content;
    instructions.forEach(item => {
      // row and col are 1-based in template data, convert to 0-based
      const rowIdx = item.row - 1;
      const colIdx = item.col - 1;
      if (rowIdx < data.length && colIdx < data[rowIdx].length) {
        data[rowIdx][colIdx] = item.value;
      }
    });

    // Convert to worksheet
    const ws = XLSX.utils.aoa_to_sheet(data);
    
    // Apply formatting to text cells
    instructions.forEach(item => {
      const rowIdx = item.row - 1;
      const colIdx = item.col - 1;
      const cellAddr = XLSX.utils.encode_cell({ r: rowIdx, c: colIdx });
      
      if (ws[cellAddr]) {
        ws[cellAddr].s = {
          font: { name: 'Calibri', sz: 11 },
          alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
          border: {
            top: { style: 'thin', color: { rgb: '000000' } },
            bottom: { style: 'thin', color: { rgb: '000000' } },
            left: { style: 'thin', color: { rgb: '000000' } },
            right: { style: 'thin', color: { rgb: '000000' } }
          },
          fill: { fgColor: { rgb: 'FFFFFF' } }
        };
      }
    });
    
    // Set column widths from template
    ws['!cols'] = TEMPLATE_LABELS.sheet2.columnWidths.map(w => ({ wch: w }));
    
    // Set row heights for instruction rows
    ws['!rows'] = [];
    for (let i = 0; i < 25; i++) {
      ws['!rows'][i] = { hpt: 15 };
    }

    console.log('✅ Instructions sheet created with', instructions.length, 'instruction blocks');
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
    
    // Create worksheet object manually (not using aoa_to_sheet to preserve styling)
    const ws = {};
    
    // Template labels
    const labels = TEMPLATE_LABELS.strings;
    
    // Helper function to create and style a cell
    const createCell = (cellAddr, value, style = null) => {
      let cellObj;
      
      if (typeof value === 'number') {
        cellObj = { t: 'n', v: value };
      } else if (value === '' || value === null || value === undefined) {
        return; // Don't create empty cells
      } else {
        cellObj = { t: 's', v: String(value) };
      }
      
      // Apply default styling if not specified
      if (style !== false) { // false means don't style this cell
        cellObj.s = style || {
          font: { name: 'Calibri', sz: 11 },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          },
          alignment: { horizontal: 'left', vertical: 'center' },
          fill: { fgColor: { rgb: 'FFFFFF' } }
        };
      }
      
      ws[cellAddr] = cellObj;
    };
    
    // Row 1 (index 0): Title row
    createCell('A1', labels[0]);
    createCell('K1', labels[1]);

    // Row 3 (index 2): Basic info line 1
    createCell('A3', labels[2]);
    createCell('C3', labels[3]);
    createCell('D3', character.biological_sex || '');
    createCell('I3', labels[3]);
    createCell('J3', character.birth_place || '');
    createCell('M3', labels[4]);
    createCell('N3', character.wealth || '');

    // Row 4 (index 3): Basic info line 2
    createCell('A4', labels[5]);
    createCell('C4', labels[6]);
    createCell('D4', character.species || '');
    createCell('I4', labels[6]);
    createCell('J4', character.culture || '');
    createCell('M4', labels[7]);
    createCell('N4', character.luck || '');

    // Row 5 (index 4): Age / Gender
    createCell('A5', labels[8]);
    createCell('C5', labels[9]);
    createCell('D5', parseInt(character.age || 0));
    createCell('I5', labels[9]);
    createCell('J5', character.gender || '');

    // Row 6 (index 5): Weight / Mass
    createCell('A6', labels[10]);
    createCell('C6', labels[11]);
    createCell('D6', parseInt(character.weight || 0));
    createCell('I6', labels[11]);
    createCell('J6', character.mass || '');

    // Row 8 (index 7): Motivation
    createCell('A8', labels[12]);
    createCell('D8', character.motivation || '');

    // Row 9 (index 8): Background
    createCell('A9', labels[13]);
    createCell('D9', character.background || '');

    // Row 10 (index 9): Origin Type
    createCell('A10', labels[14]);
    createCell('D10', character.origin_type || '');

    // Row 13 (index 12): Attribute headers
    createCell('A13', labels[15]);
    createCell('C13', labels[16]);
    createCell('D13', labels[17]);
    createCell('F13', labels[18]);
    createCell('I13', labels[19]);
    createCell('M13', labels[20]);

    // Row 14 (index 13): ST Attribute
    createCell('C14', labels[21]);
    createCell('D14', parseInt(character.strength || 0));
    createCell('I14', labels[22]);
    createCell('J14', parseInt(character.hits || 0));
    createCell('M14', labels[23]);
    createCell('N14', parseInt(character.carrying_capacity || 0));

    // Row 15 (index 14): EN Attribute
    createCell('C15', labels[24]);
    createCell('D15', parseInt(character.endurance || 0));
    createCell('F15', parseInt(character.endurance_save || character.endurance || 0));
    createCell('I15', labels[25]);
    createCell('J15', character.initiative || '');
    createCell('M15', labels[26]);
    createCell('N15', parseInt(character.physical_defense || 0));

    // Row 16 (index 15): AG Attribute
    createCell('C16', labels[27]);
    createCell('D16', parseInt(character.agility || 0));
    createCell('F16', parseInt(character.agility_save || character.agility || 0));
    createCell('I16', labels[28]);
    createCell('M16', labels[29]);
    createCell('N16', parseInt(character.mental_defense || 0));

    // Row 17 (index 16): IN Attribute
    createCell('C17', labels[30]);
    createCell('D17', parseInt(character.intelligence || 0));
    createCell('F17', parseInt(character.intelligence_save || character.intelligence || 0));
    createCell('I17', labels[31]);
    createCell('M17', labels[32]);
    createCell('N17', parseInt(character.inventing_points || 0));

    // Row 18 (index 17): CL Attribute
    createCell('C18', labels[33]);
    createCell('D18', parseInt(character.cool || 0));
    createCell('F18', parseInt(character.cool_save || character.cool || 0));
    createCell('I18', labels[34]);

    // Row 21 (index 20): Ability
    createCell('C21', labels[35]);

    // Row 21 (index 20): Movement (Ground)
    createCell('M21', labels[36]);
    createCell('N21', parseInt(character.move || 0));

    // Row 22 (index 21): Leap
    createCell('M22', labels[37]);
    createCell('N22', parseFloat(character.healing_rate || 0));

    // Row 39 (index 38): Total CP
    createCell('A39', labels[47]);
    createCell('D39', parseInt(character.total_cp || 0));
    
    // Set worksheet reference range
    ws['!ref'] = 'A1:N39';
    
    // Set column widths from template data
    ws['!cols'] = TEMPLATE_LABELS.sheet1.columnWidths.map(w => ({ wch: w }));
    
    // Set row heights
    ws['!rows'] = [];
    for (let i = 0; i < 41; i++) {
      ws['!rows'][i] = { hpt: 15 };
    }

    console.log('✅ MPGen Character sheet created with template labels, borders, and formatting');
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
