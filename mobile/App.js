import React, { useState } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
} from 'react-native';

const { width } = Dimensions.get('window');

// --- Logos ---
const LOGO_TRANSPARENT = require('./assets/getit-logo-transparent.png');
const LOGO_CREAM = require('./assets/getit-logo-cream.jpg');

// --- Luxury Color Palette ---
const COLORS = {
  emeraldDeep: '#064E3B',       // Imperial Emerald
  emeraldPrimary: '#056B4B',    // Lustrous Emerald
  emeraldLight: '#10B981',      // Vibrant Emerald
  emeraldSurface: '#EDF7F1',    // Ultra-soft emerald tint
  roseGold: '#B76E79',          // Signature Rose Gold
  roseGoldDark: '#93535D',      // Deep Rose Gold
  roseGoldLight: '#F3D8D0',     // Soft Rose Gold Glow
  roseGoldSurface: '#FDF6F5',   // Gentle Rose Gold Tint
  champagneGold: '#C5A059',     // Champagne Accent
  beigeBg: '#FBF8F3',           // Soft Warm Linen Beige Background
  cardBg: '#FFFFFF',            // Crisp White Card
  borderBeige: '#EAE1D5',       // Subtle Beige Border
  borderLight: '#F0ECE4',       // Soft Separator
  textDark: '#191E24',          // Deep Slate Onyx
  textMuted: '#78716C',         // Muted Warm Taupe
  starGold: '#F59E0B',          // Star Rating Gold
};

// --- Delivery Locations ---
const LOCATIONS = [
  'Maitama District, Abuja',
  'Wuse 2, Abuja',
  'Asokoro Presidential Wing, Abuja',
  'Ikoyi Crescent, Lagos',
  'Victoria Island, Lagos',
  'Lekki Phase 1, Lagos',
];

// --- Curated Categories ---
const CATEGORIES = [
  { id: 'all', name: 'All Stores', icon: '✨' },
  { id: 'gourmet', name: 'Gourmet Marts', icon: '🥂' },
  { id: 'organic', name: 'Organic & Fresh', icon: '🌿' },
  { id: 'bakery', name: 'Artisan Bakery', icon: '🥐' },
  { id: 'cellar', name: 'Pantry & Cellar', icon: '🍷' },
  { id: 'heritage', name: 'Local Specialties', icon: '🌾' },
];

// --- Featured Stores Around Me ---
const STORES_AROUND_ME = [
  {
    id: 's1',
    name: 'The Gourmet Emporium',
    category: 'gourmet',
    categoryLabel: 'Gourmet Groceries & Deli',
    rating: 4.9,
    reviewCount: '1.4k',
    distance: '0.9 km',
    deliveryTime: '15-20 min',
    deliveryFee: '₦1,200',
    freeDeliveryThreshold: 25000,
    tag: 'FEATURED LUXE',
    badgeColor: COLORS.roseGold,
    address: 'Plot 14 Gana Street, Maitama',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    description: 'Imported artisanal cheeses, prime truffles, charcuterie, and fine everyday provisions.',
    products: [
      { id: 'gp1', name: 'Truffle Infused Extra Virgin Oil (250ml)', price: 16500, icon: '🫒', category: 'Pantry' },
      { id: 'gp2', name: 'Aged Parmigiano Reggiano (300g)', price: 12800, icon: '🧀', category: 'Deli' },
      { id: 'gp3', name: 'Organic Cold-Pressed Valencia Juices', price: 4200, icon: '🍊', category: 'Beverage' },
      { id: 'gp4', name: 'Artisanal Gluten-Free Pasta (500g)', price: 5400, icon: '🍝', category: 'Pantry' },
      { id: 'gp5', name: 'Smoked Atlantic Salmon Fillet (200g)', price: 14200, icon: '🐟', category: 'Deli' },
      { id: 'gp6', name: 'French Dijon Grain Mustard (210g)', price: 3800, icon: '🍯', category: 'Pantry' },
      { id: 'gp7', name: 'San Pellegrino Sparkling Water (750ml)', price: 2900, icon: '🍾', category: 'Beverage' },
      { id: 'gp8', name: 'Kalamata Jumbo Pitted Olives (370g)', price: 6500, icon: '🫒', category: 'Deli' },
    ],
  },
  {
    id: 's2',
    name: 'Maison de Fresh Organic',
    category: 'organic',
    categoryLabel: 'Farm-to-Table & Produce',
    rating: 4.8,
    reviewCount: '890',
    distance: '1.4 km',
    deliveryTime: '20-25 min',
    deliveryFee: '₦1,000',
    freeDeliveryThreshold: 20000,
    tag: 'FARM FRESH',
    badgeColor: COLORS.emeraldPrimary,
    address: 'Adetokunbo Ademola Crescent, Wuse 2',
    image: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=800&q=80',
    description: 'Hydroponic crisp greens, vine-ripened heritage tomatoes, and pristine organic berries.',
    products: [
      { id: 'op1', name: 'Sweet Roman Heritage Tomatoes (Basket)', price: 9500, icon: '🍅', category: 'Produce' },
      { id: 'op2', name: 'Fresh Hass Avocados (Pack of 4)', price: 5200, icon: '🥑', category: 'Produce' },
      { id: 'op3', name: 'Organic Wildflower Raw Honey (500g)', price: 7800, icon: '🍯', category: 'Pantry' },
      { id: 'op4', name: 'Hydroponic Sweet Bell Peppers Mix', price: 4600, icon: '🫑', category: 'Produce' },
      { id: 'op5', name: 'Crisp Baby Spinach & Kale (Fresh Pack)', price: 3500, icon: '🥬', category: 'Produce' },
      { id: 'op6', name: 'Fresh Strawberries & Blueberries Punnet', price: 8400, icon: '🍓', category: 'Produce' },
      { id: 'op7', name: 'Organic Fresh Rosemary & Thyme Bundle', price: 2200, icon: '🌿', category: 'Produce' },
      { id: 'op8', name: 'Cold Pressed Virgin Coconut Oil (500ml)', price: 6900, icon: '🥥', category: 'Pantry' },
    ],
  },
  {
    id: 's3',
    name: 'L’Artisan Bakery & Patisserie',
    category: 'bakery',
    categoryLabel: 'French Bakery & Pastries',
    rating: 4.9,
    reviewCount: '2.1k',
    distance: '1.8 km',
    deliveryTime: '15-20 min',
    deliveryFee: '₦800',
    freeDeliveryThreshold: 15000,
    tag: 'BAKED HOURLY',
    badgeColor: COLORS.champagneGold,
    address: '32 Aminu Kano Way, Wuse 2',
    image: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=800&q=80',
    description: 'Traditional slow-fermented sourdough loaves, flaky butter croissants, and fine brioche.',
    products: [
      { id: 'bp1', name: 'Authentic Butter Croissant (Box of 4)', price: 6800, icon: '🥐', category: 'Pastry' },
      { id: 'bp2', name: 'Rustic Wild Sourdough Boule (800g)', price: 4900, icon: '🍞', category: 'Bread' },
      { id: 'bp3', name: 'Pistachio & Rose Macarons (6 Pcs)', price: 8200, icon: '🧁', category: 'Pastry' },
      { id: 'bp4', name: 'Single-Origin Cold Brew Coffee (330ml)', price: 3500, icon: '☕', category: 'Beverage' },
      { id: 'bp5', name: 'Pain au Chocolat (Box of 4)', price: 7400, icon: '🍫', category: 'Pastry' },
      { id: 'bp6', name: 'French Baguette Traditionnelle (2 Pcs)', price: 3800, icon: '🥖', category: 'Bread' },
      { id: 'bp7', name: 'Vanilla Bean Brioche Loaf (Sliced)', price: 5600, icon: '🍞', category: 'Bread' },
      { id: 'bp8', name: 'Raspberry & Almond Tart Slice', price: 4500, icon: '🍰', category: 'Pastry' },
    ],
  },
  {
    id: 's4',
    name: 'Prime Cellar & Reserve Pantry',
    category: 'cellar',
    categoryLabel: 'Sommelier & Luxury Pantry',
    rating: 5.0,
    reviewCount: '640',
    distance: '2.6 km',
    deliveryTime: '25-30 min',
    deliveryFee: '₦1,500',
    freeDeliveryThreshold: 40000,
    tag: 'VINTAGE SELECTION',
    badgeColor: COLORS.roseGoldDark,
    address: 'Yakubu Gowon Crescent, Asokoro',
    image: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=800&q=80',
    description: 'Curated reserve wines, European sparkling waters, and rare pantry spices.',
    products: [
      { id: 'cp1', name: 'San Pellegrino Sparkling Glass (750ml x 2)', price: 5800, icon: '🍾', category: 'Beverage' },
      { id: 'cp2', name: 'Spanish Smoked Saffron (Pure 2g)', price: 14500, icon: '🌺', category: 'Pantry' },
      { id: 'cp3', name: 'Belgian 70% Dark Chocolate Truffles', price: 9200, icon: '🍫', category: 'Sweets' },
      { id: 'cp4', name: 'Non-Alcoholic Sparkling Rosé Reserve', price: 18500, icon: '🍷', category: 'Beverage' },
      { id: 'cp5', name: 'White Truffle Butter Spread (100g)', price: 11400, icon: '🧈', category: 'Pantry' },
      { id: 'cp6', name: 'Royal Caspian Caviar Selection (50g)', price: 45000, icon: '🥫', category: 'Deli' },
      { id: 'cp7', name: 'Organic Raw Acacia Comb Honey (400g)', price: 10500, icon: '🍯', category: 'Pantry' },
    ],
  },
  {
    id: 's5',
    name: "Mama's Heritage Farm & Spice Co.",
    category: 'heritage',
    categoryLabel: 'Premium Nigerian Staples',
    rating: 4.9,
    reviewCount: '3.2k',
    distance: '2.1 km',
    deliveryTime: '20-30 min',
    deliveryFee: '₦1,000',
    freeDeliveryThreshold: 25000,
    tag: 'HERITAGE QUALITY',
    badgeColor: COLORS.emeraldPrimary,
    address: 'Utako Commercial District',
    image: 'https://images.unsplash.com/photo-1596040033229-a9821ebd058d?auto=format&fit=crop&w=800&q=80',
    description: 'Select Benue white yams, stone-free parboiled rice, pure cold-pressed palm oil, and fresh aromatics.',
    products: [
      { id: 'hp1', name: 'Benue Select Tubers (5 Giant Size)', price: 15500, icon: '🍠', category: 'Tubers' },
      { id: 'hp2', name: 'Royal Parboiled Rice (10kg Clean Bag)', price: 23000, icon: '🌾', category: 'Grains' },
      { id: 'hp3', name: 'Fresh Ata Rodo & Tatashe (Sorted Box)', price: 6500, icon: '🌶️', category: 'Spices' },
      { id: 'hp4', name: 'Pure Nsukka Palm Oil (4 Litres Jug)', price: 8900, icon: '🫙', category: 'Oils' },
      { id: 'hp5', name: 'Dry Ground Crayfish (Paint Bucket)', price: 12500, icon: '🦐', category: 'Spices' },
      { id: 'hp6', name: 'Premium Ijebu Garri (5kg Bag)', price: 7800, icon: '🥣', category: 'Grains' },
      { id: 'hp7', name: 'Smoked Catfish Crispy Pack (4 Big)', price: 9500, icon: '🐟', category: 'Meat & Fish' },
      { id: 'hp8', name: 'Fresh Ogbono & Egusi Seed Mix', price: 8200, icon: '🥜', category: 'Spices' },
    ],
  },
];

