/**
 * GETIT Dynamic 3-Level Marketplace Taxonomy & Specialisation Engine
 *
 * Level 1: Main Marketplace Departments (e.g. Meat & Poultry, Vegetables, Fruits, Fish & Seafood, Grocery & Provisions, Pharmacy, Bakery, Grains & Foodstuff)
 * Level 2: Specialist Subcategories (e.g. Goat Meat, Beef, Ram & Sheep, Poultry)
 * Level 3: Exact Product Varieties / Cuts (e.g. Fresh Goat Meat, Goat Ribs, Goat Head, Goat Offal)
 *
 * Designed to be 100% dynamic and manageable from the GETIT Admin Dashboard
 * with real-time Supabase + AsyncStorage sync across all customer and merchant devices.
 */

export const TAXONOMY_STORAGE_KEY = 'getit_marketplace_taxonomy_v3';
export const CATEGORY_REQUESTS_STORAGE_KEY = 'getit_merchant_category_requests_v1';
export const PHARMACY_APPROVALS_STORAGE_KEY = 'getit_pharmacy_approvals_v1';

// --- Option B: Customer & Merchant Store Types ("Shop by Store Type") ---
export const DEFAULT_STORE_TYPES = [
  {
    id: 'all',
    name: 'All Stores',
    pluralName: 'All Stores',
    icon: '✨',
    departmentId: 'all',
    badgeLabel: 'VERIFIED MERCHANT',
    badgeColor: '#056B4B',
    description: 'Browse all verified shops and specialist sellers near you',
    enabled: true,
  },
  {
    id: 'supermarket',
    name: 'Supermarket',
    pluralName: 'Supermarkets',
    icon: '🛒',
    departmentId: 'grocery',
    badgeLabel: 'SUPERMARKET',
    badgeColor: '#056B4B',
    isMultiDepartmentCapable: true,
    description: 'Multi-department supermarkets & hypermarkets',
    enabled: true,
  },
  {
    id: 'provision_store',
    name: 'Provision Store',
    pluralName: 'Provision Stores',
    icon: '🥫',
    departmentId: 'grocery',
    badgeLabel: 'PROVISION STORE',
    badgeColor: '#0D9488',
    description: 'Neighbourhood provision stores & mini-marts',
    enabled: true,
  },
  {
    id: 'butcher',
    name: 'Butcher & Meat Shop',
    pluralName: 'Butchers',
    icon: '🥩',
    departmentId: 'meat_poultry',
    badgeLabel: 'SPECIALIST BUTCHER',
    badgeColor: '#DC2626',
    description: 'Specialist butchers selling fresh goat meat, beef & ram',
    enabled: true,
  },
  {
    id: 'poultry_shop',
    name: 'Poultry Shop',
    pluralName: 'Poultry Shops',
    icon: '🍗',
    departmentId: 'meat_poultry',
    badgeLabel: 'POULTRY SPECIALIST',
    badgeColor: '#EA580C',
    description: 'Dedicated chicken, turkey, duck, gizzard & farm egg sellers',
    enabled: true,
  },
  {
    id: 'vegetable_vendor',
    name: 'Vegetable Shop',
    pluralName: 'Vegetable Vendors',
    icon: '🥬',
    departmentId: 'vegetables',
    badgeLabel: 'VEGETABLE VENDOR',
    badgeColor: '#16A34A',
    description: 'Farm-fresh tomatoes, peppers, onions & leafy greens',
    enabled: true,
  },
  {
    id: 'fruit_vendor',
    name: 'Fruit Shop',
    pluralName: 'Fruit Vendors',
    icon: '🍉',
    departmentId: 'fruits',
    badgeLabel: 'FRUIT VENDOR',
    badgeColor: '#D97706',
    description: 'Fresh tropical, seasonal & exotic fruit sellers',
    enabled: true,
  },
  {
    id: 'fish_market',
    name: 'Fish & Seafood Shop',
    pluralName: 'Fish Markets',
    icon: '🐟',
    departmentId: 'fish_seafood',
    badgeLabel: 'SEAFOOD SPECIALIST',
    badgeColor: '#0284C7',
    description: 'Live catfish, croaker, titus, prawns, stockfish & crayfish',
    enabled: true,
  },
  {
    id: 'bakery',
    name: 'Bakery & Confectionery',
    pluralName: 'Bakeries',
    icon: '🥐',
    departmentId: 'bakery',
    badgeLabel: 'ARTISAN BAKERY',
    badgeColor: '#B45309',
    description: 'Fresh bread, celebration cakes, meat pies & pastries',
    enabled: true,
  },
  {
    id: 'foodstuff_dealer',
    name: 'Grains & Foodstuff Shop',
    pluralName: 'Foodstuff Dealers',
    icon: '🌾',
    departmentId: 'grains_foodstuff',
    badgeLabel: 'FOODSTUFF DEPOT',
    badgeColor: '#7C2D12',
    description: 'Bags of rice, beans, garri, yam flour, palm oil & tubers',
    enabled: true,
  },
  {
    id: 'pharmacy',
    name: 'Licensed Pharmacy',
    pluralName: 'Pharmacies',
    icon: '💊',
    departmentId: 'pharmacy',
    badgeLabel: 'VERIFIED PHARMACY',
    badgeColor: '#2563EB',
    isRegulated: true,
    description: 'PCN-licensed community pharmacies & healthcare retailers',
    enabled: true,
  },
  {
    id: 'drinks_cellar',
    name: 'Drinks & Beverage Shop',
    pluralName: 'Drinks & Cellars',
    icon: '🍾',
    departmentId: 'drinks_beverages',
    badgeLabel: 'DRINKS & CELLAR',
    badgeColor: '#7C3AED',
    description: 'Water, soft drinks, juices, malt & fine wines',
    enabled: true,
  },
];

// --- Option A: Visual "What are you shopping for?" Quick Product Spotlights ---
export const DEFAULT_PRODUCT_SPOTLIGHTS = [
  {
    id: 'spot-all-supermarkets',
    title: 'Supermarkets / All',
    subtitle: 'All departments & stores',
    icon: '🛒',
    departmentId: 'all',
    subcategoryId: 'all',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=75',
    accentColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    textColor: '#065F46',
  },
  {
    id: 'spot-goat-meat',
    title: 'Goat Meat',
    subtitle: 'Fresh cuts, ribs & head',
    icon: '🐐',
    departmentId: 'meat_poultry',
    subcategoryId: 'goat_meat',
    image: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=400&q=75',
    accentColor: '#FEF2F2',
    borderColor: '#FECACA',
    textColor: '#991B1B',
  },
  {
    id: 'spot-chicken',
    title: 'Chicken & Poultry',
    subtitle: 'Whole chicken, wings & turkey',
    icon: '🍗',
    departmentId: 'meat_poultry',
    subcategoryId: 'poultry',
    image: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=400&q=75',
    accentColor: '#FFF7ED',
    borderColor: '#FED7AA',
    textColor: '#9A3412',
  },
  {
    id: 'spot-beef',
    title: 'Beef & Cow Meat',
    subtitle: 'Boneless, ribs, shaki & liver',
    icon: '🥩',
    departmentId: 'meat_poultry',
    subcategoryId: 'beef',
    image: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=400&q=75',
    accentColor: '#FEF2F2',
    borderColor: '#FCA5A5',
    textColor: '#7F1D1D',
  },
  {
    id: 'spot-vegetables',
    title: 'Vegetables',
    subtitle: 'Tomatoes, pepper, ugwu & onions',
    icon: '🥬',
    departmentId: 'vegetables',
    subcategoryId: 'all',
    image: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=400&q=75',
    accentColor: '#F0FDF4',
    borderColor: '#BBF7D0',
    textColor: '#166534',
  },
  {
    id: 'spot-fruits',
    title: 'Fresh Fruits',
    subtitle: 'Orange, apple, banana & mango',
    icon: '🍉',
    departmentId: 'fruits',
    subcategoryId: 'all',
    image: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=400&q=75',
    accentColor: '#FFFBEB',
    borderColor: '#FDE68A',
    textColor: '#92400E',
  },
  {
    id: 'spot-fish',
    title: 'Fish & Seafood',
    subtitle: 'Catfish, croaker, titus & prawns',
    icon: '🐟',
    departmentId: 'fish_seafood',
    subcategoryId: 'all',
    image: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=400&q=75',
    accentColor: '#F0F9FF',
    borderColor: '#BAE6FD',
    textColor: '#075985',
  },
  {
    id: 'spot-foodstuff',
    title: 'Foodstuff & Rice',
    subtitle: 'Rice, beans, garri & yam flour',
    icon: '🌾',
    departmentId: 'grains_foodstuff',
    subcategoryId: 'all',
    image: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=400&q=75',
    accentColor: '#FEFCE8',
    borderColor: '#FEF08A',
    textColor: '#854D0E',
  },
  {
    id: 'spot-bakery',
    title: 'Bread & Bakery',
    subtitle: 'Fresh loaves, cakes & meat pies',
    icon: '🥐',
    departmentId: 'bakery',
    subcategoryId: 'all',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=400&q=75',
    accentColor: '#FFF7ED',
    borderColor: '#FDBA74',
    textColor: '#9A3412',
  },
];

