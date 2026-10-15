/**
 * FreshTrack 2.0 — Main Application Controller
 * Handles UI events, navigation, modal management, rendering,
 * and user interactions.
 */

const App = {
  // Current active modal instances
  modals: {},
  // Pending delete target
  pendingDeleteId: null,
  // Current action type for usage modal ('used' or 'wasted')
  currentUseAction: 'used',
  // Active recipe being viewed in detail modal
  currentActiveRecipe: null,

  /**
   * Initializes application on DOM load.
   */
  init() {
    console.log('[FreshTrack 2.0] Initializing application...');

    // 1. Initialize persistent storage
    StorageService.init();

    // 2. Instantiate Bootstrap Modals
    this.initModals();

    // 3. Populate Form Select Dropdowns
    this.populateDropdowns();

    // 4. Attach Hash Navigation Listener
    window.addEventListener('hashchange', () => this.handleRouting());

    // 5. Initial Route Load
    this.handleRouting();

    // 6. Update global counters
    this.updateGlobalBadges();

    console.log('[FreshTrack 2.0] Application ready.');
  },

  /**
   * Initialize Bootstrap 5 Modal instances
   */
  initModals() {
    const modalIds = [
      'pantryItemModal',
      'useWasteModal',
      'deleteConfirmModal',
      'recipeDetailModal',
      'shoppingItemModal',
      'moveShoppingToPantryModal',
      'resetDataModal',
      'importBackupModal'
    ];

    modalIds.forEach(id => {
      const el = document.getElementById(id);
      if (el && (typeof bootstrap !== 'undefined' || (typeof window !== 'undefined' && window.bootstrap))) {
        const bs = typeof bootstrap !== 'undefined' ? bootstrap : window.bootstrap;
        this.modals[id] = new bs.Modal(el);
      }
    });

    // Delete modal execution button
    const deleteExecBtn = document.getElementById('delete-confirm-execute-btn');
    if (deleteExecBtn) {
      deleteExecBtn.addEventListener('click', () => this.executeDeletePantryItem());
    }

    // Recipe modal actions
    const cookRecipeBtn = document.getElementById('recipe-modal-cook-btn');
    if (cookRecipeBtn) {
      cookRecipeBtn.addEventListener('click', () => this.handleCookRecipe());
    }

    const addMissingBtn = document.getElementById('recipe-modal-add-missing-btn');
    if (addMissingBtn) {
      addMissingBtn.addEventListener('click', () => this.handleAddMissingRecipeToShopping());
    }
  },

  /**
   * Populate select dropdown options from static data definitions
   */
  populateDropdowns() {
    // Categories
    const catSelects = [
      document.getElementById('pantry-form-category'),
      document.getElementById('shopping-form-category'),
      document.getElementById('pantry-filter-category')
    ];
    catSelects.forEach(sel => {
      if (!sel) return;
      const isFilter = sel.id.includes('filter');
      if (!isFilter) sel.innerHTML = '';
      CATEGORIES.forEach(cat => {
        const opt = document.createElement('option');
        opt.value = cat.id;
        opt.textContent = cat.name;
        sel.appendChild(opt);
      });
    });

    // Storage Locations
    const locSelects = [
      document.getElementById('pantry-form-storage'),
      document.getElementById('move-pantry-storage'),
      document.getElementById('pantry-filter-storage')
    ];
    locSelects.forEach(sel => {
      if (!sel) return;
      const isFilter = sel.id.includes('filter');
      if (!isFilter) sel.innerHTML = '';
      STORAGE_LOCATIONS.forEach(loc => {
        const opt = document.createElement('option');
        opt.value = loc.id;
        opt.textContent = loc.name;
        sel.appendChild(opt);
      });
    });

    // Units
    const unitSelects = [
      document.getElementById('pantry-form-unit'),
      document.getElementById('shopping-form-unit'),
      document.getElementById('move-pantry-unit')
    ];
    unitSelects.forEach(sel => {
      if (!sel) return;
      sel.innerHTML = '';
      MEASUREMENT_UNITS.forEach(u => {
        const opt = document.createElement('option');
        opt.value = u;
        opt.textContent = u;
        sel.appendChild(opt);
      });
    });
  },

  /**
   * Hash-based SPA Navigation Router
   */
  handleRouting() {
    const rawHash = window.location.hash.replace('#', '').trim();
    const validSections = ['dashboard', 'pantry', 'use-first', 'recipes', 'shopping', 'analytics'];
    const targetSection = validSections.includes(rawHash) ? rawHash : 'dashboard';
    this.navigate(targetSection, false);
  },

  /**
   * Switch between app sections smoothly
   */
  navigate(sectionId, updateHash = true) {
    if (updateHash) {
      window.location.hash = sectionId;
    }

    const sections = ['dashboard', 'pantry', 'use-first', 'recipes', 'shopping', 'analytics'];
    sections.forEach(s => {
      const el = document.getElementById(`section-${s}`);
      const link = document.getElementById(`nav-${s}`);
      if (el) {
        el.style.display = (s === sectionId) ? 'block' : 'none';
      }
      if (link) {
        if (s === sectionId) {
          link.classList.add('active');
        } else {
          link.classList.remove('active');
        }
      }
    });

    // Update Page Headline
    const titleMap = {
      'dashboard': 'Dashboard',
      'pantry': 'My Pantry Inventory',
      'use-first': 'Use First — Priority Queue',
      'recipes': 'Smart Recipe Suggestions',
      'shopping': 'Shopping List',
      'analytics': 'Analytics & History'
    };
    const titleEl = document.getElementById('current-page-title');
    if (titleEl) {
      titleEl.textContent = titleMap[sectionId] || 'Dashboard';
    }

    // Close mobile sidebar if open
    this.toggleSidebar(false);

    // Scroll to top of content
    window.scrollTo({ top: 0, behavior: 'smooth' });

    // Render corresponding section
    this.renderCurrentSection(sectionId);
    this.updateGlobalBadges();
  },

  /**
   * Mobile Sidebar Toggle
   */
  toggleSidebar(open) {
    const sidebar = document.getElementById('sidebar');
    const backdrop = document.getElementById('sidebar-backdrop');
    if (sidebar && backdrop) {
      if (open) {
        sidebar.classList.add('show');
        backdrop.classList.add('show');
      } else {
        sidebar.classList.remove('show');
        backdrop.classList.remove('show');
      }
    }
  },

  /**
   * Update Sidebar and Badge Counters
   */
  updateGlobalBadges() {
    const pantry = StorageService.getPantry();
    const shopping = StorageService.getShopping();
    const urgentItems = LogicService.getUseFirstItems(pantry);

    const pantryCountEl = document.getElementById('nav-pantry-count');
    const urgentCountEl = document.getElementById('nav-urgent-count');
    const shoppingCountEl = document.getElementById('nav-shopping-count');

    const totalPantryQty = pantry.filter(i => Number(i.quantity) > 0).length;
    const pendingShopping = shopping.filter(i => !i.purchased).length;

    if (pantryCountEl) pantryCountEl.textContent = totalPantryQty;
    if (urgentCountEl) urgentCountEl.textContent = urgentItems.length;
    if (shoppingCountEl) shoppingCountEl.textContent = pendingShopping;
  },

  /**
   * Dispatches render calls based on active section
   */
  renderCurrentSection(sectionId) {
    switch (sectionId) {
      case 'dashboard':
        this.renderDashboard();
        break;
      case 'pantry':
        this.renderPantry();
        break;
      case 'use-first':
        this.renderUseFirst();
        break;
      case 'recipes':
        this.renderRecipes();
        break;
      case 'shopping':
        this.renderShopping();
        break;
      case 'analytics':
        this.renderAnalytics();
        break;
    }
  },

  // =========================================================================
  // 1. DASHBOARD VIEW CONTROLLER
  // =========================================================================
  renderDashboard() {
    const pantry = StorageService.getPantry();
    const history = StorageService.getUsageHistory();
    const activity = StorageService.getActivity();

    const metrics = LogicService.computeDashboardMetrics(pantry, history);

    // Update KPI Card values
    const totalEl = document.getElementById('metric-total-items');
    const freshEl = document.getElementById('metric-fresh-count');
    const urgentEl = document.getElementById('metric-urgent-items');
    const expiredEl = document.getElementById('metric-expired-detail');
    const saveRateEl = document.getElementById('metric-save-rate');
    const usedCountEl = document.getElementById('metric-used-count');
    const healthEl = document.getElementById('metric-health-score');
    const healthDescEl = document.getElementById('metric-health-desc');

    if (totalEl) totalEl.textContent = metrics.totalItemsCount;
    if (freshEl) freshEl.textContent = `${metrics.freshCount} fresh & stable`;
    if (urgentEl) urgentEl.textContent = metrics.urgentCount + metrics.expiredCount;
    if (expiredEl) expiredEl.textContent = `${metrics.expiredCount} expired`;
    if (saveRateEl) saveRateEl.textContent = `${metrics.saveRatePercent}%`;
    if (usedCountEl) usedCountEl.textContent = `${metrics.totalUsedCount} items consumed`;
    if (healthEl) healthEl.textContent = `${metrics.healthScore}/100`;

    if (healthDescEl) {
      if (metrics.healthScore >= 85) healthDescEl.textContent = 'Excellent turnover';
      else if (metrics.healthScore >= 65) healthDescEl.textContent = 'Moderate expiry risk';
      else healthDescEl.textContent = 'Action needed: items expiring';
    }

    // Urgent Callout Banner
    const banner = document.getElementById('dashboard-urgent-banner');
    const bannerTitle = document.getElementById('urgent-banner-title');
    const bannerDesc = document.getElementById('urgent-banner-desc');
    const urgentTotal = metrics.urgentCount + metrics.expiredCount;

    if (banner) {
      if (urgentTotal > 0) {
        banner.style.display = 'flex';
        if (bannerTitle) {
          bannerTitle.textContent = `${urgentTotal} ${urgentTotal === 1 ? 'Item Requires' : 'Items Require'} Urgent Attention`;
        }
        if (bannerDesc) {
          bannerDesc.textContent = metrics.expiredCount > 0
            ? `You have ${metrics.expiredCount} expired and ${metrics.urgentCount} soon-to-expire items. Consume or review now.`
            : `You have ${metrics.urgentCount} items expiring within 3 days. Use them in your upcoming recipes!`;
        }
      } else {
        banner.style.display = 'none';
      }
    }

    // Spotlight Use-First Items (up to 4)
    const urgentList = LogicService.getUseFirstItems(pantry).slice(0, 4);
    const urgentContainer = document.getElementById('dashboard-urgent-list');
    if (urgentContainer) {
      if (urgentList.length === 0) {
        urgentContainer.innerHTML = `
          <div class="text-center py-4 text-muted small">
            <i class="bi bi-shield-check text-success fs-3 d-block mb-1"></i>
            No urgent items! All groceries in pantry have safe shelf life.
          </div>
        `;
      } else {
        urgentContainer.innerHTML = urgentList.map(item => {
          const loc = STORAGE_LOCATIONS.find(l => l.id === item.storageLocation) || { name: item.storageLocation };
          return `
            <div class="d-flex align-items-center justify-content-between p-2 rounded" style="background-color: rgba(11, 23, 19, 0.4); border: 1px solid var(--border-subtle);">
              <div class="d-flex align-items-center gap-2">
                <span class="fresh-badge ${item.status.badgeClass}">${item.status.shortLabel}</span>
                <div>
                  <strong class="text-white small d-block">${LogicService.escapeHtml(item.name)}</strong>
                  <span class="text-muted" style="font-size: 0.75rem;">${item.quantity} ${item.unit} &bull; ${loc.name}</span>
                </div>
              </div>
              <div class="d-flex gap-1">
                <button type="button" class="btn btn-sm btn-outline-light py-1 px-2" style="font-size: 0.75rem;" onclick="App.openUseWasteModal('${item.id}')" title="Log use or discard">
                  <i class="bi bi-arrow-left-right"></i> Use
                </button>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Recent Activity Feed
    const feedContainer = document.getElementById('dashboard-activity-feed');
    if (feedContainer) {
      const latestActivities = activity.slice(0, 5);
      if (latestActivities.length === 0) {
        feedContainer.innerHTML = '<li class="text-muted small text-center py-3">No activity logged yet.</li>';
      } else {
        feedContainer.innerHTML = latestActivities.map(act => {
          let iconClass = 'bi-info-circle';
          let actTypeClass = 'act-add';
          if (act.type === 'add') { iconClass = 'bi-plus-lg'; actTypeClass = 'act-add'; }
          else if (act.type === 'use') { iconClass = 'bi-check2'; actTypeClass = 'act-use'; }
          else if (act.type === 'waste') { iconClass = 'bi-trash'; actTypeClass = 'act-waste'; }
          else if (act.type === 'shop') { iconClass = 'bi-cart'; actTypeClass = 'act-shop'; }
          else if (act.type === 'cook') { iconClass = 'bi-fire'; actTypeClass = 'act-cook'; }
          else if (act.type === 'delete') { iconClass = 'bi-x-lg'; actTypeClass = 'act-delete'; }

          return `
            <li class="activity-item">
              <div class="activity-icon-badge ${actTypeClass}">
                <i class="bi ${iconClass}"></i>
              </div>
              <div class="flex-grow-1">
                <div class="d-flex justify-content-between align-items-center">
                  <strong class="text-white small">${LogicService.escapeHtml(act.title)}</strong>
                  <span class="text-muted" style="font-size: 0.72rem;">${LogicService.formatTimeAgo(act.timestamp)}</span>
                </div>
                <div class="text-muted" style="font-size: 0.78rem;">${LogicService.escapeHtml(act.details)}</div>
              </div>
            </li>
          `;
        }).join('');
      }
    }
  },

  // =========================================================================
  // 2. MY PANTRY VIEW CONTROLLER
  // =========================================================================
  renderPantry() {
    const pantry = StorageService.getPantry();
    const searchInput = (document.getElementById('pantry-search-input')?.value || '').toLowerCase().trim();
    const categoryFilter = document.getElementById('pantry-filter-category')?.value || 'all';
    const storageFilter = document.getElementById('pantry-filter-storage')?.value || 'all';
    const statusFilter = document.getElementById('pantry-filter-status')?.value || 'all';
    const sortBy = document.getElementById('pantry-sort-by')?.value || 'expiry-asc';

    // 1. Filter
    let filtered = pantry.filter(item => {
      // Must have quantity > 0
      if (Number(item.quantity) <= 0) return false;

      // Text search
      if (searchInput) {
        const nameMatch = (item.name || '').toLowerCase().includes(searchInput);
        const notesMatch = (item.notes || '').toLowerCase().includes(searchInput);
        if (!nameMatch && !notesMatch) return false;
      }

      // Category filter
      if (categoryFilter !== 'all' && item.category !== categoryFilter) return false;

      // Storage filter
      if (storageFilter !== 'all' && item.storageLocation !== storageFilter) return false;

      // Expiry Status filter
      if (statusFilter !== 'all') {
        const days = LogicService.getDaysUntilExpiry(item.expiryDate);
        if (statusFilter === 'expired' && days >= 0) return false;
        if (statusFilter === 'urgent' && (days < 0 || days > 1)) return false;
        if (statusFilter === 'soon' && (days < 0 || days > 7)) return false;
        if (statusFilter === 'good' && days <= 7) return false;
        if (statusFilter === 'opened' && !item.isOpened) return false;
      }

      return true;
    });

    // 2. Sort
    filtered.sort((a, b) => {
      if (sortBy === 'expiry-asc') {
        return new Date(a.expiryDate) - new Date(b.expiryDate);
      }
      if (sortBy === 'expiry-desc') {
        return new Date(b.expiryDate) - new Date(a.expiryDate);
      }
      if (sortBy === 'name-asc') {
        return a.name.localeCompare(b.name);
      }
      if (sortBy === 'name-desc') {
        return b.name.localeCompare(a.name);
      }
      if (sortBy === 'qty-desc') {
        return Number(b.quantity) - Number(a.quantity);
      }
      return 0;
    });

    // 3. Render
    const grid = document.getElementById('pantry-items-grid');
    const emptyState = document.getElementById('pantry-empty-state');
    const countEl = document.getElementById('pantry-showing-count');

    if (countEl) countEl.textContent = filtered.length;

    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = filtered.map(item => {
      const days = LogicService.getDaysUntilExpiry(item.expiryDate);
      const status = LogicService.getExpiryStatus(days, item.isOpened);
      const categoryObj = CATEGORIES.find(c => c.id === item.category) || { name: item.category, icon: 'bi-tag' };
      const storageObj = STORAGE_LOCATIONS.find(l => l.id === item.storageLocation) || { name: item.storageLocation, icon: 'bi-geo-alt' };

      return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="pantry-item-card">
            <div>
              <div class="pantry-card-top">
                <div>
                  <h4 class="pantry-item-name">${LogicService.escapeHtml(item.name)}</h4>
                  <div class="d-flex flex-wrap gap-1 align-items-center">
                    <span class="meta-tag"><i class="bi ${categoryObj.icon}"></i> ${categoryObj.name.split(' ')[0]}</span>
                    <span class="meta-tag"><i class="bi ${storageObj.icon}"></i> ${storageObj.name}</span>
                    ${item.isOpened ? '<span class="meta-tag text-warning border border-warning-subtle"><i class="bi bi-unlock"></i> Opened</span>' : ''}
                  </div>
                </div>
                <div class="text-end">
                  <span class="pantry-qty-pill">${item.quantity} ${item.unit}</span>
                </div>
              </div>

              <div class="pantry-card-dates">
                <div class="d-flex justify-content-between align-items-center">
                  <span class="fresh-badge ${status.badgeClass}">
                    <i class="bi ${status.icon}"></i> ${status.label}
                  </span>
                  <span class="small text-muted font-monospace">${LogicService.formatDisplayDate(item.expiryDate)}</span>
                </div>
                ${item.notes ? `<p class="small text-muted mb-0 mt-1 fst-italic">"${LogicService.escapeHtml(item.notes)}"</p>` : ''}
              </div>
            </div>

            <div class="pantry-card-actions">
              <button type="button" class="btn btn-sm btn-outline-success flex-grow-1" onclick="App.openUseWasteModal('${item.id}')">
                <i class="bi bi-arrow-left-right"></i> Use / Log
              </button>
              <button type="button" class="btn btn-sm btn-outline-light" onclick="App.openEditPantryModal('${item.id}')" title="Edit grocery">
                <i class="bi bi-pencil"></i>
              </button>
              <button type="button" class="btn btn-sm btn-outline-danger" onclick="App.promptDeletePantryItem('${item.id}')" title="Delete grocery">
                <i class="bi bi-trash3"></i>
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  clearPantryFilters() {
    const search = document.getElementById('pantry-search-input');
    const cat = document.getElementById('pantry-filter-category');
    const loc = document.getElementById('pantry-filter-storage');
    const stat = document.getElementById('pantry-filter-status');
    const sort = document.getElementById('pantry-sort-by');

    if (search) search.value = '';
    if (cat) cat.value = 'all';
    if (loc) loc.value = 'all';
    if (stat) stat.value = 'all';
    if (sort) sort.value = 'expiry-asc';

    this.renderPantry();
  },

  // =========================================================================
  // 3. USE FIRST VIEW CONTROLLER
  // =========================================================================
  renderUseFirst() {
    const pantry = StorageService.getPantry();
    const urgentItems = LogicService.getUseFirstItems(pantry);

    const container = document.getElementById('use-first-items-list');
    const emptyState = document.getElementById('use-first-empty-state');

    if (!container) return;

    if (urgentItems.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = urgentItems.map(item => {
      const loc = STORAGE_LOCATIONS.find(l => l.id === item.storageLocation) || { name: item.storageLocation };
      const cat = CATEGORIES.find(c => c.id === item.category) || { name: item.category };

      return `
        <div class="fresh-card p-3">
          <div class="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center gap-3">
            <div class="d-flex align-items-start gap-3">
              <div class="brand-icon-box" style="background-color: ${item.status.color}; color: white; width: 44px; height: 44px; flex-shrink: 0;">
                <i class="bi ${item.status.icon}"></i>
              </div>
              <div>
                <div class="d-flex align-items-center gap-2 flex-wrap mb-1">
                  <h4 class="fw-bold mb-0 text-white">${LogicService.escapeHtml(item.name)}</h4>
                  <span class="fresh-badge ${item.status.badgeClass}">${item.status.label}</span>
                  <span class="pantry-qty-pill">${item.quantity} ${item.unit}</span>
                  ${item.isOpened ? '<span class="meta-tag text-warning"><i class="bi bi-unlock"></i> Opened</span>' : ''}
                </div>
                <div class="text-white-50 small mb-2">
                  <i class="bi bi-info-circle text-lime me-1"></i> ${item.status.explanation}
                </div>
                <div class="d-flex flex-wrap gap-2 text-muted small">
                  <span><i class="bi bi-geo-alt"></i> ${loc.name}</span>
                  <span>&bull;</span>
                  <span><i class="bi bi-calendar"></i> Expiry: ${LogicService.formatDisplayDate(item.expiryDate)}</span>
                  <span>&bull;</span>
                  <span><i class="bi bi-tag"></i> ${cat.name}</span>
                </div>
              </div>
            </div>

            <!-- Actions -->
            <div class="d-flex align-items-center gap-2 w-100 w-md-auto justify-content-end">
              <button type="button" class="btn-fresh-primary btn-sm" onclick="App.openUseWasteModal('${item.id}')">
                <i class="bi bi-check2-circle"></i> Log Usage
              </button>
              <button type="button" class="btn-fresh-secondary btn-sm" onclick="App.findRecipesForIngredient('${LogicService.escapeHtml(item.name)}')">
                <i class="bi bi-book"></i> Find Recipes
              </button>
            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  findRecipesForIngredient(ingredientName) {
    this.navigate('recipes');
    const searchInput = document.getElementById('recipe-search-input');
    if (searchInput) {
      searchInput.value = ingredientName;
      this.renderRecipes();
    }
  },

  // =========================================================================
  // 4. RECIPES VIEW CONTROLLER
  // =========================================================================
  renderRecipes() {
    const pantry = StorageService.getPantry();
    const evaluated = LogicService.evaluateAllRecipes(BUILT_IN_RECIPES, pantry);

    const searchInput = (document.getElementById('recipe-search-input')?.value || '').toLowerCase().trim();
    const matchFilter = document.getElementById('recipe-filter-match')?.value || 'all';
    const catFilter = document.getElementById('recipe-filter-category')?.value || 'all';

    // Filter recipes
    const filtered = evaluated.filter(r => {
      // Search
      if (searchInput) {
        const titleMatch = r.title.toLowerCase().includes(searchInput);
        const ingMatch = r.ingredients.some(ing => ing.name.toLowerCase().includes(searchInput));
        if (!titleMatch && !ingMatch) return false;
      }

      // Match filter
      if (matchFilter === 'ready' && r.matchData.matchPercentage < 100) return false;
      if (matchFilter === 'high' && r.matchData.matchPercentage < 75) return false;
      if (matchFilter === 'rescues' && !r.matchData.hasUrgentRescue) return false;

      // Category filter
      if (catFilter !== 'all' && !r.category.includes(catFilter)) return false;

      return true;
    });

    const readyCount = evaluated.filter(r => r.matchData.matchPercentage === 100).length;
    const readyCountEl = document.getElementById('recipe-ready-count');
    if (readyCountEl) readyCountEl.textContent = readyCount;

    const grid = document.getElementById('recipe-cards-grid');
    const emptyState = document.getElementById('recipe-empty-state');

    if (!grid) return;

    if (filtered.length === 0) {
      grid.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    grid.innerHTML = filtered.map(recipe => {
      const match = recipe.matchData;
      let matchClass = 'match-low';
      if (match.matchPercentage === 100) matchClass = 'match-full';
      else if (match.matchPercentage >= 75) matchClass = 'match-high';
      else if (match.matchPercentage >= 50) matchClass = 'match-partial';

      return `
        <div class="col-12 col-md-6 col-lg-4">
          <div class="recipe-card">
            <div class="recipe-header-banner">
              <span class="meta-tag"><i class="bi ${recipe.imageIcon}"></i> ${recipe.category}</span>
              <div class="recipe-match-meter">
                <span class="match-ring ${matchClass}">${match.matchPercentage}% Match</span>
              </div>
            </div>

            <div class="recipe-body">
              <h4 class="recipe-title">${LogicService.escapeHtml(recipe.title)}</h4>
              <p class="recipe-desc">${LogicService.escapeHtml(recipe.description)}</p>

              <!-- Urgent Rescue Callout Tag -->
              ${match.hasUrgentRescue ? `
                <div class="badge-urgent py-1 px-2 rounded mb-2 small d-inline-flex align-items-center gap-1">
                  <i class="bi bi-fire"></i> Rescues expiring: ${match.urgentItemsUsed.slice(0, 2).join(', ')}
                </div>
              ` : ''}

              <!-- Ingredient Checklist -->
              <div class="mb-3">
                <div class="d-flex justify-content-between text-muted small mb-1">
                  <span>Ingredients (${match.availableCount}/${match.totalCount} in stock)</span>
                  <span class="text-lime">${match.matchPercentage}%</span>
                </div>
                <div class="progress mb-2" style="height: 6px; background-color: var(--bg-deep);">
                  <div class="progress-bar ${match.matchPercentage === 100 ? 'bg-success' : 'bg-warning'}" style="width: ${match.matchPercentage}%;"></div>
                </div>
              </div>

              <!-- Compact ingredient list -->
              <ul class="recipe-ingredients-checklist">
                ${recipe.ingredients.slice(0, 4).map(ing => {
                  const isAvailable = match.matched.some(m => m.recipeIngredient.name === ing.name);
                  return `
                    <li class="recipe-ing-row ${isAvailable ? 'available' : 'missing'}">
                      <span>${isAvailable ? '<i class="bi bi-check-circle-fill text-lime me-1"></i>' : '<i class="bi bi-circle text-muted me-1"></i>'} ${LogicService.escapeHtml(ing.name)}</span>
                      <span class="text-muted">${ing.amount} ${ing.unit}</span>
                    </li>
                  `;
                }).join('')}
                ${recipe.ingredients.length > 4 ? `<li class="text-muted small text-center">+${recipe.ingredients.length - 4} more ingredients</li>` : ''}
              </ul>

              <!-- Footer with Action Button -->
              <div class="d-flex gap-2 mt-auto pt-2 border-top border-secondary-subtle">
                <button type="button" class="btn-fresh-primary w-100 justify-content-center btn-sm" onclick="App.openRecipeDetailModal('${recipe.id}')">
                  <i class="bi bi-eye"></i> View Recipe &amp; Instructions
                </button>
              </div>

            </div>
          </div>
        </div>
      `;
    }).join('');
  },

  clearRecipeFilters() {
    const search = document.getElementById('recipe-search-input');
    const match = document.getElementById('recipe-filter-match');
    const cat = document.getElementById('recipe-filter-category');

    if (search) search.value = '';
    if (match) match.value = 'all';
    if (cat) cat.value = 'all';

    this.renderRecipes();
  },

  openRecipeDetailModal(recipeId) {
    const pantry = StorageService.getPantry();
    const recipe = BUILT_IN_RECIPES.find(r => r.id === recipeId);
    if (!recipe) return;

    this.currentActiveRecipe = recipe;
    const match = LogicService.calculateRecipeMatch(recipe, pantry);

    // Populate Modal Content
    document.getElementById('recipeDetailModalTitle').textContent = recipe.title;
    document.getElementById('recipe-modal-category').textContent = recipe.category;
    document.getElementById('recipe-modal-desc').textContent = recipe.description;
    document.getElementById('recipe-modal-prep').textContent = recipe.prepTime;
    document.getElementById('recipe-modal-cook').textContent = recipe.cookTime;
    document.getElementById('recipe-modal-servings').textContent = recipe.servings;
    document.getElementById('recipe-modal-difficulty').textContent = recipe.difficulty;
    document.getElementById('recipe-modal-tips').textContent = recipe.tips;

    // Match Box
    const headline = document.getElementById('recipe-modal-match-headline');
    const score = document.getElementById('recipe-modal-match-score');
    const expl = document.getElementById('recipe-modal-match-expl');

    if (headline) headline.textContent = `${match.matchPercentage}% Ingredient Match`;
    if (score) score.textContent = `${match.availableCount} / ${match.totalCount} in stock`;
    if (expl) expl.textContent = match.recommendationExplanation;

    // Ingredients checklist
    const ingList = document.getElementById('recipe-modal-ingredients-list');
    if (ingList) {
      ingList.innerHTML = recipe.ingredients.map(ing => {
        const isAvailable = match.matched.some(m => m.recipeIngredient.name === ing.name);
        return `
          <div class="recipe-ing-row ${isAvailable ? 'available' : 'missing'}">
            <span>
              ${isAvailable ? '<i class="bi bi-check-circle-fill text-lime me-2"></i>' : '<i class="bi bi-x-circle text-warning me-2"></i>'}
              ${LogicService.escapeHtml(ing.name)}
            </span>
            <span class="text-muted">${ing.amount} ${ing.unit}</span>
          </div>
        `;
      }).join('');
    }

    // Missing ingredients shopping button
    const shopWrap = document.getElementById('recipe-modal-shopping-action-wrap');
    if (shopWrap) {
      shopWrap.style.display = match.missing.length > 0 ? 'block' : 'none';
    }

    // Cook button label
    const cookBtn = document.getElementById('recipe-modal-cook-btn');
    if (cookBtn) {
      if (match.matchPercentage === 100) {
        cookBtn.innerHTML = '<i class="bi bi-check-circle-fill"></i> Mark as Cooked (Deduct All Stock)';
        cookBtn.disabled = false;
      } else {
        cookBtn.innerHTML = `<i class="bi bi-fire"></i> Cook with ${match.availableCount} Available Items`;
        cookBtn.disabled = false;
      }
    }

    this.modals.recipeDetailModal.show();
  },

  /**
   * Action: Mark Recipe as Cooked. Deducts matched items from pantry.
   */
  handleCookRecipe() {
    if (!this.currentActiveRecipe) return;

    const pantry = StorageService.getPantry();
    const recipe = this.currentActiveRecipe;
    const match = LogicService.calculateRecipeMatch(recipe, pantry);

    if (match.matched.length === 0) {
      this.showToast('No matching pantry items to deduct for this recipe.', 'warning');
      return;
    }

    // Deduct each matched item
    let deductedCount = 0;
    match.matched.forEach(m => {
      const pItem = pantry.find(i => i.id === m.pantryItem.id);
      if (pItem) {
        // Safe deduction: deduct 1 unit or proportional
        const currentQty = Number(pItem.quantity);
        const reqQty = Number(m.recipeIngredient.amount) || 1;
        const newQty = Math.max(0, currentQty - reqQty);

        pItem.quantity = newQty;
        StorageService.recordUsage(pItem, reqQty, 'used', `Cooked in recipe: ${recipe.title}`);
        deductedCount++;
      }
    });

    // Save updated pantry
    StorageService.savePantry(pantry);
    StorageService.logActivity('cook', `Cooked: ${recipe.title}`, `Deducted ${deductedCount} ingredients from pantry.`);

    this.modals.recipeDetailModal.hide();
    this.showToast(`Yum! Cooked "${recipe.title}" and updated pantry stock.`, 'success', 'bi-fire');

    // Refresh views
    this.renderCurrentSection(window.location.hash.replace('#', '') || 'dashboard');
    this.updateGlobalBadges();
  },

  /**
   * Action: Add all missing recipe ingredients directly to shopping list
   */
  handleAddMissingRecipeToShopping() {
    if (!this.currentActiveRecipe) return;

    const pantry = StorageService.getPantry();
    const recipe = this.currentActiveRecipe;
    const match = LogicService.calculateRecipeMatch(recipe, pantry);

    if (match.missing.length === 0) {
      this.showToast('All ingredients are already in your pantry!', 'info');
      return;
    }

    let addedCount = 0;
    match.missing.forEach(missingIng => {
      // Find category guess or default
      const guessCat = CATEGORIES.find(c => missingIng.name.toLowerCase().includes(c.id)) || { id: 'pantry' };
      StorageService.addShoppingItem({
        name: missingIng.name,
        category: guessCat.id,
        quantity: missingIng.amount || 1,
        unit: missingIng.unit || 'pcs',
        note: `For recipe: ${recipe.title}`
      });
      addedCount++;
    });

    this.showToast(`Added ${addedCount} missing ingredients to your Shopping List!`, 'success', 'bi-cart-plus');
    this.modals.recipeDetailModal.hide();
    this.updateGlobalBadges();
  },

  // =========================================================================
  // 5. SHOPPING LIST VIEW CONTROLLER
  // =========================================================================
  renderShopping() {
    const shopping = StorageService.getShopping();
    const pantry = StorageService.getPantry();
    const searchInput = (document.getElementById('shopping-search-input')?.value || '').toLowerCase().trim();
    const statusFilter = document.getElementById('shopping-filter-status')?.value || 'all';

    let filtered = shopping.filter(item => {
      if (searchInput && !item.name.toLowerCase().includes(searchInput)) return false;
      if (statusFilter === 'pending' && item.purchased) return false;
      if (statusFilter === 'purchased' && !item.purchased) return false;
      return true;
    });

    const pendingCount = shopping.filter(i => !i.purchased).length;
    const boughtCount = shopping.filter(i => i.purchased).length;

    const pendingEl = document.getElementById('shopping-pending-count');
    const boughtEl = document.getElementById('shopping-bought-count');
    if (pendingEl) pendingEl.textContent = `${pendingCount} To Buy`;
    if (boughtEl) boughtEl.textContent = `${boughtCount} Purchased`;

    const container = document.getElementById('shopping-items-list');
    const emptyState = document.getElementById('shopping-empty-state');

    if (!container) return;

    if (filtered.length === 0) {
      container.innerHTML = '';
      if (emptyState) emptyState.style.display = 'block';
      return;
    }

    if (emptyState) emptyState.style.display = 'none';

    container.innerHTML = filtered.map(item => {
      const cat = CATEGORIES.find(c => c.id === item.category) || { name: item.category };
      const dupCheck = LogicService.checkForDuplicates(item.name, pantry, []);

      return `
        <div class="shopping-row ${item.purchased ? 'is-purchased' : ''}">
          <div class="d-flex align-items-center gap-3">
            <input type="checkbox" class="shopping-checkbox" ${item.purchased ? 'checked' : ''} onchange="App.toggleShoppingItem('${item.id}')" title="Toggle purchased status">
            <div>
              <div class="d-flex align-items-center gap-2 flex-wrap">
                <span class="shopping-item-name fw-bold text-white">${LogicService.escapeHtml(item.name)}</span>
                <span class="pantry-qty-pill">${item.quantity || 1} ${item.unit || 'pcs'}</span>
                <span class="meta-tag"><i class="bi bi-tag"></i> ${cat.name}</span>
                ${dupCheck.inPantry ? '<span class="badge-warning px-1 rounded small" title="Item also exists in your pantry inventory"><i class="bi bi-box-seam"></i> In Pantry</span>' : ''}
              </div>
              ${item.note ? `<div class="small text-muted mt-1 fst-italic">"${LogicService.escapeHtml(item.note)}"</div>` : ''}
            </div>
          </div>

          <div class="d-flex align-items-center gap-2">
            ${item.purchased ? `
              <button type="button" class="btn-fresh-primary btn-sm" onclick="App.openMoveShoppingToPantryModal('${item.id}')" title="Move purchased grocery into pantry">
                <i class="bi bi-box-arrow-in-down"></i> Add to Pantry
              </button>
            ` : ''}
            <button type="button" class="btn btn-sm btn-outline-danger" onclick="App.deleteShoppingItem('${item.id}')" title="Remove from list">
              <i class="bi bi-trash"></i>
            </button>
          </div>
        </div>
      `;
    }).join('');
  },

  toggleShoppingItem(itemId) {
    const updated = StorageService.toggleShoppingPurchased(itemId);
    if (updated) {
      this.renderShopping();
      this.updateGlobalBadges();
      if (updated.purchased) {
        this.showToast(`Purchased "${updated.name}"! Click "Add to Pantry" to store it.`, 'success', 'bi-bag-check');
      }
    }
  },

  deleteShoppingItem(itemId) {
    const deleted = StorageService.deleteShoppingItem(itemId);
    if (deleted) {
      this.renderShopping();
      this.updateGlobalBadges();
      this.showToast(`Removed "${deleted.name}" from shopping list.`, 'info');
    }
  },

  clearPurchasedShopping() {
    const count = StorageService.clearPurchasedShopping();
    if (count > 0) {
      this.renderShopping();
      this.updateGlobalBadges();
      this.showToast(`Cleared ${count} purchased items.`, 'info');
    } else {
      this.showToast('No purchased items to clear.', 'info');
    }
  },

  checkShoppingDuplicate(inputName) {
    const pantry = StorageService.getPantry();
    const shopping = StorageService.getShopping();
    const check = LogicService.checkForDuplicates(inputName, pantry, shopping);

    const warnBox = document.getElementById('shopping-duplicate-warning');
    const warnMsg = document.getElementById('shopping-duplicate-msg');

    if (warnBox && warnMsg) {
      if (check.inPantry && check.inShopping) {
        warnBox.style.display = 'flex';
        warnMsg.textContent = `Warning: "${inputName}" is ALREADY in your Pantry (${check.pantryMatch.quantity} ${check.pantryMatch.unit}) and Shopping List!`;
      } else if (check.inPantry) {
        warnBox.style.display = 'flex';
        warnMsg.textContent = `Notice: You already have "${inputName}" in your Pantry (${check.pantryMatch.quantity} ${check.pantryMatch.unit} remaining).`;
      } else if (check.inShopping) {
        warnBox.style.display = 'flex';
        warnMsg.textContent = `Notice: "${inputName}" is already on your Shopping List.`;
      } else {
        warnBox.style.display = 'none';
      }
    }
  },

  openMoveShoppingToPantryModal(itemId) {
    const shopping = StorageService.getShopping();
    const item = shopping.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('move-pantry-shopping-id').value = item.id;
    document.getElementById('move-pantry-item-name').textContent = item.name;
    document.getElementById('move-pantry-qty').value = item.quantity || 1;
    document.getElementById('move-pantry-unit').value = item.unit || 'pcs';

    // Default expiry preset (e.g. +7 days from today)
    const d = new Date();
    d.setDate(d.getDate() + 7);
    document.getElementById('move-pantry-expiry').value = d.toISOString().split('T')[0];

    this.modals.moveShoppingToPantryModal.show();
  },

  handleConfirmMoveToPantry(e) {
    e.preventDefault();
    const itemId = document.getElementById('move-pantry-shopping-id').value;
    const shopping = StorageService.getShopping();
    const item = shopping.find(i => i.id === itemId);
    if (!item) return;

    const qty = parseFloat(document.getElementById('move-pantry-qty').value) || 1;
    const unit = document.getElementById('move-pantry-unit').value;
    const storageLocation = document.getElementById('move-pantry-storage').value;
    const expiryDate = document.getElementById('move-pantry-expiry').value;
    const removeShopping = document.getElementById('move-pantry-remove-shopping').checked;

    // Add to Pantry
    StorageService.addPantryItem({
      name: item.name,
      category: item.category,
      quantity: qty,
      unit: unit,
      storageLocation: storageLocation,
      purchaseDate: new Date().toISOString().split('T')[0],
      expiryDate: expiryDate,
      notes: item.note || 'Transferred from shopping list',
      isOpened: false
    });

    if (removeShopping) {
      StorageService.deleteShoppingItem(item.id);
    }

    this.modals.moveShoppingToPantryModal.hide();
    this.showToast(`Moved "${item.name}" into your pantry!`, 'success', 'bi-box-arrow-in-down');

    this.renderCurrentSection(window.location.hash.replace('#', '') || 'shopping');
    this.updateGlobalBadges();
  },

  // =========================================================================
  // 6. ANALYTICS VIEW CONTROLLER
  // =========================================================================
  renderAnalytics() {
    const pantry = StorageService.getPantry();
    const history = StorageService.getUsageHistory();
    const activity = StorageService.getActivity();

    const metrics = LogicService.computeDashboardMetrics(pantry, history);
    const breakdown = LogicService.computeCategoryBreakdown(pantry, history);

    // KPI Cards
    const wasteRateEl = document.getElementById('analytics-waste-rate');
    const wastedCountEl = document.getElementById('analytics-wasted-items-count');
    const saveRateEl = document.getElementById('analytics-saved-rate');
    const usedCountEl = document.getElementById('analytics-used-items-count');
    const totalPantryEl = document.getElementById('analytics-total-pantry-count');
    const effScoreEl = document.getElementById('analytics-efficiency-score');

    if (wasteRateEl) wasteRateEl.textContent = `${metrics.wasteRatePercent}%`;
    if (wastedCountEl) wastedCountEl.textContent = `${metrics.totalWastedCount} items discarded`;
    if (saveRateEl) saveRateEl.textContent = `${metrics.saveRatePercent}%`;
    if (usedCountEl) usedCountEl.textContent = `${metrics.totalUsedCount} items utilized`;
    if (totalPantryEl) totalPantryEl.textContent = metrics.totalItemsCount;
    if (effScoreEl) effScoreEl.textContent = `${metrics.healthScore}/100`;

    // Category Inventory & Consumption Bars
    const catBarsContainer = document.getElementById('analytics-category-bars');
    if (catBarsContainer) {
      const activeCats = breakdown.categories.filter(c => c.pantryCount > 0 || c.usedCount > 0 || c.wastedCount > 0);
      if (activeCats.length === 0) {
        catBarsContainer.innerHTML = '<div class="text-muted small text-center py-4">No category data recorded yet.</div>';
      } else {
        catBarsContainer.innerHTML = activeCats.map(cat => {
          const totalActivity = cat.pantryCount + cat.usedCount + cat.wastedCount;
          return `
            <div>
              <div class="d-flex justify-content-between align-items-center mb-1">
                <span class="small fw-bold text-white"><i class="bi ${cat.icon} me-1"></i> ${cat.name}</span>
                <span class="small text-muted">${cat.pantryCount} in stock &bull; ${cat.usedCount} consumed &bull; ${cat.wastedCount} wasted</span>
              </div>
              <div class="progress" style="height: 8px; background-color: var(--bg-deep);">
                <div class="progress-bar bg-success" style="width: ${(cat.usedCount / (totalActivity || 1)) * 100}%;" title="Consumed: ${cat.usedCount}"></div>
                <div class="progress-bar bg-warning" style="width: ${(cat.pantryCount / (totalActivity || 1)) * 100}%;" title="In Stock: ${cat.pantryCount}"></div>
                <div class="progress-bar bg-danger" style="width: ${(cat.wastedCount / (totalActivity || 1)) * 100}%;" title="Wasted: ${cat.wastedCount}"></div>
              </div>
            </div>
          `;
        }).join('');
      }
    }

    // Waste Reasons Breakdown
    const wasteList = document.getElementById('analytics-waste-reasons-list');
    if (wasteList) {
      const reasons = Object.entries(breakdown.wasteReasons);
      if (reasons.length === 0) {
        wasteList.innerHTML = '<div class="text-success small py-3 text-center"><i class="bi bi-shield-check fs-4 d-block mb-1"></i> Zero food wasted! Excellent streak.</div>';
      } else {
        wasteList.innerHTML = reasons.map(([reason, count]) => `
          <div class="d-flex justify-content-between align-items-center p-2 rounded" style="background-color: rgba(11, 23, 19, 0.4); border: 1px solid var(--border-subtle);">
            <span class="text-white small"><i class="bi bi-x-circle text-danger me-2"></i> ${LogicService.escapeHtml(reason)}</span>
            <span class="badge-expired px-2 py-1 rounded small">${count} ${count === 1 ? 'time' : 'times'}</span>
          </div>
        `).join('');
      }
    }

    // Audit Activity Table
    const filterType = document.getElementById('analytics-activity-filter')?.value || 'all';
    const tbody = document.getElementById('analytics-full-activity-tbody');
    if (tbody) {
      const filteredActs = activity.filter(a => filterType === 'all' || a.type === filterType);
      if (filteredActs.length === 0) {
        tbody.innerHTML = '<tr><td colspan="4" class="text-center text-muted py-4">No activity records match the selected filter.</td></tr>';
      } else {
        tbody.innerHTML = filteredActs.map(act => {
          let badge = '<span class="fresh-badge badge-good">Add</span>';
          if (act.type === 'use') badge = '<span class="fresh-badge badge-good">Use</span>';
          else if (act.type === 'waste') badge = '<span class="fresh-badge badge-expired">Waste</span>';
          else if (act.type === 'shop') badge = '<span class="fresh-badge badge-warning">Shop</span>';
          else if (act.type === 'cook') badge = '<span class="fresh-badge badge-soon">Cook</span>';
          else if (act.type === 'delete') badge = '<span class="fresh-badge badge-expired">Delete</span>';

          return `
            <tr>
              <td>${badge}</td>
              <td class="fw-bold text-white small">${LogicService.escapeHtml(act.title)}</td>
              <td class="text-white-50 small">${LogicService.escapeHtml(act.details)}</td>
              <td class="text-end text-muted small font-monospace">${LogicService.formatTimeAgo(act.timestamp)}</td>
            </tr>
          `;
        }).join('');
      }
    }
  },

  // =========================================================================
  // MODAL FORM INTERACTIONS & HANDLERS
  // =========================================================================

  openAddPantryModal() {
    const form = document.getElementById('pantry-item-form');
    if (form) form.reset();

    document.getElementById('pantry-form-id').value = '';
    document.getElementById('pantry-modal-heading').textContent = 'Add Grocery Item';
    document.getElementById('pantry-modal-submit-text').textContent = 'Save Grocery';

    // Default dates
    const todayStr = new Date().toISOString().split('T')[0];
    document.getElementById('pantry-form-purchase-date').value = todayStr;

    // Default expiry 7 days ahead
    const exp = new Date();
    exp.setDate(exp.getDate() + 7);
    document.getElementById('pantry-form-expiry-date').value = exp.toISOString().split('T')[0];

    this.modals.pantryItemModal.show();
  },

  openEditPantryModal(itemId) {
    const pantry = StorageService.getPantry();
    const item = pantry.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('pantry-form-id').value = item.id;
    document.getElementById('pantry-modal-heading').textContent = `Edit "${item.name}"`;
    document.getElementById('pantry-modal-submit-text').textContent = 'Update Grocery';

    document.getElementById('pantry-form-name').value = item.name;
    document.getElementById('pantry-form-category').value = item.category;
    document.getElementById('pantry-form-storage').value = item.storageLocation;
    document.getElementById('pantry-form-qty').value = item.quantity;
    document.getElementById('pantry-form-unit').value = item.unit;
    document.getElementById('pantry-form-purchase-date').value = item.purchaseDate || '';
    document.getElementById('pantry-form-expiry-date').value = item.expiryDate || '';
    document.getElementById('pantry-form-opened').checked = !!item.isOpened;
    document.getElementById('pantry-form-notes').value = item.notes || '';

    this.modals.pantryItemModal.show();
  },

  setFormExpiryDays(offset) {
    const d = new Date();
    d.setDate(d.getDate() + offset);
    const dateInput = document.getElementById('pantry-form-expiry-date');
    if (dateInput) {
      dateInput.value = d.toISOString().split('T')[0];
    }
  },

  handleSavePantryItem(e) {
    e.preventDefault();
    const id = document.getElementById('pantry-form-id').value;
    const name = document.getElementById('pantry-form-name').value.trim();
    const category = document.getElementById('pantry-form-category').value;
    const storageLocation = document.getElementById('pantry-form-storage').value;
    const quantity = parseFloat(document.getElementById('pantry-form-qty').value);
    const unit = document.getElementById('pantry-form-unit').value;
    const purchaseDate = document.getElementById('pantry-form-purchase-date').value;
    const expiryDate = document.getElementById('pantry-form-expiry-date').value;
    const isOpened = document.getElementById('pantry-form-opened').checked;
    const notes = document.getElementById('pantry-form-notes').value.trim();

    if (!name || isNaN(quantity) || quantity <= 0 || !expiryDate) {
      this.showToast('Please fill all required fields with valid values.', 'danger');
      return;
    }

    const payload = {
      name,
      category,
      storageLocation,
      quantity,
      unit,
      purchaseDate,
      expiryDate,
      isOpened,
      notes
    };

    if (id) {
      StorageService.updatePantryItem({ ...payload, id });
      this.showToast(`Updated "${name}" successfully.`, 'success');
    } else {
      StorageService.addPantryItem(payload);
      this.showToast(`Added "${name}" to pantry.`, 'success');
    }

    this.modals.pantryItemModal.hide();
    this.renderCurrentSection(window.location.hash.replace('#', '') || 'dashboard');
    this.updateGlobalBadges();
  },

  promptDeletePantryItem(itemId) {
    const pantry = StorageService.getPantry();
    const item = pantry.find(i => i.id === itemId);
    if (!item) return;

    this.pendingDeleteId = itemId;
    document.getElementById('delete-item-target-name').textContent = item.name;
    this.modals.deleteConfirmModal.show();
  },

  executeDeletePantryItem() {
    if (!this.pendingDeleteId) return;
    const deleted = StorageService.deletePantryItem(this.pendingDeleteId);
    this.pendingDeleteId = null;
    this.modals.deleteConfirmModal.hide();

    if (deleted) {
      this.showToast(`Deleted "${deleted.name}" from pantry.`, 'info');
      this.renderCurrentSection(window.location.hash.replace('#', '') || 'dashboard');
      this.updateGlobalBadges();
    }
  },

  openUseWasteModal(itemId) {
    const pantry = StorageService.getPantry();
    const item = pantry.find(i => i.id === itemId);
    if (!item) return;

    document.getElementById('use-waste-item-id').value = item.id;
    document.getElementById('use-waste-item-name').textContent = item.name;
    document.getElementById('use-waste-stock-badge').textContent = `In Stock: ${item.quantity} ${item.unit}`;
    document.getElementById('use-waste-unit-label').textContent = item.unit;

    const days = LogicService.getDaysUntilExpiry(item.expiryDate);
    const status = LogicService.getExpiryStatus(days, item.isOpened);
    document.getElementById('use-waste-expiry-status').innerHTML = `
      <span class="fresh-badge ${status.badgeClass} me-1">${status.shortLabel}</span>
      ${status.explanation}
    `;

    document.getElementById('use-waste-qty-input').value = Math.min(1, item.quantity);
    document.getElementById('use-waste-qty-input').max = item.quantity;

    this.setUseActionType('used');
    this.modals.useWasteModal.show();
  },

  setUseActionType(type) {
    this.currentUseAction = type;
    const btnUsed = document.getElementById('btn-action-used');
    const btnWasted = document.getElementById('btn-action-wasted');
    const reasonSelect = document.getElementById('use-waste-reason');

    if (type === 'used') {
      btnUsed.className = 'btn-fresh-primary w-50 justify-content-center';
      btnWasted.className = 'btn-fresh-secondary w-50 justify-content-center';
      if (reasonSelect) reasonSelect.value = 'Cooked in meal';
    } else {
      btnUsed.className = 'btn-fresh-secondary w-50 justify-content-center';
      btnWasted.className = 'btn-fresh-danger w-50 justify-content-center';
      if (reasonSelect) reasonSelect.value = 'Spoiled / Moldy';
    }
  },

  setUseAllQty() {
    const itemId = document.getElementById('use-waste-item-id').value;
    const pantry = StorageService.getPantry();
    const item = pantry.find(i => i.id === itemId);
    if (item) {
      document.getElementById('use-waste-qty-input').value = item.quantity;
    }
  },

  handleSaveUsage(e) {
    e.preventDefault();
    const itemId = document.getElementById('use-waste-item-id').value;
    const pantry = StorageService.getPantry();
    const item = pantry.find(i => i.id === itemId);
    if (!item) return;

    const recordQty = parseFloat(document.getElementById('use-waste-qty-input').value);
    const reason = document.getElementById('use-waste-reason').value;

    if (isNaN(recordQty) || recordQty <= 0) {
      this.showToast('Please enter a valid quantity greater than zero.', 'danger');
      return;
    }

    if (recordQty > item.quantity) {
      this.showToast(`Cannot record more than current stock (${item.quantity} ${item.unit}).`, 'warning');
      return;
    }

    // Deduct quantity
    const remainingQty = item.quantity - recordQty;
    if (remainingQty <= 0) {
      // Complete consumption / removal
      StorageService.deletePantryItem(item.id);
    } else {
      StorageService.updatePantryItem({ ...item, quantity: Math.round(remainingQty * 100) / 100 });
    }

    // Record in history log
    StorageService.recordUsage(item, recordQty, this.currentUseAction, reason);

    this.modals.useWasteModal.hide();
    const actionLabel = this.currentUseAction === 'used' ? 'Consumed' : 'Discarded';
    this.showToast(`${actionLabel} ${recordQty} ${item.unit} of "${item.name}".`, 'success');

    this.renderCurrentSection(window.location.hash.replace('#', '') || 'dashboard');
    this.updateGlobalBadges();
  },

  openAddShoppingModal() {
    const form = document.getElementById('shopping-item-form');
    if (form) form.reset();

    document.getElementById('shopping-form-id').value = '';
    document.getElementById('shopping-modal-heading').textContent = 'Add to Shopping List';
    document.getElementById('shopping-duplicate-warning').style.display = 'none';

    this.modals.shoppingItemModal.show();
  },

  handleSaveShoppingItem(e) {
    e.preventDefault();
    const name = document.getElementById('shopping-form-name').value.trim();
    const category = document.getElementById('shopping-form-category').value;
    const quantity = parseFloat(document.getElementById('shopping-form-qty').value) || 1;
    const unit = document.getElementById('shopping-form-unit').value || 'pcs';
    const note = document.getElementById('shopping-form-note').value.trim();

    if (!name) return;

    StorageService.addShoppingItem({
      name,
      category,
      quantity,
      unit,
      note
    });

    this.modals.shoppingItemModal.hide();
    this.showToast(`Added "${name}" to shopping list.`, 'success', 'bi-cart-plus');

    this.renderCurrentSection(window.location.hash.replace('#', '') || 'shopping');
    this.updateGlobalBadges();
  },

  openResetModal() {
    this.modals.resetDataModal.show();
  },

  executeResetAllData() {
    StorageService.resetAllData();
    this.modals.resetDataModal.hide();
    this.showToast('All data reset to sample state.', 'info', 'bi-arrow-counterclockwise');
    this.renderCurrentSection(window.location.hash.replace('#', '') || 'dashboard');
    this.updateGlobalBadges();
  },

  exportData() {
    const jsonStr = StorageService.exportAllDataJSON();
    const blob = new Blob([jsonStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `freshtrack_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
    this.showToast('Backup JSON exported successfully!', 'success', 'bi-download');
  },

  openImportModal() {
    document.getElementById('import-json-textarea').value = '';
    document.getElementById('import-error-msg').style.display = 'none';
    this.modals.importBackupModal.show();
  },

  handleExecuteImport() {
    const text = document.getElementById('import-json-textarea').value.trim();
    const errEl = document.getElementById('import-error-msg');

    if (!text) {
      errEl.textContent = 'Please paste valid JSON content.';
      errEl.style.display = 'block';
      return;
    }

    const res = StorageService.importDataJSON(text);
    if (res.success) {
      this.modals.importBackupModal.hide();
      this.showToast('Backup restored successfully!', 'success', 'bi-upload');
      this.renderCurrentSection(window.location.hash.replace('#', '') || 'dashboard');
      this.updateGlobalBadges();
    } else {
      errEl.textContent = `Invalid JSON format: ${res.error}`;
      errEl.style.display = 'block';
    }
  },

  /**
   * Custom Toast Notification System
   */
  showToast(message, type = 'info', iconName = null) {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `fresh-toast toast-${type}`;

    let icon = iconName;
    if (!icon) {
      if (type === 'success') icon = 'bi-check-circle-fill';
      else if (type === 'warning') icon = 'bi-exclamation-triangle-fill';
      else if (type === 'danger') icon = 'bi-exclamation-octagon-fill';
      else icon = 'bi-info-circle-fill';
    }

    toast.innerHTML = `
      <i class="bi ${icon} toast-icon"></i>
      <div class="flex-grow-1">${LogicService.escapeHtml(message)}</div>
      <button type="button" class="btn-close-custom" style="font-size: 0.9rem;" onclick="this.parentElement.remove()">
        <i class="bi bi-x-lg"></i>
      </button>
    `;

    container.appendChild(toast);

    // Auto dismiss after 3.8s
    setTimeout(() => {
      if (toast.parentElement) {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(-10px)';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
      }
    }, 3800);
  }
};

// Initialize app when DOM is fully loaded
document.addEventListener('DOMContentLoaded', () => {
  App.init();
});
