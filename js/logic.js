/**
 * FreshTrack 2.0 — Core Domain Logic
 * Date calculations, expiry priority scoring, recipe matching algorithm,
 * analytics aggregations, and sanitization utilities.
 */

const LogicService = {
  /**
   * Escape unsafe HTML characters to prevent XSS.
   */
  escapeHtml(str) {
    if (str === null || str === undefined) return '';
    return String(str)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#039;');
  },

  /**
   * Parse a date string (YYYY-MM-DD) into a local midnight Date object
   * to avoid timezone skew when calculating day differences.
   */
  parseLocalDate(dateStr) {
    if (!dateStr) return new Date();
    const parts = dateStr.split('-');
    if (parts.length === 3) {
      return new Date(parseInt(parts[0], 10), parseInt(parts[1], 10) - 1, parseInt(parts[2], 10));
    }
    return new Date(dateStr);
  },

  /**
   * Calculates the exact integer calendar days between today and expiry date.
   * Compares at 00:00:00 local time.
   * @param {string} expiryDateStr - YYYY-MM-DD
   * @returns {number} Days remaining (negative if expired, 0 if today, 1 if tomorrow)
   */
  getDaysUntilExpiry(expiryDateStr) {
    if (!expiryDateStr) return 999;
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const target = this.parseLocalDate(expiryDateStr);

    const msPerDay = 1000 * 60 * 60 * 24;
    const diffMs = target.getTime() - today.getTime();
    return Math.round(diffMs / msPerDay);
  },

  /**
   * Computes complete expiry status, UI badges, urgency rank, and human explanation.
   * @param {number} days - Days until expiry
   * @param {boolean} isOpened - Whether item is opened
   * @returns {object} Status metadata
   */
  getExpiryStatus(days, isOpened = false) {
    if (days < 0) {
      const absDays = Math.abs(days);
      const dayWord = absDays === 1 ? 'day' : 'days';
      return {
        code: 'expired',
        label: `Expired (${absDays} ${dayWord} ago)`,
        shortLabel: 'Expired',
        badgeClass: 'badge-expired',
        bgClass: 'status-bg-expired',
        borderClass: 'border-expired',
        priority: 1, // Highest urgency to take action
        urgencyScore: 100 + absDays,
        color: '#E05A47',
        icon: 'bi-exclamation-octagon-fill',
        explanation: `Expired ${absDays} ${dayWord} ago. Inspect quality carefully before consuming or discard safely.`
      };
    }

    if (days === 0) {
      return {
        code: 'urgent',
        label: 'Expires Today!',
        shortLabel: 'Today',
        badgeClass: 'badge-urgent',
        bgClass: 'status-bg-urgent',
        borderClass: 'border-urgent',
        priority: 2,
        urgencyScore: 90 + (isOpened ? 5 : 0),
        color: '#FF7B6B',
        icon: 'bi-exclamation-triangle-fill',
        explanation: isOpened
          ? 'Package is already opened and reaches expiry today. Use as top priority in your next meal!'
          : 'Reaches expiration date today! Recommended for immediate meal prep.'
      };
    }

    if (days === 1) {
      return {
        code: 'urgent',
        label: 'Expires Tomorrow',
        shortLabel: '1 Day Left',
        badgeClass: 'badge-urgent',
        bgClass: 'status-bg-urgent',
        borderClass: 'border-urgent',
        priority: 3,
        urgencyScore: 80 + (isOpened ? 4 : 0),
        color: '#FF9776',
        icon: 'bi-clock-history',
        explanation: isOpened
          ? 'Expires tomorrow and is already opened. Plan to cook tonight or tomorrow morning.'
          : '1 day left before expiration. Perfect candidate for tomorrow\'s recipe.'
      };
    }

    if (days <= 3) {
      return {
        code: 'warning',
        label: `${days} Days Left`,
        shortLabel: `${days}d Left`,
        badgeClass: 'badge-warning',
        bgClass: 'status-bg-warning',
        borderClass: 'border-warning',
        priority: 4,
        urgencyScore: 60 - days * 5 + (isOpened ? 5 : 0),
        color: '#D9A66C',
        icon: 'bi-hourglass-split',
        explanation: isOpened
          ? `Opened item with ${days} days remaining. Consume soon before freshness declines.`
          : `${days} days of peak freshness remaining. Suitable for upcoming dinner plans.`
      };
    }

    if (days <= 7) {
      return {
        code: 'soon',
        label: `Expiring This Week (${days}d)`,
        shortLabel: `${days}d Left`,
        badgeClass: 'badge-soon',
        bgClass: 'status-bg-soon',
        borderClass: 'border-soon',
        priority: 5,
        urgencyScore: 30 - days,
        color: '#C4E879',
        icon: 'bi-calendar-event',
        explanation: `${days} days remaining. Fresh and ready to use in this week's rotation.`
      };
    }

    // > 7 days
    return {
      code: 'good',
      label: `Good (${days}d)`,
      shortLabel: `${days}d`,
      badgeClass: 'badge-good',
      bgClass: 'status-bg-good',
      borderClass: 'border-good',
      priority: 6,
      urgencyScore: Math.max(1, 10 - Math.floor(days / 10)),
      color: '#88D49E',
      icon: 'bi-check-circle-fill',
      explanation: `Plenty of shelf life remaining (${days} days). Stored safely.`
    };
  },

  /**
   * Format display date in nice human format (e.g., "Oct 15, 2026")
   */
  formatDisplayDate(dateStr) {
    if (!dateStr) return 'N/A';
    try {
      const date = this.parseLocalDate(dateStr);
      return date.toLocaleDateString('en-US', {
        month: 'short',
        day: 'numeric',
        year: 'numeric'
      });
    } catch {
      return dateStr;
    }
  },

  /**
   * Format relative human timestamp for activity logs (e.g. "10 mins ago", "2 hours ago")
   */
  formatTimeAgo(isoString) {
    if (!isoString) return 'Just now';
    try {
      const past = new Date(isoString).getTime();
      const diffSecs = Math.max(0, Math.floor((Date.now() - past) / 1000));
      if (diffSecs < 60) return 'Just now';
      const diffMins = Math.floor(diffSecs / 60);
      if (diffMins < 60) return `${diffMins}m ago`;
      const diffHours = Math.floor(diffMins / 60);
      if (diffHours < 24) return `${diffHours}h ago`;
      const diffDays = Math.floor(diffHours / 24);
      if (diffDays === 1) return 'Yesterday';
      if (diffDays < 7) return `${diffDays}d ago`;
      return new Date(isoString).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch {
      return 'Recently';
    }
  },

  /**
   * Filter and prioritize "Use First" groceries.
   * Identifies items requiring urgent culinary attention.
   */
  getUseFirstItems(pantryItems) {
    if (!Array.isArray(pantryItems)) return [];

    return pantryItems
      .filter(item => Number(item.quantity) > 0)
      .map(item => {
        const days = this.getDaysUntilExpiry(item.expiryDate);
        const status = this.getExpiryStatus(days, item.isOpened);
        return {
          ...item,
          daysUntilExpiry: days,
          status: status
        };
      })
      // Keep items that are expired, or expiring within 5 days, or opened within 7 days
      .filter(item => item.daysUntilExpiry <= 5 || (item.isOpened && item.daysUntilExpiry <= 7))
      // Sort by urgency: lowest days first, then opened items first
      .sort((a, b) => {
        if (a.daysUntilExpiry !== b.daysUntilExpiry) {
          return a.daysUntilExpiry - b.daysUntilExpiry;
        }
        if (a.isOpened && !b.isOpened) return -1;
        if (!a.isOpened && b.isOpened) return 1;
        return a.name.localeCompare(b.name);
      });
  },

  /**
   * Robust Ingredient Matching Engine.
   * Matches recipe ingredients against user's current in-stock pantry items.
   * Uses canonical ingredient tokens, exact names, or normalized substring matching.
   */
  calculateRecipeMatch(recipe, pantryItems) {
    if (!recipe || !Array.isArray(recipe.ingredients)) {
      return { matchPercentage: 0, availableCount: 0, totalCount: 0, matched: [], missing: [], urgentItemsUsed: [] };
    }

    const availablePantry = (pantryItems || []).filter(item => Number(item.quantity) > 0);

    const matched = [];
    const missing = [];
    const urgentItemsUsed = [];

    recipe.ingredients.forEach(recIng => {
      const recCanonical = (recIng.canonical || '').toLowerCase().trim();
      const recName = (recIng.name || '').toLowerCase().trim();

      // Find best match in pantry
      const foundItem = availablePantry.find(pItem => {
        const pName = (pItem.name || '').toLowerCase().trim();
        // 1. Direct match on canonical keyword
        if (recCanonical && (pName.includes(recCanonical) || recCanonical.includes(pName))) {
          return true;
        }
        // 2. Exact or substring match on ingredient name
        if (pName.includes(recName) || recName.includes(pName)) {
          return true;
        }
        // 3. Normalized tokens match (e.g. "eggs" -> "egg", "peppers" -> "pepper")
        const pClean = pName.replace(/s\b/, '');
        const rClean = recName.replace(/s\b/, '');
        if (pClean.includes(rClean) || rClean.includes(pClean)) {
          return true;
        }
        return false;
      });

      if (foundItem) {
        const days = this.getDaysUntilExpiry(foundItem.expiryDate);
        const isUrgent = days <= 3;
        if (isUrgent && !urgentItemsUsed.includes(foundItem.name)) {
          urgentItemsUsed.push(foundItem.name);
        }
        matched.push({
          recipeIngredient: recIng,
          pantryItem: foundItem,
          isUrgent: isUrgent,
          daysLeft: days
        });
      } else {
        missing.push(recIng);
      }
    });

    const totalCount = recipe.ingredients.length;
    const availableCount = matched.length;
    const matchPercentage = totalCount > 0 ? Math.round((availableCount / totalCount) * 100) : 0;

    // Reason explanation
    let recommendationExplanation = '';
    if (matchPercentage === 100) {
      if (urgentItemsUsed.length > 0) {
        recommendationExplanation = `100% Ready to cook! Perfect meal to rescue expiring ${urgentItemsUsed.join(', ')}.`;
      } else {
        recommendationExplanation = '100% Match! All required ingredients are in your pantry right now.';
      }
    } else if (matchPercentage >= 75) {
      recommendationExplanation = `High match (${matchPercentage}%). Missing only ${missing.length} ${missing.length === 1 ? 'item' : 'items'} which can be added to your shopping list.`;
    } else if (matchPercentage >= 50) {
      recommendationExplanation = `Partial match (${matchPercentage}%). You have the base items ready in stock.`;
    } else {
      recommendationExplanation = `Low match (${matchPercentage}%). Requires shopping for several key ingredients.`;
    }

    return {
      matchPercentage,
      availableCount,
      totalCount,
      matched,
      missing,
      urgentItemsUsed,
      hasUrgentRescue: urgentItemsUsed.length > 0,
      recommendationExplanation
    };
  },

  /**
   * Sort and evaluate all recipes against current pantry stock.
   */
  evaluateAllRecipes(recipes, pantryItems) {
    if (!Array.isArray(recipes)) return [];
    return recipes.map(recipe => {
      const matchData = this.calculateRecipeMatch(recipe, pantryItems);
      return {
        ...recipe,
        matchData
      };
    }).sort((a, b) => {
      // Prioritize 100% matches, then recipes that rescue urgent groceries, then highest % match
      if (b.matchData.matchPercentage !== a.matchData.matchPercentage) {
        return b.matchData.matchPercentage - a.matchData.matchPercentage;
      }
      if (b.matchData.hasUrgentRescue && !a.matchData.hasUrgentRescue) return 1;
      if (!b.matchData.hasUrgentRescue && a.matchData.hasUrgentRescue) return -1;
      return a.title.localeCompare(b.title);
    });
  },

  /**
   * Calculate live Dashboard and Analytics metrics.
   * Truthful calculations derived strictly from stored data.
   */
  computeDashboardMetrics(pantryItems, usageHistory) {
    const pantry = Array.isArray(pantryItems) ? pantryItems : [];
    const history = Array.isArray(usageHistory) ? usageHistory : [];

    let totalItemsCount = 0;
    let expiredCount = 0;
    let urgentCount = 0; // 0-3 days
    let freshCount = 0; // > 3 days
    let openedCount = 0;

    pantry.forEach(item => {
      if (Number(item.quantity) > 0) {
        totalItemsCount++;
        const days = this.getDaysUntilExpiry(item.expiryDate);
        if (days < 0) {
          expiredCount++;
        } else if (days <= 3) {
          urgentCount++;
        } else {
          freshCount++;
        }
        if (item.isOpened) {
          openedCount++;
        }
      }
    });

    // History statistics
    let totalUsedCount = 0;
    let totalWastedCount = 0;

    history.forEach(log => {
      if (log.action === 'used') {
        totalUsedCount++;
      } else if (log.action === 'wasted') {
        totalWastedCount++;
      }
    });

    const totalResolved = totalUsedCount + totalWastedCount;
    const wasteRatePercent = totalResolved > 0
      ? Math.round((totalWastedCount / totalResolved) * 100)
      : 0;
    const saveRatePercent = totalResolved > 0
      ? 100 - wasteRatePercent
      : 100;

    // Inventory Health Score (0 - 100)
    // Decreased by expired items and high waste rate
    let healthScore = 100;
    if (totalItemsCount > 0) {
      const expiredPenalty = (expiredCount / totalItemsCount) * 45;
      const urgentPenalty = (urgentCount / totalItemsCount) * 15;
      const wastePenalty = (wasteRatePercent / 100) * 20;
      healthScore = Math.max(10, Math.round(100 - expiredPenalty - urgentPenalty - wastePenalty));
    }

    return {
      totalItemsCount,
      expiredCount,
      urgentCount,
      freshCount,
      openedCount,
      totalUsedCount,
      totalWastedCount,
      wasteRatePercent,
      saveRatePercent,
      healthScore
    };
  },

  /**
   * Compute category breakdowns and waste reasons for Analytics view.
   */
  computeCategoryBreakdown(pantryItems, usageHistory) {
    const pantry = Array.isArray(pantryItems) ? pantryItems : [];
    const history = Array.isArray(usageHistory) ? usageHistory : [];

    const categoryMap = {};
    CATEGORIES.forEach(c => {
      categoryMap[c.id] = {
        id: c.id,
        name: c.name,
        icon: c.icon,
        color: c.color,
        pantryCount: 0,
        usedCount: 0,
        wastedCount: 0
      };
    });

    // Fill current pantry counts
    pantry.forEach(item => {
      const catId = item.category || 'other';
      if (categoryMap[catId]) {
        categoryMap[catId].pantryCount++;
      }
    });

    // Fill historical usage / waste counts
    history.forEach(h => {
      const catId = h.category || 'other';
      if (categoryMap[catId]) {
        if (h.action === 'used') categoryMap[catId].usedCount++;
        if (h.action === 'wasted') categoryMap[catId].wastedCount++;
      }
    });

    // Waste reasons frequency
    const wasteReasons = {};
    history.filter(h => h.action === 'wasted').forEach(h => {
      const r = (h.reason || 'Expired / Spoiled').trim();
      wasteReasons[r] = (wasteReasons[r] || 0) + 1;
    });

    return {
      categories: Object.values(categoryMap),
      wasteReasons
    };
  },

  /**
   * Check for duplicate items in pantry or shopping list to alert the user.
   */
  checkForDuplicates(itemName, pantryItems, shoppingItems) {
    if (!itemName) return { inPantry: false, inShopping: false };
    const query = itemName.toLowerCase().trim();

    const inPantryItem = (pantryItems || []).find(
      i => i.name.toLowerCase().trim() === query && Number(i.quantity) > 0
    );
    const inShoppingItem = (shoppingItems || []).find(
      i => i.name.toLowerCase().trim() === query && !i.purchased
    );

    return {
      inPantry: !!inPantryItem,
      pantryMatch: inPantryItem,
      inShopping: !!inShoppingItem,
      shoppingMatch: inShoppingItem
    };
  }
};