// --- Three-Level Marketplace Category Hierarchy ---
export const DEFAULT_MARKETPLACE_DEPARTMENTS = [
  {
    id: 'grocery',
    name: 'Grocery & Provisions',
    shortName: 'Groceries',
    description: 'General provision stores and supermarkets',
    icon: '🛒',
    coverImage: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=600&q=75',
    badgeColor: '#056B4B',
    defaultStoreType: 'provision_store',
    allowedStoreTypes: ['supermarket', 'provision_store'],
    enabledForCustomers: true,
    enabledForMerchants: true,
    isRegulated: false,
    order: 1,
    subcategories: [
      {
        id: 'cooking_pantry',
        name: 'Cooking Oils & Pantry',
        icon: '🫒',
        enabled: true,
        varieties: [
          { id: 'vegetable_olive_oil', name: 'Vegetable, Olive & Sunflower Oil', keywords: ['oil', 'olive', 'mamador', 'devon king', 'terra'] },
          { id: 'seasoning_spices', name: 'Seasoning Cubes, Curry & Thyme', keywords: ['maggi', 'knorr', 'royco', 'curry', 'thyme', 'spice', 'seasoning', 'salt'] },
          { id: 'tin_tomatoes_paste', name: 'Tin Tomatoes, Paste & Sauces', keywords: ['tomato paste', 'gino', 'sonia', 'tasty tom', 'ketchup', 'mayonnaise', 'bama'] },
        ],
      },
      {
        id: 'pasta_noodles_canned',
        name: 'Pasta, Noodles & Canned Foods',
        icon: '🍝',
        enabled: true,
        varieties: [
          { id: 'noodles', name: 'Instant Noodles (Indomie, etc.)', keywords: ['indomie', 'noodle', 'minimie', 'hungry man'] },
          { id: 'spaghetti_macaroni', name: 'Spaghetti, Macaroni & Couscous', keywords: ['spaghetti', 'pasta', 'macaroni', 'couscous', 'golden penny'] },
          { id: 'sardines_corned_beef', name: 'Sardines, Corned Beef & Baked Beans', keywords: ['sardine', 'titus sardine', 'geisha', 'corned beef', 'exeter', 'baked beans', 'sweet corn'] },
        ],
      },
      {
        id: 'dairy_breakfast_cereals',
        name: 'Milk, Beverages & Breakfast',
        icon: '🥛',
        enabled: true,
        varieties: [
          { id: 'milk_powder_liquid', name: 'Peak, Dano & Evaporated Milk', keywords: ['milk', 'peak', 'dano', 'three crowns', 'cowbell', 'hollandia'] },
          { id: 'milo_bournvita_tea', name: 'Milo, Bournvita, Ovaltine & Tea', keywords: ['milo', 'bournvita', 'ovaltine', 'lipton', 'tea', 'nescafe', 'coffee'] },
          { id: 'cereals_oats_custard', name: 'Cornflakes, Golden Morn, Oats & Custard', keywords: ['cornflakes', 'kellogg', 'golden morn', 'quaker', 'oats', 'custard', 'checkers'] },
          { id: 'sugar_honey_spreads', name: 'Sugar, Honey, Butter & Spreads', keywords: ['sugar', 'honey', 'blue band', 'margarine', 'butter', 'peanut butter', 'jam', 'nutella'] },
          { id: 'cheese_yogurt_eggs', name: 'Cheese, Yogurt & Crate of Eggs', keywords: ['cheese', 'yogurt', 'yoghurt', 'egg', 'parmigiano', 'cheddar'] },
        ],
      },
      {
        id: 'biscuits_snacks_sweets',
        name: 'Biscuits, Chocolates & Snacks',
        icon: '🍪',
        enabled: true,
        varieties: [
          { id: 'biscuits_cookies', name: 'Shortbread, Crackers & Cookies', keywords: ['biscuit', 'shortbread', 'digestive', 'cracker', 'oreo', 'cookie', 'coaster'] },
          { id: 'nuts_crisps_popcorn', name: 'Cashew Nuts, Pringles & Plantain Chips', keywords: ['cashew', 'pringles', 'chips', 'popcorn', 'peanuts', 'snack'] },
          { id: 'chocolates_candies', name: 'Chocolates, Sweets & Gum', keywords: ['chocolate', 'ferrero', 'snickers', 'mars', 'cadbury', 'mentos', 'orbit'] },
        ],
      },
    ],
  },
  {
    id: 'meat_poultry',
    name: 'Meat & Poultry',
    shortName: 'Meat & Poultry',
    description: 'Butchers, meat shops and poultry sellers',
    icon: '🥩',
    coverImage: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=600&q=75',
    badgeColor: '#DC2626',
    defaultStoreType: 'butcher',
    allowedStoreTypes: ['butcher', 'poultry_shop', 'supermarket'],
    enabledForCustomers: true,
    enabledForMerchants: true,
    isRegulated: false,
    order: 2,
    subcategories: [
      {
        id: 'goat_meat',
        name: 'Goat Meat',
        icon: '🐐',
        enabled: true,
        varieties: [
          { id: 'fresh_goat_meat', name: 'Fresh Goat Meat (Cut / Per Kg)', keywords: ['goat meat', 'fresh goat', 'ogufe', 'asun cut', 'goat'] },
          { id: 'goat_ribs', name: 'Goat Ribs & Chops', keywords: ['goat rib', 'goat chop'] },
          { id: 'goat_head', name: 'Goat Head (Isi Ewu Cut)', keywords: ['goat head', 'isi ewu'] },
          { id: 'goat_offal', name: 'Goat Offal (Intestines, Towel & Liver)', keywords: ['goat offal', 'goat intestine', 'goat towel', 'goat liver', 'ngwo ngwo'] },
          { id: 'smoked_goat_meat', name: 'Flame-Singed / Roasted Goat Meat', keywords: ['smoked goat', 'singed goat', 'roasted goat'] },
        ],
      },
      {
        id: 'beef',
        name: 'Beef / Cow Meat',
        icon: '🐄',
        enabled: true,
        varieties: [
          { id: 'cow_meat', name: 'Cow Meat (Boneless & Soup Cuts)', keywords: ['cow meat', 'beef', 'boneless beef', 'steak', 'ribeye', 'sirloin', 'fillet'] },
          { id: 'beef_ribs', name: 'Beef Ribs & Brisket', keywords: ['beef rib', 'short rib', 'brisket', 'biscuit bone'] },
          { id: 'beef_liver', name: 'Fresh Beef Liver & Kidney', keywords: ['beef liver', 'cow liver', 'kidney'] },
          { id: 'beef_intestines', name: 'Beef Intestines (Shaki, Roundabout & Fuku)', keywords: ['shaki', 'tripe', 'roundabout', 'intestine', 'abodi', 'fuku', 'cow offal'] },
          { id: 'minced_beef', name: 'Minced Beef', keywords: ['minced beef', 'ground beef', 'mince'] },
          { id: 'cow_foot_ponmo', name: 'Cow Foot (Bokoto), Cow Tail & Ponmo', keywords: ['cow foot', 'bokoto', 'cow leg', 'oxtail', 'cow tail', 'ponmo', 'kpomo', 'cow skin'] },
        ],
      },
      {
        id: 'ram_sheep',
        name: 'Ram & Sheep',
        icon: '🐏',
        enabled: true,
        varieties: [
          { id: 'ram_meat', name: 'Fresh Ram Meat', keywords: ['ram meat', 'ram', 'suya ram'] },
          { id: 'sheep_meat', name: 'Sheep / Mutton Meat', keywords: ['sheep meat', 'mutton', 'lamb'] },
          { id: 'ram_ribs', name: 'Ram Ribs & Shoulder Chops', keywords: ['ram rib', 'lamb chop', 'ram chop'] },
        ],
      },
      {
        id: 'poultry',
        name: 'Poultry (Chicken, Turkey & Duck)',
        icon: '🍗',
        enabled: true,
        varieties: [
          { id: 'whole_chicken', name: 'Whole Chicken (Broiler & Old Layer)', keywords: ['whole chicken', 'broiler', 'old layer', 'local chicken', 'chicken'] },
          { id: 'chicken_wings', name: 'Chicken Wings & Drumsticks', keywords: ['chicken wing', 'drumstick', 'chicken lap', 'chicken thigh'] },
          { id: 'chicken_breast', name: 'Boneless Chicken Breast & Fillet', keywords: ['chicken breast', 'chicken fillet'] },
          { id: 'turkey', name: 'Turkey Wings & Mid-Wings', keywords: ['turkey', 'turkey wing', 'smoked turkey'] },
          { id: 'duck', name: 'Whole Duck, Guinea Fowl & Quail', keywords: ['duck', 'guinea fowl', 'quail', 'chicken gizzard', 'gizzard'] },
        ],
      },
      {
        id: 'pork',
        name: 'Pork & Sausages',
        icon: '🥓',
        enabled: true,
        varieties: [
          { id: 'fresh_pork', name: 'Fresh Pork Cuts & Pork Belly', keywords: ['pork', 'pork belly', 'pork chop'] },
          { id: 'pork_ribs', name: 'Pork Spare Ribs', keywords: ['pork rib'] },
          { id: 'bacon_sausages', name: 'Bacon, Sausages & Frankfurters', keywords: ['bacon', 'sausage', 'frankfurter', 'hot dog', 'salami'] },
        ],
      },
    ],
  },
  {
    id: 'vegetables',
    name: 'Vegetables',
    shortName: 'Vegetables',
    description: 'Fresh and packaged vegetables',
    icon: '🥬',
    coverImage: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=600&q=75',
    badgeColor: '#16A34A',
    defaultStoreType: 'vegetable_vendor',
    allowedStoreTypes: ['vegetable_vendor', 'supermarket', 'fruit_vendor'],
    enabledForCustomers: true,
    enabledForMerchants: true,
    isRegulated: false,
    order: 3,
    subcategories: [
      {
        id: 'tomatoes_pepper_onions',
        name: 'Tomatoes, Pepper & Onions',
        icon: '🍅',
        enabled: true,
        varieties: [
          { id: 'tomatoes', name: 'Fresh Jos / Plum Tomatoes', keywords: ['tomato', 'tomatoes', 'jos tomato'] },
          { id: 'pepper', name: 'Fresh Pepper (Ata Rodo, Tatase & Shombo)', keywords: ['pepper', 'rodo', 'scotch bonnet', 'tatase', 'shombo', 'chili'] },
          { id: 'onions', name: 'Red & White Onions + Spring Onions', keywords: ['onion', 'spring onion', 'shallot', 'garlic', 'ginger'] },
          { id: 'bell_peppers', name: 'Green, Red & Yellow Bell Peppers', keywords: ['bell pepper', 'sweet pepper', 'green pepper'] },
        ],
      },
      {
        id: 'leafy_greens',
        name: 'Fresh Leafy Vegetables',
        icon: '🌿',
        enabled: true,
        varieties: [
          { id: 'spinach', name: 'Spinach (Efo Shoko & Green Amaranth)', keywords: ['spinach', 'efo', 'shoko', 'tete', 'green leaf'] },
          { id: 'ugwu', name: 'Fluted Pumpkin Leaves (Ugwu)', keywords: ['ugwu', 'ugu', 'pumpkin leaf'] },
          { id: 'soup_leaves', name: 'Bitterleaf, Waterleaf, Ewedu, Uziza & Scent Leaf', keywords: ['bitterleaf', 'waterleaf', 'ewedu', 'uziza', 'scent leaf', 'utazi', 'afang', 'oha'] },
        ],
      },
      {
        id: 'crunchy_salad_veg',
        name: 'Carrots, Cabbage, Cucumber & Okra',
        icon: '🥕',
        enabled: true,
        varieties: [
          { id: 'carrots', name: 'Fresh Carrots', keywords: ['carrot'] },
          { id: 'cabbage', name: 'Green & Purple Cabbage + Lettuce', keywords: ['cabbage', 'lettuce', 'coleslaw', 'salad'] },
          { id: 'cucumber', name: 'Fresh Crisp Cucumber', keywords: ['cucumber'] },
          { id: 'okra_garden_egg', name: 'Fresh Okra, Green Beans, Broccoli & Garden Egg', keywords: ['okra', 'okro', 'green beans', 'runner beans', 'broccoli', 'cauliflower', 'garden egg', 'beetroot', 'sweetcorn'] },
        ],
      },
    ],
  },
  {
    id: 'fruits',
    name: 'Fruits',
    shortName: 'Fruits',
    description: 'Fruit shops and fruit vendors',
    icon: '🍉',
    coverImage: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=600&q=75',
    badgeColor: '#D97706',
    defaultStoreType: 'fruit_vendor',
    allowedStoreTypes: ['fruit_vendor', 'vegetable_vendor', 'supermarket'],
    enabledForCustomers: true,
    enabledForMerchants: true,
    isRegulated: false,
    order: 4,
    subcategories: [
      {
        id: 'everyday_fruits',
        name: 'Oranges, Apples & Bananas',
        icon: '🍎',
        enabled: true,
        varieties: [
          { id: 'orange', name: 'Sweet Oranges, Tangerines & Lemon', keywords: ['orange', 'tangerine', 'mandarin', 'lemon', 'lime', 'grapefruit'] },
          { id: 'apple', name: 'Red & Green Apples + Pears', keywords: ['apple', 'granny smith', 'gala apple', 'pear'] },
          { id: 'banana', name: 'Sweet Bananas & Ripe Plantains', keywords: ['banana', 'plantain'] },
        ],
      },
      {
        id: 'tropical_melons',
        name: 'Watermelon, Pineapple, Mango & Pawpaw',
        icon: '🍍',
        enabled: true,
        varieties: [
          { id: 'watermelon', name: 'Sweet Red Watermelon & Sweet Melon', keywords: ['watermelon', 'melon', 'cantaloupe'] },
          { id: 'pineapple', name: 'Juicy Pineapple', keywords: ['pineapple'] },
          { id: 'mango', name: 'Fresh Mangoes', keywords: ['mango'] },
          { id: 'pawpaw', name: 'Ripe Pawpaw (Papaya) & Avocado', keywords: ['pawpaw', 'papaya', 'avocado', 'coconut', 'soursop', 'guava'] },
        ],
      },
      {
        id: 'berries_grapes_packs',
        name: 'Grapes, Berries & Cut Fruit Packs',
        icon: '🍇',
        enabled: true,
        varieties: [
          { id: 'grapes', name: 'Seedless Red & Green Grapes', keywords: ['grape'] },
          { id: 'berries_dates', name: 'Strawberries, Blueberries, Dates & Tigernuts', keywords: ['strawberry', 'blueberry', 'berry', 'date', 'dabino', 'tigernut'] },
          { id: 'fruit_platters', name: 'Ready-to-Eat Fruit Bowls & Parfaits', keywords: ['fruit bowl', 'fruit salad', 'parfait', 'fruit basket'] },
        ],
      },
    ],
  },
  {
    id: 'fish_seafood',
    name: 'Fish & Seafood',
    shortName: 'Fish & Seafood',
    description: 'Fresh, frozen and smoked seafood',
    icon: '🐟',
    coverImage: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=600&q=75',
    badgeColor: '#0284C7',
    defaultStoreType: 'fish_market',
    allowedStoreTypes: ['fish_market', 'butcher', 'supermarket'],
    enabledForCustomers: true,
    enabledForMerchants: true,
    isRegulated: false,
    order: 5,
    subcategories: [
      {
        id: 'fresh_fish',
        name: 'Fresh & Live Fish',
        icon: '🐟',
        enabled: true,
        varieties: [
          { id: 'catfish', name: 'Fresh / Live Catfish (Point & Kill)', keywords: ['catfish', 'point and kill'] },
          { id: 'tilapia', name: 'Fresh Tilapia Fish', keywords: ['tilapia'] },
          { id: 'croaker', name: 'Fresh Croaker & Red Snapper', keywords: ['croaker', 'snapper', 'barracuda', 'shiny nose'] },
        ],
      },
      {
        id: 'frozen_fish',
        name: 'Frozen Fish (Titus, Hake & Salmon)',
        icon: '🧊',
        enabled: true,
        varieties: [
          { id: 'mackerel', name: 'Original Mackerel (Titus)', keywords: ['mackerel', 'titus fish'] },
          { id: 'hake_kote', name: 'Hake (Panla) & Horse Mackerel (Kote)', keywords: ['hake', 'panla', 'kote', 'shawa', 'herring'] },
          { id: 'salmon_fillets', name: 'Salmon Steaks & White Fish Fillets', keywords: ['salmon', 'trout', 'cod', 'fish fillet'] },
        ],
      },
      {
        id: 'prawns_shellfish',
        name: 'Prawns, Shrimps & Shellfish',
        icon: '🦐',
        enabled: true,
        varieties: [
          { id: 'prawns', name: 'Jumbo Tiger Prawns & King Prawns', keywords: ['prawn', 'king prawn', 'tiger prawn'] },
          { id: 'shrimps_crabs', name: 'Fresh Shrimps, Crabs, Calamari & Snails', keywords: ['shrimp', 'crab', 'calamari', 'squid', 'lobster', 'snail', 'periwinkle'] },
        ],
      },
      {
        id: 'smoked_dried_fish',
        name: 'Crayfish, Stockfish & Smoked Fish',
        icon: '🔥',
        enabled: true,
        varieties: [
          { id: 'crayfish', name: 'Oron Crayfish (Whole & Blended)', keywords: ['crayfish', 'dry prawn'] },
          { id: 'stockfish', name: 'Norwegian Stockfish (Okporoko)', keywords: ['stockfish', 'okporoko', 'cod head'] },
          { id: 'smoked_fish', name: 'Oven-Dried Catfish, Smoked Panla & Bonga', keywords: ['smoked fish', 'dried catfish', 'smoked catfish', 'smoked panla', 'bonga', 'mangala'] },
        ],
      },
    ],
  },
  {
    id: 'pharmacy',
    name: 'Pharmacy & Healthcare',
    shortName: 'Pharmacy',
    description: 'Licensed pharmacies and health retailers',
    icon: '💊',
    coverImage: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=600&q=75',
    badgeColor: '#2563EB',
    defaultStoreType: 'pharmacy',
    allowedStoreTypes: ['pharmacy'],
    enabledForCustomers: true,
    enabledForMerchants: true,
    isRegulated: true,
    regulatoryNotice: 'Requires PCN License, Superintendent Pharmacist verification & regulated product approval.',
    order: 6,
    subcategories: [
      {
        id: 'malaria_infections',
        name: 'Malaria & Anti-Infectives',
        icon: '🦟',
        enabled: true,
        varieties: [
          { id: 'antimalarials', name: 'ACT Antimalarials (Coartem, Lonart, Amatem)', keywords: ['coartem', 'lonart', 'amatem', 'malaria', 'artemether', 'lumefantrine'] },
          { id: 'antibiotics_rx', name: 'Prescription Antibiotics (Rx Only)', keywords: ['augmentin', 'amoxicillin', 'azithromycin', 'ciprofloxacin', 'antibiotic', 'cefuroxime', 'flagyl'] },
          { id: 'deworming_antifungal', name: 'Deworming & Antifungal Treatments', keywords: ['zentel', 'combantrin', 'albendazole', 'fluconazole', 'canesten'] },
        ],
      },
      {
        id: 'pain_cough_digestive',
        name: 'Pain, Fever, Cough & Digestive',
        icon: '💊',
        enabled: true,
        varieties: [
          { id: 'pain_fever_relief', name: 'Paracetamol, Ibuprofen & Pain Relief', keywords: ['panadol', 'paracetamol', 'emzor', 'ibuprofen', 'cataflam', 'diclofenac', 'aspirin'] },
          { id: 'cough_cold_allergy', name: 'Cough Syrups, Cold & Allergy Relief', keywords: ['cough', 'strepsils', 'benylin', 'cetirizine', 'loratadine', 'pirton', 'ventolin', 'inhaler'] },
          { id: 'ulcer_digestive', name: 'Antacids, Ulcer & Digestive Care', keywords: ['gaviscon', 'omeprazole', 'buscopan', 'gestid', 'ors', 'imodium'] },
        ],
      },
      {
        id: 'vitamins_supplements',
        name: 'Vitamins & Wellness Supplements',
        icon: '🌿',
        enabled: true,
        varieties: [
          { id: 'multivitamins', name: 'Daily Multivitamins (Wellman, Wellwoman, Centrum)', keywords: ['wellman', 'wellwoman', 'multivitamin', 'centrum', 'pregnacare', 'immunace'] },
          { id: 'vitamin_c_immune', name: 'Vitamin C, B-Complex & Zinc', keywords: ['vitamin c', 'b-complex', 'zinc', 'vitamin d', 'reload'] },
          { id: 'omega_minerals', name: 'Omega-3 Fish Oil, Magnesium & Calcium', keywords: ['omega', 'fish oil', 'magnesium', 'calcium', 'glucosamine', 'collagen', 'cod liver'] },
        ],
      },
      {
        id: 'diagnostics_first_aid',
        name: 'BP, Diabetes & Medical Devices',
        icon: '🩺',
        enabled: true,
        varieties: [
          { id: 'bp_diabetes_care', name: 'Blood Pressure & Diabetes Medications (Rx)', keywords: ['amlodipine', 'lisinopril', 'metformin', 'glucophage', 'insulin'] },
          { id: 'monitors_thermometers', name: 'BP Monitors, Glucometers & Thermometers', keywords: ['thermometer', 'bp monitor', 'omron', 'glucometer', 'accu-chek', 'test strip'] },
          { id: 'first_aid_wound', name: 'First Aid, Bandages & Antiseptics', keywords: ['plaster', 'bandage', 'savlon', 'dettol antiseptic', 'spirit', 'cotton wool', 'first aid'] },
        ],
      },
    ],
  },
  {
    id: 'bakery',
    name: 'Bakery & Confectionery',
    shortName: 'Bakery',
    description: 'Bread, cakes and pastries',
    icon: '🥐',
    coverImage: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=600&q=75',
    badgeColor: '#B45309',
    defaultStoreType: 'bakery',
    allowedStoreTypes: ['bakery', 'supermarket'],
    enabledForCustomers: true,
    enabledForMerchants: true,
    isRegulated: false,
    order: 7,
    subcategories: [
      {
        id: 'bread',
        name: 'Fresh Bread & Loaves',
        icon: '🍞',
        enabled: true,
        varieties: [
          { id: 'sliced_bread', name: 'Soft Sliced Family & Butter Bread', keywords: ['sliced bread', 'butter bread', 'family loaf', 'bread'] },
          { id: 'agege_coconut_bread', name: 'Agege Bread, Coconut & Sardine Bread', keywords: ['agege bread', 'coconut bread', 'sardine bread', 'brioche'] },
          { id: 'wheat_sourdough', name: 'Whole Wheat, Multigrain & Sourdough', keywords: ['wheat bread', 'sourdough', 'baguette', 'rye'] },
        ],
      },
      {
        id: 'cakes',
        name: 'Cakes, Slices & Banana Bread',
        icon: '🎂',
        enabled: true,
        varieties: [
          { id: 'celebration_cakes', name: 'Birthday & Celebration Cakes', keywords: ['birthday cake', 'celebration cake', 'chocolate cake', 'red velvet cake', 'cake'] },
          { id: 'banana_bread_cupcakes', name: 'Banana Bread, Muffins & Cupcakes', keywords: ['banana bread', 'cupcake', 'muffin', 'pound cake'] },
        ],
      },
      {
        id: 'pastries_pies',
        name: 'Meat Pies, Doughnuts & Pastries',
        icon: '🥟',
        enabled: true,
        varieties: [
          { id: 'meat_pies', name: 'Meat Pies, Chicken Pies & Sausage Rolls', keywords: ['meat pie', 'chicken pie', 'sausage roll', 'scotch egg', 'fish roll'] },
          { id: 'doughnuts_croissants', name: 'Doughnuts, Croissants & Chin-Chin', keywords: ['doughnut', 'donut', 'croissant', 'pastry', 'chin chin', 'waffle'] },
        ],
      },
    ],
  },
  {
    id: 'grains_foodstuff',
    name: 'Grains & Foodstuff',
    shortName: 'Foodstuff',
    description: 'Rice, beans, garri and bulk food items',
    icon: '🌾',
    coverImage: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=600&q=75',
    badgeColor: '#7C2D12',
    defaultStoreType: 'foodstuff_dealer',
    allowedStoreTypes: ['foodstuff_dealer', 'supermarket', 'provision_store'],
    enabledForCustomers: true,
    enabledForMerchants: true,
    isRegulated: false,
    order: 8,
    subcategories: [
      {
        id: 'rice',
        name: 'Rice (Bags, Basmati & Local)',
        icon: '🍚',
        enabled: true,
        varieties: [
          { id: 'parboiled_rice', name: 'Long Grain Parboiled Rice (50kg / 25kg / 10kg / 5kg)', keywords: ['parboiled rice', 'mama gold', 'royal stallion', 'big bull', 'rice 50kg', 'rice 25kg', 'rice 10kg', 'rice 5kg', 'bag of rice'] },
          { id: 'basmati_ofada', name: 'Basmati Rice, Jasmine & Ofada Rice', keywords: ['basmati', 'jasmine rice', 'ofada', 'abakaliki rice', 'brown rice'] },
        ],
      },
      {
        id: 'beans_grains',
        name: 'Beans, Maize & Millet',
        icon: '🫘',
        enabled: true,
        varieties: [
          { id: 'beans', name: 'Oloyin Honey Beans & Brown/White Beans', keywords: ['oloyin', 'honey beans', 'brown beans', 'white beans', 'beans', 'peeled beans'] },
          { id: 'maize_millet', name: 'Maize, Millet, Sorghum (Guinea Corn) & Acha', keywords: ['maize', 'corn', 'millet', 'sorghum', 'guinea corn', 'acha', 'fonio', 'pap', 'ogi'] },
        ],
      },
      {
        id: 'garri_swallow_flours',
        name: 'Garri, Yam Flour & Swallow',
        icon: '🥣',
        enabled: true,
        varieties: [
          { id: 'garri', name: 'Ijebu White Garri & Yellow Garri', keywords: ['garri', 'ijebu garri', 'yellow garri'] },
          { id: 'yam_flour', name: 'Poundo Yam & Amala Yam Flour (Elubo)', keywords: ['poundo yam', 'yam flour', 'elubo', 'amala', 'ayoola'] },
          { id: 'semo_wheat_cassava', name: 'Semovita, Semolina, Wheat & Plantain Flour', keywords: ['semovita', 'semolina', 'wheat flour', 'plantain flour', 'cassava flour', 'fufu'] },
        ],
      },
      {
        id: 'tubers_palm_oil_soups',
        name: 'Yam Tubers, Palm Oil & Soup Seeds',
        icon: '🍠',
        enabled: true,
        varieties: [
          { id: 'yam_potatoes', name: 'Pona Yam Tubers, Sweet & Irish Potatoes', keywords: ['yam tuber', 'pona yam', 'benue yam', 'sweet potato', 'irish potato', 'cocoyam'] },
          { id: 'palm_oil_egusi_ogbono', name: 'Red Palm Oil, Egusi, Ogbono & Banga', keywords: ['palm oil', 'groundnut oil', 'egusi', 'melon seed', 'ogbono', 'achi', 'banga', 'iru', 'locust bean', 'cameroon pepper'] },
        ],
      },
    ],
  },
  // --- EXPANSION DEPARTMENTS (Dynamic & Admin-Controllable) ---
  {
    id: 'drinks_beverages',
    name: 'Drinks & Beverages',
    shortName: 'Drinks',
    description: 'Water, soft drinks, juices, malt and fine wines',
    icon: '🍾',
    coverImage: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=600&q=75',
    badgeColor: '#7C3AED',
    defaultStoreType: 'drinks_cellar',
    allowedStoreTypes: ['drinks_cellar', 'supermarket', 'provision_store'],
    enabledForCustomers: true,
    enabledForMerchants: true,
    isRegulated: false,
    isExpansionDepartment: true,
    order: 9,
    subcategories: [
      {
        id: 'water_soft_drinks',
        name: 'Water, Soft Drinks & Malt',
        icon: '🥤',
        enabled: true,
        varieties: [
          { id: 'table_water', name: 'Bottled Water & Sparkling Water', keywords: ['eva water', 'aquafina', 'nestle water', 'sparkling water', 'pellegrino', 'perrier', 'table water'] },
          { id: 'soft_drinks_malt', name: 'Coca-Cola, Fanta, Sprite, Pepsi & Malt', keywords: ['coca-cola', 'coke', 'fanta', 'sprite', 'pepsi', 'maltina', 'amstel', 'malta', 'schweppes', 'chapman', 'energy drink', 'red bull', 'monster'] },
          { id: 'fruit_juices', name: 'Chivita, 5 Alive, Ceres & Fresh Juices', keywords: ['chivita', '5 alive', 'ceres', 'ribena', 'lucozade', 'juice', 'smoothie', 'hollandia yoghurt'] },
        ],
      },
      {
        id: 'wines_spirits',
        name: 'Cellar, Wines & Non-Alcoholic Wine',
        icon: '🍷',
        enabled: true,
        varieties: [
          { id: 'non_alcoholic_wines', name: 'Chamdor, Pure Heaven, Eva & Sparkling Grape', keywords: ['chamdor', 'pure heaven', 'veleta', 'j&w', 'non-alcoholic'] },
          { id: 'wines_champagne_spirits', name: 'Red/White Wine, Champagne & Spirits', keywords: ['wine', 'champagne', 'moet', 'veuve', 'hennessy', 'whisky', 'cognac', 'johnnie walker', 'baileys', 'gin', 'vodka', 'beer', 'heineken', 'guinness'] },
        ],
      },
    ],
  },
  {
    id: 'household_personal_care',
    name: 'Household, Beauty & Baby Care',
    shortName: 'Household & Care',
    description: 'Cleaning supplies, toiletries, skincare and baby products',
    icon: '🧴',
    coverImage: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=600&q=75',
    badgeColor: '#0F766E',
    defaultStoreType: 'supermarket',
    allowedStoreTypes: ['supermarket', 'provision_store', 'pharmacy'],
    enabledForCustomers: true,
    enabledForMerchants: true,
    isRegulated: false,
    isExpansionDepartment: true,
    order: 10,
    subcategories: [
      {
        id: 'household_cleaning',
        name: 'Detergents, Tissue & Cleaning',
        icon: '🧼',
        enabled: true,
        varieties: [
          { id: 'detergents_laundry', name: 'Ariel, Omo, SoKlin & Fabric Softeners', keywords: ['ariel', 'omo', 'soklin', 'sunlight', 'detergent', 'hypo', 'jik', 'bleach', 'comfort'] },
          { id: 'dishwashing_insecticides', name: 'Morning Fresh, Harpic, Air Freshener & Insecticide', keywords: ['morning fresh', 'mama lemon', 'harpic', 'izel', 'dettol', 'sniper', 'baygon', 'raid', 'mortein', 'air wick'] },
          { id: 'tissue_foil_trashbags', name: 'Toilet Tissue, Serviettes, Foil & Cling Film', keywords: ['tissue', 'toilet roll', 'rose Carla', 'serviette', 'kitchen towel', 'foil', 'cling film'] },
        ],
      },
      {
        id: 'personal_care_beauty',
        name: 'Skincare, Bath & Oral Care',
        icon: '✨',
        enabled: true,
        varieties: [
          { id: 'body_lotion_skincare', name: 'Nivea, Vaseline, Cerave & Face Care', keywords: ['nivea', 'vaseline', 'cerave', 'cetaphil', 'lotion', 'cream', 'cleanser', 'sunscreen', 'serum', 'bio-oil'] },
          { id: 'soaps_deodorants_oral', name: 'Bath Soaps, Shower Gel, Toothpaste & Deodorants', keywords: ['dove', 'imperial leather', 'premier cool', 'shower gel', 'soap', 'sensodyne', 'colgate', 'oral-b', 'close up', 'mouthwash', 'listerine', 'deodorant', 'roll-on', 'sure', 'rexona', 'pad', 'always'] },
        ],
      },
      {
        id: 'baby_care',
        name: 'Baby Formula, Diapers & Wipes',
        icon: '👶',
        enabled: true,
        varieties: [
          { id: 'baby_formula_cereal', name: 'SMA, NAN, Peak Baby & Cerelac', keywords: ['sma', 'nan', 'cerelac', 'nutribom', 'cow & gate', 'friso', 'infant', 'baby food'] },
          { id: 'diapers_wipes', name: 'Pampers, Huggies, Molfix Diapers & Baby Wipes', keywords: ['pampers', 'huggies', 'molfix', 'kisskids', 'diaper', 'wipes', 'pears', 'johnson baby'] },
        ],
      },
    ],
  },
  {
    id: 'frozen_foods',
    name: 'Frozen Foods',
    shortName: 'Frozen Foods',
    description: 'Frozen fries, ice cream, cold cuts and frozen vegetables',
    icon: '❄️',
    coverImage: 'https://images.unsplash.com/photo-1563805042-7684c019e1cb?auto=format&fit=crop&w=600&q=75',
    badgeColor: '#0369A1',
    defaultStoreType: 'supermarket',
    allowedStoreTypes: ['supermarket', 'butcher', 'poultry_shop'],
    enabledForCustomers: false, // Pre-seeded expansion department: Admin can enable with 1 tap!
    enabledForMerchants: true,
    isRegulated: false,
    isExpansionDepartment: true,
    order: 11,
    subcategories: [
      {
        id: 'frozen_chips_snacks',
        name: 'Frozen Fries, Spring Rolls & Nuggets',
        icon: '🍟',
        enabled: true,
        varieties: [
          { id: 'frozen_french_fries', name: 'Frozen French Fries & Potato Wedges', keywords: ['french fries', 'frozen chips', 'potato wedge'] },
          { id: 'chicken_nuggets_rolls', name: 'Chicken Nuggets, Samosas & Spring Rolls', keywords: ['nuggets', 'samosa', 'spring roll'] },
        ],
      },
      {
        id: 'ice_cream_desserts',
        name: 'Ice Cream & Frozen Desserts',
        icon: '🍨',
        enabled: true,
        varieties: [
          { id: 'ice_cream_tubs', name: 'Cold Stone, Haagen-Dazs & FanIce Tubs', keywords: ['ice cream', 'fanice', 'supreme ice cream', 'gelato'] },
        ],
      },
    ],
  },
];

