/**
 * Global Bottom Navigation Component
 * Persistent bottom nav: Home | Add | Search | Profile
 * 
 * Features:
 * - Persistent across all pages
 * - Add button opens action sheet (Record Trail / Report Issue)
 * - Search button opens action sheet (Find Trails / Find Reports)
 * - Active state based on current page
 * 
 * @file src/components/globalNav.js
 * @version 1.0
 */

export class GlobalNav {
  constructor(options = {}) {
    this.navElement = null;
    this.actionSheetOverlay = null;
    this.currentPage = options.currentPage || this.detectCurrentPage();
    this.onNavigate = options.onNavigate || null;
    
    // Action sheet state
    this.activeSheet = null;
  }

  /**
   * Detect current page from URL
   */
  detectCurrentPage() {
    const path = window.location.pathname;
    if (path.includes('tracker')) return 'tracker';
    if (path.includes('reports')) return 'reports';
    if (path.includes('profile')) return 'profile';
    return 'home';
  }

  /**
   * Initialize and mount the navigation
   */
  init() {
    // Add body class for proper page offset
    document.body.classList.add('has-bottom-nav');
    
    // Create and mount nav
    this.render();
    
    // Handle hardware back button (for action sheets)
    window.addEventListener('popstate', () => this.closeActionSheet());
    
    console.log('[GlobalNav] Initialized on page:', this.currentPage);
  }

  /**
   * Render the navigation bar
   */
  render() {
    // Create nav container
    const nav = document.createElement('nav');
    nav.className = 'global-bottom-nav';
    nav.setAttribute('role', 'navigation');
    nav.setAttribute('aria-label', 'Main navigation');

    nav.innerHTML = `
      <!-- Home -->
      <a href="index.html" class="global-nav-item ${this.currentPage === 'home' ? 'active' : ''}" aria-label="Home">
        <span class="nav-icon">🏠</span>
        <span class="nav-label">Home</span>
      </a>

      <!-- Add (FAB) -->
      <div class="global-nav-fab-container">
        <button class="global-nav-fab" id="globalNavAdd" aria-label="Add new content" aria-haspopup="true">
          <span>➕</span>
        </button>
      </div>

      <!-- Search (FAB) -->
      <div class="global-nav-fab-container">
        <button class="global-nav-fab search" id="globalNavSearch" aria-label="Search" aria-haspopup="true">
          <span>🔍</span>
        </button>
      </div>

      <!-- Profile -->
      <a href="profile.html" class="global-nav-item ${this.currentPage === 'profile' ? 'active' : ''}" aria-label="Profile" id="globalNavProfile">
        <span class="nav-icon">👤</span>
        <span class="nav-label">Profile</span>
      </a>
    `;

    this.navElement = nav;
    document.body.appendChild(nav);

    // Create action sheet overlay
    this.createActionSheetOverlay();

    // Bind events
    this.bindEvents();

    // Check auth state for profile visibility
    this.updateProfileVisibility();
  }

  /**
   * Create the action sheet overlay (shared between Add and Search)
   */
  createActionSheetOverlay() {
    const overlay = document.createElement('div');
    overlay.className = 'action-sheet-overlay';
    overlay.id = 'actionSheetOverlay';
    overlay.innerHTML = `
      <div class="action-sheet" role="dialog" aria-modal="true">
        <div class="action-sheet-header">
          <h2 class="action-sheet-title" id="actionSheetTitle">Choose an option</h2>
          <button class="action-sheet-close" aria-label="Close">&times;</button>
        </div>
        <div class="action-sheet-options" id="actionSheetOptions">
          <!-- Options populated dynamically -->
        </div>
      </div>
    `;

    this.actionSheetOverlay = overlay;
    document.body.appendChild(overlay);

    // Close on overlay click
    overlay.addEventListener('click', (e) => {
      if (e.target === overlay) {
        this.closeActionSheet();
      }
    });

    // Close button
    overlay.querySelector('.action-sheet-close').addEventListener('click', () => {
      this.closeActionSheet();
    });
  }

  /**
   * Bind event listeners
   */
  bindEvents() {
    // Add button
    document.getElementById('globalNavAdd')?.addEventListener('click', () => {
      this.showAddSheet();
    });

    // Search button
    document.getElementById('globalNavSearch')?.addEventListener('click', () => {
      this.showSearchSheet();
    });

    // Handle escape key
    document.addEventListener('keydown', (e) => {
      if (e.key === 'Escape' && this.activeSheet) {
        this.closeActionSheet();
      }
    });
  }

  /**
   * Show the "Add" action sheet
   */
  showAddSheet() {
    const options = `
      <button class="action-sheet-option trail" onclick="globalNav.navigate('tracker')">
        <div class="option-icon">📍</div>
        <div class="option-content">
          <div class="option-title">Record Trail</div>
          <div class="option-desc">Track and document an accessible route</div>
        </div>
      </button>
      <button class="action-sheet-option report" onclick="globalNav.navigate('reports', 'create')">
        <div class="option-icon">📋</div>
        <div class="option-content">
          <div class="option-title">Report Issue</div>
          <div class="option-desc">Report an accessibility barrier</div>
        </div>
      </button>
    `;

    this.showActionSheet('Contribute', options);
    this.activeSheet = 'add';
  }

