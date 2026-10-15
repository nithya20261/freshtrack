/**
 * FreshTrack 2.0 — Storage Module
 * Centralized, robust wrapper around browser localStorage.
 * Handles persistence, seed safety on reload, activity logging, and export/reset.
 */

const STORAGE_KEYS = {
  PANTRY: 'freshtrack_pantry_v2',
  SHOPPING: 'freshtrack_shopping_v2',
  ACTIVITY: 'freshtrack_activity_v2',
  USAGE_HISTORY: 'freshtrack_usage_history_v2',
  INITIALIZED: 'freshtrack_initialized_v2',
  PREFERENCES: 'freshtrack_preferences_v2'
};

const StorageService = {
  /**
   * Initializes data on first app launch only.
   * If user already has data or refreshed, existing data is untouched.
   */
  init() {
    try {
      const isInitialized = localStorage.getItem(STORAGE_KEYS.INITIALIZED);
      if (!isInitialized) {
        // First run: seed with realistic sample items
        this.savePantry(INITIAL_PANTRY_ITEMS);
        this.saveShopping(INITIAL_SHOPPING_ITEMS);
        this.saveActivity(INITIAL_ACTIVITY_LOG);
        this.saveUsageHistory(INITIAL_USAGE_HISTORY);
        localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
        console.log('[FreshTrack 2.0] First-time initialization complete: sample groceries seeded.');
      } else {
        console.log('[FreshTrack 2.0] Existing storage detected. Preserving user groceries.');
      }
    } catch (err) {
      console.error('[FreshTrack 2.0] Storage initialization warning:', err);
    }
  },

  /**
   * Safe JSON parse with fallback
   */
  _get(key, defaultValue) {
    try {
      const raw = localStorage.getItem(key);
      if (raw === null || raw === undefined) return defaultValue;
      return JSON.parse(raw);
    } catch (e) {
      console.error(`Failed parsing storage key: ${key}`, e);
      return defaultValue;
    }
  },

  /**
   * Safe JSON stringify and set
   */
  _set(key, value) {
    try {
      localStorage.setItem(key, JSON.stringify(value));
      return true;
    } catch (e) {
      console.error(`Failed saving storage key: ${key}`, e);
      return false;
    }
  },

  // --- PANTRY ITEMS ---
  getPantry() {
    return this._get(STORAGE_KEYS.PANTRY, []);
  },

  savePantry(items) {
    return this._set(STORAGE_KEYS.PANTRY, items);
  },

  addPantryItem(item) {
    const items = this.getPantry();
    const newItem = {
      ...item,
      id: item.id || `item-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: item.createdAt || new Date().toISOString()
    };
    items.unshift(newItem);
    this.savePantry(items);
    this.logActivity('add', `Added ${newItem.name}`, `Stored in ${newItem.storageLocation} (${newItem.quantity} ${newItem.unit}).`);
    return newItem;
  },

  updatePantryItem(updatedItem) {
    const items = this.getPantry();
    const index = items.findIndex(i => i.id === updatedItem.id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedItem, updatedAt: new Date().toISOString() };
      this.savePantry(items);
      this.logActivity('edit', `Updated ${updatedItem.name}`, `Details and quantity adjusted.`);
      return items[index];
    }
    return null;
  },

  deletePantryItem(itemId) {
    const items = this.getPantry();
    const target = items.find(i => i.id === itemId);
    if (target) {
      const filtered = items.filter(i => i.id !== itemId);
      this.savePantry(filtered);
      this.logActivity('delete', `Removed ${target.name}`, `Item deleted from pantry inventory.`);
      return target;
    }
    return null;
  },

  // --- SHOPPING LIST ITEMS ---
  getShopping() {
    return this._get(STORAGE_KEYS.SHOPPING, []);
  },

  saveShopping(items) {
    return this._set(STORAGE_KEYS.SHOPPING, items);
  },

  addShoppingItem(item) {
    const items = this.getShopping();
    const newItem = {
      ...item,
      id: item.id || `shop-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      purchased: !!item.purchased,
      addedDate: item.addedDate || new Date().toISOString().split('T')[0]
    };
    items.unshift(newItem);
    this.saveShopping(items);
    this.logActivity('shop', `Added to Shopping List`, `${newItem.name} (${newItem.quantity || 1} ${newItem.unit || 'pcs'})`);
    return newItem;
  },

  updateShoppingItem(updatedItem) {
    const items = this.getShopping();
    const index = items.findIndex(i => i.id === updatedItem.id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updatedItem };
      this.saveShopping(items);
      return items[index];
    }
    return null;
  },

  toggleShoppingPurchased(itemId) {
    const items = this.getShopping();
    const target = items.find(i => i.id === itemId);
    if (target) {
      target.purchased = !target.purchased;
      this.saveShopping(items);
      const actionDesc = target.purchased ? 'Marked as purchased' : 'Unchecked from purchased';
      this.logActivity('shop', actionDesc, `${target.name}`);
      return target;
    }
    return null;
  },

  deleteShoppingItem(itemId) {
    const items = this.getShopping();
    const target = items.find(i => i.id === itemId);
    if (target) {
      const filtered = items.filter(i => i.id !== itemId);
      this.saveShopping(filtered);
      return target;
    }
    return null;
  },

  clearPurchasedShopping() {
    const items = this.getShopping();
    const remaining = items.filter(i => !i.purchased);
    const removedCount = items.length - remaining.length;
    this.saveShopping(remaining);
    if (removedCount > 0) {
      this.logActivity('shop', `Cleared Purchased Items`, `Cleaned ${removedCount} purchased items from the shopping list.`);
    }
    return removedCount;
  },

  // --- ACTIVITY LOG ---
  getActivity() {
    return this._get(STORAGE_KEYS.ACTIVITY, []);
  },

  saveActivity(logs) {
    return this._set(STORAGE_KEYS.ACTIVITY, logs.slice(0, 50)); // Keep latest 50 for speed
  },

  logActivity(type, title, details) {
    const logs = this.getActivity();
    const entry = {
      id: `act-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: type || 'info', // 'add', 'use', 'waste', 'shop', 'cook', 'delete', 'edit'
      title: title || 'Activity recorded',
      details: details || '',
      timestamp: new Date().toISOString()
    };
    logs.unshift(entry);
    this.saveActivity(logs);
    return entry;
  },

  // --- CONSUMPTION / WASTE USAGE HISTORY ---
  getUsageHistory() {
    return this._get(STORAGE_KEYS.USAGE_HISTORY, []);
  },

  saveUsageHistory(history) {
    return this._set(STORAGE_KEYS.USAGE_HISTORY, history);
  },

  recordUsage(item, usedQty, action, reason) {
    // action: 'used' | 'wasted'
    const history = this.getUsageHistory();
    const entry = {
      id: `u-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      itemName: item.name,
      category: item.category,
      quantity: usedQty,
      unit: item.unit,
      action: action, // 'used' or 'wasted'
      reason: reason || (action === 'used' ? 'Consumed' : 'Expired/Spoiled'),
      date: new Date().toISOString().split('T')[0],
      timestamp: new Date().toISOString()
    };
    history.unshift(entry);
    this.saveUsageHistory(history);

    const logType = action === 'wasted' ? 'waste' : 'use';
    const logTitle = action === 'wasted' 
      ? `Discarded ${usedQty} ${item.unit} of ${item.name}` 
      : `Used ${usedQty} ${item.unit} of ${item.name}`;
    this.logActivity(logType, logTitle, reason ? `Reason: ${reason}` : 'Inventory balance updated.');

    return entry;
  },

  // --- RESET & EXPORT ---
  resetAllData() {
    localStorage.removeItem(STORAGE_KEYS.PANTRY);
    localStorage.removeItem(STORAGE_KEYS.SHOPPING);
    localStorage.removeItem(STORAGE_KEYS.ACTIVITY);
    localStorage.removeItem(STORAGE_KEYS.USAGE_HISTORY);
    localStorage.removeItem(STORAGE_KEYS.INITIALIZED);
    // Re-seed sample data cleanly
    this.init();
    return true;
  },

  exportAllDataJSON() {
    return JSON.stringify({
      version: '2.0',
      exportedAt: new Date().toISOString(),
      pantry: this.getPantry(),
      shopping: this.getShopping(),
      activity: this.getActivity(),
      usageHistory: this.getUsageHistory()
    }, null, 2);
  },

  importDataJSON(jsonString) {
    try {
      const parsed = JSON.parse(jsonString);
      if (Array.isArray(parsed.pantry)) {
        this.savePantry(parsed.pantry);
      }
      if (Array.isArray(parsed.shopping)) {
        this.saveShopping(parsed.shopping);
      }
      if (Array.isArray(parsed.activity)) {
        this.saveActivity(parsed.activity);
      }
      if (Array.isArray(parsed.usageHistory)) {
        this.saveUsageHistory(parsed.usageHistory);
      }
      localStorage.setItem(STORAGE_KEYS.INITIALIZED, 'true');
      this.logActivity('info', 'Data Imported Successfully', 'Restored groceries and history from backup file.');
      return { success: true };
    } catch (err) {
      return { success: false, error: err.message };
    }
  }
};
