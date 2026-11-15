// ============================================================================
// MPGEN Application - Main Entry Point
// Vanilla JavaScript SPA
// ============================================================================

// Import modules (using ES6 modules)
import { DiceRoller } from './diceroller.js';
import { CharacterGenerator } from './character-generator.js';
import { ExcelExporter } from './excel-exporter.js';

/**
 * Application State Manager
 * Centralized state with observer pattern for reactivity
 */
class StateManager {
  constructor() {
    this.state = {
      currentCharacter: null,
      savedCharacters: [],
      data: {
        worlds: [],
        timePeriods: [],
        species: [],
        cultures: [],
        birthplaces: [],
        abilities: [],
        dimensions: []
      },
      ui: {
        currentSection: 'generator',
        isLoading: false,
        error: null
      }
    };
    
    this.observers = [];
  }
  
  subscribe(callback) {
    this.observers.push(callback);
    return () => {
      this.observers = this.observers.filter(obs => obs !== callback);
    };
  }
  
  notify() {
    this.observers.forEach(observer => observer(this.state));
  }
  
  setState(updates) {
    this.state = { ...this.state, ...updates };
    this.notify();
  }
  
  updateUI(updates) {
    this.state.ui = { ...this.state.ui, ...updates };
    this.notify();
  }
}

/**
 * Data Loader
 * Loads all JSON configuration files with caching strategy
 */
class DataLoader {
  constructor(dataPath = 'data/', cacheTimeout = 3600000) {
    this.dataPath = dataPath;
    this.cache = {};
    this.cacheTimeout = cacheTimeout; // Cache expires after 1 hour (3600000ms)
    this.cacheTimestamps = {};
  }
  
  /**
   * Check if data is cached and not expired
   * @param {string} key - Data identifier
   * @returns {boolean} - True if valid cache exists
   */
  isCached(key) {
    if (!this.cache.hasOwnProperty(key)) {
      return false;
    }
    
    const timestamp = this.cacheTimestamps[key];
    const now = Date.now();
    const isExpired = (now - timestamp) > this.cacheTimeout;
    
    if (isExpired) {
      delete this.cache[key];
      delete this.cacheTimestamps[key];
      return false;
    }
    
    return true;
  }
  
  /**
   * Get cached data
   * @param {string} key - Data identifier
   * @returns {*} - Cached data or null
   */
  getFromCache(key) {
    if (this.isCached(key)) {
      return this.cache[key];
    }
    return null;
  }
  
  /**
   * Store data in cache
   * @param {string} key - Data identifier
   * @param {*} data - Data to cache
   */
  setCache(key, data) {
    this.cache[key] = data;
    this.cacheTimestamps[key] = Date.now();
  }
  
  /**
   * Clear specific cache entry
   * @param {string} key - Data identifier
   */
  clearCache(key) {
    delete this.cache[key];
    delete this.cacheTimestamps[key];
  }
  
  /**
   * Clear all cache
   */
  clearAllCache() {
    this.cache = {};
    this.cacheTimestamps = {};
  }
  
  /**
   * Load single JSON file with caching
   * @param {string} filename - Name of file without .json extension
   * @returns {Promise<Array>} - Loaded data
   */
  async loadFile(filename) {
    // Check cache first
    const cached = this.getFromCache(filename);
    if (cached !== null) {
      console.log(`Loading ${filename} from cache`);
      return cached;
    }
    
    try {
      console.log(`Fetching ${filename} from file`);
      const response = await fetch(`${this.dataPath}${filename}.json`);
      
      if (!response.ok) {
        console.warn(`Could not load ${filename}.json (HTTP ${response.status})`);
        return [];
      }
      
      const data = await response.json();
      
      // Store in cache
      this.setCache(filename, data);
      
      return data;
    } catch (error) {
      console.warn(`Error loading ${filename}.json:`, error);
      return [];
    }
  }
  
  /**
   * Load all configuration files with caching
   * @returns {Promise<Object>} - All loaded data
   */
  async loadAll() {
    try {
      // All 33 data tables extracted from Python database
      const tables = [
        'ability',
        'abilitytype',
        'background',
        'bcdetail',
        'bcpowerlevelminmax',
        'biologicalsex',
        'birthplace',
        'bodytype',
        'culture',
        'genderexpression',
        'genderidentity',
        'knownregion',
        'lostregion',
        'lostregionculture',
        'lostregionspecies',
        'motivation',
        'origintype',
        'otherdimension',
        'otherdimensionculture',
        'otherdimensionspecies',
        'otherworld',
        'otherworldculture',
        'otherworldspecies',
        'powerlevel',
        'sexualattraction',
        'side',
        'species',
        'speciesability',
        'stat',
        'timeperiod',
        'timeperiodculture',
        'timeperiodspecies',
        'weightroll'
      ];
      
      const data = {};
      
      for (const table of tables) {
        data[table] = await this.loadFile(table);
      }
      
      return data;
    } catch (error) {
      console.error('Error loading data:', error);
      throw error;
    }
  }

  /**
   * Find entry by ID
   * Pattern: Direct lookup in any table by id field
   * @param {string} tableName - Name of data table
   * @param {number} id - Record ID to find
   * @returns {Object|null} - Record if found, null otherwise
   */
  findById(tableName, id) {
    const table = this.cache[tableName];
    if (!table || !Array.isArray(table)) return null;
    
    return table.find(record => record.id === id) || null;
  }

  /**
   * Find entry within a roll range
   * Pattern: Range-based lookup using min_roll and max_roll fields (D100 tables)
   * @param {string} tableName - Name of data table
   * @param {number} roll - Roll value to lookup
   * @returns {Object|null} - Record where min_roll <= roll <= max_roll, null if not found
   */
  findByRoll(tableName, roll) {
    const table = this.cache[tableName];
    if (!table || !Array.isArray(table)) return null;
    
    return table.find(record => 
      record.min_roll <= roll && roll <= record.max_roll
    ) || null;
  }

  /**
   * Find entry by context and roll
   * Pattern: Contextual lookup using foreign key + roll range
   * Example: Find region-specific species by region_id and roll
   * @param {string} tableName - Name of data table
   * @param {string|number} contextId - Context identifier (region_id, world_id, dimension_id, etc.)
   * @param {number} roll - Roll value to lookup
   * @returns {Object|null} - Record matching context and roll range, null if not found
   */
  findByContextAndRoll(tableName, contextId, roll) {
    const table = this.cache[tableName];
    if (!table || !Array.isArray(table)) return null;
    
    // Try common context field names (order matters - check table-specific names first)
    const contextFields = ['ability_type_id', 'region_id', 'world_id', 'dimension_id', 'birthplace_id', 
                           'species_id', 'culture_id', 'timeperiod_id', 'side_id', 'type_id'];
    
    for (const fieldName of contextFields) {
      const match = table.find(record => 
        record[fieldName] === contextId && 
        record.min_roll <= roll && 
        roll <= record.max_roll
      );
      if (match) return match;
    }
    
    return null;
  }

