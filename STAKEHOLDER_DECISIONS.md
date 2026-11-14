# Stakeholder Decisions - Phase 1 Completion

**Date:** 2026-11-13  
**Status:** Decisions Approved ✅

---

## Stakeholder Answers to Critical Questions

### 1. ✅ Blog Integration: YES
**Decision:** Include WordPress blog feed in new version

**Impact:**
- Keep axios HTTP client dependency (for WordPress API calls)
- Include BlogCard component in React-to-JS conversion
- Graceful degradation if blog API unavailable
- ~2-3 KB additional bundle size

**Implementation Notes:**
- Fetch blog posts from: `https://gaming.drl2.com/wp-json/wp/v2/posts?per_page=5`
- Add error handling for offline/failed requests
- Cache responses in localStorage

---

### 2. ✅ Advertising: YES
**Decision:** Preserve ad integrations (Google AdSense, etc.)

**Impact:**
- Keep AdCode component
- Support ad network scripts (Google AdSense, etc.)
- May require CSP (Content Security Policy) configuration
- Ad revenue preservation

**Implementation Notes:**
- AdCode.js is simple (minimal code)
- Use `dangerouslySetInnerHTML` alternative in vanilla JS (or actual script tags)
- Ad networks load dynamically (low impact on bundle size)

---

### 3. ✅ Character History: LOCAL STORAGE
**Decision:** Save characters locally using browser localStorage

**Impact:**
- No backend database needed for saved characters
- Characters persist across browser sessions
- Limited storage (~5-10 MB per domain)
- Add "Save Character" and "Load Character" features
- ~500-800 LOC for history management

**Implementation Notes:**
- Store character data as JSON in localStorage
- Key format: `mpgen_character_<timestamp>`
- Create UI for: Save, Load, Delete, List saved characters
- Handle storage quota exceeded errors gracefully
- Optional: Export saved characters as JSON file

**Storage Estimate:**
- Average character JSON: ~5-10 KB
- Storage capacity: ~50-100 characters per browser
- Sufficient for typical user needs

---

### 4. ✅ Excel Export: CURRENT FORMAT REQUIRED
**Decision:** Preserve current Excel export format (not simplified to CSV)

**Impact:**
- Must use SheetJS library (replacement for openpyxl)
- Pre-formatted Excel workbook needed
- ~50-60 KB additional bundle size
- Higher complexity in export logic

**Implementation Notes:**
- Create template Excel file (.xlsx)
- Use SheetJS library to populate cells
- Maintain two sheets: "Official Sheet" + "MPGen Character"
- Cell-by-cell population strategy (from charsheetmaker.py)
- Estimated effort: 3-4 days (Phase 4)

**SheetJS Comparison:**
- openpyxl (Python): Can read/write .xlsx natively
- SheetJS (JavaScript): Uses binary format, cell-based API
- Template approach: Load template, populate, download

---

## Impact on Implementation Plan

### Updated Scope

| Feature | Include? | Complexity | Effort |
|---------|----------|-----------|--------|
| Blog Feed | ✅ YES | LOW | 1 day |
| Ad Integration | ✅ YES | LOW | 0.5 days |
| Local Character History | ✅ YES | MEDIUM | 2-3 days |
| Excel Export (current format) | ✅ YES | HIGH | 3-4 days |
| **Total Added** | - | **MEDIUM** | **~1 week** |

### Phase 4 (Frontend UI) - Revised Breakdown

```
Week 1:
  • Selection dropdowns (5 days)
  
Week 2:
  • Character display component (3 days)
  • Character history UI (2 days)
  
Week 3:
  • Excel export implementation (3 days)
  • Blog feed integration (1 day)
  • Ad code integration (0.5 days)
  
Week 4:
  • Testing & refinement (5 days)
```

### Bundle Size Impact

