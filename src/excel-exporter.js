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
 * Matches template: bold, no borders on labels themselves
 */
const LABEL_STYLE = {
  bold: true,
  fontSize: 11,
  fontFamily: 'Calibri',
  // NO borders or fill - labels are plain
  horizontalAlignment: 'left',
  verticalAlignment: 'center'
};

/**
 * Styling for data cells with full borders
 * Matches template: borders on all 4 sides
 */
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
 * Styling for data cells with borders on all sides
 * Used in merged cell data regions
 */
const MERGED_DATA_STYLE = {
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
    // Use outputAsync() for browser (not toFileAsync() which is Node.js only)
    const buffer = await workbook.outputAsync();
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
  const { columnWidths, labels, mergedCells } = sheet1Config;
  
  // Set column widths
  columnWidths.forEach((width, index) => {
    sheet.column(index + 1).width(width);
  });
  
  // Set default row height
  sheet.row(1).height(18);
  
  // Apply merged cells from template
  if (mergedCells && Array.isArray(mergedCells)) {
    mergedCells.forEach(range => {
      try {
        sheet.mergeCells(range);
      } catch (error) {
        console.warn(`Warning: Could not merge cells ${range}:`, error.message);
      }
    });
  }
  
  // Apply labels (without borders - they are plain text)
  for (const [cellAddress, labelIndex] of Object.entries(labels)) {
    const labelText = strings[labelIndex];
    const cell = sheet.cell(cellAddress);
    
    // Set label text
    cell.value(labelText);
    
    // Apply label styling (bold, no borders)
    applyStyle(cell, LABEL_STYLE);
    
    // Auto-fit height for wrapped labels
    const row = cellAddress.charCodeAt(0) >= 65 ? parseInt(cellAddress.substring(1)) : 1;
    if (row === 1) {
      sheet.row(row).height(22);
    }
  }
  
  // Populate character data next to labels
  // These data cells get borders on all sides
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
  // Only add borders to cells that are actual data cells (not part of a merged range's middle)
  const cellsWithBorders = new Set([
    'B1', 'L1', 'B3', 'J3', 'N3', 'B4', 'J4', 'N4', 'B5', 'J5', 'B6', 'J6',
    'B8', 'B9', 'B10', 'B13', 'D13', 'E13', 'G13', 'J13', 'N13', 'D14', 'J14', 'N14',
    'D15', 'J15', 'N15', 'D16', 'J16', 'N16', 'D17', 'J17', 'N17', 'D18', 'J18',
    'D21', 'N21', 'N22'
  ]);
  
  for (const [cellAddress, value] of Object.entries(dataMapping)) {
    if (value !== undefined && value !== null) {
      const cell = sheet.cell(cellAddress);
      cell.value(value);
      
      // Apply data styling with borders
      if (cellsWithBorders.has(cellAddress)) {
        applyStyle(cell, DATA_CELL_STYLE);
      }
    }
  }
  
  // Apply borders to merged cell ranges (border on first cell only)
  const mergedDataRanges = [
    'E1:I1',      // Character Name
    'D3:G3',      // Side data
    'I3:J3',      // Birthplace
    'D4:G4',      // Species data
    'I4:J4',      // Culture
    'D5:G5',      // Age data
    'I5:J5',      // Gender
    'D6:G6',      // Weight data
    'I6:J6',      // Mass
    'D8:K8',      // Motivation
    'D9:K9',      // Background
    'D10:K10'     // Origin Type
  ];
  
  mergedDataRanges.forEach(range => {
    const firstCell = sheet.cell(range.split(':')[0]);
    applyStyle(firstCell, DATA_CELL_STYLE);
  });
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
      // Column B (index 1) needs to be wider for wrapped text instructions
      const columnWidth = index === 1 ? 80 : width;
      sheet.column(index + 1).width(columnWidth);
    });
  } else {
    // Default widths for sheet 2
    sheet.column(2).width(80); // Column B for instructions
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