/**
 * Ensures every node in storeTypes, productSpotlights, and departments (including subcategories & varieties)
 * exposes both `.name` and `.label` (plus `.title`/`.label` and `.subtitle`/`.tagline` on spotlights)
 * so any consumer or cached payload works without undefined property errors.
 */
export function normalizeTaxonomyCatalog(raw) {
  const storeTypes = Array.isArray(raw?.storeTypes) ? raw.storeTypes : DEFAULT_STORE_TYPES;
  let productSpotlights = Array.isArray(raw?.productSpotlights)
    ? [...raw.productSpotlights]
    : Array.isArray(raw?.spotlights)
      ? [...raw.spotlights]
      : [...DEFAULT_PRODUCT_SPOTLIGHTS];
  const departments = Array.isArray(raw?.departments) ? raw.departments : DEFAULT_MARKETPLACE_DEPARTMENTS;

  if (!productSpotlights.some((sp) => sp && (sp.id === 'spot-all-supermarkets' || sp.departmentId === 'all'))) {
    productSpotlights = [DEFAULT_PRODUCT_SPOTLIGHTS[0], ...productSpotlights];
  } else if (productSpotlights[0]?.departmentId !== 'all') {
    const allCard = productSpotlights.find((sp) => sp && sp.departmentId === 'all') || DEFAULT_PRODUCT_SPOTLIGHTS[0];
    productSpotlights = [allCard, ...productSpotlights.filter((sp) => sp && sp.departmentId !== 'all')];
  }

  storeTypes.forEach((st) => {
    if (!st) return;
    st.name = st.name || st.label || st.pluralName || 'Store';
    st.pluralName = st.pluralName || st.label || st.name;
    st.label = st.label || st.pluralName || st.name;
  });

  productSpotlights.forEach((sp) => {
    if (!sp) return;
    sp.title = sp.title || sp.label || sp.name || 'Spotlight';
    sp.label = sp.label || sp.title;
    sp.subtitle = sp.subtitle || sp.tagline || '';
    sp.tagline = sp.tagline || sp.subtitle || '';
  });

  departments.forEach((d) => {
    if (!d) return;
    d.name = d.name || d.label || 'Department';
    d.label = d.label || d.name;
    d.coverImage = d.coverImage || d.heroImage || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80';
    d.heroImage = d.heroImage || d.coverImage;
    if (Array.isArray(d.subcategories)) {
      d.subcategories.forEach((s) => {
        if (!s) return;
        s.name = s.name || s.label || 'Subcategory';
        s.label = s.label || s.name;
        if (Array.isArray(s.varieties)) {
          s.varieties.forEach((v) => {
            if (!v) return;
            v.name = v.name || v.label || 'Variety';
            v.label = v.label || v.name;
          });
        }
      });
    }
  });

  return {
    version: raw?.version || '3.0.0',
    updatedAt: raw?.updatedAt || '2026-11-06T00:00:00.000Z',
    storeTypes,
    productSpotlights,
    departments,
  };
}

export const DEFAULT_MARKETPLACE_TAXONOMY = normalizeTaxonomyCatalog({
  version: '3.0.0',
  updatedAt: '2026-11-06T00:00:00.000Z',
  storeTypes: DEFAULT_STORE_TYPES,
  productSpotlights: DEFAULT_PRODUCT_SPOTLIGHTS,
  departments: DEFAULT_MARKETPLACE_DEPARTMENTS,
});

/**
 * Automatically classifies any product (by name, category, subcategory, description)
 * into the 3-level GETIT taxonomy: { departmentId, departmentName, departmentIcon, subcategoryId, subcategoryName, subcategoryLabel, varietyId, varietyName, varietyLabel, icon, isRegulated }
 */
export function classifyProductIntoTaxonomy(product, taxonomy = DEFAULT_MARKETPLACE_TAXONOMY) {
  if (!product) {
    return {
      departmentId: 'grocery',
      departmentName: 'Grocery & Provisions',
      departmentLabel: 'Grocery & Provisions',
      departmentIcon: '🛒',
      subcategoryId: 'cooking_pantry',
      subcategoryName: 'Cooking Oils & Pantry',
      subcategoryLabel: 'Cooking Oils & Pantry',
      varietyId: 'seasoning_spices',
      varietyName: 'General Provisions',
      varietyLabel: 'General Provisions',
      icon: '🛍️',
      isRegulated: false,
    };
  }

  const depts = taxonomy?.departments || DEFAULT_MARKETPLACE_DEPARTMENTS;

  // 1. If product already has explicit valid departmentId & subcategoryId, enrich and return
  if (product.departmentId) {
    const matchedDept = depts.find((d) => d.id === product.departmentId);
    if (matchedDept) {
      const matchedSub =
        (matchedDept.subcategories || []).find((s) => s.id === product.subcategoryId) ||
        (matchedDept.subcategories || [])[0];
      const matchedVar =
        (matchedSub?.varieties || []).find((v) => v.id === product.varietyId) ||
        (matchedSub?.varieties || [])[0];
      const subName = matchedSub?.name || matchedSub?.label || matchedDept.name || matchedDept.label;
      const varName = matchedVar?.name || matchedVar?.label || product.name || matchedDept.name;
      return {
        departmentId: matchedDept.id,
        departmentName: matchedDept.name || matchedDept.label,
        departmentLabel: matchedDept.label || matchedDept.name,
        departmentIcon: matchedDept.icon || '🛍️',
        subcategoryId: matchedSub?.id || 'general',
        subcategoryName: subName,
        subcategoryLabel: subName,
        varietyId: matchedVar?.id || 'general',
        varietyName: varName,
        varietyLabel: varName,
        icon: product.icon || matchedSub?.icon || matchedDept.icon || '🛍️',
        isRegulated: Boolean(matchedDept.isRegulated),
      };
    }
  }

  const haystack = `${product.name || ''} ${product.category || ''} ${product.subcategory || ''} ${product.description || ''}`.toLowerCase();
  const catLower = String(product.category || '').toLowerCase();

  // 2. Check Pharmacy first if category explicitly indicates pharmacy/medication
  if (
    catLower.includes('pharm') ||
    catLower.includes('medicat') ||
    catLower.includes('drug') ||
    catLower.includes('rx') ||
    String(product.id || '').startsWith('hmed-rx')
  ) {
    const pharmDept = depts.find((d) => d.id === 'pharmacy') || DEFAULT_MARKETPLACE_DEPARTMENTS[5];
    for (const sub of pharmDept.subcategories || []) {
      for (const v of sub.varieties || []) {
        if ((v.keywords || []).some((kw) => haystack.includes(kw.toLowerCase()))) {
          const subName = sub.name || sub.label;
          const varName = v.name || v.label;
          return {
            departmentId: 'pharmacy',
            departmentName: pharmDept.name || pharmDept.label,
            departmentLabel: pharmDept.label || pharmDept.name,
            departmentIcon: pharmDept.icon || '💊',
            subcategoryId: sub.id,
            subcategoryName: subName,
            subcategoryLabel: subName,
            varietyId: v.id,
            varietyName: varName,
            varietyLabel: varName,
            icon: product.icon || sub.icon || '💊',
            isRegulated: true,
          };
        }
      }
    }
    const fallbackSub = pharmDept.subcategories[1] || pharmDept.subcategories[0];
    const fbSubName = fallbackSub?.name || fallbackSub?.label || 'Medications & Care';
    const fbVarName = fallbackSub?.varieties?.[0]?.name || fallbackSub?.varieties?.[0]?.label || 'Pharmacy Product';
    return {
      departmentId: 'pharmacy',
      departmentName: pharmDept.name || pharmDept.label,
      departmentLabel: pharmDept.label || pharmDept.name,
      departmentIcon: pharmDept.icon || '💊',
      subcategoryId: fallbackSub?.id || 'pain_cough_digestive',
      subcategoryName: fbSubName,
      subcategoryLabel: fbSubName,
      varietyId: fallbackSub?.varieties?.[0]?.id || 'pain_fever_relief',
      varietyName: fbVarName,
      varietyLabel: fbVarName,
      icon: product.icon || '💊',
      isRegulated: true,
    };
  }

  // 3. Scan non-pharmacy departments by keyword specificity (Meat, Fish, Vegetables, Fruits, Bakery, Foodstuff, Drinks, Household, Grocery)
  const priorityOrder = [
    'meat_poultry',
    'fish_seafood',
    'vegetables',
    'fruits',
    'bakery',
    'grains_foodstuff',
    'drinks_beverages',
    'household_personal_care',
    'frozen_foods',
    'grocery',
  ];

  const orderedDepts = [
    ...priorityOrder.map((id) => depts.find((d) => d.id === id)).filter(Boolean),
    ...depts.filter((d) => d.id !== 'pharmacy' && !priorityOrder.includes(d.id)),
  ];

  for (const dept of orderedDepts) {
    for (const sub of dept.subcategories || []) {
      for (const v of sub.varieties || []) {
        if ((v.keywords || []).some((kw) => haystack.includes(kw.toLowerCase()))) {
          const subName = sub.name || sub.label;
          const varName = v.name || v.label;
          return {
            departmentId: dept.id,
            departmentName: dept.name || dept.label,
            departmentLabel: dept.label || dept.name,
            departmentIcon: dept.icon || '🛍️',
            subcategoryId: sub.id,
            subcategoryName: subName,
            subcategoryLabel: subName,
            varietyId: v.id,
            varietyName: varName,
            varietyLabel: varName,
            icon: product.icon || sub.icon || dept.icon || '🛍️',
            isRegulated: Boolean(dept.isRegulated),
          };
        }
      }
    }
  }

  // 4. Fallback to Grocery & Provisions
  const grocDept = depts.find((d) => d.id === 'grocery') || DEFAULT_MARKETPLACE_DEPARTMENTS[0];
  const grocSub = grocDept.subcategories?.[0];
  const grocSubName = grocSub?.name || grocSub?.label || 'Groceries & Provisions';
  const grocVarName = grocSub?.varieties?.[0]?.name || grocSub?.varieties?.[0]?.label || 'Provisions';
  return {
    departmentId: grocDept.id,
    departmentName: grocDept.name || grocDept.label,
    departmentLabel: grocDept.label || grocDept.name,
    departmentIcon: grocDept.icon || '🛒',
    subcategoryId: grocSub?.id || 'cooking_pantry',
    subcategoryName: grocSubName,
    subcategoryLabel: grocSubName,
    varietyId: grocSub?.varieties?.[0]?.id || 'general',
    varietyName: grocVarName,
    varietyLabel: grocVarName,
    icon: product.icon || '🛍️',
    isRegulated: false,
  };
}

/**
 * Infers a store's taxonomy profile (primaryDepartmentId, storeType, additionalDepartmentIds,
 * specialisationSubcategories, specialisationProducts) from its metadata + inventory products.
 */
