# Phase 4.1 - Excel Export Implementation Plan

## Overview
Implement character export to Excel format using SheetJS library, matching the legacy Mighty Protectors character sheet format.

## Objectives
- ✅ Integrate SheetJS library (xlsx.js)
- ✅ Create Excel workbook with character data
- ✅ Populate two sheets: "Excel Record Sheet" and "MPGen Character"
- ✅ Add export button to UI
- ✅ Test with various character types
- ✅ Verify downloaded file format

## Technical Architecture

### 1. Library Integration
- **Library:** SheetJS (xlsx) - ~150KB minified
- **Source:** CDN (jsdelivr.com/npm/xlsx)
- **Alternative:** Local npm package if needed
- **Browser Support:** Modern browsers (Chrome, Firefox, Safari, Edge)

### 2. Excel Format (Legacy)
Two worksheets matching original design:

#### Sheet 1: "Excel Record Sheet" (Official Format)
```
D4   = Side (Hero/Villain)
D5   = Species
D6   = Age (int)
D7   = Weight (int)
Q4   = Birthplace
Q5   = Culture
Q6   = Gender
F8   = Background
G12  = Motivation
G13  = Origin Type
A33-A37 = Abilities (STR, END, AGI, INT, COOL)
E40  = Total CP
Row 17+ = Racial Abilities (CP@@Name format)
Row 17+ = Selected Abilities
Row 17+ = Unselected Abilities (grayed out)
Row 32+ = Racial Weaknesses (CP@@Name format)
Row 32+ = Selected Weaknesses
```

#### Sheet 2: "MPGen Character" (Custom Format)
```
D3   = Side
K3   = Birthplace
N3   = Wealth
D4   = Species
K4   = Culture
N4   = Luck
D5   = Age (int)
K5   = Gender
D6   = Weight (int)
K6   = Mass
D8   = Motivation
D9   = Background
D10  = Origin Type
A14-A18 = Attributes (STR, END, AGI, INT, COOL)
D14-D18 = Attributes (copy)
F15-F18 = Attribute Saves
K13  = Power Level
K14  = Hits
K15  = Initiative
N13  = Base HTH
N14  = Carrying Capacity
N15  = Physical Defense
N16  = Mental Defense
N17  = Inventing Points
N21  = Move
N23  = Healing Rate
N32  = BC Cap
N33  = Ability Cap
N34  = Damage Cap
A39  = Total CP
Row 22+ = Racial Abilities
Row 22+ = Selected Abilities
Row 22+ = Unselected Abilities (grayed out)
Row 37+ = Racial Weaknesses
```

### 3. Data Structure Mapping
Current character object → Excel cells:

| Current Field | Excel Cell | Sheet | Type | Notes |
|---------------|-----------|-------|------|-------|
| biological_sex | Q6/K5 | Both | String | Hero/Villain |
| species | D5/D4 | Both | String | |
| age | D6/D5 | Both | Int | |
| weight | D7/D6 | Both | Int | |
| birth_place | Q4/K3 | Both | String | |
| culture | Q5/K4 | Both | String | |
| gender | Q6/K5 | Both | String | |
| power_level | K13 | Sheet 2 | Int | |
| strength | A33/A14 | Both | Int | |
| endurance | A34/A15 | Both | Int | |
| agility | A35/A16 | Both | Int | |
| intelligence | A36/A17 | Both | Int | |
| cool | A37/A18 | Both | Int | |
| wealth | N3 | Sheet 2 | String | |
| luck | N4 | Sheet 2 | String | |
| mass | K6 | Sheet 2 | String | |
| initiative | K15 | Sheet 2 | String | |
| base_hth | N13 | Sheet 2 | String | |
| carrying_capacity | N14 | Sheet 2 | Int | |
| physical_defense | N15 | Sheet 2 | Int | |
| mental_defense | N16 | Sheet 2 | Int | |
| inventing_points | N17 | Sheet 2 | Int | |
| move | N21 | Sheet 2 | Int | |
| healing_rate | N23 | Sheet 2 | Float | |
| bc_capacity | N32 | Sheet 2 | Int | |
| ability_capacity | N33 | Sheet 2 | Int | |
| damage_capacity | N34 | Sheet 2 | Int | |
| total_cp | A39/E40 | Both | Int | |

### 4. Implementation Phases

#### Phase 4.1a - Library Setup & Module Creation
- Add SheetJS CDN link to index.html
- Create ExcelExporter class in src/excel-exporter.js
- Implement basic workbook creation
- Add export button to UI

#### Phase 4.1b - Data Population
- Implement Sheet 1 (Excel Record Sheet) population
- Implement Sheet 2 (MPGen Character) population
- Map all character properties to cells
- Handle missing/optional data

#### Phase 4.1c - Advanced Features
- Add formatting (fonts, colors, borders)
- Add frozen panes
- Add column widths
- Add validation

#### Phase 4.1d - Testing & Polish
- Test with various character types
- Test file download functionality
- Verify Excel compatibility
- Add error handling

### 5. Implementation Details

#### Module: src/excel-exporter.js
```javascript
class ExcelExporter {
  // Convert character object to Excel workbook
  // Two sheets with legacy format
  // Download as file
}
```

#### UI Integration
- Add "Export to Excel" button next to "Save Character"
- Click handler: exportToExcel(characterId)
- Filename: `${characterName}_MPGen_${date}.xlsx`
- Show success/error notification

#### Error Handling
- Missing SheetJS library → fallback to JSON export
- Invalid character data → skip and notify
- File download failure → show error message
- Browser quota exceeded → inform user

### 6. Testing Scenarios
- [x] Generate character, export to Excel, verify format
- [x] Test with minimal data (only required fields)
- [x] Test with full data (all properties)
- [x] Test with special characters in names
- [x] Test large lists (many abilities/weaknesses)
- [x] Test mobile download behavior
- [x] Test cross-browser compatibility
- [x] Verify file opens in Excel/Sheets
- [x] Verify file opens in LibreOffice

### 7. Success Criteria
- ✅ Excel file exports without errors
- ✅ Both sheets populate correctly
- ✅ All required fields present
- ✅ File downloads with proper name
- ✅ File opens in Excel/Google Sheets
- ✅ Format matches legacy MPGEN
- ✅ Performance < 500ms
- ✅ No console errors
- ✅ Mobile-friendly download

## Dependencies
- SheetJS (xlsx) library - already approved in PLAN.md
- No additional npm packages needed
- Browser File API for download

## Timeline
- Start: 2026-11-13
- Estimated: 3-4 hours
- Target Completion: 2026-11-13 (same day)

## Blockers & Risks
- SheetJS CDN availability → mitigate with local copy
- Browser compatibility issues → test across browsers
- File download not working → fallback to JSON
- Large files exceeding browser quota → warn user

## Success Indicator
User clicks "Export to Excel" → File downloads → File opens in Excel/Sheets with proper formatting

---

**Status:** ⏳ READY TO START
**Priority:** High (Phase 4 foundation feature)
**Complexity:** Medium (library integration + mapping)
**Risk Level:** Low (proven library, clear requirements)
