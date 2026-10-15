/**
 * FreshTrack 2.0 — Static Food & Pantry Data
 * Contains canonical categories, storage locations, measurement units,
 * initial seed data (relative to current date), and built-in recipes.
 */

// Canonical Grocery Categories with icons and colors
const CATEGORIES = [
  { id: 'produce', name: 'Produce (Fruits & Veggies)', icon: 'bi-apple', color: '#88D49E' },
  { id: 'dairy', name: 'Dairy & Eggs', icon: 'bi-egg-fried', color: '#F6D887' },
  { id: 'meat', name: 'Meat & Seafood', icon: 'bi-drumstick', color: '#E57373' },
  { id: 'bakery', name: 'Bakery & Bread', icon: 'bi-cake2', color: '#D4A373' },
  { id: 'pantry', name: 'Pantry & Grains', icon: 'bi-box-seam', color: '#A0C4FF' },
  { id: 'condiments', name: 'Condiments & Spices', icon: 'bi-droplet-half', color: '#FFC6FF' },
  { id: 'beverages', name: 'Beverages', icon: 'bi-cup-straw', color: '#9BF6FF' },
  { id: 'frozen', name: 'Frozen Foods', icon: 'bi-snow', color: '#BDB2FF' },
  { id: 'snacks', name: 'Snacks & Sweets', icon: 'bi-cookie', color: '#FDFFB6' },
  { id: 'other', name: 'Other Essentials', icon: 'bi-basket', color: '#BAC7BE' }
];

// Storage Locations
const STORAGE_LOCATIONS = [
  { id: 'fridge', name: 'Main Fridge', icon: 'bi-thermometer-snow' },
  { id: 'freezer', name: 'Freezer', icon: 'bi-snow2' },
  { id: 'pantry_shelf', name: 'Pantry Cupboard', icon: 'bi-archive' },
  { id: 'countertop', name: 'Kitchen Counter', icon: 'bi-table' },
  { id: 'spice_rack', name: 'Spice Rack', icon: 'bi-grid-3x3' }
];

// Standard Measurement Units
const MEASUREMENT_UNITS = [
  'pcs',
  'kg',
  'g',
  'L',
  'ml',
  'packs',
  'bags',
  'boxes',
  'cans',
  'bottles',
  'bunch',
  'slices'
];

/**
 * Helper to generate relative date ISO strings (YYYY-MM-DD) based on current real-world date.
 * Ensures initial seed data provides an authentic experience whenever loaded.
 */