  /**
   * Filter records by a field value
   * Pattern: Get all records matching a specific field value
   * @param {string} tableName - Name of data table
   * @param {string} fieldName - Field to filter by
   * @param {*} fieldValue - Value to match
   * @returns {Array} - Array of matching records
   */
  filterByField(tableName, fieldName, fieldValue) {
    const table = this.cache[tableName];
    if (!table || !Array.isArray(table)) return [];
    
    return table.filter(record => record[fieldName] === fieldValue);
  }

  /**
   * Find record by name field (case-insensitive)
   * @param {string} tableName - Name of data table
   * @param {string} name - Name to find
   * @returns {Object|null} - Record if found, null otherwise
   */
  findByName(tableName, name) {
    const table = this.cache[tableName];
    if (!table || !Array.isArray(table)) return null;
    
    // Map table names to their name/display fields
    const nameFields = {
      powerlevel: 'power_level',
      side: 'side',
      motivation: 'motivation',
      origintype: 'origin_type',
      birthplace: 'birthplace',
      knownregion: 'region',
      lostregion: 'region',
      timeperiod: 'time_period',
      otherworld: 'world',
      otherdimension: 'dimension',
      species: 'species_name',
      culture: 'culture_name',
      genderidentity: 'gender_identity',
      genderexpression: 'gender_expression',
      biologicalsex: 'biological_sex',
      sexualattraction: 'sexual_attraction',
      ability: 'ability_name',
      abilitytype: 'ability_type',
      background: 'background_name',
      bodytype: 'body_type',
      stat: 'stat_name',
      bcdetail: 'stat_name'
    };
    
    const nameField = nameFields[tableName] || 'name';
    const nameLower = name.toLowerCase();
    
    return table.find(record => {
      const nameValue = record[nameField] || '';
      return nameValue.toLowerCase() === nameLower;
    }) || null;
  }

  /**
   * Get all records from a table
   * @param {string} tableName - Name of data table
   * @returns {Array} - All records in table
   */
  getTable(tableName) {
    const table = this.cache[tableName];
    return Array.isArray(table) ? table : [];
  }
}

/**
 * Character Generator
 * Local Storage Manager
 * Handles saving and loading characters from localStorage
 */
class LocalStorageManager {
  constructor(storageKey = 'mpgen_characters') {
    this.storageKey = storageKey;
  }
  
  saveCharacter(character) {
    try {
      const characters = this.getCharacters();
      const index = characters.findIndex(c => c.id === character.id);
      
      if (index >= 0) {
        characters[index] = character;
      } else {
        characters.push(character);
      }
      
      localStorage.setItem(this.storageKey, JSON.stringify(characters));
      return true;
    } catch (error) {
      console.error('Error saving character:', error);
      return false;
    }
  }
  
  getCharacters() {
    try {
      const data = localStorage.getItem(this.storageKey);
      return data ? JSON.parse(data) : [];
    } catch (error) {
      console.error('Error loading characters:', error);
      return [];
    }
  }
  
  getCharacter(id) {
    const characters = this.getCharacters();
    // Handle both string and number IDs
    return characters.find(c => c.id === id || c.id === parseInt(id));
  }
  
  deleteCharacter(id) {
    try {
      const characters = this.getCharacters();
      // Handle both string and number IDs
      const filtered = characters.filter(c => c.id !== id && c.id !== parseInt(id));
      localStorage.setItem(this.storageKey, JSON.stringify(filtered));
      return true;
    } catch (error) {
      console.error('Error deleting character:', error);
      return false;
    }
  }
}

/**
 * Router
 * Hash-based routing for sections
 */
class Router {
  constructor(state) {
    this.state = state;
    this.routes = {
      '#generator': () => this.navigate('generator'),
      '#characters': () => this.navigate('characters'),
      '#blog': () => this.navigate('blog'),
      '#about': () => this.navigate('about')
    };
    
    window.addEventListener('hashchange', () => this.handleRoute());
    this.handleRoute();
  }
  
  handleRoute() {
    const hash = window.location.hash || '#generator';
    const handler = this.routes[hash];
    if (handler) handler();
  }
  
  navigate(section) {
    this.state.updateUI({ currentSection: section });
    window.location.hash = '#' + section;
  }
}

/**
 * UI Controller
 * Manages UI rendering and interactions
 */
class UIController {
  constructor(state, generator, storage) {
    this.state = state;
    this.generator = generator;
    this.storage = storage;
    this.elements = {};
    
    this.cacheElements();
    this.attachEventListeners();
  }
  
  cacheElements() {
    this.elements = {
      generateBtn: document.getElementById('generateBtn'),
      randomBtn: document.getElementById('randomBtn'),
      saveBtn: document.getElementById('saveBtn'),
      exportBtn: document.getElementById('exportBtn'),
      characterCard: document.getElementById('characterCard'),
      charactersList: document.getElementById('charactersList'),
      blogFeed: document.getElementById('blogFeed'),
      powerlevelSelect: document.getElementById('powerlevelSelect'),
      sideSelect: document.getElementById('sideSelect'),
      birthplaceSelect: document.getElementById('birthplaceSelect'),
      speciesSelect: document.getElementById('speciesSelect'),
      cultureSelect: document.getElementById('cultureSelect'),
      genderIdentitySelect: document.getElementById('genderIdentitySelect'),
      genderExpressionSelect: document.getElementById('genderExpressionSelect'),
      biologicalSexSelect: document.getElementById('biologicalSexSelect'),
      sexualAttractionSelect: document.getElementById('sexualAttractionSelect'),
      motivationSelect: document.getElementById('motivationSelect'),
      originTypeSelect: document.getElementById('originTypeSelect'),
      knownRegionSelect: document.getElementById('knownRegionSelect'),
      lostRegionSelect: document.getElementById('lostRegionSelect'),
      otherWorldSelect: document.getElementById('otherWorldSelect'),
      otherDimensionSelect: document.getElementById('otherDimensionSelect'),
      timePeriodSelect: document.getElementById('timePeriodSelect'),
      allowDupesCheckbox: document.getElementById('allowDupesCheckbox')
    };
  }
  
  attachEventListeners() {
    // Event listeners now handled by Application.setupFormHandlers()
    // This method is deprecated but kept for compatibility
  }
  
  handleGenerate() {
    const options = {
      world: this.elements.worldSelect.value,
      timePeriod: this.elements.timeperiodSelect.value,
      species: this.elements.speciesSelect.value,
      culture: this.elements.cultureSelect.value,
      birthplace: this.elements.birthplaceSelect.value,
      ability: this.elements.abilitySelect.value,
      dimension: this.elements.dimensionSelect.value
    };
    
    const character = this.generator.generate(options);
    this.state.setState({ currentCharacter: character });
    this.renderCharacterCard(character);
    this.elements.saveBtn.disabled = false;
    this.elements.exportBtn.disabled = false;
  }
  
  handleRandom() {
    const character = this.generator.generate();
    this.state.setState({ currentCharacter: character });
    this.renderCharacterCard(character);
    this.elements.saveBtn.disabled = false;
    this.elements.exportBtn.disabled = false;
  }
  