export function normalizeStoreTaxonomyProfile(store, taxonomy = DEFAULT_MARKETPLACE_TAXONOMY) {
  if (!store) return {};
  const depts = taxonomy?.departments || DEFAULT_MARKETPLACE_DEPARTMENTS;
  const storeTypes = taxonomy?.storeTypes || DEFAULT_STORE_TYPES;

  const rawCat = String(store.category || store.categoryLabel || '').toLowerCase();
  const rawName = String(store.name || '').toLowerCase();
  const rawType = String(store.storeType || store.store_type || '').toLowerCase();

  const isPharm =
    rawType === 'pharmacy' ||
    rawCat.includes('pharm') ||
    rawName.includes('pharm') ||
    Boolean(store.pharmacist);

  let primaryDepartmentId =
    store.primaryDepartmentId && store.primaryDepartmentId !== 'grocery'
      ? store.primaryDepartmentId
      : null;
  let normalizedStoreType =
    store.storeTypeFormat ||
    store.storeTypeCategory ||
    store.storeFormat ||
    (rawType && rawType !== 'grocery' ? rawType : null);

  if (isPharm) {
    primaryDepartmentId = 'pharmacy';
    normalizedStoreType = 'pharmacy';
  } else {
    if (
      normalizedStoreType === 'butcher' ||
      rawType === 'butcher' ||
      rawCat.includes('meat') ||
      rawCat.includes('butcher') ||
      rawName.includes('butcher') ||
      rawName.includes('meat')
    ) {
      primaryDepartmentId = primaryDepartmentId || 'meat_poultry';
      normalizedStoreType = normalizedStoreType || 'butcher';
    } else if (
      normalizedStoreType === 'poultry_shop' ||
      rawType === 'poultry_shop' ||
      rawCat.includes('poultry') ||
      rawName.includes('poultry')
    ) {
      primaryDepartmentId = primaryDepartmentId || 'meat_poultry';
      normalizedStoreType = normalizedStoreType || 'poultry_shop';
    } else if (
      normalizedStoreType === 'vegetable_vendor' ||
      rawType === 'vegetable_vendor' ||
      rawCat.includes('vegetable') ||
      rawCat.includes('veggie') ||
      rawName.includes('vegetable') ||
      rawName.includes('veggie')
    ) {
      primaryDepartmentId = primaryDepartmentId || 'vegetables';
      normalizedStoreType = normalizedStoreType || 'vegetable_vendor';
    } else if (
      normalizedStoreType === 'fruit_vendor' ||
      rawType === 'fruit_vendor' ||
      rawCat.includes('fruit') ||
      rawName.includes('fruit')
    ) {
      primaryDepartmentId = primaryDepartmentId || 'fruits';
      normalizedStoreType = normalizedStoreType || 'fruit_vendor';
    } else if (
      normalizedStoreType === 'fish_market' ||
      rawType === 'fish_market' ||
      rawCat.includes('fish') ||
      rawCat.includes('seafood') ||
      rawName.includes('fish') ||
      rawName.includes('seafood')
    ) {
      primaryDepartmentId = primaryDepartmentId || 'fish_seafood';
      normalizedStoreType = normalizedStoreType || 'fish_market';
    } else if (
      normalizedStoreType === 'bakery' ||
      rawType === 'bakery' ||
      rawCat.includes('bakery') ||
      rawCat.includes('bread') ||
      rawName.includes('bakery') ||
      rawName.includes('crumb')
    ) {
      primaryDepartmentId = primaryDepartmentId || 'bakery';
      normalizedStoreType = normalizedStoreType || 'bakery';
    } else if (
      normalizedStoreType === 'foodstuff_dealer' ||
      rawType === 'foodstuff_dealer' ||
      rawCat.includes('foodstuff') ||
      rawCat.includes('grain') ||
      rawCat.includes('heritage') ||
      rawName.includes('foodstuff') ||
      rawName.includes('grains')
    ) {
      primaryDepartmentId = primaryDepartmentId || 'grains_foodstuff';
      normalizedStoreType = normalizedStoreType || 'foodstuff_dealer';
    } else if (
      normalizedStoreType === 'drinks_cellar' ||
      rawType === 'drinks_cellar' ||
      rawCat.includes('cellar') ||
      rawCat.includes('wine') ||
      rawCat.includes('drink') ||
      rawName.includes('cellar')
    ) {
      primaryDepartmentId = primaryDepartmentId || 'drinks_beverages';
      normalizedStoreType = normalizedStoreType || 'drinks_cellar';
    } else if (
      normalizedStoreType === 'supermarket' ||
      rawType === 'supermarket' ||
      rawName.includes('mega') ||
      rawName.includes('supermarket') ||
      rawName.includes('hypermarket') ||
      rawName.includes('emporium') ||
      rawName.includes('stores') ||
      rawCat.includes('supermarket') ||
      rawCat.includes('hypermarket')
    ) {
      primaryDepartmentId = primaryDepartmentId || 'grocery';
      primaryDepartmentId = primaryDepartmentId || store.primaryDepartmentId || 'grocery';
      normalizedStoreType = 'supermarket';
    } else if (
      normalizedStoreType === 'provision_store' ||
      rawType === 'provision_store' ||
      rawName.includes('provision') ||
      rawName.includes('mini-mart') ||
      rawName.includes('minimart') ||
      rawCat.includes('provision')
    ) {
      primaryDepartmentId = primaryDepartmentId || 'grocery';
      primaryDepartmentId = primaryDepartmentId || store.primaryDepartmentId || 'grocery';
      normalizedStoreType = 'provision_store';
    } else {
      primaryDepartmentId = primaryDepartmentId || 'grocery';
      primaryDepartmentId = primaryDepartmentId || store.primaryDepartmentId || 'grocery';
      normalizedStoreType = normalizedStoreType && normalizedStoreType !== 'grocery' ? normalizedStoreType : 'provision_store';
    }
  }

  if (!normalizedStoreType || normalizedStoreType === 'grocery') {
    const matchedDept = depts.find((d) => d.id === primaryDepartmentId);
    normalizedStoreType = matchedDept?.defaultStoreType || 'supermarket';
  }

  // Collect departments, subcategories, and varieties from actual in-stock inventory + declared specialisations
  const deptSet = new Set([primaryDepartmentId, ...(Array.isArray(store.additionalDepartmentIds) ? store.additionalDepartmentIds : [])]);
  const subSet = new Set(Array.isArray(store.specialisationSubcategories) ? store.specialisationSubcategories : []);
  const varSet = new Set(Array.isArray(store.specialisationProducts) ? store.specialisationProducts : []);

  const products = Array.isArray(store.products) ? store.products : [];
  products.forEach((p) => {
    if (p && !p.outOfStock) {
      const cls = classifyProductIntoTaxonomy(p, taxonomy);
      if (cls.departmentId) deptSet.add(cls.departmentId);
      if (cls.subcategoryId) subSet.add(cls.subcategoryId);
      if (cls.varietyId) varSet.add(cls.varietyId);
    }
  });

  // If a specialist store has no explicit subcategories yet, default to its primary department's subcategories
  const primaryDeptObj = depts.find((d) => d.id === primaryDepartmentId);
  if (subSet.size === 0 && primaryDeptObj) {
    (primaryDeptObj.subcategories || []).forEach((s) => subSet.add(s.id));
  }

  const storeTypeObj = storeTypes.find((st) => st.id === normalizedStoreType) || storeTypes[1];

  return {
    primaryDepartmentId,
    primaryDepartmentName: primaryDeptObj?.name || 'Grocery & Provisions',
    storeTypeFormat: normalizedStoreType,
    storeTypeLabel: store.storeTypeLabel || storeTypeObj?.name || primaryDeptObj?.name || 'Partner Store',
    badgeLabel: storeTypeObj?.badgeLabel || store.tag || 'VERIFIED MERCHANT',
    badgeColor: storeTypeObj?.badgeColor || primaryDeptObj?.badgeColor || '#056B4B',
    additionalDepartmentIds: Array.from(deptSet).filter((id) => id !== primaryDepartmentId),
    allDepartmentIds: Array.from(deptSet),
    specialisationSubcategories: Array.from(subSet),
    specialisationProducts: Array.from(varSet),
    isRegulatedPharmacy: isPharm,
    regulatoryStatus: store.regulatoryStatus || (isPharm ? 'verified' : 'not_applicable'),
  };
}

/**
 * Evaluates whether a store matches the customer's active 3-level filter or store-type filter,
 * and returns any matching products in the store's inventory for instant preview on the store card.
 */
export function evaluateStoreAgainstTaxonomyFilter(
  store,
  {
    browseMode = 'product', // 'product' (Option A) | 'store_type' (Option B)
    departmentId = 'all',
    subcategoryId = 'all',
    varietyId = 'all',
    storeTypeId = 'all',
    storeTypeFilter = 'all',
    searchQuery = '',
  } = {},
  taxonomy = DEFAULT_MARKETPLACE_TAXONOMY
) {
  const profile = normalizeStoreTaxonomyProfile(store, taxonomy);
  const products = Array.isArray(store.products) ? store.products : [];
  const q = (searchQuery || '').trim().toLowerCase();
  const activeStoreType =
    storeTypeId && storeTypeId !== 'all'
      ? storeTypeId
      : storeTypeFilter && storeTypeFilter !== 'all'
        ? storeTypeFilter
        : 'all';

  let matchingProducts = [];

  // 1. Check Option B: Store Type filter
  if (browseMode === 'store_type') {
    if (activeStoreType !== 'all') {
      const matchesStoreType =
        profile.storeTypeFormat === activeStoreType ||
        (activeStoreType === 'supermarket' && profile.storeTypeFormat === 'supermarket') ||
        (activeStoreType === 'provision_store' &&
          (profile.storeTypeFormat === 'provision_store' ||
            (profile.primaryDepartmentId === 'grocery' && profile.storeTypeFormat !== 'supermarket'))) ||
        (activeStoreType === 'butcher' &&
          (profile.storeTypeFormat === 'butcher' ||
            (profile.primaryDepartmentId === 'meat_poultry' &&
              profile.specialisationSubcategories.some((s) => ['goat_meat', 'beef', 'ram_sheep'].includes(s))))) ||
        (activeStoreType === 'poultry_shop' &&
          (profile.storeTypeFormat === 'poultry_shop' ||
            (profile.primaryDepartmentId === 'meat_poultry' &&
              profile.specialisationSubcategories.includes('poultry')))) ||
        (activeStoreType === 'vegetable_vendor' &&
          (profile.storeTypeFormat === 'vegetable_vendor' || profile.primaryDepartmentId === 'vegetables')) ||
        (activeStoreType === 'fruit_vendor' &&
          (profile.storeTypeFormat === 'fruit_vendor' ||
            profile.primaryDepartmentId === 'fruits' ||
            (profile.storeTypeFormat === 'vegetable_vendor' && profile.allDepartmentIds.includes('fruits')))) ||
        (activeStoreType === 'fish_market' &&
          (profile.storeTypeFormat === 'fish_market' || profile.primaryDepartmentId === 'fish_seafood')) ||
        (activeStoreType === 'bakery' &&
          (profile.storeTypeFormat === 'bakery' || profile.primaryDepartmentId === 'bakery')) ||
        (activeStoreType === 'foodstuff_dealer' &&
          (profile.storeTypeFormat === 'foodstuff_dealer' || profile.primaryDepartmentId === 'grains_foodstuff')) ||
        (activeStoreType === 'drinks_cellar' &&
          (profile.storeTypeFormat === 'drinks_cellar' || profile.primaryDepartmentId === 'drinks_beverages'));

      if (!matchesStoreType) {
        return { matches: false, matchingProducts: [], profile };
      }

      const storeTypeObj = (taxonomy?.storeTypes || DEFAULT_STORE_TYPES).find((st) => st.id === activeStoreType);
      const targetDeptId = storeTypeObj?.departmentId;
      matchingProducts = products.filter((p) => {
        if (!p || p.outOfStock) return false;
        if (!targetDeptId || targetDeptId === 'all') return true;
        const cls = classifyProductIntoTaxonomy(p, taxonomy);
        if (activeStoreType === 'poultry_shop') return cls.subcategoryId === 'poultry';
        if (activeStoreType === 'butcher') return ['goat_meat', 'beef', 'ram_sheep'].includes(cls.subcategoryId);
        return cls.departmentId === targetDeptId;
      });
      if (matchingProducts.length === 0) {
        matchingProducts = products.filter((p) => p && !p.outOfStock).slice(0, 4);
      }
    }
  } else if (departmentId && departmentId !== 'all') {
    // 2. Check Option A: 3-Level Department -> Subcategory -> Variety filter
    const hasDepartment =
      profile.primaryDepartmentId === departmentId ||
      profile.allDepartmentIds.includes(departmentId);

    // Filter products in this store that match the selected department / subcategory / variety
    matchingProducts = products.filter((p) => {
      if (!p || p.outOfStock) return false;
      const cls = classifyProductIntoTaxonomy(p, taxonomy);
      if (cls.departmentId !== departmentId) return false;
      if (subcategoryId && subcategoryId !== 'all' && cls.subcategoryId !== subcategoryId) {
        return false;
      }
      if (varietyId && varietyId !== 'all' && cls.varietyId !== varietyId) {
        return false;
      }
      return true;
    });

    const hasDeclaredSpecialisation =
      (!subcategoryId || subcategoryId === 'all'
        ? hasDepartment
        : profile.specialisationSubcategories.includes(subcategoryId)) &&
      (!varietyId || varietyId === 'all'
        ? true
        : profile.specialisationProducts.includes(varietyId));

    // A store matches if it either stocks matching products OR explicitly specialises in the selected category/subcategory
    if (matchingProducts.length === 0 && !hasDeclaredSpecialisation) {
      return { matches: false, matchingProducts: [], profile };
    }
  }

  // 3. Check search query (if entered by customer)
  if (q.length > 0) {
    const nameMatch =
      (store.name || '').toLowerCase().includes(q) ||
      (store.description || '').toLowerCase().includes(q) ||
      (store.district || '').toLowerCase().includes(q) ||
      (profile.storeTypeLabel || '').toLowerCase().includes(q) ||
      (profile.primaryDepartmentName || '').toLowerCase().includes(q);

    const queryProducts = products.filter((p) => {
      if (!p) return false;
      const cls = classifyProductIntoTaxonomy(p, taxonomy);
      return (
        (p.name || '').toLowerCase().includes(q) ||
        (p.category || '').toLowerCase().includes(q) ||
        (cls.subcategoryName || '').toLowerCase().includes(q) ||
        (cls.varietyName || '').toLowerCase().includes(q)
      );
    });

    if (queryProducts.length > 0) {
      matchingProducts = queryProducts;
    }

    if (!nameMatch && queryProducts.length === 0) {
      return { matches: false, matchingProducts: [], profile };
    }
  }

  return {
    matches: true,
    matchingProducts: matchingProducts.slice(0, 6),
    profile,
  };
}

// --- Removed Test Showcase Store IDs (auto-purged from local cache on load) ---
export const REMOVED_TEST_STORE_IDS = [
  'store-butcher-mahmud-abj',
  'store-veg-fruit-jos-abj',
  'store-seafood-atlantic-abj',
  'store-foodstuff-ayoms-abj',
  'store-provision-swiftmart-abj',
  'store-poultry-zuma-abj',
  'store-bakery-crust-abj',
  'store-cellar-maitama-abj',
  'store-1794007983242',
];

export const SPECIALIST_SHOWCASE_STORES = [];

// --- Curated Category-Specific Store Cover Image Library (for Registration & Storefront) ---
export const CATEGORY_STORE_COVER_GALLERY = {
  grocery: [
    {
      id: 'cov-groc-1',
      title: 'Modern Supermarket Aisle',
      url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-groc-2',
      title: 'Neighbourhood Provision Mart',
      url: 'https://images.unsplash.com/photo-1604719312566-8912e9227c6a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-groc-3',
      title: 'Stocked Grocery & Pantry Shelves',
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-groc-4',
      title: 'Hypermarket & Family Storefront',
      url: 'https://images.unsplash.com/photo-1534723452862-4c874018d66d?auto=format&fit=crop&w=800&q=80',
    },
  ],
  meat_poultry: [
    {
      id: 'cov-meat-1',
      title: 'Prime Butcher & Fresh Meat Counter',
      url: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-meat-2',
      title: 'Fresh Goat Meat & Beef Cuts',
      url: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-meat-3',
      title: 'Artisan Butchery & Steak Display',
      url: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-meat-4',
      title: 'Farm Fresh Poultry, Chicken & Turkey',
      url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-meat-5',
      title: 'Freshly Dressed Ribs & Suya Cuts',
      url: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=800&q=80',
    },
  ],
  vegetables: [
    {
      id: 'cov-veg-1',
      title: 'Fresh Farm Vegetables & Greens Stall',
      url: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-veg-2',
      title: 'Ripe Plum Tomatoes, Peppers & Onions',
      url: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-veg-3',
      title: 'Organic Farmers Market Harvest',
      url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-veg-4',
      title: 'Leafy Greens, Ugwu, Spinach & Salad Veg',
      url: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=800&q=80',
    },
  ],
  fruits: [
    {
      id: 'cov-fruit-1',
      title: 'Tropical Fresh Fruit Market Display',
      url: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-fruit-2',
      title: 'Sweet Watermelon, Pineapple & Citrus',
      url: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-fruit-3',
      title: 'Orchard Apples, Bananas & Mangoes',
      url: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-fruit-4',
      title: 'Exotic Fruit Baskets & Melons',
      url: 'https://images.unsplash.com/photo-1519996529931-28324d5a630e?auto=format&fit=crop&w=800&q=80',
    },
  ],
  fish_seafood: [
    {
      id: 'cov-fish-1',
      title: 'Fresh Fish & Seafood Market Counter',
      url: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-fish-2',
      title: 'Atlantic Croaker, Tilapia & Catfish',
      url: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-fish-3',
      title: 'Jumbo Tiger Prawns, Crayfish & Shellfish',
      url: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-fish-4',
      title: 'Chilled Titus Mackerel & Smoked Fish',
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    },
  ],
  pharmacy: [
    {
      id: 'cov-pharm-1',
      title: 'Licensed Community Pharmacy Dispensary',
      url: 'https://images.unsplash.com/photo-1587854692152-cbe660dbde88?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-pharm-2',
      title: 'Modern Healthcare & Wellness Chemist',
      url: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-pharm-3',
      title: 'Clinical Pharmacist & Prescription Care',
      url: 'https://images.unsplash.com/photo-1576602976047-174e57a47881?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-pharm-4',
      title: 'Medical Supplies & Vitamin Shelves',
      url: 'https://images.unsplash.com/photo-1631549916768-4119b2e5f926?auto=format&fit=crop&w=800&q=80',
    },
  ],
  bakery: [
    {
      id: 'cov-bake-1',
      title: 'Artisan Bakery & Warm Bread Loaves',
      url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-bake-2',
      title: 'Golden Croissants, Doughnuts & Pastries',
      url: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-bake-3',
      title: 'Celebration Cakes & Confectionery Showcase',
      url: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-bake-4',
      title: 'Freshly Baked Meat Pies & Savory Rolls',
      url: 'https://images.unsplash.com/photo-1621996346565-e3d5d6281298?auto=format&fit=crop&w=800&q=80',
    },
  ],
  grains_foodstuff: [
    {
      id: 'cov-grain-1',
      title: 'Nigerian Rice, Beans & Bulk Foodstuff Depot',
      url: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-grain-2',
      title: 'Whole Grains, Oloyin Beans & Garri Sacks',
      url: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-grain-3',
      title: 'Yam Tubers, Swallow Flours & Local Spices',
      url: 'https://images.unsplash.com/photo-1596097635121-14b63b7a0c19?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-grain-4',
      title: 'Traditional Foodstuff & Soup Ingredients',
      url: 'https://images.unsplash.com/photo-1509358271058-acd22cc93898?auto=format&fit=crop&w=800&q=80',
    },
  ],
  drinks_beverages: [
    {
      id: 'cov-drink-1',
      title: 'Drinks Depot, Soft Drinks & Wine Cellar',
      url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-drink-2',
      title: 'Chilled Soft Drinks, Malt & Beverages',
      url: 'https://images.unsplash.com/photo-1622483767028-3f66f32aef97?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-drink-3',
      title: 'Fresh 100% Fruit Juices & Smoothies',
      url: 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-drink-4',
      title: 'Bottled Table Water & Bulk Packs',
      url: 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?auto=format&fit=crop&w=800&q=80',
    },
  ],
  household_personal_care: [
    {
      id: 'cov-house-1',
      title: 'Household, Skincare & Baby Essentials',
      url: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-house-2',
      title: 'Beauty, Personal Care & Toiletries',
      url: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-house-3',
      title: 'Home Cleaning & Laundry Supplies',
      url: 'https://images.unsplash.com/photo-1585421514284-efb74c2b69ba?auto=format&fit=crop&w=800&q=80',
    },
  ],
  frozen_foods: [
    {
      id: 'cov-froz-1',
      title: 'Cold Room & Frozen Foods Mart',
      url: 'https://images.unsplash.com/photo-1544551763-46a013bb70d5?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-froz-2',
      title: 'Frozen Chicken, Turkey & Sausages',
      url: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'cov-froz-3',
      title: 'Ice Cream, Gelato & Frozen Treats',
      url: 'https://images.unsplash.com/photo-1501443762994-82bd5dace89a?auto=format&fit=crop&w=800&q=80',
    },
  ],
};