// --- Financial formatting helper ---
function formatNaira(amount) {
  if (!amount && amount !== 0) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-NG');
}

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState(LOCATIONS[0]);
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(['s1', 's3']);

  // Selected Store Modal & In-Store Product Search
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeProductSearch, setStoreProductSearch] = useState('');
  const [storeProductCategory, setStoreProductCategory] = useState('All');

  // Cart State
  const [cart, setCart] = useState([]);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);

  // Active Orders (for track tab)
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'orders' | 'profile'
  const [orders, setOrders] = useState([
    {
      id: 'ORD-98231',
      storeName: 'The Gourmet Emporium',
      itemsCount: 3,
      total: 33500,
      status: 'On the Way',
      eta: '12 mins',
      deliveryPin: '4928',
    },
  ]);

  // Open a store modal and reset in-store search
  const openStoreModal = (store) => {
    setSelectedStore(store);
    setStoreProductSearch('');
    setStoreProductCategory('All');
  };

  // Toggle favorite
  const toggleFavorite = (storeId) => {
    if (favorites.includes(storeId)) {
      setFavorites(favorites.filter((id) => id !== storeId));
    } else {
      setFavorites([...favorites, storeId]);
    }
  };

  // Add to cart
  const addToCart = (product, store) => {
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prev, { ...product, qty: 1, storeName: store.name }];
    });
    Alert.alert('Added to Selection', `${product.name} added to your basket.`);
  };

  const removeFromCart = (productId) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === productId ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  const deliveryFee = cart.length > 0 ? 1200 : 0;
  const conciergeFee = Math.round(cartSubtotal * 0.04);
  const cartTotal = cartSubtotal + deliveryFee + conciergeFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newOrder = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      storeName: cart[0]?.storeName || 'The Gourmet Emporium',
      itemsCount: cart.reduce((sum, i) => sum + i.qty, 0),
      total: cartTotal,
      status: 'Preparing Order',
      eta: '25 mins',
      deliveryPin: `${Math.floor(1000 + Math.random() * 9000)}`,
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setCheckoutModalVisible(false);
    setCartModalVisible(false);
    if (selectedStore) setSelectedStore(null);
    setActiveTab('orders');
    Alert.alert('Order Confirmed!', `Your order ${newOrder.id} has been placed.`);
  };

  // Filtered stores on homepage
  const filteredStores = STORES_AROUND_ME.filter((store) => {
    const matchesCategory = activeCategory === 'all' || store.category === activeCategory;
    const matchesSearch =
      !searchQuery ||
      store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
      store.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  // Filtered products inside selected store
  const storeUniqueCategories = selectedStore
    ? ['All', ...new Set(selectedStore.products.map((p) => p.category))]
    : ['All'];

  const filteredStoreProducts = selectedStore
    ? selectedStore.products.filter((p) => {
        const matchesCat =
          storeProductCategory === 'All' || p.category === storeProductCategory;
        const matchesQuery =
          !storeProductSearch ||
          p.name.toLowerCase().includes(storeProductSearch.toLowerCase()) ||
          p.category.toLowerCase().includes(storeProductSearch.toLowerCase());
        return matchesCat && matchesQuery;
      })
    : [];

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

      {/* --- TOP LUXURY HEADER --- */}
      <View style={styles.header}>
        {/* Brand & Location Row */}
        <View style={styles.headerTopRow}>
          <View style={styles.brandRow}>
            {/* Transparent Logo in Luxury White Emblem Badge */}
            <View style={styles.brandLogoBox}>
              <Image
                source={LOGO_TRANSPARENT}
                style={styles.brandLogoImage}
                resizeMode="contain"
              />
            </View>
            <View>
              <Text style={styles.brandTitle}>GETIT</Text>
              <Text style={styles.brandSubtitle}>SHOP • GROCERIES • MORE</Text>
            </View>
          </View>

          {/* Cart Icon Button */}
          <TouchableOpacity
            style={styles.cartHeaderButton}
            onPress={() => setCartModalVisible(true)}
            activeOpacity={0.8}
          >
            <Text style={{ fontSize: 18 }}>🛍️</Text>
            {cart.length > 0 && (
              <View style={styles.cartBadge}>
                <Text style={styles.cartBadgeText}>
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </Text>
              </View>
            )}
          </TouchableOpacity>
        </View>

        {/* Location Dropdown Trigger */}
        <TouchableOpacity
          style={styles.locationSelector}
          onPress={() => setLocationModalVisible(true)}
          activeOpacity={0.8}
        >
          <View style={styles.locationIconWrap}>
            <Text style={{ fontSize: 14 }}>📍</Text>
          </View>
          <View style={{ flex: 1, marginHorizontal: 8 }}>
            <Text style={styles.locationOverline}>DELIVERING TO</Text>
            <Text style={styles.locationText} numberOfLines={1}>
              {selectedLocation}
            </Text>
          </View>
          <Text style={styles.locationChevron}>▾</Text>
        </TouchableOpacity>

        {/* Luxury Search Bar (Homepage stores search) */}
        <View style={styles.searchContainer}>
          <Text style={styles.searchIcon}>🔍</Text>
          <TextInput
            style={styles.searchInput}
            placeholder="Search stores around you, organic treats..."
            placeholderTextColor="#8C938F"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Text style={{ color: COLORS.textMuted, fontSize: 16, paddingRight: 6 }}>✕</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* --- MAIN CONTENT AREA --- */}
      {activeTab === 'home' && (
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={{ paddingBottom: 110 }}
          showsVerticalScrollIndicator={false}
        >
          {/* Hero Welcome Banner featuring GETIT Brand Emblem */}
          <View style={styles.heroBanner}>
            <View style={styles.heroGlowCircle} />
            <View style={{ flex: 1, zIndex: 1, paddingRight: 10 }}>
              <View style={styles.heroTagPill}>
                <Text style={styles.heroTagText}>CURATED EXCELLENCE</Text>
              </View>
              <Text style={styles.heroHeading}>Stores Around You</Text>
              <Text style={styles.heroSubheading}>
                Hand-picked gourmet providores, organic farm produce & local artisans.
              </Text>
            </View>

            {/* Branded Emblem in Hero */}
            <View style={styles.heroLogoCard}>
              <Image
                source={LOGO_TRANSPARENT}
                style={styles.heroLogoImage}
                resizeMode="contain"
              />
            </View>
          </View>

          {/* Category Filter Pills */}
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionHeading}>Browse by Category</Text>
            <Text style={styles.sectionRoseGoldCount}>{CATEGORIES.length} Categories</Text>
          </View>

          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            style={styles.categoryScroll}
            contentContainerStyle={styles.categoryScrollContent}
          >
            {CATEGORIES.map((cat) => {
              const isActive = activeCategory === cat.id;
              return (
                <TouchableOpacity
                  key={cat.id}
                  style={[
                    styles.categoryPill,
                    isActive && styles.categoryPillActive,
                  ]}
                  onPress={() => setActiveCategory(cat.id)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.categoryIcon}>{cat.icon}</Text>
                  <Text
                    style={[
                      styles.categoryLabel,
                      isActive && styles.categoryLabelActive,
                    ]}
                  >
                    {cat.name}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>

          {/* Section: Available Stores Around Me */}
          <View style={styles.sectionHeaderRow}>
            <View>
              <Text style={styles.sectionHeading}>Available Stores Near You</Text>
              <Text style={styles.sectionSubheading}>
                Within {selectedLocation.split(',')[0]}
              </Text>
            </View>
            <View style={styles.storeCountBadge}>
              <Text style={styles.storeCountText}>{filteredStores.length} open now</Text>
            </View>
          </View>

          {/* Store Box Containers */}
          {filteredStores.map((store) => {
            const isFav = favorites.includes(store.id);
            return (
              <TouchableOpacity
                key={store.id}
                style={styles.storeBoxCard}
                onPress={() => openStoreModal(store)}
                activeOpacity={0.92}
              >
                {/* Store Image with Overlays */}
                <View style={styles.storeImageContainer}>
                  <Image
                    source={{ uri: store.image }}
                    style={styles.storeImage}
                    resizeMode="cover"
                  />
                  {/* Subtle Top Gradient Veil */}
                  <View style={styles.imageOverlayShadow} />

                  {/* Left Floating Tag */}
                  <View
                    style={[
                      styles.storeBadgeFloating,
                      { backgroundColor: store.badgeColor || COLORS.emeraldPrimary },
                    ]}
                  >
                    <Text style={styles.storeBadgeText}>{store.tag}</Text>
                  </View>

                  {/* Right Favorite Heart */}
                  <TouchableOpacity
                    style={styles.favoriteButton}
                    onPress={() => toggleFavorite(store.id)}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 16 }}>{isFav ? '❤️' : '🤍'}</Text>
                  </TouchableOpacity>

                  {/* Bottom Overlay Info Pill */}
                  <View style={styles.storeImageBottomBar}>
                    <View style={styles.chipRow}>
                      <View style={styles.infoGlassChip}>
                        <Text style={styles.infoGlassChipText}>⏱ {store.deliveryTime}</Text>
                      </View>
                      <View style={[styles.infoGlassChip, { marginLeft: 6 }]}>
                        <Text style={styles.infoGlassChipText}>📍 {store.distance}</Text>
                      </View>
                    </View>
                    <View style={styles.ratingChip}>
                      <Text style={styles.ratingStar}>★</Text>
                      <Text style={styles.ratingScore}>{store.rating}</Text>
                      <Text style={styles.reviewCount}>({store.reviewCount})</Text>
                    </View>
                  </View>
                </View>

                {/* Store Details Section Below Box */}
                <View style={styles.storeDetailsContainer}>
                  <View style={styles.storeMainRow}>
                    <View style={{ flex: 1, paddingRight: 8 }}>
                      <Text style={styles.storeTitle}>{store.name}</Text>
                      <Text style={styles.storeCategoryLine}>{store.categoryLabel}</Text>
                    </View>
                    <View style={styles.storeOpenPill}>
                      <View style={styles.greenPulseDot} />
                      <Text style={styles.storeOpenText}>OPEN</Text>
                    </View>
                  </View>

                  <Text style={styles.storeDescription} numberOfLines={2}>
                    {store.description}
                  </Text>

                  {/* Bottom Store Footer Details */}
                  <View style={styles.storeFooterRow}>
                    <View style={styles.deliveryMetaRow}>
                      <Text style={styles.deliveryFeeText}>Delivery: {store.deliveryFee}</Text>
                      <Text style={styles.deliveryDot}>•</Text>
                      <Text style={styles.minOrderText}>
                        Free over {formatNaira(store.freeDeliveryThreshold)}
                      </Text>
                    </View>

                    <TouchableOpacity
                      style={styles.viewStoreBtn}
                      onPress={() => openStoreModal(store)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.viewStoreBtnText}>Explore Store →</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}
        </ScrollView>
      )}

      {/* --- ORDERS TAB --- */}
      {activeTab === 'orders' && (
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
        >
          <Text style={styles.sectionHeading}>Your Active Orders</Text>
          <Text style={styles.sectionSubheading}>Live delivery tracking & security PINs</Text>

          {orders.map((ord) => (
            <View key={ord.id} style={styles.orderCard}>
              <View style={styles.orderCardHeader}>
                <View>
                  <Text style={styles.orderCardTitle}>{ord.storeName}</Text>
                  <Text style={styles.orderCardSub}>{ord.id} • {ord.itemsCount} items</Text>
                </View>
                <View style={styles.orderStatusPill}>
                  <Text style={styles.orderStatusText}>{ord.status}</Text>
                </View>
              </View>

              {/* Pin verification box */}
              <View style={styles.pinBox}>
                <View style={{ flex: 1 }}>
                  <Text style={styles.pinLabel}>DELIVERY SECURITY PIN</Text>
                  <Text style={styles.pinInstructions}>
                    Only release this code when you receive your packages.
                  </Text>
                </View>
                <View style={styles.pinNumberWrap}>
                  <Text style={styles.pinNumberText}>{ord.deliveryPin}</Text>
                </View>
              </View>

              <View style={styles.orderFooterRow}>
                <Text style={styles.orderTotalText}>Total: {formatNaira(ord.total)}</Text>
                <Text style={styles.orderEtaText}>Est. Arrival: {ord.eta}</Text>
              </View>
            </View>
          ))}
        </ScrollView>
      )}

      {/* --- PROFILE TAB --- */}
      {activeTab === 'profile' && (
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        >
          {/* Member Card with Cream Logo Avatar */}
          <View style={styles.profileAvatarBox}>
            <View style={styles.profileAvatarCircle}>
              <Image
                source={LOGO_CREAM}
                style={styles.profileLogoAvatar}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.profileName}>Distinguished Client</Text>
            <Text style={styles.profileTier}>GETIT Concierge Privilège</Text>
          </View>

          <View style={styles.profileMenuCard}>
            <TouchableOpacity style={styles.profileMenuItem}>
              <Text style={styles.profileMenuIcon}>📍</Text>
              <Text style={styles.profileMenuText}>Saved Addresses ({selectedLocation.split(',')[0]})</Text>
            </TouchableOpacity>
            <View style={styles.profileMenuDivider} />
            <TouchableOpacity style={styles.profileMenuItem}>
              <Text style={styles.profileMenuIcon}>💳</Text>
              <Text style={styles.profileMenuText}>Payment Methods & Cards</Text>
            </TouchableOpacity>
            <View style={styles.profileMenuDivider} />
            <TouchableOpacity style={styles.profileMenuItem}>
              <Text style={styles.profileMenuIcon}>🛎️</Text>
              <Text style={styles.profileMenuText}>Private Shopper Concierge</Text>
            </TouchableOpacity>
          </View>
        </ScrollView>
      )}

      {/* --- STORE DETAILS MODAL (WITH IN-STORE SEARCH BAR) --- */}
      <Modal
        visible={!!selectedStore}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setSelectedStore(null)}
      >
        {selectedStore && (
          <SafeAreaView style={styles.modalSafeArea}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />
            <View style={styles.modalHeader}>
              <TouchableOpacity
                style={styles.modalBackBtn}
                onPress={() => setSelectedStore(null)}
              >
                <Text style={styles.modalBackBtnText}>✕ Close</Text>
              </TouchableOpacity>
              <Text style={styles.modalHeaderTitle} numberOfLines={1}>
                {selectedStore.name}
              </Text>
              <TouchableOpacity
                style={styles.cartHeaderButton}
                onPress={() => setCartModalVisible(true)}
              >
                <Text style={{ fontSize: 16 }}>🛍️</Text>
                {cart.length > 0 && (
                  <View style={styles.cartBadge}>
                    <Text style={styles.cartBadgeText}>
                      {cart.reduce((s, i) => s + i.qty, 0)}
                    </Text>
                  </View>
                )}
              </TouchableOpacity>
            </View>

            <ScrollView showsVerticalScrollIndicator={false}>
              <Image
                source={{ uri: selectedStore.image }}
                style={styles.storeModalBannerImage}
              />

              <View style={styles.storeModalContent}>
                <View style={styles.storeBadgeFloating}>
                  <Text style={styles.storeBadgeText}>{selectedStore.tag}</Text>
                </View>
                <Text style={styles.storeModalTitle}>{selectedStore.name}</Text>
                <Text style={styles.storeModalAddress}>📍 {selectedStore.address}</Text>
                <Text style={styles.storeModalDesc}>{selectedStore.description}</Text>

                <View style={styles.modalStatsRow}>
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatVal}>★ {selectedStore.rating}</Text>
                    <Text style={styles.modalStatLabel}>{selectedStore.reviewCount} Ratings</Text>
                  </View>
                  <View style={styles.modalStatDivider} />
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatVal}>{selectedStore.deliveryTime}</Text>
                    <Text style={styles.modalStatLabel}>Avg Delivery</Text>
                  </View>
                  <View style={styles.modalStatDivider} />
                  <View style={styles.modalStatItem}>
                    <Text style={styles.modalStatVal}>{selectedStore.distance}</Text>
                    <Text style={styles.modalStatLabel}>Proximity</Text>
                  </View>
                </View>

                {/* --- IN-STORE PRODUCT SEARCH BAR --- */}
                <View style={styles.storeSearchSection}>
                  <View style={styles.storeSearchBox}>
                    <Text style={styles.storeSearchIcon}>🔍</Text>
                    <TextInput
                      style={styles.storeSearchInput}
                      placeholder={`Search in ${selectedStore.name}...`}
                      placeholderTextColor="#8C938F"
                      value={storeProductSearch}
                      onChangeText={setStoreProductSearch}
                    />
                    {storeProductSearch.length > 0 && (
                      <TouchableOpacity
                        onPress={() => setStoreProductSearch('')}
                        style={{ padding: 4 }}
                      >
                        <Text style={{ color: COLORS.textMuted, fontSize: 16 }}>✕</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  {/* In-Store Category Chips */}
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    style={styles.storeCategoryScroll}
                    contentContainerStyle={{ gap: 6, paddingVertical: 4 }}
                  >
                    {storeUniqueCategories.map((cat) => {
                      const isCatActive = storeProductCategory === cat;
                      return (
                        <TouchableOpacity
                          key={cat}
                          style={[
                            styles.storeCatPill,
                            isCatActive && styles.storeCatPillActive,
                          ]}
                          onPress={() => setStoreProductCategory(cat)}
                        >
                          <Text
                            style={[
                              styles.storeCatPillText,
                              isCatActive && styles.storeCatPillTextActive,
                            ]}
                          >
                            {cat}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Store Catalog Header & Results Counter */}
                <View style={styles.catalogHeaderRow}>
                  <Text style={styles.sectionHeading}>
                    {storeProductSearch ? 'Matching Products' : 'Curated Catalog'}
                  </Text>
                  <Text style={styles.catalogCountText}>
                    {filteredStoreProducts.length} item{filteredStoreProducts.length === 1 ? '' : 's'}
                  </Text>
                </View>

                {/* Products List or Empty Search State */}
                {filteredStoreProducts.length === 0 ? (
                  <View style={styles.noProductBox}>
                    <Text style={{ fontSize: 36, marginBottom: 8 }}>🔍</Text>
                    <Text style={styles.noProductTitle}>No matching products</Text>
                    <Text style={styles.noProductSub}>
                      No items matched "{storeProductSearch}" in {selectedStore.name}.
                    </Text>
                    <TouchableOpacity
                      style={styles.resetSearchBtn}
                      onPress={() => {
                        setStoreProductSearch('');
                        setStoreProductCategory('All');
                      }}
                    >
                      <Text style={styles.resetSearchBtnText}>Show All Products</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  filteredStoreProducts.map((prod) => {
                    const inCartItem = cart.find((i) => i.id === prod.id);
                    return (
                      <View key={prod.id} style={styles.productCard}>
                        <View style={styles.productIconWrap}>
                          <Text style={{ fontSize: 26 }}>{prod.icon}</Text>
                        </View>
                        <View style={{ flex: 1, paddingHorizontal: 12 }}>
                          <Text style={styles.productName}>{prod.name}</Text>
                          <View style={styles.productBadgeRow}>
                            <Text style={styles.productCategoryPill}>{prod.category}</Text>
                          </View>
                          <Text style={styles.productPrice}>{formatNaira(prod.price)}</Text>
                        </View>

                        {inCartItem ? (
                          <View style={styles.qtyControlRow}>
                            <TouchableOpacity
                              style={styles.qtyButton}
                              onPress={() => removeFromCart(prod.id)}
                            >
                              <Text style={styles.qtyBtnText}>-</Text>
                            </TouchableOpacity>
                            <Text style={styles.qtyCountText}>{inCartItem.qty}</Text>
                            <TouchableOpacity
                              style={styles.qtyButton}
                              onPress={() => addToCart(prod, selectedStore)}
                            >
                              <Text style={styles.qtyBtnText}>+</Text>
                            </TouchableOpacity>
                          </View>
                        ) : (
                          <TouchableOpacity
                            style={styles.addProductBtn}
                            onPress={() => addToCart(prod, selectedStore)}
                            activeOpacity={0.8}
                          >
                            <Text style={styles.addProductBtnText}>+ Add</Text>
                          </TouchableOpacity>
                        )}
                      </View>
                    );
                  })
                )}
              </View>
            </ScrollView>

            {/* Bottom floating view cart bar */}
            {cart.length > 0 && (
              <View style={styles.bottomCartFloatingBar}>
                <View>
                  <Text style={styles.floatingCartCount}>
                    {cart.reduce((s, i) => s + i.qty, 0)} Items Selected
                  </Text>
                  <Text style={styles.floatingCartTotal}>{formatNaira(cartTotal)}</Text>
                </View>
                <TouchableOpacity
                  style={styles.floatingCheckoutBtn}
                  onPress={() => setCartModalVisible(true)}
                >
                  <Text style={styles.floatingCheckoutBtnText}>View Basket & Pay →</Text>
                </TouchableOpacity>
              </View>
            )}
          </SafeAreaView>
        )}
      </Modal>

      {/* --- CART & CHECKOUT MODAL --- */}
      <Modal
        visible={cartModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setCartModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={() => setCartModalVisible(false)}
            >
              <Text style={styles.modalBackBtnText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Your Selection</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView style={{ flex: 1, padding: 16 }}>
            {cart.length === 0 ? (
              <View style={styles.emptyCartBox}>
                <Image
                  source={LOGO_TRANSPARENT}
                  style={{ width: 90, height: 90, marginBottom: 12 }}
                  resizeMode="contain"
                />
                <Text style={styles.emptyCartTitle}>Your Basket is Empty</Text>
                <Text style={styles.emptyCartSub}>
                  Discover our curated stores to select your prime provisions.
                </Text>
                <TouchableOpacity
                  style={[styles.primaryActionBtn, { marginTop: 20 }]}
                  onPress={() => setCartModalVisible(false)}
                >
                  <Text style={styles.primaryActionBtnText}>Browse Stores</Text>
                </TouchableOpacity>
              </View>
            ) : (
              <>
                <View style={styles.cartBrandHeaderRow}>
                  <Image
                    source={LOGO_TRANSPARENT}
                    style={{ width: 32, height: 32, marginRight: 8 }}
                    resizeMode="contain"
                  />
                  <Text style={styles.cartSectionTitle}>Items in Basket</Text>
                </View>

                {cart.map((item) => (
                  <View key={item.id} style={styles.cartItemRow}>
                    <Text style={{ fontSize: 24, marginRight: 12 }}>{item.icon}</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.cartItemName}>{item.name}</Text>
                      <Text style={styles.cartItemStore}>{item.storeName}</Text>
                      <Text style={styles.cartItemPrice}>
                        {formatNaira(item.price * item.qty)}
                      </Text>
                    </View>
                    <View style={styles.qtyControlRow}>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => removeFromCart(item.id)}
                      >
                        <Text style={styles.qtyBtnText}>-</Text>
                      </TouchableOpacity>
                      <Text style={styles.qtyCountText}>{item.qty}</Text>
                      <TouchableOpacity
                        style={styles.qtyButton}
                        onPress={() => addToCart(item, { name: item.storeName })}
                      >
                        <Text style={styles.qtyBtnText}>+</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                ))}

                {/* Financial Summary */}
                <View style={styles.billBreakdownCard}>
                  <Text style={styles.billHeader}>Financial Overview</Text>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Item Subtotal</Text>
                    <Text style={styles.billVal}>{formatNaira(cartSubtotal)}</Text>
                  </View>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>White-Glove Courier</Text>
                    <Text style={styles.billVal}>{formatNaira(deliveryFee)}</Text>
                  </View>
                  <View style={styles.billRow}>
                    <Text style={styles.billLabel}>Concierge & Packaging</Text>
                    <Text style={styles.billVal}>{formatNaira(conciergeFee)}</Text>
                  </View>
                  <View style={styles.billDivider} />
                  <View style={styles.billRow}>
                    <Text style={styles.billTotalLabel}>Grand Total</Text>
                    <Text style={styles.billTotalVal}>{formatNaira(cartTotal)}</Text>
                  </View>
                </View>

                {/* Delivery Target */}
                <View style={styles.targetDeliveryCard}>
                  <Text style={styles.targetDeliveryLabel}>DESTINATION</Text>
                  <Text style={styles.targetDeliveryAddress}>📍 {selectedLocation}</Text>
                </View>

                {/* Checkout Trigger */}
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => setCheckoutModalVisible(true)}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryActionBtnText}>
                    Proceed to Pay • {formatNaira(cartTotal)}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- SIMULATED PAYSTACK MODAL --- */}
      <Modal
        visible={checkoutModalVisible}
        animationType="fade"
        transparent={true}
        onRequestClose={() => setCheckoutModalVisible(false)}
      >
        <View style={styles.checkoutOverlay}>
          <View style={styles.paystackPopup}>
            <View style={styles.paystackHeader}>
              {/* Official GETIT Logo at Top of Payment Gateway */}
              <View style={styles.paystackLogoBox}>
                <Image
                  source={LOGO_TRANSPARENT}
                  style={styles.paystackLogoImage}
                  resizeMode="contain"
                />
              </View>
              <Text style={styles.paystackBadge}>SECURE NIGERIAN CHECKOUT</Text>
              <Text style={styles.paystackTitle}>GETIT Pay Direct</Text>
              <Text style={styles.paystackAmount}>{formatNaira(cartTotal)}</Text>
            </View>

            <View style={styles.paystackBody}>
              <Text style={styles.paystackChannelText}>
                Supported: Mastercard, Visa, Verve, Bank Transfer & USSD
              </Text>

              <TouchableOpacity
                style={styles.paystackSuccessBtn}
                onPress={handleCheckout}
                activeOpacity={0.8}
              >
                <Text style={styles.paystackSuccessBtnText}>Confirm & Authorize Payment</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.paystackCancelBtn}
                onPress={() => setCheckoutModalVisible(false)}
              >
                <Text style={styles.paystackCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- LOCATION CHANGER MODAL --- */}
      <Modal
        visible={locationModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setLocationModalVisible(false)}
      >
        <View style={styles.locationModalOverlay}>
          <View style={styles.locationModalContent}>
            <View style={styles.locationModalHeader}>
              <Text style={styles.locationModalTitle}>Select Your Location</Text>
              <TouchableOpacity onPress={() => setLocationModalVisible(false)}>
                <Text style={{ fontSize: 18, color: COLORS.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            {LOCATIONS.map((loc) => {
              const isSelected = selectedLocation === loc;
              return (
                <TouchableOpacity
                  key={loc}
                  style={[
                    styles.locationOptionItem,
                    isSelected && styles.locationOptionItemActive,
                  ]}
                  onPress={() => {
                    setSelectedLocation(loc);
                    setLocationModalVisible(false);
                  }}
                >
                  <Text style={{ fontSize: 18, marginRight: 10 }}>📍</Text>
                  <Text
                    style={[
                      styles.locationOptionText,
                      isSelected && styles.locationOptionTextActive,
                    ]}
                  >
                    {loc}
                  </Text>
                  {isSelected && (
                    <Text style={{ color: COLORS.emeraldPrimary, fontWeight: 'bold' }}>✓</Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>
      </Modal>

      {/* --- CLASSY BOTTOM NAVIGATION --- */}
      <View style={styles.bottomNav}>
        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('home')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'home' && styles.navIconActive]}>
            🏛️
          </Text>
          <Text style={[styles.navText, activeTab === 'home' && styles.navTextActive]}>
            Stores
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('orders')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'orders' && styles.navIconActive]}>
            📦
          </Text>
          <Text style={[styles.navText, activeTab === 'orders' && styles.navTextActive]}>
            Orders
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setCartModalVisible(true)}
          activeOpacity={0.8}
        >
          <View>
            <Text style={styles.navIcon}>🛍️</Text>
            {cart.length > 0 && (
              <View style={styles.navBadge}>
                <Text style={styles.navBadgeText}>
                  {cart.reduce((s, i) => s + i.qty, 0)}
                </Text>
              </View>
            )}
          </View>
          <Text style={styles.navText}>Basket</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.navItem}
          onPress={() => setActiveTab('profile')}
          activeOpacity={0.8}
        >
          <Text style={[styles.navIcon, activeTab === 'profile' && styles.navIconActive]}>
            👤
          </Text>
          <Text style={[styles.navText, activeTab === 'profile' && styles.navTextActive]}>
            Account
          </Text>
        </TouchableOpacity>
      </View>
    </SafeAreaView>
  );
}

// --- High Luxury Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.emeraldDeep,
  },
  mainScrollView: {
    flex: 1,
    backgroundColor: COLORS.beigeBg,
  },

  // Header
  header: {
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 16,
    paddingTop: 12,
    paddingBottom: 16,
    borderBottomLeftRadius: 24,
    borderBottomRightRadius: 24,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 8,
  },
  headerTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  brandRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  brandLogoBox: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 10,
    padding: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 4,
  },
  brandLogoImage: {
    width: '100%',
    height: '100%',
  },
  brandTitle: {
    fontSize: 17,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
    fontFamily: 'serif',
  },
  brandSubtitle: {
    fontSize: 8,
    color: COLORS.roseGoldLight,
    letterSpacing: 1.5,
    fontWeight: '800',
  },
  cartHeaderButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.18)',
  },
  cartBadge: {
    position: 'absolute',
    top: -4,
    right: -4,
    backgroundColor: COLORS.roseGold,
    borderRadius: 10,
    minWidth: 18,
    height: 18,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 4,
    borderWidth: 1.5,
    borderColor: COLORS.emeraldDeep,
  },
  cartBadgeText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '900',
  },

  // Location selector
  locationSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 8,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.14)',
  },
  locationIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(183, 110, 121, 0.25)',
    alignItems: 'center',
    justifyContent: 'center',
  },
  locationOverline: {
    fontSize: 8.5,
    color: COLORS.roseGoldLight,
    fontWeight: '700',
    letterSpacing: 1,
  },
  locationText: {
    fontSize: 12.5,
    color: '#FFFFFF',
    fontWeight: '600',
  },
  locationChevron: {
    fontSize: 16,
    color: COLORS.roseGoldLight,
    marginLeft: 4,
  },

  // Search input
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 14,
    paddingVertical: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
  },
  searchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    padding: 0,
  },

  // Hero Welcome Banner
  heroBanner: {
    margin: 16,
    backgroundColor: COLORS.emeraldPrimary,
    borderRadius: 20,
    padding: 18,
    flexDirection: 'row',
    alignItems: 'center',
    overflow: 'hidden',
    position: 'relative',
    shadowColor: COLORS.emeraldDeep,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 5,
  },
  heroGlowCircle: {
    position: 'absolute',
    right: -20,
    bottom: -30,
    width: 140,
    height: 140,
    borderRadius: 70,
    backgroundColor: 'rgba(183, 110, 121, 0.25)',
  },
  heroTagPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 6,
  },
  heroTagText: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.roseGoldLight,
    letterSpacing: 1,
  },
  heroHeading: {
    fontSize: 18,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'serif',
    marginBottom: 4,
  },
  heroSubheading: {
    fontSize: 11,
    color: '#D1FAE5',
    lineHeight: 15,
  },
  heroLogoCard: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    borderWidth: 1.5,
    borderColor: COLORS.roseGoldLight,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.15,
    shadowRadius: 5,
    elevation: 3,
  },
  heroLogoImage: {
    width: '100%',
    height: '100%',
  },

  // Category section
  sectionHeaderRow: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    marginTop: 8,
    marginBottom: 10,
  },
  sectionHeading: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
    letterSpacing: 0.3,
  },
  sectionSubheading: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  sectionRoseGoldCount: {
    fontSize: 11,
    color: COLORS.roseGold,
    fontWeight: '700',
  },
  categoryScroll: {
    marginBottom: 16,
  },
  categoryScrollContent: {
    paddingHorizontal: 16,
    gap: 8,
  },
  categoryPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 10,
    borderRadius: 22,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 3,
    elevation: 1,
  },
  categoryPillActive: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldDeep,
  },
  categoryIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  categoryLabel: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  categoryLabelActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  storeCountBadge: {
    backgroundColor: COLORS.emeraldSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  storeCountText: {
    fontSize: 11,
    color: COLORS.emeraldPrimary,
    fontWeight: '700',
  },

  // --- Store Box Container Card ---
  storeBoxCard: {
    marginHorizontal: 16,
    marginBottom: 20,
    backgroundColor: COLORS.cardBg,
    borderRadius: 20,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    shadowColor: '#2B1B17',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.08,
    shadowRadius: 14,
    elevation: 4,
  },
  storeImageContainer: {
    width: '100%',
    height: 175,
    position: 'relative',
    backgroundColor: '#EDE8E1',
  },
  storeImage: {
    width: '100%',
    height: '100%',
  },
  imageOverlayShadow: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 60,
    backgroundColor: 'rgba(0,0,0,0.22)',
  },
  storeBadgeFloating: {
    position: 'absolute',
    top: 12,
    left: 12,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  storeBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  favoriteButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
  },
  storeImageBottomBar: {
    position: 'absolute',
    bottom: 10,
    left: 12,
    right: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  chipRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  infoGlassChip: {
    backgroundColor: 'rgba(20, 24, 20, 0.75)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 10,
  },
  infoGlassChipText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '700',
  },
  ratingChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(245, 158, 11, 0.2)',
  },
  ratingStar: {
    color: COLORS.starGold,
    fontSize: 12,
    marginRight: 3,
  },
  ratingScore: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  reviewCount: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginLeft: 2,
  },

  // Store Details below Image
  storeDetailsContainer: {
    padding: 16,
  },
  storeMainRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 4,
  },
  storeTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
    letterSpacing: 0.2,
  },
  storeCategoryLine: {
    fontSize: 11.5,
    color: COLORS.roseGold,
    fontWeight: '600',
    marginTop: 2,
  },
  storeOpenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emeraldSurface,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: COLORS.emeraldLight,
    marginRight: 4,
  },
  storeOpenText: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
    letterSpacing: 0.5,
  },
  storeDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginTop: 4,
    marginBottom: 12,
  },
  storeFooterRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  deliveryMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  deliveryFeeText: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  deliveryDot: {
    marginHorizontal: 4,
    color: COLORS.textMuted,
  },
  minOrderText: {
    fontSize: 10.5,
    color: COLORS.emeraldPrimary,
    fontWeight: '600',
  },
  viewStoreBtn: {
    backgroundColor: COLORS.roseGoldSurface,
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(183, 110, 121, 0.3)',
  },
  viewStoreBtnText: {
    fontSize: 11,
    color: COLORS.roseGold,
    fontWeight: '800',
  },

  // Store Details Modal
  modalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.beigeBg,
  },
  modalHeader: {
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 16,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  modalBackBtn: {
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  modalBackBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  modalHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '700',
    fontFamily: 'serif',
    maxWidth: '65%',
  },
  storeModalBannerImage: {
    width: '100%',
    height: 190,
  },
  storeModalContent: {
    padding: 16,
    paddingBottom: 110,
  },
  storeModalTitle: {
    fontSize: 21,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
    marginTop: 8,
  },
  storeModalAddress: {
    fontSize: 12,
    color: COLORS.roseGold,
    fontWeight: '600',
    marginTop: 4,
  },
  storeModalDesc: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    lineHeight: 18,
    marginTop: 8,
  },
  modalStatsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 12,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  modalStatItem: {
    alignItems: 'center',
  },
  modalStatVal: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  modalStatLabel: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  modalStatDivider: {
    width: 1,
    height: 24,
    backgroundColor: COLORS.borderBeige,
  },

  // In-Store Search Bar Section
  storeSearchSection: {
    marginTop: 18,
    marginBottom: 8,
  },
  storeSearchBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  storeSearchIcon: {
    fontSize: 14,
    marginRight: 8,
  },
  storeSearchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    padding: 0,
  },
  storeCategoryScroll: {
    marginTop: 8,
  },
  storeCatPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  storeCatPillActive: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldDeep,
  },
  storeCatPillText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  storeCatPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '700',
  },

  catalogHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 14,
    marginBottom: 10,
  },
  catalogCountText: {
    fontSize: 11.5,
    color: COLORS.roseGold,
    fontWeight: '700',
  },

  // Empty in-store search state
  noProductBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 24,
    marginTop: 10,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  noProductTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  noProductSub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    marginBottom: 14,
  },
  resetSearchBtn: {
    backgroundColor: COLORS.roseGoldSurface,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(183, 110, 121, 0.3)',
  },
  resetSearchBtnText: {
    fontSize: 11.5,
    color: COLORS.roseGold,
    fontWeight: '800',
  },

  // Product cards inside store
  productCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 4,
    elevation: 2,
  },
  productIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: COLORS.roseGoldSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(183, 110, 121, 0.2)',
  },
  productName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  productBadgeRow: {
    marginTop: 2,
  },
  productCategoryPill: {
    fontSize: 9.5,
    color: COLORS.roseGold,
    fontWeight: '700',
  },
  productPrice: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
    marginTop: 2,
  },
  addProductBtn: {
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  addProductBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  qtyControlRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emeraldSurface,
    borderRadius: 8,
    padding: 2,
  },
  qtyButton: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 6,
  },
  qtyBtnText: {
    fontSize: 15,
    fontWeight: 'bold',
    color: COLORS.emeraldDeep,
  },
  qtyCountText: {
    paddingHorizontal: 10,
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
  },

  // Bottom Floating cart inside modal
  bottomCartFloatingBar: {
    position: 'absolute',
    bottom: 20,
    left: 16,
    right: 16,
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 18,
    paddingHorizontal: 18,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
    elevation: 8,
  },
  floatingCartCount: {
    color: COLORS.roseGoldLight,
    fontSize: 11,
    fontWeight: '700',
  },
  floatingCartTotal: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  floatingCheckoutBtn: {
    backgroundColor: COLORS.roseGold,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
  },
  floatingCheckoutBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },

  // Cart Modal & Checkout
  emptyCartBox: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 60,
  },
  emptyCartTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  emptyCartSub: {
    fontSize: 12.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    maxWidth: '75%',
    marginTop: 6,
  },
  cartBrandHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cartSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  cartItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  cartItemName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  cartItemStore: {
    fontSize: 10.5,
    color: COLORS.roseGold,
    marginTop: 1,
  },
  cartItemPrice: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
    marginTop: 2,
  },
  billBreakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginTop: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  billHeader: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
    fontFamily: 'serif',
  },
  billRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  billLabel: {
    fontSize: 12,
    color: COLORS.textMuted,
  },
  billVal: {
    fontSize: 12,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  billDivider: {
    height: 1,
    backgroundColor: COLORS.borderBeige,
    marginVertical: 8,
  },
  billTotalLabel: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  billTotalVal: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.emeraldPrimary,
  },
  targetDeliveryCard: {
    backgroundColor: COLORS.roseGoldSurface,
    borderRadius: 14,
    padding: 12,
    marginTop: 12,
    borderWidth: 1,
    borderColor: 'rgba(183, 110, 121, 0.25)',
  },
  targetDeliveryLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.roseGold,
    letterSpacing: 1,
  },
  targetDeliveryAddress: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
    marginTop: 2,
  },
  primaryActionBtn: {
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: 'center',
    marginTop: 18,
    shadowColor: COLORS.emeraldDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  primaryActionBtnText: {
    color: '#FFFFFF',
    fontSize: 14,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Paystack Overlay
  checkoutOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.65)',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 20,
  },
  paystackPopup: {
    width: '100%',
    maxWidth: 360,
    backgroundColor: '#FFFFFF',
    borderRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.25,
    shadowRadius: 16,
    elevation: 10,
  },
  paystackHeader: {
    backgroundColor: COLORS.emeraldDeep,
    padding: 22,
    alignItems: 'center',
  },
  paystackLogoBox: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    marginBottom: 8,
  },
  paystackLogoImage: {
    width: '100%',
    height: '100%',
  },
  paystackBadge: {
    fontSize: 8.5,
    color: COLORS.roseGoldLight,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginBottom: 4,
  },
  paystackTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  paystackAmount: {
    fontSize: 22,
    fontWeight: '900',
    color: '#FFFFFF',
    marginTop: 4,
  },
  paystackBody: {
    padding: 20,
    alignItems: 'center',
  },
  paystackChannelText: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginBottom: 16,
    lineHeight: 16,
  },
  paystackSuccessBtn: {
    width: '100%',
    backgroundColor: COLORS.emeraldPrimary,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    marginBottom: 8,
  },
  paystackSuccessBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  paystackCancelBtn: {
    paddingVertical: 8,
  },
  paystackCancelBtnText: {
    color: COLORS.textMuted,
    fontSize: 12,
    fontWeight: '600',
  },

  // Orders Tab
  orderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  orderCardHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  orderCardSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  orderStatusPill: {
    backgroundColor: COLORS.emeraldSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
  },
  orderStatusText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
  },
  pinBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
  },
  pinLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.roseGoldLight,
    letterSpacing: 1,
  },
  pinInstructions: {
    fontSize: 10,
    color: '#D1FAE5',
    marginTop: 2,
    maxWidth: '90%',
  },
  pinNumberWrap: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  pinNumberText: {
    fontSize: 18,
    fontWeight: '900',
    color: '#FFFFFF',
    letterSpacing: 2,
  },
  orderFooterRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  orderTotalText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  orderEtaText: {
    fontSize: 11,
    color: COLORS.roseGold,
    fontWeight: '700',
  },

  // Profile Tab
  profileAvatarBox: {
    alignItems: 'center',
    marginVertical: 20,
  },
  profileAvatarCircle: {
    width: 84,
    height: 84,
    borderRadius: 42,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 2.5,
    borderColor: COLORS.roseGold,
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: COLORS.roseGold,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  profileLogoAvatar: {
    width: '100%',
    height: '100%',
  },
  profileName: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  profileTier: {
    fontSize: 12,
    color: COLORS.roseGold,
    fontWeight: '700',
    marginTop: 2,
  },
  profileMenuCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 8,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  profileMenuItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 12,
  },
  profileMenuIcon: {
    fontSize: 18,
    marginRight: 12,
  },
  profileMenuText: {
    fontSize: 13,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  profileMenuDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    marginHorizontal: 12,
  },

  // Location Modal
  locationModalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.55)',
    justifyContent: 'flex-end',
  },
  locationModalContent: {
    backgroundColor: '#FFFFFF',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 20,
    paddingBottom: 36,
  },
  locationModalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 16,
  },
  locationModalTitle: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  locationOptionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 13,
    paddingHorizontal: 12,
    borderRadius: 12,
    marginBottom: 6,
  },
  locationOptionItemActive: {
    backgroundColor: COLORS.emeraldSurface,
  },
  locationOptionText: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  locationOptionTextActive: {
    color: COLORS.emeraldPrimary,
    fontWeight: '800',
  },

  // Bottom Navigation
  bottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 72,
    backgroundColor: '#FFFFFF',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: COLORS.borderBeige,
    paddingBottom: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 10,
  },
  navItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  navIcon: {
    fontSize: 20,
    marginBottom: 2,
    opacity: 0.6,
  },
  navIconActive: {
    opacity: 1,
  },
  navText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: COLORS.textMuted,
  },
  navTextActive: {
    color: COLORS.emeraldDeep,
    fontWeight: '800',
  },
  navBadge: {
    position: 'absolute',
    top: -4,
    right: -8,
    backgroundColor: COLORS.roseGold,
    borderRadius: 8,
    minWidth: 16,
    height: 16,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 3,
  },
  navBadgeText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },
});
