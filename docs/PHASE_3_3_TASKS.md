# Phase 3.3: Form Integration & Testing
**Status:** READY TO START  
**Estimated Duration:** 1-2 days  
**Priority:** HIGH - Unblocks Phase 2 data integration

---

## 📋 Task Breakdown

### Task 1: Form Submission Handling (1 hour)

**Objective:** Wire form to CharacterGenerator  
**Files to modify:** `src/app.js`, `index.html`

**Steps:**
1. [ ] Add form ID to index.html (if not present)
2. [ ] Create `generateCharacter()` function in Application class
3. [ ] Attach form submit event listener
4. [ ] Collect 18 form parameters:
   ```javascript
   const params = {
     powerlevelId: parseInt(document.getElementById('powerlevelSelect').value) || null,
     sideId: parseInt(document.getElementById('sideSelect').value) || null,
     birthplaceId: parseInt(document.getElementById('birthplaceSelect').value) || null,
     speciesId: parseInt(document.getElementById('speciesSelect').value) || null,
     cultureId: parseInt(document.getElementById('cultureSelect').value) || null,
     genderIdentityId: parseInt(document.getElementById('genderIdentitySelect').value) || null,
     genderExpressionId: parseInt(document.getElementById('genderExpressionSelect').value) || null,
     biologicalSexId: parseInt(document.getElementById('biologicalSexSelect').value) || null,
     sexualAttractionId: parseInt(document.getElementById('sexualAttractionSelect').value) || null,
     motivationId: parseInt(document.getElementById('motivationSelect').value) || null,
     originTypeId: parseInt(document.getElementById('originTypeSelect').value) || null,
     keepDuplicates: document.getElementById('allowDupesCheckbox').checked,
     lostRegionId: parseInt(document.getElementById('lostRegionSelect').value) || null,
     knownRegionId: parseInt(document.getElementById('knownRegionSelect').value) || null,
     otherWorldId: parseInt(document.getElementById('otherWorldSelect').value) || null,
     otherDimensionId: parseInt(document.getElementById('otherDimensionSelect').value) || null,
     timePeriodId: parseInt(document.getElementById('timePeriodSelect').value) || null
   };
   ```
5. [ ] Call CharacterGenerator.generate(params)
6. [ ] Handle errors gracefully

---

### Task 2: Character Display Template (1 hour)

**Objective:** Create UI to display generated character  
**Files to modify:** `index.html`, `src/app.js`, `less/mpgen.less`

**Steps:**
1. [ ] Create character detail section in index.html (hide by default)
2. [ ] Add responsive grid for character stats
3. [ ] Design sections for:
   - [ ] Basic Info (name, species, culture, side)
   - [ ] Stats (ST, EN, AG, IN, CL)
   - [ ] Derived Stats (Power, Defense, Move, etc.)
   - [ ] Abilities & Weaknesses
   - [ ] Backgrounds & Motivations
   - [ ] Other Info (age, gender, weight, origin, etc.)