/**
 * Returns the curated list of cover photo options for a given departmentId and/or storeTypeFormat.
 */
export function getCategoryCoverOptions(departmentId = 'grocery', storeTypeFormat = '') {
  const fmt = String(storeTypeFormat || '').toLowerCase();
  const dept = String(departmentId || '').toLowerCase();

  let targetKey = dept;
  if (fmt === 'butcher' || fmt === 'poultry_shop' || dept === 'meat_poultry') {
    targetKey = 'meat_poultry';
  } else if (fmt === 'vegetable_vendor' || dept === 'vegetables') {
    targetKey = 'vegetables';
  } else if (fmt === 'fruit_vendor' || dept === 'fruits') {
    targetKey = 'fruits';
  } else if (fmt === 'fish_market' || dept === 'fish_seafood') {
    targetKey = 'fish_seafood';
  } else if (fmt === 'bakery' || dept === 'bakery') {
    targetKey = 'bakery';
  } else if (fmt === 'foodstuff_dealer' || dept === 'grains_foodstuff') {
    targetKey = 'grains_foodstuff';
  } else if (fmt === 'pharmacy' || dept === 'pharmacy') {
    targetKey = 'pharmacy';
  } else if (fmt === 'drinks_cellar' || dept === 'drinks_beverages') {
    targetKey = 'drinks_beverages';
  } else if (dept === 'household_personal_care') {
    targetKey = 'household_personal_care';
  } else if (dept === 'frozen_foods') {
    targetKey = 'frozen_foods';
  } else {
    targetKey = 'grocery';
  }

  const primaryList = (CATEGORY_STORE_COVER_GALLERY[targetKey] || CATEGORY_STORE_COVER_GALLERY.grocery).map((item) => ({
    ...item,
    label: item.label || item.title,
  }));
  if (fmt === 'poultry_shop' && targetKey === 'meat_poultry') {
    const poultryFirst = primaryList.find((x) => x.id === 'cov-meat-4');
    if (poultryFirst) {
      return [poultryFirst, ...primaryList.filter((x) => x.id !== 'cov-meat-4')];
    }
  }
  if (fmt === 'provision_store' && targetKey === 'grocery') {
    const provFirst = primaryList.find((x) => x.id === 'cov-groc-2');
    if (provFirst) {
      return [provFirst, ...primaryList.filter((x) => x.id !== 'cov-groc-2')];
    }
  }
  return primaryList;
}

/**
 * Returns the default category-appropriate cover photo URL for a store or department.
 */
export function getDefaultStoreCoverImage(departmentId = 'grocery', storeTypeFormat = '', storeName = '') {
  const nameLower = String(storeName || '').toLowerCase();
  let effectiveDept = departmentId;
  let effectiveFmt = storeTypeFormat;

  if (!effectiveFmt && !effectiveDept) {
    if (nameLower.includes('butcher') || nameLower.includes('meat')) {
      effectiveDept = 'meat_poultry';
      effectiveFmt = 'butcher';
    } else if (nameLower.includes('poultry') || nameLower.includes('chicken')) {
      effectiveDept = 'meat_poultry';
      effectiveFmt = 'poultry_shop';
    } else if (nameLower.includes('veg')) {
      effectiveDept = 'vegetables';
      effectiveFmt = 'vegetable_vendor';
    } else if (nameLower.includes('fruit')) {
      effectiveDept = 'fruits';
      effectiveFmt = 'fruit_vendor';
    } else if (nameLower.includes('fish') || nameLower.includes('seafood')) {
      effectiveDept = 'fish_seafood';
      effectiveFmt = 'fish_market';
    } else if (nameLower.includes('bake') || nameLower.includes('bread')) {
      effectiveDept = 'bakery';
      effectiveFmt = 'bakery';
    } else if (nameLower.includes('grain') || nameLower.includes('foodstuff')) {
      effectiveDept = 'grains_foodstuff';
      effectiveFmt = 'foodstuff_dealer';
    } else if (nameLower.includes('pharm')) {
      effectiveDept = 'pharmacy';
      effectiveFmt = 'pharmacy';
    }
  }

  const options = getCategoryCoverOptions(effectiveDept, effectiveFmt);
  return options[0]?.url || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80';
}