| Component | Size | Notes |
|-----------|------|-------|
| HTML/CSS | ~30 KB | Semantic markup, custom CSS |
| JavaScript Core | ~50 KB | State management, routing |
| Business Logic | ~40 KB | Character generation, lookups |
| Data (JSON) | ~100 KB | All configuration tables |
| SheetJS Library | ~50 KB | Excel export functionality |
| Optional: Blog/Ads | ~5 KB | Low overhead |
| **Total** | **~275 KB** | Unminified |
| **Minified** | **~80-100 KB** | Production-ready |
| **Gzipped** | **~25-30 KB** | Transferred size |

---

## Updated Requirements

### Must-Have Features (Phase 4 + beyond)

1. **Character Generation** ✅
   - Random generation (all d-rolls)
   - Selective generation (user-chosen + random)
   - Conditional logic (species/culture by birthplace)

2. **Character Display** ✅
   - All generated attributes
   - Abilities selection
   - Stats and derived values

3. **Excel Export** ✅ **NEW: Current Format Required**
   - Pre-formatted workbook
   - Two-sheet output
   - Cell-by-cell population

4. **Character History** ✅ **NEW: Local Storage**
   - Save character to browser
   - Load saved character
   - List all saved characters
   - Delete character
   - Export/download characters

5. **Blog Feed Integration** ✅ **NEW: Include**
   - Display latest blog posts
   - Link to external blog
   - Handle failed requests

6. **Ad Integration** ✅ **NEW: Include**
   - Support ad network scripts
   - Graceful handling

---

## Implementation Strategy Changes

### Phase 4 - Enhanced Requirements

**New UI Components Needed:**
1. **SaveCharacterModal** - Save current character with name
2. **CharacterHistoryPanel** - List of saved characters
3. **LoadCharacterModal** - Load and display saved character
4. **ExportPanel** - Download as Excel or JSON
5. **BlogFeed** - Display blog posts (WordPress API)
6. **AdContainer** - Render ad scripts

**New Functions Needed:**
1. `saveCharacter(characterData, name)` - Save to localStorage
2. `loadCharacter(characterId)` - Load from localStorage
3. `deleteCharacter(characterId)` - Remove from localStorage
4. `listSavedCharacters()` - Get all saved characters
5. `exportAsExcel(characterData)` - Generate Excel file
6. `exportAsJson(characterData)` - Download JSON
7. `fetchBlogPosts()` - Get WordPress blog feed

**New Libraries Required:**
1. **SheetJS** - Excel generation (~50 KB)
2. **axios** - HTTP client (for blog feed and existing code)
   - *OR* use native Fetch API (Fetch already needed for data loading)

**LocalStorage Schema:**

```javascript
// Saved characters structure
{
  mpgen_characters: {
    "char_1730908800": {
      id: "char_1730908800",
      name: "Mighty Protector",
      createdAt: 1730908800,
      updatedAt: 1730908800,
      data: { /* full character object */ }
    },
    "char_1730995200": { ... }
  },
  
  mpgen_settings: {
    lastUsedPowerLevel: 3,
    defaultAllowDupes: false,
    // other user preferences
  }
}
```

---

## Data Migration Impact

### Database Export (Phase 2)

**No changes** - Still export all 31 tables as JSON. The local storage is for user-generated character saves, not configuration data.

**Export includes:**
- All lookup tables (species, cultures, abilities, etc.)
- No user data needed (starts fresh)

---

## Testing Strategy

### New Test Cases

**Character History (localStorage):**
- [ ] Save character to localStorage
- [ ] Load character from localStorage
- [ ] List multiple saved characters
- [ ] Delete saved character
- [ ] Handle storage quota exceeded
- [ ] Clear all characters
- [ ] Persist across page refresh
- [ ] Export saved characters to JSON

**Excel Export:**
- [ ] Generate Excel from character data
- [ ] Verify cell population matches template
- [ ] Test with various character types
- [ ] Download and open in Excel/Sheets
- [ ] Compare with legacy export