  handleSave() {
    if (this.state.state.currentCharacter) {
      this.storage.saveCharacter(this.state.state.currentCharacter);
      this.state.setState({ 
        savedCharacters: this.storage.getCharacters()
      });
      
      // Visual feedback
      const btn = this.elements.saveBtn;
      const originalText = btn.textContent;
      btn.textContent = 'Saved!';
      setTimeout(() => {
        btn.textContent = originalText;
      }, 1500);
      
      this.renderCharactersList();
    }
  }
  
  handleExport() {
    // Placeholder for Excel export (Phase 4)
    alert('Excel export will be implemented in Phase 4');
  }
  
  renderCharacterCard(character) {
    if (!character) {
      this.elements.characterCard.innerHTML = '<div class="character-placeholder"><p>Character will appear here...</p></div>';
      return;
    }
    
    const html = `
      <div class="character-content">
        <div class="character-header">
          <div class="character-name">${character.name}</div>
        </div>
        <div class="character-attributes">
          ${character.world ? `<div class="character-attribute"><div class="character-attribute-label">World</div><div class="character-attribute-value">${character.world}</div></div>` : ''}
          ${character.species ? `<div class="character-attribute"><div class="character-attribute-label">Species</div><div class="character-attribute-value">${character.species}</div></div>` : ''}
          ${character.culture ? `<div class="character-attribute"><div class="character-attribute-label">Culture</div><div class="character-attribute-value">${character.culture}</div></div>` : ''}
          ${character.birthplace ? `<div class="character-attribute"><div class="character-attribute-label">Birthplace</div><div class="character-attribute-value">${character.birthplace}</div></div>` : ''}
          ${character.ability ? `<div class="character-attribute"><div class="character-attribute-label">Ability</div><div class="character-attribute-value">${character.ability}</div></div>` : ''}
          ${character.dimension ? `<div class="character-attribute"><div class="character-attribute-label">Dimension</div><div class="character-attribute-value">${character.dimension}</div></div>` : ''}
        </div>
        <div class="character-attributes">
          <div class="character-attribute"><div class="character-attribute-label">STR</div><div class="character-attribute-value">${character.attributes.strength}</div></div>
          <div class="character-attribute"><div class="character-attribute-label">DEX</div><div class="character-attribute-value">${character.attributes.dexterity}</div></div>
          <div class="character-attribute"><div class="character-attribute-label">CON</div><div class="character-attribute-value">${character.attributes.constitution}</div></div>
          <div class="character-attribute"><div class="character-attribute-label">INT</div><div class="character-attribute-value">${character.attributes.intelligence}</div></div>
          <div class="character-attribute"><div class="character-attribute-label">WIS</div><div class="character-attribute-value">${character.attributes.wisdom}</div></div>
          <div class="character-attribute"><div class="character-attribute-label">CHA</div><div class="character-attribute-value">${character.attributes.charisma}</div></div>
        </div>
      </div>
    `;
    
    this.elements.characterCard.innerHTML = html;
  }
  
  renderCharactersList() {
    const characters = this.storage.getCharacters();
    
    if (characters.length === 0) {
      this.elements.charactersList.innerHTML = '<div class="empty-state"><p>No saved characters yet. Generate and save your first character!</p></div>';
      return;
    }
    
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
    const html = characters.map(char => `
      <div class="character-card-preview"${char.notes ? ` title="${escapeHtml(char.notes)}"` : ''}>
        <div class="character-card-content">
          <div class="character-card-name">${escapeHtml(char.name)}</div>
          <div class="character-card-meta">${escapeHtml(char.species || 'Unknown')}</div>
          <div class="character-card-meta">${new Date(char.createdAt).toLocaleDateString()}</div>
        </div>
        <button type="button" class="character-card-load" onclick="window.loadCharacterById(${Number(char.id)})" title="Load character" aria-label="Load ${escapeHtml(char.name)}">
          <span class="character-action-icon" aria-hidden="true">📂</span>
        </button>
        <button type="button" class="character-card-delete" onclick="window.deleteCharacterById(${Number(char.id)})" title="Delete character" aria-label="Delete ${escapeHtml(char.name)}">
          <span class="character-action-icon" aria-hidden="true">🗑️</span>
        </button>
      </div>
    `).join('');
    
    this.elements.charactersList.innerHTML = html;
  }
  
  loadBlog() {
    const blogFeed = this.elements.blogFeed;
    if (!blogFeed) {
      console.error('Blog feed element not found');
      return;
    }

    blogFeed.innerHTML = '<div class="loading">Loading blog posts...</div>';

    fetch('https://gaming.drl2.com/wp-json/wp/v2/posts?per_page=5&context=embed')
      .then(response => {
        if (!response.ok) {
          throw new Error(`Blog request failed: HTTP ${response.status}`);
        }
        return response.json();
      })
      .then(posts => {
        if (!Array.isArray(posts)) {
          throw new Error('Blog response did not contain a post list');
        }

        const postList = document.createElement('ul');
        postList.className = 'blog-post-list';
        posts.forEach(post => {
          if (!post || typeof post.title?.rendered !== 'string' || typeof post.link !== 'string') {
            return;
          }

          const postUrl = new URL(post.link);
          if (postUrl.protocol !== 'https:' || postUrl.hostname !== 'gaming.drl2.com') {
            return;
          }

          const titleDocument = new DOMParser().parseFromString(post.title.rendered, 'text/html');
          const title = titleDocument.body.textContent.replace(/\u2013/g, '-').trim();
          if (!title) {
            return;
          }

          const item = document.createElement('li');
          const link = document.createElement('a');
          link.href = postUrl.href;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          link.textContent = title;
          item.appendChild(link);
          postList.appendChild(item);
        });

        blogFeed.replaceChildren(
          postList.childElementCount
            ? postList
            : Object.assign(document.createElement('p'), {
                className: 'character-empty',
                textContent: 'No recent blog posts are available.'
              })
        );
      })
      .catch(error => {
        console.error('Failed to load recent blog posts:', error);
        const message = document.createElement('p');
        message.className = 'blog-error';
        message.textContent = 'Recent blog posts could not be loaded.';
        const retryButton = document.createElement('button');
        retryButton.type = 'button';
        retryButton.className = 'blog-retry';
        retryButton.textContent = 'Try again';
        retryButton.addEventListener('click', () => this.loadBlog(), { once: true });
        blogFeed.replaceChildren(message, retryButton);
      });
  }
  
