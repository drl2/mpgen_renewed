/**
 * Excel Export Module - Uses xlsx-populate for full styling support
 * Exports character data to formatted Excel workbook with all 3 sheets
 */

import { TEMPLATE_LABELS } from './excel-template-data.js';

// Get xlsx-populate from global scope (loaded via CDN in HTML)
// Defer access to avoid errors during module loading
function getXlsxPopulate() {
  if (typeof window !== 'undefined' && window.XlsxPopulate) {
    return window.XlsxPopulate;
  }
  throw new Error('xlsx-populate library not loaded. Check that the CDN script is included in HTML.');
}

/**
 * Standard styling for labels and headers
 */
const LABEL_STYLE = {
  bold: true,
  fontSize: 11,
  fontFamily: 'Calibri',
  fill: 'd9e1f2',  // Light blue background from template
  border: {
    top: { style: 'thin', color: '000000' },
    bottom: { style: 'thin', color: '000000' },
    left: { style: 'thin', color: '000000' },
    right: { style: 'thin', color: '000000' }
  },
  horizontalAlignment: 'left',
  verticalAlignment: 'center'
};

const DATA_CELL_STYLE = {
  fontSize: 11,
  fontFamily: 'Calibri',
  border: {
    top: { style: 'thin', color: '000000' },
    bottom: { style: 'thin', color: '000000' },
    left: { style: 'thin', color: '000000' },
    right: { style: 'thin', color: '000000' }
  },
  horizontalAlignment: 'left',
  verticalAlignment: 'center'
};

/**
 * Main export function
 * @param {Object} character - Character data object
 * @returns {Promise<void>}
 */
export async function exportCharacter(character) {
  try {
    const XlsxPopulate = getXlsxPopulate();
    const workbook = await XlsxPopulate.fromBlankAsync();
    
    // Rename default sheet and add two more (don't delete all, one must remain)
    const sheet1 = workbook.sheet(0).name('MPGen Character');
    const sheet2 = workbook.addSheet('Excel Record Sheet Instructions');
    const sheet3 = workbook.addSheet('Excel Record Sheet');
    
    // Configure Sheet 1 (Character data)
    configureSheet1(sheet1, character);
    
    // Configure Sheet 2 (Instructions)
    configureSheet2(sheet2);
    
    // Configure Sheet 3 (Record sheet - will be blank in most cases)
    configureSheet3(sheet3);
    
    // Generate filename with character name and timestamp
    const timestamp = new Date().toISOString().slice(0, 10);
    const fileName = `${character.name || 'Character'}_${timestamp}.xlsx`;
    
    // Write file and trigger download
    const buffer = await workbook.toFileAsync();
    triggerDownload(buffer, fileName);
    
    console.log('✅ Excel export completed:', fileName);
  } catch (error) {
    console.error('❌ Excel export failed:', error);
    throw new Error(`Excel export failed: ${error.message}`);
  }
}

/**
 * Configure Sheet 1 with character data
 */
function configureSheet1(sheet, character) {
  const { strings, sheet1: sheet1Config } = TEMPLATE_LABELS;
  const { columnWidths, labels } = sheet1Config;
  
  // Set column widths
  columnWidths.forEach((width, index) => {
    sheet.column(index + 1).width(width);
  });
  
  // Set default row height
  sheet.row(1).height(18);
  
  // Apply labels and data to cells based on template mapping
  
  for (const [cellAddress, labelIndex] of Object.entries(labels)) {
    const labelText = strings[labelIndex];
    const cell = sheet.cell(cellAddress);
    
    // Set label text
    cell.value(labelText);
    
    // Apply label styling
    applyStyle(cell, LABEL_STYLE);
    
    // Auto-fit height for wrapped labels
    const row = cellAddress.charCodeAt(0) >= 65 ? parseInt(cellAddress.substring(1)) : 1;
    if (row === 1) {
      sheet.row(row).height(22);
    }
  }
  
  // Populate character data next to labels
  const dataMapping = {
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
  
  // Apply data to cells
  for (const [cellAddress, value] of Object.entries(dataMapping)) {
    if (value !== undefined && value !== null) {
      const cell = sheet.cell(cellAddress);
      cell.value(value);
      applyStyle(cell, DATA_CELL_STYLE);
    }
  }
}

/**
 * Configure Sheet 2 with instructions
 */
function configureSheet2(sheet) {
  const { sheet2: sheet2Config } = TEMPLATE_LABELS;
  const { columnWidths: sheet2Widths } = sheet2Config;
  
  // Set column widths if available
  if (sheet2Widths) {
    sheet2Widths.slice(0, 10).forEach((width, index) => {
      sheet.column(index + 1).width(width);
    });
  } else {
    // Default widths for sheet 2
    sheet.column(2).width(50);
  }
  
  // Add title in B1
  const titleCell = sheet.cell('B1');
  titleCell.value('Instructions for Using the Excel Record Sheet');
  titleCell.style({
    bold: true,
    fontSize: 14,
    fontFamily: 'Calibri'
  });
  sheet.row(1).height(20);
  
  // Add instruction blocks from template
  const instructionStyle = {
    fontSize: 11,
    fontFamily: 'Calibri',
    wrapText: true,
    verticalAlignment: 'top'
  };
  
  TEMPLATE_LABELS.sheet2.content.forEach(({ row, col, value }) => {
    const cell = sheet.cell(row, col);
    cell.value(value);
    applyStyle(cell, instructionStyle);
    
    // Set row height for wrapped text
    sheet.row(row).height(60);
  });
}

/**
 * Configure Sheet 3 (Record sheet - minimal configuration)
 */
function configureSheet3(sheet) {
  const { sheet3: sheet3Config } = TEMPLATE_LABELS;
  
  // Set column widths if specified
  if (sheet3Config && sheet3Config.columnWidths) {
    sheet3Config.columnWidths.forEach((width, index) => {
      sheet.column(index + 1).width(width);
    });
  }
  
  // Apply basic styling to first row
  sheet.row(1).height(18);
}

/**
 * Apply style object to a cell
 * @param {Cell} cell - xlsx-populate cell object
 * @param {Object} style - Style object with properties like fontSize, bold, etc.
 */
function applyStyle(cell, style) {
  for (const [key, value] of Object.entries(style)) {
    try {
      cell.style(key, value);
    } catch (error) {
      // Skip invalid style properties
      console.warn(`Warning: Could not apply style property '${key}':`, error.message);
    }
  }
}

/**
 * Trigger file download in browser
 * @param {ArrayBuffer} buffer - File buffer
 * @param {string} fileName - Filename for download
 */
function triggerDownload(buffer, fileName) {
  const blob = new Blob([buffer], { type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

export const ExcelExporter = { exportCharacter };