function getRelativeDateString(offsetDays) {
  const d = new Date();
  d.setDate(d.getDate() + offsetDays);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

// Initial Sample Pantry Items (Seeded only on first visit)
const INITIAL_PANTRY_ITEMS = [
  {
    id: 'item-1',
    name: 'Baby Spinach',
    category: 'produce',
    quantity: 1,
    unit: 'packs',
    storageLocation: 'fridge',
    purchaseDate: getRelativeDateString(-5),
    expiryDate: getRelativeDateString(0), // Expires today
    notes: 'Salad greens, bag is opened',
    isOpened: true
  },
  {
    id: 'item-2',
    name: 'Whole Milk',
    category: 'dairy',
    quantity: 1,
    unit: 'L',
    storageLocation: 'fridge',
    purchaseDate: getRelativeDateString(-4),
    expiryDate: getRelativeDateString(1), // Expires tomorrow
    notes: 'Carton opened 3 days ago',
    isOpened: true
  },
  {
    id: 'item-3',
    name: 'Ripe Avocados',
    category: 'produce',
    quantity: 3,
    unit: 'pcs',
    storageLocation: 'countertop',
    purchaseDate: getRelativeDateString(-3),
    expiryDate: getRelativeDateString(2), // 2 days left
    notes: 'Soft to touch, consume soon',
    isOpened: false
  },
  {
    id: 'item-4',
    name: 'Greek Yogurt',
    category: 'dairy',
    quantity: 500,
    unit: 'g',
    storageLocation: 'fridge',
    purchaseDate: getRelativeDateString(-6),
    expiryDate: getRelativeDateString(2), // 2 days left
    notes: 'Plain unsweetened',
    isOpened: false
  },
  {
    id: 'item-5',
    name: 'Chicken Breast Fillets',
    category: 'meat',
    quantity: 500,
    unit: 'g',
    storageLocation: 'fridge',
    purchaseDate: getRelativeDateString(-2),
    expiryDate: getRelativeDateString(3), // 3 days left
    notes: 'Freshly cut from butcher',
    isOpened: false
  },
  {
    id: 'item-6',
    name: 'Sourdough Bread',
    category: 'bakery',
    quantity: 1,
    unit: 'packs',
    storageLocation: 'countertop',
    purchaseDate: getRelativeDateString(-1),
    expiryDate: getRelativeDateString(4), // 4 days left
    notes: 'Artisan crusty loaf',
    isOpened: true
  },
  {
    id: 'item-7',
    name: 'Red Bell Peppers',
    category: 'produce',
    quantity: 2,
    unit: 'pcs',
    storageLocation: 'fridge',
    purchaseDate: getRelativeDateString(-2),
    expiryDate: getRelativeDateString(5), // 5 days left
    notes: 'Crisp and sweet',
    isOpened: false
  },
  {
    id: 'item-8',
    name: 'Cheddar Cheese',
    category: 'dairy',
    quantity: 250,
    unit: 'g',
    storageLocation: 'fridge',
    purchaseDate: getRelativeDateString(-3),
    expiryDate: getRelativeDateString(12), // 12 days left
    notes: 'Mature block',
    isOpened: true
  },
  {
    id: 'item-9',
    name: 'Large Free-Range Eggs',
    category: 'dairy',
    quantity: 10,
    unit: 'pcs',
    storageLocation: 'fridge',
    purchaseDate: getRelativeDateString(-3),
    expiryDate: getRelativeDateString(14), // 14 days left
    notes: 'Grade A organic',
    isOpened: false
  },
  {
    id: 'item-10',
    name: 'Fresh Garlic Bulbs',
    category: 'produce',
    quantity: 4,
    unit: 'pcs',
    storageLocation: 'pantry_shelf',
    purchaseDate: getRelativeDateString(-10),
    expiryDate: getRelativeDateString(25), // 25 days left
    notes: 'Keep in ventilated dark area',
    isOpened: false
  },
  {
    id: 'item-11',
    name: 'Jasmine Rice',
    category: 'pantry',
    quantity: 2,
    unit: 'kg',
    storageLocation: 'pantry_shelf',
    purchaseDate: getRelativeDateString(-20),
    expiryDate: getRelativeDateString(180), // 180 days left
    notes: 'Sealed airtight container',
    isOpened: true
  },
  {
    id: 'item-12',
    name: 'Extra Virgin Olive Oil',
    category: 'condiments',
    quantity: 750,
    unit: 'ml',
    storageLocation: 'pantry_shelf',
    purchaseDate: getRelativeDateString(-30),
    expiryDate: getRelativeDateString(240), // 240 days left
    notes: 'Cold pressed',
    isOpened: true
  },
  {
    id: 'item-13',
    name: 'Rolled Oats',
    category: 'pantry',
    quantity: 800,
    unit: 'g',
    storageLocation: 'pantry_shelf',
    purchaseDate: getRelativeDateString(-15),
    expiryDate: getRelativeDateString(90),
    notes: 'Wholegrain breakfast oats',
    isOpened: true
  },
  {
    id: 'item-14',
    name: 'Dry Spaghetti Pasta',
    category: 'pantry',
    quantity: 500,
    unit: 'g',
    storageLocation: 'pantry_shelf',
    purchaseDate: getRelativeDateString(-14),
    expiryDate: getRelativeDateString(300),
    notes: 'Durum wheat semolina',
    isOpened: false
  }
];

// Initial Shopping List items
const INITIAL_SHOPPING_ITEMS = [
  {
    id: 'shop-1',
    name: 'Mushrooms',
    category: 'produce',
    quantity: 250,
    unit: 'g',
    purchased: false,
    addedDate: getRelativeDateString(-1),
    note: 'Cremini or button for pasta'
  },
  {
    id: 'shop-2',
    name: 'Parmesan Cheese',
    category: 'dairy',
    quantity: 100,
    unit: 'g',
    purchased: false,
    addedDate: getRelativeDateString(-2),
    note: 'For risotto and pasta topping'
  },
  {
    id: 'shop-3',
    name: 'Bananas',
    category: 'produce',
    quantity: 6,
    unit: 'pcs',
    purchased: true,
    addedDate: getRelativeDateString(-1),
    note: 'Yellow with slight green stem'
  }
];

// Initial Activity Log
const INITIAL_ACTIVITY_LOG = [
  {
    id: 'act-1',
    type: 'add',
    title: 'Pantry Initialized',
    details: 'FreshTrack 2.0 system initialized with standard pantry stock.',
    timestamp: new Date(Date.now() - 3600000 * 48).toISOString()
  },
  {
    id: 'act-2',
    type: 'use',
    title: 'Used 2 Eggs',
    details: 'Cooked morning breakfast scrambled eggs.',
    timestamp: new Date(Date.now() - 3600000 * 24).toISOString()
  },
  {
    id: 'act-3',
    type: 'shop',
    title: 'Added Mushrooms to Shopping List',
    details: 'Needed for upcoming pasta dinner.',
    timestamp: new Date(Date.now() - 3600000 * 12).toISOString()
  }
];

// Initial Historical Consumption Summary for Analytics
const INITIAL_USAGE_HISTORY = [
  { id: 'u-1', itemName: 'Fresh Strawberries', category: 'produce', quantity: 250, unit: 'g', action: 'used', date: getRelativeDateString(-7) },
  { id: 'u-2', itemName: 'Whole Wheat Bread', category: 'bakery', quantity: 4, unit: 'slices', action: 'used', date: getRelativeDateString(-6) },
  { id: 'u-3', itemName: 'Sour Cream', category: 'dairy', quantity: 150, unit: 'g', action: 'wasted', reason: 'spoiled', date: getRelativeDateString(-5) },
  { id: 'u-4', itemName: 'Large Free-Range Eggs', category: 'dairy', quantity: 2, unit: 'pcs', action: 'used', date: getRelativeDateString(-4) },
  { id: 'u-5', itemName: 'Baby Spinach', category: 'produce', quantity: 50, unit: 'g', action: 'used', date: getRelativeDateString(-2) },
  { id: 'u-6', itemName: 'Cilantro bunch', category: 'produce', quantity: 1, unit: 'bunch', action: 'wasted', reason: 'wilted', date: getRelativeDateString(-1) }
];

// 14 Built-In Diverse Realistic Recipes
const BUILT_IN_RECIPES = [
  {
    id: 'rec-1',
    title: 'Garden Veggie & Cheddar Frittata',
    category: 'Breakfast / Brunch',
    difficulty: 'Easy',
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: 3,
    description: 'A fluffy, golden skillet frittata packed with vibrant spinach, crisp bell peppers, and melted cheddar.',
    imageIcon: 'bi-egg-fried',
    ingredients: [
      { name: 'Large Free-Range Eggs', canonical: 'egg', amount: '4', unit: 'pcs' },
      { name: 'Baby Spinach', canonical: 'spinach', amount: '1', unit: 'packs' },
      { name: 'Red Bell Peppers', canonical: 'bell pepper', amount: '1', unit: 'pcs' },
      { name: 'Cheddar Cheese', canonical: 'cheddar cheese', amount: '50', unit: 'g' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '15', unit: 'ml' }
    ],
    instructions: [
      'Preheat an oven-safe skillet over medium heat with extra virgin olive oil.',
      'Finely dice the bell peppers and sauté for 3-4 minutes until softened.',
      'Add the baby spinach and cook until wilted (about 1-2 minutes).',
      'Whisk eggs in a bowl with a pinch of salt and pepper; pour evenly into the skillet.',
      'Sprinkle shredded cheddar cheese on top, cook over low heat for 5 minutes, then broil for 3 minutes until puffed and golden.'
    ],
    tips: 'Great for using up spinach and vegetables before they lose their crunch.'
  },
  {
    id: 'rec-2',
    title: 'Golden Garlic Fried Rice',
    category: 'Lunch / Dinner',
    difficulty: 'Easy',
    prepTime: '5 mins',
    cookTime: '10 mins',
    servings: 2,
    description: 'A fragrant, satisfying wok toss using cooked rice, aromatic toasted garlic, scrambled eggs, and bell peppers.',
    imageIcon: 'bi-fire',
    ingredients: [
      { name: 'Jasmine Rice', canonical: 'rice', amount: '300', unit: 'g' },
      { name: 'Large Free-Range Eggs', canonical: 'egg', amount: '2', unit: 'pcs' },
      { name: 'Fresh Garlic Bulbs', canonical: 'garlic', amount: '3', unit: 'pcs' },
      { name: 'Red Bell Peppers', canonical: 'bell pepper', amount: '1', unit: 'pcs' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '20', unit: 'ml' }
    ],
    instructions: [
      'Thinly slice garlic cloves. Heat olive oil in a wide wok or non-stick pan over medium heat.',
      'Fry garlic slices until pale golden and fragrant (do not burn). Remove half for crispy topping.',
      'Push garlic to one side, pour beaten eggs into the other side, and scramble gently.',
      'Add diced bell pepper and cold cooked jasmine rice. Break clumps with spatula.',
      'Toss vigorously on high heat for 3-4 minutes until rice grains are toasted and fragrant. Garnish with reserved garlic.'
    ],
    tips: 'Best prepared with cold leftover rice from the fridge.'
  },
  {
    id: 'rec-3',
    title: 'Artisan Avocado & Poached Egg Toast',
    category: 'Breakfast / Brunch',
    difficulty: 'Easy',
    prepTime: '5 mins',
    cookTime: '5 mins',
    servings: 2,
    description: 'Crisp toasted sourdough generously layered with rich mashed avocado, olive oil drizzle, and a poached egg.',
    imageIcon: 'bi-card-text',
    ingredients: [
      { name: 'Sourdough Bread', canonical: 'bread', amount: '2', unit: 'slices' },
      { name: 'Ripe Avocados', canonical: 'avocado', amount: '1', unit: 'pcs' },
      { name: 'Large Free-Range Eggs', canonical: 'egg', amount: '2', unit: 'pcs' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '10', unit: 'ml' }
    ],
    instructions: [
      'Toast sourdough slices until deeply golden and crunchy.',
      'In a small bowl, scoop the ripe avocado, mash coarsely with a fork, salt, pepper, and a drop of olive oil.',
      'Poach or soft-fry the eggs in a small pot with simmering water or oiled pan.',
      'Spread generous avocado over warm sourdough toasts, top each with an egg, and finish with flaky salt.'
    ],
    tips: 'Consume immediately while the bread is crispy and egg yolks are runny.'
  },
  {
    id: 'rec-4',
    title: 'Pan-Seared Garlic Herb Chicken',
    category: 'Lunch / Dinner',
    difficulty: 'Medium',
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: 2,
    description: 'Juicy, tender chicken fillets pan-seared with crushed garlic, sweet bell peppers, and olive oil glaze.',
    imageIcon: 'bi-shield-check',
    ingredients: [
      { name: 'Chicken Breast Fillets', canonical: 'chicken', amount: '400', unit: 'g' },
      { name: 'Fresh Garlic Bulbs', canonical: 'garlic', amount: '3', unit: 'pcs' },
      { name: 'Red Bell Peppers', canonical: 'bell pepper', amount: '1', unit: 'pcs' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '25', unit: 'ml' }
    ],
    instructions: [
      'Pat chicken breast dry with a paper towel. Slice horizontally into even cutlets.',
      'Season both sides with salt, black pepper, and minced garlic.',
      'Heat olive oil in a heavy skillet over medium-high heat.',
      'Sear chicken for 4-5 minutes undisturbed until browned. Flip and sear other side for 4 minutes.',
      'Toss in sliced bell peppers in the final 3 minutes to blister and absorb the pan juices.'
    ],
    tips: 'Let chicken rest for 3 minutes before slicing to lock in moisture.'
  },
  {
    id: 'rec-5',
    title: 'Creamy Garlic & Spinach Pasta',
    category: 'Lunch / Dinner',
    difficulty: 'Easy',
    prepTime: '10 mins',
    cookTime: '12 mins',
    servings: 2,
    description: 'Al dente spaghetti tossed in a light, silky garlic emulsion with wilted fresh spinach and aged cheddar.',
    imageIcon: 'bi-circle',
    ingredients: [
      { name: 'Dry Spaghetti Pasta', canonical: 'pasta', amount: '200', unit: 'g' },
      { name: 'Baby Spinach', canonical: 'spinach', amount: '1', unit: 'packs' },
      { name: 'Fresh Garlic Bulbs', canonical: 'garlic', amount: '3', unit: 'pcs' },
      { name: 'Cheddar Cheese', canonical: 'cheddar cheese', amount: '60', unit: 'g' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '20', unit: 'ml' }
    ],
    instructions: [
      'Bring a pot of well-salted water to boil and cook spaghetti until al dente. Reserve 1/2 cup pasta water.',
      'Meanwhile, heat olive oil in a skillet and gently sizzle minced garlic for 60 seconds.',
      'Add fresh baby spinach and stir until collapsed.',
      'Transfer cooked pasta into skillet, sprinkle finely grated cheese, and splash reserved pasta water.',
      'Toss vigorously until a velvety sauce forms that clings to the pasta strands.'
    ],
    tips: 'The starch in the pasta water emulsifies with olive oil and cheese for instant creaminess without heavy cream.'
  },
  {
    id: 'rec-6',
    title: 'Power Oat & Greek Yogurt Bowl',
    category: 'Breakfast / Brunch',
    difficulty: 'Easy',
    prepTime: '5 mins',
    cookTime: '0 mins',
    servings: 1,
    description: 'Creamy high-protein Greek yogurt layered with toasted rolled oats, a splash of milk, and diced fruit.',
    imageIcon: 'bi-cup-hot',
    ingredients: [
      { name: 'Greek Yogurt', canonical: 'yogurt', amount: '200', unit: 'g' },
      { name: 'Rolled Oats', canonical: 'oats', amount: '40', unit: 'g' },
      { name: 'Whole Milk', canonical: 'milk', amount: '50', unit: 'ml' }
    ],
    instructions: [
      'In a dry skillet, lightly toast the rolled oats for 2 minutes until nutty and fragrant.',
      'Spoon chilled Greek yogurt into a wide bowl.',
      'Stir in a splash of whole milk for a smoother consistency.',
      'Top with toasted oats, a pinch of cinnamon, and fresh fruit or honey if available.'
    ],
    tips: 'Prepare the night before as overnight oats for an effortless grab-and-go morning.'
  },
  {
    id: 'rec-7',
    title: 'Golden Banana Oat Pancakes',
    category: 'Breakfast / Brunch',
    difficulty: 'Easy',
    prepTime: '5 mins',
    cookTime: '8 mins',
    servings: 2,
    description: 'Wholesome, naturally sweet blender pancakes made with rolled oats, fresh milk, and whole eggs.',
    imageIcon: 'bi-sun',
    ingredients: [
      { name: 'Rolled Oats', canonical: 'oats', amount: '100', unit: 'g' },
      { name: 'Large Free-Range Eggs', canonical: 'egg', amount: '2', unit: 'pcs' },
      { name: 'Whole Milk', canonical: 'milk', amount: '120', unit: 'ml' },
      { name: 'Bananas', canonical: 'banana', amount: '1', unit: 'pcs' }
    ],
    instructions: [
      'Place oats, ripe banana, egg, and milk into a blender. Blend until smooth.',
      'Heat a lightly greased non-stick skillet over medium-low heat.',
      'Pour 1/4 cup batter for each pancake. Cook until small bubbles form on surface (about 2 minutes).',
      'Flip gently and cook the other side for 1-2 minutes until golden brown.'
    ],
    tips: 'If bananas are in your shopping list, substitute with grated apple or a spoon of yogurt.'
  },
  {
    id: 'rec-8',
    title: 'Rustic Sourdough Grilled Cheese & Spinach',
    category: 'Lunch / Snacks',
    difficulty: 'Easy',
    prepTime: '5 mins',
    cookTime: '6 mins',
    servings: 1,
    description: 'Crispy pan-toasted sourdough filled with melting mature cheddar and wilted seasoned spinach.',
    imageIcon: 'bi-layers',
    ingredients: [
      { name: 'Sourdough Bread', canonical: 'bread', amount: '2', unit: 'slices' },
      { name: 'Cheddar Cheese', canonical: 'cheddar cheese', amount: '60', unit: 'g' },
      { name: 'Baby Spinach', canonical: 'spinach', amount: '1', unit: 'packs' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '10', unit: 'ml' }
    ],
    instructions: [
      'Brush the outer sides of sourdough bread with olive oil.',
      'Layer half the cheddar slices on the bottom bread slice.',
      'Add a handful of fresh baby spinach, then top with remaining cheddar and the second slice.',
      'Place in skillet over medium heat. Press gently with spatula.',
      'Cook 3 minutes per side until bread is golden crusty and cheese is fully melted.'
    ],
    tips: 'Cooking over moderate heat prevents bread from burning before cheese melts.'
  },
  {
    id: 'rec-9',
    title: 'Savory Chicken & Rice Skillet Bowl',
    category: 'Lunch / Dinner',
    difficulty: 'Medium',
    prepTime: '10 mins',
    cookTime: '20 mins',
    servings: 3,
    description: 'Hearty one-pan comfort meal combining golden seared chicken, diced peppers, garlic, and fluffy jasmine rice.',
    imageIcon: 'bi-trophy',
    ingredients: [
      { name: 'Chicken Breast Fillets', canonical: 'chicken', amount: '400', unit: 'g' },
      { name: 'Jasmine Rice', canonical: 'rice', amount: '250', unit: 'g' },
      { name: 'Fresh Garlic Bulbs', canonical: 'garlic', amount: '3', unit: 'pcs' },
      { name: 'Red Bell Peppers', canonical: 'bell pepper', amount: '1', unit: 'pcs' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '20', unit: 'ml' }
    ],
    instructions: [
      'Dice chicken breast into bite-sized pieces and season with salt and pepper.',
      'Heat olive oil in a deep skillet over medium heat; brown chicken for 4 minutes, then remove.',
      'In the same skillet, sauté minced garlic and diced bell peppers for 2 minutes.',
      'Rinse jasmine rice and add to the skillet, toasting grains in pan oils for 1 minute.',
      'Add 450ml water/stock, bring to boil, return chicken to skillet, cover, and simmer on low for 15 minutes until liquid is absorbed.'
    ],
    tips: 'Allow to steam off-heat for 5 minutes before fluffing with a fork.'
  },
  {
    id: 'rec-10',
    title: 'Avocado, Egg & Spinach Breakfast Salad',
    category: 'Lunch / Healthy',
    difficulty: 'Easy',
    prepTime: '8 mins',
    cookTime: '6 mins',
    servings: 2,
    description: 'A nutrient-rich clean salad with baby spinach, sliced creamy avocado, boiled eggs, and lemon-oil dressing.',
    imageIcon: 'bi-flower1',
    ingredients: [
      { name: 'Baby Spinach', canonical: 'spinach', amount: '1', unit: 'packs' },
      { name: 'Ripe Avocados', canonical: 'avocado', amount: '2', unit: 'pcs' },
      { name: 'Large Free-Range Eggs', canonical: 'egg', amount: '2', unit: 'pcs' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '15', unit: 'ml' }
    ],
    instructions: [
      'Boil eggs in a small pot for 6.5 minutes for soft-jammy yolks. Cool in ice water, peel, and halve.',
      'Wash and dry baby spinach; place into a wide salad bowl.',
      'Dice ripe avocado and gently scatter over the spinach greens.',
      'Arrange egg halves on top, drizzle with extra virgin olive oil, and season with coarse black pepper.'
    ],
    tips: 'Quick lunch that utilizes both urgent greens and ripe avocados.'
  },
  {
    id: 'rec-11',
    title: 'Warm Garlic Herb Crostini',
    category: 'Snacks / Appetizer',
    difficulty: 'Easy',
    prepTime: '5 mins',
    cookTime: '6 mins',
    servings: 4,
    description: 'Crisp artisan sourdough toasts rubbed with raw garlic cloves, drizzled with olive oil, and melted cheddar.',
    imageIcon: 'bi-suit-heart',
    ingredients: [
      { name: 'Sourdough Bread', canonical: 'bread', amount: '4', unit: 'slices' },
      { name: 'Fresh Garlic Bulbs', canonical: 'garlic', amount: '2', unit: 'pcs' },
      { name: 'Cheddar Cheese', canonical: 'cheddar cheese', amount: '40', unit: 'g' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '15', unit: 'ml' }
    ],
    instructions: [
      'Slice sourdough into thick rounds and toast or grill until charred and crunchy.',
      'Cut a garlic clove in half and rub the cut side vigorously across the hot, rough surface of each toast.',
      'Drizzle liberally with good olive oil.',
      'Top with finely shaved cheddar cheese and broil for 1 minute until bubbling.'
    ],
    tips: 'The best way to revive day-old or slightly stale artisanal bread.'
  },
  {
    id: 'rec-12',
    title: 'Creamy Mushroom Garlic Pasta',
    category: 'Lunch / Dinner',
    difficulty: 'Medium',
    prepTime: '10 mins',
    cookTime: '15 mins',
    servings: 2,
    description: 'Earthy sautéed cremini mushrooms with garlic, olive oil, and parmesan cheese over ribbon pasta.',
    imageIcon: 'bi-magic',
    ingredients: [
      { name: 'Dry Spaghetti Pasta', canonical: 'pasta', amount: '200', unit: 'g' },
      { name: 'Mushrooms', canonical: 'mushrooms', amount: '250', unit: 'g' },
      { name: 'Fresh Garlic Bulbs', canonical: 'garlic', amount: '3', unit: 'pcs' },
      { name: 'Parmesan Cheese', canonical: 'parmesan', amount: '40', unit: 'g' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '20', unit: 'ml' }
    ],
    instructions: [
      'Boil pasta in salted water until al dente.',
      'Heat olive oil in a wide pan over medium-high heat. Add sliced mushrooms in a single layer without stirring for 3 minutes to caramelize.',
      'Stir, add minced garlic, and cook for 2 more minutes.',
      'Toss in cooked pasta with a splash of cooking water and grated parmesan cheese.',
      'Toss gently until sauce glazes the pasta.'
    ],
    tips: 'Missing mushrooms and parmesan? They are ready in your Shopping List!'
  },
  {
    id: 'rec-13',
    title: 'Spanish Garlic Egg Scramble (Revuelto)',
    category: 'Breakfast / Dinner',
    difficulty: 'Easy',
    prepTime: '5 mins',
    cookTime: '6 mins',
    servings: 2,
    description: 'Soft, velvety scrambled eggs gently cooked in olive oil with caramelized sliced garlic and spinach.',
    imageIcon: 'bi-brightness-high',
    ingredients: [
      { name: 'Large Free-Range Eggs', canonical: 'egg', amount: '4', unit: 'pcs' },
      { name: 'Fresh Garlic Bulbs', canonical: 'garlic', amount: '4', unit: 'pcs' },
      { name: 'Baby Spinach', canonical: 'spinach', amount: '1', unit: 'packs' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '20', unit: 'ml' }
    ],
    instructions: [
      'Gently heat olive oil in a skillet and cook thinly sliced garlic on low heat until soft and sweet (not browned).',
      'Add spinach and wilt for 60 seconds.',
      'Pour lightly beaten eggs into pan. Stir slowly with a silicone spatula on low heat.',
      'Remove from heat while eggs are still slightly custardy and glossy.'
    ],
    tips: 'Low heat is key to creating luxurious velvety eggs rather than rubbery curds.'
  },
  {
    id: 'rec-14',
    title: 'Roasted Bell Pepper & Rice Medley',
    category: 'Lunch / Dinner',
    difficulty: 'Easy',
    prepTime: '8 mins',
    cookTime: '15 mins',
    servings: 2,
    description: 'Vibrant diced bell peppers blistered in olive oil, tossed with aromatic garlic rice and melted cheddar.',
    imageIcon: 'bi-gem',
    ingredients: [
      { name: 'Jasmine Rice', canonical: 'rice', amount: '250', unit: 'g' },
      { name: 'Red Bell Peppers', canonical: 'bell pepper', amount: '2', unit: 'pcs' },
      { name: 'Fresh Garlic Bulbs', canonical: 'garlic', amount: '2', unit: 'pcs' },
      { name: 'Cheddar Cheese', canonical: 'cheddar cheese', amount: '50', unit: 'g' },
      { name: 'Extra Virgin Olive Oil', canonical: 'olive oil', amount: '15', unit: 'ml' }
    ],
    instructions: [
      'Dice bell peppers into bite-sized squares.',
      'Heat skillet with olive oil until hot. Sauté peppers for 5 minutes until edges are blistered and sweet.',
      'Add minced garlic and stir for 1 minute.',
      'Fold in cooked jasmine rice and heat through.',
      'Fold in grated cheddar just before serving so it threads through the warm grains.'
    ],
    tips: 'A colourful, nourishing side dish or light main meal.'
  }
];