  populateSelects(data) {
    // Map select field IDs to data table names (MUST match HTML element IDs exactly)
    const selects = {
      powerlevelSelect: 'powerlevel',
      sideSelect: 'side',
      motivationSelect: 'motivation',
      originTypeSelect: 'origintype',
      birthplaceSelect: 'birthplace',
      knownRegionSelect: 'knownregion',
      lostRegionSelect: 'lostregion',
      timePeriodSelect: 'timeperiod',
      otherWorldSelect: 'otherworld',
      otherDimensionSelect: 'otherdimension',
      speciesSelect: 'species',
      cultureSelect: 'culture',
      genderIdentitySelect: 'genderidentity',
      genderExpressionSelect: 'genderexpression',
      biologicalSexSelect: 'biologicalsex',
      sexualAttractionSelect: 'sexualattraction'
    };
    
    // Map table names to display field names (correct field names from data files)
    const displayFields = {
      powerlevel: 'power_level',
      side: 'side',
      motivation: 'motivation',
      origintype: 'origin_type',
      birthplace: 'birth_place',
      knownregion: 'region_name',
      lostregion: 'region_name',
      timeperiod: 'time_period',
      otherworld: 'world',
      otherdimension: 'dimension',
      species: 'species_name',
      culture: 'culture_name',
      genderidentity: 'gender_identity',
      genderexpression: 'gender_expression',
      biologicalsex: 'biological_sex',
      sexualattraction: 'sexual_attraction'
    };
    
    console.log('📝 Populating form dropdowns...');
    
    Object.entries(selects).forEach(([selectId, tableName]) => {
      const select = document.getElementById(selectId);
      if (!select) {
        console.warn(`⚠️  Element not found: ${selectId}`);
        return;
      }
      
      const items = data[tableName];
      if (!items || !Array.isArray(items)) {
        console.warn(`⚠️  Data not found for: ${tableName}`);
        return;
      }
      
      const displayField = displayFields[tableName];
      let populatedCount = 0;
      
      items.forEach(item => {
        const option = document.createElement('option');
        option.value = item.id;
        
        // Try multiple field names to find the display text
        let displayText = null;
        if (displayField && item[displayField]) {
          displayText = item[displayField];
        } else if (item.power_level) {
          displayText = item.power_level;
        } else if (item.species_name) {
          displayText = item.species_name;
        } else if (item.culture_name) {
          displayText = item.culture_name;
        } else if (item.side) {
          displayText = item.side;
        } else if (item.birth_place) {
          displayText = item.birth_place;
        } else if (item.motivation) {
          displayText = item.motivation;
        } else if (item.origin_type) {
          displayText = item.origin_type;
        } else if (item.region_name) {
          displayText = item.region_name;
        } else if (item.time_period) {
          displayText = item.time_period;
        } else if (item.world_name) {
          displayText = item.world_name;
        } else if (item.dimension_name) {
          displayText = item.dimension_name;
        }
        
        option.textContent = displayText || `ID: ${item.id}`;
        select.appendChild(option);
        populatedCount++;
      });
      
      console.log(`  ✅ ${selectId}: ${populatedCount} options`);
    });
  }
}

/**
 * Application Bootstrap
 * Initializes the application
 */
class Application {
  constructor() {
    this.state = new StateManager();
    this.dataLoader = new DataLoader('data/');
    this.storage = new LocalStorageManager();
    this.generator = null;
    this.ui = null;
    this.router = null;
  }
  
  async initialize() {
    try {
      console.log('🚀 Initializing MPGEN Application...');
      
      // Load data
      console.log('📦 Loading configuration data...');
      const data = await this.dataLoader.loadAll();
      this.state.setState({ data });
      
      // Initialize generator with dataLoader
      this.generator = new CharacterGenerator(this.dataLoader);
      
      // Initialize UI
      this.ui = new UIController(this.state, this.generator, this.storage);
      this.ui.populateSelects(data);
      this.ui.renderCharactersList();
      this.ui.loadBlog();
      
      // Initialize router
      this.router = new Router(this.state);
      
      // Setup form event listeners
      this.setupFormHandlers();
      
      // Initialize birthplace cascading logic
      this.handleBirthplaceChange();
      
      // Subscribe to state changes
      this.state.subscribe((state) => {
        console.log('State updated:', state);
      });
      
      // Load saved characters
      const savedCharacters = this.storage.getCharacters();
      this.state.setState({ savedCharacters });
      
      // Enable load button if there are saved characters
      const loadBtn = document.getElementById('loadBtn');
      if (loadBtn && savedCharacters.length > 0) {
        loadBtn.disabled = false;
      }
      
      console.log('✅ MPGEN Application initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing application:', error);
      this.state.updateUI({ 
        error: 'Failed to initialize application: ' + error.message 
      });
    }
  }

  /**
   * Setup form event listeners
   */
  setupFormHandlers() {
    const generateBtn = document.getElementById('generateBtn');
    const randomBtn = document.getElementById('randomBtn');
    const saveBtn = document.getElementById('saveBtn');
    const loadBtn = document.getElementById('loadBtn');
    const birthplaceSelect = document.getElementById('birthplaceSelect');

    if (generateBtn) {
      generateBtn.addEventListener('click', () => this.handleGenerateClick());
    }

    if (randomBtn) {
      randomBtn.addEventListener('click', () => this.handleRandomClick());
    }

    if (saveBtn) {
      saveBtn.addEventListener('click', () => this.handleSaveClick());
    }

    if (loadBtn) {
      loadBtn.addEventListener('click', () => this.handleLoadCharacterClick());
    }

    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) {
      exportBtn.addEventListener('click', () => this.handleExportClick());
    }

    const characterCard = document.getElementById('characterCard');
    if (characterCard) {
      characterCard.addEventListener('change', event => this.handleCharacterSelection(event));
    }

    // Setup birthplace cascading logic
    if (birthplaceSelect) {
      birthplaceSelect.addEventListener('change', () => this.handleBirthplaceChange());
    }

    // Export functions globally for modal onclick handlers
    window.loadCharacterById = (id) => this.loadCharacterById(id);
    window.deleteCharacterById = (id) => this.deleteCharacterById(id);

