# FreshTrack 2.0 — Smart Food Management System

> A responsive, privacy-first web application designed to minimize household food waste, dynamically prioritize urgent groceries, match smart recipes, and organize shopping.

![FreshTrack 2.0](https://img.shields.io/badge/Theme-Dark%20Forest-142B24?style=for-the-badge)
![Tech Stack](https://img.shields.io/badge/Tech-HTML5%20%7C%20CSS3%20%7C%20Vanilla%20JS-C4E879?style=for-the-badge)
![Privacy](https://img.shields.io/badge/Privacy-100%25%20Local%20Storage-2E8B57?style=for-the-badge)

---

## 🌲 Design Aesthetic: "Dark Forest"
- **Base Background:** Deep Forest (`#0B1713` & `#142B24`)
- **Card Surfaces:** Rich Pine (`#1A362E` & `#264D40`)
- **Accent:** Fresh Lime (`#C4E879`) & Sage Green (`#2E8B57`)
- **Typography:** Plus Jakarta Sans & JetBrains Mono

---

## ✨ Features

1. **Live Dashboard**
   - Live metrics: Total in pantry, urgent/expiring items, food saved rate (%), and inventory health score.
   - Dynamic urgent expiry alert banner and recent activity feed.
   - Quick action buttons for common tasks.

2. **My Pantry Inventory**
   - Full CRUD support with validation for quantities, units, and dates.
   - Search by name or notes.
   - Multi-filtering by Category, Storage Location, and Expiry Status.
   - Sorting by expiry date, name, and quantity.
   - "Opened" status tracking to prioritize opened items.

3. **"Use First" Priority Queue**
   - Calendar date calculation at midnight to prevent timezone skew.
   - Dynamic urgency ranking with human explanations for priority.
   - Partial and full usage logging (record exact amounts used or discarded with reasons).
   - Direct jump to recipes that use urgent ingredients.

4. **Smart Recipe Suggestions (14 Built-In Recipes)**
   - Real-time ingredient match percentage against pantry inventory.
   - In-stock vs. missing ingredient breakdown.
   - "Rescues Expiring Groceries!" badge for recipes saving items expiring within 3 days.
   - 1-click button to add missing recipe ingredients to the Shopping List.
   - "Mark as Cooked" automatically deducts ingredient amounts from pantry.

5. **Shopping List**
   - Add, edit, and delete shopping items.
   - Interactive checkbox for purchase tracking.
   - Real-time duplicate warning when adding items that already exist in pantry or list.
   - 1-click "Add to Pantry" flow to store purchased items with custom expiry dates and storage locations.

6. **Analytics & History**
   - Honest calculations: food waste rate (%), items utilized, and efficiency score.
   - Category inventory and consumption breakdown bars.
   - Waste reasons analysis (spoiled, past date, forgotten).
   - Full audit activity log table with filter by event type.
   - Data ownership: Export JSON backup, import backup, and reset data.
   - Privacy guarantee: All data is stored in the browser's `localStorage` and never leaves your device.

---

## 🚀 Getting Started

### Local Run
No build process or dependencies required:
1. Clone this repository:
   ```bash
   git clone https://github.com/nithya20261/freshtrack.git
   cd freshtrack
   ```
2. Open `index.html` directly in any modern browser, or run a local static server:
   ```bash
   python -m http.server 8080
   ```
   Navigate to `http://localhost:8080`.

### Deploying to GitHub Pages
1. Go to **Settings > Pages** in this repository.
2. Under **Build and deployment > Source**, select `Deploy from a branch`.
3. Choose branch `main` and folder `/ (root)`.
4. Click **Save**. Your site will be live in seconds!

---

## 📂 Project Structure
```text
freshtrack/
├── index.html          # Semantic HTML5 layout and modals
├── .gitignore          # Git exclusion rules
├── README.md           # Documentation
├── css/
│   └── style.css       # Dark Forest custom styling and design system
└── js/
    ├── data.js         # Categories, units, 14 built-in recipes, sample seed data
    ├── storage.js      # Centralized localStorage manager and audit logging
    ├── logic.js        # Expiry math, urgency scoring, recipe matching, analytics
    └── app.js          # DOM interactions, SPA routing, form and modal handlers
```

---

## 🔒 Privacy & Data Ownership
FreshTrack 2.0 stores all inventory and activity logs strictly in the client's browser using `localStorage`. No user data is sent to external servers or synced across devices.