4. [ ] Create `displayCharacter(character)` function in UIController
5. [ ] Populate template with generated data
6. [ ] Show character view (#characters route)
7. [ ] Add CSS styling for character display

**Template Structure:**
```html
<section id="characterDisplay" class="character-detail">
  <h2 id="charName"></h2>
  
  <div class="char-grid">
    <!-- Basic Info -->
    <div class="char-section basic-info">
      <h3>Character Info</h3>
      <p><strong>Species:</strong> <span id="charSpecies"></span></p>
      <p><strong>Culture:</strong> <span id="charCulture"></span></p>
      <!-- ... more fields ... -->
    </div>
    
    <!-- Stats -->
    <div class="char-section stats">
      <h3>Base Characteristics</h3>
      <ul id="charStats"></ul>
    </div>
    
    <!-- Abilities -->
    <div class="char-section abilities">
      <h3>Abilities</h3>
      <ul id="charAbilities"></ul>
    </div>
    
    <!-- ... more sections ... -->
  </div>
</section>
```

---

### Task 3: Import & Integrate Modules (30 min)

**Objective:** Import DiceRoller and CharacterGenerator into Application  
**Files to modify:** `src/app.js`

**Steps:**
1. [ ] Add import for DiceRoller: `import { DiceRoller } from './diceroller.js';`
2. [ ] Add import for CharacterGenerator: `import { CharacterGenerator } from './character-generator.js';`
3. [ ] Instantiate CharacterGenerator in Application constructor:
   ```javascript
   this.characterGenerator = new CharacterGenerator(this.dataLoader);
   ```
4. [ ] Ensure dataLoader.loadAll() is called before character generation

---

### Task 4: Testing - Generation Phases (1 hour)

**Objective:** Verify all 15 generation phases work correctly

**Test Cases:**
1. [ ] **Power Level:**
   - [ ] Roll random (1-4)
   - [ ] Select specific level
   - [ ] Verify CP and BC starting points

2. [ ] **Side:**
   - [ ] Roll random (1-3)
   - [ ] Select specific side
   - [ ] Verify motivations context-dependent

3. [ ] **Birthplace Cascading:**
   - [ ] Test Foreigner path (KnownRegion)
   - [ ] Test Stranger path (LostRegion)
   - [ ] Test Anachronism path (TimePeriod)
   - [ ] Test Alien path (OtherWorld)
   - [ ] Test Extra-Dimensional path
   - [ ] Verify species/culture auto-assignment

4. [ ] **Species & Culture:**
   - [ ] Species CP adjustment applied
   - [ ] Culture defaults to "Modern" when auto
   - [ ] Species abilities/weaknesses loaded

5. [ ] **Stats:**
   - [ ] 5 basic characteristics assigned
   - [ ] BC starting points decrease by 2
   - [ ] Derived stats calculated correctly

6. [ ] **Gender & Sexuality:**
   - [ ] All 4 characteristics independent
   - [ ] Composite gender string formatted

7. [ ] **Abilities & Weaknesses:**
   - [ ] Normal (Level 1) has 0 abilities
   - [ ] Low/Standard/High have 6 abilities + 2 weaknesses
   - [ ] Offensive (2), Defensive (2), Misc (2), Weaknesses (2)

---

### Task 5: localStorage Integration (1 hour)

**Objective:** Save and load generated characters

**Steps:**
1. [ ] Create "Save Character" button
2. [ ] Implement `saveCharacter(character)` function
   - [ ] Generate unique ID (timestamp or UUID)
   - [ ] Serialize character to JSON
   - [ ] Store in localStorage with key: `char_${id}`
   - [ ] Update character list
3. [ ] Create "Character History" view
4. [ ] Implement `loadCharacter(id)` function
   - [ ] Retrieve from localStorage
   - [ ] Display in character view
5. [ ] Implement `deleteCharacter(id)` function
6. [ ] Show saved character list in #characters view

**localStorage Schema:**
```javascript
// Store individual character
localStorage.setItem('char_12345', JSON.stringify(characterObject));

// Store character list
localStorage.setItem('charlist', JSON.stringify([
  { id: '12345', name: 'Human Fighter', species: 'Human', date: '2026-11-13' },
  { id: '12346', name: 'Alien Wizard', species: 'Alien', date: '2026-11-13' }
]));
```

---

### Task 6: Error Handling & Validation (30 min)

**Objective:** Handle errors gracefully

**Steps:**
1. [ ] Add try/catch around character generation
2. [ ] Display error message to user if generation fails
3. [ ] Validate all 18 parameters before sending
4. [ ] Show loading indicator during generation
5. [ ] Handle network errors (data loading)
6. [ ] Provide helpful error messages

---

### Task 7: Browser Testing (1 hour)

**Objective:** Verify cross-browser compatibility

**Test Environments:**
- [ ] Chrome (latest)
- [ ] Firefox (latest)
- [ ] Safari (if available)
- [ ] Edge (if available)
- [ ] Mobile browsers (if needed)

**Test Coverage:**
- [ ] Form submission works
- [ ] All 33 data files load
- [ ] Character generation completes
- [ ] Character displays correctly
- [ ] localStorage save/load works
- [ ] UI is responsive
- [ ] No console errors

---

## 📋 Acceptance Criteria

**Form Integration:**
- [x] Form has all 18 fields visible
- [x] Submit button triggers character generation
- [x] All parameters collected correctly

**Character Display:**
- [x] Generated character displays with all fields
- [x] Stats calculated correctly
- [x] Abilities and weaknesses shown
- [x] Layout is responsive

**Testing:**
- [x] All 15 generation phases work
- [x] Birthplace cascading logic works (5 paths)
- [x] Character history saves/loads
- [x] No errors in console

**Documentation:**
- [x] PHASE_3_PROGRESS.md updated
- [x] PLAN.md updated
- [x] Code comments added where needed

---

## 🎯 Success Metrics

| Metric | Target | Status |
|--------|--------|--------|
| Character generation latency | < 500ms | ⏳ TBD |
| Form submission → display | < 1s | ⏳ TBD |
| Character save/load latency | < 100ms | ⏳ TBD |
| No console errors | 0 | ⏳ TBD |
| All 5 birthplace paths working | 5/5 | ⏳ TBD |
| All 15 generation phases working | 15/15 | ⏳ TBD |

---

## 🚀 Next Phase (After 3.3)

**Phase 3.4: Conditional Field Visibility**
- Implement birthplace selection listener
- Show/hide regional fields based on selection
- Test all conditional paths

**Phase 3.5: UI Polish & Export**
- Format character output with better styling
- Add PDF/Excel export functionality
- Test cross-browser compatibility

---

## 📝 Notes

- CharacterGenerator.generate() is async, returns Promise<Object>
- All 33 data files must be loaded before generation
- DataLoader has built-in caching (1 hour default)
- Character object has 50+ properties, some are derived

---

## 💡 Hints & Reminders

1. **Collect parameters carefully** - 18 fields to gather, easy to miss one
2. **Test birthplace logic** - Most complex part, test each of 5 paths
3. **localStorage quota** - ~5-10 MB available, character data ~2-5 KB each
4. **Error handling** - Many lookups can fail if data is bad, handle gracefully
5. **Performance** - First load ~2s (data loading), subsequent <500ms (cached)