  /**
   * Show the "Search" action sheet
   */
  showSearchSheet() {
    const options = `
      <button class="action-sheet-option search-trails" onclick="globalNav.navigate('home', 'search-trails')">
        <div class="option-icon">🗺️</div>
        <div class="option-content">
          <div class="option-title">Find Trails</div>
          <div class="option-desc">Search accessible trail guides</div>
        </div>
      </button>
      <button class="action-sheet-option search-reports" onclick="globalNav.navigate('reports', 'search')">
        <div class="option-icon">📋</div>
        <div class="option-content">
          <div class="option-title">Find Reports</div>
          <div class="option-desc">Browse accessibility reports near you</div>
        </div>
      </button>
    `;

    this.showActionSheet('Discover', options);
    this.activeSheet = 'search';
  }

  /**
   * Show an action sheet with given title and options
   */
  showActionSheet(title, optionsHTML) {
    const titleEl = document.getElementById('actionSheetTitle');
    const optionsEl = document.getElementById('actionSheetOptions');
    
    if (titleEl) titleEl.textContent = title;
    if (optionsEl) optionsEl.innerHTML = optionsHTML;

    // Add history state for back button handling
    history.pushState({ actionSheet: true }, '');
    
    // Show overlay
    this.actionSheetOverlay?.classList.add('active');
    
    // Focus first option for accessibility
    setTimeout(() => {
      const firstOption = optionsEl?.querySelector('.action-sheet-option');
      if (firstOption) firstOption.focus();
    }, 300);
  }

  /**
   * Close the action sheet
   */
  closeActionSheet() {
    this.actionSheetOverlay?.classList.remove('active');
    this.activeSheet = null;
  }

  /**
   * Navigate to a page/action
   */
  navigate(page, action = null) {
    this.closeActionSheet();

    // Handle navigation
    switch (page) {
      case 'home':
        if (action === 'search-trails') {
          // Navigate to home and trigger trail browser
          if (window.location.pathname.includes('index')) {
            // Already on home, just open browser
            window.openTrailBrowser?.();
          } else {
            window.location.href = 'index.html?action=search-trails';
          }
        } else {
          window.location.href = 'index.html';
        }
        break;

      case 'tracker':
        window.location.href = 'tracker.html';
        break;

      case 'reports':
        if (action === 'create') {
          window.location.href = 'reports.html?action=create';
        } else if (action === 'search') {
          window.location.href = 'reports.html?action=search';
        } else {
          window.location.href = 'reports.html';
        }
        break;

      case 'profile':
        window.location.href = 'profile.html';
        break;
    }

    // Callback if provided
    if (this.onNavigate) {
      this.onNavigate(page, action);
    }
  }

  /**
   * Update profile link visibility based on auth state
   */
  updateProfileVisibility() {
    const profileLink = document.getElementById('globalNavProfile');
    if (!profileLink) return;

    // Check auth state (works with Firebase)
    const checkAuth = () => {
      const isLoggedIn = window.auth?.currentUser || 
                         document.querySelector('.auth-status.signed-in') ||
                         localStorage.getItem('accessNature_authToken');
      
      profileLink.style.display = isLoggedIn ? '' : 'none';
    };

    // Initial check
    checkAuth();

    // Listen for auth changes
    window.addEventListener('authStateChanged', checkAuth);
    
    // Fallback: check periodically for first few seconds
    let checks = 0;
    const interval = setInterval(() => {
      checkAuth();
      checks++;
      if (checks > 10) clearInterval(interval);
    }, 500);
  }

  /**
   * Set the active nav item
   */
  setActive(page) {
    const items = this.navElement?.querySelectorAll('.global-nav-item');
    items?.forEach(item => {
      item.classList.remove('active');
      if (item.getAttribute('href')?.includes(page) || 
          (page === 'home' && item.getAttribute('href')?.includes('index'))) {
        item.classList.add('active');
      }
    });
    this.currentPage = page;
  }

  /**
   * Show/hide the navigation
   */
  show() {
    if (this.navElement) {
      this.navElement.style.display = '';
    }
  }

  hide() {
    if (this.navElement) {
      this.navElement.style.display = 'none';
    }
  }

  /**
   * Destroy the component
   */
  destroy() {
    this.navElement?.remove();
    this.actionSheetOverlay?.remove();
    document.body.classList.remove('has-bottom-nav');
  }
}

// Create and export singleton instance
let globalNavInstance = null;

export function initGlobalNav(options = {}) {
  if (!globalNavInstance) {
    globalNavInstance = new GlobalNav(options);
    globalNavInstance.init();
    
    // Make available globally for onclick handlers
    window.globalNav = globalNavInstance;
  }
  return globalNavInstance;
}

export function getGlobalNav() {
  return globalNavInstance;
}

export default GlobalNav;