// ============================================================================
// 5. SPECIALIST DEPARTMENT SUGGESTED PRODUCT CATALOGS
// ============================================================================
export const SPECIALIST_DEPARTMENT_CATALOG = {
  meat_poultry: [
    {
      id: 'spec-meat-01',
      name: 'Fresh Goat Meat — Prime Shoulder & Leg Cut (1kg)',
      category: 'Goat Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'goat_meat',
      varietyId: 'fresh_goat_meat',
      brand: 'Fresh Halal Butchery',
      icon: '🐐',
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 8500,
      priceRange: '₦7,800 - ₦9,500',
      description: 'Clean, skin-on fresh Nigerian goat meat cut into medium pot pieces for pepper soup and stew.',
    },
    {
      id: 'spec-meat-02',
      name: 'Spicy Asun & Goat Ribs Cut (1kg)',
      category: 'Goat Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'goat_meat',
      varietyId: 'goat_ribs',
      brand: 'Fresh Halal Butchery',
      icon: '🐐',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 9000,
      priceRange: '₦8,200 - ₦10,000',
      description: 'Tender rib and loin cuts of young goat, fire-singed and prepped for smoky Asun or grilling.',
    },
    {
      id: 'spec-meat-03',
      name: 'Cleaned Whole Goat Head — Isi Ewu Special',
      category: 'Goat Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'goat_meat',
      varietyId: 'goat_head',
      brand: 'Fresh Halal Butchery',
      icon: '🐐',
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 7500,
      priceRange: '₦6,500 - ₦8,500',
      description: 'Thoroughly singed, washed and chopped whole goat head ready for traditional Isi Ewu or pepper soup.',
    },
    {
      id: 'spec-meat-04',
      name: 'Goat Offal & Assorted Ngwongwo Pack (1kg)',
      category: 'Goat Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'goat_meat',
      varietyId: 'goat_offal',
      brand: 'Fresh Halal Butchery',
      icon: '🍲',
      imageUrl: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6800,
      priceRange: '₦6,000 - ₦7,500',
      description: 'Cleaned goat tripe, intestine, liver and kidney pack for authentic goat meat pepper soup.',
    },
    {
      id: 'spec-meat-05',
      name: 'Prime Boneless Cow Beef — Lean Steak Cut (1kg)',
      category: 'Beef / Cow Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'beef',
      varietyId: 'cow_meat',
      brand: 'Abuja Prime Meat',
      icon: '🥩',
      imageUrl: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 7800,
      priceRange: '₦7,000 - ₦8,800',
      description: '100% lean boneless red beef cut fresh daily for stews, stir-fry, suya and family meals.',
    },
    {
      id: 'spec-meat-06',
      name: 'Fresh Cow Meat with Bone — Brisket & Shin (1kg)',
      category: 'Beef / Cow Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'beef',
      varietyId: 'cow_meat',
      brand: 'Abuja Prime Meat',
      icon: '🥩',
      imageUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6800,
      priceRange: '₦6,200 - ₦7,500',
      description: 'Flavorful bone-in Nigerian cow meat cubes ideal for rich native soups and party stews.',
    },
    {
      id: 'spec-meat-07',
      name: 'Beef Short Ribs & Prime Rib Cut (1kg)',
      category: 'Beef / Cow Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'beef',
      varietyId: 'beef_ribs',
      brand: 'Abuja Prime Meat',
      icon: '🍖',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 7500,
      priceRange: '₦6,800 - ₦8,500',
      description: 'Meaty beef short ribs cut across the bone for grilling, roasting or slow-braised stews.',
    },
    {
      id: 'spec-meat-08',
      name: 'Fresh Cow Liver (1kg)',
      category: 'Beef / Cow Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'beef',
      varietyId: 'beef_liver',
      brand: 'Abuja Prime Meat',
      icon: '🥩',
      imageUrl: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6500,
      priceRange: '₦5,800 - ₦7,200',
      description: 'Nutrient-rich fresh beef liver, ideal for fried rice, liver sauce and iron-rich meals.',
    },
    {
      id: 'spec-meat-09',
      name: 'Cleaned Shaki (Beef Tripe / Towel) — 1kg',
      category: 'Beef / Cow Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'beef',
      varietyId: 'beef_intestines',
      brand: 'Abuja Prime Meat',
      icon: '🍲',
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6200,
      priceRange: '₦5,500 - ₦7,000',
      description: 'Thoroughly washed and scraped honeycomb beef tripe (Shaki) for egusi, ogbono and assorted stews.',
    },
    {
      id: 'spec-meat-10',
      name: 'Cleaned Cow Foot (Bokoto / Nkwobi Cut) — 1kg',
      category: 'Beef / Cow Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'beef',
      varietyId: 'beef_intestines',
      brand: 'Abuja Prime Meat',
      icon: '🍖',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6500,
      priceRange: '₦5,800 - ₦7,200',
      description: 'Singed, washed and neatly chopped cow leg (Bokoto) for Nkwobi, pepper soup and native soups.',
    },
    {
      id: 'spec-meat-11',
      name: 'Cleaned Thick Brown Ponmo (Cow Skin — 8 Large Pieces)',
      category: 'Beef / Cow Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'beef',
      varietyId: 'beef_intestines',
      brand: 'Abuja Prime Meat',
      icon: '🥩',
      imageUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 3500,
      priceRange: '₦3,000 - ₦4,200',
      description: 'Soft, thick Ijebu brown Ponmo (cow skin), sand-free and ready to cook in efo riro or peppered sauce.',
    },
    {
      id: 'spec-meat-12',
      name: 'Fresh Lean Minced Beef (500g Pack)',
      category: 'Beef / Cow Meat',
      departmentId: 'meat_poultry',
      subcategoryId: 'beef',
      varietyId: 'minced_beef',
      brand: 'Abuja Prime Meat',
      icon: '🥩',
      imageUrl: 'https://images.unsplash.com/photo-1551028150-64b9f398f678?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 4500,
      priceRange: '₦4,000 - ₦5,200',
      description: 'Freshly ground lean beef mince for meat pies, spaghetti bolognese, meatballs and burgers.',
    },
    {
      id: 'spec-meat-13',
      name: 'Fresh Northern Ram Meat — Prime Cut (1kg)',
      category: 'Ram & Sheep',
      departmentId: 'meat_poultry',
      subcategoryId: 'ram_sheep',
      varietyId: 'ram_meat',
      brand: 'Arewa Halal Meats',
      icon: '🐏',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 9200,
      priceRange: '₦8,500 - ₦10,500',
      description: 'Succulent, well-marbled fresh ram meat prized for suya, balangu, grilling and festive stews.',
    },
    {
      id: 'spec-meat-14',
      name: 'Tender Sheep / Mutton Cut (1kg)',
      category: 'Ram & Sheep',
      departmentId: 'meat_poultry',
      subcategoryId: 'ram_sheep',
      varietyId: 'sheep_meat',
      brand: 'Arewa Halal Meats',
      icon: '🐑',
      imageUrl: 'https://images.unsplash.com/photo-1607623814075-e51df1bdc82f?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 8400,
      priceRange: '₦7,800 - ₦9,200',
      description: 'Soft, flavorful sheep meat cubes cut for curries, pepper soup and slow-cooked rice dishes.',
    },
    {
      id: 'spec-meat-15',
      name: 'Ram Ribs & Balangu Grill Rack (1kg)',
      category: 'Ram & Sheep',
      departmentId: 'meat_poultry',
      subcategoryId: 'ram_sheep',
      varietyId: 'ram_ribs',
      brand: 'Arewa Halal Meats',
      icon: '🍖',
      imageUrl: 'https://images.unsplash.com/photo-1544025162-d76694265947?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 9500,
      priceRange: '₦8,800 - ₦10,500',
      description: 'Juicy ram rib chops cut for open-flame roasting, balangu and suya platters.',
    },
    {
      id: 'spec-meat-16',
      name: 'Whole Dressed Farm Broiler Chicken (1.8kg - 2kg)',
      category: 'Chicken, Turkey & Poultry',
      departmentId: 'meat_poultry',
      subcategoryId: 'poultry',
      varietyId: 'whole_chicken',
      brand: 'Zuma Farm Poultry',
      icon: '🍗',
      imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 8500,
      priceRange: '₦7,500 - ₦9,500',
      description: 'Plump, freshly dressed whole broiler chicken with giblets, cleaned and cut to your preference.',
    },
    {
      id: 'spec-meat-17',
      name: 'Tough Old Layer / Native Boiler Chicken (Whole)',
      category: 'Chicken, Turkey & Poultry',
      departmentId: 'meat_poultry',
      subcategoryId: 'poultry',
      varietyId: 'whole_chicken',
      brand: 'Zuma Farm Poultry',
      icon: '🐓',
      imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 7800,
      priceRange: '₦7,000 - ₦8,500',
      description: 'Firm, flavorful old layer hen that holds its texture in boiling soups, chicken stew and pepper soup.',
    },
    {
      id: 'spec-meat-18',
      name: 'Fresh Chicken Wings (1kg Pack)',
      category: 'Chicken, Turkey & Poultry',
      departmentId: 'meat_poultry',
      subcategoryId: 'poultry',
      varietyId: 'chicken_wings',
      brand: 'Zuma Farm Poultry',
      icon: '🍗',
      imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6800,
      priceRange: '₦6,000 - ₦7,500',
      description: 'Cleaned whole chicken wings ready for frying, barbecue glazing or spicy peri-peri grilling.',
    },
    {
      id: 'spec-meat-19',
      name: 'Boneless Skinless Chicken Breast Fillet (1kg)',
      category: 'Chicken, Turkey & Poultry',
      departmentId: 'meat_poultry',
      subcategoryId: 'poultry',
      varietyId: 'chicken_breast',
      brand: 'Zuma Farm Poultry',
      icon: '🍗',
      imageUrl: 'https://images.unsplash.com/photo-1604503468506-a8da13d82791?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 7500,
      priceRange: '₦6,800 - ₦8,200',
      description: 'Tender, high-protein boneless chicken breast fillets for shawarma, stir-fry, salads and grilling.',
    },
    {
      id: 'spec-meat-20',
      name: 'Chicken Drumsticks & Laps (1kg)',
      category: 'Chicken, Turkey & Poultry',
      departmentId: 'meat_poultry',
      subcategoryId: 'poultry',
      varietyId: 'whole_chicken',
      brand: 'Zuma Farm Poultry',
      icon: '🍗',
      imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6500,
      priceRange: '₦5,800 - ₦7,200',
      description: 'Meaty chicken laps and drumsticks ideal for jollof rice sides, roasting and deep frying.',
    },
    {
      id: 'spec-meat-21',
      name: 'Jumbo Turkey Wings (1kg)',
      category: 'Chicken, Turkey & Poultry',
      departmentId: 'meat_poultry',
      subcategoryId: 'poultry',
      varietyId: 'turkey',
      brand: 'Zuma Farm Poultry',
      icon: '🦃',
      imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 9200,
      priceRange: '₦8,500 - ₦10,200',
      description: 'Meaty jumbo turkey wings cut for peppered turkey, rich stews and oven grilling.',
    },
    {
      id: 'spec-meat-22',
      name: 'Cleaned Chicken Gizzard (1kg Pack)',
      category: 'Chicken, Turkey & Poultry',
      departmentId: 'meat_poultry',
      subcategoryId: 'poultry',
      varietyId: 'whole_chicken',
      brand: 'Zuma Farm Poultry',
      icon: '🍢',
      imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6200,
      priceRange: '₦5,500 - ₦7,000',
      description: 'Peeled and washed chicken gizzards ready for gizdodo (gizzard & plantain), skewers and fried rice.',
    },
    {
      id: 'spec-meat-23',
      name: 'Whole Dressed Farm Duck (2kg)',
      category: 'Chicken, Turkey & Poultry',
      departmentId: 'meat_poultry',
      subcategoryId: 'poultry',
      varietyId: 'duck',
      brand: 'Zuma Farm Poultry',
      icon: '🦆',
      imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 12500,
      priceRange: '₦11,000 - ₦14,000',
      description: 'Rich, succulent whole dressed duck for roasting and specialty pepper soup.',
    },
    {
      id: 'spec-meat-24',
      name: 'Fresh Pork Loin Chops & Spare Ribs (1kg)',
      category: 'Pork & Specialty Cuts',
      departmentId: 'meat_poultry',
      subcategoryId: 'pork',
      varietyId: 'pork_cuts',
      brand: 'Abuja Specialty Meats',
      icon: '🥓',
      imageUrl: 'https://images.unsplash.com/photo-1603048297172-c92544798d5a?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 7200,
      priceRange: '₦6,500 - ₦8,000',
      description: 'Freshly cut pork loin chops and ribs for barbecue grilling and roasting.',
    },
  ],

  vegetables: [
    {
      id: 'spec-veg-01',
      name: 'Fresh Jos Plum Tomatoes (2kg Basket)',
      category: 'Tomatoes, Peppers & Onions',
      departmentId: 'vegetables',
      subcategoryId: 'tomatoes_peppers',
      varietyId: 'fresh_tomatoes',
      brand: 'Plateau Farm Direct',
      icon: '🍅',
      imageUrl: 'https://images.unsplash.com/photo-1592924357228-91a4daadcfea?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 3500,
      priceRange: '₦2,800 - ₦4,200',
      description: 'Firm, fleshy red Jos plum tomatoes with low water content — ideal for Nigerian stew and jollof base.',
    },
    {
      id: 'spec-veg-02',
      name: 'Fresh Atarodo / Scotch Bonnet Red Peppers (500g)',
      category: 'Tomatoes, Peppers & Onions',
      departmentId: 'vegetables',
      subcategoryId: 'tomatoes_peppers',
      varietyId: 'scotch_bonnet_pepper',
      brand: 'Plateau Farm Direct',
      icon: '🌶️',
      imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1800,
      priceRange: '₦1,400 - ₦2,200',
      description: 'Aromatic, fiery red scotch bonnet peppers (Atarodo) picked fresh from northern farms.',
    },
    {
      id: 'spec-veg-03',
      name: 'Fresh Tatase / Red Bell Peppers (1kg)',
      category: 'Tomatoes, Peppers & Onions',
      departmentId: 'vegetables',
      subcategoryId: 'tomatoes_peppers',
      varietyId: 'scotch_bonnet_pepper',
      brand: 'Plateau Farm Direct',
      icon: '🫑',
      imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 2600,
      priceRange: '₦2,200 - ₦3,200',
      description: 'Sweet, deep-red Tatase bell peppers that give jollof rice and stews their rich crimson color.',
    },
    {
      id: 'spec-veg-04',
      name: 'Fresh Shombo / Long Cayenne Peppers (500g)',
      category: 'Tomatoes, Peppers & Onions',
      departmentId: 'vegetables',
      subcategoryId: 'tomatoes_peppers',
      varietyId: 'scotch_bonnet_pepper',
      brand: 'Plateau Farm Direct',
      icon: '🌶️',
      imageUrl: 'https://images.unsplash.com/photo-1588252303782-cb80119abd6d?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1600,
      priceRange: '₦1,200 - ₦2,000',
      description: 'Long red Shombo peppers for smooth, vibrant and mildly spicy stew blends.',
    },
    {
      id: 'spec-veg-05',
      name: 'Dry Sokoto Purple Onions (2kg Net Bag)',
      category: 'Tomatoes, Peppers & Onions',
      departmentId: 'vegetables',
      subcategoryId: 'tomatoes_peppers',
      varietyId: 'onions',
      brand: 'Sokoto Harvest',
      icon: '🧅',
      imageUrl: 'https://images.unsplash.com/photo-1618512496248-a07fe83aa8cb?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 2500,
      priceRange: '₦2,000 - ₦3,000',
      description: 'Cured, pungent Sokoto red onions with long shelf life and rich sweetness when sautéed.',
    },
    {
      id: 'spec-veg-06',
      name: 'Fresh Ugu / Fluted Pumpkin Leaves (2 Large Bunches)',
      category: 'Leafy Greens & Soup Vegetables',
      departmentId: 'vegetables',
      subcategoryId: 'leafy_greens',
      varietyId: 'ugu_leaves',
      brand: 'GreenHarvest Farm',
      icon: '🥬',
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1500,
      priceRange: '₦1,200 - ₦1,800',
      description: 'Lush, tender dark-green Ugu leaves harvested at dawn — can be delivered whole or pre-sliced.',
    },
    {
      id: 'spec-veg-07',
      name: 'Fresh Spinach / Efo Shoko & Efo Tete (2 Bunches)',
      category: 'Leafy Greens & Soup Vegetables',
      departmentId: 'vegetables',
      subcategoryId: 'leafy_greens',
      varietyId: 'spinach',
      brand: 'GreenHarvest Farm',
      icon: '🥬',
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1200,
      priceRange: '₦1,000 - ₦1,500',
      description: 'Crisp organic spinach and Efo Shoko leaves for Efo Riro, Edikang Ikong and vegetable stir-fry.',
    },
    {
      id: 'spec-veg-08',
      name: 'Fresh Ewedu / Jute Leaves (3 Bunches)',
      category: 'Leafy Greens & Soup Vegetables',
      departmentId: 'vegetables',
      subcategoryId: 'leafy_greens',
      varietyId: 'spinach',
      brand: 'GreenHarvest Farm',
      icon: '🌿',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1000,
      priceRange: '₦800 - ₦1,300',
      description: 'Picked tender Ewedu leaves ready for blending into smooth Ewedu soup with Gbegiri and Amala.',
    },
    {
      id: 'spec-veg-09',
      name: 'Washed Bitterleaf / Onugbu (Clean Ready-to-Cook Pack)',
      category: 'Leafy Greens & Soup Vegetables',
      departmentId: 'vegetables',
      subcategoryId: 'leafy_greens',
      varietyId: 'bitterleaf_waterleaf',
      brand: 'GreenHarvest Farm',
      icon: '🥬',
      imageUrl: 'https://images.unsplash.com/photo-1576045057995-568f588f82fb?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1400,
      priceRange: '₦1,100 - ₦1,700',
      description: 'Traditionally squeezed and washed fresh bitterleaf for Ofe Onugbu and Egusi soup.',
    },
    {
      id: 'spec-veg-10',
      name: 'Fresh Waterleaf / Gbure (2 Large Bunches)',
      category: 'Leafy Greens & Soup Vegetables',
      departmentId: 'vegetables',
      subcategoryId: 'leafy_greens',
      varietyId: 'bitterleaf_waterleaf',
      brand: 'GreenHarvest Farm',
      icon: '🌱',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1200,
      priceRange: '₦1,000 - ₦1,500',
      description: 'Succulent fresh waterleaf essential for Afang soup, Edikang Ikong and fisherman soup.',
    },
    {
      id: 'spec-veg-11',
      name: 'Crunchy Plateau Carrots (1kg Pack)',
      category: 'Carrots, Cabbage & Salad Veggies',
      departmentId: 'vegetables',
      subcategoryId: 'root_salad_veg',
      varietyId: 'carrots',
      brand: 'Jos Cold-Chain Produce',
      icon: '🥕',
      imageUrl: 'https://images.unsplash.com/photo-1598170845058-32b9d6a5da37?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1800,
      priceRange: '₦1,500 - ₦2,200',
      description: 'Sweet, bright-orange Jos carrots washed and packed for fried rice, coleslaw and juicing.',
    },
    {
      id: 'spec-veg-12',
      name: 'Fresh Green & Purple Cabbage (Large Firm Head)',
      category: 'Carrots, Cabbage & Salad Veggies',
      departmentId: 'vegetables',
      subcategoryId: 'root_salad_veg',
      varietyId: 'cabbage',
      brand: 'Jos Cold-Chain Produce',
      icon: '🥬',
      imageUrl: 'https://images.unsplash.com/photo-1594282486552-05b4d80fbb9f?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1600,
      priceRange: '₦1,300 - ₦2,000',
      description: 'Crisp, tightly packed Jos cabbage head for Nigerian party salad, shawarma and stir-fry.',
    },
    {
      id: 'spec-veg-13',
      name: 'Fresh English Cucumbers (1kg / 4 Large Pieces)',
      category: 'Carrots, Cabbage & Salad Veggies',
      departmentId: 'vegetables',
      subcategoryId: 'root_salad_veg',
      varietyId: 'cucumber',
      brand: 'Jos Cold-Chain Produce',
      icon: '🥒',
      imageUrl: 'https://images.unsplash.com/photo-1604977042946-1eecc30f269e?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1500,
      priceRange: '₦1,200 - ₦1,800',
      description: 'Cool, crunchy dark-green cucumbers for fresh salads, detox water and healthy snacking.',
    },
    {
      id: 'spec-veg-14',
      name: 'Crisp Iceberg Lettuce & Salad Greens',
      category: 'Carrots, Cabbage & Salad Veggies',
      departmentId: 'vegetables',
      subcategoryId: 'root_salad_veg',
      varietyId: 'cabbage',
      brand: 'Jos Cold-Chain Produce',
      icon: '🥗',
      imageUrl: 'https://images.unsplash.com/photo-1622206151226-18ca2c9ab4a1?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1500,
      priceRange: '₦1,200 - ₦1,800',
      description: 'Hydroponic and highland crisp lettuce leaves for fresh salads, wraps and burgers.',
    },
    {
      id: 'spec-veg-15',
      name: 'Green Bell Peppers, Sweet Peas & Runner Beans Mix (1kg)',
      category: 'Carrots, Cabbage & Salad Veggies',
      departmentId: 'vegetables',
      subcategoryId: 'root_salad_veg',
      varietyId: 'carrots',
      brand: 'Jos Cold-Chain Produce',
      icon: '🫑',
      imageUrl: 'https://images.unsplash.com/photo-1563565375-f3fdfdbefa83?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 2400,
      priceRange: '₦2,000 - ₦2,800',
      description: 'Complete fried-rice vegetable combo: green bell peppers, runner green beans and sweet peas.',
    },
    {
      id: 'spec-veg-16',
      name: 'Fresh Tender Okra Fingers (500g Bowl)',
      category: 'Fresh Herbs, Okra & Bulbs',
      departmentId: 'vegetables',
      subcategoryId: 'herbs_aromatics',
      varietyId: 'scent_leaf_garlic_ginger',
      brand: 'GreenHarvest Farm',
      icon: '🌿',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1400,
      priceRange: '₦1,100 - ₦1,700',
      description: 'Snap-fresh young green okra pods for rich seafood okra and ilasa soup.',
    },
    {
      id: 'spec-veg-17',
      name: 'Scent Leaf (Efirin / Nchanwu), Uziza & Curry Leaf Bundle',
      category: 'Fresh Herbs, Okra & Bulbs',
      departmentId: 'vegetables',
      subcategoryId: 'herbs_aromatics',
      varietyId: 'scent_leaf_garlic_ginger',
      brand: 'GreenHarvest Farm',
      icon: '🌿',
      imageUrl: 'https://images.unsplash.com/photo-1540420773420-3366772f4999?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1000,
      priceRange: '₦800 - ₦1,300',
      description: 'Fragrant Nigerian culinary herbs for pepper soup, jollof rice and native delicacies.',
    },
    {
      id: 'spec-veg-18',
      name: 'Fresh Kaduna Ginger & Garlic Bulbs Combo (500g)',
      category: 'Fresh Herbs, Okra & Bulbs',
      departmentId: 'vegetables',
      subcategoryId: 'herbs_aromatics',
      varietyId: 'scent_leaf_garlic_ginger',
      brand: 'Kaduna Spice Farms',
      icon: '🧄',
      imageUrl: 'https://images.unsplash.com/photo-1615485290382-441e4d049cb5?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1800,
      priceRange: '₦1,500 - ₦2,200',
      description: 'Aromatic fresh ginger rhizomes and plump garlic bulbs for marinades, zobo and healthy teas.',
    },
  ],

  fruits: [
    {
      id: 'spec-frt-01',
      name: 'Sweet Benue Juicy Oranges (Bag of 12)',
      category: 'Citrus, Apples & Bananas',
      departmentId: 'fruits',
      subcategoryId: 'everyday_fruits',
      varietyId: 'orange',
      brand: 'Benue Citrus Orchards',
      icon: '🍊',
      imageUrl: 'https://images.unsplash.com/photo-1547514701-42782101795e?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 2200,
      priceRange: '₦1,800 - ₦2,600',
      description: 'Thin-skinned, ultra-juicy sweet Benue oranges bursting with natural Vitamin C.',
    },
    {
      id: 'spec-frt-02',
      name: 'Crisp Red Royal Gala Apples (Pack of 6)',
      category: 'Citrus, Apples & Bananas',
      departmentId: 'fruits',
      subcategoryId: 'everyday_fruits',
      varietyId: 'apple',
      brand: 'Orchard Select',
      icon: '🍎',
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 3600,
      priceRange: '₦3,200 - ₦4,200',
      description: 'Crunchy, sweet imported red apples kept chilled for maximum crispness.',
    },
    {
      id: 'spec-frt-03',
      name: 'Green Granny Smith Apples (Pack of 6)',
      category: 'Citrus, Apples & Bananas',
      departmentId: 'fruits',
      subcategoryId: 'everyday_fruits',
      varietyId: 'apple',
      brand: 'Orchard Select',
      icon: '🍏',
      imageUrl: 'https://images.unsplash.com/photo-1560806887-1e4cd0b6cbd6?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 3600,
      priceRange: '₦3,200 - ₦4,200',
      description: 'Refreshing tart-sweet green apples ideal for snacking, fruit salads and green juice.',
    },
    {
      id: 'spec-frt-04',
      name: 'Sweet Ripe Cavendish Bananas (Large Bunch)',
      category: 'Citrus, Apples & Bananas',
      departmentId: 'fruits',
      subcategoryId: 'everyday_fruits',
      varietyId: 'banana',
      brand: 'Tropical Farms',
      icon: '🍌',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 2000,
      priceRange: '₦1,600 - ₦2,500',
      description: 'Naturally ripened creamy sweet bananas — great with groundnuts, smoothies or oats.',
    },
    {
      id: 'spec-frt-05',
      name: 'Sweet Red Seedless Watermelon (Whole Jumbo)',
      category: 'Tropical Melons, Pineapple & Mango',
      departmentId: 'fruits',
      subcategoryId: 'tropical_melons',
      varietyId: 'watermelon',
      brand: 'Kano Sun Melons',
      icon: '🍉',
      imageUrl: 'https://images.unsplash.com/photo-1587049352847-4a222e784d38?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 3200,
      priceRange: '₦2,500 - ₦3,800',
      description: 'Deep-red, sugar-sweet whole watermelon guaranteed ripe and refreshing.',
    },
    {
      id: 'spec-frt-06',
      name: 'Benin Sugar-Loaf Sweet Pineapple (Whole Large)',
      category: 'Tropical Melons, Pineapple & Mango',
      departmentId: 'fruits',
      subcategoryId: 'tropical_melons',
      varietyId: 'pineapple',
      brand: 'Tropical Farms',
      icon: '🍍',
      imageUrl: 'https://images.unsplash.com/photo-1550258987-190a2d41a8ba?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 2400,
      priceRange: '₦2,000 - ₦2,800',
      description: 'Golden, low-acid honey pineapple bursting with tropical sweetness.',
    },
    {
      id: 'spec-frt-07',
      name: 'Ripe Sweet Pawpaw / Papaya (Whole Large)',
      category: 'Tropical Melons, Pineapple & Mango',
      departmentId: 'fruits',
      subcategoryId: 'tropical_melons',
      varietyId: 'pawpaw',
      brand: 'Tropical Farms',
      icon: '🍈',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 2000,
      priceRange: '₦1,600 - ₦2,500',
      description: 'Tree-ripened orange-flesh pawpaw rich in digestive enzymes and vitamins.',
    },
    {
      id: 'spec-frt-08',
      name: 'Sweet Julie & Peter Mangoes (1.5kg Pack)',
      category: 'Tropical Melons, Pineapple & Mango',
      departmentId: 'fruits',
      subcategoryId: 'tropical_melons',
      varietyId: 'mango',
      brand: 'Benue Citrus Orchards',
      icon: '🥭',
      imageUrl: 'https://images.unsplash.com/photo-1553279768-865429fa0078?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 2500,
      priceRange: '₦2,000 - ₦3,000',
      description: 'Fiberless, aromatic sweet mangoes handpicked at peak ripeness.',
    },
    {
      id: 'spec-frt-09',
      name: 'Seedless Crimson Red Grapes (500g Punnet)',
      category: 'Berries, Grapes & Exotic Fruits',
      departmentId: 'fruits',
      subcategoryId: 'berries_exotic',
      varietyId: 'grapes_berries_avocado',
      brand: 'Orchard Select',
      icon: '🍇',
      imageUrl: 'https://images.unsplash.com/photo-1537640538966-79f369143f8f?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 4800,
      priceRange: '₦4,200 - ₦5,500',
      description: 'Chilled, crisp seedless red grapes packed in a protective punnet.',
    },
    {
      id: 'spec-frt-10',
      name: 'Creamy Jos Hass Avocado Pears (Pack of 4)',
      category: 'Berries, Grapes & Exotic Fruits',
      departmentId: 'fruits',
      subcategoryId: 'berries_exotic',
      varietyId: 'grapes_berries_avocado',
      brand: 'Plateau Farm Direct',
      icon: '🥑',
      imageUrl: 'https://images.unsplash.com/photo-1523049673857-eb18f1d7b578?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 2800,
      priceRange: '₦2,400 - ₦3,400',
      description: 'Buttery, nutrient-dense ripe avocados for toast, salads and smoothies.',
    },
    {
      id: 'spec-frt-11',
      name: 'Fresh Highland Strawberries (250g Punnet)',
      category: 'Berries, Grapes & Exotic Fruits',
      departmentId: 'fruits',
      subcategoryId: 'berries_exotic',
      varietyId: 'grapes_berries_avocado',
      brand: 'Plateau Farm Direct',
      icon: '🍓',
      imageUrl: 'https://images.unsplash.com/photo-1464965911861-746a04b4bca6?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 3800,
      priceRange: '₦3,200 - ₦4,500',
      description: 'Sweet, ruby-red fresh Jos strawberries for desserts, parfaits and smoothies.',
    },
    {
      id: 'spec-frt-12',
      name: 'Premium Medjool Dates / Dabino & Fresh Coconuts Combo',
      category: 'Berries, Grapes & Exotic Fruits',
      departmentId: 'fruits',
      subcategoryId: 'berries_exotic',
      varietyId: 'grapes_berries_avocado',
      brand: 'Arewa Naturals',
      icon: '🥥',
      imageUrl: 'https://images.unsplash.com/photo-1610832958506-aa56368176cf?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 3000,
      priceRange: '₦2,500 - ₦3,600',
      description: 'Soft caramel-like dates (Dabino) and crunchy fresh coconuts for tigernut milk and snacking.',
    },
  ],

  fish_seafood: [
    {
      id: 'spec-fish-01',
      name: 'Live Point & Kill Catfish — Cleaned & Cut (1.5kg)',
      category: 'Fresh & Live Fish',
      departmentId: 'fish_seafood',
      subcategoryId: 'fresh_fish',
      varietyId: 'catfish',
      brand: 'Atlantic & River Catch',
      icon: '🐟',
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6800,
      priceRange: '₦6,000 - ₦7,800',
      description: 'Fresh live farm catfish, degutted, slime-washed with alum/lime and cut for catfish pepper soup or barbecue.',
    },
    {
      id: 'spec-fish-02',
      name: 'Fresh Whole Tilapia Fish — Scaled & Gutted (1kg)',
      category: 'Fresh & Live Fish',
      departmentId: 'fish_seafood',
      subcategoryId: 'fresh_fish',
      varietyId: 'tilapia',
      brand: 'Atlantic & River Catch',
      icon: '🐠',
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 5800,
      priceRange: '₦5,200 - ₦6,500',
      description: 'Sweet freshwater whole tilapia, scaled and cleaned for grilling, frying or fish stew.',
    },
    {
      id: 'spec-fish-03',
      name: 'Fresh Atlantic Croaker Fish Steaks (1kg)',
      category: 'Fresh & Live Fish',
      departmentId: 'fish_seafood',
      subcategoryId: 'fresh_fish',
      varietyId: 'croaker',
      brand: 'Atlantic & River Catch',
      icon: '🐟',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 7500,
      priceRange: '₦6,800 - ₦8,500',
      description: 'Firm, flaky white-flesh sea croaker fish cut into steaks for fisherman soup and grilling.',
    },
    {
      id: 'spec-fish-04',
      name: 'Original Titus / Atlantic Mackerel Fish (1kg)',
      category: 'Fresh & Live Fish',
      departmentId: 'fish_seafood',
      subcategoryId: 'fresh_fish',
      varietyId: 'mackerel',
      brand: 'Atlantic & River Catch',
      icon: '🐟',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6500,
      priceRange: '₦5,800 - ₦7,200',
      description: 'Authentic rich, oily original Titus mackerel fish for classic Nigerian fish stew and sauces.',
    },
    {
      id: 'spec-fish-05',
      name: 'Fresh Red Snapper & Barracuda Fillet (1kg)',
      category: 'Fresh & Live Fish',
      departmentId: 'fish_seafood',
      subcategoryId: 'fresh_fish',
      varietyId: 'croaker',
      brand: 'Atlantic & River Catch',
      icon: '🐟',
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 9200,
      priceRange: '₦8,500 - ₦10,500',
      description: 'Wild-caught Atlantic red snapper prized for oven grilling and gourmet seafood okra.',
    },
    {
      id: 'spec-fish-06',
      name: 'Norwegian Cod Stockfish / Okporoko (Jumbo Cut Pack)',
      category: 'Smoked, Dried & Stockfish',
      departmentId: 'fish_seafood',
      subcategoryId: 'smoked_dried_fish',
      varietyId: 'stockfish',
      brand: 'Nordic Traditional',
      icon: '🐟',
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 8500,
      priceRange: '₦7,500 - ₦9,800',
      description: 'Authentic air-dried Norwegian cod stockfish (Okporoko) body & ears for rich native Nigerian soups.',
    },
    {
      id: 'spec-fish-07',
      name: 'Oven-Smoked Dry Mangala & Catfish (4 Large Pieces)',
      category: 'Smoked, Dried & Stockfish',
      departmentId: 'fish_seafood',
      subcategoryId: 'smoked_dried_fish',
      varietyId: 'stockfish',
      brand: 'Lake Chad Smokehouse',
      icon: '🔥',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6000,
      priceRange: '₦5,200 - ₦6,800',
      description: 'Hygienically kiln-smoked, sand-free dry catfish and Mangala fish with deep smoky aroma.',
    },
    {
      id: 'spec-fish-08',
      name: 'Smoked Panla / Hake & Bonga Fish Pack',
      category: 'Smoked, Dried & Stockfish',
      departmentId: 'fish_seafood',
      subcategoryId: 'smoked_dried_fish',
      varietyId: 'stockfish',
      brand: 'Lagos Lagoon Smokehouse',
      icon: '🐟',
      imageUrl: 'https://images.unsplash.com/photo-1534422298391-e4f8c172dddb?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 4800,
      priceRange: '₦4,200 - ₦5,500',
      description: 'Golden smoked Panla (Hake) and deboned Bonga fish for efo riro, egusi and ogbono.',
    },
    {
      id: 'spec-fish-09',
      name: 'Jumbo Atlantic Tiger Prawns — Cleaned (500g)',
      category: 'Prawns, Crayfish & Shellfish',
      departmentId: 'fish_seafood',
      subcategoryId: 'shellfish_prawns',
      varietyId: 'prawns',
      brand: 'Atlantic & River Catch',
      icon: '🦐',
      imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 9500,
      priceRange: '₦8,500 - ₦11,000',
      description: 'Deveined jumbo tiger prawns for seafood okra, special fried rice and garlic butter grilling.',
    },
    {
      id: 'spec-fish-10',
      name: 'Pure Oron Dried Crayfish — Whole & Blended (Big Custard Bowl)',
      category: 'Prawns, Crayfish & Shellfish',
      departmentId: 'fish_seafood',
      subcategoryId: 'shellfish_prawns',
      varietyId: 'crayfish',
      brand: 'Calabar Coastal Market',
      icon: '🦐',
      imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 4500,
      priceRange: '₦3,800 - ₦5,200',
      description: '100% sand-free, aromatic Oron red crayfish that elevates every Nigerian soup and jollof pot.',
    },
    {
      id: 'spec-fish-11',
      name: 'Cleaned Fresh Periwinkle & Lagoon Crabs Combo',
      category: 'Prawns, Crayfish & Shellfish',
      departmentId: 'fish_seafood',
      subcategoryId: 'shellfish_prawns',
      varietyId: 'prawns',
      brand: 'Calabar Coastal Market',
      icon: '🦀',
      imageUrl: 'https://images.unsplash.com/photo-1565680018434-b513d5e5fd47?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 5500,
      priceRange: '₦4,800 - ₦6,500',
      description: 'Trimmed, washed periwinkle and fresh blue crabs for authentic Afang, Edikang Ikong and Seafood Okra.',
    },
  ],

  grains_foodstuff: [
    {
      id: 'spec-grn-01',
      name: 'Royal Stallion Long Grain Parboiled Rice (50kg Full Bag)',
      category: 'Rice, Maize & Grains',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'rice_grains',
      varietyId: 'rice',
      brand: 'Royal Stallion',
      icon: '🍚',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 82000,
      priceRange: '₦78,000 - ₦88,000',
      description: 'Stone-free, non-sticky premium long grain parboiled rice ideal for party jollof and white rice.',
    },
    {
      id: 'spec-grn-02',
      name: 'Mama Gold Parboiled Rice (25kg Half Bag)',
      category: 'Rice, Maize & Grains',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'rice_grains',
      varietyId: 'rice',
      brand: 'Mama Gold',
      icon: '🍚',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 42500,
      priceRange: '₦40,000 - ₦45,000',
      description: 'High-swelling, clean Nigerian parboiled rice packed in a convenient 25kg family bag.',
    },
    {
      id: 'spec-grn-03',
      name: 'Authentic Abeokuta Unpolished Ofada Rice (5kg)',
      category: 'Rice, Maize & Grains',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'rice_grains',
      varietyId: 'rice',
      brand: 'Ayoms Foodstuff',
      icon: '🌾',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 9500,
      priceRange: '₦8,500 - ₦10,800',
      description: 'Destoned, aromatic local Ofada rice ready to pair with spicy Ayamase designer stew.',
    },
    {
      id: 'spec-grn-04',
      name: 'Sweet Oloyin Honey Beans — Handpicked (5kg Bag)',
      category: 'Beans, Garri & Swallow Flours',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'beans_swallow',
      varietyId: 'beans',
      brand: 'Ayoms Foodstuff',
      icon: '🫘',
      imageUrl: 'https://images.unsplash.com/photo-1515543904379-3d757afe72e4?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 8800,
      priceRange: '₦8,000 - ₦9,800',
      description: 'Naturally sweet, fast-cooking brown Oloyin beans for Ewa Agoyin, Moi-Moi, Akara and porridge.',
    },
    {
      id: 'spec-grn-05',
      name: 'Crispy Yellow Ijebu Garri (5kg Bag)',
      category: 'Beans, Garri & Swallow Flours',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'beans_swallow',
      varietyId: 'garri',
      brand: 'Ijebu Heritage',
      icon: '🥣',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 5500,
      priceRange: '₦4,800 - ₦6,200',
      description: 'Fine, crunchy and sour-sweet yellow & white Ijebu garri for smooth Eba or soaking.',
    },
    {
      id: 'spec-grn-06',
      name: 'Ayoola Poundo Yam Flour & Elubo Lafun Combo (4.5kg)',
      category: 'Beans, Garri & Swallow Flours',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'beans_swallow',
      varietyId: 'yam_flour',
      brand: 'Ayoola Foods',
      icon: '🍲',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 9200,
      priceRange: '₦8,500 - ₦10,200',
      description: '100% natural yam flour for lump-free Pounded Yam or authentic dark Amala (Elubo).',
    },
    {
      id: 'spec-grn-07',
      name: 'Golden Penny Semovita (5kg Bag)',
      category: 'Beans, Garri & Swallow Flours',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'beans_swallow',
      varietyId: 'yam_flour',
      brand: 'Golden Penny',
      icon: '🌾',
      imageUrl: 'https://images.unsplash.com/photo-1586201375761-83865001e31c?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6800,
      priceRange: '₦6,200 - ₦7,500',
      description: 'Fortified golden wheat semolina swallow that cooks smooth and light in 5 minutes.',
    },
    {
      id: 'spec-grn-08',
      name: 'Benue Puna White Yam Tubers (Set of 3 Large Tubers)',
      category: 'Yams, Tubers & Cooking Oils',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'tubers_yam',
      varietyId: 'yam_potato_plantain',
      brand: 'Zaki-Biam Harvest',
      icon: '🍠',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 9000,
      priceRange: '₦7,800 - ₦10,500',
      description: 'Dry, mealy and sweet Benue Puna yams for pounded yam, fried yam chips and asaro porridge.',
    },
    {
      id: 'spec-grn-09',
      name: 'Jos Irish Potatoes & Sweet Potatoes (3kg Basket)',
      category: 'Yams, Tubers & Cooking Oils',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'tubers_yam',
      varietyId: 'yam_potato_plantain',
      brand: 'Plateau Farm Direct',
      icon: '🥔',
      imageUrl: 'https://images.unsplash.com/photo-1518977676601-b53f82aba655?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 4200,
      priceRange: '₦3,600 - ₦4,800',
      description: 'Clean highland Irish potatoes for homemade fries, mash and potato porridge.',
    },
    {
      id: 'spec-grn-10',
      name: 'Ripe & Unripe Agbagba Plantain (Large Bunch)',
      category: 'Yams, Tubers & Cooking Oils',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'tubers_yam',
      varietyId: 'yam_potato_plantain',
      brand: 'Ondo Farm Direct',
      icon: '🍌',
      imageUrl: 'https://images.unsplash.com/photo-1571771894821-ce9b6c11b08e?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 3800,
      priceRange: '₦3,200 - ₦4,500',
      description: 'Jumbo fingers of sweet ripe plantain (for Dodo & Boli) or unripe green plantain.',
    },
    {
      id: 'spec-grn-11',
      name: 'Hand-Peeled Egusi (Melon Seeds) & Ogbono Seeds Pack',
      category: 'Yams, Tubers & Cooking Oils',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'rice_grains',
      varietyId: 'maize_millet',
      brand: 'Ayoms Foodstuff',
      icon: '🥣',
      imageUrl: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 5200,
      priceRange: '₦4,500 - ₦6,000',
      description: 'Clean, creamy hand-peeled Egusi melon seeds and high-draw Ogbono bush mango seeds.',
    },
    {
      id: 'spec-grn-12',
      name: 'Pure Unadulterated Ondo Red Palm Oil (4 Litre Keg)',
      category: 'Yams, Tubers & Cooking Oils',
      departmentId: 'grains_foodstuff',
      subcategoryId: 'tubers_yam',
      varietyId: 'yam_potato_plantain',
      brand: 'Ondo Farm Direct',
      icon: '🛢️',
      imageUrl: 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 7800,
      priceRange: '₦7,000 - ₦8,800',
      description: 'First-press, sweet-smelling village red palm oil (Epo Pupa) for beans, banga and native soups.',
    },
  ],

  bakery: [
    {
      id: 'spec-bak-01',
      name: 'Warm Soft Agege Stretchy Family Bread (Large Loaf)',
      category: 'Fresh Bread & Loaves',
      departmentId: 'bakery',
      subcategoryId: 'bakery_bread',
      varietyId: 'bread',
      brand: 'Artisan Oven',
      icon: '🍞',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1600,
      priceRange: '₦1,400 - ₦1,900',
      description: 'Pillowy soft, freshly baked traditional Agege bread — irresistible with Ewa Agoyin or Akara.',
    },
    {
      id: 'spec-bak-02',
      name: 'Premium Sliced Milk & Butter Family Loaf',
      category: 'Fresh Bread & Loaves',
      departmentId: 'bakery',
      subcategoryId: 'bakery_bread',
      varietyId: 'bread',
      brand: 'Artisan Oven',
      icon: '🍞',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 1800,
      priceRange: '₦1,500 - ₦2,200',
      description: 'Thick-sliced golden milk and butter loaf baked fresh every morning for breakfast toast and sandwiches.',
    },
    {
      id: 'spec-bak-03',
      name: 'Rich Coconut & Sardine Brioche Bread',
      category: 'Fresh Bread & Loaves',
      departmentId: 'bakery',
      subcategoryId: 'bakery_bread',
      varietyId: 'bread',
      brand: 'Artisan Oven',
      icon: '🥖',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 2400,
      priceRange: '₦2,000 - ₦2,800',
      description: 'Toasted coconut flakes or savory sardine stuffed inside a golden-glazed brioche loaf.',
    },
    {
      id: 'spec-bak-04',
      name: 'Whole Wheat & Multi-Grain Healthy Loaf',
      category: 'Fresh Bread & Loaves',
      departmentId: 'bakery',
      subcategoryId: 'bakery_bread',
      varietyId: 'bread',
      brand: 'Artisan Oven',
      icon: '🍞',
      imageUrl: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 2200,
      priceRange: '₦1,800 - ₦2,600',
      description: 'High-fiber, low-sugar 100% stone-ground whole wheat bread topped with rolled oats.',
    },
    {
      id: 'spec-bak-05',
      name: 'Golden Baked Nigerian Beef Meat Pies (Box of 4)',
      category: 'Meat Pies, Doughnuts & Pastries',
      departmentId: 'bakery',
      subcategoryId: 'pastries_pies',
      varietyId: 'meat_pies',
      brand: 'Crust & Crumb Bakery',
      icon: '🥟',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 4800,
      priceRange: '₦4,200 - ₦5,500',
      description: 'Buttery shortcrust pastry generously filled with seasoned minced beef, Irish potatoes and carrots.',
    },
    {
      id: 'spec-bak-06',
      name: 'Flaky Creamy Chicken Pies & Sausage Rolls (Box of 4)',
      category: 'Meat Pies, Doughnuts & Pastries',
      departmentId: 'bakery',
      subcategoryId: 'pastries_pies',
      varietyId: 'meat_pies',
      brand: 'Crust & Crumb Bakery',
      icon: '🥐',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 4800,
      priceRange: '₦4,200 - ₦5,500',
      description: 'Warm puff-pastry sausage rolls and creamy shredded chicken pies baked fresh throughout the day.',
    },
    {
      id: 'spec-bak-07',
      name: 'Fluffy Sugar-Glazed & Jam Ring Doughnuts (Box of 6)',
      category: 'Meat Pies, Doughnuts & Pastries',
      departmentId: 'bakery',
      subcategoryId: 'pastries_pies',
      varietyId: 'doughnuts',
      brand: 'Crust & Crumb Bakery',
      icon: '🍩',
      imageUrl: 'https://images.unsplash.com/photo-1551024709-8f23befc6f87?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 4200,
      priceRange: '₦3,600 - ₦5,000',
      description: ' melt-in-your-mouth ring doughnuts and strawberry jam-filled Berliner doughnuts.',
    },
    {
      id: 'spec-bak-08',
      name: 'French All-Butter Croissants & Pain au Chocolat (Pack of 4)',
      category: 'Meat Pies, Doughnuts & Pastries',
      departmentId: 'bakery',
      subcategoryId: 'pastries_pies',
      varietyId: 'pastries',
      brand: 'Crust & Crumb Bakery',
      icon: '🥐',
      imageUrl: 'https://images.unsplash.com/photo-1555507036-ab1f4038808a?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 5200,
      priceRange: '₦4,500 - ₦6,000',
      description: 'Crisp, laminated French butter croissants and dark chocolate-filled pastries.',
    },
    {
      id: 'spec-bak-09',
      name: 'Rich Chocolate Fudge & Red Velvet Celebration Cake (8-Inch)',
      category: 'Cakes & Celebration Desserts',
      departmentId: 'bakery',
      subcategoryId: 'cakes_desserts',
      varietyId: 'cakes',
      brand: 'Crust & Crumb Bakery',
      icon: '🎂',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 18500,
      priceRange: '₦15,000 - ₦22,000',
      description: 'Decadent triple-layer celebration cake frosted with Belgian chocolate ganache or cream cheese.',
    },
    {
      id: 'spec-bak-10',
      name: 'Moist Banana & Walnut Loaf + Crunchy Chin-Chin Jar',
      category: 'Cakes & Celebration Desserts',
      departmentId: 'bakery',
      subcategoryId: 'cakes_desserts',
      varietyId: 'cakes',
      brand: 'Crust & Crumb Bakery',
      icon: '🧁',
      imageUrl: 'https://images.unsplash.com/photo-1578985545062-69928b1d9587?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 4500,
      priceRange: '₦3,800 - ₦5,200',
      description: 'Freshly baked cinnamon banana cake loaf and a jar of nutmeg-spiced milky Nigerian chin-chin.',
    },
  ],

  frozen_foods: [
    {
      id: 'spec-frz-01',
      name: 'Frozen Chicken Laps / Hindquarters (1kg / Carton Available)',
      category: 'Frozen Poultry & Turkey',
      departmentId: 'frozen_foods',
      subcategoryId: 'frozen_poultry_meat',
      varietyId: 'frozen_chicken_turkey',
      brand: 'ColdChain Direct',
      icon: '🍗',
      imageUrl: 'https://images.unsplash.com/photo-1587593810167-a84920ea0781?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 5800,
      priceRange: '₦5,200 - ₦6,500',
      description: 'Blast-frozen grade-A chicken laps maintained at -18°C for guaranteed freshness.',
    },
    {
      id: 'spec-frz-02',
      name: 'Frozen Jumbo Turkey Wings (1kg)',
      category: 'Frozen Poultry & Turkey',
      departmentId: 'frozen_foods',
      subcategoryId: 'frozen_poultry_meat',
      varietyId: 'frozen_chicken_turkey',
      brand: 'ColdChain Direct',
      icon: '🦃',
      imageUrl: 'https://images.unsplash.com/photo-1527477396000-e27163b481c2?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 8800,
      priceRange: '₦8,000 - ₦9,800',
      description: 'Meaty frozen turkey mid-wings and drumsticks for frying, grilling and stews.',
    },
    {
      id: 'spec-frz-03',
      name: 'Frozen Original Titus Mackerel & Croaker Fish (1kg)',
      category: 'Frozen Fish & Seafood',
      departmentId: 'frozen_foods',
      subcategoryId: 'frozen_fish_seafood',
      varietyId: 'frozen_mackerel_croaker',
      brand: 'ColdChain Direct',
      icon: '🐟',
      imageUrl: 'https://images.unsplash.com/photo-1519708227418-c8fd9a32b7a2?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 6200,
      priceRange: '₦5,500 - ₦7,000',
      description: 'Deep-sea blast-frozen Titus mackerel and Atlantic croaker fish.',
    },
    {
      id: 'spec-frz-04',
      name: 'Crispy Frozen French Fries & Chicken Franks Combo (1kg)',
      category: 'Frozen Fries, Sausages & Mixed Veggies',
      departmentId: 'frozen_foods',
      subcategoryId: 'frozen_fries_veggies',
      varietyId: 'frozen_chips_sausages',
      brand: 'ColdChain Direct',
      icon: '🍟',
      imageUrl: 'https://images.unsplash.com/photo-1576107232684-1279f3908594?auto=format&fit=crop&w=500&q=75',
      suggestedPrice: 5200,
      priceRange: '₦4,500 - ₦6,000',
      description: 'Pre-cut golden potato french fries and smoked chicken sausages for quick meals and shawarma.',
    },
  ],
};

