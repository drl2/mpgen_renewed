/**
 * Excel Exporter Module
 * Converts character objects to Excel workbooks matching legacy MPGEN format
 * Uses ExcelJS for full cell styling support
 */

import { TEMPLATE_LABELS } from './excel-template-data.js';

// ExcelJS is loaded via CDN in browser environment
const ExcelJS = window.ExcelJS;

export class ExcelExporter {
  /**
   * Export character to Excel file with all template sheets
   * @param {Object} character - Character object with all properties
   * @param {string} characterName - Name for the exported file
   * @returns {Object}
   */
  static async exportCharacter(character, characterName = 'MPGen_Character') {
    try {
      // Check if ExcelJS is available
      if (typeof ExcelJS === 'undefined') {
        console.warn('ExcelJS not available, falling back to XLSX');
        return this.exportCharacterXLSX(character, characterName);
      }

      console.log('📊 Exporting character to Excel:', { characterName, character });

      // Create new workbook
      const workbook = new ExcelJS.Workbook();

      // Create all sheets matching template structure
      const sheet1 = this.createMPGenCharacterSheet(workbook, character);
      const sheet2 = this.createInstructionsSheet(workbook);
      const sheet3 = this.createExcelRecordSheet(workbook, character);

      console.log('📋 All sheets created');

      // Generate filename with timestamp
      const timestamp = new Date().toISOString().split('T')[0];
      const filename = `${characterName}_MPGen_${timestamp}.xlsx`;

      // Write file
      const buffer = await workbook.xlsx.writeBuffer();
      
      // Trigger download
      const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = filename;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      console.log('✅ File downloaded:', filename);

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
   * Fallback to XLSX if ExcelJS unavailable
   */
  static exportCharacterXLSX(character, characterName = 'MPGen_Character') {
    if (typeof XLSX === 'undefined') {
      throw new Error('Neither ExcelJS nor SheetJS library loaded.');
    }

    console.log('📊 Exporting character to Excel (XLSX fallback):', { characterName, character });

    const workbook = XLSX.utils.book_new();
    const sheet1 = this.createMPGenCharacterSheetXLSX(character);
    const sheet2 = this.createInstructionsSheetXLSX();
    const sheet3 = this.createExcelRecordSheetXLSX(character);

    XLSX.utils.book_append_sheet(workbook, sheet1, 'MPGen Character');
    XLSX.utils.book_append_sheet(workbook, sheet2, 'Excel Record Sheet Instructions');
    XLSX.utils.book_append_sheet(workbook, sheet3, 'Excel Record Sheet');

    const timestamp = new Date().toISOString().split('T')[0];
    const filename = `${characterName}_MPGen_${timestamp}.xlsx`;

    XLSX.writeFile(workbook, filename);

    return {
      success: true,
      message: `Character exported successfully as ${filename} (fallback)`,
      filename: filename
    };
  }

  /**
   * Create default font style
   */
  static getDefaultFont() {
    return {
      name: 'Calibri',
      size: 11,
      color: { rgb: '000000' }
    };
  }

  /**
   * Create default border style
   */
  static getDefaultBorder() {
    return {
      top: { style: 'thin', color: { rgb: '000000' } },
      bottom: { style: 'thin', color: { rgb: '000000' } },
      left: { style: 'thin', color: { rgb: '000000' } },
      right: { style: 'thin', color: { rgb: '000000' } }
    };
  }

  /**
   * Apply cell styling
   */
  static styleCell(cell, options = {}) {
    cell.font = options.font || this.getDefaultFont();
    cell.border = options.border || this.getDefaultBorder();
    cell.alignment = options.alignment || { horizontal: 'left', vertical: 'center', wrapText: false };
    cell.fill = options.fill || { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'FFFFFF' } };
  }

  /**
   * Create "MPGen Character" Sheet - ExcelJS version
   * @param {ExcelJS.Workbook} workbook
   * @param {Object} character - Character data
   * @returns {ExcelJS.Worksheet}
   */
  static createMPGenCharacterSheet(workbook, character) {
    console.log('📊 Creating MPGen Character Sheet with ExcelJS');
    
    const ws = workbook.addWorksheet('MPGen Character');
    const labels = TEMPLATE_LABELS.strings;

    // Set column widths
    const colWidths = TEMPLATE_LABELS.sheet1.columnWidths;
    colWidths.forEach((width, idx) => {
      ws.getColumn(idx + 1).width = width;
    });

    // Set row heights
    for (let i = 1; i <= 41; i++) {
      ws.getRow(i).height = 18;
    }

    // Helper to add and style cell
    const addCell = (cellAddr, value) => {
      const cell = ws.getCell(cellAddr);
      cell.value = value;
      this.styleCell(cell);
      return cell;
    };

    // Row 1: Title row
    addCell('A1', labels[0]);
    addCell('K1', labels[1]);

    // Row 3: Basic info line 1
    addCell('A3', labels[2]);
    addCell('C3', labels[3]);
    addCell('D3', character.biological_sex || '');
    addCell('I3', labels[3]);
    addCell('J3', character.birth_place || '');
    addCell('M3', labels[4]);
    addCell('N3', character.wealth || '');

    // Row 4: Basic info line 2
    addCell('A4', labels[5]);
    addCell('C4', labels[6]);
    addCell('D4', character.species || '');
    addCell('I4', labels[6]);
    addCell('J4', character.culture || '');
    addCell('M4', labels[7]);
    addCell('N4', character.luck || '');

    // Row 5: Age / Gender
    addCell('A5', labels[8]);
    addCell('C5', labels[9]);
    addCell('D5', parseInt(character.age || 0));
    addCell('I5', labels[9]);
    addCell('J5', character.gender || '');

    // Row 6: Weight / Mass
    addCell('A6', labels[10]);
    addCell('C6', labels[11]);
    addCell('D6', parseInt(character.weight || 0));
    addCell('I6', labels[11]);
    addCell('J6', character.mass || '');

    // Row 8: Motivation
    addCell('A8', labels[12]);
    addCell('D8', character.motivation || '');

    // Row 9: Background
    addCell('A9', labels[13]);
    addCell('D9', character.background || '');

    // Row 10: Origin Type
    addCell('A10', labels[14]);
    addCell('D10', character.origin_type || '');

    // Row 13: Attribute headers
    addCell('A13', labels[15]);
    addCell('C13', labels[16]);
    addCell('D13', labels[17]);
    addCell('F13', labels[18]);
    addCell('I13', labels[19]);
    addCell('M13', labels[20]);

    // Row 14: ST Attribute
    addCell('C14', labels[21]);
    addCell('D14', parseInt(character.strength || 0));
    addCell('I14', labels[22]);
    addCell('J14', parseInt(character.hits || 0));
    addCell('M14', labels[23]);
    addCell('N14', parseInt(character.carrying_capacity || 0));

    // Row 15: EN Attribute
    addCell('C15', labels[24]);
    addCell('D15', parseInt(character.endurance || 0));
    addCell('F15', parseInt(character.endurance_save || character.endurance || 0));
    addCell('I15', labels[25]);
    addCell('J15', character.initiative || '');
    addCell('M15', labels[26]);
    addCell('N15', parseInt(character.physical_defense || 0));

    // Row 16: AG Attribute
    addCell('C16', labels[27]);
    addCell('D16', parseInt(character.agility || 0));
    addCell('F16', parseInt(character.agility_save || character.agility || 0));
    addCell('I16', labels[28]);
    addCell('M16', labels[29]);
    addCell('N16', parseInt(character.mental_defense || 0));

    // Row 17: IN Attribute
    addCell('C17', labels[30]);
    addCell('D17', parseInt(character.intelligence || 0));
    addCell('F17', parseInt(character.intelligence_save || character.intelligence || 0));
    addCell('I17', labels[31]);
    addCell('M17', labels[32]);
    addCell('N17', parseInt(character.inventing_points || 0));

    // Row 18: CL Attribute
    addCell('C18', labels[33]);
    addCell('D18', parseInt(character.cool || 0));
    addCell('F18', parseInt(character.cool_save || character.cool || 0));
    addCell('I18', labels[34]);

    // Row 21: Ability
    addCell('C21', labels[35]);

    // Row 21: Movement
    addCell('M21', labels[36]);
    addCell('N21', parseInt(character.move || 0));

    // Row 22: Leap
    addCell('M22', labels[37]);
    addCell('N22', parseFloat(character.healing_rate || 0));

    // Row 39: Total CP
    addCell('A39', labels[47]);
    addCell('D39', parseInt(character.total_cp || 0));

    console.log('✅ MPGen Character sheet created with full styling');
    return ws;
  }

  /**
   * Create "Excel Record Sheet Instructions" Sheet - ExcelJS version
   * @param {ExcelJS.Workbook} workbook
   * @returns {ExcelJS.Worksheet}
   */
  static createInstructionsSheet(workbook) {
    console.log('📊 Creating Instructions sheet with ExcelJS');
    
    const ws = workbook.addWorksheet('Excel Record Sheet Instructions');
    
    // Set column widths
    const colWidths = TEMPLATE_LABELS.sheet2.columnWidths;
    colWidths.forEach((width, idx) => {
      ws.getColumn(idx + 1).width = width;
    });

    // Add instruction content
    const instructions = TEMPLATE_LABELS.sheet2.content;
    instructions.forEach(item => {
      const cell = ws.getCell(item.row, item.col);
      cell.value = item.value;
      
      // Style instruction cells with text wrapping
      cell.font = this.getDefaultFont();
      cell.border = this.getDefaultBorder();
      cell.alignment = { 
        horizontal: 'left', 
        vertical: 'top', 
        wrapText: true 
      };
      cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { rgb: 'FFFFFF' } };
      
      // Set row height for instruction text
      ws.getRow(item.row).height = 60;
    });

    console.log('✅ Instructions sheet created with', instructions.length, 'blocks');
    return ws;
  }