**Blog Integration:**
- [ ] Fetch blog posts successfully
- [ ] Handle failed API requests
- [ ] Display blog posts correctly
- [ ] Cache blog responses
- [ ] Handle offline mode

**Ad Integration:**
- [ ] Render ad scripts without errors
- [ ] Handle ad blockers gracefully
- [ ] No impact on character generation

---

## Risk Assessment - Updated

| Risk | Severity | Mitigation | Notes |
|------|----------|-----------|-------|
| localStorage quota | MEDIUM | Monitor usage; offer cleanup | ~100 characters max |
| Excel export complexity | HIGH | Use SheetJS library; test thoroughly | Biggest new risk |
| Blog API unavailability | LOW | Graceful degradation | Not critical to app |
| Ad scripts interference | MEDIUM | CSP headers; error handling | Test with blockers |

---

## Timeline Impact

**Original Phase 4:** 4-6 weeks  
**Revised Phase 4:** 4-6 weeks (same!)  
*Reason: New features offset selection component simplification*

**New features absorbed into Phase 4:**
- LocalStorage integration (replaces backend for history)
- Excel export with SheetJS (higher complexity than expected)
- Blog feed and ad integrations (low complexity)

**Total Project Timeline:** Still 13-21 weeks (unchanged)

---

## Documentation Updates Needed

### Update PLAN.md
- [ ] Add "Character History (localStorage)" to Phase 4 tasks
- [ ] Add "Excel Export (SheetJS)" details
- [ ] Add "Blog Feed Integration" to optional features
- [ ] Add "Ad Integration" to optional features
- [ ] Update Phase 4 timeline breakdown

### Update PHASE1_ANALYSIS.md
- [ ] Document these decisions in new section
- [ ] Update Feature Inventory with new features
- [ ] Update technical debt removal (no backend db = cleaner)

### Create New Document
- [ ] **STAKEHOLDER_DECISIONS.md** (this document + rationale)
- [ ] Document how each decision shapes implementation

---

## Next Steps

### Before Phase 2 Starts

1. **Review This Document**
   - Ensure all decisions are correctly captured

2. **Update Planning Documents**
   - [ ] Update PLAN.md with new tasks
   - [ ] Update PHASE1_ANALYSIS.md Feature Inventory
   - [ ] Create detailed Phase 4 subtasks

3. **Research & Preparation**
   - [ ] Evaluate SheetJS options (license, size)
   - [ ] Create Excel template file
   - [ ] Design localStorage schema
   - [ ] Plan character export/import format

4. **Start Phase 2**
   - [ ] Project scaffolding
   - [ ] State management system
   - [ ] Data loading and initialization

### During Phase 4

1. **Build Character History System**
   - LocalStorage integration
   - Save/Load/Delete UI
   - History list view

2. **Implement Excel Export**
   - SheetJS integration
   - Template population
   - Download functionality

3. **Add Blog Feed**
   - WordPress API integration
   - Error handling
   - Caching strategy

4. **Add Ad Integration**
   - Script loading mechanism
   - Error handling
   - Performance monitoring

---

## Questions Answered ✅

| Question | Answer | Reason | Impact |
|----------|--------|--------|--------|
| Blog Integration? | YES | Content engagement | ~1 day effort, 5 KB |
| Advertising? | YES | Revenue preservation | ~0.5 days, minimal |
| Character History? | LOCAL storage | No backend needed | 2-3 days, cleaner arch |
| Excel Format? | Current required | Compatibility, users expect | 3-4 days, SheetJS dep |

---

## Approval Status

✅ **APPROVED** - All stakeholder decisions recorded and integrated into plan

**Signed Off:** Stakeholder  
**Date:** 2026-11-13  
**Ready for:** Phase 2 execution

---

**See Also:**
- [PLAN.md](./PLAN.md) - To be updated with these decisions
- [PHASE1_ANALYSIS.md](./PHASE1_ANALYSIS.md) - Reference section 20
- [PHASE1_COMPLETE.md](./PHASE1_COMPLETE.md) - Project status
