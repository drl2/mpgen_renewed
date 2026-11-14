/**
 * Template data extracted from CharTemplate.xlsx
 * Contains all labels, headers, and formatting info
 */

export const TEMPLATE_LABELS = {
  // Shared strings from template
  strings: [
    'Character Name',    // 0
    'Player',            // 1
    'Side',              // 2
    'Birthplace',        // 3
    'Wealth',            // 4
    'Species',           // 5
    'Culture',           // 6
    'Luck',              // 7
    'Age',               // 8
    'Gender',            // 9
    'Weight',            // 10
    'Mass',              // 11
    'Motivation',        // 12
    'Background',        // 13
    'Origin Type',       // 14
    'CP',                // 15
    'BC',                // 16
    'Score',             // 17
    'Save',              // 18
    'Power',             // 19
    'Base HTH',          // 20
    'ST',                // 21
    'Hits',              // 22
    'Carrying Capacity', // 23
    'EN',                // 24
    'Initiative',        // 25
    'Physical Defense',  // 26
    'AG',                // 27
    'AG To Hit',         // 28
    'Mental Defense',    // 29
    'IN',                // 30
    'IN To Hit',         // 31
    'Inventing Points',  // 32
    'CL',                // 33
    'CL To Hit',         // 34
    'Ability',           // 35
    'Move (Ground)',     // 36
    'Move (Leap)',       // 37
    'Healing',           // 38
    'Gear',              // 39
    'Break',             // 40
    'Take',              // 41
    'Disarm',            // 42
    'GBC',               // 43
    'Caps',              // 44
    'Damage',            // 45
    'CP Used',           // 46
    'Total CP'           // 47
  ],

  // Sheet 1 structure: MPGen Character
  sheet1: {
    labels: {
      'A1': 0,    // Character Name
      'K1': 1,    // Player
      'A3': 2,    // Side
      'I3': 3,    // Birthplace
      'M3': 4,    // Wealth
      'A4': 5,    // Species
      'I4': 6,    // Culture
      'M4': 7,    // Luck
      'A5': 8,    // Age
      'I5': 9,    // Gender
      'A6': 10,   // Weight
      'I6': 11,   // Mass
      'A8': 12,   // Motivation
      'A9': 13,   // Background
      'A10': 14,  // Origin Type
      'A13': 15,  // CP
      'C13': 16,  // BC
      'D13': 17,  // Score
      'F13': 18,  // Save
      'I13': 19,  // Power
      'M13': 20,  // Base HTH
      'C14': 21,  // ST
      'I14': 22,  // Hits
      'M14': 23,  // Carrying Capacity
      'C15': 24,  // EN
      'I15': 25,  // Initiative
      'M15': 26,  // Physical Defense
      'C16': 27,  // AG
      'I16': 28,  // AG To Hit
      'M16': 29,  // Mental Defense
      'C17': 30,  // IN
      'I17': 31,  // IN To Hit
      'M17': 32,  // Inventing Points
      'C18': 33,  // CL
      'I18': 34,  // CL To Hit
      'M21': 36,  // Move (Ground)
      'C21': 35,  // Ability
      'M22': 37   // Move (Leap) - has formula
    },
    // Merged cells from template: ranges where data should span multiple columns
    mergedCells: [
      'E1:I1',      // Character Name data span
      'A3:C3',      // Side label span
      'D3:G3',      // Side data span
      'I3:J3',      // Birthplace span
      'A4:C4',      // Species label span
      'D4:G4',      // Species data span
      'I4:J4',      // Culture span
      'A5:C5',      // Age label span
      'D5:G5',      // Age data span
      'I5:J5',      // Gender span
      'A6:C6',      // Weight label span
      'D6:G6',      // Weight data span (no bottom border in template)
      'I6:J6',      // Mass span
      'D8:K8',      // Motivation data span
      'D9:K9',      // Background data span
      'D10:K10',    // Origin Type data span
      'I13:J13',    // Power data span
      'I14:J14',    // Hits data span
      'I15:J15',    // Initiative data span
      'C22:K22',    // Skills/abilities section spans
      'C23:K23',
      'C24:K24',
      'C25:K25',
      'C26:K26',
      'C27:K27',
      'C28:K28',
      'C29:K29',
      'C30:K30',
      'C31:K31',
      'C32:K32',
      'C33:K33',
      'C34:K34',
      'C35:K35',
      'C36:K36'
    ],
    // Column widths from template XML (columns 1-14 have specific widths)
    columnWidths: [5.28, 1.66, 6.23, 6.67, 2.36, 7.92, 4.86, 2.08, 7.36, 4.71, 13.47, 3.05, 16.81, 5.42]
  },

  // Sheet 2: Instructions - Contains user-friendly instructions for using the export
  sheet2: {
    // Instructions text content - instructions are in column B, rows 2-20
    content: [
      { row: 2, col: 2, value: 'The "Excel Record Sheet" tab is designed to allow MPGen-erated characters to be easily pasted into the character sheet from the official Mighty Protectors Excel Record Sheet Pack from Monkey House Games.  This package is not (quite) free but it\'s so useful that it\'s hard to imagine creating and maintaining characters without it.' },
      { row: 4, col: 2, value: 'Unfortunately the steps described here may vary between different spreadsheet apps (and different versions of the same app), so the instructions below will require some familiarity with your choice of spreadsheet software.  (For those in need of spreadsheet software, Google Docs and LibreOffice are excellent free choices for Windows.)' },
      { row: 6, col: 2, value: 'The MPGen discussion page will include gradually-added links to picture-heavy instructions for specific popular software.  Links will also be added under the MHG forum thread.' },
      { row: 8, col: 2, value: 'You will need a copy of the Official MP sheet where protection on the character sheet has been turned off.  By default there are limited limited areas on the sheet that you can edit, but you\'re going to need to be able to select the upper left corner of the character sheet.' },
      { row: 10, col: 2, value: 'Step 1:  If you\'ve created a character in MPGen, downloaded this tile, and opened it in your spreadsheet program, you\'re already done step 1.  Congratulations!' },
      { row: 12, col: 2, value: 'Step 2:  Navigate to the Excel Record Sheet tab and click on the upper-left corner of the grid area – the box to the left of the row letters - to select the entire contents of the tab.  Use your menus or shortcuts (Ctrl-C on Windows) to copy the data.' },
      { row: 14, col: 2, value: 'Step 3:  Make a copy of the MP character sheet file with a new name and open it.  Navigate to the Character Sheet tab and make sure it\'s unprotected.  Click the upper-left-most cell in the grid – not the whole grid this time, but just cell A1.  Effectively you\'ll be selecting the Mighty Protectors logo across the top, which is anchored in that cell.' },
      { row: 16, col: 2, value: 'Step 4:  This is where it can get a little tricky.  In addition to a normal "paste" operation, most spreadsheets have a "paste special" operation.  You\'ll need to "paste special" using whatever option on your software will paste only the data from the clipboard, ignoring formatting information and blank areas (i.e. not overwriting anything important on the character sheet).  Paste into the corner you\'ve selected and all the necessary values should be deposited in the correct locations to let the formulas built into the character sheet do their magic.' },
      { row: 18, col: 2, value: 'Step 5:  Save!' },
      { row: 20, col: 2, value: 'Step 6:  Finish your character!  MPGen does the random work up to section 2.1.1.6 in the manual – you\'ll still need to work out the details of your powers and weaknesses, as well as thinking about an overall character concept and back-story.  Also note that MPGen does not fill out the right-hand sections of the character sheet regarding bonuses and attack Bcs; those will ultimately need to be filled out after you\'ve set up all your powers and allocated all your weakness points.' }
    ],
    columnWidths: [15, 15, 15, 15, 15, 15, 15, 15, 15, 15]
  },

  // Sheet 3: Excel Record Sheet (empty in template)
  sheet3: {
    columnWidths: [5, 10, 10, 15, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 20]
  }
};

export default TEMPLATE_LABELS;