    console.log('✓ Form handlers attached');
  }

  /**
   * Handle birthplace selection change - show/hide appropriate region fields
   */
  handleBirthplaceChange() {
    const birthplaceSelect = document.getElementById('birthplaceSelect');
    const selectedOption = birthplaceSelect.options[birthplaceSelect.selectedIndex]?.text || '';
    
    // Get all region field groups
    const knownRegionGroup = document.getElementById('knownRegionGroup');
    const lostRegionGroup = document.getElementById('lostRegionGroup');
    const timePeriodGroup = document.getElementById('timePeriodGroup');
    const otherWorldGroup = document.getElementById('otherWorldGroup');
    const otherDimensionGroup = document.getElementById('otherDimensionGroup');
    
    // Hide all region fields initially
    if (knownRegionGroup) knownRegionGroup.style.display = 'none';
    if (lostRegionGroup) lostRegionGroup.style.display = 'none';
    if (timePeriodGroup) timePeriodGroup.style.display = 'none';
    if (otherWorldGroup) otherWorldGroup.style.display = 'none';
    if (otherDimensionGroup) otherDimensionGroup.style.display = 'none';
    
    // Show appropriate fields based on birthplace selection
    if (selectedOption === 'Local') {
      // Local: Show known region only
      if (knownRegionGroup) knownRegionGroup.style.display = 'block';
    } else if (selectedOption === 'Foreigner') {
      // Foreigner: Show known region + time period
      if (knownRegionGroup) knownRegionGroup.style.display = 'block';
      if (timePeriodGroup) timePeriodGroup.style.display = 'block';
    } else if (selectedOption === 'Stranger') {
      // Stranger: Show lost region only
      if (lostRegionGroup) lostRegionGroup.style.display = 'block';
    } else if (selectedOption === 'Anachronism') {
      // Anachronism: Show time period + lost region
      if (timePeriodGroup) timePeriodGroup.style.display = 'block';
      if (lostRegionGroup) lostRegionGroup.style.display = 'block';
    } else if (selectedOption === 'Alien') {
      // Alien: Show other world + other dimension
      if (otherWorldGroup) otherWorldGroup.style.display = 'block';
      if (otherDimensionGroup) otherDimensionGroup.style.display = 'block';
    } else if (selectedOption === 'Extra-Dimensional') {
      // Extra-Dimensional: Show other dimension only
      if (otherDimensionGroup) otherDimensionGroup.style.display = 'block';
    } else if (selectedOption === '') {
      // Random: Show all region fields so user can pick
      if (knownRegionGroup) knownRegionGroup.style.display = 'block';
      if (lostRegionGroup) lostRegionGroup.style.display = 'block';
      if (timePeriodGroup) timePeriodGroup.style.display = 'block';
      if (otherWorldGroup) otherWorldGroup.style.display = 'block';
      if (otherDimensionGroup) otherDimensionGroup.style.display = 'block';
    }
    
    console.log(`🏘️  Birthplace changed to: "${selectedOption}"`);
  }

  /**
   * Handle Generate button click - collect form parameters and generate character
   */
  async handleGenerateClick() {
    try {
      console.log('🎲 Generating character with selected presets...');
      
      // Show loading state
      const generateBtn = document.getElementById('generateBtn');
      const originalText = generateBtn.textContent;
      generateBtn.disabled = true;
      generateBtn.textContent = 'Generating...';

      // Collect all 18 form parameters
      const params = this.collectFormParameters();
      
      // Validate parameters
      this.validateParameters(params);
      
      // Generate character with 5-second timeout
      const generateWithTimeout = Promise.race([
        this.generator.generate(params),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Character generation timed out after 5 seconds')), 5000)
        )
      ]);
      const character = await generateWithTimeout;
      
      // Update state with generated character
      this.state.setState({ currentCharacter: character });
      
      // Display character
      this.displayCharacter(character);
      this.setWhatsNextVisibility(true);
      this.updateCharacterSectionTitle('Generated Character');
      
      // Enable save button
      const saveBtn = document.getElementById('saveBtn');
      if (saveBtn) {
        saveBtn.disabled = false;
      }

      // Enable export button
      const exportBtn = document.getElementById('exportBtn');
      if (exportBtn) {
        exportBtn.disabled = false;
      }
      
      // Enable load button only if there are saved characters
      const loadBtn = document.getElementById('loadBtn');
      if (loadBtn) {
        const savedCharacters = this.storage.getCharacters();
        loadBtn.disabled = savedCharacters.length === 0;
      }
      
      console.log('✅ Character generated successfully:', character);
      
      // Restore button
      generateBtn.disabled = false;
      generateBtn.textContent = originalText;
      
    } catch (error) {
      console.error('❌ Error generating character:', error);
      this.showError(`Failed to generate character: ${error.message}`);
      
      // Restore button
      const generateBtn = document.getElementById('generateBtn');
      generateBtn.disabled = false;
      generateBtn.textContent = 'Generate Character';
    }
  }

  /**
   * Handle All Random button click - generate with all random values
   */
  async handleRandomClick() {
    try {
      console.log('🎰 Generating character with all random values...');
      
      // Clear all form fields
      const selects = document.querySelectorAll('.preset-column select');
      selects.forEach(select => {
        select.value = '';
      });
      
      // Uncheck duplicates
      const dupesCheckbox = document.getElementById('allowDupesCheckbox');
      if (dupesCheckbox) {
        dupesCheckbox.checked = false;
      }
      
      // Generate with empty parameters (all random)
      await this.handleGenerateClick();
      
    } catch (error) {
      console.error('❌ Error generating random character:', error);
      this.showError(`Failed to generate random character: ${error.message}`);
    }
  }

  /**
   * Handle Save button click - save character to localStorage
   */
  async handleSaveClick() {
    // Open save modal
    const modal = document.getElementById('saveCharacterModal');
    const form = document.getElementById('saveCharacterForm');
    const nameInput = document.getElementById('characterNameInput');
    const notesInput = document.getElementById('characterNotesInput');
    
    // Clear form
    form.reset();
    const currentCharacter = this.state.state.currentCharacter;
    if (currentCharacter?.id) {
      nameInput.value = currentCharacter.name || '';
      notesInput.value = currentCharacter.notes || '';
    }
    nameInput.focus();
    
    // Show modal
    if (modal) modal.style.display = 'flex';
    
    // Setup modal handlers
    const handleSubmit = async (e) => {
      e.preventDefault();
      
      try {
        const character = this.state.state.currentCharacter;
        
        if (!character) {
          this.showError('No character to save');
          return;
        }
        
        // Add metadata
        character.name = nameInput.value || `Character ${Date.now()}`;
        character.notes = notesInput.value || '';
        character.createdAt = new Date().toISOString();
        character.id = character.id || Date.now();
        
        // Save to localStorage
        this.storage.saveCharacter(character);
        
        // Update state
        const savedCharacters = this.storage.getCharacters();
        this.state.setState({ savedCharacters });
        
        // Enable load button
        const loadBtn = document.getElementById('loadBtn');
        if (loadBtn) {
          loadBtn.disabled = false;
        }
        
        // Refresh character list
        this.ui.renderCharactersList();
        this.updateCharacterSectionTitle(character.name);
        
        // Close modal
        if (modal) modal.style.display = 'none';
        
        this.showSuccess(`Character "${character.name}" saved successfully!`);
        console.log('✅ Character saved:', character.name);
        
        // Detach listener
        form.removeEventListener('submit', handleSubmit);
        
      } catch (error) {
        console.error('❌ Error saving character:', error);
        this.showError(`Failed to save character: ${error.message}`);
      }
    };
    
    form.addEventListener('submit', handleSubmit);
    
    // Setup cancel button
    const cancelBtn = document.getElementById('saveCancelBtn');
    if (cancelBtn) {
      cancelBtn.onclick = () => {
        if (modal) modal.style.display = 'none';
        form.removeEventListener('submit', handleSubmit);
      };
    }
    
    // Setup close button
    const closeBtn = document.getElementById('saveCharacterModalClose');
    if (closeBtn) {
      closeBtn.onclick = () => {
        if (modal) modal.style.display = 'none';
        form.removeEventListener('submit', handleSubmit);
      };
    }
  }

  /**
   * Show load character modal with list of saved characters
   */
  async handleLoadCharacterClick() {
    const modal = document.getElementById('loadCharacterModal');
    const list = document.getElementById('savedCharactersList');
    
    if (!modal) return;
    
    const characters = this.storage.getCharacters();
    
    if (characters.length === 0) {
      list.innerHTML = '<p class="empty-state">No saved characters yet</p>';
    } else {
      list.innerHTML = characters.map(char => `
        <div class="character-item">
          <div class="character-item-name">${char.name || 'Unnamed'}</div>
          <div class="character-item-meta">${char.species || 'Unknown'}</div>
          <div class="character-item-meta">${new Date(char.createdAt).toLocaleDateString()}</div>
          ${char.notes ? `<div class="character-item-meta"><em>${char.notes.substring(0, 50)}...</em></div>` : ''}
          <div class="character-item-actions">
            <button class="btn btn-load btn-sm" onclick="window.loadCharacterById(${char.id})">Load</button>
            <button class="btn btn-delete btn-sm" onclick="window.deleteCharacterById(${char.id})">Delete</button>
          </div>
        </div>
      `).join('');
    }
    
    // Show modal
    modal.style.display = 'flex';
    
    // Setup close button
    const closeBtn = document.getElementById('loadCharacterModalClose');
    if (closeBtn) {
      closeBtn.onclick = () => {
        modal.style.display = 'none';
      };
    }
  }

  /**
   * Load a character by ID and display it
   */
  loadCharacterById(id) {
    const character = this.storage.getCharacter(id);
    
    if (!character) {
      this.showError('Character not found');
      return;
    }
    
    this.state.setState({ currentCharacter: character });
    this.displayCharacter(character);
    this.setWhatsNextVisibility(true);
    this.updateCharacterSectionTitle(character.name);
    
    // Enable save/export/load buttons
    const saveBtn = document.getElementById('saveBtn');
    if (saveBtn) saveBtn.disabled = false;
    
    const exportBtn = document.getElementById('exportBtn');
    if (exportBtn) exportBtn.disabled = false;
    
    // Load button state depends on whether there are saved characters
    const loadBtn = document.getElementById('loadBtn');
    if (loadBtn) {
      const savedCharacters = this.storage.getCharacters();
      loadBtn.disabled = savedCharacters.length === 0;
    }
    
    // Close modal
    const modal = document.getElementById('loadCharacterModal');
    if (modal) modal.style.display = 'none';
    
    this.showSuccess(`Loaded character "${character.name}"`);
    console.log('✅ Character loaded:', character.name);
  }

  /**
   * Delete a character by ID
   */
  deleteCharacterById(id) {
    if (!confirm('Are you sure you want to delete this character?')) {
      return;
    }
    
    console.log('🗑️ Attempting to delete character with ID:', id, 'type:', typeof id);
    
    // Get character name before deleting (for confirmation message)
    const character = this.storage.getCharacter(id);
    if (!character) {
      console.error('❌ Character not found. Available characters:', this.storage.getCharacters().map(c => ({ id: c.id, type: typeof c.id })));
      this.showError('Character not found');
      return;
    }
    
    const characterName = character.name || 'Unknown';
    
    // Now delete
    this.storage.deleteCharacter(id);
    
    const savedCharacters = this.storage.getCharacters();
    this.state.setState({ savedCharacters });
    
    // Refresh both character lists
    this.ui.renderCharactersList(); // Main "My Characters" section
    
    // Also refresh modal list if it's open
    const modalList = document.getElementById('savedCharactersList');
    if (modalList) {
      if (savedCharacters.length === 0) {
        modalList.innerHTML = '<p class="empty-state">No saved characters yet</p>';
      } else {
        modalList.innerHTML = savedCharacters.map(char => `
          <div class="character-item">
            <div class="character-item-name">${char.name || 'Unnamed'}</div>
            <div class="character-item-meta">${char.species || 'Unknown'}</div>
            <div class="character-item-meta">${new Date(char.createdAt).toLocaleDateString()}</div>
            ${char.notes ? `<div class="character-item-meta"><em>${char.notes.substring(0, 50)}...</em></div>` : ''}
            <div class="character-item-actions">
              <button class="btn btn-load btn-sm" onclick="window.loadCharacterById(${char.id})">Load</button>
              <button class="btn btn-delete btn-sm" onclick="window.deleteCharacterById(${char.id})">Delete</button>
            </div>
          </div>
        `).join('');
      }
    }
    
    // Disable load button if no characters left
    const loadBtn = document.getElementById('loadBtn');
    if (loadBtn) {
      loadBtn.disabled = savedCharacters.length === 0;
    }
    
    this.showSuccess(`Character "${characterName}" deleted`);
    console.log('✅ Character deleted:', characterName);
  }

  handleCharacterSelection(event) {
    const checkbox = event.target.closest(
      '[data-background-selection], [data-motivation-selection], [data-ability-selection]'
    );
    const characterCard = document.getElementById('characterCard');
    if (!checkbox || !characterCard?.contains(checkbox)) {
      return;
    }

    const scrollPosition = characterCard.querySelector('.character-display')?.scrollTop || 0;
    const renderCharacterAtScrollPosition = character => {
      this.displayCharacter(character);
      const characterDisplay = characterCard.querySelector('.character-display');
      if (characterDisplay) {
        characterDisplay.scrollTop = scrollPosition;
      }
    };

    const character = this.state.state.currentCharacter;
    if (!character) {
      return;
    }

    if (checkbox.hasAttribute('data-background-selection')) {
      const selectedBackgrounds = character.selectedBackgrounds || [];
      if (checkbox.checked && !selectedBackgrounds.includes(checkbox.value)) {
        if (selectedBackgrounds.length >= 2) {
          renderCharacterAtScrollPosition(character);
          this.showWarning('You can select up to two backgrounds.');
          return;
        }
        selectedBackgrounds.push(checkbox.value);
      } else if (!checkbox.checked) {
        character.selectedBackgrounds = selectedBackgrounds.filter(
          background => background !== checkbox.value
        );
      }

      if (checkbox.checked) {
        character.selectedBackgrounds = selectedBackgrounds;
      }
    } else if (checkbox.hasAttribute('data-motivation-selection')) {
      character.selectedMotivation = checkbox.checked ? checkbox.value : '';
    } else {
      const selectedAbilities = character.selectedAbilities || [];
      if (checkbox.checked && !selectedAbilities.includes(checkbox.value)) {
        if (selectedAbilities.length >= 4) {
          renderCharacterAtScrollPosition(character);
          this.showWarning('You can select up to four abilities.');
          return;
        }
        selectedAbilities.push(checkbox.value);
      } else if (!checkbox.checked) {
        character.selectedAbilities = selectedAbilities.filter(
          ability => ability !== checkbox.value
        );
      }

      if (checkbox.checked) {
        character.selectedAbilities = selectedAbilities;
      }
    }

    renderCharacterAtScrollPosition(character);
  }

  /**
   * Handle character export to Excel
   */
  async handleExportClick() {
    if (!this.state.state.currentCharacter) {
      this.showError('No character to export. Please generate a character first.');
      return;
    }
    try {
      const character = this.state.state.currentCharacter;

      // Show loading state
      const exportBtn = document.getElementById('exportBtn');
      const originalText = exportBtn.textContent;
      exportBtn.textContent = 'Exporting...';
      exportBtn.disabled = true;

      // Perform Excel export (async, throws on error)
      await ExcelExporter.exportCharacter(character);
      
      exportBtn.textContent = originalText;
      exportBtn.disabled = false;
      this.showSuccess(`Exported character: ${character.name || 'Character'}`);
      console.log('✅ Excel export successful');
    } catch (error) {
      const exportBtn = document.getElementById('exportBtn');
      exportBtn.textContent = 'Export to Excel';
      exportBtn.disabled = false;

      this.showError(`Export error: ${error.message}`);
      console.error('❌ Export error:', error);
    }
  }

  /**
   * Collect all 18 form parameters from form fields
   * @returns {Object} - Parameters object for character generation
   */
  collectFormParameters() {
    const params = {
      powerlevelId: this.getFormValue('powerlevelSelect'),
      sideId: this.getFormValue('sideSelect'),
      birthplaceId: this.getFormValue('birthplaceSelect'),
      speciesId: this.getFormValue('speciesSelect'),
      cultureId: this.getFormValue('cultureSelect'),
      genderIdentityId: this.getFormValue('genderIdentitySelect'),
      genderExpressionId: this.getFormValue('genderExpressionSelect'),
      biologicalSexId: this.getFormValue('biologicalSexSelect'),
      sexualAttractionId: this.getFormValue('sexualAttractionSelect'),
      motivationId: this.getFormValue('motivationSelect'),
      originTypeId: this.getFormValue('originTypeSelect'),
      keepDuplicates: document.getElementById('allowDupesCheckbox')?.checked || false,
      lostRegionId: this.getFormValue('lostRegionSelect'),
      knownRegionId: this.getFormValue('knownRegionSelect'),
      otherWorldId: this.getFormValue('otherWorldSelect'),
      otherDimensionId: this.getFormValue('otherDimensionSelect'),
      timePeriodId: this.getFormValue('timePeriodSelect')
    };

    console.log('📋 Collected parameters:', params);
    return params;
  }

  /**
   * Get form value and convert to integer or null
   * @param {string} elementId - Form element ID
   * @returns {number|null} - Integer value or null if empty
   */
  getFormValue(elementId) {
    const element = document.getElementById(elementId);
    if (!element) {
      console.warn(`Form element not found: ${elementId}`);
      return null;
    }

    const value = element.value;
    
    // Return null if empty (means random)
    if (value === '' || value === null) {
      return null;
    }

    // Try to parse as integer
    const intValue = parseInt(value, 10);
    if (isNaN(intValue)) {
      console.warn(`Invalid value for ${elementId}: ${value}`);
      return null;
    }

    return intValue;
  }

  /**
   * Validate parameters before generation
   * @param {Object} params - Parameters to validate
   * @throws {Error} - If validation fails
   */
  validateParameters(params) {
    // All parameters are optional (null means random)
    // Just verify they're either null or positive integers
    
    const numericFields = [
      'powerlevelId', 'sideId', 'birthplaceId', 'speciesId', 'cultureId',
      'genderIdentityId', 'genderExpressionId', 'biologicalSexId', 'sexualAttractionId',
      'motivationId', 'originTypeId', 'lostRegionId', 'knownRegionId',
      'otherWorldId', 'otherDimensionId', 'timePeriodId'
    ];

    for (const field of numericFields) {
      const value = params[field];
      if (value !== null && (typeof value !== 'number' || value <= 0)) {
        throw new Error(`Invalid ${field}: must be positive integer or null`);
      }
    }

    if (typeof params.keepDuplicates !== 'boolean') {
      throw new Error('Invalid keepDuplicates: must be boolean');
    }

    console.log('✓ Parameters validated');
  }

  /**
   * Display generated character in UI
   * @param {Object} character - Generated character object
   */
  displayCharacter(character) {
    const characterCard = document.getElementById('characterCard');
    if (!characterCard) {
      console.warn('Character card element not found');
      return;
    }

    // Create character display HTML
    const html = this.createCharacterHTML(character);
    characterCard.innerHTML = html;
    this.setWhatsNextVisibility(Boolean(character));

    console.log('✓ Character displayed');
  }

  setWhatsNextVisibility(visible) {
    const whatsNext = document.getElementById('whatsNext');
    if (whatsNext) {
      whatsNext.hidden = !visible;
    }
  }

  updateCharacterSectionTitle(title) {
    const sectionTitle = document.getElementById('characterSectionTitle');
    if (sectionTitle) {
      sectionTitle.textContent = title || 'Generated Character';
    }
  }

  /**
   * Create HTML for character display
   * @param {Object} character - Character object
   * @returns {string} - HTML string
   */
  createCharacterHTML(character) {
    const escapeHtml = value => String(value ?? '').replace(/[&<>"']/g, character => ({
      '&': '&amp;',
      '<': '&lt;',
      '>': '&gt;',
      '"': '&quot;',
      "'": '&#39;'
    })[character]);
    const displayValue = value => value === undefined || value === null || value === ''
      ? '—'
      : escapeHtml(value);
    const renderList = (items, emptyText, className) => items.length
      ? `<ul class="${className}">${items.map(item => `<li>${escapeHtml(item)}</li>`).join('')}</ul>`
      : `<p class="character-empty">${escapeHtml(emptyText)}</p>`;
    const renderTable = (headers, rows) => `
      <div class="character-table-wrapper">
        <table class="character-data-table">
          <thead><tr>${headers.map(header => `<th>${escapeHtml(header)}</th>`).join('')}</tr></thead>
          <tbody>${rows.map(row => `<tr>${row.map(value => `<td>${value}</td>`).join('')}</tr>`).join('')}</tbody>
        </table>
      </div>
    `;
    const valueTable = rows => renderTable(['', ''], rows.map(([label, value]) => [
      `<strong>${escapeHtml(label)}</strong>`,
      displayValue(value)
    ]));
    const statsTable = renderTable(
      ['BC', 'Score', 'Save'],
      [
        ['ST', character.strength, '—'],
        ['EN', character.endurance, character.enSave === undefined ? '—' : `${escapeHtml(character.enSave)}-`],
        ['AG', character.agility, character.agSave === undefined ? '—' : `${escapeHtml(character.agSave)}-`],
        ['IN', character.intelligence, character.inSave === undefined ? '—' : `${escapeHtml(character.inSave)}-`],
        ['CL', character.cool, character.clSave === undefined ? '—' : `${escapeHtml(character.clSave)}-`]
      ].map(([stat, score, save]) => [escapeHtml(stat), displayValue(score), save])
    );
    const speciesAbilityRows = (character.racialAbilities || []).map(value => {
        const [cost, ...description] = String(value).split('@@');
        return [displayValue(cost), escapeHtml(description.join('@@'))];
    });
    const selectedAbilities = character.selectedAbilities || [];
    const weaknessRows = [
      ...(character.weaknesses || []).map(weakness => ['—', escapeHtml(weakness)]),
      ...(character.racialWeaknesses || []).map(value => {
        const [cost, ...description] = String(value).split('@@');
        return [displayValue(cost), `${escapeHtml(description.join('@@'))} (Racial)`];
      })
    ];
    const totalCp = Number(character.totalCp) || 0;
    const moveLeap = Number(character.weight) > 0 && Number.isFinite(Number(character.carryingCapacity))
      ? (Number(character.carryingCapacity) / Number(character.weight)).toFixed(2)
      : '—';
    const motivations = character.motivations || (character.motivation ? [character.motivation] : []);
    const backgrounds = character.backgrounds || [];
    const selectedBackgrounds = character.selectedBackgrounds || [];
    const selectedMotivation = character.selectedMotivation || (motivations.length === 1 ? motivations[0] : '');
    const backgroundSelectionHtml = backgrounds.length
      ? `<div class="background-selection">
          ${backgrounds.map((background, index) => {
            const checked = selectedBackgrounds.includes(background);
            const disabled = !checked && selectedBackgrounds.length >= 2;
            return `<label class="background-option">
              <input
                type="checkbox"
                data-background-selection
                value="${escapeHtml(background)}"
                ${checked ? 'checked' : ''}
                ${disabled ? 'disabled' : ''}
                aria-label="Select background ${index + 1}: ${escapeHtml(background)}">
              <span>${escapeHtml(background)}</span>
            </label>`;
          }).join('')}
        </div>`
      : '<p class="character-empty">No backgrounds</p>';
    const motivationSelectionHtml = motivations.length
      ? `<div class="motivation-selection">
          ${motivations.map((motivation, index) => `
            <label class="motivation-option">
              <input
                type="checkbox"
                data-motivation-selection
                value="${escapeHtml(motivation)}"
                ${selectedMotivation === motivation ? 'checked' : ''}
                aria-label="Select motivation ${index + 1}: ${escapeHtml(motivation)}">
              <span>${escapeHtml(motivation)}</span>
            </label>
          `).join('')}
        </div>`
      : '<p class="character-empty">No motivations</p>';
    const randomAbilitySelectionHtml = character.abilities?.length
      ? `<div class="ability-selection">
          ${character.abilities.map((ability, index) => `
            <label class="ability-option">
              <input
                type="checkbox"
                data-ability-selection
                value="${escapeHtml(ability)}"
                ${selectedAbilities.includes(ability) ? 'checked' : ''}
                ${!selectedAbilities.includes(ability) && selectedAbilities.length >= 4 ? 'disabled' : ''}
                aria-label="Select ability ${index + 1}: ${escapeHtml(ability)}">
              <span class="ability-cost">${displayValue(character.cpPerAbility)}</span>
              <span>${escapeHtml(ability)}</span>
            </label>
          `).join('')}
        </div>`
      : `<p class="character-empty">${
          character.powerlevelId === 1
            ? 'None at Normal power level'
            : 'No random abilities were generated'
        }</p>`;

    return `
      <div class="character-display">
        <div class="character-header">
          <h3 class="character-name">${displayValue(character.name || character.species || 'Character')}</h3>
        </div>

        <div class="character-section">
          <h4>Basic Info</h4>
          ${valueTable([
            ['Side', character.side],
            ['Species', character.species],
            ['Age', character.age],
            ['Weight', character.weight],
            ['Birthplace', character.birthplace],
            ['Culture', character.culture],
            ['Gender', character.gender],
            ['Mass', character.mass],
            ['Origin Type', character.originType],
            ['Wealth', character.wealth],
            ['Luck', character.luck],
            ['Power Level', character.powerlevel]
          ])}
        </div>

        <div class="character-section">
          <h4>Base Characteristics</h4>
          ${statsTable}
        </div>

        <div class="character-section">
          <h4>Derived Stats</h4>
          ${valueTable([
            ['Power', character.power],
            ['Hit Pts', character.hits],
            ['Initiative', character.initiative],
            ['Base HTH', character.baseHth],
            ['Carrying Capacity', character.carryingCapacity],
            ['Defenses (Phys/Mental)', `${character.physicalDefense ?? '—'} / ${character.mentalDefense ?? '—'}`],
            ['Move (Ground)', character.move],
            ['Move (Leap)', moveLeap],
            ['Healing', character.healingRate],
            ['Inventing Points', character.inventingPoints]
          ])}
        </div>

        <div class="character-section">
          <h4>Background (Pick 2)</h4>
          ${backgroundSelectionHtml}
        </div>

        <div class="character-section">
          <h4>Motivation (Pick 1)</h4>
          ${motivationSelectionHtml}
        </div>

        <div class="character-section">
          <h4>Abilities</h4>
          ${speciesAbilityRows.length ? `
            <h5>Species Abilities</h5>
            ${renderTable(['CPs', 'Ability'], speciesAbilityRows)}
          ` : ''}
          <h5>Randomly Generated Abilities (Pick 4)</h5>
          ${randomAbilitySelectionHtml}
        </div>

        <div class="character-section">
          <h4>Weaknesses</h4>
          ${renderTable(['CPs', 'Weaknesses'], weaknessRows.length ? weaknessRows : [['—', 'No weaknesses']])}
        </div>

        <div class="character-section">
          <h4>Caps</h4>
          ${renderTable(['Stat', 'Cap'], [
            ['BCs', displayValue(character.bcCap)],
            ['Ability', displayValue(character.abilityCap)],
            ['Damage', displayValue(character.damageCap)],
            ['Gear Break', String(Math.floor(totalCp / 25) + 5)],
            ['Gear Take', String(Math.floor(totalCp / 25) + 6)],
            ['Disarm', String(Math.floor(totalCp / 25) + 3)],
            ['GBC', String(Math.floor(totalCp / 15) + 6)]
          ])}
        </div>
      </div>
    `;
  }

  /**
   * Show error message to user
   * @param {string} message - Error message
   */
  showError(message) {
    console.error('⚠️ Error:', message);
    
    // Create and show error notification
    const notification = document.createElement('div');
    notification.className = 'notification notification-error';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      notification.remove();
    }, 5000);
  }

  /**
   * Show success message to user
   * @param {string} message - Success message
   */
  showSuccess(message) {
    console.log('✅ Success:', message);
    
    // Create and show success notification
    const notification = document.createElement('div');
    notification.className = 'notification notification-success';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 3 seconds
    setTimeout(() => {
      notification.remove();
    }, 3000);
  }

  /**
   * Show warning message to user
   * @param {string} message - Warning message
   */
  showWarning(message) {
    console.warn('⚠️ Warning:', message);
    
    // Create and show warning notification
    const notification = document.createElement('div');
    notification.className = 'notification notification-warning';
    notification.textContent = message;
    document.body.appendChild(notification);

    // Auto-remove after 4 seconds
    setTimeout(() => {
      notification.remove();
    }, 4000);
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new Application();
  await app.initialize();
  
  // Make app instance available for debugging
  window.mpgenApp = app;
});