/**
 * Computes the exact categories, filter pills, custom category chips, and suggested catalog items
 * allowed for a specific merchant store based on its registered department(s) and store format.
 * Ensures a Butcher shop only sees Meat & Poultry, a Vegetable shop only sees Vegetables, etc.
 */
export function getStoreAllowedCatalogData(store, taxonomy = DEFAULT_MARKETPLACE_TAXONOMY, masterCatalog = []) {
  const normalizedStore = store ? normalizeStoreTaxonomyProfile(store, taxonomy) : null;
  const isPharmStore =
    normalizedStore?.primaryDepartmentId === 'pharmacy' ||
    normalizedStore?.storeTypeFormat === 'pharmacy' ||
    store?.storeType === 'pharmacy';

  const primaryDeptId = isPharmStore
    ? 'pharmacy'
    : (normalizedStore?.primaryDepartmentId || store?.primaryDepartmentId || 'grocery');

  const rawAdditional = Array.isArray(normalizedStore?.additionalDepartmentIds)
    ? normalizedStore.additionalDepartmentIds
    : (Array.isArray(store?.additionalDepartmentIds) ? store.additionalDepartmentIds : []);

  const isGeneralSupermarket =
    primaryDeptId === 'grocery' &&
    (!normalizedStore?.storeTypeFormat ||
      normalizedStore.storeTypeFormat === 'supermarket' ||
      normalizedStore.storeTypeFormat === 'provision_store');

  const allowedDeptSet = new Set([primaryDeptId]);
  rawAdditional.forEach((dId) => {
    if (dId && dId !== 'pharmacy') allowedDeptSet.add(dId);
  });

  // Department metadata map for UI headers, search placeholders, and custom product chips
  const DEPT_CATALOG_META = {
    meat_poultry: {
      allLabel: '🥩 All Meat & Poultry',
      title: 'Meat & Poultry Catalog',
      searchPlaceholder: '🔍 Search goat meat, beef, ram, chicken, turkey, shaki, ponmo...',
      customNamePlaceholder: 'e.g. Fresh Goat Meat (1kg Cut) or Prime Boneless Beef',
      emojis: ['🥩', '🐐', '🐏', '🍗', '🦃', '🥓', '🍖', '🍲'],
      pills: [
        { id: 'beef', label: '🥩 Beef / Cow Meat' },
        { id: 'goat_meat', label: '🐐 Goat Meat' },
        { id: 'ram_sheep', label: '🐏 Ram & Sheep' },
        { id: 'poultry', label: '🍗 Chicken, Turkey & Poultry' },
        { id: 'pork', label: '🥓 Pork & Specialty Cuts' },
      ],
      customChips: ['Beef / Cow Meat', 'Goat Meat', 'Ram & Sheep', 'Chicken, Turkey & Poultry', 'Pork & Specialty Cuts'],
    },
    vegetables: {
      allLabel: '🥬 All Fresh Vegetables',
      title: 'Fresh Vegetables Catalog',
      searchPlaceholder: '🔍 Search tomatoes, ugu, pepper, onions, carrots, cabbage, okra...',
      customNamePlaceholder: 'e.g. Fresh Jos Plum Tomatoes (Basket) or Ugu Leaves',
      emojis: ['🥬', '🍅', '🌶️', '🧅', '🥕', '🥒', '🫑', '🧄', '🌿'],
      pills: [
        { id: 'tomatoes_peppers', label: '🍅 Tomatoes, Peppers & Onions' },
        { id: 'leafy_greens', label: '🥬 Leafy Greens & Soup Veggies' },
        { id: 'root_salad_veg', label: '🥕 Carrots, Cabbage & Salad Veggies' },
        { id: 'herbs_aromatics', label: '🌿 Fresh Herbs, Okra & Bulbs' },
      ],
      customChips: ['Tomatoes, Peppers & Onions', 'Leafy Greens & Soup Vegetables', 'Carrots, Cabbage & Salad Veggies', 'Fresh Herbs, Okra & Bulbs'],
    },
    fruits: {
      allLabel: '🍎 All Fresh Fruits',
      title: 'Fresh Fruits Catalog',
      searchPlaceholder: '🔍 Search oranges, apples, banana, watermelon, pineapple, mango...',
      customNamePlaceholder: 'e.g. Sweet Red Watermelon or Benue Oranges (Bag)',
      emojis: ['🍎', '🍊', '🍌', '🍉', '🍍', '🥭', '🍇', '🥑', '🍓'],
      pills: [
        { id: 'everyday_fruits', label: '🍊 Citrus, Apples & Bananas' },
        { id: 'tropical_melons', label: '🍍 Watermelon, Pineapple & Mango' },
        { id: 'berries_exotic', label: '🍇 Grapes, Berries & Avocado' },
      ],
      customChips: ['Citrus, Apples & Bananas', 'Tropical Melons, Pineapple & Mango', 'Berries, Grapes & Exotic Fruits'],
    },
    fish_seafood: {
      allLabel: '🐟 All Fish & Seafood',
      title: 'Fish & Seafood Catalog',
      searchPlaceholder: '🔍 Search catfish, tilapia, croaker, titus mackerel, stockfish, prawns, crayfish...',
      customNamePlaceholder: 'e.g. Live Catfish (1.5kg) or Oron Dried Crayfish',
      emojis: ['🐟', '🐠', '🦐', '🦀', '🔥', '🍲'],
      pills: [
        { id: 'fresh_fish', label: '🐟 Fresh & Live Fish' },
        { id: 'smoked_dried_fish', label: '🔥 Smoked, Dried & Stockfish' },
        { id: 'shellfish_prawns', label: '🦐 Prawns, Crayfish & Shellfish' },
      ],
      customChips: ['Fresh & Live Fish', 'Smoked, Dried & Stockfish', 'Prawns, Crayfish & Shellfish'],
    },
    grains_foodstuff: {
      allLabel: '🌾 All Grains & Foodstuff',
      title: 'Grains, Tubers & Foodstuff Catalog',
      searchPlaceholder: '🔍 Search rice, oloyin beans, ijebu garri, poundo yam, tubers, palm oil, egusi...',
      customNamePlaceholder: 'e.g. Royal Stallion Rice (50kg) or Oloyin Honey Beans',
      emojis: ['🌾', '🍚', '🫘', '🍠', '🥔', '🥣', '🛢️'],
      pills: [
        { id: 'rice_grains', label: '🍚 Rice, Maize & Grains' },
        { id: 'beans_swallow', label: '🫘 Beans, Garri & Swallow Flours' },
        { id: 'tubers_yam', label: '🍠 Yams, Tubers & Cooking Oils' },
      ],
      customChips: ['Rice, Maize & Grains', 'Beans, Garri & Swallow Flours', 'Yams, Tubers & Cooking Oils'],
    },
    bakery: {
      allLabel: '🥐 All Bakery & Pastries',
      title: 'Bakery & Confectionery Catalog',
      searchPlaceholder: '🔍 Search agege bread, sliced loaf, meat pie, doughnuts, croissant, cakes...',
      customNamePlaceholder: 'e.g. Fresh Agege Bread Loaf or Beef Meat Pie (Box of 4)',
      emojis: ['🍞', '🥐', '🥖', '🍩', '🎂', '🥟', '🧁', '🍪'],
      pills: [
        { id: 'bakery_bread', label: '🍞 Fresh Bread & Loaves' },
        { id: 'pastries_pies', label: '🥐 Meat Pies, Doughnuts & Pastries' },
        { id: 'cakes_desserts', label: '🎂 Cakes & Celebration Desserts' },
      ],
      customChips: ['Fresh Bread & Loaves', 'Meat Pies, Doughnuts & Pastries', 'Cakes & Celebration Desserts'],
    },
    pharmacy: {
      allLabel: '💊 All Pharmacy & Healthcare',
      title: 'Licensed Pharmacy & Healthcare Catalog',
      searchPlaceholder: '🔍 Search coartem, paracetamol, vitamin C, augmentin, omeprazole, gaviscon...',
      customNamePlaceholder: 'e.g. Coartem 80/480mg Tablets or Vitamin C 1000mg',
      emojis: ['💊', '🩺', '🧪', '🩹', '🌿', '👶'],
      pills: [
        { id: 'Pharmacy', label: '💊 Prescription & OTC Medications' },
        { id: 'malaria_pain_rx', label: '💊 Malaria, Pain & Fever Relief' },
        { id: 'vitamins_supplements', label: '🧬 Vitamins & Supplements' },
        { id: 'Skincare', label: '🧴 Medicated Skincare & Derma' },
        { id: 'Baby Care', label: '👶 Infant Health & Nutrition' },
      ],
      customChips: ['Pharmacy', 'Malaria & Pain Relief', 'Vitamins & Supplements', 'First Aid & Diagnostics', 'Baby Care'],
    },
    drinks_beverages: {
      allLabel: '🥤 All Drinks & Beverages',
      title: 'Drinks, Water & Beverages Catalog',
      searchPlaceholder: '🔍 Search malt, chivita, coca-cola, table water, wine, energy drinks...',
      customNamePlaceholder: 'e.g. Maltina Classic Can (Pack of 6) or Eva Water Pack',
      emojis: ['🥤', '🧃', '💧', '🍷', '🍾', '☕'],
      pills: [
        { id: 'Drinks', label: '🥤 Soft Drinks, Malt & Juices' },
      ],
      customChips: ['Drinks', 'Soft Drinks & Malt', 'Fruit Juices', 'Water & Energy Drinks', 'Wine & Cellar'],
    },
    household_personal_care: {
      allLabel: '🧴 All Household & Personal Care',
      title: 'Household, Skincare & Baby Care Catalog',
      searchPlaceholder: '🔍 Search nivea, dove, Ariel detergent, morning fresh, pampers, tissue...',
      customNamePlaceholder: 'e.g. Nivea Nourishing Lotion (400ml) or Ariel Detergent (2kg)',
      emojis: ['🧴', '🧼', '👶', '🧻', '✨'],
      pills: [
        { id: 'Skincare', label: '🧴 Skincare & Personal Care' },
        { id: 'Household', label: '🧼 Household & Cleaning' },
        { id: 'Baby Care', label: '👶 Baby Care & Diapers' },
      ],
      customChips: ['Skincare', 'Household', 'Baby Care'],
    },
    frozen_foods: {
      allLabel: '🧊 All Frozen Foods',
      title: 'Frozen Foods & Cold Room Catalog',
      searchPlaceholder: '🔍 Search frozen chicken laps, turkey wings, frozen titus fish, french fries, sausages...',
      customNamePlaceholder: 'e.g. Frozen Chicken Laps (10kg Carton) or Frozen Turkey Wings',
      emojis: ['🧊', '🍗', '🦃', '🐟', '🍟', '🌭'],
      pills: [
        { id: 'frozen_poultry_meat', label: '🍗 Frozen Poultry & Turkey' },
        { id: 'frozen_fish_seafood', label: '🐟 Frozen Fish & Seafood' },
        { id: 'frozen_fries_veggies', label: '🍟 Frozen Fries & Sausages' },
      ],
      customChips: ['Frozen Poultry & Turkey', 'Frozen Fish & Seafood', 'Frozen Fries, Sausages & Mixed Veggies'],
    },
    grocery: {
      allLabel: '🛒 All Supermarket & Provisions',
      title: 'Supermarket & Provisions Catalog',
      searchPlaceholder: '🔍 Search rice, oil, noodles, peak milk, golden morn, drinks, biscuits, household...',
      customNamePlaceholder: 'e.g. Golden Penny Spaghetti (500g) or Peak Milk Tin',
      emojis: ['🛒', '🍚', '🫒', '🥛', '🍪', '🥤', '🧼', '🧴'],
      pills: [
        { id: 'Pantry', label: '🍚 Groceries & Pantry' },
        { id: 'Drinks', label: '🥤 Drinks & Beverages' },
        { id: 'Biscuits', label: '🍪 Biscuits & Cookies' },
        { id: 'Snacks', label: '🥨 Snacks & Confectionery' },
        { id: 'Skincare', label: '🧴 Skincare & Personal Care' },
        { id: 'Baby Care', label: '👶 Baby Care & Nutrition' },
        { id: 'Household', label: '🧼 Household & Cleaning' },
      ],
      customChips: ['Pantry', 'Drinks', 'Biscuits', 'Snacks', 'Household', 'Skincare', 'Baby Care'],
    },
  };

  const primaryMeta = DEPT_CATALOG_META[primaryDeptId] || DEPT_CATALOG_META.grocery;

  // Build combined pills and custom chips strictly from the store's allowed departments
  const pillMap = new Map();
  pillMap.set('All', {
    id: 'All',
    label: allowedDeptSet.size > 1 && !isGeneralSupermarket
      ? `🏪 All ${store?.name || 'Store'} Categories`
      : primaryMeta.allLabel,
  });

  const customChipSet = new Set();

  for (const deptId of allowedDeptSet) {
    const meta = DEPT_CATALOG_META[deptId];
    if (!meta) continue;
    meta.pills.forEach((p) => {
      if (!pillMap.has(p.id)) pillMap.set(p.id, p);
    });
    meta.customChips.forEach((c) => customChipSet.add(c));
  }

  // Assemble the allowed catalog items strictly matching this store's department(s)
  const catalogItems = [];
  const seenItemIds = new Set();

  // 1. First add curated specialist items for every specialist department this store operates in
  for (const deptId of allowedDeptSet) {
    const specList = SPECIALIST_DEPARTMENT_CATALOG[deptId];
    if (Array.isArray(specList)) {
      for (const item of specList) {
        if (!seenItemIds.has(item.id)) {
          seenItemIds.add(item.id);
          catalogItems.push(item);
        }
      }
    }
  }

  // 2. Filter masterCatalog items so ONLY items belonging to this store's allowed departments are included
  if (Array.isArray(masterCatalog)) {
    for (const item of masterCatalog) {
      if (!item || seenItemIds.has(item.id)) continue;
      const itemCat = String(item.category || '');

      if (primaryDeptId === 'pharmacy') {
        // Licensed pharmacy sees Pharmacy, medicated Skincare, and Baby Care health items
        if (itemCat === 'Pharmacy' || itemCat === 'Skincare' || itemCat === 'Baby Care') {
          seenItemIds.add(item.id);
          catalogItems.push(item);
        }
        continue;
      }

      // Non-pharmacy stores NEVER see Pharmacy items
      if (itemCat === 'Pharmacy') continue;

      if (allowedDeptSet.has('grocery')) {
        // Supermarket / Provision store sees non-pharmacy grocery items
        seenItemIds.add(item.id);
        catalogItems.push(item);
        continue;
      }

      if (allowedDeptSet.has('drinks_beverages') && itemCat === 'Drinks') {
        seenItemIds.add(item.id);
        catalogItems.push(item);
        continue;
      }

      if (
        allowedDeptSet.has('household_personal_care') &&
        (itemCat === 'Skincare' || itemCat === 'Household' || itemCat === 'Baby Care')
      ) {
        seenItemIds.add(item.id);
        catalogItems.push(item);
        continue;
      }

      // For specialist food departments (grains_foodstuff, bakery, fish_seafood), include matching items from Pantry if they classify strictly into that specialist department
      if (
        (allowedDeptSet.has('grains_foodstuff') || allowedDeptSet.has('bakery') || allowedDeptSet.has('fish_seafood')) &&
        (itemCat === 'Pantry' || itemCat === 'Biscuits')
      ) {
        const classified = classifyProductIntoTaxonomy(item, taxonomy);
        if (classified && allowedDeptSet.has(classified.departmentId) && classified.departmentId !== 'grocery') {
          seenItemIds.add(item.id);
          catalogItems.push({
            ...item,
            departmentId: classified.departmentId,
            subcategoryId: classified.subcategoryId,
            category: classified.subcategoryLabel || item.category,
          });
        }
      }
    }
  }

  return {
    primaryDepartmentId: primaryDeptId,
    allowedDepartmentIds: Array.from(allowedDeptSet),
    catalogTitle: primaryMeta.title,
    searchPlaceholder: primaryMeta.searchPlaceholder,
    customNamePlaceholder: primaryMeta.customNamePlaceholder,
    customEmojiIcons: primaryMeta.emojis,
    categoryFilterPills: Array.from(pillMap.values()),
    customCategoryChips: Array.from(customChipSet),
    allowedProducts: catalogItems,
  };
}


