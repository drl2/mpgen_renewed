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
    columnWidths: [5.28, 1.66, 6.23, 6.67, 4.58, 4.58, 5.09, 4.58, 4.58, 4.58, 4.58, 4.58, 4.58, 4.58, 4.58, 4.58]
  },

  // Sheet 2: Instructions (mostly empty template)
  sheet2: {
    columnWidths: [15, 15, 15, 15, 15, 15, 15, 15, 15, 15]
  },

  // Sheet 3: Excel Record Sheet (empty in template)
  sheet3: {
    columnWidths: [5, 10, 10, 15, 5, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 10, 20]
  }
};

export default TEMPLATE_LABELS;
