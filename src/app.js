// ============================================================================
// MPGEN Application - Main Entry Point
// Vanilla JavaScript SPA
// ============================================================================

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
      const tables = [
        'worlds',
        'timePeriods',
        'species',
        'cultures',
        'birthplaces',
        'abilities',
        'dimensions',
        'powerlevels',
        'sides',
        'motivations',
        'origin_types',
        'known_regions',
        'lost_regions',
        'other_worlds',
        'other_dimensions',
        'gender_identities',
        'gender_expressions',
        'biological_sexes',
        'sexual_attractions'
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
}

/**
 * Character Generator
 * Handles character generation logic
 */
class CharacterGenerator {
  constructor(data) {
    this.data = data;
  }
  
  generate(options = {}) {
    // This is where the complex character generation algorithm will be implemented
    // For Phase 2, this is a placeholder
    const character = {
      id: this.generateId(),
      name: this.generateName(options),
      world: options.world || null,
      timePeriod: options.timePeriod || null,
      species: options.species || null,
      culture: options.culture || null,
      birthplace: options.birthplace || null,
      ability: options.ability || null,
      dimension: options.dimension || null,
      attributes: {
        strength: Math.floor(Math.random() * 10) + 1,
        dexterity: Math.floor(Math.random() * 10) + 1,
        constitution: Math.floor(Math.random() * 10) + 1,
        intelligence: Math.floor(Math.random() * 10) + 1,
        wisdom: Math.floor(Math.random() * 10) + 1,
        charisma: Math.floor(Math.random() * 10) + 1
      },
      createdAt: new Date().toISOString()
    };
    
    return character;
  }
  
  generateId() {
    return 'char_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
  }
  
  generateName(options) {
    // Placeholder name generation
    const firstNames = ['Aria', 'Kai', 'Zephyr', 'Nova', 'Orion', 'Lyric', 'Sage', 'Atlas'];
    const lastNames = ['Starborne', 'Skywalker', 'Fireheart', 'Shadowblade', 'Stormwind'];
    
    return firstNames[Math.floor(Math.random() * firstNames.length)] + ' ' +
           lastNames[Math.floor(Math.random() * lastNames.length)];
  }
}

/**
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
    return characters.find(c => c.id === id);
  }
  
  deleteCharacter(id) {
    try {
      const characters = this.getCharacters();
      const filtered = characters.filter(c => c.id !== id);
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
      worldSelect: document.getElementById('worldSelect'),
      timeperiodSelect: document.getElementById('timeperiodSelect'),
      speciesSelect: document.getElementById('speciesSelect'),
      cultureSelect: document.getElementById('cultureSelect'),
      birthplaceSelect: document.getElementById('birthplaceSelect'),
      abilitySelect: document.getElementById('abilitySelect'),
      dimensionSelect: document.getElementById('dimensionSelect'),
      blogFeed: document.getElementById('blogFeed')
    };
  }
  
  attachEventListeners() {
    this.elements.generateBtn.addEventListener('click', () => this.handleGenerate());
    this.elements.randomBtn.addEventListener('click', () => this.handleRandom());
    this.elements.saveBtn.addEventListener('click', () => this.handleSave());
    this.elements.exportBtn.addEventListener('click', () => this.handleExport());
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
    
    const html = characters.map(char => `
      <div class="character-card-preview">
        <div class="character-card-name">${char.name}</div>
        <div class="character-card-meta">${char.species || 'Unknown'}</div>
        <div class="character-card-meta">${new Date(char.createdAt).toLocaleDateString()}</div>
      </div>
    `).join('');
    
    this.elements.charactersList.innerHTML = html;
  }
  
  loadBlog() {
    // Placeholder for blog loading (Phase 4)
    this.elements.blogFeed.innerHTML = '<div class="loading">Blog integration coming in Phase 4</div>';
  }
  
  populateSelects(data) {
    const selects = {
      worldSelect: data.worlds,
      timeperiodSelect: data.timePeriods,
      speciesSelect: data.species,
      cultureSelect: data.cultures,
      birthplaceSelect: data.birthplaces,
      abilitySelect: data.abilities,
      dimensionSelect: data.dimensions
    };
    
    Object.entries(selects).forEach(([selectId, items]) => {
      const select = this.elements[selectId];
      if (select && items.length > 0) {
        items.forEach(item => {
          const option = document.createElement('option');
          option.value = typeof item === 'string' ? item : item.name || item.id;
          option.textContent = typeof item === 'string' ? item : item.name || item.id;
          select.appendChild(option);
        });
      }
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
      
      // Initialize generator
      this.generator = new CharacterGenerator(data);
      
      // Initialize UI
      this.ui = new UIController(this.state, this.generator, this.storage);
      this.ui.populateSelects(data);
      this.ui.renderCharactersList();
      
      // Initialize router
      this.router = new Router(this.state);
      
      // Subscribe to state changes
      this.state.subscribe((state) => {
        console.log('State updated:', state);
      });
      
      // Load saved characters
      const savedCharacters = this.storage.getCharacters();
      this.state.setState({ savedCharacters });
      
      console.log('✅ MPGEN Application initialized successfully');
    } catch (error) {
      console.error('❌ Error initializing application:', error);
      this.state.updateUI({ 
        error: 'Failed to initialize application: ' + error.message 
      });
    }
  }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', async () => {
  const app = new Application();
  await app.initialize();
  
  // Make app instance available for debugging
  window.mpgenApp = app;
});