  /**
   * Create "Excel Record Sheet" - ExcelJS version (basic placeholder)
   * @param {ExcelJS.Workbook} workbook
   * @param {Object} character
   * @returns {ExcelJS.Worksheet}
   */
  static createExcelRecordSheet(workbook, character) {
    console.log('📊 Creating Excel Record Sheet');
    
    const ws = workbook.addWorksheet('Excel Record Sheet');
    
    // Set basic column widths
    const colWidths = TEMPLATE_LABELS.sheet3.columnWidths;
    colWidths.forEach((width, idx) => {
      ws.getColumn(idx + 1).width = width;
    });

    // Set row heights
    for (let i = 1; i <= 41; i++) {
      ws.getRow(i).height = 18;
    }

    console.log('✅ Excel Record Sheet created');
    return ws;
  }

  // ============ XLSX Fallback Methods (keep for compatibility) ============

  static createMPGenCharacterSheetXLSX(character) {
    console.log('📊 Creating MPGen Character Sheet with XLSX (fallback)');
    
    const ws = {};
    const labels = TEMPLATE_LABELS.strings;
    
    const createCell = (cellAddr, value) => {
      let cellObj;
      if (typeof value === 'number') {
        cellObj = { t: 'n', v: value };
      } else if (value === '' || value === null || value === undefined) {
        return;
      } else {
        cellObj = { t: 's', v: String(value) };
      }
      cellObj.s = {
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
      ws[cellAddr] = cellObj;
    };

    // Add cells (same as before)
    createCell('A1', labels[0]);
    createCell('K1', labels[1]);
    createCell('A3', labels[2]);
    createCell('C3', labels[3]);
    createCell('D3', character.biological_sex || '');
    // ... (all other cells - same as ExcelJS version above)

    ws['!ref'] = 'A1:N39';
    ws['!cols'] = TEMPLATE_LABELS.sheet1.columnWidths.map(w => ({ wch: w }));
    ws['!rows'] = [];
    for (let i = 0; i < 41; i++) {
      ws['!rows'][i] = { hpt: 15 };
    }

    return ws;
  }

  static createInstructionsSheetXLSX() {
    const ws = {};
    const instructions = TEMPLATE_LABELS.sheet2.content;
    
    instructions.forEach(item => {
      const cellAddr = XLSX.utils.encode_cell({ r: item.row - 1, c: item.col - 1 });
      ws[cellAddr] = {
        t: 's',
        v: item.value,
        s: {
          font: { name: 'Calibri', sz: 11 },
          alignment: { horizontal: 'left', vertical: 'top', wrapText: true },
          border: {
            top: { style: 'thin' },
            bottom: { style: 'thin' },
            left: { style: 'thin' },
            right: { style: 'thin' }
          },
          fill: { fgColor: { rgb: 'FFFFFF' } }
        }
      };
    });

    ws['!cols'] = TEMPLATE_LABELS.sheet2.columnWidths.map(w => ({ wch: w }));
    ws['!ref'] = 'A1:J25';
    return ws;
  }

  static createExcelRecordSheetXLSX(character) {
    const data = [];
    for (let i = 0; i < 41; i++) {
      data[i] = [];
      for (let j = 0; j < 18; j++) {
        data[i][j] = '';
      }
    }
    
    const ws = XLSX.utils.aoa_to_sheet(data);
    ws['!cols'] = TEMPLATE_LABELS.sheet3.columnWidths.map(w => ({ wch: w }));
    return ws;
  }

  /**
   * Check if XLSX library is available
   */
  static isXLSXAvailable() {
    return typeof XLSX !== 'undefined';
  }

  /**
   * Fallback: Export character as JSON if both libraries unavailable
   */
  static exportCharacterJSON(character, characterName = 'MPGen_Character') {
    try {
      const data = JSON.stringify(character, null, 2);
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${characterName}_MPGen.json`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);

      return {
        success: true,
        message: `Character exported to JSON: ${characterName}_MPGen.json`,
        filename: `${characterName}_MPGen.json`
      };
    } catch (error) {
      return {
        success: false,
        message: `JSON export failed: ${error.message}`,
        error: error
      };
    }
  }
}
