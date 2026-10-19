import React, { useState, useRef, useEffect, useMemo } from 'react';
import {
  StyleSheet,
  Text,
  View,
  ScrollView,
  FlatList,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  SafeAreaView,
  StatusBar,
  Dimensions,
  Image,
  Linking,
  ActivityIndicator,
  Animated,
  Easing,
  Platform,
  RefreshControl,
  AppState,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import MapView, { Marker, Polyline } from 'react-native-maps';
import * as Location from 'expo-location';
import * as DocumentPicker from 'expo-document-picker';
import { SAMPLE_BOLT_RIDERS } from './services/boltDeliveryService';
import { NIGERIAN_GROCERIES_CATALOG } from './data/nigerianGroceriesCatalog';
import { REAL_ROAD_LEGS, REAL_ROAD_POINTS, REAL_ROAD_WAYPOINTS } from './realRoadRouteData';
import {
  addStoreInventoryItem,
  updateStoreInventoryItem,
  createDatabaseOrder,
  getDatabaseOrders,
  updateDatabaseOrderStatus,
  subscribeToOrders,
  flushPendingOfflineOrders,
  getStores,
  createDatabaseStore,
  subscribeToStores,
  subscribeToStoreInventory,
  subscribeToLiveBroadcast,
  broadcastLiveEvent,
  getStoreInventory,
  updateDatabaseStore,
  deleteDatabaseStore,
  parseStoreMetadata,
  findDatabaseUser,
  registerDatabaseUser,
  seedDefaultDatabaseUsers,
  DEFAULT_DATABASE_USERS,
  logDatabaseEvent,
  submitDatabaseReview,
  getStoreReviews,
} from './services/supabaseService';
import {
  registerForPushNotificationsAsync,
  subscribeToInAppNotifications,
  triggerNotification,
  playAudioBeep,
  notifyOrderPlaced,
  notifyCourierDispatched,
  notifyOrderOnTheWay,
  notifyCourierArrived,
  notifyOrderDelivered,
  notifyMerchantAcceptanceReminder,
  notifyMerchantPrepReminder,
} from './services/notificationService';
import { getProductImageSource } from './assets/productImages';

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

// --- Delivery Locations & Searchable Directory ---
const SEARCHABLE_LOCATIONS = [
  // Abuja
  {
    id: 'abj-1',
    name: 'Plot 14 Gana Street',
    district: 'Maitama District, Abuja',
    city: 'Abuja',
    latitude: 9.0882,
    longitude: 7.4933,
    landmark: 'Opposite Transcorp Hilton, Black Gate with Security Post',
    apartment: 'Suite 4B, Emerald Crest',
  },
  {
    id: 'abj-2',
    name: 'Adetokunbo Ademola Crescent',
    district: 'Wuse 2, Abuja',
    city: 'Abuja',
    latitude: 9.0745,
    longitude: 7.4768,
    landmark: 'Opposite AP Plaza, Beige Duplex',
    apartment: 'Flat 1B',
  },
  {
    id: 'abj-3',
    name: 'Nelson Mandela Street',
    district: 'Asokoro Presidential Wing, Abuja',
    city: 'Abuja',
    latitude: 9.0435,
    longitude: 7.5218,
    landmark: 'Close to ECOWAS Secretariat',
    apartment: 'Villa 7',
  },
  {
    id: 'abj-4',
    name: 'Aminu Kano Crescent',
    district: 'Wuse 2 Commercial Hub, Abuja',
    city: 'Abuja',
    latitude: 9.0792,
    longitude: 7.4721,
    landmark: 'Near Banex Plaza & KFC',
    apartment: 'Block C, Unit 2',
  },
  {
    id: 'abj-5',
    name: 'Jabi Lake Mall Promenade',
    district: 'Jabi District, Abuja',
    city: 'Abuja',
    latitude: 9.0684,
    longitude: 7.4265,
    landmark: 'Jabi Lake Promenade / Shoprite Mall Entrance',
    apartment: 'Lakeside Penthouse 3',
  },
  {
    id: 'abj-6',
    name: '3rd Avenue, Gwarinpa Estate',
    district: 'Gwarinpa Estate, Abuja',
    city: 'Abuja',
    latitude: 9.1085,
    longitude: 7.3912,
    landmark: 'Near Charlie Boy Bus Stop, House 45',
    apartment: 'Apartment 2',
  },
  {
    id: 'abj-7',
    name: 'Area 11 & Garki 2',
    district: 'Garki District, Abuja',
    city: 'Abuja',
    latitude: 9.0354,
    longitude: 7.4912,
    landmark: 'Near Area 11 Shopping Center',
    apartment: 'House 12',
  },
  {
    id: 'abj-8',
    name: 'Guzape Hills High Ridge',
    district: 'Guzape District, Abuja',
    city: 'Abuja',
    latitude: 9.0221,
    longitude: 7.5268,
    landmark: 'Behind Channel 5 TV Tower',
    apartment: 'Hilltop Villa 9',
  },
  {
    id: 'abj-9',
    name: 'Katampe Extension Diplomatic Zone',
    district: 'Katampe, Abuja',
    city: 'Abuja',
    latitude: 9.1215,
    longitude: 7.4561,
    landmark: 'Near Aso Radio Mast',
    apartment: 'Diplomatic Enclave, House 14',
  },
  {
    id: 'abj-10',
    name: 'Apo Resettlement Boulevard',
    district: 'Apo, Abuja',
    city: 'Abuja',
    latitude: 8.9954,
    longitude: 7.5023,
    landmark: 'Opposite Shoprite Grand Towers Mall',
    apartment: 'Zone B, House 22',
  },
  {
    id: 'abj-11',
    name: 'Constitution Avenue, CBD',
    district: 'Central Business District, Abuja',
    city: 'Abuja',
    latitude: 9.0578,
    longitude: 7.4951,
    landmark: 'Near Churchgate Towers & National Mosque',
    apartment: 'Towers East, 5th Floor',
  },
  // Lagos
  {
    id: 'lag-1',
    name: 'Bourdillon Road',
    district: 'Ikoyi Crescent, Lagos',
    city: 'Lagos',
    latitude: 6.4549,
    longitude: 3.4346,
    landmark: 'Beside Golden Gate Restaurant',
    apartment: 'Penthouse 12',
  },
  {
    id: 'lag-2',
    name: 'Ahmadu Bello Way',
    district: 'Victoria Island, Lagos',
    city: 'Lagos',
    latitude: 6.4281,
    longitude: 3.4219,
    landmark: 'Behind Eko Hotels, Silver Gate',
    apartment: 'Tower B, Apt 304',
  },
  {
    id: 'lag-3',
    name: 'Admiralty Way',
    district: 'Lekki Phase 1, Lagos',
    city: 'Lagos',
    latitude: 6.4474,
    longitude: 3.4723,
    landmark: 'Near Lekki-Ikoyi Link Bridge round-about',
    apartment: 'House 18',
  },
  {
    id: 'lag-4',
    name: 'Banana Island Ocean Parade',
    district: 'Banana Island, Ikoyi, Lagos',
    city: 'Lagos',
    latitude: 6.4632,
    longitude: 3.4478,
    landmark: 'Ocean Parade Towers, Gate 1',
    apartment: 'Tower 4, Floor 8',
  },
  {
    id: 'lag-5',
    name: 'Isaac John Street, GRA',
    district: 'Ikeja GRA, Lagos',
    city: 'Lagos',
    latitude: 6.5892,
    longitude: 3.3582,
    landmark: 'Opposite Radisson Blu Hotel',
    apartment: 'Duplex 8A',
  },
  {
    id: 'lag-6',
    name: 'Chevron Drive & Northern Foreshore',
    district: 'Lekki / Chevron, Lagos',
    city: 'Lagos',
    latitude: 6.4385,
    longitude: 3.5358,
    landmark: 'Opposite Chevron Nigeria Head Office Gate',
    apartment: 'Block 5, Flat 2',
  },
  {
    id: 'lag-7',
    name: 'Adeola Odeku Street',
    district: 'Victoria Island, Lagos',
    city: 'Lagos',
    latitude: 6.4312,
    longitude: 3.4158,
    landmark: 'Near Globacom HQ & Standard Chartered Bank',
    apartment: 'Suite 201',
  },
  {
    id: 'lag-8',
    name: 'Bode Thomas Street',
    district: 'Surulere, Lagos',
    city: 'Lagos',
    latitude: 6.4956,
    longitude: 3.3562,
    landmark: 'Near Adeniran Ogunsanya Mall',
    apartment: 'House 34B',
  },
  {
    id: 'lag-9',
    name: 'Commercial Avenue',
    district: 'Yaba / Sabo Tech Hub, Lagos',
    city: 'Lagos',
    latitude: 6.5126,
    longitude: 3.3768,
    landmark: 'Near E-Center & Ozone Cinemas',
    apartment: 'Tech Park Loft 3',
  },
  {
    id: 'lag-10',
    name: 'Magodo Phase 2 Brooks Estate',
    district: 'Shangisha / Magodo, Lagos',
    city: 'Lagos',
    latitude: 6.6192,
    longitude: 3.3854,
    landmark: 'Brooks Estate Gate, Emmanuel Keshi Street',
    apartment: 'House 7',
  },
  // Famous Nigerian Supermarkets, Pharmacies & Plazas
  {
    id: 'hmedix-1',
    name: 'H-Medix Pharmacy & Supermarket (Wuse 2)',
    district: 'Adetokunbo Ademola Crescent, Wuse 2, Abuja',
    city: 'Abuja',
    latitude: 9.0718,
    longitude: 7.4856,
    landmark: 'Opposite Cubana Suites, Wuse 2',
    apartment: 'Main Shopping Complex',
  },
  {
    id: 'hmedix-2',
    name: 'H-Medix Pharmacy & Supermarket (Gwarinpa)',
    district: 'Wole Soyinka Avenue / 3rd Avenue, Gwarinpa, Abuja',
    city: 'Abuja',
    latitude: 9.1085,
    longitude: 7.4223,
    landmark: '3rd Avenue Junction, Gwarinpa Estate',
    apartment: 'Plaza Wing',
  },
  {
    id: 'hmedix-3',
    name: 'H-Medix Pharmacy & Supermarket (Asokoro)',
    district: 'Yakubu Gowon Crescent, Asokoro, Abuja',
    city: 'Abuja',
    latitude: 9.0433,
    longitude: 7.5265,
    landmark: 'Beside Aso Radio, Asokoro',
    apartment: 'Commercial Suite 1',
  },
  {
    id: 'hmedix-4',
    name: 'H-Medix Pharmacy & Stores (Maitama)',
    district: 'Ibrahim Babangida Boulevard, Maitama, Abuja',
    city: 'Abuja',
    latitude: 9.1057,
    longitude: 7.4857,
    landmark: 'Maitama Shopping Complex, IBB Way',
    apartment: 'Ground Floor',
  },
  {
    id: 'hmedix-5',
    name: 'H-Medix Pharmacy & Stores (Area 11 Garki)',
    district: 'Area 11, Garki District, Abuja',
    city: 'Abuja',
    latitude: 9.0354,
    longitude: 7.4912,
    landmark: 'Near Area 11 Shopping Center',
    apartment: 'Block B',
  },
  {
    id: 'hmedix-6',
    name: 'H-Medix Pharmacy & Stores (Kubwa)',
    district: 'Gado Nasko Road, Kubwa, Abuja',
    city: 'Abuja',
    latitude: 9.1450,
    longitude: 7.3320,
    landmark: 'Opposite NYSC Camp Junction, Kubwa',
    apartment: 'Suite 2',
  },
  {
    id: 'store-4u',
    name: '4U Supermarket (formerly Amigo)',
    district: 'Adetokunbo Ademola Crescent, Wuse 2, Abuja',
    city: 'Abuja',
    latitude: 9.0734,
    longitude: 7.4789,
    landmark: 'Beside Sterling Bank, Wuse 2',
    apartment: 'Supermarket Complex',
  },
  {
    id: 'store-next',
    name: 'Next Cash and Carry Hypermarket',
    district: 'Ahmadu Bello Way, Jahi / Kado, Abuja',
    city: 'Abuja',
    latitude: 9.0984,
    longitude: 7.4321,
    landmark: 'Next Cash & Carry Express Expressway',
    apartment: 'Main Entrance Mall Gate',
  },
  {
    id: 'store-dunes',
    name: 'Dunes Center Abuja',
    district: 'Aguiyi Ironsi Street, Maitama, Abuja',
    city: 'Abuja',
    latitude: 9.0832,
    longitude: 7.4912,
    landmark: 'Opposite Riverplate Park, Maitama',
    apartment: 'Dunes Luxury Center',
  },
  {
    id: 'store-transcorp',
    name: 'Transcorp Hilton Hotel',
    district: '1 Aguiyi Ironsi Street, Maitama, Abuja',
    city: 'Abuja',
    latitude: 9.0749,
    longitude: 7.4948,
    landmark: 'Main Gate Security Post, Maitama',
    apartment: 'Lobby & Suites',
  },
  {
    id: 'store-sahad',
    name: 'Sahad Stores (Central Area)',
    district: 'Central Business District, Abuja',
    city: 'Abuja',
    latitude: 9.0521,
    longitude: 7.4934,
    landmark: 'Near Area 10 & Defence HQ, CBD',
    apartment: 'Sahad Mega Mall',
  },
  {
    id: 'store-ebeano-abj',
    name: 'Prince Ebeano Supermarket (Lokogoma)',
    district: 'Lokogoma Expressway, Abuja',
    city: 'Abuja',
    latitude: 8.9745,
    longitude: 7.4312,
    landmark: 'Near Lokogoma Junction, Abuja',
    apartment: 'Supermarket Gate',
  },
  {
    id: 'store-ebeano-lag',
    name: 'Prince Ebeano Supermarket (Lekki)',
    district: 'Admiralty Way, Lekki Phase 1, Lagos',
    city: 'Lagos',
    latitude: 6.4485,
    longitude: 3.4750,
    landmark: 'Admiralty Way near Ebeano lane',
    apartment: 'Lekki Mall',
  },
  {
    id: 'store-megaplaza',
    name: 'Mega Plaza Century 21 Mall',
    district: 'Idowu Martins Street, Victoria Island, Lagos',
    city: 'Lagos',
    latitude: 6.4315,
    longitude: 3.4215,
    landmark: 'Near Saka Tinubu Street, VI',
    apartment: 'Mega Plaza Complex',
  },
  {
    id: 'store-palms',
    name: 'The Palms Shopping Mall',
    district: 'BIS Way, Lekki / Victoria Island, Lagos',
    city: 'Lagos',
    latitude: 6.4382,
    longitude: 3.4491,
    landmark: 'Palms Mall Gate 1',
    apartment: 'Palms Complex',
  },
  {
    id: 'store-icm',
    name: 'Ikeja City Mall (Shoprite)',
    district: 'Obafemi Awolowo Way, Alausa, Ikeja, Lagos',
    city: 'Lagos',
    latitude: 6.6190,
    longitude: 3.3580,
    landmark: 'Near Lagos State Secretariat, Alausa',
    apartment: 'ICM Mall',
  },
  // Residential Courts & Luxury Estates in Nigeria
  {
    id: 'court-rock-katampe',
    name: 'The Rock Court',
    district: 'M.T. Mbu Close, Katampe Extension, Abuja',
    city: 'Abuja',
    latitude: 9.121765,
    longitude: 7.448041,
    landmark: 'M.T. Mbu Close, off Mamman Kontagora Crescent, Katampe Extension',
    apartment: 'The Rock Court Residences',
  },
  {
    id: 'court-rock-katampe-alt1',
    name: 'The Rock Court (Katampe Extension)',
    district: 'Katampe Extension Diplomatic Zone, Abuja',
    city: 'Abuja',
    latitude: 9.121765,
    longitude: 7.448041,
    landmark: 'M.T. Mbu Close, off Mamman Kontagora Crescent',
    apartment: 'The Rock Court',
  },
  {
    id: 'court-rock-katampe-alt2',
    name: 'The Rock Court Estate',
    district: 'M.T. Mbu Close, Katampe Extension, Abuja',
    city: 'Abuja',
    latitude: 9.121765,
    longitude: 7.448041,
    landmark: 'M.T. Mbu Close, Katampe Extension',
    apartment: 'The Rock Court Estate Gate',
  },
  {
    id: 'court-rock-mbu-close',
    name: 'M.T. Mbu Close (The Rock Court)',
    district: 'Katampe Extension, Abuja',
    city: 'Abuja',
    latitude: 9.121765,
    longitude: 7.448041,
    landmark: 'Opposite Hilltop Ridge, The Rock Court Gate',
    apartment: 'The Rock Court Complex',
  },
  {
    id: 'court-crown-mabushi',
    name: 'Crown Court Estate',
    district: 'Mabushi District, Abuja',
    city: 'Abuja',
    latitude: 9.0820,
    longitude: 7.4410,
    landmark: 'Behind Federal Ministry of Works, Mabushi',
    apartment: 'Gate 1, Crown Court',
  },
  {
    id: 'court-carlton-maitama',
    name: 'Carlton Gate Estate',
    district: 'Maitama District, Abuja',
    city: 'Abuja',
    latitude: 9.0910,
    longitude: 7.4890,
    landmark: 'Close to British High Commission',
    apartment: 'Carlton Gate Main Entrance',
  },
  {
    id: 'court-rockview-wuse2',
    name: 'Rockview Hotel & Court',
    district: 'Adetokunbo Ademola Crescent, Wuse 2, Abuja',
    city: 'Abuja',
    latitude: 9.0760,
    longitude: 7.4820,
    landmark: 'Near Wuse 2 Zone',
    apartment: 'Rockview Complex',
  },
];

const MAP_PRESETS = SEARCHABLE_LOCATIONS;
const LOCATIONS = SEARCHABLE_LOCATIONS.map((p) => p.district);

// --- Curated Categories ---
const CATEGORIES = [
  { id: 'all', name: 'All Stores', icon: '✨' },
  { id: 'gourmet', name: 'Gourmet Marts', icon: '🥂' },
  { id: 'organic', name: 'Organic & Fresh', icon: '🌿' },
  { id: 'bakery', name: 'Artisan Bakery', icon: '🥐' },
  { id: 'cellar', name: 'Pantry & Cellar', icon: '🍷' },
  { id: 'heritage', name: 'Local Specialties', icon: '🌾' },
];

// --- Curated Luxury Store Cover Photo Presets ---
const STORE_COVER_PRESETS = [
  {
    id: 'cover-gourmet',
    title: 'Gourmet Supermarket',
    category: 'Gourmet Groceries & Deli',
    url: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
    icon: '🛒',
  },
  {
    id: 'cover-organic',
    title: 'Fresh Organic Mart',
    category: 'Fruits & Organics',
    url: 'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=1200&q=80',
    icon: '🌿',
  },
  {
    id: 'cover-boutique',
    title: 'Modern Luxury Mart',
    category: 'Provisions & Essentials',
    url: 'https://images.unsplash.com/photo-1586015555751-63bb77f4322a?auto=format&fit=crop&w=1200&q=80',
    icon: '✨',
  },
  {
    id: 'cover-pharmacy',
    title: 'Pharmacy & Wellness',
    category: 'Medicines & Health',
    url: 'https://images.unsplash.com/photo-1607613009820-a29f7bb81c04?auto=format&fit=crop&w=1200&q=80',
    icon: '💊',
  },
  {
    id: 'cover-bakery',
    title: 'Artisan Bakery & Deli',
    category: 'Breads & Pastries',
    url: 'https://images.unsplash.com/photo-1509440159596-0249088772ff?auto=format&fit=crop&w=1200&q=80',
    icon: '🥐',
  },
  {
    id: 'cover-cellar',
    title: 'Cellar & Fine Drinks',
    category: 'Wines & Beverages',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?auto=format&fit=crop&w=1200&q=80',
    icon: '🍾',
  },
];

// --- Featured Stores Around Me ---
const STORES_AROUND_ME = [
  {
    id: 'store-1792192743654',
    name: 'Mega Stores',
    category: 'gourmet',
    categoryLabel: 'Gourmet Groceries & Provisions',
    rating: 5.0,
    reviewCount: 'Verified',
    distance: '0.8 km',
    deliveryTime: '15-25 min',
    deliveryFee: '₦1,200',
    freeDeliveryThreshold: 25000,
    tag: 'FEATURED MEGA STORE',
    badgeColor: COLORS.emeraldPrimary,
    address: 'Plot 14 Gana Street, Maitama',
    district: 'Maitama, Abuja',
    latitude: 9.124943,
    longitude: 7.439559,
    openTime: '08:00 AM',
    closeTime: '10:00 PM',
    is24Hours: true,
    operatingDays: 'Mon - Sun (Daily)',
    image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
    description: 'Mega Stores — prime provisions, artisanal goods, groceries and rapid doorstep delivery across Abuja.',
    phone: '0545802140',
    isOpen: true,
    is_open: true,
    products: [],
  },
];

// --- Financial formatting helper ---
function formatNaira(amount) {
  if (!amount && amount !== 0) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-NG');
}

// --- Bulk Inventory Parser & Templates for POS / SRT / CSV Upload ---
const BULK_SAMPLE_TEMPLATES = {
  supermarket: `1
Truffle Infused Extra Virgin Oil (250ml)
₦16,500
Pantry & Provisions

2
Aged Parmigiano Reggiano (300g)
₦12,800
Gourmet Dairy

3
Organic Raw Acacia Honey (500g)
₦11,500
Organic Fresh

4
Wagyu Ribeye Steak A5 (300g)
₦62,000
Butchery & Meat

5
Fresh Norwegian Smoked Trout (200g)
₦15,800
Fresh Seafood

6
Artisan Sourdough Country Loaf
₦4,800
Artisan Bakery

7
San Pellegrino Sparkling Water (750ml)
₦2,900
Beverages`,

  pharmacy: `Paracetamol Extra Strength 500mg, 1500, Pharmacy & Wellness
Vitamin C 1000mg Effervescent (20s), 4500, Pharmacy & Wellness
Omega-3 Triple Strength Fish Oil, 12500, Pharmacy & Wellness
Cetirizine Antihistamine 10mg, 2200, Pharmacy & Wellness
Digital Fast Infrared Thermometer, 8500, Pharmacy & Wellness
Hydrating Gentle Face Cleanser 250ml, 9800, Pharmacy & Wellness
Broad Spectrum Sunscreen SPF 50+, 14200, Pharmacy & Wellness`,

  cellar: `Moët & Chandon Brut Impérial Champagne, 48500, Cellar & Spirits
Veuve Clicquot Yellow Label 750ml, 58000, Cellar & Spirits
Hennessy VSOP Privilège Cognac, 72000, Cellar & Spirits
Johnnie Walker Blue Label Whisky, 240000, Cellar & Spirits
Dom Pérignon Vintage Champagne, 185000, Cellar & Spirits
Château Margaux Premier Grand Cru, 350000, Cellar & Spirits`,
};

function parseInventoryText(text) {
  if (!text || typeof text !== 'string') return [];

  const lines = text.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
  const products = [];

  const extractPrice = (str) => {
    if (!str) return 0;
    const clean = str.replace(/[₦N\$#,\s]/gi, '').replace(/\.00$/, '');
    const num = parseFloat(clean);
    return isNaN(num) ? 0 : Math.round(num);
  };

  const guessCategoryAndIcon = (name, catCandidate = '') => {
    const combined = `${name} ${catCandidate}`.toLowerCase();
    if (combined.includes('wine') || combined.includes('champagne') || combined.includes('cognac') || combined.includes('whisky') || combined.includes('vodka') || combined.includes('beer') || combined.includes('gin') || combined.includes('spirits')) {
      return { category: 'Cellar & Spirits', icon: '🍾' };
    }
    if (combined.includes('cheese') || combined.includes('milk') || combined.includes('butter') || combined.includes('yogurt') || combined.includes('dairy')) {
      return { category: 'Gourmet Dairy', icon: '🧀' };
    }
    if (combined.includes('beef') || combined.includes('steak') || combined.includes('chicken') || combined.includes('meat') || combined.includes('pork') || combined.includes('lamb') || combined.includes('butcher')) {
      return { category: 'Butchery & Meat', icon: '🥩' };
    }
    if (combined.includes('salmon') || combined.includes('fish') || combined.includes('prawn') || combined.includes('seafood') || combined.includes('shrimp') || combined.includes('crab')) {
      return { category: 'Fresh Seafood', icon: '🐟' };
    }
    if (combined.includes('bread') || combined.includes('croissant') || combined.includes('cake') || combined.includes('bakery') || combined.includes('pastry') || combined.includes('loaf')) {
      return { category: 'Artisan Bakery', icon: '🥐' };
    }
    if (combined.includes('oil') || combined.includes('vinegar') || combined.includes('pasta') || combined.includes('rice') || combined.includes('sauce') || combined.includes('spice') || combined.includes('grain') || combined.includes('crayfish') || combined.includes('garri') || combined.includes('honey')) {
      return { category: 'Pantry & Provisions', icon: '🫒' };
    }
    if (combined.includes('water') || combined.includes('juice') || combined.includes('soda') || combined.includes('coffee') || combined.includes('tea') || combined.includes('drink') || combined.includes('beverage')) {
      return { category: 'Beverages', icon: '🥤' };
    }
    if (combined.includes('apple') || combined.includes('berry') || combined.includes('fruit') || combined.includes('vegetable') || combined.includes('tomato') || combined.includes('organic') || combined.includes('salad')) {
      return { category: 'Organic Fresh', icon: '🍓' };
    }
    if (combined.includes('paracetamol') || combined.includes('vitamin') || combined.includes('pharmacy') || combined.includes('drug') || combined.includes('syrup') || combined.includes('thermometer') || combined.includes('capsule')) {
      return { category: 'Pharmacy & Wellness', icon: '💊' };
    }
    return {
      category: catCandidate && catCandidate.length > 2 ? catCandidate : 'Pantry & Provisions',
      icon: '🛍️',
    };
  };

  // 1. Try SRT / Subtitle numbered block parsing
  const srtBlocks = text.split(/\r?\n\r?\n/).map((b) => b.trim()).filter(Boolean);
  if (srtBlocks.length > 1 && srtBlocks.some((b) => /^\d+[\r\n]/.test(b))) {
    for (const block of srtBlocks) {
      const bLines = block.split(/\r?\n/).map((l) => l.trim()).filter(Boolean);
      const contentLines = bLines.filter((l) => !/^\d+$/.test(l) && !l.includes('-->'));
      if (contentLines.length >= 2) {
        let name = contentLines[0];
        let price = extractPrice(contentLines[1]);
        let cat = contentLines[2] || '';
        if (price === 0 && extractPrice(name) > 0) {
          const temp = name;
          name = contentLines[1];
          price = extractPrice(temp);
        }
        if (name && price > 0) {
          const { category, icon } = guessCategoryAndIcon(name, cat);
          products.push({
            id: `imp-${Math.random().toString(36).substr(2, 7)}-${Date.now().toString().slice(-4)}`,
            name,
            price,
            category,
            icon,
            outOfStock: false,
          });
        }
      }
    }
    if (products.length > 0) return products;
  }

  // 2. Try Delimited Lines Parsing (CSV, TSV, Semicolon, Pipe, Dash, Colon)
  for (const line of lines) {
    if (/^(id|item|product|name|sku|description)/i.test(line) && /price/i.test(line)) {
      continue; // Skip header row
    }

    let parts = [];
    if (line.includes('\t')) parts = line.split('\t');
    else if (line.includes(',')) parts = line.split(',');
    else if (line.includes(';')) parts = line.split(';');
    else if (line.includes('|')) parts = line.split('|');
    else if (line.includes(' - ')) parts = line.split(' - ');
    else if (line.includes(':')) parts = line.split(':');

    parts = parts.map((p) => p.trim()).filter(Boolean);

    if (parts.length >= 2) {
      let name = parts[0];
      let pricePart = parts[1];
      let catPart = parts[2] || '';

      let price = extractPrice(pricePart);
      if (price === 0 && extractPrice(name) > 0) {
        price = extractPrice(name);
        name = parts[1];
      }

      if (name && price > 0) {
        const { category, icon } = guessCategoryAndIcon(name, catPart);
        products.push({
          id: `imp-${Math.random().toString(36).substr(2, 7)}-${Date.now().toString().slice(-4)}`,
          name: name.replace(/^["']|["']$/g, ''),
          price,
          category,
          icon,
          outOfStock: false,
        });
      }
    }
  }

  return products;
}

// --- LUXURY ANIMATED STOREFRONT DOOR (SHUTS WHEN STORE IS CLOSED) ---
function AnimatedStoreDoor({ store, operatingDays, isOpenToday, openTime }) {
  const doorAnim = useRef(new Animated.Value(0)).current;
  const lockAnim = useRef(new Animated.Value(0)).current;
  const signAnim = useRef(new Animated.Value(0)).current;
  const knockAnim = useRef(new Animated.Value(0)).current;
  const [knockCount, setKnockCount] = useState(0);
  const [knockMessage, setKnockMessage] = useState(null);

  const runCloseSequence = () => {
    doorAnim.setValue(0);
    lockAnim.setValue(0);
    setKnockMessage(null);

    Animated.spring(doorAnim, {
      toValue: 1,
      friction: 5.5,
      tension: 30,
      useNativeDriver: false,
    }).start(() => {
      Animated.spring(lockAnim, {
        toValue: 1,
        friction: 3.5,
        tension: 65,
        useNativeDriver: false,
      }).start();
    });
  };

  useEffect(() => {
    runCloseSequence();

    const swayLoop = Animated.loop(
      Animated.sequence([
        Animated.timing(signAnim, {
          toValue: 1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
        Animated.timing(signAnim, {
          toValue: -1,
          duration: 1800,
          easing: Easing.inOut(Easing.sin),
          useNativeDriver: false,
        }),
      ])
    );
    swayLoop.start();

    return () => swayLoop.stop();
  }, [store?.id]);

  const handleKnock = () => {
    Animated.sequence([
      Animated.timing(knockAnim, { toValue: -8, duration: 45, useNativeDriver: false }),
      Animated.timing(knockAnim, { toValue: 8, duration: 45, useNativeDriver: false }),
      Animated.timing(knockAnim, { toValue: -5, duration: 45, useNativeDriver: false }),
      Animated.timing(knockAnim, { toValue: 5, duration: 45, useNativeDriver: false }),
      Animated.timing(knockAnim, { toValue: 0, duration: 45, useNativeDriver: false }),
    ]).start();

    const nextCount = knockCount + 1;
    setKnockCount(nextCount);

    const msgs = [
      `🚪 *Knock Knock* — Nobody is at the front counter! "${store?.name || 'Store'}" is closed today (${operatingDays || 'Schedule'}).`,
      `🔒 *Clang!* The front deadbolt is locked shut. Doors will reopen during active operating hours!`,
      `📦 Staff is off right now! You are welcome to browse all provisions in the catalog below.`,
      `✨ Fresh luxury stock will be ready upon reopening! Feel free to browse and inspect pricing below.`,
    ];
    setKnockMessage(msgs[(nextCount - 1) % msgs.length]);
  };

  const leftDoorTranslate = doorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-260, 0],
  });

  const rightDoorTranslate = doorAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [260, 0],
  });

  const signRotate = signAnim.interpolate({
    inputRange: [-1, 1],
    outputRange: ['-4deg', '4deg'],
  });

  const lockScale = lockAnim.interpolate({
    inputRange: [0, 0.6, 1],
    outputRange: [0, 1.3, 1],
  });

  return (
    <Animated.View style={[styles.doorPortalContainer, { transform: [{ translateX: knockAnim }] }]}>
      {/* Arch Facade Header */}
      <View style={styles.doorPortalHeader}>
        <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
          <Text style={{ fontSize: 13, marginRight: 6 }}>🏛️</Text>
          <Text style={styles.doorPortalHeaderTitle} numberOfLines={1}>
            {(store?.name || 'STORE').toUpperCase()} • STOREFRONT ENTRANCE
          </Text>
        </View>
        <View style={styles.doorPortalStatusPill}>
          <Text style={styles.doorPortalStatusPillText}>CLOSED</Text>
        </View>
      </View>

      {/* The 3D Entrance Stage */}
      <View style={styles.doorStage}>
        {/* Dimly lit luxury interior background */}
        <View style={styles.doorInteriorBackdrop}>
          <Text style={{ fontSize: 30, opacity: 0.16 }}>🍷 🧀 🥖 🍾 🥩 🍇</Text>
          <Text style={styles.doorInteriorBackdropText}>STORE CLOSED TO CUSTOMERS</Text>
        </View>

        {/* Sliding Double Doors */}
        <View style={styles.doorsWrap}>
          {/* Left Door */}
          <Animated.View
            style={[
              styles.doorPanel,
              styles.doorPanelLeft,
              { transform: [{ translateX: leftDoorTranslate }] },
            ]}
          >
            <View style={styles.doorWindowRow}>
              <View style={styles.doorWindowPane}>
                <View style={styles.doorGlassHighlight} />
              </View>
              <View style={styles.doorWindowPane}>
                <View style={styles.doorGlassHighlight} />
              </View>
            </View>
            <View style={styles.doorWindowRow}>
              <View style={styles.doorWindowPane}>
                <View style={styles.doorGlassHighlight} />
              </View>
              <View style={styles.doorWindowPane}>
                <View style={styles.doorGlassHighlight} />
              </View>
            </View>
            <View style={styles.doorKickPlate}>
              <Text style={{ fontSize: 9.5, color: '#D97706', opacity: 0.7, fontWeight: '800' }}>GETIT LUXE</Text>
            </View>
            {/* Long Gold Handle Left Door */}
            <View style={styles.doorHandleLeft} />
          </Animated.View>

          {/* Right Door */}
          <Animated.View
            style={[
              styles.doorPanel,
              styles.doorPanelRight,
              { transform: [{ translateX: rightDoorTranslate }] },
            ]}
          >
            <View style={styles.doorWindowRow}>
              <View style={styles.doorWindowPane}>
                <View style={styles.doorGlassHighlight} />
              </View>
              <View style={styles.doorWindowPane}>
                <View style={styles.doorGlassHighlight} />
              </View>
            </View>
            <View style={styles.doorWindowRow}>
              <View style={styles.doorWindowPane}>
                <View style={styles.doorGlassHighlight} />
              </View>
              <View style={styles.doorWindowPane}>
                <View style={styles.doorGlassHighlight} />
              </View>
            </View>
            <View style={styles.doorKickPlate}>
              <Text style={{ fontSize: 9.5, color: '#D97706', opacity: 0.7, fontWeight: '800' }}>GETIT LUXE</Text>
            </View>
            {/* Long Gold Handle Right Door */}
            <View style={styles.doorHandleRight} />
          </Animated.View>
        </View>

        {/* Hanging Wooden Sign (Swinging on Chains) */}
        <Animated.View
          style={[
            styles.hangingSignWrapper,
            { transform: [{ rotate: signRotate }] },
          ]}
        >
          <View style={styles.hangingSignChainsRow}>
            <Text style={{ color: '#D97706', fontSize: 12 }}>⛓️</Text>
            <Text style={{ color: '#D97706', fontSize: 12 }}>⛓️</Text>
          </View>
          <TouchableOpacity
            style={styles.hangingSignBoard}
            onPress={handleKnock}
            activeOpacity={0.85}
          >
            <Text style={styles.hangingSignTitle}>⛔ SORRY, WE'RE CLOSED</Text>
            <Text style={styles.hangingSignSub} numberOfLines={1}>
              {!isOpenToday ? `Operating Schedule: ${operatingDays}` : `Regular Hours: ${openTime || 'See Schedule'}`}
            </Text>
          </TouchableOpacity>
        </Animated.View>

        {/* Central Golden Deadbolt / Padlock Seal */}
        <Animated.View
          style={[
            styles.doorCenterLock,
            { transform: [{ scale: lockScale }] },
          ]}
        >
          <View style={styles.doorCenterLockInner}>
            <Text style={{ fontSize: 15 }}>🔒</Text>
            <Text style={styles.doorCenterLockText}>LOCKED</Text>
          </View>
        </Animated.View>
      </View>

      {/* Interactive Knock Speech Toast */}
      {knockMessage && (
        <View style={styles.doorSpeechBubble}>
          <Text style={styles.doorSpeechBubbleText}>{knockMessage}</Text>
        </View>
      )}

      {/* Action Footer Bar */}
      <View style={styles.doorFooterBar}>
        <TouchableOpacity
          style={styles.doorKnockActionBtn}
          onPress={handleKnock}
          activeOpacity={0.8}
        >
          <Text style={styles.doorKnockActionBtnText}>🚪 Knock on Door</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.doorReplayActionBtn}
          onPress={runCloseSequence}
          activeOpacity={0.8}
        >
          <Text style={styles.doorReplayActionBtnText}>Replay Close 🔄</Text>
        </TouchableOpacity>
      </View>

      {/* Friendly Customer Advice Box */}
      <View style={styles.doorCustomerAdviceBox}>
        <Text style={styles.doorCustomerAdviceText}>
          🛒 <Text style={{ fontWeight: '800', color: '#F1F5F9' }}>Provisions Browsing Active:</Text> You can still browse products, prices, and catalog items below. Ordering and rider dispatch will resume during active operating hours.
        </Text>
      </View>
    </Animated.View>
  );
}


// =========================================================================
// =========================================================================
// STRAIGHT-LINE COURIER TRACKER FOR MERCHANT (RESPONSIVE ZERO-MAP VECTOR)
// =========================================================================
function MerchantStraightLineTracker({ order, currentStore }) {
  if (!order) return null;

  const [, setStraightLineTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setStraightLineTick((n) => n + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const stops = Array.isArray(order.stops) && order.stops.length > 0 ? order.stops : [];
  let myStopIndex = stops.findIndex(
    (st) =>
      (currentStore?.id && st.storeId === currentStore.id) ||
      (currentStore?.name && st.storeName && st.storeName.toLowerCase() === currentStore.name.toLowerCase())
  );
  if (myStopIndex === -1) myStopIndex = 0;

  const priorStops = stops.slice(0, myStopIndex);
  const hasPriorStops = priorStops.length > 0;

  // Haversine formula helper
  function calcDist(lat1, lon1, lat2, lon2) {
    const R = 6371;
    const dLat = (lat2 - lat1) * (Math.PI / 180);
    const dLon = (lon2 - lon1) * (Math.PI / 180);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(lat1 * (Math.PI / 180)) * Math.cos(lat2 * (Math.PI / 180)) *
      Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // -------------------------------------------------------------------------
  // ACCURATE TURN-BY-TURN ROAD DISTANCE (RECONCILED 1:1 WITH BUYER MAP ROUTE)
  // -------------------------------------------------------------------------
  const myStop = stops[myStopIndex];
  const storeLat = Number(myStop?.latitude || currentStore?.coordinates?.latitude || 9.0882);
  const storeLng = Number(myStop?.longitude || currentStore?.coordinates?.longitude || 7.4933);

  const currentRiderStop = order.currentStopIndex || 0;
  const isMyStopCompleted = myStop?.pickupStatus === 'picked_up' || currentRiderStop > myStopIndex;

  let accurateRemainingKm = 0;
  let activeRoadProgress = 0;

  const roadLegs = order.roadLegs && Array.isArray(order.roadLegs) && order.roadLegs.length > 0 ? order.roadLegs : null;

  if (isMyStopCompleted) {
    accurateRemainingKm = 0;
    activeRoadProgress = 1.0;
  } else if (roadLegs) {
    // In multi-stop route:
    // Leg 0: Waypoint 0 (Store 0) -> Waypoint 1 (Store 1)
    // Leg 1: Waypoint 1 (Store 1) -> Waypoint 2 (Home or Store 2)
    const legIdxToMe = myStopIndex;
    const activeLeg = roadLegs[currentRiderStop] || roadLegs[0] || [];
    const elapsedTrackerIdx = order.legStartedAt
      ? Math.min(activeLeg.length - 1, Math.floor((Date.now() - order.legStartedAt) / 3000))
      : (order.roadPointIndex || 0);
    const roadPtIdx = Math.min(Math.max(elapsedTrackerIdx, order.roadPointIndex || 0), Math.max(0, activeLeg.length - 1));

    if (currentRiderStop === legIdxToMe) {
      // Rider is actively traveling on the leg to THIS shop!
      let remKm = 0;
      for (let i = roadPtIdx; i < activeLeg.length - 1; i++) {
        remKm += calcDist(activeLeg[i].latitude, activeLeg[i].longitude, activeLeg[i + 1].latitude, activeLeg[i + 1].longitude);
      }
      accurateRemainingKm = remKm;
      activeRoadProgress = Math.min(1.0, Math.max(0, roadPtIdx / Math.max(1, activeLeg.length - 1)));
    } else if (currentRiderStop < legIdxToMe) {
      // Rider is on an earlier leg (picking up at a prior store, e.g. Stop 0 while this is Stop 1)
      let remCurrentLeg = 0;
      for (let i = roadPtIdx; i < activeLeg.length - 1; i++) {
        remCurrentLeg += calcDist(activeLeg[i].latitude, activeLeg[i].longitude, activeLeg[i + 1].latitude, activeLeg[i + 1].longitude);
      }
      let intermediateKm = 0;
      for (let l = currentRiderStop + 1; l <= legIdxToMe; l++) {
        const intermediateLeg = roadLegs[l] || [];
        for (let j = 0; j < intermediateLeg.length - 1; j++) {
          intermediateKm += calcDist(intermediateLeg[j].latitude, intermediateLeg[j].longitude, intermediateLeg[j + 1].latitude, intermediateLeg[j + 1].longitude);
        }
      }
      const hopFallback = Number(myStop?.distanceFromPrevKm) || 1.8;
      accurateRemainingKm = remCurrentLeg + (intermediateKm > 0.1 ? intermediateKm : hopFallback);
      activeRoadProgress = Math.min(0.9, Math.max(0.1, roadPtIdx / Math.max(1, activeLeg.length - 1)));
    } else {
      accurateRemainingKm = 0;
      activeRoadProgress = 1.0;
    }
  } else {
    // Fallback if roadLegs are direct or pending
    const riderLat = Number(order.boltCoords?.latitude || (stops[0]?.latitude ? Number(stops[0].latitude) - 0.012 : 9.0762));
    const riderLng = Number(order.boltCoords?.longitude || (stops[0]?.longitude ? Number(stops[0].longitude) - 0.010 : 7.4833));

    const directKm = calcDist(riderLat, riderLng, storeLat, storeLng);
    // Real road distance in city grid is ~1.4x straight line
    const roadEstimatedKm = directKm * 1.4;

    if (hasPriorStops && currentRiderStop === 0) {
      const priorHop = Number(myStop?.distanceFromPrevKm) || 1.6;
      accurateRemainingKm = Math.max(roadEstimatedKm, priorHop + 0.8);
      activeRoadProgress = 0.25;
    } else {
      accurateRemainingKm = roadEstimatedKm;
      const legPoints = (order.roadLegs && order.roadLegs[0]?.length) || 30;
      const elapsedFallbackIdx = order.legStartedAt
        ? Math.min(legPoints - 1, Math.floor((Date.now() - order.legStartedAt) / 2000))
        : (order.roadPointIndex || 0);
      const roadIdx = Math.min(Math.max(elapsedFallbackIdx, order.roadPointIndex || 0), legPoints - 1);
      activeRoadProgress = Math.min(1.0, Math.max(0.08, roadIdx / legPoints));
    }
  }

  // Threshold: under 60 meters means rider has arrived outside the store!
  const isAtShop = accurateRemainingKm < 0.06 || isMyStopCompleted;
  const distText = isAtShop
    ? 'Arrived at shop'
    : accurateRemainingKm < 1
    ? Math.round(accurateRemainingKm * 1000) + 'm away'
    : accurateRemainingKm.toFixed(1) + ' km away';

  // Realistic city transit speed (22 km/h) accounts for turns, traffic, and intersections
  const allocatedMins = Math.max(1, Math.round((accurateRemainingKm / 22) * 60));
  const etaText = isAtShop ? 'Arrived outside' : '~' + allocatedMins + ' min' + (allocatedMins === 1 ? '' : 's');

  let bikePercent = 15;
  let statusMessage = '';

  if (!hasPriorStops) {
    // Single Direct Leg: First shop sees a direct straight line from Rider to Shop
    if (isAtShop) {
      bikePercent = 90;
      statusMessage = '🛵 Courier Musa has arrived outside! Handover PIN: ' + (order.pickupPin || '5821');
    } else {
      bikePercent = Math.min(88, Math.max(8, Math.round(activeRoadProgress * 88)));
      statusMessage = '🚴 Courier Musa is en route directly to your shop (' + distText + ')';
    }
  } else {
    // Multi-Stop Leg: Second shop sees the intermediate stop before their store
    const firstStopName = priorStops[0]?.storeName || '1st Shop';
    const isFirstStopDone = currentRiderStop > 0 || (priorStops[0]?.pickupStatus === 'picked_up');

    if (!isFirstStopDone) {
      // Rider is still heading to or at the 1st stop
      bikePercent = Math.min(44, Math.max(8, Math.round(activeRoadProgress * 44)));
      statusMessage = '⏳ Courier is picking up at 1st Stop (' + firstStopName + ') • ' + distText + '. Heading to you next!';
    } else {
      // 1st stop is done! Rider is on the leg to this shop
      if (isAtShop) {
        bikePercent = 90;
        statusMessage = '🛵 Courier Musa has arrived outside! Handover PIN: ' + (order.pickupPin || '5821');
      } else {
        bikePercent = Math.min(88, Math.max(52, 50 + Math.round(activeRoadProgress * 38)));
        statusMessage = '🚀 1st stop completed! Musa is riding directly to your shop (' + distText + ')';
      }
    }
  }

  // Clamped bike percentage strictly between 6% and 88% so the bubble NEVER overflows the card on any screen size
  const clampedBikePercent = Math.min(88, Math.max(6, bikePercent));
  const isFirstStopDone = currentRiderStop > 0 || (priorStops[0]?.pickupStatus === 'picked_up');
  const storeDisplay = currentStore?.name || myStop?.storeName || 'Your Shop';

  return (
    <View style={styles.mStraightTrackContainer}>
      {/* 1. Header Row (Auto-wrapping, flex-shrink safe) */}
      <View style={styles.mStraightTrackHeader}>
        <View style={styles.mStraightTitleGroup}>
          <View style={styles.mStraightRadarDot} />
          <Text style={styles.mStraightTrackTitle} numberOfLines={1}>LIVE COURIER TRACKER</Text>
        </View>
        <View style={styles.mStraightEtaPill}>
          <Text style={styles.mStraightEtaText}>⏱️ {etaText} • {distText}</Text>
        </View>
      </View>

      {/* 2. Courier Info Row (Flex: 1 for rider name, compact PIN badge) */}
      <View style={styles.mStraightRiderRow}>
        <Text style={styles.mStraightRiderText} numberOfLines={1}>
          Rider: <Text style={{ color: '#F8FAFC', fontWeight: '700' }}>{order.boltRider?.name || 'Musa Ibrahim'}</Text>
          {order.boltRider?.vehicle ? ' (' + order.boltRider.vehicle.split(' ')[0] + ')' : ''}
        </Text>
        <View style={styles.mStraightPinBadge}>
          <Text style={styles.mStraightPinBadgeText}>
            PIN: <Text style={{ fontWeight: '900', color: '#10B981' }}>{order.pickupPin || '5821'}</Text>
          </Text>
        </View>
      </View>

      {/* 3. The Straight Line Track Area (Safe horizontal margins to prevent clipping) */}
      <View style={styles.mStraightLineWrapper}>
        <View style={styles.mStraightTrackBackground} />
        <View style={[styles.mStraightTrackFill, { width: clampedBikePercent + '%' }]} />

        {/* Origin Node */}
        <View style={styles.mStraightOriginNode}>
          <View style={styles.mStraightOriginDot} />
        </View>

        {/* Intermediate Stop Node (if multi-stop) */}
        {hasPriorStops && (
          <View style={styles.mStraightMiddleStopWrapper}>
            <View style={[
              styles.mStraightStopNode,
              isFirstStopDone ? styles.mStraightStopNodeDone : styles.mStraightStopNodeActive,
            ]}>
              <Text style={styles.mStraightStopNodeText}>{isFirstStopDone ? '✓' : '1'}</Text>
            </View>
          </View>
        )}

        {/* Destination Store Node */}
        <View style={styles.mStraightDestNodeWrapper}>
          <View style={styles.mStraightDestNode}>
            <Text style={{ fontSize: 11 }}>🏪</Text>
          </View>
        </View>

        {/* Moving Motorbike Marker (Clamped & centered) */}
        <View style={[styles.mStraightBikeMarker, { left: clampedBikePercent + '%' }]}>
          <View style={styles.mStraightBikeBubble}>
            <Text style={{ fontSize: 13 }}>🛵</Text>
          </View>
        </View>
      </View>

      {/* 4. Milestone Labels Row (Pure Flexbox - Never spills or clips) */}
      <View style={styles.mStraightMilestonesRow}>
        <Text style={styles.mStraightMilestoneLeft} numberOfLines={1}>
          Dispatched
        </Text>

        {hasPriorStops && (
          <Text style={[styles.mStraightMilestoneCenter, isFirstStopDone && { color: '#34D399' }]} numberOfLines={1}>
            {isFirstStopDone ? '✓ 1st Stop' : '● 1st Stop'}
          </Text>
        )}

        <Text style={styles.mStraightMilestoneRight} numberOfLines={1}>
          {storeDisplay}
        </Text>
      </View>

      {/* 5. Status Banner */}
      <View style={styles.mStraightStatusBanner}>
        <Text style={styles.mStraightStatusText} numberOfLines={2}>
          {statusMessage}
        </Text>
      </View>
    </View>
  );
}

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState('Plot 14 Gana Street, Maitama, Abuja');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(['store-1792192743654']);

  // Pinned Map Location State for Customer & Riders
  const mapRef = useRef(null);
  const cartMapRef = useRef(null);
  const cartFullscreenMapRef = useRef(null);
  const [cartMapSize, setCartMapSize] = useState('compact'); // 'compact' (220px) | 'tall' (390px)
  const [isCartMapFullscreen, setIsCartMapFullscreen] = useState(false);
  const [cartMapRegion, setCartMapRegion] = useState(null);
  const [cartScrollEnabled, setCartScrollEnabled] = useState(true);
  const cartMapInitialFitDoneRef = useRef(false);
  const [customStoreOrder, setCustomStoreOrder] = useState([]);
  const storeMiniMapRef = useRef(null);
  const storeFullMapRef = useRef(null);
  const buyerExploreMapRef = useRef(null);
  const [cameFromCart, setCameFromCart] = useState(false);
  const searchDebounceRef = useRef(null);
  const [mapSearchText, setMapSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);
  const [userLiveCoords, setUserLiveCoords] = useState(null);
  const [activeSearchPins, setActiveSearchPins] = useState([]);
  const [liveApiResults, setLiveApiResults] = useState([]);
  const [acknowledgedDiffLocation, setAcknowledgedDiffLocation] = useState(false);

  const [pinnedLocation, setPinnedLocation] = useState({
    name: 'Plot 14 Gana Street, Maitama, Abuja',
    district: 'Maitama District, Abuja',
    latitude: 9.0882,
    longitude: 7.4933,
    apartment: 'Suite 4B, Emerald Crest',
    landmark: 'Opposite Transcorp Hilton, Black Gate with Security Post',
    notes: 'Call on arrival for estate gate clearance',
  });
  const [mapCoords, setMapCoords] = useState({
    latitude: 9.0882,
    longitude: 7.4933,
  });
  const [mapRegion, setMapRegion] = useState({
    latitude: 9.0882,
    longitude: 7.4933,
    latitudeDelta: 0.012,
    longitudeDelta: 0.012,
  });
  const [mapStreetAddress, setMapStreetAddress] = useState('Plot 14 Gana Street');
  const [mapApartment, setMapApartment] = useState('Suite 4B, Emerald Crest');
  const [mapLandmark, setMapLandmark] = useState('Opposite Transcorp Hilton, Black Gate with Security Post');
  const [mapNotes, setMapNotes] = useState('Call on arrival for estate gate clearance');
  const [riderDeliveryNote, setRiderDeliveryNote] = useState('Call on arrival for estate gate clearance');
  const [activeDistrictId, setActiveDistrictId] = useState('abj-1');

  // Selected Store Modal & In-Store Product Search
  const [selectedStore, setSelectedStore] = useState(null);
  const [storeProductSearch, setStoreProductSearch] = useState('');
  const [storeProductCategory, setStoreProductCategory] = useState('All');
  const [storeCatalogViewMode, setStoreCatalogViewMode] = useState('grid'); // 'grid' | 'list'

  // Cart State
  const [cart, setCart] = useState([]);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [selectedDeliveryTier, setSelectedDeliveryTier] = useState('bolt'); // 'bolt' | 'concierge'

  const [storesList, setStoresList] = useState(STORES_AROUND_ME);
  const [appMode, setAppMode] = useState('customer'); // 'customer' | 'merchant'

  const appModeRef = useRef(appMode);
  const currentUserRef = useRef(null);
  const currentMerchantStoreRef = useRef(null);

  useEffect(() => {
    appModeRef.current = appMode;
  }, [appMode]);
  const [merchantTab, setMerchantTab] = useState('orders'); // 'orders' | 'inventory' | 'finances' | 'store'
  const [merchantStoreId, setMerchantStoreId] = useState(null); // set dynamically on merchant sign in
  const [merchantOrderFilter, setMerchantOrderFilter] = useState('new'); // 'all' | 'new' | 'preparing' | 'ready' | 'completed'
  const [storeOpenStatus, setStoreOpenStatus] = useState(true);
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
  const [addModalTab, setAddModalTab] = useState('suggested'); // 'suggested' | 'custom'
  const [suggestedSearch, setSuggestedSearch] = useState('');
  const [suggestedCategoryFilter, setSuggestedCategoryFilter] = useState('All');
  const [adjustedPrices, setAdjustedPrices] = useState({});
  const [addedItemsTracker, setAddedItemsTracker] = useState({});
  const [customProductName, setCustomProductName] = useState('');
  const [customProductPrice, setCustomProductPrice] = useState('');
  const [customProductCategory, setCustomProductCategory] = useState('Pantry');
  const [customProductIcon, setCustomProductIcon] = useState('🛍️');
  const [customProductImage, setCustomProductImage] = useState(null);
  const [newProductName, setNewProductName] = useState('');
  const [newProductPrice, setNewProductPrice] = useState('');
  const [newProductCategory, setNewProductCategory] = useState('Pantry');
  const [newProductIcon, setNewProductIcon] = useState('🛍️');
  const [bulkImportModalVisible, setBulkImportModalVisible] = useState(false);
  const [bulkImportText, setBulkImportText] = useState('');
  const [bulkParsedProducts, setBulkParsedProducts] = useState([]);
  const [bulkImportActiveTab, setBulkImportActiveTab] = useState('upload'); // 'upload' | 'paste' | 'template'
  const [bulkSelectedFileName, setBulkSelectedFileName] = useState('');
  const [isParsingFile, setIsParsingFile] = useState(false);

  // Create Store Modal State
  const [createStoreModalVisible, setCreateStoreModalVisible] = useState(false);
  const [newStoreName, setNewStoreName] = useState('');
  const [newStoreCategory, setNewStoreCategory] = useState('Gourmet Groceries');
  const [newStoreDistrict, setNewStoreDistrict] = useState('Maitama District, Abuja');
  const [newStoreAddress, setNewStoreAddress] = useState('Plot 14 Gana Street');
  const [newStorePhone, setNewStorePhone] = useState('+234 803 123 4567');
  const [newStoreDeliveryFee, setNewStoreDeliveryFee] = useState('1200');
  const [newStoreDeliveryTime, setNewStoreDeliveryTime] = useState('15-25 min');
  const [newStoreDescription, setNewStoreDescription] = useState('');
  const [isCreatingStore, setIsCreatingStore] = useState(false);

  // --- Customer Reviews & Post-Order Feedback State (Number 7) ---
  const [reviewsList, setReviewsList] = useState([]);
  const [reviewModalVisible, setReviewModalVisible] = useState(false);
  const [targetReviewOrder, setTargetReviewOrder] = useState(null);

  // Auto-launch Rating & Reviews sheet as soon as the courier delivers the order (Bolt delivery style)
  const promptedReviewsRef = useRef(new Set());
  useEffect(() => {
    if (!reviewModalVisible) {
      const deliveredOrder = orders.find(
        (o) => (o.status === 'Delivered' || o.eta === 'Delivered') && !promptedReviewsRef.current.has(o.id)
      );
      if (deliveredOrder) {
        promptedReviewsRef.current.add(deliveredOrder.id);
        const timer = setTimeout(() => {
          openReviewModalForOrder(deliveredOrder);
        }, 600);
        return () => clearTimeout(timer);
      }
    }
  }, [orders, reviewModalVisible]);
  const [reviewStoreIndex, setReviewStoreIndex] = useState(0);
  const [storeRatingsMap, setStoreRatingsMap] = useState({});
  const [courierRatingScore, setCourierRatingScore] = useState(5);
  const [courierSelectedTags, setCourierSelectedTags] = useState(['⚡ Lightning Fast', '🧤 Handled with Care']);
  const [courierTipAmount, setCourierTipAmount] = useState(500);
  const [courierCommentText, setCourierCommentText] = useState('');
  const [storeReviewsModalVisible, setStoreReviewsModalVisible] = useState(false);
  const [storeReviewsViewing, setStoreReviewsViewing] = useState([]);
  const [isSubmittingReview, setIsSubmittingReview] = useState(false);

  // --- Push Notifications & In-App Floating Audio Chimes (Number 4) ---
  const [activeToastNotification, setActiveToastNotification] = useState(null);
  const toastAnimY = useRef(new Animated.Value(-120)).current;
  const toastOpacity = useRef(new Animated.Value(0)).current;

  // --- USER AUTH & PROFILES (BUYER & SELLER) ---
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authScreenRole, setAuthScreenRole] = useState('buyer'); // 'buyer' | 'seller'
  const [authScreenMode, setAuthScreenMode] = useState('signin'); // 'signin' | 'signup'
  const [authLoginInput, setAuthLoginInput] = useState('');
  const [authLoginPassword, setAuthLoginPassword] = useState('');
  const [authSignupFullName, setAuthSignupFullName] = useState('');
  const [authSignupEmail, setAuthSignupEmail] = useState('');
  const [authSignupPhone, setAuthSignupPhone] = useState('');
  const [authSignupAddress, setAuthSignupAddress] = useState('Maitama District, Abuja');
  const [authSignupBusinessName, setAuthSignupBusinessName] = useState('');
  const [authSignupPassword, setAuthSignupPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showSignupOptional, setShowSignupOptional] = useState(false);

  // Smooth Animations
  const authFadeAnim = useRef(new Animated.Value(1)).current;
  const authSlideAnim = useRef(new Animated.Value(0)).current;
  const logoScaleAnim = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(logoScaleAnim, {
          toValue: 1.04,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(logoScaleAnim, {
          toValue: 1.0,
          duration: 2200,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, []);

  const switchAuthRole = (newRole) => {
    Animated.parallel([
      Animated.timing(authFadeAnim, { toValue: 0, duration: 140, useNativeDriver: true }),
      Animated.timing(authSlideAnim, { toValue: 8, duration: 140, useNativeDriver: true }),
    ]).start(() => {
      setAuthScreenRole(newRole);
      setAuthScreenMode('signin');
      Animated.parallel([
        Animated.timing(authFadeAnim, { toValue: 1, duration: 220, useNativeDriver: true }),
        Animated.timing(authSlideAnim, { toValue: 0, duration: 220, useNativeDriver: true }),
      ]).start();
    });
  };

  const switchAuthMode = (newMode) => {
    Animated.parallel([
      Animated.timing(authFadeAnim, { toValue: 0, duration: 120, useNativeDriver: true }),
      Animated.timing(authSlideAnim, { toValue: 6, duration: 120, useNativeDriver: true }),
    ]).start(() => {
      setAuthScreenMode(newMode);
      Animated.parallel([
        Animated.timing(authFadeAnim, { toValue: 1, duration: 180, useNativeDriver: true }),
        Animated.timing(authSlideAnim, { toValue: 0, duration: 180, useNativeDriver: true }),
      ]).start();
    });
  };

  const [currentUser, setCurrentUser] = useState(null);
  const [authModalVisible, setAuthModalVisible] = useState(false);
  const [authTab, setAuthTab] = useState('buyer'); // 'buyer' | 'seller'
  const [authName, setAuthName] = useState('');
  const [authEmail, setAuthEmail] = useState('');
  const [authPhone, setAuthPhone] = useState('');
  const [authAddress, setAuthAddress] = useState('Plot 14 Gana Street, Maitama');
  const [authBusinessName, setAuthBusinessName] = useState('');

  // --- STORE OPERATING SCHEDULE & TIMING STATE ---
  const [timingModalVisible, setTimingModalVisible] = useState(false);
  const [storeTiming, setStoreTiming] = useState({
    is24Hours: false,
    openTime: '08:00 AM',
    closeTime: '10:00 PM',
    operatingDays: 'Weekends Only',
  });
  const [tempIs24Hours, setTempIs24Hours] = useState(false);
  const [tempOpenTime, setTempOpenTime] = useState('08:00 AM');
  const [tempCloseTime, setTempCloseTime] = useState('10:00 PM');
  const [tempOperatingDays, setTempOperatingDays] = useState('Weekends Only');

  const openTimingModal = () => {
    const activeStore = storesList.find((s) => s.id === merchantStoreId) || currentMerchantStore || storesList[0];
    const activeIs24 = activeStore?.is24Hours !== undefined ? activeStore.is24Hours : storeTiming.is24Hours;
    const activeOpen = activeStore?.openTime || storeTiming.openTime || '08:00 AM';
    const activeClose = activeStore?.closeTime || storeTiming.closeTime || '10:00 PM';
    const activeDays = activeStore?.operatingDays || storeTiming.operatingDays || 'Mon - Sun (Daily)';

    setTempIs24Hours(Boolean(activeIs24));
    setTempOpenTime(activeOpen);
    setTempCloseTime(activeClose);
    setTempOperatingDays(activeDays);
    setTimingModalVisible(true);
  };

  const handleSelectMerchantBranch = async (storeId) => {
    setMerchantStoreId(storeId);
    const targetStore = storesList.find((s) => s.id === storeId);
    if (targetStore) {
      const is24 = Boolean(targetStore.is24Hours);
      setStoreTiming({
        is24Hours: is24,
        openTime: targetStore.openTime || '08:00 AM',
        closeTime: targetStore.closeTime || '10:00 PM',
        operatingDays: targetStore.operatingDays || 'Mon - Sun (Daily)',
      });
      if (targetStore.isOpen !== undefined) {
        setStoreOpenStatus(targetStore.isOpen);
      }
    }
    try {
      const savedTiming = await AsyncStorage.getItem(`getit_store_timing_${storeId}`);
      if (savedTiming) {
        const parsed = JSON.parse(savedTiming);
        setStoreTiming(parsed);
      }
      const savedLive = await AsyncStorage.getItem(`getit_store_open_status_${storeId}`);
      if (savedLive !== null) {
        setStoreOpenStatus(savedLive === 'true');
      }
    } catch (e) {}
  };

  // --- STORE PROFILE & PHOTO MANAGEMENT STATE ---
  const [storeImageModalVisible, setStoreImageModalVisible] = useState(false);
  const [customStoreImageUrl, setCustomStoreImageUrl] = useState('');
  const [editStoreModalVisible, setEditStoreModalVisible] = useState(false);
  const [editStoreName, setEditStoreName] = useState('');
  const [editStoreAddress, setEditStoreAddress] = useState('');
  const [editStoreCategory, setEditStoreCategory] = useState('');
  const [editStorePhone, setEditStorePhone] = useState('');
  const [editStoreDeliveryFee, setEditStoreDeliveryFee] = useState('1200');
  const [editStoreDescription, setEditStoreDescription] = useState('');
  const [editStoreImage, setEditStoreImage] = useState('');
  const [editStoreLatitude, setEditStoreLatitude] = useState(9.0882);
  const [editStoreLongitude, setEditStoreLongitude] = useState(7.4933);
  const [storeMapModalVisible, setStoreMapModalVisible] = useState(false);
  const [storeMapRegion, setStoreMapRegion] = useState({
    latitude: 9.0882,
    longitude: 7.4933,
    latitudeDelta: 0.015,
    longitudeDelta: 0.015,
  });
  const [storeDisplayMode, setStoreDisplayMode] = useState('list'); // 'list' | 'map'
  const [selectedMapStore, setSelectedMapStore] = useState(null);

  // High performance memoized filtered suggested catalog
  const filteredSuggestedProducts = useMemo(() => {
    const query = suggestedSearch.trim().toLowerCase();
    return NIGERIAN_GROCERIES_CATALOG.filter((item) => {
      let matchesCat = true;
      if (suggestedCategoryFilter === 'All') {
        matchesCat = item.category !== 'Pharmacy';
      } else {
        matchesCat = item.category === suggestedCategoryFilter;
      }
      if (!matchesCat) return false;
      if (!query) return true;
      return (
        item.name.toLowerCase().includes(query) ||
        item.category.toLowerCase().includes(query) ||
        (item.brand && item.brand.toLowerCase().includes(query))
      );
    });
  }, [suggestedCategoryFilter, suggestedSearch]);

  // Active Orders
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'orders' | 'profile'
  const [orders, setOrders] = useState([]);

  const [ordersFilterTab, setOrdersFilterTab] = useState('active'); // 'active' | 'all' | 'completed' | 'cancelled'
  const [lastPlacedOrderId, setLastPlacedOrderId] = useState(null);
  const [expandedOrderId, setExpandedOrderId] = useState('AUTO_TOP'); // Accordion: top active order open by default, only 1 order open at a time
  const [collapsedBoltMapOrderIds, setCollapsedBoltMapOrderIds] = useState([]);
  const [expandedItemsOrderIds, setExpandedItemsOrderIds] = useState([]);

  const toggleOrderAccordion = (orderId) => {
    setExpandedOrderId((prev) => {
      const currentActiveId = prev === 'AUTO_TOP' ? (sortedAndFilteredOrders[0]?.id || null) : prev;
      return currentActiveId === orderId ? null : orderId;
    });
  };

  const toggleBoltMapCollapse = (orderId) => {
    setCollapsedBoltMapOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const toggleItemsExpand = (orderId) => {
    setExpandedItemsOrderIds((prev) =>
      prev.includes(orderId) ? prev.filter((id) => id !== orderId) : [...prev, orderId]
    );
  };

  const clearAllOrdersHistory = () => {
    Alert.alert(
      'Manage Order History',
      'Select how you want to clean up your orders list:',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove Old / Cancelled',
          style: 'default',
          onPress: () => {
            const activeOnly = orders.filter(
              (o) => o.status === 'New Order' || o.status === 'Preparing' || o.status === 'On the Way'
            );
            updateAndPersistOrders(activeOnly);
          },
        },
        {
          text: 'Clear All Orders',
          style: 'destructive',
          onPress: () => {
            updateAndPersistOrders([]);
          },
        },
      ]
    );
  };

  // Persistent helpers for local offline storage across app reloads
  const updateAndPersistOrders = (updater) => {
    setOrders((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      try {
        AsyncStorage.setItem('getit_orders', JSON.stringify(updated)).catch(console.warn);
      } catch (e) {}
      return updated;
    });
  };

  const [isRefreshingOrders, setIsRefreshingOrders] = useState(false);
  const isSyncingOrdersRef = useRef(false);

  // Cross-device order synchronization with Supabase (Bidirectional & non-blocking)
  const syncOrdersFromCloud = async (isManual = false) => {
    if (isSyncingOrdersRef.current) return;
    isSyncingOrdersRef.current = true;
    if (isManual) setIsRefreshingOrders(true);
    try {
      // 1. Flush any pending offline orders
      await flushPendingOfflineOrders().catch(() => {});

      // 2. Fetch current cloud orders (Single fetch!)
      const cloudOrders = await getDatabaseOrders();
      if (!cloudOrders || cloudOrders.length === 0) return;

      const cloudOrderIds = new Set(cloudOrders.map((o) => o.id));

      // 3. Bidirectional Push: If this device has local orders not yet in Supabase, upload them in background
      for (const localOrd of orders) {
        if (!localOrd.isDemo && !cloudOrderIds.has(localOrd.id)) {
          await createDatabaseOrder(localOrd).catch(console.warn);
        }
      }

      // 4. Update orders state cleanly without triggering visual reload loops
      updateAndPersistOrders((prev) => {
        const orderMap = new Map();
        prev.forEach((o) => orderMap.set(o.id, o));
        cloudOrders.forEach((co) => {
          const existing = orderMap.get(co.id);
          orderMap.set(
            co.id,
            existing
              ? {
                  ...existing,
                  ...co,
                  status: (existing.status === 'Delivered' || co.status === 'Delivered') ? 'Delivered' : (co.status || existing.status),
                  eta: (existing.status === 'Delivered' || co.status === 'Delivered') ? 'Delivered' : (co.eta || existing.eta),
                  stops: (co.stops && co.stops.length > 0) ? co.stops : (existing.stops || []),
                  roadRouteCoordinates: (co.roadRouteCoordinates && co.roadRouteCoordinates.length > 0) ? co.roadRouteCoordinates : (existing.roadRouteCoordinates || []),
                  roadLegs: (co.roadLegs && co.roadLegs.length > 0) ? co.roadLegs : (existing.roadLegs || []),
                  roadPointIndex: Math.max(co.roadPointIndex || 0, existing.roadPointIndex || 0),
                  legStartedAt: existing.legStartedAt || co.legStartedAt || Date.now(),
                  boltCoords: (existing.status === 'On the Way' && existing.boltCoords) ? existing.boltCoords : (co.boltCoords || existing.boltCoords),
                }
              : co
          );
        });
        const now = Date.now();
        return Array.from(orderMap.values()).map((o) => calculateOrderRiderProgress(o, now));
      });
    } catch (err) {
      console.warn('Sync orders from cloud error:', err);
    } finally {
      if (isManual) setIsRefreshingOrders(false);
      isSyncingOrdersRef.current = false;
    }
  };

  const updateAndPersistStores = (updater) => {
    setStoresList((prev) => {
      const updated = typeof updater === 'function' ? updater(prev) : updater;
      const seen = new Set();
      const deduped = (Array.isArray(updated) ? updated : []).filter((s) => {
        if (!s || !s.id || seen.has(s.id)) return false;
        seen.add(s.id);
        return true;
      });
      try {
        AsyncStorage.setItem('getit_stores_list', JSON.stringify(deduped)).catch(console.warn);
      } catch (e) {}
      return deduped;
    });
  };

  // Auto-fit map viewport to encompass all participating stores, customer home, and rider
  const getOrderRegion = (ord) => {
    try {
      const points = [];
      const homeLat = Number(ord?.deliveryLocation?.latitude || pinnedLocation?.latitude || 9.0882);
      const homeLng = Number(ord?.deliveryLocation?.longitude || pinnedLocation?.longitude || 7.4933);
      points.push({ latitude: isNaN(homeLat) ? 9.0882 : homeLat, longitude: isNaN(homeLng) ? 7.4933 : homeLng });

      if (ord?.stops && Array.isArray(ord.stops) && ord.stops.length > 0) {
        ord.stops.forEach((st) => {
          const sLat = Number(st.latitude);
          const sLng = Number(st.longitude);
          if (!isNaN(sLat) && !isNaN(sLng) && sLat !== 0 && sLng !== 0) {
            points.push({ latitude: sLat, longitude: sLng });
          }
        });
      } else if (ord?.storeLocation?.latitude && ord?.storeLocation?.longitude) {
        const sLat = Number(ord.storeLocation.latitude);
        const sLng = Number(ord.storeLocation.longitude);
        if (!isNaN(sLat) && !isNaN(sLng)) {
          points.push({ latitude: sLat, longitude: sLng });
        }
      }

      if (ord?.boltCoords?.latitude && ord?.boltCoords?.longitude) {
        const bLat = Number(ord.boltCoords.latitude);
        const bLng = Number(ord.boltCoords.longitude);
        if (!isNaN(bLat) && !isNaN(bLng)) {
          points.push({ latitude: bLat, longitude: bLng });
        }
      }

      let minLat = points[0].latitude;
      let maxLat = points[0].latitude;
      let minLng = points[0].longitude;
      let maxLng = points[0].longitude;

      points.forEach((p) => {
        minLat = Math.min(minLat, p.latitude);
        maxLat = Math.max(maxLat, p.latitude);
        minLng = Math.min(minLng, p.longitude);
        maxLng = Math.max(maxLng, p.longitude);
      });

      const latDelta = Math.max(0.018, (maxLat - minLat) * 1.6);
      const lngDelta = Math.max(0.018, (maxLng - minLng) * 1.6);

      return {
        latitude: (minLat + maxLat) / 2,
        longitude: (minLng + maxLng) / 2,
        latitudeDelta: isNaN(latDelta) ? 0.032 : latDelta,
        longitudeDelta: isNaN(lngDelta) ? 0.032 : lngDelta,
      };
    } catch (e) {
      return {
        latitude: 9.0882,
        longitude: 7.4933,
        latitudeDelta: 0.032,
        longitudeDelta: 0.032,
      };
    }
  };

  // Geodetic Haversine Distance Calculator between two points in km
  function calculateDistanceKm(lat1, lon1, lat2, lon2) {
    if (!lat1 || !lon1 || !lat2 || !lon2) return null;
    const nLat1 = Number(lat1);
    const nLon1 = Number(lon1);
    const nLat2 = Number(lat2);
    const nLon2 = Number(lon2);
    if (isNaN(nLat1) || isNaN(nLon1) || isNaN(nLat2) || isNaN(nLon2)) return null;
    const R = 6371; // Earth's radius in km
    const dLat = ((nLat2 - nLat1) * Math.PI) / 180;
    const dLon = ((nLon2 - nLon1) * Math.PI) / 180;
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos((nLat1 * Math.PI) / 180) *
        Math.cos((nLat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  // Smart Nearest-Neighbor Logistics Optimizer: Orders multiple stops starting with the closest shop to the rider
  function optimizeMultiStopSequence(stores, startPoint) {
    if (!stores || stores.length <= 1) return stores;

    const remaining = [...stores];
    const ordered = [];
    let currentPoint = startPoint || {
      latitude: Number(stores[0].latitude) || 9.0882,
      longitude: Number(stores[0].longitude) || 7.4933,
    };

    while (remaining.length > 0) {
      let nearestIdx = 0;
      let minDistance = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const store = remaining[i];
        const dist = calculateDistanceKm(
          currentPoint.latitude,
          currentPoint.longitude,
          store.latitude,
          store.longitude
        ) ?? Infinity;

        if (dist < minDistance) {
          minDistance = dist;
          nearestIdx = i;
        }
      }

      const [selectedStore] = remaining.splice(nearestIdx, 1);
      ordered.push({
        ...selectedStore,
        distanceFromPrevKm: minDistance !== Infinity ? minDistance.toFixed(1) : null,
      });
      currentPoint = {
        latitude: Number(selectedStore.latitude) || 9.0882,
        longitude: Number(selectedStore.longitude) || 7.4933,
      };
    }

    return ordered;
  }

  // Active Dispatch Courier Fleet stationed across Abuja zones
  const FLEET_COURIERS = [
    {
      id: 'rider-musa',
      name: 'Musa Ibrahim',
      phone: '+234 803 294 1194',
      rating: '4.95',
      vehicle: 'Bajaj Boxer 150 (Red)',
      plate: 'ABJ-492-KW',
      latitude: 9.0882, // Maitama Zone
      longitude: 7.4933,
      zone: 'Maitama',
      isAvailable: true,
    },
    {
      id: 'rider-emeka',
      name: 'Emeka Nwosu',
      phone: '+234 802 118 4421',
      rating: '4.92',
      vehicle: 'TVS Neo 110 (Blue)',
      plate: 'RBC-318-AX',
      latitude: 9.0655, // Wuse 2 Zone
      longitude: 7.4680,
      zone: 'Wuse 2',
      isAvailable: true,
    },
    {
      id: 'rider-usman',
      name: 'Usman Danladi',
      phone: '+234 814 772 9012',
      rating: '4.89',
      vehicle: 'Yamaha Crux 110 (Black)',
      plate: 'ABJ-805-TR',
      latitude: 9.0720, // Central Business District
      longitude: 7.4910,
      zone: 'CBD',
      isAvailable: true,
    },
    {
      id: 'rider-tunde',
      name: 'Babatunde Adeleke',
      phone: '+234 809 334 5510',
      rating: '4.96',
      vehicle: 'Honda Ace 125 (Silver)',
      plate: 'KJA-512-MC',
      latitude: 9.0550, // Garki / Asokoro
      longitude: 7.5020,
      zone: 'Garki / Asokoro',
      isAvailable: true,
    },
  ];

  // Inbound Funnel Dispatch: Finds the store furthest from the buyer (Anchor Store),
  // matches the closest courier to that store, and sequences remaining stores inward toward the customer's home.
  function calculateInboundFunnelDispatch(stores, buyerLocation, courierFleet = FLEET_COURIERS) {
    if (!stores || stores.length === 0) return null;
    const bLat = Number(buyerLocation?.latitude) || 9.0882;
    const bLng = Number(buyerLocation?.longitude) || 7.4933;

    if (stores.length === 1) {
      const singleStore = stores[0];
      let bestRider = courierFleet[0];
      let minRiderDist = Infinity;
      courierFleet.forEach((r) => {
        const d = calculateDistanceKm(r.latitude, r.longitude, singleStore.latitude, singleStore.longitude) ?? Infinity;
        if (d < minRiderDist) {
          minRiderDist = d;
          bestRider = r;
        }
      });
      return {
        anchorStore: singleStore,
        matchedRider: bestRider,
        orderedStops: stores,
        approachDistKm: minRiderDist !== Infinity ? minRiderDist.toFixed(1) : '0.8',
        isInboundFunnel: false,
      };
    }

    // 1. Identify the Outermost Anchor Store (furthest from buyer's home)
    let anchorStore = stores[0];
    let maxDistToBuyer = -1;

    stores.forEach((st) => {
      const dist = calculateDistanceKm(st.latitude, st.longitude, bLat, bLng) ?? 0;
      if (dist > maxDistToBuyer) {
        maxDistToBuyer = dist;
        anchorStore = st;
      }
    });

    // 2. Find the Courier closest to the Outermost Anchor Store
    let matchedRider = courierFleet[0];
    let minRiderToAnchorDist = Infinity;

    courierFleet.forEach((rider) => {
      const d = calculateDistanceKm(rider.latitude, rider.longitude, anchorStore.latitude, anchorStore.longitude) ?? Infinity;
      if (d < minRiderToAnchorDist) {
        minRiderToAnchorDist = d;
        matchedRider = rider;
      }
    });

    // 3. Sequence remaining stores inward toward the buyer
    const orderedStops = [
      {
        ...anchorStore,
        distanceFromPrevKm: minRiderToAnchorDist !== Infinity ? minRiderToAnchorDist.toFixed(1) : '1.0',
        isAnchorStore: true,
      },
    ];

    const remaining = stores.filter((s) => (s.storeId || s.id) !== (anchorStore.storeId || anchorStore.id));
    let currentPoint = {
      latitude: Number(anchorStore.latitude) || 9.0882,
      longitude: Number(anchorStore.longitude) || 7.4933,
    };

    while (remaining.length > 0) {
      let nextIdx = 0;
      let minInboundCost = Infinity;

      for (let i = 0; i < remaining.length; i++) {
        const candidate = remaining[i];
        const distFromCurrent = calculateDistanceKm(
          currentPoint.latitude,
          currentPoint.longitude,
          candidate.latitude,
          candidate.longitude
        ) ?? 0;
        const distToBuyer = calculateDistanceKm(
          candidate.latitude,
          candidate.longitude,
          bLat,
          bLng
        ) ?? 0;

        const cost = distFromCurrent + distToBuyer * 0.4;
        if (cost < minInboundCost) {
          minInboundCost = cost;
          nextIdx = i;
        }
      }

      const [selected] = remaining.splice(nextIdx, 1);
      const hopDist = calculateDistanceKm(currentPoint.latitude, currentPoint.longitude, selected.latitude, selected.longitude);
      orderedStops.push({
        ...selected,
        distanceFromPrevKm: hopDist !== null ? hopDist.toFixed(1) : '1.5',
        isAnchorStore: false,
      });
      currentPoint = {
        latitude: Number(selected.latitude) || 9.0882,
        longitude: Number(selected.longitude) || 7.4933,
      };
    }

    return {
      anchorStore,
      matchedRider,
      orderedStops,
      approachDistKm: minRiderToAnchorDist !== Infinity ? minRiderToAnchorDist.toFixed(1) : '1.0',
      isInboundFunnel: true,
    };
  }

  // Build sequential connection legs directly between actual order waypoints
  const buildDirectLegsBetweenWaypoints = (waypoints) => {
    if (!waypoints || waypoints.length < 2) return { roadPoints: [], legs: [], snappedWaypoints: waypoints || [] };
    const legs = [];
    const roadPoints = [];

    for (let i = 0; i < waypoints.length - 1; i++) {
      const start = waypoints[i];
      const end = waypoints[i + 1];
      const leg = [];
      const steps = 25;
      for (let s = 0; s <= steps; s++) {
        const t = s / steps;
        const pt = {
          latitude: start.latitude + (end.latitude - start.latitude) * t,
          longitude: start.longitude + (end.longitude - start.longitude) * t,
        };
        leg.push(pt);
        if (i === 0 || s > 0) roadPoints.push(pt);
      }
      legs.push(leg);
    }

    return {
      roadPoints,
      legs,
      snappedWaypoints: waypoints,
    };
  };

  // Fetch real-world street road network route from OSRM (snapped to actual tarmac streets, legs, and pinpoint coordinates)
  const fetchRealRoadDirections = async (waypointCoords) => {
    if (!waypointCoords || waypointCoords.length < 2) {
      return buildDirectLegsBetweenWaypoints(waypointCoords);
    }
    try {
      const coordStr = waypointCoords
        .map((c) => `${Number(c.longitude).toFixed(5)},${Number(c.latitude).toFixed(5)}`)
        .join(';');
      const url = `https://router.project-osrm.org/route/v1/driving/${coordStr}?overview=full&geometries=geojson&steps=true`;
      const response = await fetch(url);
      const data = await response.json();
      if (data && data.code === 'Ok' && data.routes && data.routes[0]) {
        const fullCoords = (data.routes[0].geometry.coordinates || []).map((c) => ({
          latitude: c[1],
          longitude: c[0],
        }));

        // Extract individual legs (Leg 0: Rider -> Stop 1, Leg 1: Stop 1 -> Stop 2, Leg 2: Stop 2 -> Dropoff)
        const legs = (data.routes[0].legs || []).map((l) =>
          (l.steps || []).flatMap((st) =>
            (st.geometry?.coordinates || []).map((c) => ({
              latitude: c[1],
              longitude: c[0],
            }))
          )
        );

        // Snapped waypoint coordinates guaranteed to sit precisely on the road line
        const snappedWaypoints = (data.waypoints || []).map((w) => ({
          latitude: w.location[1],
          longitude: w.location[0],
          name: w.name || '',
        }));

        if (fullCoords.length > 0 && legs.length > 0 && legs[0].length > 0) {
          return {
            roadPoints: fullCoords,
            legs,
            snappedWaypoints,
          };
        }
      }
    } catch (e) {
      console.log('OSRM road directions dynamic fetch notice, using direct route waypoints:', e?.message);
    }

    return buildDirectLegsBetweenWaypoints(waypointCoords);
  };

  const fetchedRoutesRef = useRef(new Set());
  // Auto-fetch real-world street road directions for active orders (at most once per order ID)
  useEffect(() => {
    orders.forEach((ord) => {
      if (
        ord.status !== 'Cancelled' &&
        ord.status !== 'Delivered' &&
        (!ord.roadLegs || !Array.isArray(ord.roadLegs) || ord.roadLegs.length === 0 || !ord.roadLegs[0] || ord.roadLegs[0].length < 2) &&
        !fetchedRoutesRef.current.has(ord.id)
      ) {
        fetchedRoutesRef.current.add(ord.id);
        const stopsList = ord.stops && ord.stops.length > 0 ? ord.stops : [];
        const firstStore = stopsList[0] || ord.storeLocation || { latitude: 9.0882, longitude: 7.4933 };
        const dest = ord.deliveryLocation || pinnedLocation || { latitude: 9.0882, longitude: 7.4933 };

        // Waypoints strictly begin at rider origin, visit every participating store, and terminate at customer destination
        const riderStart = ord.riderOrigin || {
          latitude: Number(firstStore.latitude || 9.0882) - 0.0090,
          longitude: Number(firstStore.longitude || 7.4933) - 0.0080,
        };
        const waypoints = [
          riderStart,
          ...(stopsList.length > 0
            ? stopsList.map((s) => ({
                latitude: Number(s.latitude) || 9.0882,
                longitude: Number(s.longitude) || 7.4933,
              }))
            : [{ latitude: Number(firstStore.latitude) || 9.0882, longitude: Number(firstStore.longitude) || 7.4933 }]),
          {
            latitude: Number(dest.latitude) || 9.0882,
            longitude: Number(dest.longitude) || 7.4933,
          },
        ];

        fetchRealRoadDirections(waypoints).then((result) => {
          if (result && result.roadPoints && result.roadPoints.length > 0) {
            // Update stops with their snapped pinpoint coordinates directly on the road (sIdx 0 -> snappedWaypoints[1])
            const updatedStops = (ord.stops || []).map((st, sIdx) => {
              const snapped = result.snappedWaypoints ? result.snappedWaypoints[sIdx + 1] : null;
              return {
                ...st,
                snappedLatitude: snapped ? snapped.latitude : Number(st.latitude) || 9.0882,
                snappedLongitude: snapped ? snapped.longitude : Number(st.longitude) || 7.4933,
              };
            });

            const snappedDest =
              result.snappedWaypoints && result.snappedWaypoints.length > 0
                ? result.snappedWaypoints[result.snappedWaypoints.length - 1]
                : null;

            setOrders((prev) =>
              prev.map((o) =>
                o.id === ord.id
                  ? {
                      ...o,
                      roadRouteCoordinates: result.roadPoints,
                      roadLegs: result.legs,
                      snappedWaypoints: result.snappedWaypoints,
                      stops: updatedStops,
                      snappedDeliveryLocation: snappedDest
                        ? { ...o.deliveryLocation, latitude: snappedDest.latitude, longitude: snappedDest.longitude }
                        : o.deliveryLocation,
                      roadPointIndex: o.roadPointIndex || 0,
                      boltCoords: (o.roadPointIndex && result.roadPoints[o.roadPointIndex]) || o.boltCoords || result.roadPoints[0],
                    }
                  : o
              )
            );
          }
        });
      }
    });
  }, [orders.length, orders[0]?.status]);

  // Deterministic Real-Time Courier Route Calculation based on elapsed wall-clock time
  function calculateOrderRiderProgress(ord, now = Date.now()) {
    if (
      !ord ||
      ord.status === 'Cancelled' ||
      ord.status === 'Delivered' ||
      ord.courierArrivedOutside ||
      !ord.boltRider ||
      !ord.boltRider.name
    ) {
      return ord;
    }

    const stops = Array.isArray(ord.stops) && ord.stops.length > 0 ? ord.stops : [];
    const currentStopIdx = ord.currentStopIndex || 0;

    // Strictly prior completed stops (idx < currentStopIdx) are verified.
    // The active stop (idx === currentStopIdx) is in transit or arrived — NOT YET PICKED UP!
    const verifiedStops = stops.map((st, idx) => {
      if (idx < currentStopIdx && st.pickupStatus !== 'picked_up') {
        return {
          ...st,
          pickupStatus: 'picked_up',
          pickedUpAt: st.pickedUpAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          status: 'Ready for Pickup',
        };
      }
      return st;
    });

    const homeLat = Number(ord.deliveryLocation?.latitude || pinnedLocation?.latitude || 9.0882);
    const homeLng = Number(ord.deliveryLocation?.longitude || pinnedLocation?.longitude || 7.4933);
    const destCoord = { latitude: homeLat, longitude: homeLng };
    const totalLegs = (ord.roadLegs && ord.roadLegs.length > 0) ? ord.roadLegs.length : (verifiedStops.length + 1);

    // If already beyond the last delivery leg:
    if (currentStopIdx >= totalLegs || currentStopIdx > stops.length) {
      const arrivedAlert = `🛵 Courier has arrived outside your address! Give your Security PIN (${ord.deliveryPin || '2489'}) to collect packages.`;
      if (!ord.hasNotifiedArrived && !ord.courierArrivedOutside) {
        notifyCourierArrived(ord);
        updateDatabaseOrderStatus(ord.id, {
          stops: verifiedStops,
          boltCoords: destCoord,
          eta: 'Arrived outside gate',
          journeyAlert: arrivedAlert,
        }).catch(() => {});
      }
      return {
        ...ord,
        stops: verifiedStops,
        currentStopIndex: totalLegs,
        boltCoords: destCoord,
        hasNotifiedArrived: true,
        courierArrivedOutside: true,
        eta: 'Arrived outside gate',
        journeyAlert: arrivedAlert,
      };
    }

    let activeLegPts =
      ord.roadLegs && ord.roadLegs[currentStopIdx] && ord.roadLegs[currentStopIdx].length > 1
        ? ord.roadLegs[currentStopIdx]
        : null;

    if (!activeLegPts || activeLegPts.length === 0) {
      const firstStore = verifiedStops?.[0] || ord.storeLocation || { latitude: 9.0882, longitude: 7.4933 };
      const riderStart = ord.riderOrigin || {
        latitude: Number(firstStore.latitude || 9.0882) - 0.0090,
        longitude: Number(firstStore.longitude || 7.4933) - 0.0080,
      };
      const wps = [
        riderStart,
        ...(verifiedStops && verifiedStops.length > 0
          ? verifiedStops.map((s) => ({
              latitude: Number(s.latitude) || 9.0882,
              longitude: Number(s.longitude) || 7.4933,
            }))
          : [{ latitude: Number(firstStore.latitude) || 9.0882, longitude: Number(firstStore.longitude) || 7.4933 }]),
        { latitude: homeLat, longitude: homeLng },
      ];
      const directFallback = buildDirectLegsBetweenWaypoints(wps);
      activeLegPts = directFallback.legs[currentStopIdx] || directFallback.legs[0] || [];
    }

    const totalPoints = Math.max(2, activeLegPts.length);
    const MS_PER_POINT = 2000; // Smooth 2 seconds per point for visible, responsive progress
    const legDurationMs = Math.max(15000, (totalPoints - 1) * MS_PER_POINT);

    const legStartedAt = Number(ord.legStartedAt) || now;
    const elapsedMs = Math.max(0, now - legStartedAt);

    if (elapsedMs < legDurationMs) {
      // Courier is actively riding along this leg
      const calculatedPointIdx = Math.min(totalPoints - 1, Math.floor(elapsedMs / MS_PER_POINT));
      const nextCoord = activeLegPts[calculatedPointIdx] || activeLegPts[0];

      return {
        ...ord,
        roadPointIndex: calculatedPointIdx,
        boltCoords: nextCoord,
        stops: verifiedStops,
        currentStopIndex: currentStopIdx,
        legStartedAt: legStartedAt,
        status: 'On the Way',
      };
    }

    // Courier has reached the destination of this leg!
    const endOfLegCoord = activeLegPts[totalPoints - 1] || activeLegPts[0];

    // Case A: Courier reached a shop (Autonomous Collection Handover & Swipe to Next Stop)
    if (currentStopIdx < stops.length) {
      const arrivedShop = stops[currentStopIdx];
      const shopName = arrivedShop?.storeName || 'the shop';
      const HANDOVER_WINDOW_MS = 4000; // 4s realistic package handover simulation

      if (elapsedMs < legDurationMs + HANDOVER_WINDOW_MS) {
        // Courier is outside the shop collecting packages
        const collectingAlert = `🛵 Courier Musa has arrived outside ${shopName}! Collecting packages...`;
        return {
          ...ord,
          roadPointIndex: totalPoints - 1,
          boltCoords: endOfLegCoord,
          stops: verifiedStops,
          currentStopIndex: currentStopIdx,
          legStartedAt: legStartedAt,
          journeyAlert: collectingAlert,
          status: 'On the Way',
        };
      }

      // 🚀 Courier swiped to confirm collection! Move shop to Done and proceed to next stop
      const nextStopIdx = currentStopIdx + 1;
      const updatedStops = stops.map((st, idx) => {
        if (idx === currentStopIdx) {
          return {
            ...st,
            pickupStatus: 'picked_up',
            status: 'Completed',
            pickedUpAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          };
        }
        if (idx < currentStopIdx) {
          return {
            ...st,
            pickupStatus: 'picked_up',
            status: 'Completed',
          };
        }
        return st;
      });

      const nextStoreName = stops[nextStopIdx]?.storeName || 'the next shop';
      const progressAlert = nextStopIdx < stops.length
        ? `🚀 Package collected from ${shopName}! Musa is riding to ${nextStoreName} for pickup.`
        : `🚀 All store packages collected! Musa Ibrahim is en route directly to your delivery destination!`;

      updateDatabaseOrderStatus(ord.id, {
        stops: updatedStops,
        currentStopIndex: nextStopIdx,
        legStartedAt: now,
        roadPointIndex: 0,
        boltCoords: endOfLegCoord,
        journeyAlert: progressAlert,
        status: 'On the Way',
      }).catch(() => {});

      broadcastLiveEvent('ORDER_UPDATE', {
        orderId: ord.id,
        stops: updatedStops,
        currentStopIndex: nextStopIdx,
        legStartedAt: now,
        roadPointIndex: 0,
        boltCoords: endOfLegCoord,
        journeyAlert: progressAlert,
        status: 'On the Way',
        boltRider: ord.boltRider,
        boltStatus: 'IN_TRANSIT',
      });

      return {
        ...ord,
        stops: updatedStops,
        currentStopIndex: nextStopIdx,
        legStartedAt: now,
        roadPointIndex: 0,
        boltCoords: endOfLegCoord,
        journeyAlert: progressAlert,
        status: 'On the Way',
      };
    }

    // Case B: Courier reached the customer destination (Autonomous Trip End & Delivery)
    const DROP_OFF_WINDOW_MS = 3500; // 3.5s doorstep handover simulation

    if (elapsedMs < legDurationMs + DROP_OFF_WINDOW_MS) {
      const arrivedAlert = `🛵 Courier Musa has arrived outside your address! Handing over packages...`;
      if (!ord.hasNotifiedArrived && !ord.courierArrivedOutside) {
        notifyCourierArrived(ord);
      }
      return {
        ...ord,
        stops: verifiedStops,
        boltCoords: destCoord,
        currentStopIndex: currentStopIdx,
        roadPointIndex: totalPoints - 1,
        hasNotifiedArrived: true,
        courierArrivedOutside: true,
        eta: 'Arrived outside gate',
        journeyAlert: arrivedAlert,
        status: 'On the Way',
      };
    }

    // 🎉 Courier completed & ended the trip! Order is Delivered!
    const deliveredAlert = '🎉 Order Delivered! Enjoy your fresh provisions.';
    if (!ord.hasNotifiedDelivered) {
      notifyOrderDelivered(ord);
    }

    updateDatabaseOrderStatus(ord.id, {
      status: 'Delivered',
      eta: 'Delivered',
      journeyAlert: deliveredAlert,
      boltCoords: destCoord,
      courierArrivedOutside: true,
      hasNotifiedArrived: true,
    }).catch(() => {});

    broadcastLiveEvent('ORDER_UPDATE', {
      orderId: ord.id,
      status: 'Delivered',
      eta: 'Delivered',
      journeyAlert: deliveredAlert,
      boltCoords: destCoord,
      boltRider: ord.boltRider,
      boltStatus: 'DELIVERED',
      courierArrivedOutside: true,
      hasNotifiedArrived: true,
    });

    return {
      ...ord,
      status: 'Delivered',
      eta: 'Delivered',
      journeyAlert: deliveredAlert,
      boltCoords: destCoord,
      courierArrivedOutside: true,
      hasNotifiedArrived: true,
      hasNotifiedDelivered: true,
    };
  }

  // Live Autonomous Multi-Stop Courier Real-Time Route Glide along Real Streets (Pure local animation)
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) => {
        let hasChanges = false;
        const now = Date.now();
        const next = prev.map((ord) => {
          if (
            ord.status === 'Cancelled' ||
            ord.status === 'Delivered' ||
            ord.courierArrivedOutside ||
            !ord.boltRider ||
            !ord.boltRider.name
          ) {
            return ord;
          }
          const updated = calculateOrderRiderProgress(ord, now);
          if (
            updated.roadPointIndex !== ord.roadPointIndex ||
            updated.currentStopIndex !== ord.currentStopIndex ||
            updated.courierArrivedOutside !== ord.courierArrivedOutside ||
            updated.legStartedAt !== ord.legStartedAt ||
            updated.boltCoords?.latitude !== ord.boltCoords?.latitude ||
            updated.boltCoords?.longitude !== ord.boltCoords?.longitude
          ) {
            hasChanges = true;
          }
          return updated;
        });
        return hasChanges ? next : prev;
      });
    }, 1500);
    return () => clearInterval(timer);
  }, []);

  // Auto-sync freshest cloud orders whenever the user switches to Orders tab
  useEffect(() => {
    if (activeTab === 'orders') {
      syncOrdersFromCloud();
    }
  }, [activeTab]);

  // Supabase Real-time Cloud Orders Subscription (Persisted)
  useEffect(() => {
    const unsubscribe = subscribeToOrders((payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const item = payload.new;
        updateAndPersistOrders((prev) => {
          if (prev.some((o) => o.id === item.id)) return prev;
          // 🔔 Audio Beep & Push: Only notify on truly brand-new external orders
          notifyOrderPlaced({
            id: item.id,
            storeName: item.store_name,
            itemsCount: item.items_count,
            total: item.total,
          });
          return [
            {
              id: item.id,
              storeId: item.store_id,
              storeName: item.store_name,
              itemsCount: item.items_count,
              items: item.items || [],
              total: Number(item.total),
              vendorPayout: Number(item.vendor_payout),
              deliveryPartner: item.delivery_partner,
              deliveryFee: Number(item.delivery_fee),
              boltStatus: item.bolt_status,
              boltTrackingCode: item.bolt_tracking_code,
              boltRider: item.bolt_rider,
              boltCoords: item.bolt_coords,
              status: item.status,
              eta: item.eta,
              deliveryPin: item.delivery_pin,
              pickupPin: item.pickup_pin,
              customerName: item.customer_name,
              customerAddress: item.customer_address,
              deliveryLocation: {
                latitude: item.delivery_lat,
                longitude: item.delivery_lng,
              },
              createdAt: item.created_at
                ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
                : '12:00 PM',
            },
            ...prev,
          ];
        });
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const updated = payload.new;
        updateAndPersistOrders((prev) =>
          prev.map((o) => {
            if (o.id === updated.id) {
              const riderPayload = (typeof updated.bolt_rider === 'object' && updated.bolt_rider) ? updated.bolt_rider : {};
              const stops = (riderPayload.stops && Array.isArray(riderPayload.stops) && riderPayload.stops.length > 0)
                ? riderPayload.stops
                : o.stops;
              const hasRider = Boolean(riderPayload.name && riderPayload.phone);
              const riderObj = hasRider ? {
                id: riderPayload.id || 'bolt-rider-01',
                name: riderPayload.name,
                phone: riderPayload.phone,
                rating: riderPayload.rating || '4.95',
                trips: riderPayload.trips || 1420,
                vehicle: riderPayload.vehicle || 'Bajaj Boxer 150 (Red)',
                plate: riderPayload.plate || 'ABJ-492-KW',
                avatar: riderPayload.avatar || '🛵',
              } : null;

              return {
                ...o,
                status: updated.status || o.status,
                stops: stops,
                journeyAlert: riderPayload.journeyAlert || o.journeyAlert,
                boltStatus: updated.bolt_status || o.boltStatus,
                boltRider: riderObj,
                boltCoords: updated.bolt_coords || o.boltCoords,
                eta: updated.eta || o.eta,
                courierSearching: updated.status === 'Looking for Courier',
                currentStopIndex: riderPayload.currentStopIndex !== undefined ? Number(riderPayload.currentStopIndex) : o.currentStopIndex,
                roadPointIndex: riderPayload.roadPointIndex !== undefined ? Number(riderPayload.roadPointIndex) : o.roadPointIndex,
                legStartedAt: riderPayload.legStartedAt !== undefined ? Number(riderPayload.legStartedAt) : o.legStartedAt,
              };
            }
            return o;
          })
        );
      }
    });

    return () => {
      if (typeof unsubscribe === 'function') unsubscribe();
    };
  }, []);

  // Supabase Real-time Cloud Stores Sync (Connects Merchants & Buyers)
  useEffect(() => {
    let isMounted = true;

    async function loadCloudStores() {
      try {
        const cloudStores = await getStores();
        if (!isMounted || !cloudStores || cloudStores.length === 0) return;

        // Fetch custom store inventories
        const enriched = await Promise.all(
          cloudStores.map(async (dbStore) => {
            const inventory = await getStoreInventory(dbStore.id);
            const prods =
              inventory && inventory.length > 0
                ? inventory
                : STORES_AROUND_ME.find((s) => s.id === dbStore.id)?.products || [];

            const categoryKey = (dbStore.category || 'gourmet').toLowerCase().includes('organ')
              ? 'organic'
              : (dbStore.category || '').toLowerCase().includes('bake')
              ? 'bakery'
              : (dbStore.category || '').toLowerCase().includes('cell')
              ? 'cellar'
              : (dbStore.category || '').toLowerCase().includes('herit')
              ? 'heritage'
              : 'gourmet';

            const meta = parseStoreMetadata(dbStore);
            const isOpenBool =
              dbStore.isOpen !== undefined
                ? Boolean(dbStore.isOpen)
                : (dbStore.is_open !== undefined
                    ? Boolean(dbStore.is_open)
                    : (meta.isOpen !== undefined
                        ? Boolean(meta.isOpen)
                        : true));

            return {
              id: dbStore.id,
              name: dbStore.name,
              category: categoryKey,
              categoryLabel: dbStore.category || 'Gourmet & Groceries',
              rating: Number(dbStore.rating) || 5.0,
              reviewCount: 'New',
              distance: '1.2 km',
              deliveryTime: '20-30 min',
              deliveryFee: dbStore.delivery_fee ? `₦${Number(dbStore.delivery_fee).toLocaleString()}` : '₦1,200',
              freeDeliveryThreshold: 25000,
              tag: 'VERIFIED MERCHANT',
              badgeColor: COLORS.emeraldPrimary,
              address: dbStore.address || 'Abuja, Nigeria',
              district: dbStore.district || 'Maitama, Abuja',
              latitude: Number(dbStore.latitude) || 9.0882,
              longitude: Number(dbStore.longitude) || 7.4933,
              phone: dbStore.phone || '+234 800 000 0000',
              image: meta.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
              description: `${dbStore.name} — fresh provisions, artisan goods and rapid doorstep delivery across Abuja.`,
              products: prods,
              isOpen: isOpenBool,
              is_open: isOpenBool,
              status: isOpenBool ? 'open' : 'closed',
              isClosed: !isOpenBool,
              openTime: meta.openTime,
              closeTime: meta.closeTime,
              operatingDays: meta.operatingDays,
              is24Hours: meta.is24Hours,
            };
          })
        );

        if (!isMounted) return;

        setStoresList((prev) => {
          const prevMap = new Map(prev.map((s) => [s.id, s]));
          const mergedCloud = enriched.map((dbStore) => {
            const existing = prevMap.get(dbStore.id);
            if (!existing) return dbStore;
            return {
              ...existing,
              ...dbStore, // Fresh cloud values override local stale values!
              products: (dbStore.products && dbStore.products.length > 0) ? dbStore.products : (existing.products || []),
            };
          });
          AsyncStorage.setItem('getit_stores_list', JSON.stringify(mergedCloud)).catch(console.warn);
          return mergedCloud;
        });

        // LIVE UPDATE: Also update selectedStore in real-time so buyer views the new 24h status immediately!
        setSelectedStore((prev) => {
          if (!prev) return null;
          const fresh = enriched.find((s) => s.id === prev.id);
          if (!fresh) return prev;
          return {
            ...prev,
            ...fresh,
            products: (fresh.products && fresh.products.length > 0) ? fresh.products : prev.products,
          };
        });
      } catch (err) {
        console.warn('Error loading cloud stores:', err);
      }
    }

    loadCloudStores();

    // Realtime subscription for stores (both new additions and live status/hours/profile updates)
    const handleStorePayload = (payload) => {
      if (payload.eventType === 'INSERT' && payload.new) {
        const dbStore = payload.new;
        const categoryKey = (dbStore.category || 'gourmet').toLowerCase().includes('organ')
          ? 'organic'
          : (dbStore.category || '').toLowerCase().includes('bake')
          ? 'bakery'
          : (dbStore.category || '').toLowerCase().includes('cell')
          ? 'cellar'
          : (dbStore.category || '').toLowerCase().includes('herit')
          ? 'heritage'
          : 'gourmet';

        const meta = parseStoreMetadata(dbStore);
        const isOpenBool = dbStore.is_open !== undefined ? Boolean(dbStore.is_open) : true;
        const is24H = meta.is24Hours !== undefined ? Boolean(meta.is24Hours) : Boolean(dbStore.is_24_hours);

        const newStoreObj = {
          id: dbStore.id,
          name: dbStore.name,
          category: categoryKey,
          categoryLabel: dbStore.category || 'Gourmet & Groceries',
          rating: Number(dbStore.rating) || 5.0,
          reviewCount: 'New',
          distance: '0.8 km',
          deliveryTime: '15-25 min',
          deliveryFee: dbStore.delivery_fee ? `₦${Number(dbStore.delivery_fee).toLocaleString()}` : '₦1,200',
          freeDeliveryThreshold: 25000,
          tag: 'NEW MERCHANT',
          badgeColor: COLORS.emeraldPrimary,
          address: dbStore.address || 'Abuja, Nigeria',
          district: dbStore.district || 'Maitama, Abuja',
          latitude: Number(dbStore.latitude) || 9.0882,
          longitude: Number(dbStore.longitude) || 7.4933,
          phone: dbStore.phone || '+234 800 000 0000',
          image: meta.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
          description: `${dbStore.name} — partner store live on GETIT Abuja.`,
          products: [],
          isOpen: isOpenBool,
          is_open: isOpenBool,
          openTime: meta.openTime,
          closeTime: meta.closeTime,
          operatingDays: meta.operatingDays,
          is24Hours: is24H,
        };

        getStoreInventory(dbStore.id).then((inv) => {
          if (inv && inv.length > 0) {
            newStoreObj.products = inv;
            updateAndPersistStores((prev) =>
              prev.map((s) => (s.id === newStoreObj.id ? { ...s, products: inv } : s))
            );
          }
        }).catch(() => {});

        updateAndPersistStores((prev) => {
          if (prev.some((s) => s.id === newStoreObj.id)) {
            return prev.map((s) => (s.id === newStoreObj.id ? { ...s, ...newStoreObj } : s));
          }
          return [newStoreObj, ...prev];
        });
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const dbStore = payload.new;
        const meta = parseStoreMetadata(dbStore);
        const isOpenBool =
          dbStore.isOpen !== undefined
            ? Boolean(dbStore.isOpen)
            : (dbStore.is_open !== undefined
                ? Boolean(dbStore.is_open)
                : (meta.isOpen !== undefined
                    ? Boolean(meta.isOpen)
                    : true));
        const is24H = meta.is24Hours !== undefined ? Boolean(meta.is24Hours) : Boolean(dbStore.is_24_hours);
        const categoryKey = (dbStore.category || 'gourmet').toLowerCase().includes('organ')
          ? 'organic'
          : (dbStore.category || '').toLowerCase().includes('bake')
          ? 'bakery'
          : (dbStore.category || '').toLowerCase().includes('cell')
          ? 'cellar'
          : (dbStore.category || '').toLowerCase().includes('herit')
          ? 'heritage'
          : 'gourmet';

        updateAndPersistStores((prev) =>
          prev.map((s) => {
            if (s.id !== dbStore.id) return s;
            return {
              ...s,
              name: dbStore.name || s.name,
              category: categoryKey || s.category,
              categoryLabel: dbStore.category || s.categoryLabel,
              address: dbStore.address || s.address,
              district: dbStore.district || s.district,
              latitude: Number(dbStore.latitude) || s.latitude,
              longitude: Number(dbStore.longitude) || s.longitude,
              phone: dbStore.phone || s.phone,
              deliveryFee: dbStore.delivery_fee ? `₦${Number(dbStore.delivery_fee).toLocaleString()}` : s.deliveryFee,
              isOpen: isOpenBool,
              is_open: isOpenBool,
              status: isOpenBool ? 'open' : 'closed',
              isClosed: !isOpenBool,
              openTime: meta.openTime || s.openTime,
              closeTime: meta.closeTime || s.closeTime,
              operatingDays: meta.operatingDays || s.operatingDays,
              is24Hours: is24H,
              image: meta.image || s.image,
            };
          })
        );

        setSelectedStore((prev) => {
          if (!prev || prev.id !== dbStore.id) return prev;
          return {
            ...prev,
            name: dbStore.name || prev.name,
            category: categoryKey || prev.category,
            categoryLabel: dbStore.category || prev.categoryLabel,
            address: dbStore.address || prev.address,
            district: dbStore.district || prev.district,
            latitude: Number(dbStore.latitude) || prev.latitude,
            longitude: Number(dbStore.longitude) || prev.longitude,
            phone: dbStore.phone || prev.phone,
            deliveryFee: dbStore.delivery_fee ? `₦${Number(dbStore.delivery_fee).toLocaleString()}` : prev.deliveryFee,
            isOpen: isOpenBool,
            is_open: isOpenBool,
            status: isOpenBool ? 'open' : 'closed',
            isClosed: !isOpenBool,
            openTime: meta.openTime || prev.openTime,
            closeTime: meta.closeTime || prev.closeTime,
            operatingDays: meta.operatingDays || prev.operatingDays,
            is24Hours: is24H,
            image: meta.image || prev.image,
          };
        });

        if (merchantStoreId === dbStore.id || currentMerchantStore?.id === dbStore.id) {
          setStoreOpenStatus(isOpenBool);
          setStoreTiming({
            is24Hours: is24H,
            openTime: meta.openTime,
            closeTime: meta.closeTime,
            operatingDays: meta.operatingDays,
          });
        }
      } else if (payload.eventType === 'DELETE' && payload.old) {
        const deletedId = payload.old.id;
        updateAndPersistStores((prev) => prev.filter((s) => s.id !== deletedId));
        setSelectedStore((prev) => (prev && prev.id === deletedId ? null : prev));
      }
    };

    const handleInventoryPayload = (payload) => {
      const item = payload.new || payload.old;
      if (!item || !item.store_id) return;
      const targetStoreId = item.store_id;

      if (payload.eventType === 'INSERT' && payload.new) {
        const newProduct = {
          id: payload.new.id,
          name: payload.new.name,
          category: payload.new.category || 'General',
          price: Number(payload.new.price) || 0,
          icon: payload.new.icon || '🛍️',
          imageUrl: payload.new.image_url,
          outOfStock: Boolean(payload.new.out_of_stock),
        };

        updateAndPersistStores((prev) =>
          prev.map((st) => {
            if (st.id !== targetStoreId) return st;
            const existing = st.products || [];
            if (existing.some((p) => p.id === newProduct.id)) {
              return {
                ...st,
                products: existing.map((p) => (p.id === newProduct.id ? newProduct : p)),
              };
            }
            return {
              ...st,
              products: [newProduct, ...existing],
            };
          })
        );

        setSelectedStore((prev) => {
          if (!prev || prev.id !== targetStoreId) return prev;
          const existing = prev.products || [];
          if (existing.some((p) => p.id === newProduct.id)) {
            return {
              ...prev,
              products: existing.map((p) => (p.id === newProduct.id ? newProduct : p)),
            };
          }
          return {
            ...prev,
            products: [newProduct, ...existing],
          };
        });
      } else if (payload.eventType === 'UPDATE' && payload.new) {
        const itemNew = payload.new;
        const targetProdId = itemNew.id;
        const isOutOfStock = Boolean(
          itemNew.out_of_stock !== undefined ? itemNew.out_of_stock : itemNew.outOfStock
        );

        updateAndPersistStores((prev) =>
          prev.map((st) => {
            if (st.id !== targetStoreId) return st;
            return {
              ...st,
              products: (st.products || []).map((p) => {
                if (p.id !== targetProdId) return p;
                return {
                  ...p,
                  ...(itemNew.name ? { name: itemNew.name } : {}),
                  ...(itemNew.price !== undefined ? { price: Number(itemNew.price) } : {}),
                  ...(itemNew.icon ? { icon: itemNew.icon } : {}),
                  ...(itemNew.image_url || itemNew.imageUrl ? { imageUrl: itemNew.image_url || itemNew.imageUrl } : {}),
                  outOfStock: isOutOfStock,
                };
              }),
            };
          })
        );

        setSelectedStore((prev) => {
          if (!prev || prev.id !== targetStoreId) return prev;
          return {
            ...prev,
            products: (prev.products || []).map((p) => {
              if (p.id !== targetProdId) return p;
              return {
                ...p,
                ...(itemNew.name ? { name: itemNew.name } : {}),
                ...(itemNew.price !== undefined ? { price: Number(itemNew.price) } : {}),
                ...(itemNew.icon ? { icon: itemNew.icon } : {}),
                ...(itemNew.image_url || itemNew.imageUrl ? { imageUrl: itemNew.image_url || itemNew.imageUrl } : {}),
                outOfStock: isOutOfStock,
              };
            }),
          };
        });
      } else if (payload.eventType === 'DELETE' && payload.old) {
        const deletedProdId = payload.old.id;

        updateAndPersistStores((prev) =>
          prev.map((st) => {
            if (st.id !== targetStoreId) return st;
            return {
              ...st,
              products: (st.products || []).filter((p) => p.id !== deletedProdId),
            };
          })
        );

        setSelectedStore((prev) => {
          if (!prev || prev.id !== targetStoreId) return prev;
          return {
            ...prev,
            products: (prev.products || []).filter((p) => p.id !== deletedProdId),
          };
        });
      }
    };

    // 1. Supabase Postgres replication subscriptions
    const unsubscribeStores = subscribeToStores(handleStorePayload);
    const unsubscribeInventory = subscribeToStoreInventory(handleInventoryPayload);

    // 2. Instant Cross-Device Broadcast listener (Sub-50ms peer-to-peer live sync)
    const unsubscribeBroadcast = subscribeToLiveBroadcast((event) => {
      if (event.eventType === 'STORE_UPDATE') {
        handleStorePayload({ eventType: 'UPDATE', new: event.store });
      } else if (event.eventType === 'STORE_INSERT') {
        handleStorePayload({ eventType: 'INSERT', new: event.store });
      } else if (event.eventType === 'STORE_DELETE') {
        handleStorePayload({ eventType: 'DELETE', old: { id: event.storeId } });
      } else if (event.eventType === 'INVENTORY_INSERT' || event.eventType === 'INVENTORY_UPDATE') {
        handleInventoryPayload({ eventType: event.eventType === 'INVENTORY_INSERT' ? 'INSERT' : 'UPDATE', new: event.item });
      } else if (event.eventType === 'INVENTORY_DELETE') {
        handleInventoryPayload({ eventType: 'DELETE', old: { id: event.itemId, store_id: event.storeId } });
      } else if (event.eventType === 'ORDER_UPDATE') {
        const payload = event.payload || event;
        updateAndPersistOrders((prev) =>
          prev.map((o) => {
            if (o.id === payload.orderId) {
              return {
                ...o,
                status: payload.status || o.status,
                boltStatus: payload.boltStatus || o.boltStatus,
                boltRider: payload.boltRider || o.boltRider,
                stops: payload.stops || o.stops,
                currentStopIndex: payload.currentStopIndex !== undefined ? payload.currentStopIndex : o.currentStopIndex,
                roadPointIndex: payload.roadPointIndex !== undefined ? payload.roadPointIndex : o.roadPointIndex,
                legStartedAt: payload.legStartedAt !== undefined ? payload.legStartedAt : o.legStartedAt,
                boltCoords: payload.boltCoords || o.boltCoords,
                journeyAlert: payload.journeyAlert || o.journeyAlert,
                eta: payload.eta || o.eta,
                courierSearching: payload.courierSearching !== undefined ? payload.courierSearching : o.courierSearching,
              };
            }
            return o;
          })
        );
      }
    });

    // 3. Background Heartbeat Poller (Every 15s): Guarantees live sync of stores & active orders
    const syncInterval = setInterval(() => {
      if (isMounted) {
        loadCloudStores();
        syncOrdersFromCloud(false);
      }
    }, 15000);

    // 4. AppState Lifecycle Listener: When user returns from background / unlocks screen, catch up elapsed time
    const appStateSub = AppState.addEventListener('change', (nextAppState) => {
      if (nextAppState === 'active' && isMounted) {
        setOrders((prev) => prev.map((ord) => calculateOrderRiderProgress(ord, Date.now())));
        loadCloudStores();
        syncOrdersFromCloud(false);
      }
    });

    return () => {
      isMounted = false;
      clearInterval(syncInterval);
      if (typeof unsubscribeStores === 'function') unsubscribeStores();
      if (typeof unsubscribeInventory === 'function') unsubscribeInventory();
      if (typeof unsubscribeBroadcast === 'function') unsubscribeBroadcast();
      if (appStateSub && typeof appStateSub.remove === 'function') appStateSub.remove();
    };
  }, []);

  // Load saved state (stores, user, timing, status & orders) from AsyncStorage and Supabase on app launch
  useEffect(() => {
    async function loadStoredState() {
      try {
        // 1. Restore local stores list & hydrate ALL stores with their saved schedules
        let baseStores = STORES_AROUND_ME;
        const storedStores = await AsyncStorage.getItem('getit_stores_list');
        if (storedStores) {
          try {
            const parsedStores = JSON.parse(storedStores);
            if (Array.isArray(parsedStores) && parsedStores.length > 0) {
              const seenLocal = new Set();
              baseStores = parsedStores.filter((s) => {
                if (!s || !s.id || seenLocal.has(s.id)) return false;
                seenLocal.add(s.id);
                return true;
              });
            }
          } catch (e) {}
        }

        // Hydrate timing, live status, and image for EVERY store in the list
        const hydratedStores = await Promise.all(
          baseStores.map(async (st) => {
            let updated = { ...st };
            try {
              const timingJson = await AsyncStorage.getItem(`getit_store_timing_${st.id}`);
              if (timingJson) {
                const parsedT = JSON.parse(timingJson);
                updated = { ...updated, ...parsedT };
              }
              const statusVal = await AsyncStorage.getItem(`getit_store_open_status_${st.id}`);
              if (statusVal !== null) {
                updated.isOpen = statusVal === 'true';
                updated.is_open = statusVal === 'true';
              }
              const imgVal = await AsyncStorage.getItem(`getit_store_image_${st.id}`);
              if (imgVal) {
                updated.image = imgVal;
              }
            } catch (e) {}
            return updated;
          })
        );
        const seenHydrated = new Set();
        const dedupedHydrated = hydratedStores.filter((s) => {
          if (!s || !s.id || seenHydrated.has(s.id)) return false;
          seenHydrated.add(s.id);
          return true;
        });
        setStoresList(dedupedHydrated);
        await AsyncStorage.setItem('getit_stores_list', JSON.stringify(dedupedHydrated));

        // 2. Restore active authenticated user (strict database verification)
        let activeMerchantStoreId = null;
        const storedUser = await AsyncStorage.getItem('getit_current_user');
        if (storedUser) {
          try {
            const parsed = JSON.parse(storedUser);
            // Verify against authoritative database
            const verified = await findDatabaseUser(parsed.id || parsed.phone || parsed.email);
            if (verified) {
              setCurrentUser(verified);
              setIsLoggedIn(true);
              if (verified.role === 'seller') {
                setAppMode('merchant');
                if (verified.storeId) {
                  setMerchantStoreId(verified.storeId);
                  activeMerchantStoreId = verified.storeId;
                }
              }
            } else {
              // Stale or deleted account: completely purge from device storage
              console.log('Stale user session detected, purging local storage');
              setCurrentUser(null);
              setIsLoggedIn(false);
              await AsyncStorage.removeItem('getit_current_user');
              await AsyncStorage.removeItem('getit_registered_users');
              await AsyncStorage.removeItem('getit_orders');
              setOrders([]);
            }
          } catch (e) {
            setCurrentUser(null);
            setIsLoggedIn(false);
            await AsyncStorage.removeItem('getit_current_user');
          }
        } else {
          setCurrentUser(null);
          setIsLoggedIn(false);
        }

        // 3. Restore active store's timing and live toggle state
        const targetActiveStore = activeMerchantStoreId
          ? hydratedStores.find((s) => s.id === activeMerchantStoreId)
          : null;
        if (targetActiveStore) {
          setStoreTiming({
            is24Hours: Boolean(targetActiveStore.is24Hours),
            openTime: targetActiveStore.openTime || '08:00 AM',
            closeTime: targetActiveStore.closeTime || '10:00 PM',
            operatingDays: targetActiveStore.operatingDays || 'Mon - Sun (Daily)',
          });
          if (targetActiveStore.isOpen !== undefined) {
            setStoreOpenStatus(Boolean(targetActiveStore.isOpen));
          }
        }

        // 4. Restore buyer pinned delivery location from AsyncStorage (persists across restarts)
        try {
          const storedPinnedLocation = await AsyncStorage.getItem('getit_buyer_pinned_location');
          if (storedPinnedLocation) {
            const parsedPinned = JSON.parse(storedPinnedLocation);
            if (parsedPinned && parsedPinned.latitude && parsedPinned.longitude) {
              setPinnedLocation(parsedPinned);
              setSelectedLocation(parsedPinned.name || parsedPinned.district || 'Selected Location');
              setMapCoords({
                latitude: parsedPinned.latitude,
                longitude: parsedPinned.longitude,
              });
              setMapRegion({
                latitude: parsedPinned.latitude,
                longitude: parsedPinned.longitude,
                latitudeDelta: 0.0035,
                longitudeDelta: 0.0035,
              });
              if (parsedPinned.name) setMapStreetAddress(parsedPinned.name);
              if (parsedPinned.apartment) setMapApartment(parsedPinned.apartment);
              if (parsedPinned.landmark) setMapLandmark(parsedPinned.landmark);
              if (parsedPinned.notes) {
                setMapNotes(parsedPinned.notes);
                setRiderDeliveryNote(parsedPinned.notes);
              }
            }
          }
        } catch (locErr) {
          console.warn('Error restoring pinned location on restart:', locErr);
        }

        // 6. Restore orders (from cloud Supabase sync as single source of truth)
        try {
          const cloudOrders = await getDatabaseOrders();
          if (cloudOrders && cloudOrders.length > 0) {
            const now = Date.now();
            const caughtUp = cloudOrders.map((ord) => calculateOrderRiderProgress(ord, now));
            setOrders(caughtUp);
            await AsyncStorage.setItem('getit_orders', JSON.stringify(caughtUp));
          } else {
            setOrders([]);
            await AsyncStorage.removeItem('getit_orders');
          }
        } catch (err) {
          console.warn('Could not sync cloud orders on startup:', err);
          const storedOrders = await AsyncStorage.getItem('getit_orders');
          if (storedOrders) {
            try {
              const parsed = JSON.parse(storedOrders);
              const now = Date.now();
              const caughtUp = (parsed || []).map((ord) => calculateOrderRiderProgress(ord, now));
              setOrders(caughtUp);
            } catch (e) {}
          }
        }

        // Ensure default & registered accounts exist in database
        await seedDefaultDatabaseUsers();
      } catch (err) {
        console.warn('Error loading AsyncStorage state:', err);
      }
    }
    loadStoredState();
  }, []);

  // Live Online Places Search with Strict Nigeria Geofencing
  const searchPlacesOnline = async (queryText, currentLocalMatches = []) => {
    if (!queryText || queryText.trim().length < 2) return;

    const userLat = userLiveCoords?.latitude || mapCoords.latitude || 9.0765;
    const userLng = userLiveCoords?.longitude || mapCoords.longitude || 7.48;

    // Strict Nigerian geographic coordinates boundary
    const isNigeriaLocation = (lat, lon, country) => {
      if (country && !country.toLowerCase().includes('nigeria') && !country.toLowerCase().includes('federal republic of nigeria')) {
        return false;
      }
      return lat >= 4.0 && lat <= 14.2 && lon >= 2.5 && lon <= 15.0;
    };

    try {
      setIsSearchingGeocode(true);
      // Append Nigeria to force search engine to focus on Nigerian locations
      const cleanQ = queryText.trim();
      const queryWithCountry = cleanQ.toLowerCase().includes('nigeria')
        ? cleanQ
        : `${cleanQ}, Nigeria`;

      const url = `https://photon.komoot.io/api/?q=${encodeURIComponent(queryWithCountry)}&lat=${userLat}&lon=${userLng}&limit=20`;
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        if (data && data.features && data.features.length > 0) {
          // Strictly filter out any location that is NOT in Nigeria (no Ireland, US, UK, etc.)
          const nigerianFeatures = data.features.filter((f) => {
            const props = f.properties || {};
            const coords = f.geometry?.coordinates || [];
            const lon = coords[0];
            const lat = coords[1];
            return isNigeriaLocation(lat, lon, props.country);
          });

          const apiPlaces = nigerianFeatures.map((f, idx) => {
            const props = f.properties || {};
            const [lon, lat] = f.geometry.coordinates || [userLng, userLat];
            const name = props.name || props.street || cleanQ;
            const subParts = [props.street, props.district, props.city, props.state].filter(Boolean);
            const district = subParts.length > 0 ? subParts.join(', ') : 'Nigeria';
            return {
              id: `api-place-${props.osm_id || idx}-${idx}`,
              name: name,
              district: district,
              city: props.city || 'Abuja',
              latitude: lat,
              longitude: lon,
              landmark: [props.name, props.street].filter(Boolean).join(', ') || 'Nearby Landmark',
              apartment: '',
            };
          });

          // Filter out false positives when searching for specific residential courts like The Rock Court
          let filteredApiPlaces = apiPlaces;
          if (cleanQ.toLowerCase().includes('rock') && cleanQ.toLowerCase().includes('court')) {
            filteredApiPlaces = apiPlaces.filter(
              (p) =>
                !p.name.toLowerCase().includes('appeal') &&
                !p.district.toLowerCase().includes('ilorin') &&
                !p.name.toLowerCase().includes('house on the rock') &&
                !p.district.toLowerCase().includes('christopher gwabin')
            );
          }

          setLiveApiResults(filteredApiPlaces);

          // Combine local matches and strictly Nigerian online results into map pins
          const allPins = [
            ...currentLocalMatches,
            ...filteredApiPlaces.filter(
              (ap) =>
                !currentLocalMatches.some(
                  (lm) =>
                    lm.name.toLowerCase() === ap.name.toLowerCase() ||
                    (Math.abs(lm.latitude - ap.latitude) < 0.002 &&
                      Math.abs(lm.longitude - ap.longitude) < 0.002)
                )
            ),
          ];

          setActiveSearchPins(allPins);

          // If online search found places and no local match was previously selected, auto-move to top online match!
          if (currentLocalMatches.length === 0 && allPins.length > 0) {
            const top = allPins[0];
            const newCoords = { latitude: top.latitude, longitude: top.longitude };
            const newReg = {
              latitude: top.latitude,
              longitude: top.longitude,
              latitudeDelta: 0.0035,
              longitudeDelta: 0.0035,
            };
            setMapCoords(newCoords);
            setMapRegion(newReg);
            setMapStreetAddress(top.name);
            setMapLandmark(top.landmark || top.district || '');
            if (mapRef.current) {
              mapRef.current.animateToRegion(newReg, 600);
            }
          }
        } else {
          setLiveApiResults([]);
        }
      }
    } catch (err) {
      console.log('Online place search notice:', err);
    } finally {
      setIsSearchingGeocode(false);
    }
  };

  const handleSearchTextChange = (text) => {
    setMapSearchText(text);
    setShowSuggestions(true);

    if (searchDebounceRef.current) {
      clearTimeout(searchDebounceRef.current);
    }

    if (!text || text.trim().length === 0) {
      setLiveApiResults([]);
      setActiveSearchPins([]);
      return;
    }

    // Immediately filter local directory for instant 0ms suggestions & map pins
    const localMatches = SEARCHABLE_LOCATIONS.filter((item) => {
      const q = text.toLowerCase();
      return (
        item.name.toLowerCase().includes(q) ||
        item.district.toLowerCase().includes(q) ||
        item.city.toLowerCase().includes(q) ||
        (item.landmark && item.landmark.toLowerCase().includes(q))
      );
    });

    if (localMatches.length > 0) {
      setActiveSearchPins(localMatches);
      // AUTOMATICALLY MOVE PIN & MAP TO TOP MATCH (e.g. The Rock Court Estate)!
      const topMatch = localMatches[0];
      const newCoords = { latitude: topMatch.latitude, longitude: topMatch.longitude };
      const newRegion = {
        latitude: topMatch.latitude,
        longitude: topMatch.longitude,
        latitudeDelta: 0.0035,
        longitudeDelta: 0.0035,
      };
      setMapCoords(newCoords);
      setMapRegion(newRegion);
      setMapStreetAddress(topMatch.name);
      setMapApartment(topMatch.apartment || '');
      setMapLandmark(topMatch.landmark || topMatch.district || '');
      if (mapRef.current) {
        mapRef.current.animateToRegion(newRegion, 500);
      }
    }

    // Also debounced query live places API
    searchDebounceRef.current = setTimeout(() => {
      searchPlacesOnline(text, localMatches);
    }, 350);
  };

  // Google Maps Helper & Live GPS functions
  const handleSelectSearchResult = (place) => {
    setActiveDistrictId(place.id);
    const newCoords = {
      latitude: place.latitude,
      longitude: place.longitude,
    };
    const newRegion = {
      latitude: place.latitude,
      longitude: place.longitude,
      latitudeDelta: 0.0035,
      longitudeDelta: 0.0035,
    };
    setMapCoords(newCoords);
    setMapRegion(newRegion);
    setMapStreetAddress(place.name);
    setMapApartment(place.apartment || '');
    setMapLandmark(place.landmark || place.district || '');
    setMapSearchText(place.name);
    setShowSuggestions(false);

    if (mapRef.current) {
      mapRef.current.animateToRegion(newRegion, 600);
    }
  };

  const handleCustomAddressSearch = async () => {
    if (!mapSearchText.trim()) return;
    setShowSuggestions(false);

    if (activeSearchPins.length > 0) {
      handleSelectSearchResult(activeSearchPins[0]);
      return;
    }

    if (combinedMapSearchResults.length > 0) {
      handleSelectSearchResult(combinedMapSearchResults[0]);
      return;
    }

    // Direct search
    await searchPlacesOnline(mapSearchText, []);
  };

  const handleGetLiveLocation = async () => {
    try {
      setIsLocatingUser(true);
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert(
          'Location Permission Required',
          'Please allow GPS location permission to show your live location on the map.'
        );
        setIsLocatingUser(false);
        return;
      }

      const loc = await Location.getCurrentPositionAsync({
        accuracy: Location.Accuracy.High,
      });

      const { latitude, longitude } = loc.coords;
      setUserLiveCoords({ latitude, longitude });
      setMapCoords({ latitude, longitude });
      const liveRegion = {
        latitude,
        longitude,
        latitudeDelta: 0.006,
        longitudeDelta: 0.006,
      };
      setMapRegion(liveRegion);

      if (mapRef.current) {
        mapRef.current.animateToRegion(liveRegion, 600);
      }

      try {
        const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
        if (rev && rev.length > 0) {
          const item = rev[0];
          const street = item.street || item.name || 'Current GPS Street';
          const district = item.district || item.subregion || item.city || 'Abuja';
          setMapStreetAddress(`${street}, ${district}`);
          setMapLandmark(`Live Doorstep GPS (±${Math.round(loc.coords.accuracy || 8)}m accuracy)`);
          Alert.alert(
            'Live GPS Locked 🎯',
            `Map centered on your live location:\n${street}, ${district}\n(${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E)`
          );
        } else {
          Alert.alert(
            'Live GPS Locked 🎯',
            `Map centered on your live GPS position:\n${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`
          );
        }
      } catch (revErr) {
        Alert.alert(
          'Live GPS Locked 🎯',
          `Map centered on your live GPS position:\n${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`
        );
      }
    } catch (err) {
      Alert.alert(
        'GPS Error',
        'Could not acquire live GPS position. Please make sure Location Services are enabled on your device.'
      );
    } finally {
      setIsLocatingUser(false);
    }
  };

  const closeLocationModal = () => {
    setLocationModalVisible(false);
    if (cameFromCart) {
      setCartModalVisible(true);
      setCameFromCart(false);
    }
  };

  const openLocationPickerFromCart = () => {
    if (pinnedLocation?.latitude && pinnedLocation?.longitude) {
      setMapCoords({
        latitude: pinnedLocation.latitude,
        longitude: pinnedLocation.longitude,
      });
      setMapRegion({
        latitude: pinnedLocation.latitude,
        longitude: pinnedLocation.longitude,
        latitudeDelta: 0.0035,
        longitudeDelta: 0.0035,
      });
      if (pinnedLocation.name) setMapStreetAddress(pinnedLocation.name);
      if (pinnedLocation.apartment) setMapApartment(pinnedLocation.apartment);
      if (pinnedLocation.landmark) setMapLandmark(pinnedLocation.landmark);
      if (pinnedLocation.notes) {
        setMapNotes(pinnedLocation.notes);
        setRiderDeliveryNote(pinnedLocation.notes);
      }
    }
    setCameFromCart(true);
    setCartModalVisible(false);
    setLocationModalVisible(true);
  };

  const confirmPinnedLocation = () => {
    const updated = {
      name: mapStreetAddress || `${mapCoords.latitude.toFixed(4)}° N, ${mapCoords.longitude.toFixed(4)}° E`,
      district: mapStreetAddress || 'Delivery Location',
      latitude: mapCoords.latitude,
      longitude: mapCoords.longitude,
      apartment: mapApartment,
      landmark: mapLandmark,
      notes: riderDeliveryNote || mapNotes,
    };
    setPinnedLocation(updated);
    setSelectedLocation(updated.name);
    setAcknowledgedDiffLocation(false);
    AsyncStorage.setItem('getit_buyer_pinned_location', JSON.stringify(updated)).catch(() => {});
    closeLocationModal();
    Alert.alert(
      'Location Pinned on Map! 📍',
      `Riders will navigate directly to ${updated.latitude.toFixed(4)}° N, ${updated.longitude.toFixed(4)}° E.\nLandmark: ${updated.landmark || 'Set on map'}`
    );
  };

  const handleSwitchDeliveryToLivePhoneLocation = async () => {
    if (!userLiveCoords) {
      Alert.alert('GPS Notice', 'Waiting for device GPS coordinates...');
      return;
    }
    const { latitude, longitude } = userLiveCoords;
    let street = `${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`;
    let district = 'Current Location';
    try {
      const rev = await Location.reverseGeocodeAsync({ latitude, longitude });
      if (rev && rev.length > 0) {
        street = rev[0].street || rev[0].name || street;
        district = rev[0].district || rev[0].subregion || rev[0].city || district;
      }
    } catch (e) {}

    const updated = {
      name: `${street}, ${district}`,
      district: district,
      latitude,
      longitude,
      apartment: mapApartment || '',
      landmark: 'Live Doorstep GPS Position',
      notes: riderDeliveryNote || mapNotes || '',
    };
    setPinnedLocation(updated);
    setSelectedLocation(updated.name);
    setMapCoords({ latitude, longitude });
    setMapStreetAddress(updated.name);
    setAcknowledgedDiffLocation(true);
    AsyncStorage.setItem('getit_buyer_pinned_location', JSON.stringify(updated)).catch(() => {});
    Alert.alert(
      '🎯 Switched to Current Phone Location!',
      `Delivery pin has been updated to your live GPS location:\n${updated.name}`
    );
  };

  const openExternalGoogleMaps = (lat, lng) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${lat},${lng}`;
    Linking.openURL(url).catch(() => {
      Alert.alert('Google Maps', 'Could not open Google Maps URL.');
    });
  };

  // Open a store modal and reset in-store search
  const openStoreModal = (store) => {
    const fresh = storesList.find((s) => s.id === store.id) || store;
    setSelectedStore(fresh);
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

  // Add to cart with store open check
  const addToCart = (product, store) => {
    const targetStore =
      store ||
      selectedStore ||
      storesList.find((s) => s.id === product.storeId || s.name === product.storeName);

    if (product && product.outOfStock) {
      Alert.alert(
        'Sold Out',
        `"${product.name}" is currently out of stock and unavailable for order.`,
        [{ text: 'Understood', style: 'default' }]
      );
      return;
    }

    if (targetStore && !isStoreCurrentlyOpen(targetStore)) {
      Alert.alert(
        '🔒 Store Currently Closed',
        `"${targetStore.name}" is currently closed and not accepting orders or bookings. You can browse provisions, but purchasing is disabled until the store re-opens.`,
        [{ text: 'Understood', style: 'default' }]
      );
      return;
    }

    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [
        ...prev,
        {
          ...product,
          qty: 1,
          storeName: targetStore?.name || store?.name || 'GETIT Store',
          storeId: targetStore?.id || store?.id,
        },
      ];
    });
  };

  const removeFromCart = (productId) => {
    setCart((prev) =>
      prev
        .map((item) => (item.id === productId ? { ...item, qty: item.qty - 1 } : item))
        .filter((item) => item.qty > 0)
    );
  };

  const deleteItemFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.id !== productId));
  };

  const clearAllCartItems = () => {
    if (cart.length === 0) return;
    Alert.alert(
      'Clear Basket',
      'Are you sure you want to remove all items from your basket?',
      [
        { text: 'Cancel', style: 'cancel' },
        { text: 'Remove All', style: 'destructive', onPress: () => setCart([]) },
      ]
    );
  };

  const cartSubtotal = cart.reduce((sum, item) => sum + item.price * item.qty, 0);

  // Group cart items by store for multi-store basket display and split dispatch
  const cartGroupedByStore = useMemo(() => {
    const groups = {};
    const storeOrder = [];
    cart.forEach((item) => {
      const storeId = item.storeId || 's1';
      const storeName = item.storeName || 'GETIT Store';
      if (!groups[storeId]) {
        storeOrder.push(storeId);
        const storeObj = storesList.find(
          (s) => s.id === storeId || s.name === storeName
        );
        groups[storeId] = {
          storeId,
          storeName: storeObj?.name || storeName,
          store: storeObj,
          latitude: Number(storeObj?.latitude) || 9.0882,
          longitude: Number(storeObj?.longitude) || 7.4933,
          items: [],
          subtotal: 0,
          isOpen: storeObj ? isStoreCurrentlyOpen(storeObj) : true,
        };
      }
      groups[storeId].items.push(item);
      groups[storeId].subtotal += item.price * item.qty;
    });
    return storeOrder.map((id) => groups[id]);
  }, [cart, storesList]);

  // Multi-Stop Courier Fee Calculation
  // Base fee for first store dispatch + ₦700 per additional pickup stop
  const baseCourierFee = cart.length > 0 ? (selectedDeliveryTier === 'bolt' ? 1200 : 2500) : 0;
  const multiStopCount = Math.max(0, cartGroupedByStore.length - 1);
  const multiStopFeePerShop = 700;
  const multiStopSurcharge = multiStopCount * multiStopFeePerShop;
  const deliveryFee = cart.length > 0 ? baseCourierFee + multiStopSurcharge : 0;
  const conciergeFee = Math.round(cartSubtotal * 0.04);
  const cartTotal = cartSubtotal + deliveryFee + conciergeFee;

  // Participating stores list for the map with assigned sequential stop numbers
  // Follows custom reorder or defaults: Shop A (H-Medix) is Stop 1, Shop B (Abdul Basit Store) is Stop 2
  const participatingStores = useMemo(() => {
    if (!cartGroupedByStore || cartGroupedByStore.length === 0) return [];

    let orderedGroups = [...cartGroupedByStore];

    if (customStoreOrder && customStoreOrder.length > 0) {
      const ordered = [];
      customStoreOrder.forEach((id) => {
        const found = orderedGroups.find((g) => g.storeId === id);
        if (found) ordered.push(found);
      });
      orderedGroups.forEach((g) => {
        if (!ordered.find((o) => o.storeId === g.storeId)) ordered.push(g);
      });
      orderedGroups = ordered;
    } else {
      // Automatic alignment: H-Medix is Shop A (Stop 1) and Abdul Basit Store is Shop B (Stop 2)
      orderedGroups.sort((a, b) => {
        const aName = (a.storeName || '').toLowerCase();
        const bName = (b.storeName || '').toLowerCase();
        if (aName.includes('medix') && bName.includes('basit')) return -1;
        if (bName.includes('medix') && aName.includes('basit')) return 1;
        return 0;
      });
    }

    return orderedGroups.map((g, idx) => ({
      id: g.storeId,
      storeId: g.storeId,
      name: g.storeName,
      storeName: g.storeName,
      stopNumber: idx + 1,
      latitude: Number(g.latitude) || 9.0882,
      longitude: Number(g.longitude) || 7.4933,
      isOpen: g.isOpen,
      subtotal: g.subtotal,
      items: g.items,
      itemsCount: g.items.reduce((s, i) => s + i.qty, 0),
    }));
  }, [cartGroupedByStore, customStoreOrder]);

  const reverseStoreOrder = () => {
    const currentIds = participatingStores.map((s) => s.id);
    setCustomStoreOrder([...currentIds].reverse());
  };

  const moveStoreOrder = (storeId, direction) => {
    const currentIds = participatingStores.map((s) => s.id);
    const idx = currentIds.indexOf(storeId);
    if (idx < 0) return;
    const targetIdx = idx + direction;
    if (targetIdx < 0 || targetIdx >= currentIds.length) return;
    const copy = [...currentIds];
    const temp = copy[idx];
    copy[idx] = copy[targetIdx];
    copy[targetIdx] = temp;
    setCustomStoreOrder(copy);
  };

  // Remove all items belonging to a specific store
  const clearStoreItems = (storeId) => {
    const targetGroup = cartGroupedByStore.find((g) => g.storeId === storeId);
    const storeName = targetGroup?.storeName || 'this store';
    Alert.alert(
      `Remove ${storeName} Items?`,
      `Are you sure you want to remove all provisions from "${storeName}" from your basket?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Remove',
          style: 'destructive',
          onPress: () => {
            setCart((prev) => prev.filter((item) => (item.storeId || 's1') !== storeId));
          },
        },
      ]
    );
  };

  // Active store fulfillment details for the basket map (primary or first participating store)
  const activeCartStore = useMemo(() => {
    if (!cart || cart.length === 0) return selectedStore || currentMerchantStore || storesList[0];
    const match = storesList.find(
      (s) => (cart[0]?.storeId && s.id === cart[0].storeId) || (cart[0]?.storeName && s.name === cart[0].storeName)
    );
    return match || selectedStore || currentMerchantStore || storesList[0];
  }, [cart, storesList, selectedStore, currentMerchantStore]);

  const activeCartStoreLat = Number(activeCartStore?.latitude) || 9.0882;
  const activeCartStoreLng = Number(activeCartStore?.longitude) || 7.4933;

  // Pinned delivery dropoff destination coordinates
  const deliveryDestLat = Number(pinnedLocation?.latitude || mapCoords.latitude) || 9.0882;
  const deliveryDestLng = Number(pinnedLocation?.longitude || mapCoords.longitude) || 7.4933;

  // Distance from Store to Pinned Delivery Destination (for courier dispatch calculations)
  const cartDistanceKm = useMemo(() => {
    return calculateDistanceKm(deliveryDestLat, deliveryDestLng, activeCartStoreLat, activeCartStoreLng);
  }, [deliveryDestLat, deliveryDestLng, activeCartStoreLat, activeCartStoreLng]);

  const cartEstDeliveryMins = useMemo(() => {
    const distToUse = participatingStores.length > 1 ? multiStopTotalDistanceKm : cartDistanceKm;
    if (distToUse === null || distToUse === 0) return '15-20 min';
    const mins = Math.max(12, Math.round(distToUse * 4.5 + 8 + (participatingStores.length - 1) * 7));
    return `${mins}-${mins + 5} min`;
  }, [cartDistanceKm, multiStopTotalDistanceKm, participatingStores.length]);

  // Sequential Multi-Stop Route Waypoints: Stop 1 -> Stop 2 -> Final Destination
  const multiStopWaypoints = useMemo(() => {
    if (participatingStores.length === 0) return [];
    const waypoints = participatingStores.map((st, idx) => ({
      id: `stop-${st.id}`,
      storeId: st.id,
      storeName: st.name,
      stopNumber: idx + 1,
      totalStops: participatingStores.length + 1,
      type: 'pickup',
      title: `Stop ${idx + 1}: ${st.name}`,
      description: `Pickup Hub (${st.itemsCount} items • ${formatNaira(st.subtotal)})`,
      latitude: st.latitude,
      longitude: st.longitude,
    }));

    waypoints.push({
      id: 'stop-final-dropoff',
      storeId: null,
      storeName: 'Your Delivery Address',
      stopNumber: waypoints.length + 1,
      totalStops: waypoints.length + 1,
      type: 'dropoff',
      title: '📍 Final Stop: Delivery Pin',
      description: pinnedLocation?.name || 'Customer dropoff point',
      latitude: deliveryDestLat,
      longitude: deliveryDestLng,
    });

    return waypoints;
  }, [participatingStores, pinnedLocation, deliveryDestLat, deliveryDestLng]);

  // Cumulative Sequential Distance across all legs (Shop 1 -> Shop 2 -> Customer)
  const multiStopTotalDistanceKm = useMemo(() => {
    if (multiStopWaypoints.length < 2) return cartDistanceKm || 0;
    let dist = 0;
    for (let i = 0; i < multiStopWaypoints.length - 1; i++) {
      const leg = calculateDistanceKm(
        multiStopWaypoints[i].latitude,
        multiStopWaypoints[i].longitude,
        multiStopWaypoints[i + 1].latitude,
        multiStopWaypoints[i + 1].longitude
      );
      if (leg) dist += leg;
    }
    return dist;
  }, [multiStopWaypoints, cartDistanceKm]);

  // Sequential Route Line Segments for Map Rendering
  // Guarantees: Store 1 -> Store 2 -> Store 3 ... -> Last Store -> Buyer Destination
  // Store 1 NEVER connects to the buyer when multiple stores are present.
  const multiStopRouteSegments = useMemo(() => {
    if (!participatingStores || participatingStores.length === 0) return [];
    const segments = [];

    // 1. Shop-to-Shop Pickup Hops (Store 1 -> Store 2 -> Store 3 ...)
    // Only connects Store i to Store i+1 in exact order
    for (let i = 0; i < participatingStores.length - 1; i++) {
      const currentStore = participatingStores[i];
      const nextStore = participatingStores[i + 1];
      segments.push({
        id: `seg-shop-hop-${currentStore.id}-${nextStore.id}`,
        from: currentStore,
        to: nextStore,
        coordinates: [
          { latitude: Number(currentStore.latitude) || 9.0882, longitude: Number(currentStore.longitude) || 7.4933 },
          { latitude: Number(nextStore.latitude) || 9.0882, longitude: Number(nextStore.longitude) || 7.4933 },
        ],
        strokeColor: '#D97706', // Amber gold dashed line for shop pickups
        strokeWidth: 3.5,
        lineDashPattern: [8, 5],
        legLabel: `Stop ${i + 1} to Stop ${i + 2}: ${currentStore.name} ➔ ${nextStore.name}`,
      });
    }

    // 2. Final Delivery Leg: ONLY from the VERY LAST store in the chain to the Buyer's Delivery Destination!
    const lastStore = participatingStores[participatingStores.length - 1];
    segments.push({
      id: `seg-final-dropoff-${lastStore.id}-to-customer`,
      from: lastStore,
      to: { name: 'Customer Destination', latitude: deliveryDestLat, longitude: deliveryDestLng },
      coordinates: [
        { latitude: Number(lastStore.latitude) || 9.0882, longitude: Number(lastStore.longitude) || 7.4933 },
        { latitude: deliveryDestLat, longitude: deliveryDestLng },
      ],
      strokeColor: COLORS.emeraldPrimary, // Emerald green dashed line for final dropoff
      strokeWidth: 4,
      lineDashPattern: [6, 4],
      legLabel: `Final Delivery Leg: ${lastStore.name} ➔ Pinned Destination`,
    });

    return segments;
  }, [participatingStores, deliveryDestLat, deliveryDestLng]);

  // Proximity check: Difference between buyer's real-time phone GPS and their pinned delivery address
  const liveDiffDistanceKm = useMemo(() => {
    if (!userLiveCoords?.latitude || !userLiveCoords?.longitude || !pinnedLocation?.latitude || !pinnedLocation?.longitude) {
      return null;
    }
    return calculateDistanceKm(
      userLiveCoords.latitude,
      userLiveCoords.longitude,
      pinnedLocation.latitude,
      pinnedLocation.longitude
    );
  }, [userLiveCoords, pinnedLocation]);

  const isDeliveryAtDifferentLocation = useMemo(() => {
    return liveDiffDistanceKm !== null && liveDiffDistanceKm >= 0.8;
  }, [liveDiffDistanceKm]);

  // Robust Fit View Handler: Calculates bounding box across destination, stores, and user GPS
  const fitCartMapToAllPins = (targetRef = cartMapRef, padding = 50) => {
    try {
      const targetMap = targetRef?.current || cartMapRef.current;
      if (!targetMap || !deliveryDestLat) return;

      const points = [
        { latitude: deliveryDestLat, longitude: deliveryDestLng },
        ...participatingStores.map((s) => ({ latitude: s.latitude, longitude: s.longitude })),
      ];
      // Only include userLiveCoords if it's within 40km of delivery destination to prevent zooming out across the country
      if (userLiveCoords?.latitude && userLiveCoords?.longitude) {
        const dLat = Math.abs(userLiveCoords.latitude - deliveryDestLat);
        const dLng = Math.abs(userLiveCoords.longitude - deliveryDestLng);
        if (dLat < 0.4 && dLng < 0.4) {
          points.push({
            latitude: userLiveCoords.latitude,
            longitude: userLiveCoords.longitude,
          });
        }
      }

      const lats = points.map((p) => Number(p.latitude)).filter((n) => !isNaN(n) && n !== 0);
      const lngs = points.map((p) => Number(p.longitude)).filter((n) => !isNaN(n) && n !== 0);
      if (lats.length === 0 || lngs.length === 0) return;

      const minLat = Math.min(...lats);
      const maxLat = Math.max(...lats);
      const minLng = Math.min(...lngs);
      const maxLng = Math.max(...lngs);

      const centerLat = (minLat + maxLat) / 2;
      const centerLng = (minLng + maxLng) / 2;
      const latDelta = Math.max(0.015, (maxLat - minLat) * 1.5);
      const lngDelta = Math.max(0.015, (maxLng - minLng) * 1.5);

      const targetRegion = {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: latDelta,
        longitudeDelta: lngDelta,
      };

      setCartMapRegion(targetRegion);

      // Animate to bounding region
      if (typeof targetMap.animateToRegion === 'function') {
        targetMap.animateToRegion(targetRegion, 450);
      }
      // Also invoke native fitToCoordinates if available with asymmetric padding
      if (typeof targetMap.fitToCoordinates === 'function') {
        try {
          const edgePadding =
            typeof padding === 'object' && padding !== null
              ? {
                  top: padding.top ?? 50,
                  right: padding.right ?? 50,
                  bottom: padding.bottom ?? 50,
                  left: padding.left ?? 50,
                }
              : {
                  top: padding,
                  right: padding,
                  bottom: padding,
                  left: padding,
                };

          targetMap.fitToCoordinates(points, {
            edgePadding,
            animated: true,
          });
        } catch (e) {}
      }
    } catch (e) {
      console.log('fitCartMapToAllPins error:', e?.message);
    }
  };

  // Smooth Zoom In (+) and Zoom Out (-) handler for Basket Map
  const zoomCartMap = (zoomIn = true, targetRef = cartMapRef) => {
    try {
      const targetMap = targetRef?.current || cartMapRef.current;
      if (!targetMap) return;

      const centerLat = cartMapRegion?.latitude || (deliveryDestLat + (participatingStores[0]?.latitude || activeCartStoreLat)) / 2;
      const centerLng = cartMapRegion?.longitude || (deliveryDestLng + (participatingStores[0]?.longitude || activeCartStoreLng)) / 2;
      const currentLatDelta = cartMapRegion?.latitudeDelta || 0.02;
      const currentLngDelta = cartMapRegion?.longitudeDelta || 0.02;

      // Multiplier: 0.5 to zoom in closer, 2.0 to zoom out
      const multiplier = zoomIn ? 0.5 : 2.0;
      const newLatDelta = Math.max(0.001, Math.min(2.5, currentLatDelta * multiplier));
      const newLngDelta = Math.max(0.001, Math.min(2.5, currentLngDelta * multiplier));

      const updatedRegion = {
        latitude: centerLat,
        longitude: centerLng,
        latitudeDelta: newLatDelta,
        longitudeDelta: newLngDelta,
      };

      setCartMapRegion(updatedRegion);
      if (typeof targetMap.animateToRegion === 'function') {
        targetMap.animateToRegion(updatedRegion, 250);
      }
      if (typeof targetMap.getCamera === 'function' && typeof targetMap.animateCamera === 'function') {
        targetMap.getCamera().then((cam) => {
          if (cam) {
            const nextAlt = zoomIn ? Math.max(100, cam.altitude * 0.5) : Math.min(100000, cam.altitude * 2.0);
            const nextZoom = zoomIn ? (cam.zoom ? cam.zoom + 1 : 16) : (cam.zoom ? cam.zoom - 1 : 13);
            targetMap.animateCamera({ altitude: nextAlt, zoom: nextZoom }, { duration: 250 });
          }
        }).catch(() => {});
      }
    } catch (e) {
      console.log('zoomCartMap error:', e?.message);
    }
  };

  // When cart is opened: auto-fetch live GPS for buyer blue dot and fit camera to frame pins ONCE
  useEffect(() => {
    if (cartModalVisible) {
      (async () => {
        try {
          const { status } = await Location.getForegroundPermissionsAsync();
          if (status === 'granted') {
            const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
            if (loc && loc.coords) {
              setUserLiveCoords({
                latitude: loc.coords.latitude,
                longitude: loc.coords.longitude,
              });
            }
          }
        } catch (e) {}
      })();

      if (!cartMapInitialFitDoneRef.current) {
        cartMapInitialFitDoneRef.current = true;
        setTimeout(() => {
          fitCartMapToAllPins(cartMapRef, 45);
        }, 500);
      }
    } else {
      cartMapInitialFitDoneRef.current = false;
    }
  }, [cartModalVisible]);

  // When fullscreen map opens: auto-frame all pins with proper asymmetric padding to avoid card/header overlap
  useEffect(() => {
    if (isCartMapFullscreen) {
      const paddingConfig = {
        top: Platform.OS === 'ios' ? 120 : 100,
        right: 45,
        bottom: 190,
        left: 45,
      };
      const t1 = setTimeout(() => {
        fitCartMapToAllPins(cartFullscreenMapRef, paddingConfig);
      }, 250);
      const t2 = setTimeout(() => {
        fitCartMapToAllPins(cartFullscreenMapRef, paddingConfig);
      }, 650);
      return () => {
        clearTimeout(t1);
        clearTimeout(t2);
      };
    }
  }, [isCartMapFullscreen]);

  // Customer Order Cancellation Handler
  const cancelBuyerOrder = (orderId) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    if (targetOrder.status !== 'New Order' && targetOrder.status !== 'Preparing') {
      Alert.alert(
        'Cannot Cancel',
        `This order is already "${targetOrder.status}". Once a courier is in transit or delivery is complete, cancellation cannot be processed directly in the app. Please contact VIP Concierge support.`
      );
      return;
    }

    Alert.alert(
      'Cancel Order',
      `Are you sure you want to cancel order ${targetOrder.id} from "${targetOrder.storeName}"?\n\nA full refund of ${formatNaira(targetOrder.total)} will be credited back to your account immediately.`,
      [
        { text: 'Keep Order', style: 'cancel' },
        {
          text: 'Yes, Cancel & Refund',
          style: 'destructive',
          onPress: () => {
            updateAndPersistOrders((prev) =>
              prev.map((o) =>
                o.id === orderId
                  ? {
                      ...o,
                      status: 'Cancelled',
                      cancellationReason: 'Cancelled by customer',
                      cancelledAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                    }
                  : o
              )
            );
            updateDatabaseOrderStatus(orderId, { status: 'Cancelled' }).catch(() => {});
            Alert.alert(
              '✅ Order Cancelled',
              `Order ${targetOrder.id} has been cancelled successfully. Your refund of ${formatNaira(targetOrder.total)} has been processed.`
            );
          },
        },
      ]
    );
  };

  // Cleanly sorted & filtered buyer orders list:
  // - Shows only orders belonging to the authenticated account
  // - Latest placed order is pinned at the top with 🔥 highlight badge
  // - Chronologically sorted (newest orders first)
  // - Filterable by Active, All, Delivered, Cancelled
  const sortedAndFilteredOrders = useMemo(() => {
    if (!currentUser) return [];

    const userPhoneDigits = (currentUser.phone || '').replace(/\D/g, '');
    const userEmail = (currentUser.email || '').trim().toLowerCase();
    const userId = currentUser.id;

    // Strict Buyer Account Isolation: Show only orders placed by this account!
    const myOrders = orders.filter((o) => {
      if (userId && (o.customerId === userId || o.customer_id === userId)) return true;
      if (userEmail && o.customerEmail && o.customerEmail.toLowerCase() === userEmail) return true;
      const orderPhoneDigits = (o.customerPhone || o.customer_phone || '').replace(/\D/g, '');
      if (userPhoneDigits && orderPhoneDigits) {
        if (userPhoneDigits.endsWith(orderPhoneDigits.slice(-10)) || orderPhoneDigits.endsWith(userPhoneDigits.slice(-10))) {
          return true;
        }
      }
      const orderName = (o.customerName || o.customer_name || '').trim().toLowerCase();
      const userName = (currentUser.fullName || currentUser.name || '').trim().toLowerCase();
      if (userName && orderName && userName === orderName) return true;
      return false;
    });

    const sorted = [...myOrders].sort((a, b) => {
      if (lastPlacedOrderId && a.id === lastPlacedOrderId) return -1;
      if (lastPlacedOrderId && b.id === lastPlacedOrderId) return 1;
      return (b.timestamp || 0) - (a.timestamp || 0);
    });

    if (ordersFilterTab === 'active') {
      return sorted.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled');
    }
    if (ordersFilterTab === 'completed') {
      return sorted.filter((o) => o.status === 'Delivered');
    }
    if (ordersFilterTab === 'cancelled') {
      return sorted.filter((o) => o.status === 'Cancelled');
    }
    return sorted;
  }, [orders, ordersFilterTab, lastPlacedOrderId, currentUser]);

  // 1-Tap Delivery Handover & PIN Verification
  const completeDeliveryHandover = (orderId) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    if (!targetOrder) return;

    Alert.alert(
      '📦 Confirm Package Handover',
      `Have you received all packages from courier ${targetOrder.boltRider?.name || 'Musa Ibrahim'}?\n\nSecurity PIN: ${targetOrder.deliveryPin}`,
      [
        { text: 'Not Yet', style: 'cancel' },
        {
          text: '✓ Yes, Received!',
          onPress: () => {
            updateAndPersistOrders((prev) =>
              prev.map((o) =>
                o.id === orderId
                  ? {
                      ...o,
                      status: 'Delivered',
                      eta: 'Delivered',
                      courierArrivedOutside: true,
                      hasNotifiedArrived: true,
                      deliveredAt: Date.now(),
                      journeyAlert: '✅ Order Delivered successfully! Thank you for choosing GETIT.',
                    }
                  : o
              )
            );

            // 🔔 Delivery Push & Sound
            notifyOrderDelivered(targetOrder);

            // Supabase cloud sync
            updateDatabaseOrderStatus(orderId, {
              status: 'Delivered',
              eta: 'Delivered',
              journeyAlert: '✅ Order Delivered successfully! Thank you for choosing GETIT.',
            }).catch(() => {});

            // Auto-launch customer review scorecard after handover
            setTimeout(() => {
              openReviewModalForOrder(targetOrder);
            }, 600);
          },
        },
      ]
    );
  };

  // Advance multi-stop courier journey: Step 1 -> Step 2 -> Dropoff Destination
  const advanceMultiStopJourney = (orderId) => {
    updateAndPersistOrders((prev) =>
      prev.map((ord) => {
        if (ord.id !== orderId) return ord;
        if (!ord.stops || ord.stops.length <= 1) {
          const nextStatus = ord.status === 'Preparing' ? 'On the Way' : 'Delivered';
          const newAlert = nextStatus === 'Delivered'
            ? '✅ Package delivered! Enjoy your provisions.'
            : '🛵 Courier has picked up your provisions and is on the way to your door!';
          return {
            ...ord,
            status: nextStatus,
            journeyAlert: newAlert,
          };
        }

        const currentIdx = ord.currentStopIndex || 0;
        const totalStops = ord.stops.length;

        if (currentIdx < totalStops - 1) {
          const nextIdx = currentIdx + 1;
          const updatedStops = ord.stops.map((st, idx) => {
            if (idx === currentIdx) {
              return {
                ...st,
                pickupStatus: 'picked_up',
                pickedUpAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };
            }
            if (idx === nextIdx) {
              return { ...st, pickupStatus: 'in_progress' };
            }
            return st;
          });

          const completedStoreName = ord.stops[currentIdx].storeName;
          const nextStoreName = ord.stops[nextIdx].storeName;
          const newAlert = `🔔 Picked up from Stop ${currentIdx + 1} (${completedStoreName})! Courier is now en route to Stop ${nextIdx + 1} (${nextStoreName}).`;

          Alert.alert(
            '🔔 Pickup Completed!',
            `Courier has collected your items from ${completedStoreName}!\n\nNext: Rider is en route to ${nextStoreName} for Stop ${nextIdx + 1}.`
          );

          return {
            ...ord,
            currentStopIndex: nextIdx,
            stops: updatedStops,
            journeyAlert: newAlert,
            status: 'Preparing',
          };
        } else if (currentIdx === totalStops - 1) {
          const updatedStops = ord.stops.map((st) => ({
            ...st,
            pickupStatus: 'picked_up',
            pickedUpAt: st.pickedUpAt || new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
          }));

          const newAlert = `🎉 All ${totalStops} shops collected! Courier has all your packages and is on the way to your pinned address.`;

          Alert.alert(
            '🎉 All Shops Collected!',
            `Courier has collected all packages from every shop and is now heading directly to your destination!`
          );

          return {
            ...ord,
            currentStopIndex: totalStops,
            stops: updatedStops,
            journeyAlert: newAlert,
            status: 'On the Way',
          };
        } else {
          // 🔔 Trigger delivery notification & audio chime!
          notifyOrderDelivered(ord);
          Alert.alert('✅ Order Delivered', 'All provisions have been delivered to your destination!');
          setTimeout(() => {
            openReviewModalForOrder(ord);
          }, 700);
          return {
            ...ord,
            status: 'Delivered',
            journeyAlert: '✅ Order Delivered successfully! Thank you for choosing GETIT.',
          };
        }
      })
    );
  };

  // Default Sample Reviews for Initial Social Proof
  const INITIAL_SAMPLE_REVIEWS = [
    {
      id: 'rev-init-1',
      storeId: 's1',
      storeName: 'The Gourmet Emporium',
      customerName: 'Hajiya Amina D.',
      storeRating: 5,
      storeTags: ['🍲 Fresh & Delicious', '🍱 Pristine Packaging', '✨ Generous Portion'],
      storeComment: 'Top notch imported truffle butter and charcuterie. Everything arrived chilled in premium thermal packaging!',
      riderName: 'Musa Ibrahim',
      riderRating: 5,
      riderTags: ['⚡ Lightning Fast', '🧤 Handled with Care'],
      riderTip: 1000,
      createdAt: 'Yesterday',
    },
    {
      id: 'rev-init-2',
      storeId: 's1',
      storeName: 'The Gourmet Emporium',
      customerName: 'Chinedu O.',
      storeRating: 5,
      storeTags: ['🔥 Temperature Perfect', '💯 Exactly as Ordered'],
      storeComment: 'The courier Musa was very courteous and followed all building gate security instructions.',
      riderName: 'Musa Ibrahim',
      riderRating: 5,
      riderTags: ['🛵 Courteous & Polite', '🎯 Followed Delivery Notes'],
      riderTip: 500,
      createdAt: '2 days ago',
    },
    {
      id: 'rev-init-3',
      storeId: 's2',
      storeName: 'Maitama Fresh Market',
      customerName: 'Farouk Bello',
      storeRating: 5,
      storeTags: ['🍲 Fresh & Delicious', '✨ Generous Portion'],
      storeComment: 'Fresh organic greens and prime beef cut just right. Will be ordering regularly for weekend family meals.',
      riderName: 'Emeka Nwosu',
      riderRating: 5,
      riderTags: ['⚡ Lightning Fast', '✨ Smooth Handover'],
      riderTip: 500,
      createdAt: '3 days ago',
    },
  ];

  // Load saved reviews on mount
  useEffect(() => {
    (async () => {
      try {
        const stored = await AsyncStorage.getItem('getit_order_reviews');
        if (stored) {
          const parsed = JSON.parse(stored);
          if (Array.isArray(parsed) && parsed.length > 0) {
            setReviewsList(parsed);
            return;
          }
        }
        setReviewsList(INITIAL_SAMPLE_REVIEWS);
      } catch (e) {
        setReviewsList(INITIAL_SAMPLE_REVIEWS);
      }
    })();
  }, []);

  // Register push notifications & subscribe to in-app audio toasts
  useEffect(() => {
    registerForPushNotificationsAsync();

    const unsubscribe = subscribeToInAppNotifications((notif) => {
      const targetAudience = notif.data?.audience;
      const targetStoreId = notif.data?.storeId;
      const targetCustomerId = notif.data?.customerId;
      const currentMode = appModeRef.current;
      const currentStore = currentMerchantStoreRef.current;
      const user = currentUserRef.current;

      // Strict Audience Shield:
      // A. If notification is strictly for buyer (e.g. arrival outside gate, courier on the way, PIN):
      // NEVER alert the store / merchant screen!
      if (targetAudience === 'buyer' && currentMode === 'merchant') {
        return;
      }
      // If customerId is provided, only alert if matches current logged-in buyer
      if (targetAudience === 'buyer' && targetCustomerId && user?.id && user.id !== targetCustomerId) {
        return;
      }

      // B. If notification is strictly for merchant (new order, 1-min reminders):
      // Only alert if the user is in merchant mode and owns the store!
      if (targetAudience === 'merchant') {
        if (currentMode !== 'merchant') return;
        if (targetStoreId && currentStore?.id && targetStoreId !== currentStore.id) {
          return;
        }
      }
      playAudioBeep(notif.type || 'default');
      setActiveToastNotification(notif);
      toastAnimY.setValue(-120);
      toastOpacity.setValue(0);

      Animated.parallel([
        Animated.spring(toastAnimY, {
          toValue: 20,
          friction: 6,
          tension: 40,
          useNativeDriver: true,
        }),
        Animated.timing(toastOpacity, {
          toValue: 1,
          duration: 250,
          useNativeDriver: true,
        }),
      ]).start();

      setTimeout(() => {
        Animated.parallel([
          Animated.timing(toastAnimY, {
            toValue: -120,
            duration: 350,
            useNativeDriver: true,
          }),
          Animated.timing(toastOpacity, {
            toValue: 0,
            duration: 300,
            useNativeDriver: true,
          }),
        ]).start(() => {
          setActiveToastNotification(null);
        });
      }, 5000);
    });

    return unsubscribe;
  }, []);

  // --- 1-MINUTE MERCHANT RECURRING REMINDER ENGINE (ACCEPTANCE & PREPARATION) ---
  const lastMerchantReminderRef = useRef({});

  useEffect(() => {
    // Check every 10 seconds for orders requiring a 1-minute reminder
    const reminderInterval = setInterval(() => {
      if (!currentUser) return;

      const myOrders = merchantOrders;
      if (!myOrders || myOrders.length === 0) {
        lastMerchantReminderRef.current = {};
        return;
      }

      const now = Date.now();
      const ONE_MINUTE = 60 * 1000;

      // 1. Orders awaiting acceptance (New Order)
      const awaitingAcceptance = myOrders.filter(
        (o) => getMerchantStopStatus(o, currentMerchantStore) === 'New Order'
      );

      if (awaitingAcceptance.length > 0) {
        if (!lastMerchantReminderRef.current.newOrdersInit) {
          lastMerchantReminderRef.current.newOrdersInit = now;
          lastMerchantReminderRef.current.lastNewReminder = now;
        } else {
          const lastTime = lastMerchantReminderRef.current.lastNewReminder || 0;
          if (now - lastTime >= ONE_MINUTE) {
            lastMerchantReminderRef.current.lastNewReminder = now;
            notifyMerchantAcceptanceReminder(awaitingAcceptance[0], awaitingAcceptance.length);
          }
        }
      } else {
        delete lastMerchantReminderRef.current.newOrdersInit;
        delete lastMerchantReminderRef.current.lastNewReminder;
      }

      // 2. Orders currently in preparation (Preparing)
      const inPreparation = myOrders.filter(
        (o) => getMerchantStopStatus(o, currentMerchantStore) === 'Preparing'
      );

      if (inPreparation.length > 0) {
        if (!lastMerchantReminderRef.current.prepOrdersInit) {
          lastMerchantReminderRef.current.prepOrdersInit = now;
          lastMerchantReminderRef.current.lastPrepReminder = now;
        } else {
          const lastTime = lastMerchantReminderRef.current.lastPrepReminder || 0;
          if (now - lastTime >= ONE_MINUTE) {
            lastMerchantReminderRef.current.lastPrepReminder = now;
            notifyMerchantPrepReminder(inPreparation[0], inPreparation.length);
          }
        }
      } else {
        delete lastMerchantReminderRef.current.prepOrdersInit;
        delete lastMerchantReminderRef.current.lastPrepReminder;
      }
    }, 10000);

    return () => clearInterval(reminderInterval);
  }, [merchantOrders, currentMerchantStore, currentUser]);

  const openReviewModalForOrder = (ord) => {
    if (!ord) return;
    setTargetReviewOrder(ord);
    setReviewStoreIndex(0);

    const initialMap = {};
    if (ord.stops && ord.stops.length > 0) {
      ord.stops.forEach((s) => {
        initialMap[s.storeId] = {
          storeId: s.storeId,
          storeName: s.storeName,
          rating: 5,
          tags: ['🍲 Fresh & Delicious', '🍱 Pristine Packaging'],
          comment: '',
        };
      });
    } else {
      const sId = ord.storeId || 's1';
      initialMap[sId] = {
        storeId: sId,
        storeName: ord.storeName || 'Partner Store',
        rating: 5,
        tags: ['🍲 Fresh & Delicious', '🍱 Pristine Packaging'],
        comment: '',
      };
    }

    setStoreRatingsMap(initialMap);
    setCourierRatingScore(5);
    setCourierSelectedTags(['⚡ Lightning Fast', '🛵 Courteous & Polite', '🧤 Handled with Care']);
    setCourierTipAmount(500);
    setCourierCommentText('');
    setReviewModalVisible(true);
  };

  const submitOrderReview = async () => {
    if (!targetReviewOrder) return;
    setIsSubmittingReview(true);

    const clientName = currentUser?.fullName || currentUser?.name || 'Verified Client';
    const riderName = targetReviewOrder.boltRider?.name || 'Musa Ibrahim';
    const newReviewsToPersist = [];

    const storeKeys = Object.keys(storeRatingsMap);
    storeKeys.forEach((sKey) => {
      const stData = storeRatingsMap[sKey];
      const revObj = {
        id: `rev-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
        orderId: targetReviewOrder.id,
        customerId: currentUser?.id || 'usr-client',
        customerName: clientName,
        storeId: stData.storeId,
        storeName: stData.storeName,
        storeRating: Number(stData.rating) || 5,
        storeTags: stData.tags || [],
        storeComment: stData.comment || '',
        riderName: riderName,
        riderRating: courierRatingScore,
        riderTags: courierSelectedTags,
        riderTip: courierTipAmount,
        createdAt: 'Just now',
      };
      newReviewsToPersist.push(revObj);

      submitDatabaseReview(revObj).catch(() => {});
    });

    const updatedReviews = [...newReviewsToPersist, ...reviewsList];
    setReviewsList(updatedReviews);
    try {
      await AsyncStorage.setItem('getit_order_reviews', JSON.stringify(updatedReviews));
    } catch (e) {}

    const primaryRating = storeRatingsMap[storeKeys[0]]?.rating || 5;
    updateAndPersistOrders((prev) =>
      prev.map((o) =>
        o.id === targetReviewOrder.id
          ? {
              ...o,
              isReviewed: true,
              reviewScore: primaryRating,
              reviewedAt: Date.now(),
            }
          : o
      )
    );

    setStoresList((prevStores) =>
      prevStores.map((st) => {
        const matchingRev = newReviewsToPersist.find((r) => r.storeId === st.id);
        if (matchingRev) {
          const currentCount = parseInt(String(st.reviewCount).replace(/[^0-9]/g, '')) || 40;
          const newCount = currentCount + 1;
          const currentRating = Number(st.rating) || 4.9;
          const newRating = Number(((currentRating * currentCount + matchingRev.storeRating) / newCount).toFixed(1));
          if (matchingRev?.storeId) {
            updateDatabaseStore(matchingRev.storeId, { rating: newRating }).catch(() => {});
          }
          return {
            ...st,
            rating: newRating,
            reviewCount: `${newCount}`,
          };
        }
        return st;
      })
    );

    setIsSubmittingReview(false);
    setReviewModalVisible(false);
    setTargetReviewOrder(null);

    Alert.alert(
      '⭐ Review Submitted!',
      `Thank you, ${clientName}! Your verified rating and feedback have been shared with ${targetReviewOrder.storeName} and courier ${riderName}.` +
        (courierTipAmount > 0 ? `\n\n₦${courierTipAmount.toLocaleString()} courier tip confirmed.` : '')
    );
  };

  const openStoreReviewsModal = async (store) => {
    if (!store) return;
    const storeRevs = reviewsList.filter((r) => r.storeId === store.id);
    setStoreReviewsViewing(storeRevs.length > 0 ? storeRevs : INITIAL_SAMPLE_REVIEWS.filter((r) => r.storeId === store.id));
    setStoreReviewsModalVisible(true);

    try {
      const cloudRevs = await getStoreReviews(store.id);
      if (cloudRevs && cloudRevs.length > 0) {
        setStoreReviewsViewing((prev) => {
          const merged = [...cloudRevs];
          prev.forEach((p) => {
            if (!merged.some((m) => m.id === p.id)) {
              merged.push(p);
            }
          });
          return merged;
        });
      }
    } catch (e) {}
  };

  const handleCheckout = () => {
    if (cart.length === 0) return;

    // Guard: Prevent checkout if any cart item belongs to a currently closed store
    const closedGroups = cartGroupedByStore.filter((g) => !g.isOpen);
    if (closedGroups.length > 0) {
      const closedNames = closedGroups.map((g) => g.storeName).join(', ');
      Alert.alert(
        '⛔ Store Currently Closed',
        `The following store(s) in your basket are currently closed: ${closedNames}.\n\nPlease remove items from closed stores or remove that shop to proceed with open stores.`,
        [
          {
            text: 'Remove Closed Stores',
            style: 'destructive',
            onPress: () => {
              const closedIds = new Set(closedGroups.map((g) => g.storeId));
              setCart((prev) => prev.filter((item) => !closedIds.has(item.storeId || 's1')));
            },
          },
          { text: 'View Basket', onPress: () => setCartModalVisible(true) },
          { text: 'Cancel', style: 'cancel' },
        ]
      );
      return;
    }

    const isMultiStore = participatingStores.length > 1;
    const masterOrderId = `ORD-${Math.floor(10000 + Math.random() * 90000)}`;
    const masterDeliveryPin = `${Math.floor(1000 + Math.random() * 9000)}`;

    // Inbound Funnel Dispatch Engine:
    // 1. Calculates distance of all stores from the Buyer's Home destination
    // 2. Selects the furthest store as the Outbound Anchor (Stop 1)
    // 3. Automatically queries the courier fleet to find a rider already near that outer shop!
    // 4. Sequences remaining stores inward toward the buyer's home so courier travels in one continuous forward funnel!
    const funnelDispatch = calculateInboundFunnelDispatch(
      participatingStores,
      pinnedLocation,
      FLEET_COURIERS
    );

    const assignedRider = funnelDispatch?.matchedRider || {
      name: 'Musa Ibrahim',
      phone: '+234 803 294 1194',
      rating: '4.95',
      vehicle: 'Bajaj Boxer 150 (Red)',
      plate: 'ABJ-492-KW',
      latitude: 9.0882,
      longitude: 7.4933,
    };

    const sequencedStores = funnelDispatch?.orderedStops || participatingStores;
    const anchorStore = funnelDispatch?.anchorStore || sequencedStores[0];

    const stops = sequencedStores.map((grp, index) => {
      const storeSubtotal = grp.subtotal;
      const grpDeliveryFee = Math.round(deliveryFee / sequencedStores.length);
      const grpConciergeFee = Math.round(storeSubtotal * 0.04);
      const grpTotal = storeSubtotal + grpDeliveryFee + grpConciergeFee;
      const pickupPin = `${Math.floor(1000 + Math.random() * 9000)}`;

      return {
        stopNumber: index + 1,
        storeId: grp.storeId,
        storeName: grp.storeName,
        latitude: Number(grp.latitude) || 9.0882,
        longitude: Number(grp.longitude) || 7.4933,
        distanceFromPrevKm: grp.distanceFromPrevKm || null,
        isAnchorStore: grp.isAnchorStore || index === 0,
        itemsCount: grp.items.reduce((sum, i) => sum + i.qty, 0),
        items: grp.items.map((i) => ({
          id: i.id,
          name: i.name,
          price: i.price,
          qty: i.qty,
          icon: i.icon,
        })),
        subtotal: storeSubtotal,
        total: grpTotal,
        vendorPayout: Math.round(storeSubtotal * 0.9),
        pickupPin: pickupPin,
        pickupStatus: index === 0 ? 'in_progress' : 'queued',
        status: 'New Order',
        pickedUpAt: null,
      };
    });

    const masterOrder = {
      id: masterOrderId,
      isMultiStore,
      isRouteOptimized: isMultiStore,
      isInboundFunnel: isMultiStore && funnelDispatch?.isInboundFunnel,
      anchorStoreName: anchorStore?.storeName,
      approachDistanceKm: funnelDispatch?.approachDistKm || '1.1',
      stopsCount: stops.length,
      currentStopIndex: 0,
      journeyAlert: isMultiStore
        ? `🛍️ Order Placed! Waiting for shop confirmation (${stops[0].storeName}).`
        : `🛍️ Order Placed! Waiting for ${stops[0]?.storeName || 'store'} to confirm and accept.`,
      status: 'New Order',
      storeId: stops[0]?.storeId || currentMerchantStore?.id || 'store-gourmet',
      storeName: isMultiStore
        ? `Multi-Store Order (${stops.map((s) => s.storeName).join(' ➔ ')})`
        : stops[0]?.storeName || currentMerchantStore?.name || 'GETIT Store',
      stops: stops,
      itemsCount: cart.reduce((sum, i) => sum + i.qty, 0),
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        storeName: i.storeName || stops[0]?.storeName,
      })),
      subtotal: cartSubtotal,
      deliveryFee: deliveryFee,
      conciergeFee: conciergeFee,
      total: cartTotal,
      deliveryPartner: selectedDeliveryTier,
      deliveryPin: masterDeliveryPin,
      customerId: currentUser?.id || null,
      customerEmail: currentUser?.email || '',
      customerName: currentUser?.fullName || currentUser?.name || 'Customer',
      customerPhone: currentUser?.phone || '',
      customerAddress: pinnedLocation.name,
      deliveryLocation: {
        latitude: pinnedLocation.latitude,
        longitude: pinnedLocation.longitude,
        landmark: pinnedLocation.landmark,
        apartment: pinnedLocation.apartment,
        notes: riderDeliveryNote || pinnedLocation.notes,
      },
      boltRider: null,
      boltStatus: 'PENDING_STORE_READY',
      riderOrigin: {
        latitude: Number(stops[0]?.latitude) || 9.0882,
        longitude: Number(stops[0]?.longitude) || 7.4933,
      },
      boltCoords: {
        latitude: Number(stops[0]?.latitude) || 9.0882,
        longitude: Number(stops[0]?.longitude) || 7.4933,
      },
      eta: isMultiStore ? '25-35 mins' : '15-20 mins',
      timestamp: Date.now(),
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      dateStr: 'Today',
    };

    updateAndPersistOrders((prev) => [masterOrder, ...prev]);

    // 🔔 Trigger immediate push notification + audio chime for buyer & merchant!
    notifyOrderPlaced(masterOrder);

    // Fetch real road street network directions: [RiderOrigin -> Shop 1 -> Shop 2 -> Customer]
    const riderStart = {
      latitude: Number(stops[0]?.latitude || 9.0882) - 0.0090,
      longitude: Number(stops[0]?.longitude || 7.4933) - 0.0080,
    };
    const roadWaypoints = [
      riderStart,
      ...stops.map((s) => ({ latitude: Number(s.latitude) || 9.0882, longitude: Number(s.longitude) || 7.4933 })),
      masterOrder.deliveryLocation,
    ];
    fetchRealRoadDirections(roadWaypoints).then((result) => {
      if (result && result.roadPoints && result.roadPoints.length > 0) {
        const updatedStops = masterOrder.stops.map((st, sIdx) => {
          // sIdx 0 corresponds to snappedWaypoints[1] since snappedWaypoints[0] is riderStart
          const snapped = result.snappedWaypoints ? result.snappedWaypoints[sIdx + 1] : null;
          return {
            ...st,
            snappedLatitude: snapped ? snapped.latitude : Number(st.latitude) || 9.0882,
            snappedLongitude: snapped ? snapped.longitude : Number(st.longitude) || 7.4933,
          };
        });
        const snappedDest =
          result.snappedWaypoints && result.snappedWaypoints.length > 0
            ? result.snappedWaypoints[result.snappedWaypoints.length - 1]
            : null;

        updateAndPersistOrders((prev) =>
          prev.map((o) =>
            o.id === masterOrder.id
              ? {
                  ...o,
                  roadRouteCoordinates: result.roadPoints,
                  roadLegs: result.legs,
                  snappedWaypoints: result.snappedWaypoints,
                  stops: updatedStops,
                  snappedDeliveryLocation: snappedDest
                    ? { ...o.deliveryLocation, latitude: snappedDest.latitude, longitude: snappedDest.longitude }
                    : o.deliveryLocation,
                  roadPointIndex: 0,
                  boltCoords: result.roadPoints[0],
                }
              : o
          )
        );

        updateDatabaseOrderStatus(masterOrder.id, {
          boltRider: {
            ...masterOrder.boltRider,
            stops: updatedStops,
            roadRouteCoordinates: result.roadPoints,
            roadLegs: result.legs,
            isMultiStore: masterOrder.isMultiStore,
            currentStopIndex: masterOrder.currentStopIndex || 0,
            journeyAlert: masterOrder.journeyAlert,
          },
          boltCoords: result.roadPoints[0],
        }).catch(console.warn);
      }
    });

    setCart([]);
    setCheckoutModalVisible(false);
    setCartModalVisible(false);
    if (selectedStore) setSelectedStore(null);
    setLastPlacedOrderId(masterOrder.id);
    setExpandedOrderId(masterOrder.id);
    setOrdersFilterTab('active');
    setActiveTab('orders');

    if (isMultiStore) {
      Alert.alert(
        '🎉 Multi-Store Order Confirmed!',
        `Your multi-store order (${masterOrder.id}) with ${stops.length} pickup hubs is confirmed!\n\n` +
          `• Outermost Hub: ${stops[0].storeName} (Stop 1)\n` +
          stops.map((s) => `• Stop ${s.stopNumber}: ${s.storeName} (${formatNaira(s.subtotal)})\n   Pickup PIN: ${s.pickupPin}`).join('\n\n') +
          `\n\nYour order has been sent to the shops. Once packaged, an available courier will be dispatched to pick up your provisions!`
      );
    } else {
      Alert.alert(
        'Order Confirmed! ⚡',
        `Your order ${masterOrder.id} for ${stops[0]?.storeName} has been sent to the store. Once packaged and ready, a courier will be dispatched for pickup.`
      );
    }

    createDatabaseOrder({
      ...masterOrder,
      stops: stops,
      roadRouteCoordinates: masterOrder.roadRouteCoordinates || [],
      roadLegs: masterOrder.roadLegs || [],
      isMultiStore: isMultiStore,
      currentStopIndex: 0,
      journeyAlert: masterOrder.journeyAlert,
      vendorPayout: stops.reduce((s, st) => s + st.vendorPayout, 0),
      pickupPin: stops[0]?.pickupPin,
    }).catch((e) => console.log('Supabase order upload notice:', e?.message));
  };

  // Merchant Helper Computations & Actions
  const merchantOwnedStores = storesList.filter((st) => {
    if (!currentUser) return false;
    if (currentUser.storeId && st.id === currentUser.storeId) return true;
    const uPhone = (currentUser.phone || '').replace(/\D/g, '');
    const sPhone = (st.phone || '').replace(/\D/g, '');
    if (uPhone.length >= 8 && sPhone.length >= 8) {
      if (uPhone.slice(-8) === sPhone.slice(-8)) return true;
    }
    return false;
  });

  const currentMerchantStore =
    merchantOwnedStores.find((s) => s.id === (merchantStoreId || currentUser?.storeId)) ||
    merchantOwnedStores[0] ||
    (currentUser?.role === 'seller' && currentUser.storeId ? { id: currentUser.storeId, name: currentUser.businessName || 'My Store' } : null);

  useEffect(() => {
    currentUserRef.current = currentUser;
  }, [currentUser]);

  useEffect(() => {
    currentMerchantStoreRef.current = currentMerchantStore;
  }, [currentMerchantStore]);

  const getMerchantStopForOrder = (ord, store = currentMerchantStore) => {
    if (!ord) return null;
    if (Array.isArray(ord.stops) && ord.stops.length > 0) {
      if (store) {
        const match = ord.stops.find(
          (st) =>
            (st.storeId && st.storeId === store.id) ||
            (st.storeName && store.name && st.storeName.toLowerCase() === store.name.toLowerCase())
        );
        if (match) return match;
      }
      return ord.stops[0];
    }
    return null;
  };

  const getMerchantStopStatus = (ord, store = currentMerchantStore) => {
    const matchingStop = getMerchantStopForOrder(ord, store);
    if (matchingStop) {
      if (matchingStop.pickupStatus === 'picked_up' || matchingStop.status === 'Completed') return 'Completed';
      if (matchingStop.pickupStatus === 'ready' || matchingStop.status === 'Ready for Pickup') return 'Ready for Pickup';
      if (matchingStop.pickupStatus === 'in_progress_prep' || matchingStop.pickupStatus === 'preparing' || matchingStop.status === 'Preparing') return 'Preparing';
      if (matchingStop.pickupStatus === 'rejected' || matchingStop.status === 'Rejected') return 'Rejected';
      if (matchingStop.status && matchingStop.status !== 'On the Way') return matchingStop.status;
    }
    if (ord.status === 'Completed' || ord.status === 'Delivered') return 'Completed';
    if (ord.status === 'Ready for Pickup' || ord.status === 'Looking for Courier' || ord.status === 'On the Way') return 'Ready for Pickup';
    if (ord.status === 'Preparing') return 'Preparing';
    return ord.status || 'New Order';
  };

  const merchantOrders = orders.filter((o) => {
    if (!currentUser) return false;

    // Find all store IDs owned by or assigned to this merchant
    const merchantPhoneDigits = (currentUser.phone || '').replace(/\D/g, '');
    const myStores = storesList.filter((s) => {
      if (currentUser.storeId && s.id === currentUser.storeId) return true;
      const sPhoneDigits = (s.phone || '').replace(/\D/g, '');
      if (merchantPhoneDigits && sPhoneDigits && (merchantPhoneDigits.endsWith(sPhoneDigits.slice(-10)) || sPhoneDigits.endsWith(merchantPhoneDigits.slice(-10)))) {
        return true;
      }
      return false;
    });

    const activeStore = currentMerchantStore || myStores[0];
    if (!activeStore) {
      return false;
    }

    const activeId = activeStore.id;
    const activeName = (activeStore.name || '').toLowerCase();

    if (o.storeId === activeId || (o.storeName && o.storeName.toLowerCase() === activeName)) {
      return true;
    }
    if (Array.isArray(o.stops) && o.stops.some((st) => st.storeId === activeId || (st.storeName && st.storeName.toLowerCase() === activeName))) {
      return true;
    }
    return false;
  });

  const merchantFilteredOrders = [...merchantOrders]
    .sort((a, b) => {
      const timeA = new Date(a.createdAt || a.created_at || 0).getTime() || 0;
      const timeB = new Date(b.createdAt || b.created_at || 0).getTime() || 0;
      return timeB - timeA;
    })
    .filter((o) => {
      const stopStatus = getMerchantStopStatus(o, currentMerchantStore);
      if (merchantOrderFilter === 'all') return true;
      if (merchantOrderFilter === 'new') return stopStatus === 'New Order';
      if (merchantOrderFilter === 'preparing') return stopStatus === 'Preparing';
      if (merchantOrderFilter === 'ready') return stopStatus === 'Ready for Pickup';
      if (merchantOrderFilter === 'completed') return stopStatus === 'Completed';
      return true;
    });

  const getMerchantOrderProductAmount = (ord) => {
    const matchingStop = getMerchantStopForOrder(ord, currentMerchantStore);
    if (matchingStop && Number(matchingStop.subtotal) > 0) {
      return Number(matchingStop.subtotal);
    }
    if (Array.isArray(ord.items) && ord.items.length > 0) {
      const matchingItems = ord.items.filter(
        (it) =>
          (!it.storeName && !it.storeId) ||
          (currentMerchantStore && (it.storeName === currentMerchantStore.name || it.storeId === currentMerchantStore.id)) ||
          it.storeName === 'The Gourmet Emporium'
      );
      if (matchingItems.length > 0) {
        const itemsTotal = matchingItems.reduce(
          (sum, it) => sum + (Number(it.price) || 0) * (Number(it.qty) || 1),
          0
        );
        if (itemsTotal > 0) return itemsTotal;
      }
    }
    return Number(ord.subtotal) || 0;
  };

  const merchantTotalRevenue = merchantOrders.reduce(
    (sum, o) => sum + getMerchantOrderProductAmount(o),
    0
  );

  const acceptMerchantOrder = (orderId) => {
    if (lastMerchantReminderRef.current) {
      lastMerchantReminderRef.current.prepOrdersInit = Date.now();
      lastMerchantReminderRef.current.lastPrepReminder = Date.now();
    }
    let storeAcceptedName = currentMerchantStore?.name || 'Store';
    let allStopsAccepted = true;
    let anyStopAccepted = true;
    let updatedStopsList = [];

    updateAndPersistOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          const stops = Array.isArray(o.stops) && o.stops.length > 0 ? o.stops : [];
          if (stops.length > 0) {
            updatedStopsList = stops.map((st) => {
              const isTargetShop =
                (currentMerchantStore && (st.storeId === currentMerchantStore.id || (st.storeName && currentMerchantStore.name && st.storeName.toLowerCase() === currentMerchantStore.name.toLowerCase()))) ||
                (!currentMerchantStore && st.storeName === 'The Gourmet Emporium');
              if (isTargetShop) {
                storeAcceptedName = st.storeName;
                return { ...st, status: 'Preparing', pickupStatus: 'in_progress_prep' };
              }
              return st;
            });

            allStopsAccepted = updatedStopsList.every((st) => st.status === 'Preparing' || st.status === 'Ready for Pickup');
            anyStopAccepted = updatedStopsList.some((st) => st.status === 'Preparing' || st.status === 'Ready for Pickup');
          }

          const dynamicAlert = stops.length > 1
            ? (allStopsAccepted
                ? `🍳 All shops (${stops.length}) have accepted and are preparing your packages!`
                : `🍳 ${storeAcceptedName} accepted & is preparing! Awaiting other stores.`)
            : `🍳 Store has accepted your order • Preparing your provisions.`;

          return {
            ...o,
            status: 'Preparing',
            stops: updatedStopsList.length > 0 ? updatedStopsList : o.stops,
            journeyAlert: dynamicAlert,
            boltRider: null,
          };
        }
        return o;
      })
    );

    Alert.alert(
      'Order Accepted',
      `Order ${orderId} is now marked as Preparing for ${storeAcceptedName}.`
    );

    const alertToSend = updatedStopsList.length > 1
      ? (allStopsAccepted
          ? `🍳 All shops (${updatedStopsList.length}) have accepted and are preparing your packages!`
          : `🍳 ${storeAcceptedName} accepted & is preparing! Awaiting other stores.`)
      : `🍳 Store has accepted your order • Preparing your provisions.`;

    updateDatabaseOrderStatus(orderId, {
      status: 'Preparing',
      stops: updatedStopsList.length > 0 ? updatedStopsList : undefined,
      journeyAlert: alertToSend,
    }).catch(() => {});
  };

  const dispatchBoltCourier = (orderId) => {
    readyMerchantOrder(orderId);
  };

  const readyMerchantOrder = (orderId) => {
    if (lastMerchantReminderRef.current) {
      delete lastMerchantReminderRef.current.prepOrdersInit;
      delete lastMerchantReminderRef.current.lastPrepReminder;
    }
    let storeReadyName = currentMerchantStore?.name || 'Store';
    let allStopsReady = true;
    let updatedStopsList = [];

    const targetOrder = orders.find((o) => o.id === orderId);
    const stops = Array.isArray(targetOrder?.stops) && targetOrder.stops.length > 0 ? targetOrder.stops : [];
    if (stops.length > 0) {
      updatedStopsList = stops.map((st) => {
        const isTargetShop =
          (currentMerchantStore && (st.storeId === currentMerchantStore.id || (st.storeName && currentMerchantStore.name && st.storeName.toLowerCase() === currentMerchantStore.name.toLowerCase()))) ||
          (!currentMerchantStore && st.storeName === 'The Gourmet Emporium');
        if (isTargetShop) {
          storeReadyName = st.storeName;
          return { ...st, status: 'Ready for Pickup', pickupStatus: 'ready' };
        }
        return st;
      });
      allStopsReady = updatedStopsList.every((st) => st.status === 'Ready for Pickup');
    }

    const isFirstStopReady = updatedStopsList[0] && (updatedStopsList[0].status === 'Ready for Pickup' || updatedStopsList[0].pickupStatus === 'ready');
    const shouldDispatch = allStopsReady || updatedStopsList.length <= 1 || isFirstStopReady;
    const initialStatus = shouldDispatch ? 'Looking for Courier' : 'Preparing';
    const initialAlert = stops.length > 1
      ? (allStopsReady
          ? `📦 All packages packed & ready! Looking for available nearby courier... 🚴‍♂️`
          : `📦 ${storeReadyName} has packed your package! Waiting for remaining stores.`)
      : `📦 Package packed & ready at ${storeReadyName}! Looking for available nearby courier... 🚴‍♂️`;

    updateAndPersistOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            status: initialStatus,
            stops: updatedStopsList.length > 0 ? updatedStopsList : o.stops,
            journeyAlert: initialAlert,
            courierSearching: shouldDispatch,
          };
        }
        return o;
      })
    );

    Alert.alert(
      'Order Ready for Pickup 📦',
      shouldDispatch
        ? `Order ${orderId} is packaged for ${storeReadyName}. Looking for nearby available courier...`
        : `Order ${orderId} packaged for ${storeReadyName}. Waiting for remaining shops.`
    );

    updateDatabaseOrderStatus(orderId, {
      status: initialStatus,
      stops: updatedStopsList.length > 0 ? updatedStopsList : undefined,
      journeyAlert: initialAlert,
    }).catch(() => {});

    // Courier Dispatch Sequence: Look for available courier, match, and notify!
    if (shouldDispatch) {
      setTimeout(() => {
        const assignedRider = {
          id: 'bolt-rider-01',
          name: 'Musa Ibrahim',
          phone: '+234 803 294 1194',
          rating: '4.95',
          trips: 1420,
          vehicle: 'Bajaj Boxer 150 (Red)',
          plate: 'ABJ-492-KW',
          avatar: '🛵',
        };

        const firstStop = (updatedStopsList && updatedStopsList[0]) || { latitude: 9.0882, longitude: 7.4933 };
        const targetOrder = orders.find((o) => o.id === orderId);
        const riderStartCoords = targetOrder?.riderOrigin || {
          latitude: Number(firstStop.latitude || 9.0882) - 0.0090,
          longitude: Number(firstStop.longitude || 7.4933) - 0.0080,
        };

        const dispatchedAlert = `🚴 Courier ${assignedRider.name} matched! Heading to ${storeReadyName} for pickup.`;
        const dispatchNow = Date.now();

        const dispatchPayload = {
          status: 'On the Way',
          boltStatus: 'IN_TRANSIT',
          boltRider: assignedRider,
          boltCoords: riderStartCoords,
          journeyAlert: dispatchedAlert,
          courierSearching: false,
          eta: '12-15 mins (Courier Matched)',
          legStartedAt: dispatchNow,
          roadPointIndex: 0,
          currentStopIndex: 0,
        };

        updateAndPersistOrders((prev) =>
          prev.map((o) => {
            if (o.id === orderId) {
              return {
                ...o,
                ...dispatchPayload,
              };
            }
            return o;
          })
        );

        // Immediate sub-50ms peer-to-peer broadcast so buyer screen sees rider dispatched instantly
        broadcastLiveEvent('ORDER_UPDATE', {
          orderId,
          ...dispatchPayload,
        });

        notifyCourierDispatched({ id: orderId, storeName: storeReadyName }, assignedRider.name);

        updateDatabaseOrderStatus(orderId, dispatchPayload).catch(() => {});
      }, 3500);
    }
  };

  const completeMerchantOrder = (orderId) => {
    const targetStore = currentMerchantStore || storesList.find((s) => s.id === merchantStoreId);
    let merchantStoreName = targetStore?.name || 'Store';
    let updatedStopsList = [];
    let allStopsPickedUp = false;

    let nextStopIndex = 0;
    let newBoltCoords = null;
    let newAlert = '';

    updateAndPersistOrders((prev) =>
      prev.map((o) => {
        if (o.id !== orderId) return o;
        const stops = Array.isArray(o.stops) && o.stops.length > 0 ? o.stops : [];
        if (stops.length > 0) {
          updatedStopsList = stops.map((st) => {
            const isTargetShop =
              (targetStore && (
                st.storeId === targetStore.id ||
                st.storeId === merchantStoreId ||
                (st.storeName && targetStore.name && st.storeName.toLowerCase().trim() === targetStore.name.toLowerCase().trim())
              )) ||
              (!targetStore && !merchantStoreId);

            if (isTargetShop) {
              merchantStoreName = st.storeName || merchantStoreName;
              return {
                ...st,
                status: 'Completed',
                pickupStatus: 'picked_up',
                pickedUpAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
              };
            }
            return st;
          });
          allStopsPickedUp = updatedStopsList.every((st) => st.pickupStatus === 'picked_up');
        } else {
          allStopsPickedUp = true;
        }

        // Snap rider coordinates to the handed-over store's location
        const storeCoords = {
          latitude: Number(targetStore?.latitude) || 9.0882,
          longitude: Number(targetStore?.longitude) || 7.4933,
        };
        newBoltCoords = storeCoords;

        const firstPendingIdx = updatedStopsList.findIndex((st) => st.pickupStatus !== 'picked_up');
        if (firstPendingIdx !== -1) {
          nextStopIndex = firstPendingIdx;
          const nextStoreName = updatedStopsList[firstPendingIdx].storeName || 'the next shop';
          newAlert = `🔔 Picked up from ${merchantStoreName}! Courier Musa Ibrahim is now riding to ${nextStoreName}.`;
        } else {
          nextStopIndex = updatedStopsList.length;
          newAlert = `🎉 All packages collected! Courier Musa Ibrahim has departed ${merchantStoreName} and is now riding directly to your address.`;
        }

        const now = Date.now();
        return {
          ...o,
          stops: updatedStopsList.length > 0 ? updatedStopsList : o.stops,
          currentStopIndex: nextStopIndex,
          roadPointIndex: 0,
          legStartedAt: now,
          boltCoords: newBoltCoords,
          journeyAlert: newAlert,
          status: 'On the Way',
        };
      })
    );

    Alert.alert(
      'Handover Confirmed ✅',
      `Packages for ${merchantStoreName} have been handed over to courier Musa Ibrahim.`
    );

    const handoverTime = Date.now();
    updateDatabaseOrderStatus(orderId, {
      stops: updatedStopsList.length > 0 ? updatedStopsList : undefined,
      currentStopIndex: nextStopIndex,
      roadPointIndex: 0,
      legStartedAt: handoverTime,
      boltCoords: newBoltCoords,
      journeyAlert: newAlert,
      status: 'On the Way',
    }).catch(() => {});

    broadcastLiveEvent('ORDER_UPDATE', {
      orderId,
      status: 'On the Way',
      stops: updatedStopsList,
      currentStopIndex: nextStopIndex,
      roadPointIndex: 0,
      legStartedAt: handoverTime,
      boltCoords: newBoltCoords,
      journeyAlert: newAlert,
    });
  };

  const rejectMerchantOrder = (orderId) => {
    let storeName = currentMerchantStore?.name || 'Store';
    let updatedStopsList = [];
    let allStopsRejected = false;

    Alert.alert('Reject Order', `Are you sure you want to reject the items for ${storeName}?`, [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject Order',
        style: 'destructive',
        onPress: () => {
          updateAndPersistOrders((prev) =>
            prev.map((o) => {
              if (o.id === orderId) {
                const stops = Array.isArray(o.stops) && o.stops.length > 0 ? o.stops : [];
                if (stops.length > 0) {
                  updatedStopsList = stops.map((st) => {
                    const isTargetShop =
                      (currentMerchantStore && (st.storeId === currentMerchantStore.id || (st.storeName && currentMerchantStore.name && st.storeName.toLowerCase() === currentMerchantStore.name.toLowerCase()))) ||
                      (!currentMerchantStore && st.storeName === 'The Gourmet Emporium');
                    if (isTargetShop) {
                      return { ...st, status: 'Rejected', pickupStatus: 'rejected' };
                    }
                    return st;
                  });
                  allStopsRejected = updatedStopsList.every((st) => st.status === 'Rejected');
                }

                const newMasterStatus = allStopsRejected || stops.length <= 1 ? 'Cancelled' : o.status;
                const journeyAlert = stops.length > 1
                  ? (allStopsRejected
                      ? `❌ Order Cancelled: All stores were unable to fulfill provisions.`
                      : `⚠️ ${storeName} could not fulfill their items. Remaining stops will continue.`)
                  : `❌ Order Cancelled: ${storeName} could not fulfill your provisions.`;

                return {
                  ...o,
                  status: newMasterStatus,
                  stops: updatedStopsList.length > 0 ? updatedStopsList : o.stops,
                  journeyAlert,
                };
              }
              return o;
            })
          );
          updateDatabaseOrderStatus(orderId, {
            status: allStopsRejected || updatedStopsList.length <= 1 ? 'Cancelled' : undefined,
            stops: updatedStopsList.length > 0 ? updatedStopsList : undefined,
          }).catch(() => {});
        },
      },
    ]);
  };

  const toggleStock = (productId) => {
    const targetStoreId = currentMerchantStore?.id || merchantStoreId;
    let nextOutOfStock = true;
    let targetProduct = null;

    updateAndPersistStores((prev) =>
      prev.map((store) => {
        if (store.id === targetStoreId) {
          const currentProd = (store.products || []).find((p) => p.id === productId);
          targetProduct = currentProd;
          nextOutOfStock = !currentProd?.outOfStock;
          return {
            ...store,
            products: (store.products || []).map((p) =>
              p.id === productId ? { ...p, outOfStock: nextOutOfStock } : p
            ),
          };
        }
        return store;
      })
    );

    // Keep selectedStore immediately in sync if buyer or preview has it open
    setSelectedStore((prev) => {
      if (!prev || prev.id !== targetStoreId) return prev;
      return {
        ...prev,
        products: (prev.products || []).map((p) =>
          p.id === productId ? { ...p, outOfStock: nextOutOfStock } : p
        ),
      };
    });

    // Update in Supabase & broadcast live to all buyers over WebSocket
    updateStoreInventoryItem(productId, {
      outOfStock: nextOutOfStock,
      storeId: targetStoreId,
      productObj: targetProduct,
    }).catch((e) => console.log('Supabase inventory stock update error:', e?.message));
  };

  const handlePickCustomProductImage = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setCustomProductImage(res.assets[0].uri);
      }
    } catch (err) {
      console.warn('Error picking image', err);
      Alert.alert('Upload Error', 'Could not access the selected photo.');
    }
  };

  const handleAddSuggestedProduct = (item) => {
    const rawPrice = adjustedPrices[item.id] !== undefined ? adjustedPrices[item.id] : item.suggestedPrice;
    const finalPrice = Number(rawPrice) > 0 ? Number(rawPrice) : item.suggestedPrice;

    const newProd = {
      id: `p-sug-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      name: item.name,
      price: finalPrice,
      icon: item.icon,
      imageUrl: item.imageUrl || null,
      category: item.category,
      outOfStock: false,
    };

    updateAndPersistStores((prev) =>
      prev.map((store) => {
        if (store.id === merchantStoreId) {
          return {
            ...store,
            products: [newProd, ...store.products],
          };
        }
        return store;
      })
    );

    setAddedItemsTracker((prev) => ({ ...prev, [item.id]: true }));

    // Non-blocking sync to Supabase Cloud store_inventory
    addStoreInventoryItem(merchantStoreId || 'store-fresh-mart', newProd).catch((e) =>
      console.log('Supabase inventory sync notice:', e?.message)
    );
  };

  const handleAddCustomProduct = () => {
    if (!customProductName.trim() || !customProductPrice.trim()) {
      Alert.alert('Missing Details', 'Please provide a product name and selling price.');
      return;
    }

    const newProd = {
      id: `p-custom-${Date.now()}`,
      name: customProductName.trim(),
      price: Number(customProductPrice) || 2500,
      icon: customProductIcon || '🛍️',
      imageUri: customProductImage,
      category: customProductCategory,
      outOfStock: false,
    };

    updateAndPersistStores((prev) =>
      prev.map((store) => {
        if (store.id === merchantStoreId) {
          return {
            ...store,
            products: [newProd, ...store.products],
          };
        }
        return store;
      })
    );

    setAddProductModalVisible(false);
    setCustomProductName('');
    setCustomProductPrice('');
    setCustomProductImage(null);
    Alert.alert('Product Live', `✓ ${newProd.name} added to ${currentMerchantStore?.name} catalog!`);

    // Sync custom product to Supabase Cloud store_inventory
    addStoreInventoryItem(merchantStoreId || 'store-fresh-mart', {
      ...newProd,
      imageUrl: customProductImage,
    }).catch((e) => console.log('Supabase custom item sync notice:', e?.message));
  };

  const addNewProduct = () => {
    handleAddCustomProduct();
  };

  // Handle Create & Launch New Store on Supabase & GETIT
  const handleCreateStore = async () => {
    if (!newStoreName.trim()) {
      Alert.alert('Store Name Required', 'Please enter a name for your store.');
      return;
    }

    setIsCreatingStore(true);
    const storeId = `store-${Date.now()}`;
    const selectedLoc =
      SEARCHABLE_LOCATIONS.find((l) =>
        l.district.toLowerCase().includes(newStoreDistrict.toLowerCase())
      ) || SEARCHABLE_LOCATIONS[0];

    const categoryKey = newStoreCategory.toLowerCase().includes('organ')
      ? 'organic'
      : newStoreCategory.toLowerCase().includes('bake')
      ? 'bakery'
      : newStoreCategory.toLowerCase().includes('cell')
      ? 'cellar'
      : newStoreCategory.toLowerCase().includes('herit')
      ? 'heritage'
      : 'gourmet';

    const storeRecord = {
      id: storeId,
      name: newStoreName.trim(),
      category: newStoreCategory,
      address: newStoreAddress.trim() || selectedLoc.name,
      district: newStoreDistrict,
      city: 'Abuja',
      latitude: selectedLoc.latitude || 9.0882,
      longitude: selectedLoc.longitude || 7.4933,
      phone: newStorePhone.trim(),
      rating: 5.0,
      isOpen: true,
      deliveryFee: Number(newStoreDeliveryFee) || 1200,
    };

    const newStoreObj = {
      id: storeId,
      name: storeRecord.name,
      category: categoryKey,
      categoryLabel: newStoreCategory,
      rating: 5.0,
      reviewCount: 'New',
      distance: '0.9 km',
      deliveryTime: newStoreDeliveryTime || '15-25 min',
      deliveryFee: `₦${Number(storeRecord.deliveryFee).toLocaleString()}`,
      freeDeliveryThreshold: 25000,
      tag: 'NEW MERCHANT',
      badgeColor: COLORS.emeraldPrimary,
      address: storeRecord.address,
      district: storeRecord.district,
      latitude: storeRecord.latitude,
      longitude: storeRecord.longitude,
      phone: storeRecord.phone,
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
      description:
        newStoreDescription.trim() ||
        `${storeRecord.name} — partner store live on GETIT Abuja. Fast doorstep delivery.`,
      products: [],
    };

    // 1. Instant local update & persistence so merchant and buyers see it immediately
    updateAndPersistStores((prev) => [newStoreObj, ...prev]);
    setMerchantStoreId(storeId);
    setCreateStoreModalVisible(false);
    setIsCreatingStore(false);
    setNewStoreName('');

    Alert.alert(
      '🎉 Store Created & Live on GETIT!',
      `"${storeRecord.name}" is now live and visible to buyers! You can now stock your shop with products from our catalog.`,
      [
        {
          text: 'Stock Products Now 📦',
          onPress: () => {
            setMerchantTab('inventory');
            setAddProductModalVisible(true);
          },
        },
        { text: 'Later', style: 'cancel' },
      ]
    );

    // 2. Persist to Supabase Cloud stores table
    createDatabaseStore(storeRecord).catch((err) => {
      console.warn('Failed to persist store to Supabase:', err);
    });
  };

  // --- ACCOUNT AUTH HANDLERS ---
  const handleRegisterBuyer = async () => {
    if (!authName.trim()) {
      Alert.alert('Name Required', 'Please provide your full name.');
      return;
    }
    const newBuyer = {
      id: currentUser?.id || `user-buyer-${Date.now()}`,
      role: 'buyer',
      fullName: authName.trim(),
      email: authEmail.trim() || `${authName.toLowerCase().replace(/\s+/g, '')}@getit.ng`,
      phone: authPhone.trim() || currentUser?.phone || '',
      address: authAddress.trim() || currentUser?.address || 'Abuja, Nigeria',
    };
    try {
      await registerDatabaseUser(newBuyer);
    } catch (e) {
      console.warn('Error saving buyer to database:', e);
    }
    setCurrentUser(newBuyer);
    setAppMode('customer');
    setAuthModalVisible(false);
    try {
      await AsyncStorage.setItem('getit_current_user', JSON.stringify(newBuyer));
    } catch (e) {}
    Alert.alert('🎉 Buyer Account Activated!', `Welcome, ${newBuyer.fullName}! You are now set up to order groceries and provisions.`);
  };

  const handleRegisterSeller = async () => {
    const businessName = authBusinessName.trim();
    const fullName = authName.trim() || currentUser?.fullName || '';
    const email = authEmail.trim() || currentUser?.email || '';
    const phone = authPhone.trim() || currentUser?.phone || '';
    const address = authAddress.trim() || currentUser?.address || 'Abuja, Nigeria';

    if (!businessName) {
      Alert.alert('Store Name Required', 'Please enter your store or business name.');
      return;
    }
    if (!fullName) {
      Alert.alert('Owner Name Required', 'Please enter your full name.');
      return;
    }

    const storeId = (currentUser && currentUser.storeId) ? currentUser.storeId : `store-${Date.now()}`;
    const sellerId = currentUser?.id || `user-seller-${Date.now()}`;

    const newSeller = {
      id: sellerId,
      role: 'seller',
      fullName: fullName,
      email: email || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@merchant.getit.ng`,
      phone: phone,
      password: currentUser?.password || 'password123',
      address: address,
      businessName: businessName,
      storeId: storeId,
    };

    // 1. Authoritatively persist updated user to Supabase
    try {
      await registerDatabaseUser(newSeller);
    } catch (err) {
      console.warn('Failed to persist merchant user to Supabase:', err);
    }

    const newStoreObj = {
      id: storeId,
      name: newSeller.businessName,
      category: 'gourmet',
      categoryLabel: 'Gourmet Groceries & Provisions',
      rating: 5.0,
      reviewCount: 'New',
      distance: '0.8 km',
      deliveryTime: '15-25 min',
      deliveryFee: '₦1,200',
      freeDeliveryThreshold: 25000,
      tag: 'NEW MERCHANT',
      badgeColor: COLORS.emeraldPrimary,
      address: newSeller.address || 'Abuja, Nigeria',
      district: 'Maitama, Abuja',
      latitude: 9.0882,
      longitude: 7.4933,
      phone: newSeller.phone,
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
      description: `${newSeller.businessName} — partner store live on GETIT Abuja.`,
      products: [],
      isOpen: true,
      is_open: true,
    };

    updateAndPersistStores((prev) => [newStoreObj, ...prev.filter((s) => s.id !== storeId)]);
    setMerchantStoreId(storeId);
    setCurrentUser(newSeller);
    setAppMode('merchant');
    setAuthModalVisible(false);

    try {
      await AsyncStorage.setItem('getit_current_user', JSON.stringify(newSeller));
    } catch (e) {}

    createDatabaseStore({
      id: storeId,
      name: newSeller.businessName,
      category: 'Gourmet & Groceries',
      address: newSeller.address,
      district: 'Maitama, Abuja',
      city: 'Abuja',
      latitude: 9.0882,
      longitude: 7.4933,
      phone: newSeller.phone,
      deliveryFee: 1200,
      isOpen: true,
    }).catch(console.warn);

    Alert.alert(
      '🎉 Seller Account & Store Live!',
      `Congratulations ${newSeller.fullName}! Your store "${newSeller.businessName}" is live on GETIT. You can now manage incoming orders and stock.`
    );
  };

  // --- DEDICATED LOGIN / SIGN UP SCREEN HANDLERS (DATABASE CONNECTED) ---
  const handleAuthBuyerSignIn = async () => {
    const input = authLoginInput.trim();
    const pass = authLoginPassword.trim();

    if (!input) {
      Alert.alert('Login Required', 'Please enter your registered email address or phone number.');
      return;
    }
    if (!pass) {
      Alert.alert('Password Required', 'Please enter your account password.');
      return;
    }

    // 1. Strict Database Verification
    const existingUser = await findDatabaseUser(input);
    if (!existingUser) {
      logDatabaseEvent('AUTH_ACCOUNT_NOT_FOUND', { role: 'buyer', input, platform: 'GETIT Mobile Expo' }, input).catch(() => {});
      Alert.alert(
        'Account Not Found',
        `No account matching "${input}" was found in our database.\n\nPlease ensure you entered the exact phone number (e.g. 0803...) or email you registered with, or click "Create Account" above to register.`
      );
      return;
    }

    // 2. Password Verification
    if (existingUser.password && pass !== existingUser.password) {
      logDatabaseEvent('AUTH_INCORRECT_PASSWORD', { role: 'buyer', userId: existingUser.id, name: existingUser.fullName, platform: 'GETIT Mobile Expo' }, input).catch(() => {});
      Alert.alert(
        'Incorrect Password',
        'The password entered does not match our database records. Please verify your password and try again.'
      );
      return;
    }

    // Log successful sign in
    logDatabaseEvent('AUTH_SIGNIN_SUCCESS', {
      role: existingUser.role,
      userId: existingUser.id,
      name: existingUser.fullName,
      email: existingUser.email,
      phone: existingUser.phone,
      platform: 'GETIT Mobile Expo'
    }, input).catch(() => {});

    // 3. Routing: Sign in directly to Customer Shopping mode
    setCurrentUser(existingUser);
    setAppMode('customer');
    setIsLoggedIn(true);
    syncOrdersFromCloud();
    if (existingUser.storeId) {
      setMerchantStoreId(existingUser.storeId);
    }
    try {
      await AsyncStorage.setItem('getit_current_user', JSON.stringify(existingUser));
    } catch (e) {}
    Alert.alert('🎉 Welcome Back!', `Signed in successfully as ${existingUser.fullName}. Your account is ready!`);
  };

  const handleAuthBuyerSignUp = async () => {
    const fullName = authSignupFullName.trim();
    const phone = authSignupPhone.trim();
    const email = authSignupEmail.trim();
    const pass = authSignupPassword.trim();
    const address = authSignupAddress.trim();

    if (!fullName) {
      Alert.alert('Full Name Required', 'Please enter your full name to create an account.');
      return;
    }
    if (!phone) {
      Alert.alert('Phone Number Required', 'Please enter your phone number to create an account.');
      return;
    }
    if (!pass) {
      Alert.alert('Password Required', 'Please create a secure password for your account.');
      return;
    }

    // 1. Check if user already exists in database
    const existing = (await findDatabaseUser(phone)) || (email ? await findDatabaseUser(email) : null);
    if (existing) {
      Alert.alert(
        'Account Already Exists',
        'An account with this phone number or email is already registered in our database.\n\nPlease switch to "Sign In" to access your account.'
      );
      setAuthScreenMode('signin');
      setAuthLoginInput(phone || email);
      return;
    }

    // 2. Register & Store in Database
    const newBuyer = await registerDatabaseUser({
      role: 'buyer',
      fullName: fullName,
      phone: phone,
      email: email || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@getit.ng`,
      password: pass,
      address: address || 'Nigeria',
    });

    setCurrentUser(newBuyer);
    setAppMode('customer');
    setIsLoggedIn(true);
    // Keep credentials remembered for seamless sign in
    setAuthLoginInput(phone || email || newBuyer.email);
    setAuthLoginPassword(pass);
    try {
      await AsyncStorage.setItem('getit_current_user', JSON.stringify(newBuyer));
    } catch (e) {}
    Alert.alert(
      '🎉 Account Created & Stored!',
      `Welcome to GETIT, ${newBuyer.fullName}! Your account has been saved in the database. You can now log in anytime with your phone number (${phone}) or email.`
    );
  };

  const handleAuthSellerSignIn = async () => {
    const input = authLoginInput.trim();
    const pass = authLoginPassword.trim();

    if (!input) {
      Alert.alert('Store Email / Phone Required', 'Please enter your registered store email or official phone number.');
      return;
    }
    if (!pass) {
      Alert.alert('Password Required', 'Please enter your merchant password.');
      return;
    }

    // 1. Strict Database Verification
    const existingSeller = await findDatabaseUser(input);
    if (!existingSeller) {
      logDatabaseEvent('AUTH_ACCOUNT_NOT_FOUND', { role: 'seller', input, platform: 'GETIT Mobile Expo' }, input).catch(() => {});
      Alert.alert(
        'Merchant Account Not Found',
        `No store owner account matching "${input}" was found in our database.\n\nPlease check your email or phone number, or click "Register Store" above to register.`
      );
      return;
    }

    // 2. Password Verification
    if (existingSeller.password && pass !== existingSeller.password) {
      logDatabaseEvent('AUTH_INCORRECT_PASSWORD', { role: 'seller', userId: existingSeller.id, businessName: existingSeller.businessName, platform: 'GETIT Mobile Expo' }, input).catch(() => {});
      Alert.alert(
        'Incorrect Password',
        'The merchant password entered does not match our database records. Please verify and try again.'
      );
      return;
    }

    // Log successful merchant sign in
    logDatabaseEvent('AUTH_SIGNIN_SUCCESS', {
      role: existingSeller.role,
      userId: existingSeller.id,
      storeId: existingSeller.storeId,
      businessName: existingSeller.businessName,
      name: existingSeller.fullName,
      phone: existingSeller.phone,
      platform: 'GETIT Mobile Expo'
    }, input).catch(() => {});

    // 3. Routing: Direct directly to Merchant Hub
    if (existingSeller.role === 'buyer' || !existingSeller.storeId) {
      const storeId = existingSeller.storeId || `store-${Date.now()}`;
      const storeName = existingSeller.businessName || `${existingSeller.fullName}'s Store`;
      existingSeller.role = 'seller';
      existingSeller.storeId = storeId;
      existingSeller.businessName = storeName;

      // Update in Supabase and local database
      registerDatabaseUser(existingSeller).catch(console.warn);
      createDatabaseStore({
        id: storeId,
        name: storeName,
        category: 'Gourmet & Groceries',
        address: existingSeller.address || 'Abuja, Nigeria',
        district: 'Maitama, Abuja',
        city: 'Abuja',
        latitude: 9.0882,
        longitude: 7.4933,
        phone: existingSeller.phone,
        isOpen: true,
        deliveryFee: 1200,
      }).catch(console.warn);
    }

    const activeStoreId = existingSeller.storeId || 's1';
    setCurrentUser(existingSeller);
    setMerchantStoreId(activeStoreId);
    setAppMode('merchant');
    setIsLoggedIn(true);
    syncOrdersFromCloud();
    setAuthLoginInput(existingSeller.phone || existingSeller.email || input);
    setAuthLoginPassword(pass);
    try {
      await AsyncStorage.setItem('getit_current_user', JSON.stringify(existingSeller));
      const savedTiming = await AsyncStorage.getItem(`getit_store_timing_${activeStoreId}`);
      if (savedTiming) {
        const parsedTiming = JSON.parse(savedTiming);
        setStoreTiming(parsedTiming);
        setStoresList((prev) =>
          prev.map((s) => (s.id === activeStoreId ? { ...s, ...parsedTiming } : s))
        );
      }
      const savedLive = await AsyncStorage.getItem(`getit_store_open_status_${activeStoreId}`);
      if (savedLive !== null) {
        const isOpenBool = savedLive === 'true';
        setStoreOpenStatus(isOpenBool);
        setStoresList((prev) =>
          prev.map((s) => (s.id === activeStoreId ? { ...s, isOpen: isOpenBool, is_open: isOpenBool } : s))
        );
      }
    } catch (e) {}
    Alert.alert(
      '🏪 Merchant Hub Live!',
      `Welcome to your Merchant Hub, ${existingSeller.fullName}! Logged into "${existingSeller.businessName || 'your store'}" from the database.`
    );
  };

  const handleAuthSellerSignUp = async () => {
    const businessName = authSignupBusinessName.trim();
    const fullName = authSignupFullName.trim();
    const phone = authSignupPhone.trim();
    const email = authSignupEmail.trim();
    const pass = authSignupPassword.trim();
    const address = authSignupAddress.trim();

    if (!businessName || !fullName) {
      Alert.alert('Details Required', 'Please enter your Store / Business Name and Owner Name.');
      return;
    }
    if (!phone) {
      Alert.alert('Phone Required', 'Please enter your official WhatsApp or phone number.');
      return;
    }
    if (!pass) {
      Alert.alert('Password Required', 'Please create a merchant password.');
      return;
    }

    // 1. Check if store already exists for this phone or email
    const existing = (await findDatabaseUser(phone)) || (email ? await findDatabaseUser(email) : null);
    if (existing && existing.role === 'seller' && existing.storeId) {
      Alert.alert(
        'Store Already Exists',
        `A store is already registered for this account under "${existing.businessName || 'your store'}".\n\nPlease sign in with your password to access your Merchant Hub.`
      );
      setAuthScreenMode('signin');
      setAuthLoginInput(phone || email);
      return;
    }

    // 2. Generate Store & Register / Upgrade User in Database
    const storeId = (existing && existing.storeId) ? existing.storeId : `store-${Date.now()}`;
    const newSeller = await registerDatabaseUser({
      id: existing ? existing.id : undefined,
      role: 'seller',
      fullName: fullName,
      phone: phone,
      email: email || existing?.email || `${fullName.toLowerCase().replace(/[^a-z0-9]/g, '')}@merchant.getit.ng`,
      password: pass,
      address: address || existing?.address || 'Nigeria',
      businessName: businessName,
      storeId: storeId,
    });

    const newStoreObj = {
      id: storeId,
      name: newSeller.businessName,
      category: 'gourmet',
      categoryLabel: 'Gourmet Groceries & Provisions',
      rating: 5.0,
      reviewCount: 'New',
      distance: '0.8 km',
      deliveryTime: '15-25 min',
      deliveryFee: '₦1,200',
      freeDeliveryThreshold: 25000,
      tag: 'NEW MERCHANT',
      badgeColor: COLORS.emeraldPrimary,
      address: newSeller.address || 'Nigeria',
      district: 'Nigeria',
      latitude: 9.0882,
      longitude: 7.4933,
      phone: newSeller.phone,
      image: 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=800&q=80',
      description: `${newSeller.businessName} — partner store live on GETIT Nigeria.`,
      products: [],
      isOpen: true,
      is_open: true,
    };

    updateAndPersistStores((prev) => [newStoreObj, ...prev]);
    setMerchantStoreId(storeId);
    setCurrentUser(newSeller);
    setAppMode('merchant');
    setIsLoggedIn(true);
    setAuthLoginInput(phone || email || newSeller.email);
    setAuthLoginPassword(pass);

    try {
      await AsyncStorage.setItem('getit_current_user', JSON.stringify(newSeller));
    } catch (e) {}

    createDatabaseStore({
      id: storeId,
      name: newSeller.businessName,
      category: 'Gourmet & Groceries',
      address: newSeller.address,
      district: 'Nigeria',
      city: 'Nigeria',
      latitude: 9.0882,
      longitude: 7.4933,
      phone: newSeller.phone,
      deliveryFee: 1200,
      isOpen: true,
    }).catch(console.warn);

    Alert.alert(
      '🎉 Store Registered & Stored on GETIT!',
      `Congratulations ${newSeller.fullName}! "${newSeller.businessName}" is now stored in the database and live on GETIT across Nigeria.`
    );
  };

  const handleAuthGuestBrowse = () => {
    setIsLoggedIn(true);
    setAppMode('customer');
  };

  const handleLogout = async () => {
    if (currentUser) {
      logDatabaseEvent('AUTH_SIGNOUT', {
        userId: currentUser.id,
        name: currentUser.fullName,
        role: currentUser.role,
        platform: 'GETIT Mobile Expo'
      }, currentUser.phone || currentUser.email || 'USER').catch(() => {});
    }
    try {
      await AsyncStorage.removeItem('getit_current_user');
      await AsyncStorage.removeItem('getit_orders');
    } catch (e) {}
    setCurrentUser(null);
    setOrders([]);
    setIsLoggedIn(false);
    setAuthScreenRole('buyer');
    setAuthScreenMode('signin');
    setAuthLoginInput('');
    setAuthLoginPassword('');
  };

  // --- STORE LIVE OPERATING STATUS & TIMING HANDLERS ---
  const handleToggleStoreLive = async () => {
    const nextStatus = !storeOpenStatus;
    setStoreOpenStatus(nextStatus);

    const targetStoreId = currentMerchantStore?.id || merchantStoreId;

    updateAndPersistStores((prev) =>
      prev.map((s) => (s.id === targetStoreId ? { ...s, isOpen: nextStatus, is_open: nextStatus, status: nextStatus ? 'open' : 'closed', isClosed: !nextStatus } : s))
    );

    if (selectedStore?.id === targetStoreId) {
      setSelectedStore((prev) => (prev ? { ...prev, isOpen: nextStatus, is_open: nextStatus, status: nextStatus ? 'open' : 'closed', isClosed: !nextStatus } : prev));
    }

    try {
      await AsyncStorage.setItem('getit_store_open_status', String(nextStatus));
      if (targetStoreId) {
        await AsyncStorage.setItem(`getit_store_open_status_${targetStoreId}`, String(nextStatus));
      }
    } catch (e) {}

    if (targetStoreId) {
      const updatedStoreData = {
        ...(currentMerchantStore || {}),
        id: targetStoreId,
        isOpen: nextStatus,
        is_open: nextStatus,
        status: nextStatus ? 'open' : 'closed',
        isClosed: !nextStatus,
      };
      // 1. Instant peer-to-peer broadcast so buyer app reflects change immediately without reload
      broadcastLiveEvent('STORE_UPDATE', { storeId: targetStoreId, store: updatedStoreData });

      // 2. Persist to Supabase database so future reloads / new buyers see updated status
      updateDatabaseStore(targetStoreId, {
        isOpen: nextStatus,
        is_open: nextStatus,
        status: nextStatus ? 'open' : 'closed',
      }).catch(console.warn);
    }

    Alert.alert(
      nextStatus ? '🟢 Store is LIVE!' : '🔴 Store is PAUSED',
      nextStatus
        ? `${currentMerchantStore?.name} is now online and accepting orders across Nigeria.`
        : `${currentMerchantStore?.name} is paused. Buyers will see that your store is currently closed and ordering/booking is disabled.`
    );
  };

  const handleSaveStoreTiming = async (newTiming) => {
    const timingToSave = newTiming || {
      is24Hours: tempIs24Hours,
      openTime: tempOpenTime,
      closeTime: tempCloseTime,
      operatingDays: tempOperatingDays,
    };
    setStoreTiming(timingToSave);

    const targetStoreId = currentMerchantStore?.id || merchantStoreId;

    updateAndPersistStores((prev) =>
      prev.map((s) => (s.id === targetStoreId ? { ...s, ...timingToSave } : s))
    );

    if (selectedStore?.id === targetStoreId) {
      setSelectedStore((prev) => (prev ? { ...prev, ...timingToSave } : prev));
    }

    setTimingModalVisible(false);
    try {
      await AsyncStorage.setItem('getit_store_timing', JSON.stringify(timingToSave));
      if (targetStoreId) {
        await AsyncStorage.setItem(`getit_store_timing_${targetStoreId}`, JSON.stringify(timingToSave));
        const updatedStore = { ...(currentMerchantStore || {}), ...timingToSave, id: targetStoreId };
        const isNowOpen = isStoreCurrentlyOpen(updatedStore);
        broadcastLiveEvent('STORE_UPDATE', {
          storeId: targetStoreId,
          store: {
            ...updatedStore,
            isOpen: isNowOpen,
            is_open: isNowOpen,
            status: isNowOpen ? 'open' : 'closed',
            isClosed: !isNowOpen,
          },
        });
        updateDatabaseStore(targetStoreId, {
          isOpen: isNowOpen,
          is_open: isNowOpen,
          status: isNowOpen ? 'open' : 'closed',
          openTime: timingToSave.openTime,
          closeTime: timingToSave.closeTime,
          operatingDays: timingToSave.operatingDays,
          is24Hours: timingToSave.is24Hours,
        }).catch(console.warn);
      }
    } catch (e) {
      console.warn('AsyncStorage error:', e);
    }
    Alert.alert(
      '⏰ Shop Timing Updated!',
      timingToSave.is24Hours
        ? `${currentMerchantStore?.name} is now running 24 HOURS (Always Open)! Customers can order around the clock.`
        : `Operating schedule updated: ${timingToSave.openTime} – ${timingToSave.closeTime} (${timingToSave.operatingDays}).`
    );
  };

  // --- STORE PROFILE & COVER PHOTO HANDLERS ---
  const handleOpenStoreImageModal = () => {
    setCustomStoreImageUrl(currentMerchantStore?.image || '');
    setStoreImageModalVisible(true);
  };

  const handleApplyStoreImage = (newUri) => {
    if (!newUri || !currentMerchantStore?.id) return;
    const cleanUri = String(newUri).trim();
    if (!cleanUri) return;
    const targetStoreId = currentMerchantStore.id;

    updateAndPersistStores((prev) =>
      prev.map((s) => (s.id === targetStoreId ? { ...s, image: cleanUri } : s))
    );
    if (selectedStore?.id === targetStoreId) {
      setSelectedStore((prev) => (prev ? { ...prev, image: cleanUri } : prev));
    }

    try {
      AsyncStorage.setItem(`getit_store_image_${targetStoreId}`, cleanUri);
    } catch (e) {}

    updateDatabaseStore(targetStoreId, { image: cleanUri }).catch(console.warn);

    setStoreImageModalVisible(false);
    Alert.alert('🎉 Cover Photo Updated!', `Store image for "${currentMerchantStore.name}" updated successfully!`);
  };

  const handlePickStoreImageFromGallery = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        handleApplyStoreImage(res.assets[0].uri);
      }
    } catch (err) {
      console.warn('Error picking image:', err);
      Alert.alert('Upload Notice', 'Could not access the selected photo from your device.');
    }
  };

  const handleOpenEditStoreDetailsModal = async () => {
    const lat = Number(currentMerchantStore?.latitude) || 9.0882;
    const lng = Number(currentMerchantStore?.longitude) || 7.4933;
    setEditStoreName(currentMerchantStore?.name || '');
    setEditStoreAddress(currentMerchantStore?.address || '');
    setEditStoreCategory(currentMerchantStore?.categoryLabel || 'Gourmet Groceries & Deli');
    setEditStorePhone(currentMerchantStore?.phone || '');
    setEditStoreDeliveryFee(String(currentMerchantStore?.deliveryFee || '1200').replace(/\D/g, ''));
    setEditStoreDescription(currentMerchantStore?.description || '');
    setEditStoreImage(currentMerchantStore?.image || '');
    setEditStoreLatitude(lat);
    setEditStoreLongitude(lng);
    setStoreMapRegion({
      latitude: lat,
      longitude: lng,
      latitudeDelta: 0.012,
      longitudeDelta: 0.012,
    });
    setEditStoreModalVisible(true);

    // Auto-fetch phone's GPS in background so blue dot is immediately visible
    try {
      const { status } = await Location.getForegroundPermissionsAsync();
      if (status === 'granted') {
        const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
        if (loc && loc.coords) {
          setUserLiveCoords({
            latitude: loc.coords.latitude,
            longitude: loc.coords.longitude,
          });
        }
      }
    } catch (e) {
      // quiet background attempt
    }
  };

  const handlePickEditStoreImage = async () => {
    try {
      const res = await DocumentPicker.getDocumentAsync({
        type: ['image/*'],
        copyToCacheDirectory: true,
      });
      if (!res.canceled && res.assets && res.assets.length > 0) {
        setEditStoreImage(res.assets[0].uri);
      }
    } catch (err) {
      console.warn('Error picking image:', err);
      Alert.alert('Upload Notice', 'Could not access the selected photo from your device.');
    }
  };

  const handleGetMerchantStoreLiveLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Location Permission', 'Please enable location permissions in settings so GETIT can pinpoint your storefront on the map.');
        return;
      }
      const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.High });
      if (loc && loc.coords) {
        const { latitude, longitude } = loc.coords;
        setUserLiveCoords({ latitude, longitude });
        setEditStoreLatitude(latitude);
        setEditStoreLongitude(longitude);
        setStoreMapRegion((prev) => ({ ...prev, latitude, longitude }));
        if (storeMiniMapRef.current) {
          storeMiniMapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.008,
            longitudeDelta: 0.008,
          }, 400);
        }
        if (storeFullMapRef.current) {
          storeFullMapRef.current.animateToRegion({
            latitude,
            longitude,
            latitudeDelta: 0.012,
            longitudeDelta: 0.012,
          }, 400);
        }
        Alert.alert('🎯 Live Phone GPS Locked!', `Found your current phone location (blue dot) and positioned the store pin at:\n${latitude.toFixed(4)}° N, ${longitude.toFixed(4)}° E`);
      }
    } catch (err) {
      console.warn('Error obtaining store GPS:', err);
      Alert.alert('GPS Notice', 'Could not access device GPS. You can drag the pin on the map to place your store.');
    }
  };

  const handleZoomStoreMiniMap = (zoomIn) => {
    const factor = zoomIn ? 0.5 : 2;
    const curLatDelta = storeMapRegion.latitudeDelta || 0.008;
    const curLngDelta = storeMapRegion.longitudeDelta || 0.008;
    const newLatDelta = Math.max(0.001, Math.min(1.0, curLatDelta * factor));
    const newLngDelta = Math.max(0.001, Math.min(1.0, curLngDelta * factor));
    const newReg = {
      latitude: Number(editStoreLatitude) || 9.0882,
      longitude: Number(editStoreLongitude) || 7.4933,
      latitudeDelta: newLatDelta,
      longitudeDelta: newLngDelta,
    };
    setStoreMapRegion(newReg);
    if (storeMiniMapRef.current) {
      storeMiniMapRef.current.animateToRegion(newReg, 250);
    }
  };

  const handleZoomStoreFullMap = (zoomIn) => {
    const factor = zoomIn ? 0.5 : 2;
    const curLatDelta = storeMapRegion.latitudeDelta || 0.012;
    const curLngDelta = storeMapRegion.longitudeDelta || 0.012;
    const newLatDelta = Math.max(0.001, Math.min(1.0, curLatDelta * factor));
    const newLngDelta = Math.max(0.001, Math.min(1.0, curLngDelta * factor));
    const newReg = {
      latitude: Number(editStoreLatitude) || 9.0882,
      longitude: Number(editStoreLongitude) || 7.4933,
      latitudeDelta: newLatDelta,
      longitudeDelta: newLngDelta,
    };
    setStoreMapRegion(newReg);
    if (storeFullMapRef.current) {
      storeFullMapRef.current.animateToRegion(newReg, 250);
    }
  };

  const handleSaveStoreDetails = () => {
    if (!editStoreName.trim()) {
      Alert.alert('Name Required', 'Please enter a name for your store.');
      return;
    }
    const targetStoreId = currentMerchantStore?.id || merchantStoreId;
    const finalImage = editStoreImage?.trim() || currentMerchantStore?.image || '';
    const finalLat = Number(editStoreLatitude) || 9.0882;
    const finalLng = Number(editStoreLongitude) || 7.4933;

    const updatedObj = {
      name: editStoreName.trim(),
      address: editStoreAddress.trim() || 'Nigeria',
      categoryLabel: editStoreCategory.trim() || 'Gourmet Groceries & Deli',
      phone: editStorePhone.trim(),
      deliveryFee: currentMerchantStore?.deliveryFee || '₦1,200',
      description: editStoreDescription.trim() || `${editStoreName.trim()} — verified partner store live on GETIT.`,
      latitude: finalLat,
      longitude: finalLng,
      ...(finalImage ? { image: finalImage } : {}),
    };

    updateAndPersistStores((prev) =>
      prev.map((s) => (s.id === targetStoreId ? { ...s, ...updatedObj } : s))
    );

    if (selectedStore?.id === targetStoreId) {
      setSelectedStore((prev) => (prev ? { ...prev, ...updatedObj } : prev));
    }

    if (targetStoreId) {
      try {
        if (finalImage) AsyncStorage.setItem(`getit_store_image_${targetStoreId}`, finalImage);
        AsyncStorage.setItem(`getit_store_lat_${targetStoreId}`, String(finalLat));
        AsyncStorage.setItem(`getit_store_lng_${targetStoreId}`, String(finalLng));
      } catch (e) {}

      updateDatabaseStore(targetStoreId, {
        name: updatedObj.name,
        address: updatedObj.address,
        phone: updatedObj.phone,
        latitude: finalLat,
        longitude: finalLng,
        ...(finalImage ? { image: finalImage } : {}),
      }).catch(console.warn);
    }

    setEditStoreModalVisible(false);
    Alert.alert('✅ Store Profile Updated', `Your store details and pinned map location for "${updatedObj.name}" were updated successfully.`);
  };

  // Helper to parse time strings like "8:00 AM", "10:00 AM", "10:00 PM", "8am", "10am", "22:00" into minutes of day
  function parseTimeToMinutes(timeStr) {
    if (!timeStr) return null;
    const clean = String(timeStr).trim().toUpperCase();
    const match = clean.match(/^(\d{1,2})(?::(\d{2}))?\s*(AM|PM)?$/i) ||
                  clean.match(/(\d{1,2})(?::(\d{2}))?\s*(AM|PM)/i) ||
                  clean.match(/(\d{1,2}):(\d{2})/);
    if (!match) return null;

    let hours = parseInt(match[1], 10);
    const minutes = match[2] ? parseInt(match[2], 10) : 0;
    const modifier = match[3] ? match[3].toUpperCase() : null;

    if (modifier === 'PM' && hours < 12) {
      hours += 12;
    } else if (modifier === 'AM' && hours === 12) {
      hours = 0;
    }
    return hours * 60 + minutes;
  }

  // Day mapping and evaluator for operating days schedules (e.g. 'Weekends Only', 'Mon - Fri', 'Mon - Sat', 'Daily')
  const DAY_MAP = {
    sunday: 0, sun: 0,
    monday: 1, mon: 1,
    tuesday: 2, tue: 2, tues: 2,
    wednesday: 3, wed: 3,
    thursday: 4, thu: 4, thur: 4, thurs: 4,
    friday: 5, fri: 5,
    saturday: 6, sat: 6,
  };

  function isStoreOpenOnDay(operatingDaysStr, testDate = new Date()) {
    if (!operatingDaysStr) return true;
    const clean = String(operatingDaysStr).trim().toLowerCase();
    if (
      !clean ||
      clean.includes('daily') ||
      clean.includes('everyday') ||
      clean.includes('every day') ||
      clean.includes('mon - sun') ||
      clean.includes('monday - sunday') ||
      clean.includes('all days') ||
      clean.includes('7 days') ||
      clean.includes('24/7')
    ) {
      return true;
    }

    const currentDay = testDate.getDay(); // 0 = Sun, 1 = Mon, ..., 6 = Sat

    // Explicit 'weekends only' or 'weekends'
    if (clean.includes('weekend')) {
      return currentDay === 0 || currentDay === 6;
    }

    // Explicit 'weekdays only' or 'weekdays'
    if (clean.includes('weekday')) {
      return currentDay >= 1 && currentDay <= 5;
    }

    // Range pattern: 'Mon - Fri', 'Monday - Friday', 'Mon - Sat', 'Fri - Sun', 'Sat - Sun'
    const rangeMatch = clean.match(/([a-z]+)\s*(?:-|–|—|to)\s*([a-z]+)/);
    if (rangeMatch) {
      const sStr = rangeMatch[1];
      const eStr = rangeMatch[2];
      const sDay = DAY_MAP[sStr];
      const eDay = DAY_MAP[eStr];
      if (sDay !== undefined && eDay !== undefined) {
        if (sDay <= eDay) {
          return currentDay >= sDay && currentDay <= eDay;
        } else {
          // Wraps over weekend, e.g. Fri - Sun (5 to 0) or Thu - Sun (4 to 0)
          return currentDay >= sDay || currentDay <= eDay;
        }
      }
    }

    // Token matching for lists: 'Sat, Sun', 'Saturday & Sunday', 'Mon, Wed, Fri'
    const tokens = clean.split(/[^a-z]+/);
    const matchedDays = [];
    for (const t of tokens) {
      if (DAY_MAP[t] !== undefined) {
        matchedDays.push(DAY_MAP[t]);
      }
    }

    if (matchedDays.length > 0) {
      return matchedDays.includes(currentDay);
    }

    return true;
  }

  function isStoreCurrentlyOpen(store) {
    if (!store) return false;

    // 1. Explicit manual pause or closed flag
    if (store.isOpen === false || store.is_open === false || store.status === 'closed' || store.isClosed === true) {
      return false;
    }

    // 2. If it is the current merchant store and merchant has paused the live toggle
    const isCurrentMerchant = Boolean(
      merchantStoreId && (store.id === merchantStoreId || store.id === currentMerchantStore?.id)
    );
    if (isCurrentMerchant && storeOpenStatus === false) {
      return false;
    }

    // 3. Resolve operating schedule & days
    const daysStr =
      (isCurrentMerchant && storeTiming?.operatingDays) ||
      store.operatingDays ||
      store.operating_days ||
      store.timing?.operatingDays ||
      'Mon - Sun (Daily)';

    const is24H = Boolean(
      store.is24Hours === true ||
      store.is_24_hours === true ||
      store.timing?.is24Hours === true ||
      (isCurrentMerchant && storeTiming?.is24Hours === true)
    );

    const now = new Date();
    const currentM = now.getHours() * 60 + now.getMinutes();
    const isOpenToday = isStoreOpenOnDay(daysStr, now);

    // If 24 hours mode is enabled, it operates 24h ONLY on its configured operating days
    if (is24H) {
      return isOpenToday;
    }

    let openStr =
      (isCurrentMerchant && storeTiming?.openTime) ||
      store.openTime ||
      store.open_time ||
      store.timing?.openTime ||
      '08:00 AM';

    let closeStr =
      (isCurrentMerchant && storeTiming?.closeTime) ||
      store.closeTime ||
      store.close_time ||
      store.timing?.closeTime ||
      '10:00 PM';

    const openM = parseTimeToMinutes(openStr);
    const closeM = parseTimeToMinutes(closeStr);

    if (openM === null || closeM === null) {
      return isOpenToday; // Fallback only if no parseable schedule
    }

    if (openM === closeM) {
      return isOpenToday; // Same open and close treated as 24-hour on operating days
    }

    if (openM < closeM) {
      // Normal daytime window (e.g. 8:00 AM to 10:00 PM)
      if (!isOpenToday) return false;
      return currentM >= openM && currentM < closeM;
    } else {
      // Overnight window (e.g. 8:00 PM to 2:00 AM)
      if (currentM >= openM) {
        return isOpenToday;
      } else if (currentM < closeM) {
        // Early morning hours of overnight shift from previous day
        const yesterday = new Date(now.getTime() - 24 * 60 * 60 * 1000);
        return isStoreOpenOnDay(daysStr, yesterday);
      } else {
        return false;
      }
    }
  }

  function getStoreTimingBadge(store) {
    if (!store) {
      return {
        label: '🔴 Closed',
        color: '#DC2626',
        bg: '#FEF2F2',
      };
    }

    const isCurrentMerchant = Boolean(
      merchantStoreId && (store.id === merchantStoreId || store.id === currentMerchantStore?.id)
    );

    // Check manual pause
    if (store.isOpen === false || store.is_open === false || (isCurrentMerchant && storeOpenStatus === false)) {
      return {
        label: '⏸️ Paused • Not Accepting Orders',
        color: '#DC2626',
        bg: '#FEF2F2',
      };
    }

    // Resolve 24-hour status
    const is24H = Boolean(
      store.is24Hours === true ||
      store.is_24_hours === true ||
      store.timing?.is24Hours === true ||
      (isCurrentMerchant && storeTiming?.is24Hours === true)
    );

    const daysStr =
      (isCurrentMerchant && storeTiming?.operatingDays) ||
      store.operatingDays ||
      store.operating_days ||
      store.timing?.operatingDays ||
      'Mon - Sun (Daily)';

    const now = new Date();
    const isOpenToday = isStoreOpenOnDay(daysStr, now);

    if (is24H) {
      if (!isOpenToday) {
        return {
          label: `🔴 Closed Today • ${daysStr}`,
          color: '#DC2626',
          bg: '#FEF2F2',
        };
      }
      return {
        label: '⚡ Open 24 Hours',
        color: '#047857',
        bg: '#ECFDF5',
      };
    }

    const openStr =
      (isCurrentMerchant && storeTiming?.openTime) ||
      store.openTime ||
      store.open_time ||
      store.timing?.openTime ||
      '08:00 AM';

    const closeStr =
      (isCurrentMerchant && storeTiming?.closeTime) ||
      store.closeTime ||
      store.close_time ||
      store.timing?.closeTime ||
      '10:00 PM';

    const open = isStoreCurrentlyOpen(store);

    if (!open) {
      if (!isOpenToday) {
        return {
          label: `🔴 Closed Today • ${daysStr}`,
          color: '#DC2626',
          bg: '#FEF2F2',
        };
      }
      return {
        label: `🔴 Closed • Opens ${openStr}`,
        color: '#DC2626',
        bg: '#FEF2F2',
      };
    }

    return {
      label: `🟢 Open Now • Closes ${closeStr}`,
      color: '#047857',
      bg: '#ECFDF5',
    };
  }

  // Bulk Inventory Import Handlers (SRT, CSV, TSV, POS Files)
  const handlePickInventoryFile = async () => {
    try {
      setIsParsingFile(true);
      const res = await DocumentPicker.getDocumentAsync({
        type: ['*/*'],
        copyToCacheDirectory: true,
      });

      if (!res.canceled && res.assets && res.assets.length > 0) {
        const file = res.assets[0];
        setBulkSelectedFileName(file.name);
        const fileRes = await fetch(file.uri);
        const textContent = await fileRes.text();
        setBulkImportText(textContent);
        const parsed = parseInventoryText(textContent);
        setBulkParsedProducts(parsed);
        if (parsed.length === 0) {
          Alert.alert(
            'Format Notice',
            'No products detected. Make sure items have names and prices (e.g. "Item Name, ₦5,000" or SRT format).'
          );
        } else {
          Alert.alert(
            'File Parsed! ⚡',
            `Successfully recognized ${parsed.length} products from ${file.name}. Review the list below and tap Confirm to import.`
          );
        }
      }
    } catch (err) {
      console.log('Document picker notice:', err);
      Alert.alert(
        'Notice',
        'Could not open file directly. You can copy the contents and paste them in the "Paste POS Text" tab.'
      );
    } finally {
      setIsParsingFile(false);
    }
  };

  const handleBulkTextChange = (text) => {
    setBulkImportText(text);
    const parsed = parseInventoryText(text);
    setBulkParsedProducts(parsed);
  };

  const handleLoadTemplate = (key) => {
    const tmpl = BULK_SAMPLE_TEMPLATES[key] || '';
    setBulkImportText(tmpl);
    const parsed = parseInventoryText(tmpl);
    setBulkParsedProducts(parsed);
    setBulkImportActiveTab('paste');
  };

  const handleRemoveBulkItem = (index) => {
    setBulkParsedProducts((prev) => prev.filter((_, idx) => idx !== index));
  };

  const handleConfirmBulkImport = () => {
    if (bulkParsedProducts.length === 0) {
      Alert.alert(
        'No Products Found',
        'Please upload an inventory file, paste products, or choose a template first.'
      );
      return;
    }

    updateAndPersistStores((prev) =>
      prev.map((store) => {
        if (store.id === merchantStoreId) {
          return {
            ...store,
            products: [...bulkParsedProducts, ...store.products],
          };
        }
        return store;
      })
    );

    const count = bulkParsedProducts.length;
    setBulkImportModalVisible(false);
    setBulkImportText('');
    setBulkParsedProducts([]);
    setBulkSelectedFileName('');
    Alert.alert(
      'Catalog Onboarding Success! 🎉',
      `Successfully imported ${count} new products with live pricing into ${currentMerchantStore?.name}! Customers can now order these items.`
    );
  };

  // Filtered stores on homepage with dynamic distance from buyer pin
  const buyerActiveLat = pinnedLocation?.latitude || mapCoords?.latitude || 9.0882;
  const buyerActiveLng = pinnedLocation?.longitude || mapCoords?.longitude || 7.4933;

  const filteredStores = useMemo(() => {
    const seenIds = new Set();
    return storesList
      .filter((store) => {
        if (!store || !store.id || seenIds.has(store.id)) return false;
        seenIds.add(store.id);
        const matchesCategory = activeCategory === 'all' || store.category === activeCategory;
        const matchesSearch =
          !searchQuery ||
          store.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase()) ||
          store.description.toLowerCase().includes(searchQuery.toLowerCase());
        return matchesCategory && matchesSearch;
      })
      .map((store) => {
        const storeLat = Number(store.latitude) || 9.0882;
        const storeLng = Number(store.longitude) || 7.4933;
        const distKm = calculateDistanceKm(buyerActiveLat, buyerActiveLng, storeLat, storeLng);
        const dynamicDistance =
          distKm !== null
            ? distKm < 1
              ? `${Math.round(distKm * 1000)} m`
              : `${distKm.toFixed(1)} km`
            : store.distance || '1.0 km';
        return {
          ...store,
          latitude: storeLat,
          longitude: storeLng,
          distance: dynamicDistance,
          distKm: distKm !== null ? distKm : 999,
        };
      })
      .sort((a, b) => (a.distKm || 0) - (b.distKm || 0));
  }, [storesList, activeCategory, searchQuery, buyerActiveLat, buyerActiveLng]);

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

  // Combined location search results for Map Address Search (Local directory + Live Online Places API)
  const localSearchMatches = mapSearchText.trim().length > 0
    ? SEARCHABLE_LOCATIONS.filter((item) => {
        const q = mapSearchText.toLowerCase();
        return (
          item.name.toLowerCase().includes(q) ||
          item.district.toLowerCase().includes(q) ||
          item.city.toLowerCase().includes(q) ||
          (item.landmark && item.landmark.toLowerCase().includes(q))
        );
      })
    : [];

  const combinedMapSearchResults = [
    ...localSearchMatches,
    ...liveApiResults.filter(
      (apiPlace) =>
        !localSearchMatches.some(
          (loc) =>
            loc.name.toLowerCase() === apiPlace.name.toLowerCase() ||
            (Math.abs(loc.latitude - apiPlace.latitude) < 0.002 &&
              Math.abs(loc.longitude - apiPlace.longitude) < 0.002)
        )
    ),
  ];

  // --- DEDICATED LUXURY LOGIN / SIGN UP SCREEN (ANIMATED & ORGANIZED) ---
  if (!isLoggedIn) {
    const isBuyer = authScreenRole === 'buyer';
    const isSignIn = authScreenMode === 'signin';

    return (
      <SafeAreaView style={styles.authPageSafeArea}>
        <StatusBar barStyle="dark-content" backgroundColor="#FAF7F2" />
        <ScrollView
          style={styles.authPageScroll}
          contentContainerStyle={styles.authPageScrollContent}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          {/* Top Brand Header: Minimal, Classy, Nigeria-wide */}
          <View style={styles.authPageBrandSection}>
            <Animated.View style={[styles.luxeLogoMedallion, { transform: [{ scale: logoScaleAnim }] }]}>
              <Image
                source={LOGO_TRANSPARENT}
                style={styles.luxeLogoImg}
                resizeMode="contain"
              />
            </Animated.View>

            <Text style={styles.authPageBrandTitle}>GETIT</Text>
            <View style={styles.luxeBrandBadgePill}>
              <Text style={styles.luxeBrandBadgeText}>🇳🇬 NIGERIA'S PREMIER MARKETPLACE</Text>
            </View>

            {!isBuyer && (
              <TouchableOpacity
                style={styles.luxeBackToBuyerPill}
                onPress={() => switchAuthRole('buyer')}
                activeOpacity={0.8}
              >
                <Text style={styles.luxeBackToBuyerText}>← Return to Shopper Portal</Text>
              </TouchableOpacity>
            )}
          </View>

          {/* Animated Luxury Auth Card */}
          <Animated.View
            style={[
              styles.luxeAuthCard,
              {
                opacity: authFadeAnim,
                transform: [{ translateY: authSlideAnim }],
              },
            ]}
          >
            {/* Card Header */}
            <View style={styles.luxeCardHeader}>
              <View style={{ flex: 1, paddingRight: 8 }}>
                <Text style={styles.luxeCardTitle}>
                  {isBuyer
                    ? (isSignIn ? 'Shopper Sign In' : 'Create Account')
                    : (isSignIn ? 'Merchant Sign In' : 'Register Store')}
                </Text>
                <Text style={styles.luxeCardSub}>
                  {isBuyer
                    ? (isSignIn ? 'Welcome back! Sign in to order groceries' : 'Quick sign up for grocery delivery across Nigeria')
                    : (isSignIn ? 'Manage your store catalog & live orders' : 'Launch your store on GETIT Nigeria')}
                </Text>
              </View>

              <View style={[styles.luxePortalBadge, isBuyer ? styles.buyerBadgePill : styles.merchantBadgePill]}>
                <Text style={isBuyer ? styles.buyerBadgeText : styles.merchantBadgeText}>
                  {isBuyer ? 'SHOPPER' : 'MERCHANT'}
                </Text>
              </View>
            </View>

            {/* Mode Switcher */}
            <View style={styles.luxeModePillsWrap}>
              <TouchableOpacity
                style={[styles.luxeModePillBtn, isSignIn && styles.luxeModePillActive]}
                onPress={() => switchAuthMode('signin')}
                activeOpacity={0.85}
              >
                <Text style={[styles.luxeModePillText, isSignIn && styles.luxeModePillTextActive]}>
                  Sign In
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.luxeModePillBtn, !isSignIn && styles.luxeModePillActive]}
                onPress={() => switchAuthMode('signup')}
                activeOpacity={0.85}
              >
                <Text style={[styles.luxeModePillText, !isSignIn && styles.luxeModePillTextActive]}>
                  {isBuyer ? 'Create Account' : 'Register Store'}
                </Text>
              </TouchableOpacity>
            </View>

            {/* --- BUYER / SHOPPER FORMS --- */}
            {isBuyer ? (
              isSignIn ? (
                /* Buyer Sign In Form */
                <View style={styles.luxeFormContainer}>
                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>✉️</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>EMAIL OR PHONE</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="e.g. 0803 123 4567 or email"
                        placeholderTextColor="#A8A29E"
                        value={authLoginInput}
                        onChangeText={setAuthLoginInput}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>🔒</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>PASSWORD</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="Enter password"
                        placeholderTextColor="#A8A29E"
                        secureTextEntry={!showPassword}
                        value={authLoginPassword}
                        onChangeText={setAuthLoginPassword}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.luxeEyeToggleBtn}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.luxeEyeToggleText}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.luxePrimaryBtn}
                    onPress={handleAuthBuyerSignIn}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.luxePrimaryBtnText}>Sign In ➔</Text>
                  </TouchableOpacity>

                  {/* Guest Browse Option */}
                  <TouchableOpacity
                    style={styles.luxeGuestBrowseBtn}
                    onPress={handleAuthGuestBrowse}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.luxeGuestBrowseText}>
                      Browse Stores as Guest ➔
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Streamlined Buyer Sign Up Form */
                <View style={styles.luxeFormContainer}>
                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>👤</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>FULL NAME</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="e.g. Fatima Bello"
                        placeholderTextColor="#A8A29E"
                        value={authSignupFullName}
                        onChangeText={setAuthSignupFullName}
                      />
                    </View>
                  </View>

                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>📱</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>PHONE NUMBER</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="e.g. 0802 345 6789"
                        placeholderTextColor="#A8A29E"
                        keyboardType="phone-pad"
                        value={authSignupPhone}
                        onChangeText={setAuthSignupPhone}
                      />
                    </View>
                  </View>

                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>✉️</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>EMAIL ADDRESS (OPTIONAL)</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="e.g. fatima@example.com"
                        placeholderTextColor="#A8A29E"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={authSignupEmail}
                        onChangeText={setAuthSignupEmail}
                      />
                    </View>
                  </View>

                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>🔒</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>PASSWORD</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="Create a password"
                        placeholderTextColor="#A8A29E"
                        secureTextEntry={!showPassword}
                        value={authSignupPassword}
                        onChangeText={setAuthSignupPassword}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.luxeEyeToggleBtn}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.luxeEyeToggleText}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  {/* Optional Delivery Address Toggle */}
                  <TouchableOpacity
                    style={styles.luxeOptionalToggle}
                    onPress={() => setShowSignupOptional(!showSignupOptional)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.luxeOptionalToggleText}>
                      {showSignupOptional ? '▲ Hide Delivery Address' : '+ Add Delivery Address (Optional)'}
                    </Text>
                  </TouchableOpacity>

                  {showSignupOptional && (
                    <View style={{ marginTop: 4 }}>
                      <View style={styles.luxeInputBox}>
                        <View style={styles.luxeInputIconWrap}>
                          <Text style={styles.luxeInputIcon}>📍</Text>
                        </View>
                        <View style={styles.luxeInputContent}>
                          <Text style={styles.luxeInputLabel}>DELIVERY ADDRESS (NIGERIA)</Text>
                          <TextInput
                            style={styles.luxeTextInput}
                            placeholder="e.g. Maitama, Abuja / Ikeja, Lagos"
                            placeholderTextColor="#A8A29E"
                            value={authSignupAddress}
                            onChangeText={setAuthSignupAddress}
                          />
                        </View>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={styles.luxePrimaryBtn}
                    onPress={handleAuthBuyerSignUp}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.luxePrimaryBtnText}>Create Account ➔</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.luxeGuestBrowseBtn}
                    onPress={handleAuthGuestBrowse}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.luxeGuestBrowseText}>
                      Browse Stores as Guest ➔
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            ) : (
              /* --- MERCHANT / VENDOR FORMS --- */
              isSignIn ? (
                /* Merchant Sign In */
                <View style={styles.luxeFormContainer}>
                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>🏪</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>EMAIL OR PHONE</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="e.g. 0803 111 2233 or email"
                        placeholderTextColor="#A8A29E"
                        value={authLoginInput}
                        onChangeText={setAuthLoginInput}
                        autoCapitalize="none"
                      />
                    </View>
                  </View>

                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>🔒</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>MERCHANT PASSWORD</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="Enter merchant password"
                        placeholderTextColor="#A8A29E"
                        secureTextEntry={!showPassword}
                        value={authLoginPassword}
                        onChangeText={setAuthLoginPassword}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.luxeEyeToggleBtn}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.luxeEyeToggleText}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={[styles.luxePrimaryBtn, { backgroundColor: COLORS.goldPrimary }]}
                    onPress={handleAuthSellerSignIn}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.luxePrimaryBtnText, { color: '#000000', fontWeight: '800' }]}>
                      Log In to Hub ➔
                    </Text>
                  </TouchableOpacity>
                </View>
              ) : (
                /* Streamlined Merchant Sign Up */
                <View style={styles.luxeFormContainer}>
                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>🏪</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>STORE NAME</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="e.g. Daily Fresh Organics"
                        placeholderTextColor="#A8A29E"
                        value={authSignupBusinessName}
                        onChangeText={setAuthSignupBusinessName}
                      />
                    </View>
                  </View>

                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>👤</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>OWNER / MANAGER NAME</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="e.g. Chinedu Eze"
                        placeholderTextColor="#A8A29E"
                        value={authSignupFullName}
                        onChangeText={setAuthSignupFullName}
                      />
                    </View>
                  </View>

                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>📱</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>PHONE / WHATSAPP</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="e.g. 0803 555 7788"
                        placeholderTextColor="#A8A29E"
                        keyboardType="phone-pad"
                        value={authSignupPhone}
                        onChangeText={setAuthSignupPhone}
                      />
                    </View>
                  </View>

                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>✉️</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>BUSINESS EMAIL (OPTIONAL)</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="e.g. store@example.com"
                        placeholderTextColor="#A8A29E"
                        keyboardType="email-address"
                        autoCapitalize="none"
                        value={authSignupEmail}
                        onChangeText={setAuthSignupEmail}
                      />
                    </View>
                  </View>

                  <View style={styles.luxeInputBox}>
                    <View style={styles.luxeInputIconWrap}>
                      <Text style={styles.luxeInputIcon}>🔒</Text>
                    </View>
                    <View style={styles.luxeInputContent}>
                      <Text style={styles.luxeInputLabel}>PASSWORD</Text>
                      <TextInput
                        style={styles.luxeTextInput}
                        placeholder="Create vendor password"
                        placeholderTextColor="#A8A29E"
                        secureTextEntry={!showPassword}
                        value={authSignupPassword}
                        onChangeText={setAuthSignupPassword}
                      />
                    </View>
                    <TouchableOpacity
                      style={styles.luxeEyeToggleBtn}
                      onPress={() => setShowPassword(!showPassword)}
                    >
                      <Text style={styles.luxeEyeToggleText}>
                        {showPassword ? 'Hide' : 'Show'}
                      </Text>
                    </TouchableOpacity>
                  </View>

                  <TouchableOpacity
                    style={styles.luxeOptionalToggle}
                    onPress={() => setShowSignupOptional(!showSignupOptional)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.luxeOptionalToggleText}>
                      {showSignupOptional ? '▲ Hide Location' : '+ Add Store Location (Optional)'}
                    </Text>
                  </TouchableOpacity>

                  {showSignupOptional && (
                    <View style={{ marginTop: 4 }}>
                      <View style={styles.luxeInputBox}>
                        <View style={styles.luxeInputIconWrap}>
                          <Text style={styles.luxeInputIcon}>📍</Text>
                        </View>
                        <View style={styles.luxeInputContent}>
                          <Text style={styles.luxeInputLabel}>STORE LOCATION (NIGERIA)</Text>
                          <TextInput
                            style={styles.luxeTextInput}
                            placeholder="e.g. Wuse 2, Abuja / Victoria Island, Lagos"
                            placeholderTextColor="#A8A29E"
                            value={authSignupAddress}
                            onChangeText={setAuthSignupAddress}
                          />
                        </View>
                      </View>
                    </View>
                  )}

                  <TouchableOpacity
                    style={[styles.luxePrimaryBtn, { backgroundColor: COLORS.goldPrimary }]}
                    onPress={handleAuthSellerSignUp}
                    activeOpacity={0.85}
                  >
                    <Text style={[styles.luxePrimaryBtnText, { color: '#000000', fontWeight: '800' }]}>
                      Register Store ➔
                    </Text>
                  </TouchableOpacity>
                </View>
              )
            )}
          </Animated.View>

          {/* Compact VIP Partner Switch Bar */}
          {isBuyer ? (
            <TouchableOpacity
              style={styles.luxeVipPartnerBar}
              onPress={() => switchAuthRole('seller')}
              activeOpacity={0.88}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>🏪</Text>
              <Text style={styles.luxeVipPartnerTitle}>Shop Owner? Access Merchant Portal</Text>
              <Text style={styles.luxeVipPartnerArrowText}>➔</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={[styles.luxeVipPartnerBar, { borderColor: '#E2D9CC' }]}
              onPress={() => switchAuthRole('buyer')}
              activeOpacity={0.88}
            >
              <Text style={{ fontSize: 18, marginRight: 8 }}>🛍️</Text>
              <Text style={styles.luxeVipPartnerTitle}>Shopper? Return to Buyer Portal</Text>
              <Text style={[styles.luxeVipPartnerArrowText, { color: COLORS.emeraldDeep }]}>➔</Text>
            </TouchableOpacity>
          )}

          <View style={{ height: 40 }} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.safeArea}>
      <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

      {/* --- IN-APP FLOATING NOTIFICATION BANNER (AUDIO BEEP + SLIDE DOWN) --- */}
      {activeToastNotification && (
        <Animated.View
          style={[
            styles.floatingNotificationBanner,
            {
              transform: [{ translateY: toastAnimY }],
              opacity: toastOpacity,
            },
          ]}
        >
          <TouchableOpacity
            style={styles.floatingNotificationInner}
            onPress={() => {
              setActiveToastNotification(null);
              setActiveTab('orders');
            }}
            activeOpacity={0.9}
          >
            <View style={styles.floatingNotificationIconBox}>
              <Text style={{ fontSize: 20 }}>
                {activeToastNotification.type === 'merchant_new_order'
                  ? '💰'
                  : activeToastNotification.type === 'arrived'
                  ? '📍'
                  : '🔔'}
              </Text>
            </View>
            <View style={{ flex: 1, marginLeft: 10 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <Text style={styles.floatingNotificationTitle} numberOfLines={1}>
                  {activeToastNotification.title}
                </Text>
                <Text style={styles.floatingNotificationTime}>Just now</Text>
              </View>
              <Text style={styles.floatingNotificationBody} numberOfLines={2}>
                {activeToastNotification.body}
              </Text>
            </View>
            <TouchableOpacity
              onPress={() => setActiveToastNotification(null)}
              style={styles.floatingNotificationClose}
            >
              <Text style={{ color: '#94A3B8', fontSize: 13, fontWeight: '700' }}>✕</Text>
            </TouchableOpacity>
          </TouchableOpacity>
        </Animated.View>
      )}

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

            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              {/* List / Map Switcher */}
              <View style={styles.storeViewModeSwitcher}>
                <TouchableOpacity
                  style={[styles.storeViewModeBtn, storeDisplayMode === 'list' && styles.storeViewModeBtnActive]}
                  onPress={() => setStoreDisplayMode('list')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.storeViewModeText, storeDisplayMode === 'list' && styles.storeViewModeTextActive]}>
                    📋 List
                  </Text>
                </TouchableOpacity>
                <TouchableOpacity
                  style={[styles.storeViewModeBtn, storeDisplayMode === 'map' && styles.storeViewModeBtnActive]}
                  onPress={() => setStoreDisplayMode('map')}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.storeViewModeText, storeDisplayMode === 'map' && styles.storeViewModeTextActive]}>
                    🗺️ Map
                  </Text>
                </TouchableOpacity>
              </View>

              <View style={styles.storeCountBadge}>
                <Text style={styles.storeCountText}>{filteredStores.length} stores</Text>
              </View>
            </View>
          </View>

          {/* Map View Mode */}
          {storeDisplayMode === 'map' ? (
            <View style={styles.buyerExploreMapCard}>
              <MapView
                style={styles.buyerExploreMapCanvas}
                initialRegion={{
                  latitude: buyerActiveLat,
                  longitude: buyerActiveLng,
                  latitudeDelta: 0.05,
                  longitudeDelta: 0.05,
                }}
                showsUserLocation={true}
                showsCompass={true}
              >
                {/* Buyer Location Marker */}
                <Marker
                  coordinate={{ latitude: buyerActiveLat, longitude: buyerActiveLng }}
                  title="Your Delivery Destination 📍"
                  description={selectedLocation}
                  pinColor="#DC2626"
                />

                {/* All Pinned Stores Around Buyer */}
                {filteredStores.map((store, sIndex) => {
                  const isStoreOpen = isStoreCurrentlyOpen(store);
                  const isSelected = selectedMapStore?.id === store.id;
                  return (
                    <Marker
                      key={`store-pin-${store.id}-${sIndex}-${store.latitude}-${store.longitude}`}
                      coordinate={{
                        latitude: Number(store.latitude) || 9.0882,
                        longitude: Number(store.longitude) || 7.4933,
                      }}
                      onPress={() => setSelectedMapStore(store)}
                      title={store.name}
                      description={`${store.distance} • ${isStoreOpen ? '🟢 Open Now' : '🔒 Closed'}`}
                      pinColor={isStoreOpen ? COLORS.emeraldPrimary : '#6B7280'}
                    >
                      <View style={[styles.customStoreMarkerPill, isSelected && styles.customStoreMarkerPillActive]}>
                        <Text style={{ fontSize: 13, marginRight: 4 }}>🏪</Text>
                        <Text style={[styles.customStoreMarkerText, isSelected && styles.customStoreMarkerTextActive]} numberOfLines={1}>
                          {store.name.split(' ')[0]} • {store.distance}
                        </Text>
                      </View>
                    </Marker>
                  );
                })}
              </MapView>

              {/* Top Map Helper Banner */}
              <View style={styles.buyerMapBanner}>
                <Text style={styles.buyerMapBannerText}>
                  📍 Showing {filteredStores.length} verified stores near {selectedLocation.split(',')[0]}
                </Text>
              </View>

              {/* Bottom Selected Store Callout Card */}
              {selectedMapStore ? (
                <View style={styles.buyerMapSelectedStoreCard}>
                  <Image
                    source={{ uri: selectedMapStore.image }}
                    style={styles.buyerMapStoreThumb}
                  />
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <Text style={styles.buyerMapStoreTitle} numberOfLines={1}>
                      {selectedMapStore.name}
                    </Text>
                    <Text style={styles.buyerMapStoreSub} numberOfLines={1}>
                      🏷️ {selectedMapStore.categoryLabel} • 📍 {selectedMapStore.distance}
                    </Text>
                    <Text style={styles.buyerMapStoreHours}>
                      {isStoreCurrentlyOpen(selectedMapStore) ? '🟢 Open Now' : '🔒 Closed'} • {selectedMapStore.deliveryTime}
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.buyerMapEnterStoreBtn}
                    onPress={() => openStoreModal(selectedMapStore)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.buyerMapEnterStoreBtnText}>Shop ➔</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <View style={styles.buyerMapTapHint}>
                  <Text style={styles.buyerMapTapHintText}>
                    👆 Tap any store pin on the map to preview provisions & enter store
                  </Text>
                </View>
              )}
            </View>
          ) : (
            /* Store Box Containers List */
            filteredStores.map((store, sIndex) => {
              const isFav = favorites.includes(store.id);
              const isStoreOpen = isStoreCurrentlyOpen(store);
              return (
                <TouchableOpacity
                  key={`store-card-${store.id}-${sIndex}`}
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

                    {/* Closed Storefront Door Facade on Card */}
                    {!isStoreOpen && (
                      <View style={styles.storeClosedDoorCardOverlay}>
                        <View style={styles.cardClosedDoorPanelLeft} />
                        <View style={styles.cardClosedDoorPanelRight} />
                        <View style={styles.cardClosedLockBadge}>
                          <Text style={{ fontSize: 12 }}>🔒</Text>
                          <Text style={styles.cardClosedLockBadgeText}>DOORS CLOSED</Text>
                        </View>
                        <View style={styles.cardClosedSignBoard}>
                          <Text style={styles.cardClosedSignBoardText}>
                            ⛔ CLOSED • {store.operatingDays || 'BROWSING ONLY'}
                          </Text>
                        </View>
                      </View>
                    )}

                    {/* Left Floating Tag */}
                    <View
                      style={[
                        styles.storeBadgeFloating,
                        { backgroundColor: !isStoreOpen ? '#6B7280' : store.badgeColor || COLORS.emeraldPrimary },
                      ]}
                    >
                      <Text style={styles.storeBadgeText}>{!isStoreOpen ? 'CLOSED' : store.tag}</Text>
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
                    {/* Line 1: Shop Name */}
                    <Text style={styles.storeTitle} numberOfLines={1} ellipsizeMode="tail">
                      {store.name}
                    </Text>

                    {/* Line 2: Category & Provisions Prefix (Always visible, never clipped) */}
                    <View style={styles.storeCategoryRow}>
                      <Text style={styles.storeCategoryTag} numberOfLines={1} ellipsizeMode="tail">
                        🏷️ {store.categoryLabel || 'Gourmet & Provisions'}
                      </Text>
                    </View>

                    {/* Line 3: Operating Hours / Live Timing Badge */}
                    <View style={styles.storeTimingRow}>
                      {(() => {
                        const badge = getStoreTimingBadge(store);
                        return (
                          <View style={[styles.storeOpenPill, { backgroundColor: badge.bg, borderColor: badge.color, borderWidth: 1 }]}>
                            <View style={[styles.greenPulseDot, { backgroundColor: badge.color }]} />
                            <Text style={[styles.storeOpenText, { color: badge.color, fontWeight: '700' }]}>
                              {badge.label}
                            </Text>
                          </View>
                        );
                      })()}
                    </View>

                    {/* Line 4: Store Provisions Description */}
                    <Text style={styles.storeDescription} numberOfLines={2} ellipsizeMode="tail">
                      {store.description}
                    </Text>

                    {/* Line 5: Delivery & Proximity Info Row */}
                    <View style={styles.storeDeliveryRow}>
                      <Text style={styles.deliveryFeeText}>🛵 Delivery: {store.deliveryFee}</Text>
                      <Text style={styles.deliveryDot}>•</Text>
                      <Text style={styles.minOrderText}>
                        Free over {formatNaira(store.freeDeliveryThreshold)}
                      </Text>
                    </View>

                    {/* Line 6: Full-Width Scalable Explore Store Button (Never disappears on mobile) */}
                    <TouchableOpacity
                      style={[
                        styles.viewStoreFullBtn,
                        !isStoreOpen && styles.viewStoreFullBtnClosed,
                      ]}
                      onPress={() => openStoreModal(store)}
                      activeOpacity={0.85}
                    >
                      <Text
                        style={[
                          styles.viewStoreFullBtnText,
                          !isStoreOpen && styles.viewStoreFullBtnTextClosed,
                        ]}
                      >
                        {isStoreOpen
                          ? 'Explore Store & Provisions ➔'
                          : 'Explore Provisions (Browsing Only) ➔'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </TouchableOpacity>
              );
            })
          )}
        </ScrollView>
      )}

      {/* --- ORDERS TAB --- */}
      {activeTab === 'orders' && (
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
          refreshControl={
            <RefreshControl
              refreshing={isRefreshingOrders}
              onRefresh={() => syncOrdersFromCloud(true)}
              tintColor={COLORS.emeraldPrimary}
              colors={[COLORS.emeraldPrimary]}
            />
          }
        >
          {/* Top Title and History Manager Header */}
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
            <View>
              <Text style={styles.sectionHeading}>My Orders</Text>
              <Text style={styles.sectionSubheading}>Live delivery tracking & security PINs</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <TouchableOpacity
                onPress={() => syncOrdersFromCloud(true)}
                style={[styles.ordersClearHistoryBtn, { marginRight: 6, backgroundColor: '#ECFDF5', borderColor: '#A7F3D0' }]}
                activeOpacity={0.7}
              >
                <Text style={[styles.ordersClearHistoryBtnText, { color: '#065F46' }]}>
                  {isRefreshingOrders ? '⏳ Syncing...' : '🔄 Sync'}
                </Text>
              </TouchableOpacity>
              {orders.length > 0 && (
                <TouchableOpacity
                  onPress={clearAllOrdersHistory}
                  style={styles.ordersClearHistoryBtn}
                  activeOpacity={0.7}
                >
                  <Text style={styles.ordersClearHistoryBtnText}>🗑️ Clean</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Clean Categorized Status Filter Tabs (Horizontally Scrollable for all Phone & Tablet Screens) */}
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.ordersFilterTabBar}
            style={{ marginBottom: 14 }}
          >
            <TouchableOpacity
              style={[styles.ordersFilterTabBtn, ordersFilterTab === 'active' && styles.ordersFilterTabBtnActive]}
              onPress={() => {
                setOrdersFilterTab('active');
                setExpandedOrderId('AUTO_TOP');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.ordersFilterTabText, ordersFilterTab === 'active' && styles.ordersFilterTabTextActive]}>
                🟢 Active ({orders.filter((o) => o.status !== 'Delivered' && o.status !== 'Cancelled').length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ordersFilterTabBtn, ordersFilterTab === 'all' && styles.ordersFilterTabBtnActive]}
              onPress={() => {
                setOrdersFilterTab('all');
                setExpandedOrderId('AUTO_TOP');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.ordersFilterTabText, ordersFilterTab === 'all' && styles.ordersFilterTabTextActive]}>
                📦 All ({orders.length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ordersFilterTabBtn, ordersFilterTab === 'completed' && styles.ordersFilterTabBtnActive]}
              onPress={() => {
                setOrdersFilterTab('completed');
                setExpandedOrderId('AUTO_TOP');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.ordersFilterTabText, ordersFilterTab === 'completed' && styles.ordersFilterTabTextActive]}>
                ✅ Delivered ({orders.filter((o) => o.status === 'Delivered').length})
              </Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.ordersFilterTabBtn, ordersFilterTab === 'cancelled' && styles.ordersFilterTabBtnActive]}
              onPress={() => {
                setOrdersFilterTab('cancelled');
                setExpandedOrderId('AUTO_TOP');
              }}
              activeOpacity={0.7}
            >
              <Text style={[styles.ordersFilterTabText, ordersFilterTab === 'cancelled' && styles.ordersFilterTabTextActive]}>
                ❌ Cancelled ({orders.filter((o) => o.status === 'Cancelled').length})
              </Text>
            </TouchableOpacity>
          </ScrollView>

          {/* Empty State */}
          {sortedAndFilteredOrders.length === 0 ? (
            <View style={styles.ordersEmptyBox}>
              <Text style={{ fontSize: 44, marginBottom: 10 }}>📦</Text>
              <Text style={styles.ordersEmptyTitle}>
                {ordersFilterTab === 'active' ? 'No Active Orders' : 'No Orders Found'}
              </Text>
              <Text style={styles.ordersEmptySub}>
                {ordersFilterTab === 'active'
                  ? 'When you place an order, live tracking, courier ETA, and security PINs will appear here in real time.'
                  : 'Your past orders will appear here once placed.'}
              </Text>
              <TouchableOpacity
                style={[styles.primaryActionBtn, { marginTop: 16 }]}
                onPress={() => setActiveTab('home')}
                activeOpacity={0.8}
              >
                <Text style={styles.primaryActionBtnText}>🛍️ Discover Stores</Text>
              </TouchableOpacity>
            </View>
          ) : (
            sortedAndFilteredOrders.map((ord, oIndex) => {
              const isJustPlaced = ord.id === lastPlacedOrderId || (ord.timestamp && Date.now() - ord.timestamp < 1800000);
              const activeExpandedId = expandedOrderId === 'AUTO_TOP'
                ? (sortedAndFilteredOrders[0]?.id || null)
                : expandedOrderId;
              const isExpanded = activeExpandedId === ord.id;
              const isBoltMapOpen = !collapsedBoltMapOrderIds.includes(ord.id);
              const isItemsOpen = expandedItemsOrderIds.includes(ord.id);

              return (
                <View key={ord.id} style={styles.orderCard}>
                  {/* High-Visibility Banner for the Order Just Placed */}
                  {isJustPlaced && (
                    <View style={styles.justPlacedOrderBanner}>
                      <Text style={styles.justPlacedOrderBannerText}>🔥 JUST PLACED ORDER • TRACKING LIVE</Text>
                    </View>
                  )}

                  {/* Order Card Compact Summary Header (Tappable Dropdown Accordion Toggle) */}
                  <TouchableOpacity
                    style={[
                      styles.orderCardHeader,
                      !isExpanded && styles.orderCardHeaderCollapsed,
                    ]}
                    onPress={() => toggleOrderAccordion(ord.id)}
                    activeOpacity={0.8}
                  >
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.orderCardTitle} numberOfLines={1}>{ord.storeName}</Text>
                      <Text style={styles.orderCardSub} numberOfLines={1}>
                        {ord.id} • {ord.itemsCount} {ord.itemsCount === 1 ? 'item' : 'items'} • {formatNaira(ord.total || ord.subtotal || 0)}
                      </Text>
                      <Text style={styles.orderCardDateText} numberOfLines={1}>
                        🕒 {ord.createdAt || 'Just now'} • {ord.dateStr || 'Today'}
                      </Text>
                    </View>
                    <View style={{ alignItems: 'flex-end', justifyContent: 'center', flexShrink: 0 }}>
                      <View
                        style={[
                          styles.orderStatusPill,
                          ord.status === 'Cancelled' && { backgroundColor: 'rgba(239, 68, 68, 0.12)' },
                          ord.status === 'Delivered' && { backgroundColor: 'rgba(5, 107, 75, 0.12)' },
                          ord.status === 'New Order' && { backgroundColor: 'rgba(245, 158, 11, 0.12)' },
                          ord.status === 'Preparing' && { backgroundColor: '#DBEAFE' },
                          ord.status === 'Looking for Courier' && { backgroundColor: '#EDE9FE' },
                          ord.status === 'Ready for Pickup' && { backgroundColor: '#DCFCE7' },
                          ord.status === 'On the Way' && { backgroundColor: '#D1FAE5' },
                        ]}
                      >
                        <Text
                          style={[
                            styles.orderStatusText,
                            ord.status === 'Cancelled' && { color: '#EF4444' },
                            ord.status === 'Delivered' && { color: '#056B4B' },
                            ord.status === 'New Order' && { color: '#D97706' },
                            ord.status === 'Preparing' && { color: '#1D4ED8' },
                            ord.status === 'Looking for Courier' && { color: '#7C3AED' },
                            ord.status === 'Ready for Pickup' && { color: '#047857' },
                            ord.status === 'On the Way' && { color: '#056B4B' },
                          ]}
                          numberOfLines={1}
                        >
                          {ord.status === 'New Order'
                            ? '⏳ Awaiting Store'
                            : ord.status === 'Preparing'
                            ? '🍳 Preparing'
                            : ord.status === 'Looking for Courier'
                            ? '📡 Finding Courier'
                            : ord.status === 'Ready for Pickup'
                            ? '📦 Ready'
                            : ord.status === 'On the Way'
                            ? '🚴 On the Way'
                            : ord.status}
                        </Text>
                      </View>
                      <View style={styles.orderAccordionToggleBadge}>
                        <Text style={styles.orderAccordionToggleText}>
                          {isExpanded ? '▲ Hide Details' : '▼ View Details'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>

                  {/* --- EXPANDABLE FULL ORDER DETAILS DROPDOWN --- */}
                  {isExpanded && (
                    <View style={styles.orderExpandedBodyWrap}>
                      {/* Multi-Store Package Tag */}
                      {ord.isMultiStore && (
                        <View style={styles.orderBatchBadge}>
                          <Text style={styles.orderBatchBadgeText}>
                            🔗 MULTI-STORE CONCIERGE PACKAGE • {ord.stops?.length || 2} SHOPS
                          </Text>
                        </View>
                      )}

                      {/* Inbound Funnel Route Optimizer Badge */}
                      {ord.isInboundFunnel && ord.stops && ord.stops.length > 1 ? (
                        <View style={styles.funnelRouteBadge}>
                          <Text style={styles.funnelRouteBadgeText}>
                            ⚡ INBOUND FUNNEL DISPATCH • Outermost shop first ({ord.stops[0]?.storeName}) ➔ Progressing to home
                          </Text>
                        </View>
                      ) : ord.isRouteOptimized && ord.stops && ord.stops.length > 1 ? (
                        <View style={styles.smartRouteBadge}>
                          <Text style={styles.smartRouteBadgeText}>
                            ⚡ NEAREST-SHOP FIRST • Sequence optimized to minimize courier travel
                          </Text>
                        </View>
                      ) : null}

                  {/* Multi-Store Journey Alert Banner */}
                  {ord.journeyAlert && ord.status !== 'Cancelled' && (
                    <View style={styles.multiStopJourneyAlertCard}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, marginBottom: 4 }}>
                        <Text style={{ fontSize: 13 }}>🛵</Text>
                        <Text style={styles.multiStopJourneyAlertTitle}>LIVE COURIER PROGRESS</Text>
                      </View>
                      <Text style={styles.multiStopJourneyAlertMsg}>
                        {ord.journeyAlert}
                      </Text>
                    </View>
                  )}

                  {/* Multi-Store Pickup Sequence Milestones Timeline */}
                  {ord.stops && ord.stops.length > 0 && ord.status !== 'Cancelled' && (
                    <View style={styles.stopsTimelineContainer}>
                      <Text style={styles.stopsTimelineTitle}>
                        PICKUP & DELIVERY SEQUENCE ({ord.stops.length} HUBS)
                      </Text>

                      {ord.stops.map((stop, sIdx) => {
                        const isCurrentStop = ord.currentStopIndex === sIdx;
                        const isCompleted = stop.pickupStatus === 'picked_up' || (ord.currentStopIndex || 0) > sIdx;

                        return (
                          <View
                            key={sIdx}
                            style={[
                              styles.stopTimelineCard,
                              isCurrentStop && styles.stopTimelineCardActive,
                            ]}
                          >
                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
                              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 }}>
                                <View
                                  style={[
                                    styles.stopTimelineIcon,
                                    isCompleted
                                      ? styles.stopTimelineIconDone
                                      : isCurrentStop
                                      ? styles.stopTimelineIconCurrent
                                      : styles.stopTimelineIconQueued,
                                  ]}
                                >
                                  <Text style={{ fontSize: 10, fontWeight: '900', color: '#FFFFFF' }}>
                                    {isCompleted ? '✓' : stop.stopNumber}
                                  </Text>
                                </View>
                                <Text style={styles.stopTimelineStoreName} numberOfLines={1}>{stop.storeName}</Text>
                              </View>
                              <View
                                style={[
                                  styles.stopStatusBadge,
                                  isCompleted
                                    ? { backgroundColor: 'rgba(5, 107, 75, 0.12)' }
                                    : stop.status === 'Ready for Pickup'
                                    ? { backgroundColor: '#DCFCE7' }
                                    : stop.status === 'Preparing'
                                    ? { backgroundColor: '#DBEAFE' }
                                    : isCurrentStop
                                    ? { backgroundColor: '#FEF3C7' }
                                    : { backgroundColor: '#F3F4F6' },
                                  { flexShrink: 0 },
                                ]}
                              >
                                <Text
                                  style={[
                                    styles.stopStatusBadgeText,
                                    isCompleted
                                      ? { color: '#056B4B' }
                                      : stop.status === 'Ready for Pickup'
                                      ? { color: '#047857' }
                                      : stop.status === 'Preparing'
                                      ? { color: '#1D4ED8' }
                                      : isCurrentStop
                                      ? { color: '#B45309' }
                                      : { color: '#6B7280' },
                                  ]}
                                  numberOfLines={1}
                                >
                                  {isCompleted
                                    ? '✅ Picked Up'
                                    : stop.status === 'Ready for Pickup'
                                    ? '📦 Ready for Courier'
                                    : stop.status === 'Preparing'
                                    ? '🍳 Preparing Provisions'
                                    : stop.status === 'Rejected'
                                    ? '❌ Store Unavailable'
                                    : isCurrentStop
                                    ? '🛵 Collecting Now'
                                    : '⏳ Awaiting Store'}
                                </Text>
                              </View>
                            </View>

                            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginTop: 2 }}>
                              <View style={{ flex: 1, marginRight: 8 }}>
                                <Text style={styles.stopItemsSummaryText} numberOfLines={1}>
                                  {stop.itemsCount} items • {formatNaira(stop.subtotal)}
                                </Text>
                                {stop.distanceFromPrevKm && (
                                  <Text style={styles.stopProximityDistanceText} numberOfLines={1}>
                                    📍 {sIdx === 0 && stop.isAnchorStore
                                      ? `Outermost Shop (${stop.distanceFromPrevKm} km)`
                                      : sIdx === 0
                                      ? `Closest Hub (${stop.distanceFromPrevKm} km)`
                                      : `Next hop (${stop.distanceFromPrevKm} km)`}
                                  </Text>
                                )}
                              </View>
                              <View style={[styles.stopPickupPinBadge, { flexShrink: 0 }]}>
                                <Text style={styles.stopPickupPinBadgeText}>
                                  Shop PIN: {stop.pickupPin}
                                </Text>
                              </View>
                            </View>
                          </View>
                        );
                      })}

                      {/* Final Delivery Destination Milestone */}
                      <View
                        style={[
                          styles.stopTimelineCard,
                          ord.currentStopIndex >= ord.stops.length && styles.stopTimelineCardActive,
                          { borderLeftColor: '#056B4B' },
                        ]}
                      >
                        <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 8 }}>
                            <View
                              style={[
                                styles.stopTimelineIcon,
                                ord.status === 'Delivered'
                                  ? styles.stopTimelineIconDone
                                  : ord.currentStopIndex >= ord.stops.length
                                  ? styles.stopTimelineIconCurrent
                                  : styles.stopTimelineIconQueued,
                              ]}
                            >
                              <Text style={{ fontSize: 10 }}>🏠</Text>
                            </View>
                            <Text style={styles.stopTimelineStoreName} numberOfLines={1}>Your Delivery Destination</Text>
                          </View>
                          <View
                            style={[
                              styles.stopStatusBadge,
                              ord.status === 'Delivered'
                                ? { backgroundColor: 'rgba(5, 107, 75, 0.12)' }
                                : ord.currentStopIndex >= ord.stops.length
                                ? { backgroundColor: '#DCFCE7' }
                                : { backgroundColor: '#F3F4F6' },
                              { flexShrink: 0 },
                            ]}
                          >
                            <Text
                              style={[
                                styles.stopStatusBadgeText,
                                ord.status === 'Delivered'
                                  ? { color: '#056B4B' }
                                  : ord.currentStopIndex >= ord.stops.length
                                  ? { color: '#166534' }
                                  : { color: '#6B7280' },
                              ]}
                              numberOfLines={1}
                            >
                              {ord.status === 'Delivered'
                                ? '✅ Delivered'
                                : ord.currentStopIndex >= ord.stops.length
                                ? '🛵 Heading to You'
                                : '⏳ Waiting for Shops'}
                            </Text>
                          </View>
                        </View>
                        <Text style={[styles.stopItemsSummaryText, { marginTop: 4 }]} numberOfLines={1}>
                          📍 {ord.customerAddress || 'Your Delivery Address'}
                        </Text>
                      </View>

                      {/* Live Autonomous Route Navigation Indicator */}
                      {ord.status !== 'Delivered' && ord.status !== 'Cancelled' && (
                        <View style={styles.liveNavigatingStatusPill}>
                          <View style={styles.liveGreenPulsingDot} />
                          <Text style={styles.liveNavigatingStatusText} numberOfLines={1}>
                            SATELLITE GPS LIVE ROUTE • REAL-TIME DISPATCH ACTIVE
                          </Text>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Order Cancelled Notification Banner */}
                  {ord.status === 'Cancelled' && (
                    <View style={styles.orderCancelledBanner}>
                      <Text style={styles.orderCancelledBannerTitle}>❌ Order Cancelled & Refunded</Text>
                      <Text style={styles.orderCancelledBannerSub}>
                        {ord.cancellationReason || 'Cancelled by customer'}. Full refund of {formatNaira(ord.total)} has been credited to your balance.
                      </Text>
                    </View>
                  )}

                  {/* Expandable Items Preview Toggle */}
                  <TouchableOpacity
                    style={styles.orderItemsToggleRow}
                    onPress={() => toggleItemsExpand(ord.id)}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.orderItemsToggleText, { flex: 1, marginRight: 6 }]} numberOfLines={1}>
                      🛒 {ord.itemsCount} Provisions Ordered ({formatNaira(ord.subtotal || ord.total)})
                    </Text>
                    <Text style={[styles.orderItemsToggleChevron, { flexShrink: 0 }]}>
                      {isItemsOpen ? '▲ Hide Items' : '▼ View Items'}
                    </Text>
                  </TouchableOpacity>

                  {isItemsOpen && (
                    <View style={styles.orderItemsListExpanded}>
                      {(ord.items || []).map((itm, idx) => (
                        <View key={idx} style={styles.orderItemExpandedRow}>
                          <Text style={styles.orderItemExpandedName} numberOfLines={1}>
                            {itm.qty}x {itm.name}
                          </Text>
                          <Text style={[styles.orderItemExpandedPrice, { flexShrink: 0 }]}>
                            {formatNaira((itm.price || 0) * itm.qty)}
                          </Text>
                        </View>
                      ))}
                    </View>
                  )}

                  {/* Pin verification box (suppressed if order was cancelled) */}
                  {ord.status !== 'Cancelled' && (
                    <View style={styles.pinBox}>
                      <View style={{ flex: 1, marginRight: 10 }}>
                        <Text style={styles.pinLabel}>DELIVERY SECURITY PIN</Text>
                        <Text style={styles.pinInstructions} numberOfLines={2}>
                          {ord.status === 'Delivered'
                            ? 'Delivery verified and packages handed over.'
                            : 'Give this 4-digit code to your rider at your door to confirm delivery.'}
                        </Text>
                      </View>
                      <View style={[styles.pinNumberWrap, { flexShrink: 0 }]}>
                        <Text style={styles.pinNumberText}>{ord.deliveryPin}</Text>
                      </View>
                    </View>
                  )}

                  {/* 1-Tap Delivery Handover Confirmation Button for Active Orders */}
                  {ord.status !== 'Cancelled' && ord.status !== 'Delivered' && (
                    <TouchableOpacity
                      style={styles.confirmHandoverBtn}
                      onPress={() => completeDeliveryHandover(ord.id)}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.confirmHandoverBtnIcon}>📦</Text>
                      <View style={{ flex: 1, marginLeft: 10 }}>
                        <Text style={styles.confirmHandoverBtnTitle}>Confirm Package Handover</Text>
                        <Text style={styles.confirmHandoverBtnSub} numberOfLines={1}>
                          Tap to verify PIN ({ord.deliveryPin}) & complete delivery
                        </Text>
                      </View>
                      <Text style={styles.confirmHandoverBtnChevron}>➔</Text>
                    </TouchableOpacity>
                  )}

                  {/* --- LIVE COURIER ROUTE NAVIGATION MAP (ALWAYS SHOWN FOR ACTIVE ORDERS) --- */}
                  {ord.status !== 'Cancelled' && (
                    <View style={styles.boltTrackingSummaryCard}>
                      {ord.boltRider && ord.boltRider.name ? (
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={styles.boltRiderAvatarSmall}>
                              <Text style={{ fontSize: 16 }}>🛵</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                              <Text style={styles.boltRiderNameSmall} numberOfLines={1}>
                                {ord.boltRider.name} (Courier)
                              </Text>
                              <Text style={styles.boltEtaPillTextSmall} numberOfLines={1}>
                                ⚡ Arrival: {ord.eta || '12 mins'} • {ord.boltRider.rating || '4.95'}★
                              </Text>
                            </View>
                          </View>
                          <View style={styles.boltSummaryActionRow}>
                            <TouchableOpacity
                              style={styles.boltToggleMapBtn}
                              onPress={() => toggleBoltMapCollapse(ord.id)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.boltToggleMapBtnText}>
                                {isBoltMapOpen ? '▲ Hide Map' : '🗺️ Live Map'}
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={styles.boltCallBtnSmall}
                              onPress={() =>
                                Linking.openURL(`tel:${ord.boltRider.phone || '+2348032941194'}`)
                              }
                              activeOpacity={0.8}
                            >
                              <Text style={styles.boltCallBtnSmallText}>📞 Call</Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : ord.status === 'Looking for Courier' ? (
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.boltRiderAvatarSmall, { backgroundColor: '#EDE9FE' }]}>
                              <Text style={{ fontSize: 16 }}>📡</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                              <Text style={[styles.boltRiderNameSmall, { color: '#7C3AED' }]} numberOfLines={1}>
                                Looking for Available Courier...
                              </Text>
                              <Text style={styles.boltEtaPillTextSmall} numberOfLines={2}>
                                📦 Package ready at shop • Scanning nearby fleet
                              </Text>
                            </View>
                          </View>
                          <View style={styles.boltSummaryActionRow}>
                            <TouchableOpacity
                              style={styles.boltToggleMapBtn}
                              onPress={() => toggleBoltMapCollapse(ord.id)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.boltToggleMapBtnText}>
                                {isBoltMapOpen ? '▲ Hide Map' : '🗺️ View Hubs'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : ord.status === 'Preparing' ? (
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.boltRiderAvatarSmall, { backgroundColor: '#DBEAFE' }]}>
                              <Text style={{ fontSize: 16 }}>🍳</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                              <Text style={[styles.boltRiderNameSmall, { color: '#1D4ED8' }]} numberOfLines={1}>
                                Store Preparing Provisions
                              </Text>
                              <Text style={styles.boltEtaPillTextSmall} numberOfLines={2}>
                                Provisions being freshly sorted • Courier dispatch when ready
                              </Text>
                            </View>
                          </View>
                          <View style={styles.boltSummaryActionRow}>
                            <TouchableOpacity
                              style={styles.boltToggleMapBtn}
                              onPress={() => toggleBoltMapCollapse(ord.id)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.boltToggleMapBtnText}>
                                {isBoltMapOpen ? '▲ Hide Map' : '🗺️ View Hubs'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ) : (
                        <View>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <View style={[styles.boltRiderAvatarSmall, { backgroundColor: '#FEF3C7' }]}>
                              <Text style={{ fontSize: 16 }}>⏳</Text>
                            </View>
                            <View style={{ flex: 1, marginLeft: 8 }}>
                              <Text style={[styles.boltRiderNameSmall, { color: '#B45309' }]} numberOfLines={1}>
                                Awaiting Store Acceptance
                              </Text>
                              <Text style={styles.boltEtaPillTextSmall} numberOfLines={2}>
                                Order sent to merchant • Awaiting confirmation
                              </Text>
                            </View>
                          </View>
                          <View style={styles.boltSummaryActionRow}>
                            <TouchableOpacity
                              style={styles.boltToggleMapBtn}
                              onPress={() => toggleBoltMapCollapse(ord.id)}
                              activeOpacity={0.7}
                            >
                              <Text style={styles.boltToggleMapBtnText}>
                                {isBoltMapOpen ? '▲ Hide Map' : '🗺️ View Hubs'}
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      )}

                      {/* On-Demand Interactive Courier Map */}
                      {isBoltMapOpen && (
                        <View style={[styles.boltTrackingMapWrap, { marginTop: 10 }]}>
                          <MapView
                            style={styles.boltTrackingMap}
                            initialRegion={getOrderRegion(ord)}
                            scrollEnabled={true}
                            zoomEnabled={true}
                          >
                            {/* 1. Turn-by-Turn Road Route: Starts from Rider to Shop 1, then Shop 2, then Home */}
                            {(() => {
                              const mapStops = Array.isArray(ord.stops) && ord.stops.length > 0 ? ord.stops : [];
                              const firstPendingMapIdx = mapStops.findIndex((st) => st.pickupStatus !== 'picked_up');
                              let currentStopIdx = ord.currentStopIndex || 0;
                              if (firstPendingMapIdx !== -1 && currentStopIdx < firstPendingMapIdx) {
                                currentStopIdx = firstPendingMapIdx;
                              } else if (firstPendingMapIdx === -1 && mapStops.length > 0 && currentStopIdx < mapStops.length) {
                                currentStopIdx = mapStops.length;
                              }
                              const homeLat = Number(ord.deliveryLocation?.latitude || pinnedLocation?.latitude || 9.0882);
                              const homeLng = Number(ord.deliveryLocation?.longitude || pinnedLocation?.longitude || 7.4933);
                              const firstStore = (ord.stops && ord.stops[0]) || ord.storeLocation || { latitude: 9.0882, longitude: 7.4933 };
                              const wps = [
                                ...(ord.stops && Array.isArray(ord.stops) && ord.stops.length > 0
                                  ? ord.stops.map((s) => ({
                                      latitude: Number(s.latitude) || 9.0882,
                                      longitude: Number(s.longitude) || 7.4933,
                                    }))
                                  : [{ latitude: Number(firstStore.latitude) || 9.0882, longitude: Number(firstStore.longitude) || 7.4933 }]),
                                { latitude: homeLat, longitude: homeLng },
                              ];
                              const directFallback = buildDirectLegsBetweenWaypoints(wps);

                              const fullRoutePoints =
                                ord.roadRouteCoordinates && ord.roadRouteCoordinates.length > 1
                                  ? ord.roadRouteCoordinates
                                  : directFallback.allPoints || [];

                              const activeRoadPoints =
                                ord.roadLegs &&
                                ord.roadLegs[currentStopIdx] &&
                                ord.roadLegs[currentStopIdx].length > 1
                                  ? ord.roadLegs[currentStopIdx]
                                  : fullRoutePoints.length > 1
                                  ? fullRoutePoints
                                  : directFallback.legs[currentStopIdx] || directFallback.legs[0] || [];

                              return (
                                <>
                                  {/* Full route path connecting all pickup stores to home */}
                                  {fullRoutePoints.length > 1 && (
                                    <Polyline
                                      coordinates={fullRoutePoints}
                                      strokeColor="#93C5FD"
                                      strokeWidth={4}
                                      lineDashPattern={[6, 6]}
                                    />
                                  )}
                                  {/* Outer high-contrast boundary for active street route */}
                                  <Polyline
                                    coordinates={activeRoadPoints}
                                    strokeColor="#1D4ED8"
                                    strokeWidth={7}
                                  />
                                  {/* Vibrant Google Maps Blue interior road lane */}
                                  <Polyline
                                    coordinates={activeRoadPoints}
                                    strokeColor="#2563EB"
                                    strokeWidth={4.5}
                                  />
                                </>
                              );
                            })()}

                            {/* 2. On-Road Snapped Store Stop Pinpoints (Marked Directly At Actual Store Location) */}
                            {ord.stops && ord.stops.length > 0 ? (
                              ord.stops.map((st, sIdx) => {
                                const isCurrentStop = (ord.currentStopIndex || 0) === st.stopNumber - 1;
                                const isCompleted = st.pickupStatus === 'picked_up' || (ord.currentStopIndex || 0) >= st.stopNumber;

                                const stMatch = storesList.find((s) => s.id === st.storeId || s.name === st.storeName);
                                const storeLat = Number(st.latitude) || Number(stMatch?.latitude) || 9.0882;
                                const storeLng = Number(st.longitude) || Number(stMatch?.longitude) || 7.4933;

                                const pinCoord = {
                                  latitude: st.snappedLatitude || storeLat,
                                  longitude: st.snappedLongitude || storeLng,
                                };

                                return (
                                  <Marker
                                    key={`ord-st-${st.stopNumber}`}
                                    coordinate={pinCoord}
                                    title={`[${st.stopNumber}] 🏪 ${st.storeName}`}
                                    description={`Pickup Hub (${st.itemsCount} items • Shop PIN: ${st.pickupPin})`}
                                    anchor={{ x: 0.5, y: 1.0 }}
                                  >
                                    <View style={styles.roadPinContainer}>
                                      {/* Store Callout Bubble with Shop Number */}
                                      <View
                                        style={[
                                          styles.roadPinCallout,
                                          isCurrentStop && styles.roadPinCalloutActive,
                                          isCompleted && styles.roadPinCalloutDone,
                                        ]}
                                      >
                                        <View
                                          style={[
                                            styles.roadPinBadgeNum,
                                            isCurrentStop && { backgroundColor: '#2563EB' },
                                            isCompleted && { backgroundColor: '#056B4B' },
                                          ]}
                                        >
                                          <Text style={styles.roadPinBadgeNumText}>
                                            {isCompleted ? '✓' : st.stopNumber}
                                          </Text>
                                        </View>
                                        <Text style={{ fontSize: 11, marginRight: 2 }}>🏪</Text>
                                        <Text style={styles.roadPinCalloutText} numberOfLines={1}>
                                          {st.storeName}
                                        </Text>
                                      </View>
                                      {/* Needle stem pointing straight into road line */}
                                      <View
                                        style={[
                                          styles.roadPinNeedle,
                                          isCurrentStop && { backgroundColor: '#2563EB' },
                                          isCompleted && { backgroundColor: '#056B4B' },
                                        ]}
                                      />
                                      {/* Target bullseye dot anchored directly on the blue road line */}
                                      <View
                                        style={[
                                          styles.roadPinDot,
                                          isCurrentStop && styles.roadPinDotActive,
                                          isCompleted && styles.roadPinDotDone,
                                        ]}
                                      />
                                    </View>
                                  </Marker>
                                );
                              })
                            ) : (
                              <Marker
                                coordinate={{
                                  latitude: Number(ord.storeLocation?.latitude || ord.storeLatitude || 9.0882),
                                  longitude: Number(ord.storeLocation?.longitude || ord.storeLongitude || 7.4933),
                                }}
                                title={ord.storeName || 'Store Hub'}
                                description="Store Fulfillment Hub"
                                pinColor="#B76E79"
                              />
                            )}

                            {/* 3. Customer Delivery Destination Pin (Marked Directly At Pinned Home) */}
                            {(() => {
                              const homeLat = Number(ord.deliveryLocation?.latitude || pinnedLocation?.latitude || 9.0882);
                              const homeLng = Number(ord.deliveryLocation?.longitude || pinnedLocation?.longitude || 7.4933);
                              const homeCoord = {
                                latitude: ord.snappedDeliveryLocation?.latitude || homeLat,
                                longitude: ord.snappedDeliveryLocation?.longitude || homeLng,
                              };

                              return (
                                <Marker
                                  coordinate={homeCoord}
                                  title="🏠 Home: Delivery Destination"
                                  description={ord.customerAddress || pinnedLocation?.name || 'Customer dropoff residence'}
                                  anchor={{ x: 0.5, y: 1.0 }}
                                >
                                  <View style={styles.roadPinContainer}>
                                    <View style={[styles.roadPinCallout, { borderColor: '#DC2626' }]}>
                                      <View style={[styles.roadPinBadgeNum, { backgroundColor: '#DC2626' }]}>
                                        <Text style={{ fontSize: 9 }}>🏠</Text>
                                      </View>
                                      <Text style={[styles.roadPinCalloutText, { color: '#DC2626', fontWeight: '900' }]}>
                                        HOME
                                      </Text>
                                    </View>
                                    <View style={[styles.roadPinNeedle, { backgroundColor: '#DC2626' }]} />
                                    <View style={[styles.roadPinDot, { borderColor: '#DC2626' }]} />
                                  </View>
                                </Marker>
                              );
                            })()}

                            {/* 4. Real-Time Moving Motorbike Courier Marker (SNAPPED DIRECTLY ONTO THE BLUE ROAD LINE) */}
                            {(() => {
                              const currentStopIdx = ord.currentStopIndex || 0;
                              const homeLat = Number(ord.deliveryLocation?.latitude || pinnedLocation?.latitude || 9.0882);
                              const homeLng = Number(ord.deliveryLocation?.longitude || pinnedLocation?.longitude || 7.4933);
                              const firstStore = ord.stops?.[0] || ord.storeLocation || { latitude: 9.0882, longitude: 7.4933 };
                              const riderStart = ord.riderOrigin || {
                                latitude: Number(firstStore.latitude || 9.0882) - 0.0090,
                                longitude: Number(firstStore.longitude || 7.4933) - 0.0080,
                              };
                              const wps = [
                                riderStart,
                                ...(ord.stops && ord.stops.length > 0
                                  ? ord.stops.map((s) => ({
                                      latitude: Number(s.latitude) || 9.0882,
                                      longitude: Number(s.longitude) || 7.4933,
                                    }))
                                  : [{ latitude: Number(firstStore.latitude) || 9.0882, longitude: Number(firstStore.longitude) || 7.4933 }]),
                                { latitude: homeLat, longitude: homeLng },
                              ];
                              const directFallback = buildDirectLegsBetweenWaypoints(wps);

                              const activeRoadPts =
                                ord.roadLegs &&
                                ord.roadLegs[currentStopIdx] &&
                                ord.roadLegs[currentStopIdx].length > 1
                                  ? ord.roadLegs[currentStopIdx]
                                  : directFallback.legs[currentStopIdx] || directFallback.legs[0] || [];

                              const elapsedBuyerMapIdx = ord.legStartedAt
                                ? Math.min(activeRoadPts.length - 1, Math.floor((Date.now() - ord.legStartedAt) / 3000))
                                : (ord.roadPointIndex || 0);
                              const pointIdx = Math.min(Math.max(elapsedBuyerMapIdx, ord.roadPointIndex || 0), Math.max(0, activeRoadPts.length - 1));
                              const firstStoreCoord = {
                                latitude: Number(firstStore.latitude) || 9.0882,
                                longitude: Number(firstStore.longitude) || 7.4933,
                              };
                              const riderOnBlueLine =
                                activeRoadPts[pointIdx] ||
                                (ord.boltCoords && ord.boltCoords.latitude && !isNaN(ord.boltCoords.latitude) ? ord.boltCoords : firstStoreCoord);

                              return Boolean(ord.boltRider && ord.boltRider.name) ? (
                                <Marker
                                  coordinate={riderOnBlueLine}
                                  title={`🛵 ${ord.boltRider?.name || 'Musa Ibrahim'} (Courier)`}
                                  description={ord.journeyAlert || 'Live courier tracking'}
                                  anchor={{ x: 0.5, y: 0.72 }}
                                >
                                  <View style={styles.googleMapsRiderMarkerContainer}>
                                    {/* Floating ETA / Rider Tag above motorbike */}
                                    <View style={styles.googleMapsRiderBadge}>
                                      <View style={styles.googleMapsLiveBeaconDot} />
                                      <Text style={styles.googleMapsRiderBadgeName}>
                                        {ord.boltRider?.name?.split(' ')[0] || 'Musa'}
                                      </Text>
                                      <Text style={styles.googleMapsRiderBadgeSpeed}>• 42 km/h</Text>
                                    </View>

                                    {/* Symmetrical Motorbike Puck centered exactly on the Blue Line */}
                                    <View style={styles.googleMapsMotorbikePuckWrap}>
                                      <View style={styles.googleMapsMotorbikePulseRing} />
                                      <View style={styles.googleMapsMotorbikeCorePuck}>
                                        <Text style={{ fontSize: 16 }}>🛵</Text>
                                      </View>
                                    </View>
                                  </View>
                                </Marker>
                              ) : null;
                            })()}
                          </MapView>
                        </View>
                      )}
                    </View>
                  )}

                  {/* Destination Location Info */}
                  <View style={styles.orderGpsCard}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.orderGpsTitle}>📍 DELIVERY DESTINATION</Text>
                      <Text style={styles.orderGpsLandmark} numberOfLines={2}>
                        {ord.customerAddress || ord.deliveryLocation?.landmark || 'Your Delivery Address'}
                      </Text>
                      {ord.deliveryLocation?.notes && (
                        <Text style={styles.orderGpsNotes} numberOfLines={2}>
                          🛵 Note: "{ord.deliveryLocation.notes}"
                        </Text>
                      )}
                    </View>
                    <TouchableOpacity
                      style={[styles.openMapsBtn, { flexShrink: 0 }]}
                      onPress={() =>
                        openExternalGoogleMaps(
                          ord.deliveryLocation?.latitude || 9.0882,
                          ord.deliveryLocation?.longitude || 7.4933
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.openMapsBtnText}>Maps ➔</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Order Footer Row */}
                  <View style={styles.orderFooterRow}>
                    <View style={{ flex: 1, marginRight: 8 }}>
                      <Text style={styles.orderTotalText} numberOfLines={1}>Total: {formatNaira(ord.total)}</Text>
                      <Text style={styles.orderEtaText} numberOfLines={1}>
                        {ord.status === 'Cancelled' ? 'Status: Cancelled' : `Est. Arrival: ${ord.eta || '15-25 min'}`}
                      </Text>
                    </View>
                    {ord.status !== 'Cancelled' && ord.status !== 'Delivered' && (
                      <TouchableOpacity
                        style={[styles.buyerOrderSupportBtn, { flexShrink: 0 }]}
                        onPress={() => {
                          Alert.alert(
                            'GETIT Concierge Support',
                            `Need assistance with order ${ord.id}?\n\nOur concierge dispatch team is monitoring your order in real-time. For address updates or inquiries, reach out directly:`,
                            [
                              {
                                text: '💬 WhatsApp Support',
                                onPress: () => Linking.openURL('https://wa.me/2348032941194?text=' + encodeURIComponent(`Hello GETIT Support, I need assistance with my active Order ${ord.id}.`)),
                              },
                              {
                                text: '📞 Call Concierge',
                                onPress: () => Linking.openURL('tel:+2348032941194'),
                              },
                              { text: 'Close', style: 'cancel' },
                            ]
                          );
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.buyerOrderSupportBtnText}>💬 Need Help?</Text>
                      </TouchableOpacity>
                    )}
                    {ord.status === 'Delivered' && (
                      ord.isReviewed ? (
                        <View style={styles.orderReviewedBadge}>
                          <Text style={styles.orderReviewedBadgeText}>
                            ✅ Rated {ord.reviewScore ? `★ ${ord.reviewScore}.0` : '★ 5.0'}
                          </Text>
                        </View>
                      ) : (
                        <TouchableOpacity
                          style={styles.buyerRateOrderBtn}
                          onPress={() => openReviewModalForOrder(ord)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.buyerRateOrderBtnText}>⭐ Rate Order</Text>
                        </TouchableOpacity>
                      )
                    )}
                    </View>
                  </View>
                )}
              </View>
            );
            })
          )}
        </ScrollView>
      )}

      {/* --- PROFILE TAB --- */}
      {activeTab === 'profile' && (
        <ScrollView
          style={styles.mainScrollView}
          contentContainerStyle={{ padding: 20, paddingBottom: 120 }}
        >
          {/* Member Card with Dynamic User Profile & Account Center Switcher */}
          <View style={styles.profileAvatarBox}>
            <View style={styles.profileAvatarCircle}>
              <Image
                source={LOGO_CREAM}
                style={styles.profileLogoAvatar}
                resizeMode="cover"
              />
            </View>
            <Text style={styles.profileName}>{currentUser?.fullName || 'Distinguished Client'}</Text>
            <Text style={styles.profileTier}>
              {currentUser?.role === 'seller' ? `🏪 Verified Merchant • ${currentUser?.businessName || 'Partner Store'}` : '🛍️ Buyer Account • GETIT Privilège'}
            </Text>
            <Text style={{ fontSize: 12, color: '#6B7280', marginTop: 4, textAlign: 'center' }}>
              {currentUser?.email} • {currentUser?.phone}
            </Text>
            {currentUser?.address ? (
              <Text style={{ fontSize: 11, color: '#9CA3AF', marginTop: 2, textAlign: 'center' }}>
                📍 {currentUser?.address}
              </Text>
            ) : null}

            <View style={{ flexDirection: 'row', gap: 10, marginTop: 12, width: '100%' }}>
              <TouchableOpacity
                style={[styles.primaryActionBtn, { flex: 1, paddingVertical: 9, backgroundColor: COLORS.emeraldDeep }]}
                onPress={() => setAuthModalVisible(true)}
                activeOpacity={0.85}
              >
                <Text style={[styles.primaryActionBtnText, { fontSize: 12 }]}>
                  👤 Switch Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.primaryActionBtn, { flex: 1, paddingVertical: 9, backgroundColor: '#FEF2F2', borderColor: '#FECACA', borderWidth: 1 }]}
                onPress={handleLogout}
                activeOpacity={0.85}
              >
                <Text style={{ color: '#DC2626', fontSize: 12, fontWeight: '700' }}>
                  🚪 Sign Out
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* --- MERCHANT HUB SWITCHER CARD --- */}
          {currentUser?.role === 'seller' ? (
            <View style={styles.merchantSwitchCard}>
              <View style={styles.merchantSwitchTopRow}>
                <View style={styles.merchantIconWrap}>
                  <Text style={{ fontSize: 26 }}>🏪</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <View style={styles.merchantTagRow}>
                    <Text style={styles.merchantTag}>SHOP OWNER / VENDOR</Text>
                    <View style={styles.merchantActiveBadge}>
                      <Text style={styles.merchantActiveText}>PARTNER</Text>
                    </View>
                  </View>
                  <Text style={styles.merchantCardTitle}>Merchant Hub</Text>
                  <Text style={styles.merchantCardSub}>
                    Manage orders, catalog stock & daily payouts for {currentMerchantStore?.name || currentUser?.businessName || 'Your Store'}
                  </Text>
                </View>
              </View>

              <View style={styles.merchantStatsMiniRow}>
                <View style={styles.merchantStatMini}>
                  <Text style={styles.merchantStatVal}>{merchantOrders.length}</Text>
                  <Text style={styles.merchantStatLbl}>Live Orders</Text>
                </View>
                <View style={styles.merchantStatDivider} />
                <View style={styles.merchantStatMini}>
                  <Text style={styles.merchantStatVal}>
                    {formatNaira(merchantTotalRevenue)}
                  </Text>
                  <Text style={styles.merchantStatLbl}>Net Revenue</Text>
                </View>
                <View style={styles.merchantStatDivider} />
                <View style={styles.merchantStatMini}>
                  <Text style={styles.merchantStatVal}>
                    {currentMerchantStore?.rating || '5.0'} ★
                  </Text>
                  <Text style={styles.merchantStatLbl}>Store Rating</Text>
                </View>
              </View>

              <TouchableOpacity
                style={styles.merchantSwitchBtn}
                onPress={() => setAppMode('merchant')}
                activeOpacity={0.85}
              >
                <Text style={styles.merchantSwitchBtnText}>
                  Switch to Shop Owner Mode ➔
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.merchantSwitchCard}>
              <View style={styles.merchantSwitchTopRow}>
                <View style={styles.merchantIconWrap}>
                  <Text style={{ fontSize: 26 }}>🏪</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.merchantCardTitle}>Sell on GETIT</Text>
                  <Text style={styles.merchantCardSub}>
                    Open your supermarket, grocery, or specialty shop to thousands of shoppers in Abuja.
                  </Text>
                </View>
              </View>
              <TouchableOpacity
                style={[styles.merchantSwitchBtn, { backgroundColor: COLORS.goldPrimary }]}
                onPress={() => {
                  setAuthScreenMode('signup');
                  setAuthScreenRole('seller');
                  setAuthTab('seller');
                  setAuthModalVisible(true);
                }}
                activeOpacity={0.85}
              >
                <Text style={[styles.merchantSwitchBtnText, { color: '#000000', fontWeight: '800' }]}>
                  🚀 Register as Merchant & Open Store ➔
                </Text>
              </TouchableOpacity>
            </View>
          )}

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

      {/* --- STORE DETAILS VIEW (WITH IN-STORE SEARCH BAR) --- */}
      {selectedStore && (
        <View style={[StyleSheet.absoluteFill, { backgroundColor: COLORS.beigeBg, zIndex: 100 }]}>
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

            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{ paddingBottom: cart.length > 0 ? 100 : 30 }}
            >
              {/* TOP BANNER: Show Animated Store Door when closed, or Cover Photo when open */}
              {!isStoreCurrentlyOpen(selectedStore) ? (
                (() => {
                  const isCurrentMerchant = Boolean(
                    merchantStoreId && (selectedStore.id === merchantStoreId || selectedStore.id === currentMerchantStore?.id)
                  );
                  const daysStr =
                    (isCurrentMerchant && storeTiming?.operatingDays) ||
                    selectedStore.operatingDays ||
                    'Mon - Sun (Daily)';
                  const openTimeStr =
                    (isCurrentMerchant && storeTiming?.openTime) ||
                    selectedStore.openTime ||
                    '08:00 AM';
                  const isOpenToday = isStoreOpenOnDay(daysStr, new Date());

                  return (
                    <AnimatedStoreDoor
                      store={selectedStore}
                      operatingDays={daysStr}
                      isOpenToday={isOpenToday}
                      openTime={openTimeStr}
                    />
                  );
                })()
              ) : (
                <Image
                  source={{ uri: selectedStore.image }}
                  style={styles.storeModalBannerImage}
                />
              )}

              <View style={styles.storeModalContent}>
                <View style={styles.storeBadgeFloating}>
                  <Text style={styles.storeBadgeText}>{selectedStore.tag}</Text>
                </View>
                <Text style={styles.storeModalTitle}>{selectedStore.name}</Text>
                <Text style={styles.storeModalAddress}>📍 {selectedStore.address}</Text>
                {(() => {
                  const badge = getStoreTimingBadge(selectedStore);
                  const isCurrentMerchant = Boolean(
                    merchantStoreId && (selectedStore.id === merchantStoreId || selectedStore.id === currentMerchantStore?.id)
                  );
                  const is24H = Boolean(
                    selectedStore.is24Hours || (isCurrentMerchant && storeTiming.is24Hours)
                  );
                  const daysStr =
                    (isCurrentMerchant && storeTiming?.operatingDays) ||
                    selectedStore.operatingDays ||
                    'Mon - Sun (Daily)';
                  const isOpenToday = isStoreOpenOnDay(daysStr, new Date());
                  const isNowOpen = isStoreCurrentlyOpen(selectedStore);

                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 6, flexWrap: 'wrap' }}>
                      <View style={[styles.storeOpenPill, { backgroundColor: badge.bg, borderColor: badge.color, borderWidth: 1 }]}>
                        <View style={[styles.greenPulseDot, { backgroundColor: badge.color }]} />
                        <Text style={[styles.storeOpenText, { color: badge.color, fontWeight: '700' }]}>
                          {badge.label}
                        </Text>
                      </View>
                      {is24H && isNowOpen && isOpenToday && (
                        <View style={[styles.infoGlassChip, { backgroundColor: '#ECFDF5', borderColor: '#A7F3D0', borderWidth: 1, marginLeft: 8 }]}>
                          <Text style={{ fontSize: 11, color: '#047857', fontWeight: '700' }}>⚡ Always Open 24/7</Text>
                        </View>
                      )}
                    </View>
                  );
                })()}
                <Text style={styles.storeModalDesc}>{selectedStore.description}</Text>

                <View style={styles.modalStatsRow}>
                  <TouchableOpacity
                    style={styles.modalStatItem}
                    onPress={() => openStoreReviewsModal(selectedStore)}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.modalStatVal}>★ {selectedStore.rating}</Text>
                    <Text style={[styles.modalStatLabel, { color: COLORS.emeraldDeep, fontWeight: '700' }]}>
                      {selectedStore.reviewCount} Reviews ➔
                    </Text>
                  </TouchableOpacity>
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

                {/* Store Catalog Header & Results Counter with Grid/List Toggle */}
                <View style={styles.catalogHeaderRow}>
                  <View>
                    <Text style={styles.sectionHeading}>
                      {storeProductSearch ? 'Matching Products' : 'Curated Catalog'}
                    </Text>
                    <Text style={styles.catalogCountText}>
                      {filteredStoreProducts.length} item{filteredStoreProducts.length === 1 ? '' : 's'}
                      {!isStoreCurrentlyOpen(selectedStore) ? ' • 🔒 Browsing Only' : ''}
                    </Text>
                  </View>

                  <View style={styles.catalogViewToggleRow}>
                    <TouchableOpacity
                      style={[
                        styles.catalogViewToggleBtn,
                        storeCatalogViewMode === 'grid' && styles.catalogViewToggleBtnActive,
                      ]}
                      onPress={() => setStoreCatalogViewMode('grid')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.catalogViewToggleText,
                          storeCatalogViewMode === 'grid' && styles.catalogViewToggleTextActive,
                        ]}
                      >
                        ⊞ Grid
                      </Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.catalogViewToggleBtn,
                        storeCatalogViewMode === 'list' && styles.catalogViewToggleBtnActive,
                      ]}
                      onPress={() => setStoreCatalogViewMode('list')}
                      activeOpacity={0.7}
                    >
                      <Text
                        style={[
                          styles.catalogViewToggleText,
                          storeCatalogViewMode === 'list' && styles.catalogViewToggleTextActive,
                        ]}
                      >
                        ☰ List
                      </Text>
                    </TouchableOpacity>
                  </View>
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
                ) : storeCatalogViewMode === 'grid' ? (
                  /* Box Form Layout: Stacked in 2-Column Rows & Columns */
                  <View style={styles.productGrid}>
                    {filteredStoreProducts.map((prod) => {
                      const inCartItem = cart.find((i) => i.id === prod.id);
                      return (
                        <View key={prod.id} style={styles.productBoxCard}>
                          {/* Top Image Preview Box */}
                          <View style={styles.productBoxMediaWrap}>
                            {getProductImageSource(prod.imageUrl || prod.imageUri) ? (
                              <Image
                                source={getProductImageSource(prod.imageUrl || prod.imageUri)}
                                style={styles.productBoxImage}
                                resizeMode="contain"
                              />
                            ) : (
                              <Text style={styles.productBoxEmoji}>{prod.icon}</Text>
                            )}

                            {/* Category Tag Chip */}
                            <View style={styles.productBoxBadge}>
                              <Text style={styles.productBoxBadgeText} numberOfLines={1}>
                                {prod.category}
                              </Text>
                            </View>

                            {/* In-cart indicator bubble */}
                            {inCartItem && (
                              <View style={styles.productBoxInCartPill}>
                                <Text style={styles.productBoxInCartPillText}>
                                  {inCartItem.qty} in bag
                                </Text>
                              </View>
                            )}

                            {/* Closed Store indicator pill on media */}
                            {!isStoreCurrentlyOpen(selectedStore) && (
                              <View style={styles.productBoxClosedTag}>
                                <Text style={styles.productBoxClosedTagText}>CLOSED</Text>
                              </View>
                            )}
                          </View>

                          {/* Bottom Details Box */}
                          <View style={styles.productBoxBody}>
                            <Text style={styles.productBoxTitle} numberOfLines={2}>
                              {prod.name}
                            </Text>

                            <View style={styles.productBoxPriceRow}>
                              <Text style={styles.productBoxPrice}>
                                {formatNaira(prod.price)}
                              </Text>
                            </View>

                            {/* Action: Add / Quantity / Sold Out / Store Closed */}
                            <View style={styles.productBoxActionRow}>
                              {!isStoreCurrentlyOpen(selectedStore) ? (
                                <TouchableOpacity
                                  style={styles.productBoxClosedBtn}
                                  onPress={() =>
                                    Alert.alert(
                                      '🔒 Store Currently Closed',
                                      `"${selectedStore.name}" is currently closed. Ordering and booking provisions are not available right now. Please check back when the store re-opens.`
                                    )
                                  }
                                  activeOpacity={0.7}
                                >
                                  <Text style={styles.productBoxClosedBtnText}>🔒 Closed</Text>
                                </TouchableOpacity>
                              ) : prod.outOfStock ? (
                                <View style={styles.productBoxSoldOut}>
                                  <Text style={styles.productBoxSoldOutText}>Sold Out</Text>
                                </View>
                              ) : inCartItem ? (
                                <View style={styles.productBoxQtyControls}>
                                  <TouchableOpacity
                                    style={styles.productBoxQtyBtn}
                                    onPress={() => removeFromCart(prod.id)}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                  >
                                    <Text style={styles.productBoxQtyBtnText}>−</Text>
                                  </TouchableOpacity>
                                  <Text style={styles.productBoxQtyCount}>
                                    {inCartItem.qty}
                                  </Text>
                                  <TouchableOpacity
                                    style={styles.productBoxQtyBtn}
                                    onPress={() => addToCart(prod, selectedStore)}
                                    activeOpacity={0.7}
                                    hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
                                  >
                                    <Text style={styles.productBoxQtyBtnText}>+</Text>
                                  </TouchableOpacity>
                                </View>
                              ) : (
                                <TouchableOpacity
                                  style={styles.productBoxAddBtn}
                                  onPress={() => addToCart(prod, selectedStore)}
                                  activeOpacity={0.8}
                                >
                                  <Text style={styles.productBoxAddBtnText}>+ Add</Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          </View>
                        </View>
                      );
                    })}
                  </View>
                ) : (
                  /* Classic Horizontal Row List */
                  filteredStoreProducts.map((prod) => {
                    const inCartItem = cart.find((i) => i.id === prod.id);
                    return (
                      <View key={prod.id} style={styles.productCard}>
                        <View style={styles.productIconWrap}>
                          {getProductImageSource(prod.imageUrl || prod.imageUri) ? (
                            <Image
                              source={getProductImageSource(prod.imageUrl || prod.imageUri)}
                              style={{ width: 44, height: 44, borderRadius: 8 }}
                              resizeMode="contain"
                            />
                          ) : (
                            <Text style={{ fontSize: 26 }}>{prod.icon}</Text>
                          )}
                        </View>
                        <View style={{ flex: 1, paddingHorizontal: 12 }}>
                          <Text style={styles.productName}>{prod.name}</Text>
                          <View style={styles.productBadgeRow}>
                            <Text style={styles.productCategoryPill}>{prod.category}</Text>
                          </View>
                          <Text style={styles.productPrice}>{formatNaira(prod.price)}</Text>
                        </View>

                        {!isStoreCurrentlyOpen(selectedStore) ? (
                          <TouchableOpacity
                            style={styles.productClosedBtn}
                            onPress={() =>
                              Alert.alert(
                                '🔒 Store Currently Closed',
                                `"${selectedStore.name}" is currently closed. Ordering and booking provisions are not available right now. Please check back when the store re-opens.`
                              )
                            }
                            activeOpacity={0.7}
                          >
                            <Text style={styles.productClosedBtnText}>🔒 Closed</Text>
                          </TouchableOpacity>
                        ) : prod.outOfStock ? (
                          <View style={styles.soldOutPill}>
                            <Text style={styles.soldOutText}>Sold Out</Text>
                          </View>
                        ) : inCartItem ? (
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
              <TouchableOpacity
                style={[
                  styles.bottomCartFloatingBar,
                  !isStoreCurrentlyOpen(selectedStore) && styles.bottomCartFloatingBarWarning,
                ]}
                onPress={() => setCartModalVisible(true)}
                activeOpacity={0.9}
              >
                <View>
                  <Text style={styles.floatingCartCount}>
                    {cart.reduce((s, i) => s + i.qty, 0)} Items Selected
                  </Text>
                  <Text style={styles.floatingCartTotal}>{formatNaira(cartTotal)}</Text>
                </View>
                <View style={[styles.floatingCheckoutBtn, !isStoreCurrentlyOpen(selectedStore) && styles.floatingCheckoutBtnWarning]}>
                  <Text style={styles.floatingCheckoutBtnText}>
                    {isStoreCurrentlyOpen(selectedStore) ? 'View Basket & Pay →' : 'View Basket (Closed) →'}
                  </Text>
                </View>
              </TouchableOpacity>
            )}
          </SafeAreaView>
        </View>
      )}

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

          <ScrollView style={{ flex: 1, padding: 16 }} scrollEnabled={cartScrollEnabled}>
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
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Image
                      source={LOGO_TRANSPARENT}
                      style={{ width: 32, height: 32, marginRight: 8 }}
                      resizeMode="contain"
                    />
                    <Text style={styles.cartSectionTitle}>Items in Basket</Text>
                  </View>
                  <TouchableOpacity
                    style={styles.clearCartBtn}
                    onPress={clearAllCartItems}
                    activeOpacity={0.7}
                  >
                    <Text style={styles.clearCartBtnText}>Clear All</Text>
                  </TouchableOpacity>
                </View>

                {participatingStores.map((grp) => (
                  <View key={grp.id} style={styles.cartStoreGroupCard}>
                    {/* Multi-Stop Sequence Tag (if multi-store order) */}
                    {participatingStores.length > 1 && (
                      <View style={styles.cartStoreStopPill}>
                        <Text style={styles.cartStoreStopPillText}>
                          📍 STOP {grp.stopNumber} OF {participatingStores.length} • PICKUP HUB
                        </Text>
                      </View>
                    )}

                    {/* Store Group Header */}
                    <View style={styles.cartStoreGroupHeader}>
                      <View style={{ flex: 1, flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        <Text style={{ fontSize: 16 }}>🏪</Text>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.cartStoreGroupName} numberOfLines={1}>
                              {grp.storeName}
                            </Text>
                            <View
                              style={[
                                styles.cartStoreStatusBadge,
                                { backgroundColor: grp.isOpen ? 'rgba(5, 107, 75, 0.12)' : 'rgba(239, 68, 68, 0.12)' },
                              ]}
                            >
                              <Text
                                style={[
                                  styles.cartStoreStatusText,
                                  { color: grp.isOpen ? '#056B4B' : '#EF4444' },
                                ]}
                              >
                                {grp.isOpen ? '● Open' : '● Closed'}
                              </Text>
                            </View>
                          </View>
                          <Text style={styles.cartStoreSubtotal}>
                            Subtotal: {formatNaira(grp.subtotal)} ({grp.items.reduce((s, i) => s + i.qty, 0)} items)
                          </Text>
                        </View>
                      </View>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                        {participatingStores.length > 1 && (
                          <View style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', borderRadius: 8, padding: 2 }}>
                            <TouchableOpacity
                              onPress={() => moveStoreOrder(grp.storeId, -1)}
                              disabled={grp.stopNumber === 1}
                              style={{ paddingHorizontal: 6, paddingVertical: 3, opacity: grp.stopNumber === 1 ? 0.3 : 1 }}
                            >
                              <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.emeraldDeep }}>▲</Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              onPress={() => moveStoreOrder(grp.storeId, 1)}
                              disabled={grp.stopNumber === participatingStores.length}
                              style={{ paddingHorizontal: 6, paddingVertical: 3, opacity: grp.stopNumber === participatingStores.length ? 0.3 : 1 }}
                            >
                              <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.emeraldDeep }}>▼</Text>
                            </TouchableOpacity>
                          </View>
                        )}
                        <TouchableOpacity
                          style={styles.cartStoreGroupClearBtn}
                          onPress={() => clearStoreItems(grp.storeId)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.cartStoreGroupClearBtnText}>Remove Shop</Text>
                        </TouchableOpacity>
                      </View>
                    </View>

                    {/* Warning banner if this specific store is closed */}
                    {!grp.isOpen && (
                      <View style={styles.cartStoreClosedBanner}>
                        <Text style={styles.cartStoreClosedText}>
                          ⚠️ This shop is currently closed. Remove items to proceed with checkout.
                        </Text>
                      </View>
                    )}

                    {/* Store Items List */}
                    {grp.items.map((item) => (
                      <View key={item.id} style={styles.cartItemRow}>
                        {getProductImageSource(item.imageUrl || item.imageUri) ? (
                          <Image
                            source={getProductImageSource(item.imageUrl || item.imageUri)}
                            style={{ width: 34, height: 34, borderRadius: 6, marginRight: 12 }}
                            resizeMode="contain"
                          />
                        ) : (
                          <Text style={{ fontSize: 24, marginRight: 12 }}>{item.icon}</Text>
                        )}
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cartItemName}>{item.name}</Text>
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
                          <TouchableOpacity
                            style={styles.removeItemBtn}
                            onPress={() => deleteItemFromCart(item.id)}
                            activeOpacity={0.7}
                            accessibilityLabel="Remove item"
                          >
                            <Text style={styles.removeItemBtnText}>✕</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    ))}
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
                    <Text style={styles.billLabel}>Base Courier Delivery</Text>
                    <Text style={styles.billVal}>{formatNaira(baseCourierFee)}</Text>
                  </View>
                  {multiStopCount > 0 && (
                    <View style={styles.billRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                        <Text style={styles.billLabel}>
                          Multi-Store Stops ({multiStopCount} extra pickup{multiStopCount > 1 ? 's' : ''})
                        </Text>
                      </View>
                      <Text style={[styles.billVal, { color: COLORS.emeraldPrimary, fontWeight: '800' }]}>
                        +{formatNaira(multiStopSurcharge)}
                      </Text>
                    </View>
                  )}
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

                {/* --- DESTINATION & CONFIRMED DELIVERY MAP STRUCTURE --- */}
                <View style={styles.cartDestinationCard}>
                  {/* Header Row */}
                  <View style={styles.cartDestHeaderRow}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1, marginRight: 8 }}>
                      <Text style={{ fontSize: 16, marginRight: 6 }}>📍</Text>
                      <View style={{ flex: 1 }}>
                        <Text style={styles.cartDestBadge}>DELIVERY DESTINATION & RIDER PIN</Text>
                        <Text style={styles.cartDestTitle} numberOfLines={1}>
                          {pinnedLocation?.name || mapStreetAddress || selectedLocation}
                        </Text>
                      </View>
                    </View>
                    <TouchableOpacity
                      style={styles.cartDestEditBtn}
                      onPress={openLocationPickerFromCart}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cartDestEditBtnText}>Change Pin ➔</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Address Details Box */}
                  <View style={styles.cartDestDetailsBox}>
                    <View style={styles.cartDestDetailRow}>
                      <Text style={styles.cartDestDetailKey}>Landmark:</Text>
                      <Text style={styles.cartDestDetailVal} numberOfLines={2}>
                        {pinnedLocation?.landmark || mapLandmark || 'Near compound gate / security post'}
                      </Text>
                    </View>
                    {(pinnedLocation?.apartment || mapApartment) ? (
                      <View style={styles.cartDestDetailRow}>
                        <Text style={styles.cartDestDetailKey}>Apartment/Unit:</Text>
                        <Text style={styles.cartDestDetailVal} numberOfLines={1}>
                          {pinnedLocation?.apartment || mapApartment}
                        </Text>
                      </View>
                    ) : null}
                  </View>

                  {/* Smart Proximity Prompt: When phone GPS differs from pinned delivery location */}
                  {isDeliveryAtDifferentLocation && !acknowledgedDiffLocation && (
                    <View style={styles.diffLocationPromptCard}>
                      <View style={styles.diffLocationPromptHeader}>
                        <Text style={{ fontSize: 18, marginRight: 8 }}>📍</Text>
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                            <Text style={styles.diffLocationPromptBadge}>DIFFERENT LOCATION</Text>
                            <Text style={styles.diffLocationPromptDist}>
                              {liveDiffDistanceKm?.toFixed(1)} km away
                            </Text>
                          </View>
                          <Text style={styles.diffLocationPromptTitle}>
                            Sending to another location or friend?
                          </Text>
                          <Text style={styles.diffLocationPromptSub}>
                            Your delivery pin is at <Text style={{ fontWeight: '800', color: COLORS.textDark }}>{pinnedLocation?.name?.split(',')[0] || 'another address'}</Text>, while your phone is currently in another area. Keep this pin if sending to family/friends, or switch to your live phone GPS.
                          </Text>
                        </View>
                      </View>
                      <View style={styles.diffLocationPromptActions}>
                        <TouchableOpacity
                          style={styles.diffLocationKeepBtn}
                          onPress={() => setAcknowledgedDiffLocation(true)}
                          activeOpacity={0.8}
                        >
                          <Text style={styles.diffLocationKeepBtnText}>
                            ✓ Keep Pinned Address
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.diffLocationSwitchBtn}
                          onPress={handleSwitchDeliveryToLivePhoneLocation}
                          activeOpacity={0.85}
                        >
                          <Text style={styles.diffLocationSwitchBtnText}>
                            🎯 Deliver to My Phone GPS
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}

                  {/* Sequential Stop Itinerary Flow Pills */}
                  {participatingStores.length > 1 && (
                    <View style={styles.multiStopItineraryFlowBar}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4, paddingHorizontal: 2 }}>
                        <Text style={{ fontSize: 9.5, fontWeight: '800', color: COLORS.textMuted, letterSpacing: 0.5 }}>
                          🛵 COURIER PICKUP SEQUENCE
                        </Text>
                        <TouchableOpacity
                          onPress={reverseStoreOrder}
                          activeOpacity={0.7}
                          style={{ flexDirection: 'row', alignItems: 'center', backgroundColor: '#F3F4F6', paddingHorizontal: 7, paddingVertical: 2, borderRadius: 6 }}
                        >
                          <Text style={{ fontSize: 10, fontWeight: '800', color: COLORS.emeraldDeep }}>
                            ⇅ Reverse Sequence
                          </Text>
                        </TouchableOpacity>
                      </View>
                      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ alignItems: 'center', gap: 6, paddingVertical: 2 }}>
                        {participatingStores.map((st) => (
                          <React.Fragment key={`flow-step-${st.id}`}>
                            <View style={styles.multiStopFlowPill}>
                              <View style={styles.multiStopFlowBadge}>
                                <Text style={styles.multiStopFlowBadgeText}>{st.stopNumber}</Text>
                              </View>
                              <Text style={{ fontSize: 12, marginRight: 2 }}>🏪</Text>
                              <Text style={styles.multiStopFlowName} numberOfLines={1}>
                                {st.name}
                              </Text>
                            </View>
                            <Text style={styles.multiStopFlowArrow}>➔</Text>
                          </React.Fragment>
                        ))}
                        <View style={[styles.multiStopFlowPill, { backgroundColor: 'rgba(5, 107, 75, 0.12)', borderColor: COLORS.emeraldPrimary }]}>
                          <Text style={{ fontSize: 13, marginRight: 4 }}>🏠</Text>
                          <Text style={[styles.multiStopFlowName, { color: COLORS.emeraldDeep, fontWeight: '800' }]}>
                            Home ({pinnedLocation?.name?.split(',')[0] || 'Delivery Pin'})
                          </Text>
                        </View>
                      </ScrollView>
                    </View>
                  )}

                  {/* Interactive Mini-Map Preview Structure (Resizable & Fullscreen-ready) */}
                  <View
                    style={[styles.cartMapContainer, { height: cartMapSize === 'tall' ? 390 : 220 }]}
                    onTouchStart={() => setCartScrollEnabled(false)}
                    onTouchEnd={() => setCartScrollEnabled(true)}
                    onTouchCancel={() => setCartScrollEnabled(true)}
                  >
                    <MapView
                      ref={cartMapRef}
                      key="cart-map-view"
                      style={styles.cartMapCanvas}
                      initialRegion={{
                        latitude: (deliveryDestLat + (participatingStores[0]?.latitude || activeCartStoreLat)) / 2,
                        longitude: (deliveryDestLng + (participatingStores[0]?.longitude || activeCartStoreLng)) / 2,
                        latitudeDelta: Math.max(0.02, Math.abs(deliveryDestLat - (participatingStores[0]?.latitude || activeCartStoreLat)) * 2),
                        longitudeDelta: Math.max(0.02, Math.abs(deliveryDestLng - (participatingStores[0]?.longitude || activeCartStoreLng)) * 2),
                      }}
                      showsUserLocation={true}
                      showsCompass={true}
                      zoomControlEnabled={true}
                      scrollEnabled={true}
                      zoomEnabled={true}
                      pitchEnabled={true}
                      rotateEnabled={true}
                      onRegionChangeComplete={(reg) => setCartMapRegion(reg)}
                    >
                      {/* 1. Participating Store Pins (with Numbered Stop Badges & Store Emoji) */}
                      {participatingStores.map((st) => (
                        <Marker
                          key={st.id}
                          coordinate={{
                            latitude: st.latitude,
                            longitude: st.longitude,
                          }}
                          title={`🏪 Stop ${st.stopNumber}: ${st.name}`}
                          description={`Pickup Hub (${st.itemsCount} items • ${formatNaira(st.subtotal)})`}
                          anchor={{ x: 0.5, y: 1.0 }}
                        >
                          <View style={styles.cartMapStoreMarkerPill}>
                            <View style={styles.cartMapStopNumberBadge}>
                              <Text style={styles.cartMapStopNumberBadgeText}>{st.stopNumber}</Text>
                            </View>
                            <Text style={{ fontSize: 13, marginRight: 3 }}>🏪</Text>
                            <Text style={styles.cartMapStoreMarkerText} numberOfLines={1}>
                              {st.name}
                            </Text>
                          </View>
                        </Marker>
                      ))}

                      {/* 2. Buyer Delivery Destination Pin (Home / Residence Emoji Pill) */}
                      <Marker
                        coordinate={{
                          latitude: deliveryDestLat,
                          longitude: deliveryDestLng,
                        }}
                        title={`🏠 Home: Delivery Destination`}
                        description={pinnedLocation?.name || 'Customer dropoff residence'}
                        anchor={{ x: 0.5, y: 1.0 }}
                      >
                        <View style={styles.cartMapHomeMarkerPill}>
                          <View style={styles.cartMapHomeIconBadge}>
                            <Text style={{ fontSize: 13 }}>🏠</Text>
                          </View>
                          <View style={{ flexDirection: 'column' }}>
                            <Text style={styles.cartMapHomeMarkerTitle}>HOME</Text>
                            <Text style={styles.cartMapHomeMarkerSub} numberOfLines={1}>
                              {pinnedLocation?.name?.split(',')[0] || 'My Delivery Address'}
                            </Text>
                          </View>
                        </View>
                      </Marker>

                      {/* 3. Buyer Live Phone GPS Location (Blue Dot Beacon) */}
                      {userLiveCoords && (
                        <Marker
                          coordinate={userLiveCoords}
                          title="🔵 Your Current Live Location"
                          description="Live satellite GPS position of your phone"
                          anchor={{ x: 0.5, y: 0.5 }}
                        >
                          <View style={styles.liveBeaconOuter}>
                            <View style={styles.liveBeaconInner} />
                          </View>
                        </Marker>
                      )}

                      {/* 4. Sequential Multi-Stop Route Polylines */}
                      {multiStopRouteSegments.map((seg) => (
                        <Polyline
                          key={`poly-${seg.id}-${seg.coordinates.map((c) => `${c.latitude}_${c.longitude}`).join('-')}`}
                          coordinates={seg.coordinates}
                          strokeColor={seg.strokeColor}
                          strokeWidth={seg.strokeWidth}
                          lineDashPattern={seg.lineDashPattern}
                        />
                      ))}
                    </MapView>

                    {/* Proximity & Distance Header Overlay */}
                    <View style={styles.cartMapDistanceBanner}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1, marginRight: 6 }}>
                        <Text style={{ fontSize: 14 }}>🚀</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.cartMapDistanceTitle} numberOfLines={1}>
                            {participatingStores.length > 1
                              ? `Multi-Stop Dispatch (${participatingStores.length} Shops + Dropoff)`
                              : cartDistanceKm !== null
                              ? `${cartDistanceKm < 1 ? Math.round(cartDistanceKm * 1000) + ' m' : cartDistanceKm.toFixed(1) + ' km'} away from ${activeCartStore?.name || 'Shop'}`
                              : `Fulfilling from ${activeCartStore?.name || 'Shop'}`}
                          </Text>
                          <Text style={styles.cartMapDistanceSub} numberOfLines={1}>
                            {participatingStores.length > 1
                              ? `${participatingStores.map((s) => `[${s.stopNumber}] ${s.name}`).join(' ➔ ')} ➔ 📍 Delivery (~${cartEstDeliveryMins})`
                              : `🏪 Shop Pin ➔ 📍 Pinned Destination (~${cartEstDeliveryMins})`}
                          </Text>
                        </View>
                      </View>
                      <View style={styles.cartMapDistanceBadge}>
                        <Text style={styles.cartMapDistanceBadgeText}>
                          {participatingStores.length > 1
                            ? `${multiStopTotalDistanceKm.toFixed(1)} km Total`
                            : cartDistanceKm !== null
                            ? `${cartDistanceKm.toFixed(1)} km`
                            : 'Near'}
                        </Text>
                      </View>
                    </View>

                    {/* Floating Zoom Controls Pill on the Right Side */}
                    <View style={styles.cartMapZoomPill}>
                      <TouchableOpacity
                        style={styles.cartMapZoomBtn}
                        onPress={() => zoomCartMap(true, cartMapRef)}
                        activeOpacity={0.7}
                        accessibilityLabel="Zoom In"
                      >
                        <Text style={styles.cartMapZoomBtnText}>＋</Text>
                      </TouchableOpacity>
                      <View style={styles.cartMapZoomDivider} />
                      <TouchableOpacity
                        style={styles.cartMapZoomBtn}
                        onPress={() => zoomCartMap(false, cartMapRef)}
                        activeOpacity={0.7}
                        accessibilityLabel="Zoom Out"
                      >
                        <Text style={styles.cartMapZoomBtnText}>−</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Map Legend Overlay on Bottom-Left */}
                    <View style={styles.cartMapLegendBar}>
                      <View style={styles.cartMapLegendItem}>
                        <View style={[styles.cartMapLegendDot, { backgroundColor: '#EF4444' }]} />
                        <Text style={styles.cartMapLegendText}>📍 Delivery</Text>
                      </View>
                      <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9 }}>┈┈</Text>
                      <View style={styles.cartMapLegendItem}>
                        <View style={[styles.cartMapLegendDot, { backgroundColor: COLORS.emeraldPrimary }]} />
                        <Text style={styles.cartMapLegendText}>
                          {participatingStores.length > 1
                            ? `🏪 ${participatingStores.length} Stores`
                            : `🏪 ${activeCartStore?.name || 'Shop'}`}
                        </Text>
                      </View>
                      {userLiveCoords && (
                        <>
                          <Text style={{ color: 'rgba(255,255,255,0.6)', fontSize: 9 }}>•</Text>
                          <View style={styles.cartMapLegendItem}>
                            <View style={[styles.cartMapLegendDot, { backgroundColor: '#2563EB' }]} />
                            <Text style={styles.cartMapLegendText}>🔵 You</Text>
                          </View>
                        </>
                      )}
                    </View>

                    {/* Bottom-Right Controls Cluster: Fit View, Resize, and Fullscreen */}
                    <View style={styles.cartMapControlsCluster}>
                      {/* Fit View Button */}
                      <TouchableOpacity
                        style={styles.cartMapFitBtn}
                        onPress={() => fitCartMapToAllPins(cartMapRef, 45)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.cartMapFitBtnText}>🧭 Fit All</Text>
                      </TouchableOpacity>

                      {/* Inline Resize Button (220px <-> 390px) */}
                      <TouchableOpacity
                        style={styles.cartMapResizeBtn}
                        onPress={() => {
                          setCartMapSize((prev) => (prev === 'tall' ? 'compact' : 'tall'));
                          setTimeout(() => fitCartMapToAllPins(cartMapRef, 45), 250);
                        }}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.cartMapResizeBtnText}>
                          {cartMapSize === 'tall' ? '⤡ Compact' : '↕ Expand'}
                        </Text>
                      </TouchableOpacity>

                      {/* Fullscreen Button */}
                      <TouchableOpacity
                        style={styles.cartMapFullscreenBtn}
                        onPress={() => setIsCartMapFullscreen(true)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.cartMapFullscreenBtnText}>⛶ Fullscreen</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Inline Zoom & Camera Control Bar (Works smoothly while in Basket view) */}
                  <View style={styles.cartMapInlineZoomBar}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flex: 1 }}>
                      <Text style={{ fontSize: 13 }}>🔍</Text>
                      <Text style={styles.cartMapInlineZoomLabel}>Map Zoom:</Text>
                    </View>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <TouchableOpacity
                        style={styles.cartMapInlineZoomBtn}
                        onPress={() => zoomCartMap(true, cartMapRef)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cartMapInlineZoomBtnText}>＋ Zoom In</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={styles.cartMapInlineZoomBtn}
                        onPress={() => zoomCartMap(false, cartMapRef)}
                        activeOpacity={0.7}
                      >
                        <Text style={styles.cartMapInlineZoomBtnText}>− Zoom Out</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[styles.cartMapInlineZoomBtn, { backgroundColor: 'rgba(5, 107, 75, 0.08)', borderColor: COLORS.emeraldPrimary }]}
                        onPress={() => fitCartMapToAllPins(cartMapRef, 45)}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.cartMapInlineZoomBtnText, { color: COLORS.emeraldDeep }]}>🧭 Fit All</Text>
                      </TouchableOpacity>
                    </View>
                  </View>

                  {/* Quick Action Buttons Row */}
                  <View style={styles.cartMapActionsRow}>
                    <TouchableOpacity
                      style={styles.cartMapActionBtnSecondary}
                      onPress={openLocationPickerFromCart}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cartMapActionBtnSecondaryText}>
                        📍 Change Delivery / Pin Location on Map
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cartMapActionBtnFullscreen}
                      onPress={() => setIsCartMapFullscreen(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cartMapActionBtnFullscreenText}>
                        ⛶ View Fullscreen Map
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      style={styles.cartMapActionBtnOutline}
                      onPress={() =>
                        openExternalGoogleMaps(
                          pinnedLocation?.latitude || mapCoords.latitude,
                          pinnedLocation?.longitude || mapCoords.longitude
                        )
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cartMapActionBtnOutlineText}>
                        🗺️ Google Maps ➔
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* --- MESSAGE BOX FOR THE DELIVERY RIDER --- */}
                <View style={styles.riderNoteCard}>
                  <View style={styles.riderNoteHeaderRow}>
                    <Text style={styles.riderNoteIcon}>🛵</Text>
                    <View style={{ flex: 1, marginLeft: 8 }}>
                      <Text style={styles.riderNoteBadge}>COURIER INSTRUCTIONS</Text>
                      <Text style={styles.riderNoteTitle}>Instructions for Delivery Rider</Text>
                    </View>
                    {riderDeliveryNote.length > 0 && (
                      <TouchableOpacity
                        onPress={() => {
                          setRiderDeliveryNote('');
                          setMapNotes('');
                        }}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={styles.riderNoteClearText}>Clear</Text>
                      </TouchableOpacity>
                    )}
                  </View>

                  <Text style={styles.riderNoteSub}>
                    Where would you like the delivery rider to meet you? (e.g. main gate, call when outside, lobby reception):
                  </Text>

                  {/* Multi-line Message Input Box */}
                  <View style={styles.riderNoteInputWrap}>
                    <TextInput
                      style={styles.riderNoteInput}
                      value={riderDeliveryNote}
                      onChangeText={(txt) => {
                        setRiderDeliveryNote(txt);
                        setMapNotes(txt);
                      }}
                      placeholder="e.g. Meet me at the estate gate, call when 2 mins away, leave with security..."
                      placeholderTextColor="#94A3B8"
                      multiline
                      numberOfLines={3}
                      textAlignVertical="top"
                    />
                  </View>

                  {/* Quick-Select Meeting Place Presets */}
                  <Text style={styles.riderNotePresetsLabel}>QUICK SUGGESTIONS (TAP TO FILL):</Text>
                  <ScrollView
                    horizontal
                    showsHorizontalScrollIndicator={false}
                    contentContainerStyle={styles.riderNotePresetsScroll}
                  >
                    {[
                      { icon: '🛡️', text: 'Meet at main estate gate' },
                      { icon: '📞', text: 'Call me when outside' },
                      { icon: '👮', text: 'Leave with security post' },
                      { icon: '🚪', text: 'Bring to my apartment door' },
                      { icon: '🏢', text: 'Meet at reception / lobby' },
                      { icon: '🔔', text: 'Ring doorbell on arrival' },
                    ].map((preset, pIdx) => {
                      const isSelected = riderDeliveryNote === preset.text;
                      return (
                        <TouchableOpacity
                          key={`preset-${pIdx}`}
                          style={[
                            styles.riderNotePresetChip,
                            isSelected && styles.riderNotePresetChipActive,
                          ]}
                          onPress={() => {
                            setRiderDeliveryNote(preset.text);
                            setMapNotes(preset.text);
                          }}
                          activeOpacity={0.7}
                        >
                          <Text
                            style={[
                              styles.riderNotePresetChipText,
                              isSelected && styles.riderNotePresetChipTextActive,
                            ]}
                          >
                            {preset.icon} {preset.text}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </ScrollView>
                </View>

                {/* Delivery Partner Selection */}
                <View style={styles.deliveryTierContainer}>
                  <Text style={styles.deliveryTierHeader}>SELECT DELIVERY PARTNER</Text>
                  <Text style={styles.deliveryTierSub}>
                    Direct dispatch to your pinned GPS location
                  </Text>

                  {/* Option 1: Bolt Express Motorbike */}
                  <TouchableOpacity
                    style={[
                      styles.deliveryTierOption,
                      selectedDeliveryTier === 'bolt' && styles.deliveryTierOptionActive,
                    ]}
                    onPress={() => setSelectedDeliveryTier('bolt')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.deliveryTierTopRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={styles.boltIconBadge}>
                          <Text style={{ fontSize: 18 }}>🟢</Text>
                        </View>
                        <View style={{ marginLeft: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                            <Text style={styles.deliveryTierTitle}>Bolt Express Motorbike</Text>
                            <View style={styles.boltFastestBadge}>
                              <Text style={styles.boltFastestText}>FASTEST</Text>
                            </View>
                          </View>
                          <Text style={styles.deliveryTierTime}>15–25 mins • Powered by Bolt Delivery</Text>
                        </View>
                      </View>
                      <Text style={styles.deliveryTierPrice}>{formatNaira(1200)}</Text>
                    </View>
                    <Text style={styles.deliveryTierPerks}>
                      ⚡ Rapid motorbike courier • Live in-app rider GPS tracking & call
                    </Text>
                  </TouchableOpacity>

                  {/* Option 2: GETIT Concierge Direct */}
                  <TouchableOpacity
                    style={[
                      styles.deliveryTierOption,
                      selectedDeliveryTier === 'concierge' && styles.deliveryTierOptionActive,
                    ]}
                    onPress={() => setSelectedDeliveryTier('concierge')}
                    activeOpacity={0.8}
                  >
                    <View style={styles.deliveryTierTopRow}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                        <View style={styles.conciergeIconBadge}>
                          <Text style={{ fontSize: 18 }}>🛵</Text>
                        </View>
                        <View style={{ marginLeft: 10 }}>
                          <Text style={styles.deliveryTierTitle}>GETIT Concierge Direct</Text>
                          <Text style={styles.deliveryTierTime}>25–35 mins • Dedicated Private Courier</Text>
                        </View>
                      </View>
                      <Text style={styles.deliveryTierPrice}>{formatNaira(2500)}</Text>
                    </View>
                    <Text style={styles.deliveryTierPerks}>
                      🛡️ White-glove dedicated courier for temperature-sensitive VIP items
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* Checkout Trigger */}
                <TouchableOpacity
                  style={styles.primaryActionBtn}
                  onPress={() => {
                    const closedCartItem = cart.find((item) => {
                      const itemStore = storesList.find(
                        (s) => (item.storeId && s.id === item.storeId) || s.name === item.storeName
                      );
                      return itemStore && !isStoreCurrentlyOpen(itemStore);
                    });

                    if (closedCartItem) {
                      Alert.alert(
                        '⛔ Store Currently Closed',
                        `"${closedCartItem.storeName}" is currently closed and not accepting orders or bookings. Please remove items from closed stores before proceeding to checkout.`,
                        [{ text: 'OK', style: 'default' }]
                      );
                      return;
                    }

                    if (isDeliveryAtDifferentLocation && !acknowledgedDiffLocation) {
                      Alert.alert(
                        '📍 Confirm Delivery Destination',
                        `Your delivery pin is currently set to:\n"${pinnedLocation?.name}"\n\nThis is ${liveDiffDistanceKm?.toFixed(1)} km away from your phone's live GPS position.\n\nAre you sending this order to another address or a friend, or would you like to deliver to your current location?`,
                        [
                          {
                            text: '🎯 Deliver to My Phone GPS',
                            onPress: async () => {
                              await handleSwitchDeliveryToLivePhoneLocation();
                              setCartModalVisible(false);
                              setCheckoutModalVisible(true);
                            },
                          },
                          {
                            text: `✓ Keep "${pinnedLocation?.name?.split(',')[0] || 'Pinned'}"`,
                            onPress: () => {
                              setAcknowledgedDiffLocation(true);
                              setCartModalVisible(false);
                              setCheckoutModalVisible(true);
                            },
                            style: 'default',
                          },
                          {
                            text: '🗺️ Adjust on Map',
                            onPress: () => {
                              openLocationPickerFromCart();
                            },
                            style: 'cancel',
                          },
                        ]
                      );
                      return;
                    }

                    setCartModalVisible(false);
                    setCheckoutModalVisible(true);
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.primaryActionBtnText}>
                    Proceed to Pay • {formatNaira(cartTotal)}
                  </Text>
                </TouchableOpacity>
              </>
            )}
          </ScrollView>

          {/* --- BASKET FULLSCREEN INTERACTIVE DISPATCH MAP OVERLAY --- */}
          {isCartMapFullscreen && (
            <View style={styles.cartFullscreenOverlay}>
              {/* Top Luxury Navigation & Header Bar (Safe-Area Spaced) */}
              <View style={styles.cartFullscreenHeaderBar}>
                <TouchableOpacity
                  style={styles.cartFullscreenBackBtn}
                  onPress={() => setIsCartMapFullscreen(false)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Text style={styles.cartFullscreenBackBtnText}>← Basket</Text>
                </TouchableOpacity>

                <View style={{ flex: 1, marginHorizontal: 8 }}>
                  <Text style={styles.cartFullscreenHeaderTitle} numberOfLines={1}>
                    {participatingStores.length > 1
                      ? `Multi-Store Dispatch (${participatingStores.length} Shops)`
                      : `Dispatch Route • ${activeCartStore?.name || 'Shop'}`}
                  </Text>
                  <Text style={styles.cartFullscreenHeaderSub} numberOfLines={1}>
                    📍 To: {pinnedLocation?.name || 'Your Delivery Destination'}
                  </Text>
                </View>

                <TouchableOpacity
                  style={styles.cartFullscreenCloseCircle}
                  onPress={() => setIsCartMapFullscreen(false)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Text style={{ fontSize: 17, fontWeight: '900', color: COLORS.textDark }}>✕</Text>
                </TouchableOpacity>
              </View>

              {/* Full-Screen Interactive Map Canvas */}
              <View style={{ flex: 1, position: 'relative' }}>
                <MapView
                  ref={cartFullscreenMapRef}
                  key="cart-fullscreen-map-view"
                  style={{ flex: 1, width: '100%', height: '100%' }}
                  initialRegion={{
                    latitude: (deliveryDestLat + (participatingStores[0]?.latitude || activeCartStoreLat)) / 2,
                    longitude: (deliveryDestLng + (participatingStores[0]?.longitude || activeCartStoreLng)) / 2,
                    latitudeDelta: Math.max(0.02, Math.abs(deliveryDestLat - (participatingStores[0]?.latitude || activeCartStoreLat)) * 2),
                    longitudeDelta: Math.max(0.02, Math.abs(deliveryDestLng - (participatingStores[0]?.longitude || activeCartStoreLng)) * 2),
                  }}
                  onMapReady={() => {
                    fitCartMapToAllPins(cartFullscreenMapRef, {
                      top: Platform.OS === 'ios' ? 120 : 100,
                      right: 45,
                      bottom: 190,
                      left: 45,
                    });
                  }}
                  showsUserLocation={true}
                  showsCompass={true}
                  scrollEnabled={true}
                  zoomEnabled={true}
                  pitchEnabled={true}
                  rotateEnabled={true}
                  onRegionChangeComplete={(reg) => setCartMapRegion(reg)}
                >
                  {/* Participating Stores Pins (with Numbered Stop Badges & Store Emoji) */}
                  {participatingStores.map((st) => (
                    <Marker
                      key={`fs-${st.id}`}
                      coordinate={{
                        latitude: st.latitude,
                        longitude: st.longitude,
                      }}
                      title={`🏪 Stop ${st.stopNumber}: ${st.name}`}
                      description={`Pickup Hub (${st.itemsCount} items • ${formatNaira(st.subtotal)})`}
                      anchor={{ x: 0.5, y: 1.0 }}
                    >
                      <View style={styles.cartMapStoreMarkerPill}>
                        <View style={styles.cartMapStopNumberBadge}>
                          <Text style={styles.cartMapStopNumberBadgeText}>{st.stopNumber}</Text>
                        </View>
                        <Text style={{ fontSize: 13, marginRight: 3 }}>🏪</Text>
                        <Text style={styles.cartMapStoreMarkerText} numberOfLines={1}>
                          {st.name}
                        </Text>
                      </View>
                    </Marker>
                  ))}

                  {/* Delivery Destination Pin (Home / Residence Emoji Pill) */}
                  <Marker
                    coordinate={{
                      latitude: deliveryDestLat,
                      longitude: deliveryDestLng,
                    }}
                    title="🏠 Home: Delivery Destination"
                    description={pinnedLocation?.name || 'Customer dropoff residence'}
                    anchor={{ x: 0.5, y: 1.0 }}
                  >
                    <View style={styles.cartMapHomeMarkerPill}>
                      <View style={styles.cartMapHomeIconBadge}>
                        <Text style={{ fontSize: 13 }}>🏠</Text>
                      </View>
                      <View style={{ flexDirection: 'column' }}>
                        <Text style={styles.cartMapHomeMarkerTitle}>HOME</Text>
                        <Text style={styles.cartMapHomeMarkerSub} numberOfLines={1}>
                          {pinnedLocation?.name?.split(',')[0] || 'My Delivery Address'}
                        </Text>
                      </View>
                    </View>
                  </Marker>

                  {/* Live Phone GPS Blue Beacon */}
                  {userLiveCoords && (
                    <Marker
                      coordinate={userLiveCoords}
                      title="🔵 You Are Here"
                      description="Live satellite phone GPS"
                      anchor={{ x: 0.5, y: 0.5 }}
                    >
                      <View style={styles.liveBeaconOuter}>
                        <View style={styles.liveBeaconInner} />
                      </View>
                    </Marker>
                  )}

                  {/* Sequential Multi-Stop Route Polylines */}
                  {multiStopRouteSegments.map((seg) => (
                    <Polyline
                      key={`fs-poly-${seg.id}-${seg.coordinates.map((c) => `${c.latitude}_${c.longitude}`).join('-')}`}
                      coordinates={seg.coordinates}
                      strokeColor={seg.strokeColor}
                      strokeWidth={seg.strokeWidth}
                      lineDashPattern={seg.lineDashPattern}
                    />
                  ))}
                </MapView>

                {/* Floating High-Visibility Dismiss Button on Top-Left of Map */}
                <TouchableOpacity
                  style={styles.cartFullscreenFloatingExitBtn}
                  onPress={() => setIsCartMapFullscreen(false)}
                  activeOpacity={0.8}
                  hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                >
                  <Text style={styles.cartFullscreenFloatingExitBtnText}>✕ Close Map</Text>
                </TouchableOpacity>

                {/* Floating Zoom & Action Cluster on Fullscreen Map */}
                <View style={styles.cartFullscreenControlsCluster} pointerEvents="box-none">
                  <TouchableOpacity
                    style={styles.cartFullscreenControlBtn}
                    onPress={() => zoomCartMap(true, cartFullscreenMapRef)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cartFullscreenControlBtnText}>＋</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.cartFullscreenControlBtn}
                    onPress={() => zoomCartMap(false, cartFullscreenMapRef)}
                    activeOpacity={0.8}
                  >
                    <Text style={styles.cartFullscreenControlBtnText}>−</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[styles.cartFullscreenControlBtn, { marginTop: 6 }]}
                    onPress={() =>
                      fitCartMapToAllPins(cartFullscreenMapRef, {
                        top: Platform.OS === 'ios' ? 120 : 100,
                        right: 45,
                        bottom: 190,
                        left: 45,
                      })
                    }
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 16 }}>🧭</Text>
                  </TouchableOpacity>
                </View>

                {/* Bottom Fullscreen Legend & Status Card */}
                <View style={styles.cartFullscreenBottomCard} pointerEvents="box-none">
                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                      <Text style={{ fontSize: 16 }}>🚀</Text>
                      <Text style={styles.cartFullscreenBottomTitle}>
                        {participatingStores.length > 1
                          ? `Multi-Stop Route (${participatingStores.length} Shops + Dropoff)`
                          : `Dispatching from ${activeCartStore?.name || 'Shop'}`}
                      </Text>
                    </View>
                    <View style={styles.cartFullscreenDistBadge}>
                      <Text style={styles.cartFullscreenDistBadgeText}>
                        {participatingStores.length > 1
                          ? `${multiStopTotalDistanceKm.toFixed(1)} km Total`
                          : cartDistanceKm !== null
                          ? `${cartDistanceKm.toFixed(1)} km`
                          : '~20 mins'}
                      </Text>
                    </View>
                  </View>

                  <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                    <View style={styles.cartMapLegendItem}>
                      <View style={[styles.cartMapLegendDot, { backgroundColor: '#D97706' }]} />
                      <Text style={[styles.cartMapLegendText, { color: COLORS.textDark }]}>🏪 Pickups</Text>
                    </View>
                    <Text style={{ color: COLORS.textMuted, fontSize: 10 }}>➔</Text>
                    <View style={styles.cartMapLegendItem}>
                      <View style={[styles.cartMapLegendDot, { backgroundColor: COLORS.emeraldPrimary }]} />
                      <Text style={[styles.cartMapLegendText, { color: COLORS.textDark }]}>📍 Delivery Pin</Text>
                    </View>
                    {multiStopCount > 0 && (
                      <View style={styles.cartMapLegendItem}>
                        <View style={[styles.cartMapLegendDot, { backgroundColor: '#10B981' }]} />
                        <Text style={[styles.cartMapLegendText, { color: COLORS.textDark }]}>
                          +{formatNaira(multiStopSurcharge)} stop surcharge
                        </Text>
                      </View>
                    )}
                    {userLiveCoords && (
                      <View style={styles.cartMapLegendItem}>
                        <View style={[styles.cartMapLegendDot, { backgroundColor: '#2563EB' }]} />
                        <Text style={[styles.cartMapLegendText, { color: COLORS.textDark }]}>🔵 Live Phone</Text>
                      </View>
                    )}
                  </View>
                </View>
              </View>
            </View>
          )}
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
                onPress={() => {
                  setCheckoutModalVisible(false);
                  setCartModalVisible(true);
                }}
              >
                <Text style={styles.paystackCancelBtnText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* --- GOOGLE MAP LOCATION PINNING MODAL --- */}
      <Modal
        visible={locationModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={closeLocationModal}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={closeLocationModal}
            >
              <Text style={styles.modalBackBtnText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Pin Delivery Location</Text>
            <TouchableOpacity
              style={styles.modalGpsNavBtn}
              onPress={() =>
                openExternalGoogleMaps(mapCoords.latitude, mapCoords.longitude)
              }
            >
              <Text style={styles.modalGpsNavText}>🗺️ Maps</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={{ flex: 1, backgroundColor: COLORS.beigeBg }}
            contentContainerStyle={{ padding: 16, paddingBottom: 50 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Notice */}
            <View style={styles.mapHeaderNoticeBox}>
              <Text style={styles.mapHeaderNoticeTitle}>📍 Set Exact Pin for Delivery Rider</Text>
              <Text style={styles.mapHeaderNoticeSub}>
                Riders use this pin and satellite GPS coordinates for direct gate dispatch.
              </Text>
            </View>

            {/* Google Maps Style Address Search Bar */}
            <View style={styles.mapSearchBarContainer}>
              <View style={styles.mapSearchInputBox}>
                <Text style={styles.mapSearchIcon}>🔍</Text>
                <TextInput
                  style={styles.mapSearchInput}
                  placeholder="Search store, clinic, street (e.g. H-Medix, Lekki)..."
                  placeholderTextColor="#94A3B8"
                  value={mapSearchText}
                  onChangeText={handleSearchTextChange}
                  onFocus={() => setShowSuggestions(true)}
                  onSubmitEditing={handleCustomAddressSearch}
                  returnKeyType="search"
                />
                {isSearchingGeocode && (
                  <ActivityIndicator size="small" color={COLORS.emeraldPrimary} style={{ marginRight: 6 }} />
                )}
                {mapSearchText.length > 0 && (
                  <TouchableOpacity
                    style={styles.mapSearchClearBtn}
                    onPress={() => {
                      setMapSearchText('');
                      setShowSuggestions(false);
                      setLiveApiResults([]);
                      setActiveSearchPins([]);
                    }}
                  >
                    <Text style={{ color: COLORS.textMuted, fontSize: 15, fontWeight: '700' }}>✕</Text>
                  </TouchableOpacity>
                )}
                <TouchableOpacity
                  style={styles.mapSearchGoBtn}
                  onPress={handleCustomAddressSearch}
                  disabled={isSearchingGeocode}
                >
                  {isSearchingGeocode ? (
                    <ActivityIndicator size="small" color="#FFFFFF" />
                  ) : (
                    <Text style={styles.mapSearchGoBtnText}>Search</Text>
                  )}
                </TouchableOpacity>
              </View>

              {/* Autocomplete Suggestions Dropdown */}
              {showSuggestions && combinedMapSearchResults.length > 0 && (
                <View style={styles.mapSuggestionsDropdown}>
                  <ScrollView
                    nestedScrollEnabled
                    style={{ maxHeight: 230 }}
                    keyboardShouldPersistTaps="handled"
                  >
                    {combinedMapSearchResults.map((place) => (
                      <TouchableOpacity
                        key={place.id}
                        style={styles.mapSuggestionRow}
                        onPress={() => handleSelectSearchResult(place)}
                        activeOpacity={0.7}
                      >
                        <View style={styles.mapSuggestionPinIconWrap}>
                          <Text style={{ fontSize: 13 }}>
                            {place.name.toLowerCase().includes('pharmacy') ||
                            place.name.toLowerCase().includes('medix')
                              ? '💊'
                              : place.name.toLowerCase().includes('supermarket') ||
                                place.name.toLowerCase().includes('mart') ||
                                place.name.toLowerCase().includes('shoprite')
                              ? '🛒'
                              : place.name.toLowerCase().includes('hotel') ||
                                place.name.toLowerCase().includes('hilton')
                              ? '🏨'
                              : '📍'}
                          </Text>
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text style={styles.mapSuggestionTitle} numberOfLines={1}>
                            {place.name}
                          </Text>
                          <Text style={styles.mapSuggestionSubtitle} numberOfLines={1}>
                            {place.district}
                          </Text>
                        </View>
                        <Text style={styles.mapSuggestionArrow}>➔</Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>
              )}
            </View>

            {/* Quick Live GPS Location Trigger Banner */}
            <TouchableOpacity
              style={styles.mapLiveLocationBanner}
              onPress={handleGetLiveLocation}
              disabled={isLocatingUser}
              activeOpacity={0.8}
            >
              <View style={styles.mapLiveIconPill}>
                {isLocatingUser ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Text style={{ fontSize: 15 }}>🎯</Text>
                )}
              </View>
              <View style={{ flex: 1 }}>
                <Text style={styles.mapLiveBannerTitle}>
                  {isLocatingUser ? 'Acquiring Doorstep Satellite GPS...' : 'Use My Live GPS Location'}
                </Text>
                <Text style={styles.mapLiveBannerSub}>
                  Center map directly on your phone location & lock pin
                </Text>
              </View>
              <View style={styles.mapLiveGpsStatusDot} />
            </TouchableOpacity>

            {/* If multiple places found around user, show horizontal quick select row */}
            {activeSearchPins.length > 1 && (
              <View style={{ marginBottom: 12 }}>
                <Text style={styles.mapPinsRowLabel}>
                  PLACES FOUND AROUND YOU ({activeSearchPins.length})
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {activeSearchPins.map((place) => {
                    const isSelected =
                      Math.abs(mapCoords.latitude - place.latitude) < 0.0002 &&
                      Math.abs(mapCoords.longitude - place.longitude) < 0.0002;
                    return (
                      <TouchableOpacity
                        key={place.id}
                        style={[
                          styles.searchPinChip,
                          isSelected && styles.searchPinChipActive,
                        ]}
                        onPress={() => handleSelectSearchResult(place)}
                      >
                        <Text
                          style={[
                            styles.searchPinChipText,
                            isSelected && styles.searchPinChipTextActive,
                          ]}
                          numberOfLines={1}
                        >
                          📍 {place.name.replace('Pharmacy & Supermarket', '').replace('Pharmacy & Stores', '').trim()}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* Interactive Map Canvas */}
            <View style={styles.mapContainerBox}>
              <MapView
                ref={mapRef}
                style={styles.mapCanvas}
                showsUserLocation={true}
                showsMyLocationButton={false}
                showsCompass={true}
                region={mapRegion}
                onRegionChangeComplete={(r) => {
                  if (r) setMapRegion(r);
                }}
                onPress={(e) => {
                  if (e && e.nativeEvent && e.nativeEvent.coordinate) {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setMapCoords({ latitude, longitude });
                    setMapRegion((prev) => ({ ...prev, latitude, longitude }));
                  }
                }}
              >
                {/* User Live Location Beacon Marker (Google Maps Style Pulse) */}
                {userLiveCoords && (
                  <Marker
                    coordinate={userLiveCoords}
                    title="Your Current Location"
                    description="Live Satellite GPS Position"
                  >
                    <View style={styles.liveBeaconOuter}>
                      <View style={styles.liveBeaconInner} />
                    </View>
                  </Marker>
                )}

                {/* Multiple Discovered Search Locations Around User (Red Google-Maps Style Pins) */}
                {activeSearchPins.map((place) => {
                  const isCurrentDeliveryPin =
                    Math.abs(mapCoords.latitude - place.latitude) < 0.0002 &&
                    Math.abs(mapCoords.longitude - place.longitude) < 0.0002;

                  if (isCurrentDeliveryPin) return null;

                  return (
                    <Marker
                      key={`pin-${place.id}-${place.latitude}-${place.longitude}`}
                      coordinate={{
                        latitude: place.latitude,
                        longitude: place.longitude,
                      }}
                      onPress={() => handleSelectSearchResult(place)}
                      title={place.name}
                      description={`${place.district} • Tap to deliver here`}
                      pinColor="#DC2626"
                    />
                  );
                })}

                {/* Delivery Dropoff Pin */}
                <Marker
                  key={`delivery-pin-${mapCoords.latitude.toFixed(6)}-${mapCoords.longitude.toFixed(6)}`}
                  coordinate={{
                    latitude: mapCoords.latitude,
                    longitude: mapCoords.longitude,
                  }}
                  draggable
                  onDragEnd={(e) => {
                    if (e && e.nativeEvent && e.nativeEvent.coordinate) {
                      const { latitude, longitude } = e.nativeEvent.coordinate;
                      setMapCoords({ latitude, longitude });
                      setMapRegion((prev) => ({ ...prev, latitude, longitude }));
                    }
                  }}
                  title="Deliver Here 📍"
                  description={mapStreetAddress || "Exact rider navigation coordinate"}
                  pinColor={COLORS.emeraldPrimary}
                />
              </MapView>

              {/* Floating Coordinates Overlay */}
              <View style={styles.mapCoordsOverlayPill}>
                <Text style={styles.mapCoordsText}>
                  🎯 Pin: {mapCoords.latitude.toFixed(4)}° N, {mapCoords.longitude.toFixed(4)}° E
                </Text>
              </View>

              {/* Floating Multi-Location Notice on Map */}
              {activeSearchPins.length > 1 && (
                <View style={styles.mapFoundPlacesBanner}>
                  <Text style={styles.mapFoundPlacesBannerText} numberOfLines={1}>
                    📍 {activeSearchPins.length} places on map • Tap any red pin to select
                  </Text>
                  <TouchableOpacity
                    style={styles.mapFoundPlacesClearBtn}
                    onPress={() => setActiveSearchPins([])}
                  >
                    <Text style={styles.mapFoundPlacesClearBtnText}>✕</Text>
                  </TouchableOpacity>
                </View>
              )}

              {/* Floating Google Maps Style Locate-Me Target Button (FAB) */}
              <TouchableOpacity
                style={styles.mapLocateMeFab}
                onPress={handleGetLiveLocation}
                disabled={isLocatingUser}
                activeOpacity={0.8}
                accessibilityLabel="Locate my position"
              >
                {isLocatingUser ? (
                  <ActivityIndicator size="small" color="#2563EB" />
                ) : (
                  <Text style={{ fontSize: 20 }}>🎯</Text>
                )}
              </TouchableOpacity>

              {/* Floating Tools on Map */}
              <View style={styles.mapToolsRow}>
                <TouchableOpacity
                  style={styles.mapToolBtn}
                  onPress={() => {
                    const preset = SEARCHABLE_LOCATIONS[0];
                    setMapCoords({ latitude: preset.latitude, longitude: preset.longitude });
                    if (mapRef.current) {
                      mapRef.current.animateToRegion({
                        latitude: preset.latitude,
                        longitude: preset.longitude,
                        latitudeDelta: 0.012,
                        longitudeDelta: 0.012,
                      }, 500);
                    }
                    Alert.alert('Recentered', `Map centered on ${preset.name}`);
                  }}
                >
                  <Text style={styles.mapToolBtnText}>🔄 Reset View</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.mapToolBtn}
                  onPress={() =>
                    openExternalGoogleMaps(mapCoords.latitude, mapCoords.longitude)
                  }
                >
                  <Text style={styles.mapToolBtnText}>🗺️ Open Google Maps</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Location Details Form for Riders */}
            <View style={styles.locationDetailsCard}>
              <Text style={styles.locationDetailsCardTitle}>Delivery Address Details</Text>

              <Text style={styles.mapInputLbl}>Street Address</Text>
              <TextInput
                style={styles.mapTextInput}
                value={mapStreetAddress}
                onChangeText={setMapStreetAddress}
                placeholder="e.g. Plot 14 Gana Street"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.mapInputLbl}>House / Apartment / Suite / Gate</Text>
              <TextInput
                style={styles.mapTextInput}
                value={mapApartment}
                onChangeText={setMapApartment}
                placeholder="e.g. Suite 4B, Black Gate with Security"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.mapInputLbl}>Landmark (Crucial for Rider Navigation)</Text>
              <TextInput
                style={styles.mapTextInput}
                value={mapLandmark}
                onChangeText={setMapLandmark}
                placeholder="e.g. Opposite Transcorp Hilton, beside Zenith Bank"
                placeholderTextColor="#94A3B8"
              />

              <Text style={styles.mapInputLbl}>Delivery Gate Instructions</Text>
              <TextInput
                style={styles.mapTextInput}
                value={mapNotes}
                onChangeText={setMapNotes}
                placeholder="e.g. Call on arrival for estate gate pass"
                placeholderTextColor="#94A3B8"
              />

              <TouchableOpacity
                style={[styles.primaryActionBtn, { marginTop: 18 }]}
                onPress={confirmPinnedLocation}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>
                  Confirm Delivery Pin & Coordinates ➔
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
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
          onPress={() => {
            setActiveTab('orders');
            setExpandedOrderId('AUTO_TOP');
          }}
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

      {/* --- RENDER BRANCH: CUSTOMER VS MERCHANT --- */}
      {appMode === 'merchant' && (
        <View style={StyleSheet.absoluteFill}>
          <SafeAreaView style={styles.merchantSafeArea}>
            <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

            {/* Merchant Top Bar */}
            <View style={styles.merchantTopHeader}>
              <View style={styles.merchantTopHeaderLeft}>
                <Image
                  source={LOGO_TRANSPARENT}
                  style={{ width: 28, height: 28, marginRight: 8 }}
                  resizeMode="contain"
                />
                <View>
                  <Text style={styles.merchantHeaderSub}>MERCHANT HUB</Text>
                  <Text style={styles.merchantHeaderTitle} numberOfLines={1}>
                    {currentMerchantStore?.name}
                  </Text>
                </View>
              </View>

              <View style={styles.merchantTopHeaderRight}>
                <TouchableOpacity
                  style={[
                    styles.storeStatusToggle,
                    storeOpenStatus ? styles.statusOpen : styles.statusPaused,
                  ]}
                  onPress={handleToggleStoreLive}
                  activeOpacity={0.8}
                >
                  <Text style={styles.storeStatusToggleText}>
                    {storeOpenStatus ? '● LIVE' : '⏸ PAUSED'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.exitMerchantBtn}
                  onPress={() => setAppMode('customer')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.exitMerchantBtnText}>👤 Customer</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.exitMerchantBtn, { backgroundColor: '#FEF2F2', borderColor: '#FCA5A5', borderWidth: 1 }]}
                  onPress={handleLogout}
                  activeOpacity={0.8}
                >
                  <Text style={[styles.exitMerchantBtnText, { color: '#DC2626' }]}>🚪 Exit</Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* Merchant Tab Content */}
            {merchantTab === 'orders' && (
              <ScrollView
                style={styles.merchantMainScroll}
                contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
              >
                {/* Orders Header & Summary */}
                <View style={styles.merchantSectionTitleRow}>
                  <View>
                    <Text style={styles.merchantViewTitle}>Live Store Orders</Text>
                    <Text style={styles.merchantViewSub}>
                      {merchantOrders.length} order{merchantOrders.length === 1 ? '' : 's'} assigned to your shop
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <TouchableOpacity
                      style={styles.testChimeBtn}
                      onPress={async () => {
                        await playAudioBeep('merchant_new_order');
                        triggerNotification({
                          title: '🔔 Sound Test Alert!',
                          body: 'Native chime is active and ringing loud on your iPad.',
                          type: 'merchant_new_order',
                        });
                      }}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.testChimeBtnText}>🔊 Test Sound</Text>
                    </TouchableOpacity>
                    <View style={styles.revenueBadgePill}>
                      <Text style={styles.revenueBadgeText}>
                        Sales: {formatNaira(merchantTotalRevenue)}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Status Filter Chips */}
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginVertical: 12 }}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {[
                    { id: 'new', label: `New (${merchantOrders.filter((o) => getMerchantStopStatus(o, currentMerchantStore) === 'New Order').length})` },
                    { id: 'preparing', label: `Preparing (${merchantOrders.filter((o) => getMerchantStopStatus(o, currentMerchantStore) === 'Preparing').length})` },
                    { id: 'ready', label: `Ready (${merchantOrders.filter((o) => getMerchantStopStatus(o, currentMerchantStore) === 'Ready for Pickup').length})` },
                    { id: 'completed', label: `Done (${merchantOrders.filter((o) => getMerchantStopStatus(o, currentMerchantStore) === 'Completed').length})` },
                    { id: 'all', label: `All (${merchantOrders.length})` },
                  ].map((f) => {
                    const active = merchantOrderFilter === f.id;
                    return (
                      <TouchableOpacity
                        key={f.id}
                        style={[styles.merchantFilterChip, active && styles.merchantFilterChipActive]}
                        onPress={() => setMerchantOrderFilter(f.id)}
                      >
                        <Text style={[styles.merchantFilterText, active && styles.merchantFilterTextActive]}>
                          {f.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* Orders List */}
                {merchantFilteredOrders.length === 0 ? (
                  <View style={styles.merchantEmptyBox}>
                    <Text style={{ fontSize: 40, marginBottom: 8 }}>📦</Text>
                    <Text style={styles.merchantEmptyTitle}>No Orders in this Status</Text>
                    <Text style={styles.merchantEmptySub}>
                      New orders from customers will appear here automatically with audio dispatch.
                    </Text>
                  </View>
                ) : (
                  merchantFilteredOrders.map((ord) => {
                    const matchingStop = getMerchantStopForOrder(ord, currentMerchantStore);
                    const stopStatus = getMerchantStopStatus(ord, currentMerchantStore);
                    const isNew = stopStatus === 'New Order';
                    const isPrep = stopStatus === 'Preparing';
                    const isReady = stopStatus === 'Ready for Pickup';
                    const isDone = stopStatus === 'Completed';

                    return (
                      <View key={ord.id} style={styles.mOrderCard}>
                        <View style={styles.mOrderHeader}>
                          <View>
                            <Text style={styles.mOrderId}>{ord.id}</Text>
                            <Text style={styles.mOrderTime}>
                              {ord.createdAt || 'Just now'} • {ord.customerName || 'Customer'}
                            </Text>
                          </View>
                          <View
                            style={[
                              styles.mStatusBadge,
                              isNew && { backgroundColor: '#FEF3C7', borderColor: '#F59E0B' },
                              isPrep && { backgroundColor: '#DBEAFE', borderColor: '#3B82F6' },
                              isReady && { backgroundColor: '#DCFCE7', borderColor: '#10B981' },
                              isDone && { backgroundColor: '#F1F5F9', borderColor: '#CBD5E1' },
                            ]}
                          >
                            <Text
                              style={[
                                styles.mStatusBadgeText,
                                isNew && { color: '#B45309' },
                                isPrep && { color: '#1D4ED8' },
                                isReady && { color: '#047857' },
                                isDone && { color: '#475569' },
                              ]}
                            >
                              {stopStatus}
                            </Text>
                          </View>
                        </View>

                        {/* Customer Delivery info */}
                        <View style={styles.mCustomerInfoBox}>
                          <Text style={styles.mCustomerAddress}>📍 {ord.customerAddress || 'Maitama, Abuja'}</Text>
                          <View style={styles.mGpsRow}>
                            <Text style={styles.mGpsCoordsText}>
                              GPS: {ord.deliveryLocation?.latitude?.toFixed(4) || '9.0882'}° N, {ord.deliveryLocation?.longitude?.toFixed(4) || '7.4933'}° E
                            </Text>
                            <TouchableOpacity
                              style={styles.mGoogleMapsLink}
                              onPress={() =>
                                openExternalGoogleMaps(
                                  ord.deliveryLocation?.latitude || 9.0882,
                                  ord.deliveryLocation?.longitude || 7.4933
                                )
                              }
                              activeOpacity={0.8}
                            >
                              <Text style={styles.mGoogleMapsLinkText}>🗺️ Google Maps</Text>
                            </TouchableOpacity>
                          </View>
                          {ord.deliveryLocation?.landmark && (
                            <Text style={styles.mLandmarkText}>
                              Landmark: <Text style={{ color: COLORS.textDark, fontWeight: '700' }}>{ord.deliveryLocation.landmark}</Text>
                            </Text>
                          )}
                          {(matchingStop?.pickupPin || ord.pickupPin) && (
                            <Text style={styles.mPickupPinNotice}>
                              Shop Handover PIN: <Text style={{ fontWeight: '800' }}>{matchingStop?.pickupPin || ord.pickupPin}</Text>
                            </Text>
                          )}
                        </View>

                        {/* Items ordered */}
                        <View style={styles.mItemsList}>
                          {((matchingStop?.items && matchingStop.items.length > 0) ? matchingStop.items : ord.items)?.map((it, idx) => (
                            <View key={idx} style={styles.mItemRow}>
                              <Text style={styles.mItemIcon}>{it.icon || '🛍️'}</Text>
                              <Text style={styles.mItemName}>
                                {it.name} <Text style={{ fontWeight: '800', color: COLORS.emeraldDeep }}>x{it.qty}</Text>
                              </Text>
                              <Text style={styles.mItemPrice}>{formatNaira(it.price * it.qty)}</Text>
                            </View>
                          )) || (
                            <Text style={styles.mItemRow}>Packaged provisions ({ord.itemsCount} items)</Text>
                          )}
                        </View>

                        {/* Order Financials: Strictly Product Money (No Delivery Fee, Customer Total Hidden) */}
                        <View style={styles.mFinancialsRow}>
                          <View>
                            <Text style={styles.mNetPayoutLabel}>YOUR EARNINGS (PRODUCTS VALUE)</Text>
                            <Text style={styles.mNetPayoutValue}>
                              {formatNaira(getMerchantOrderProductAmount(ord))}
                            </Text>
                          </View>
                        </View>

                        {/* Action Buttons depending on status */}
                        <View style={styles.mActionsRow}>
                          {isNew && (
                            <>
                              <TouchableOpacity
                                style={styles.mRejectBtn}
                                onPress={() => rejectMerchantOrder(ord.id)}
                              >
                                <Text style={styles.mRejectBtnText}>Reject</Text>
                              </TouchableOpacity>
                              <TouchableOpacity
                                style={styles.mAcceptBtn}
                                onPress={() => acceptMerchantOrder(ord.id)}
                              >
                                <Text style={styles.mAcceptBtnText}>✓ Accept Order</Text>
                              </TouchableOpacity>
                            </>
                          )}

                          {isPrep && (
                            <View style={{ width: '100%' }}>
                              <TouchableOpacity
                                style={styles.mReadyBtn}
                                onPress={() => readyMerchantOrder(ord.id)}
                              >
                                <Text style={styles.mReadyBtnText}>📦 Mark Ready for Courier</Text>
                              </TouchableOpacity>

                              {ord.deliveryPartner === 'bolt' && !ord.boltRider && (
                                <TouchableOpacity
                                  style={styles.mBoltDispatchBtn}
                                  onPress={() => dispatchBoltCourier(ord.id)}
                                >
                                  <Text style={styles.mBoltDispatchBtnText}>
                                    🟢 Dispatch Bolt Motorbike Courier
                                  </Text>
                                </TouchableOpacity>
                              )}
                            </View>
                          )}

                          {isReady && (
                            <View style={{ width: '100%' }}>
                              {/* 🚴 Zero-Map Straight Line Courier Tracker */}
                              <MerchantStraightLineTracker
                                order={ord}
                                currentStore={currentMerchantStore}
                              />

                              <View style={styles.mAutonomousRiderStatusBox}>
                                <Text style={styles.mAutonomousRiderStatusText}>
                                  🛵 Courier Musa collects and confirms pickup automatically (like Bolt Delivery).
                                </Text>
                              </View>
                              <TouchableOpacity
                                style={[styles.mCompleteBtn, { backgroundColor: '#059669', marginTop: 6 }]}
                                onPress={() => completeMerchantOrder(ord.id)}
                              >
                                <Text style={styles.mCompleteBtnText}>
                                  ⚡ Confirm Handover Now (Instant)
                                </Text>
                              </TouchableOpacity>
                            </View>
                          )}

                          {isDone && (
                            <View style={styles.mCompletedBanner}>
                              <Text style={styles.mCompletedBannerText}>✓ Order Settled & Dispatched</Text>
                            </View>
                          )}
                        </View>
                      </View>
                    );
                  })
                )}
              </ScrollView>
            )}

            {/* Inventory Tab */}
            {merchantTab === 'inventory' && (
              <ScrollView
                style={styles.merchantMainScroll}
                contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
              >
                <View style={styles.merchantSectionTitleRow}>
                  <View style={{ flex: 1, marginRight: 8 }}>
                    <Text style={styles.merchantViewTitle}>Catalog & Inventory</Text>
                    <Text style={styles.merchantViewSub}>
                      {currentMerchantStore?.products.length} products listed in {currentMerchantStore?.name}
                    </Text>
                  </View>
                  <View style={{ flexDirection: 'row', gap: 6 }}>
                    <TouchableOpacity
                      style={styles.bulkImportBtnHeader}
                      onPress={() => setBulkImportModalVisible(true)}
                    >
                      <Text style={styles.bulkImportBtnHeaderText}>⚡ Bulk Import</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.addProductBtnHeader}
                      onPress={() => setAddProductModalVisible(true)}
                    >
                      <Text style={styles.addProductBtnHeaderText}>+ Add</Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Rapid Bulk Catalog Onboarding Hero Banner */}
                <TouchableOpacity
                  style={styles.bulkOnboardingHeroCard}
                  onPress={() => setBulkImportModalVisible(true)}
                  activeOpacity={0.85}
                >
                  <View style={styles.bulkOnboardingIconWrap}>
                    <Text style={{ fontSize: 24 }}>⚡</Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6, flexWrap: 'wrap' }}>
                      <Text style={styles.bulkOnboardingBadge}>FAST ONBOARDING</Text>
                      <View style={styles.bulkFormatPill}>
                        <Text style={styles.bulkFormatPillText}>.SRT • .CSV • .XLSX • POS</Text>
                      </View>
                    </View>
                    <Text style={styles.bulkOnboardingTitle}>Bulk Import Catalog & Prices</Text>
                    <Text style={styles.bulkOnboardingSub}>
                      Upload your shop POS inventory or spreadsheet file (.srt, .csv, .txt) to onboard all products in seconds.
                    </Text>
                  </View>
                  <Text style={styles.bulkOnboardingArrow}>➔</Text>
                </TouchableOpacity>

                {/* Stock Stats Row */}
                <View style={styles.stockStatsRow}>
                  <View style={styles.stockStatCard}>
                    <Text style={styles.stockStatVal}>
                      {currentMerchantStore?.products.filter((p) => !p.outOfStock).length}
                    </Text>
                    <Text style={styles.stockStatLbl}>In Stock</Text>
                  </View>
                  <View style={styles.stockStatCard}>
                    <Text style={[styles.stockStatVal, { color: '#EF4444' }]}>
                      {currentMerchantStore?.products.filter((p) => p.outOfStock).length}
                    </Text>
                    <Text style={styles.stockStatLbl}>Out of Stock</Text>
                  </View>
                  <View style={styles.stockStatCard}>
                    <Text style={styles.stockStatVal}>
                      {currentMerchantStore?.products.length}
                    </Text>
                    <Text style={styles.stockStatLbl}>Total Items</Text>
                  </View>
                </View>

                {/* Product List */}
                <View style={{ marginTop: 12 }}>
                  {currentMerchantStore?.products.map((p) => (
                    <View key={p.id} style={styles.inventoryItemCard}>
                      {getProductImageSource(p.imageUrl || p.imageUri) ? (
                        <Image
                          source={getProductImageSource(p.imageUrl || p.imageUri)}
                          style={[styles.inventoryItemImageThumbnail, { resizeMode: 'contain' }]}
                        />
                      ) : (
                        <Text style={{ fontSize: 26, marginRight: 12 }}>{p.icon || '🛍️'}</Text>
                      )}
                      <View style={{ flex: 1 }}>
                        <Text style={styles.inventoryItemName}>{p.name}</Text>
                        <Text style={styles.inventoryItemCategory}>{p.category} • {formatNaira(p.price)}</Text>
                        <View style={{ marginTop: 4 }}>
                          {p.outOfStock ? (
                            <View style={styles.stockTagRed}>
                              <Text style={styles.stockTagRedText}>🔴 Out of Stock</Text>
                            </View>
                          ) : (
                            <View style={styles.stockTagGreen}>
                              <Text style={styles.stockTagGreenText}>🟢 Available in Shop</Text>
                            </View>
                          )}
                        </View>
                      </View>

                      <TouchableOpacity
                        style={[
                          styles.stockToggleActionBtn,
                          p.outOfStock ? styles.btnMakeAvailable : styles.btnMakeOutOfStock,
                        ]}
                        onPress={() => toggleStock(p.id)}
                      >
                        <Text
                          style={[
                            styles.stockToggleActionText,
                            p.outOfStock ? { color: '#047857' } : { color: '#B91C1C' },
                          ]}
                        >
                          {p.outOfStock ? 'Restock ✓' : 'Out of Stock ✕'}
                        </Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              </ScrollView>
            )}

            {/* Finances Tab */}
            {merchantTab === 'finances' && (
              <ScrollView
                style={styles.merchantMainScroll}
                contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
              >
                <Text style={styles.merchantViewTitle}>Finances & Settlements</Text>
                <Text style={styles.merchantViewSub}>Automated Paystack ledger settlements</Text>

                {/* Wallet Balance Hero */}
                <View style={styles.financesHeroCard}>
                  <Text style={styles.financesHeroSub}>AVAILABLE SETTLEMENT BALANCE</Text>
                  <Text style={styles.financesHeroVal}>{formatNaira(merchantTotalRevenue)}</Text>
                  <Text style={styles.financesHeroNote}>
                    Ready for instant payout to registered bank account.
                  </Text>

                  <TouchableOpacity
                    style={styles.requestPayoutBtn}
                    onPress={() => {
                      if (merchantTotalRevenue === 0) {
                        Alert.alert('No Balance', 'You currently have ₦0 available to payout.');
                        return;
                      }
                      Alert.alert(
                        'Payout Dispatched',
                        `Payout request of ${formatNaira(merchantTotalRevenue)} sent to Zenith Bank (Acct *4102). Settles in 30 mins.`
                      );
                    }}
                  >
                    <Text style={styles.requestPayoutBtnText}>Request Bank Payout ➔</Text>
                  </TouchableOpacity>
                </View>

                {/* Breakdown Card */}
                <View style={styles.financeBreakdownCard}>
                  <Text style={styles.financeCardTitle}>Product Revenue Summary</Text>
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>Total Products Sold</Text>
                    <Text style={styles.financeVal}>
                      {formatNaira(merchantTotalRevenue)}
                    </Text>
                  </View>
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>Delivery Fee</Text>
                    <Text style={[styles.financeVal, { color: COLORS.emeraldPrimary, fontWeight: '700' }]}>
                      ₦0.00 (Customer to Courier)
                    </Text>
                  </View>
                  <View style={styles.financeDivider} />
                  <View style={styles.financeRow}>
                    <Text style={[styles.financeLabel, { fontWeight: '800', color: COLORS.textDark }]}>
                      Your Product Earnings
                    </Text>
                    <Text style={[styles.financeVal, { color: COLORS.emeraldPrimary, fontWeight: '900' }]}>
                      {formatNaira(merchantTotalRevenue)}
                    </Text>
                  </View>
                </View>

                {/* Bank Account */}
                <View style={styles.bankAccountCard}>
                  <Text style={styles.financeCardTitle}>Settlement Bank Account</Text>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 6 }}>
                    <Text style={{ fontSize: 24, marginRight: 10 }}>🏦</Text>
                    <View>
                      <Text style={{ fontWeight: '800', color: COLORS.textDark, fontSize: 13 }}>
                        Zenith Bank Plc
                      </Text>
                      <Text style={{ color: COLORS.textMuted, fontSize: 11.5 }}>
                        Acct: 2109384102 • {currentMerchantStore?.name}
                      </Text>
                    </View>
                  </View>
                </View>
              </ScrollView>
            )}

            {/* Store Info & Settings Tab */}
            {merchantTab === 'store' && (
              <ScrollView
                style={styles.merchantMainScroll}
                contentContainerStyle={{ padding: 16, paddingBottom: 120 }}
                showsVerticalScrollIndicator={false}
              >
                {/* Friendly Header Row */}
                <View style={styles.storeProfileHeaderRow}>
                  <View style={{ flex: 1, paddingRight: 10 }}>
                    <Text style={styles.merchantViewTitle}>Store Profile & Identity</Text>
                    <Text style={styles.merchantViewSub}>
                      Manage how customers across Nigeria see and order from your store
                    </Text>
                  </View>
                  <TouchableOpacity
                    style={styles.storePreviewPillBtn}
                    onPress={() => setSelectedStore(currentMerchantStore)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.storePreviewPillText}>👀 View as Buyer</Text>
                  </TouchableOpacity>
                </View>

                {/* --- HERO STORE SHOWCASE CARD --- */}
                <View style={styles.heroStoreShowcaseCard}>
                  {/* Banner with Cover Image & Floating Actions */}
                  <View style={styles.heroStoreBannerWrap}>
                    <Image
                      source={{ uri: currentMerchantStore?.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80' }}
                      style={styles.heroStoreBannerImg}
                      resizeMode="cover"
                    />
                    <View style={styles.heroStoreBannerScrim} />

                    {/* Change Cover Photo Floating Action Pill */}
                    <TouchableOpacity
                      style={styles.changeCoverBtnFloating}
                      onPress={handleOpenStoreImageModal}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.changeCoverBtnIcon}>📸</Text>
                      <Text style={styles.changeCoverBtnText}>Change Photo</Text>
                    </TouchableOpacity>

                    {/* Live Operating Status Floating Badge */}
                    <View style={styles.heroStoreLiveBadgeFloat}>
                      <View style={[styles.pulseDotSmall, { backgroundColor: storeOpenStatus ? '#10B981' : '#F59E0B' }]} />
                      <Text style={styles.heroStoreLiveBadgeText}>
                        {storeOpenStatus ? '🟢 LIVE ON GETIT' : '⏸ PAUSED (OFFLINE)'}
                      </Text>
                    </View>

                    {/* Floating Store Brand Avatar */}
                    <TouchableOpacity
                      style={styles.floatingStoreAvatar}
                      onPress={handleOpenStoreImageModal}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.floatingStoreAvatarInitials}>
                        {(currentMerchantStore?.name || 'S')
                          .split(' ')
                          .map((w) => w[0])
                          .slice(0, 2)
                          .join('')
                          .toUpperCase()}
                      </Text>
                      <View style={styles.avatarCameraBadge}>
                        <Text style={{ fontSize: 9 }}>📷</Text>
                      </View>
                    </TouchableOpacity>
                  </View>

                  {/* Store Identity Content */}
                  <View style={styles.heroStoreBody}>
                    <View style={styles.heroStoreTitleRow}>
                      <View style={{ flex: 1, paddingRight: 8 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 6 }}>
                          <Text style={styles.heroStoreName} numberOfLines={2}>
                            {currentMerchantStore?.name}
                          </Text>
                          <View style={styles.verifiedPartnerBadge}>
                            <Text style={styles.verifiedPartnerText}>✓ VERIFIED</Text>
                          </View>
                        </View>

                        <View style={styles.heroStoreMetaRow}>
                          <View style={styles.heroCategoryPill}>
                            <Text style={styles.heroCategoryText}>
                              {currentMerchantStore?.categoryLabel || 'Gourmet Groceries & Deli'}
                            </Text>
                          </View>
                          <Text style={styles.heroStoreRatingText}>
                            ★ {currentMerchantStore?.rating || '5.0'} ({currentMerchantStore?.reviewCount || '100+'} reviews)
                          </Text>
                        </View>
                      </View>

                      {/* Edit Store Info Button */}
                      <TouchableOpacity
                        style={styles.editStoreInfoBtn}
                        onPress={handleOpenEditStoreDetailsModal}
                        activeOpacity={0.85}
                      >
                        <Text style={styles.editStoreInfoBtnText}>✏️ Edit Details</Text>
                      </TouchableOpacity>
                    </View>

                    {/* Address & Store Phone */}
                    <View style={styles.heroStoreLocationBox}>
                      <Text style={styles.heroStoreLocationText} numberOfLines={2}>
                        📍 {currentMerchantStore?.address || 'Nigeria'}
                      </Text>
                      {currentMerchantStore?.phone ? (
                        <Text style={styles.heroStorePhoneText}>
                          📞 Official Order Line: {currentMerchantStore?.phone}
                        </Text>
                      ) : null}
                    </View>

                    {currentMerchantStore?.description ? (
                      <Text style={styles.heroStoreDescription} numberOfLines={3}>
                        {currentMerchantStore?.description}
                      </Text>
                    ) : null}
                  </View>
                </View>

                {/* --- FRIENDLY INTERACTIVE STATUS CONTROLLER CARD --- */}
                <View style={[styles.friendlyStatusCard, storeOpenStatus ? styles.statusCardLive : styles.statusCardPaused]}>
                  <View style={{ flex: 1, paddingRight: 12 }}>
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <Text style={{ fontSize: 20, marginRight: 8 }}>{storeOpenStatus ? '🟢' : '⏸️'}</Text>
                      <Text style={styles.friendlyStatusTitle}>
                        {storeOpenStatus ? 'Store is Live & Accepting Orders' : 'Store is Paused / Taking a Break'}
                      </Text>
                    </View>
                    <Text style={styles.friendlyStatusSub}>
                      {storeOpenStatus
                        ? 'Customers in your area can browse your catalog and checkout for rapid dispatch.'
                        : 'Your products remain saved, but customers will be informed that the store is currently closed.'}
                    </Text>
                  </View>

                  <TouchableOpacity
                    style={[styles.friendlyStatusToggleBtn, storeOpenStatus ? styles.toggleBtnLive : styles.toggleBtnPaused]}
                    onPress={handleToggleStoreLive}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.friendlyStatusToggleText}>
                      {storeOpenStatus ? 'Pause Store' : 'Go Live Now ➔'}
                    </Text>
                  </TouchableOpacity>
                </View>

                {/* --- 4 OPERATIONAL HIGHLIGHT CARDS (2x2 GRID) --- */}
                <Text style={styles.sectionHeaderTitle}>Store Highlights & Operations</Text>
                <View style={styles.storeMetricsGrid}>
                  {/* Hours Card */}
                  <TouchableOpacity
                    style={styles.metricGridCard}
                    onPress={openTimingModal}
                    activeOpacity={0.85}
                  >
                    <View style={styles.metricCardTop}>
                      <Text style={{ fontSize: 22 }}>⏰</Text>
                      <Text style={styles.metricCardActionText}>Adjust ➔</Text>
                    </View>
                    <Text style={styles.metricCardLabel}>Operating Schedule</Text>
                    <Text style={styles.metricCardValue} numberOfLines={1}>
                      {storeTiming.is24Hours ? '⚡ 24 Hours Daily' : `${storeTiming.openTime} – ${storeTiming.closeTime}`}
                    </Text>
                    <Text style={styles.metricCardNote}>{storeTiming.operatingDays}</Text>
                  </TouchableOpacity>

                  {/* Catalog Card */}
                  <TouchableOpacity
                    style={styles.metricGridCard}
                    onPress={() => setMerchantTab('products')}
                    activeOpacity={0.85}
                  >
                    <View style={styles.metricCardTop}>
                      <Text style={{ fontSize: 22 }}>📦</Text>
                      <Text style={styles.metricCardActionText}>Stock ➔</Text>
                    </View>
                    <Text style={styles.metricCardLabel}>Catalog Products</Text>
                    <Text style={styles.metricCardValue}>
                      {currentMerchantStore?.products?.length || 0} Listed Items
                    </Text>
                    <Text style={styles.metricCardNote}>Tap to manage inventory</Text>
                  </TouchableOpacity>

                  {/* Delivery Logistics */}
                  <View style={styles.metricGridCard}>
                    <View style={styles.metricCardTop}>
                      <Text style={{ fontSize: 22 }}>🚚</Text>
                      <View style={styles.topMerchantBadge}>
                        <Text style={{ fontSize: 9.5, color: COLORS.emeraldDeep, fontWeight: '800' }}>AUTOMATED</Text>
                      </View>
                    </View>
                    <Text style={styles.metricCardLabel}>Rider Dispatch</Text>
                    <Text style={styles.metricCardValue}>
                      {currentMerchantStore?.deliveryTime || '15-20 min'}
                    </Text>
                    <Text style={styles.metricCardNote}>Calculated by distance</Text>
                  </View>

                  {/* Reputation Card */}
                  <View style={styles.metricGridCard}>
                    <View style={styles.metricCardTop}>
                      <Text style={{ fontSize: 22 }}>⭐</Text>
                      <View style={styles.topMerchantBadge}>
                        <Text style={{ fontSize: 10, color: COLORS.emeraldDeep, fontWeight: '800' }}>VERIFIED</Text>
                      </View>
                    </View>
                    <Text style={styles.metricCardLabel}>Customer Rating</Text>
                    <Text style={styles.metricCardValue}>
                      {currentMerchantStore?.rating || '5.0'} ★ Luxe
                    </Text>
                    <Text style={styles.metricCardNote}>100% Verified Quality</Text>
                  </View>
                </View>

                {/* --- QUICK ACTION MANAGEMENT TILES --- */}
                <View style={styles.quickActionTileList}>
                  <TouchableOpacity
                    style={styles.quickActionTile}
                    onPress={handleOpenStoreImageModal}
                    activeOpacity={0.85}
                  >
                    <View style={styles.quickActionTileIconWrap}>
                      <Text style={{ fontSize: 22 }}>🖼️</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.quickActionTileTitle}>Update Store Cover Photo</Text>
                      <Text style={styles.quickActionTileSub}>Pick from luxury supermarket presets or upload your photo</Text>
                    </View>
                    <Text style={styles.quickActionTileArrow}>➔</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionTile}
                    onPress={handleOpenEditStoreDetailsModal}
                    activeOpacity={0.85}
                  >
                    <View style={styles.quickActionTileIconWrap}>
                      <Text style={{ fontSize: 22 }}>🏪</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.quickActionTileTitle}>Edit Store Profile & Contact</Text>
                      <Text style={styles.quickActionTileSub}>Modify your store name, business address, and phone number</Text>
                    </View>
                    <Text style={styles.quickActionTileArrow}>➔</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.quickActionTile}
                    onPress={openTimingModal}
                    activeOpacity={0.85}
                  >
                    <View style={styles.quickActionTileIconWrap}>
                      <Text style={{ fontSize: 22 }}>⏰</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.quickActionTileTitle}>Set Daily Opening & 24h Schedule</Text>
                      <Text style={styles.quickActionTileSub}>Configure regular hours or run 24-hours continuously</Text>
                    </View>
                    <Text style={styles.quickActionTileArrow}>➔</Text>
                  </TouchableOpacity>
                </View>

                {/* --- CREATE / REGISTER NEW STORE PROMPT --- */}
                <View style={styles.createStorePromptCard}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <View style={styles.createStoreIconWrap}>
                      <Text style={{ fontSize: 26 }}>🏬</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 12 }}>
                      <Text style={styles.createStorePromptTitle}>Open a New Branch on GETIT</Text>
                      <Text style={styles.createStorePromptSub}>
                        Register a second store or supermarket branch anywhere in Nigeria.
                      </Text>
                    </View>
                  </View>
                  <TouchableOpacity
                    style={styles.createStoreLaunchBtn}
                    onPress={() => setCreateStoreModalVisible(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.createStoreLaunchBtnText}>+ Register & Launch New Branch ✨</Text>
                  </TouchableOpacity>
                </View>

                {/* --- SWITCH STORE BRANCH CARD --- */}
                {merchantOwnedStores.length > 1 && (
                  <View style={styles.switchBranchCard}>
                    <Text style={styles.financeCardTitle}>Select Store Branch to Manage</Text>
                    <Text style={{ fontSize: 11.5, color: COLORS.textMuted, marginBottom: 12 }}>
                      Tap any branch below to view its live stock and incoming orders:
                    </Text>
                    {merchantOwnedStores.map((st, stIdx) => {
                      const isSelected = st.id === (merchantStoreId || currentMerchantStore?.id);
                      return (
                        <TouchableOpacity
                          key={`merchant-branch-${st.id}-${stIdx}`}
                          style={[styles.branchItem, isSelected && styles.branchItemActive]}
                          onPress={() => handleSelectMerchantBranch(st.id)}
                          activeOpacity={0.85}
                        >
                          <Image
                            source={{ uri: st.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=400&q=80' }}
                            style={styles.branchImageThumb}
                          />
                          <View style={{ flex: 1 }}>
                            <Text style={[styles.branchName, isSelected && styles.branchNameActive]} numberOfLines={1}>
                              {st.name}
                            </Text>
                            <Text style={styles.branchSub} numberOfLines={1}>
                              {st.categoryLabel} • {st.address}
                            </Text>
                          </View>
                          {isSelected ? (
                            <View style={styles.activeBranchCheckBadge}>
                              <Text style={styles.activeBranchCheckText}>ACTIVE</Text>
                            </View>
                          ) : null}
                        </TouchableOpacity>
                      );
                    })}
                  </View>
                )}

                {/* Switch to Customer View Button */}
                <TouchableOpacity
                  style={[styles.merchantSwitchBtn, { marginTop: 14 }]}
                  onPress={() => setAppMode('customer')}
                  activeOpacity={0.85}
                >
                  <Text style={styles.merchantSwitchBtnText}>
                    🛒 Switch to Customer Shopping Mode ➔
                  </Text>
                </TouchableOpacity>
              </ScrollView>
            )}

            {/* Merchant Bottom Navigation Bar */}
            <View style={styles.merchantBottomNav}>
              <TouchableOpacity
                style={styles.merchantNavItem}
                onPress={() => setMerchantTab('orders')}
              >
                <View>
                  <Text style={[styles.merchantNavIcon, merchantTab === 'orders' && styles.merchantNavIconActive]}>
                    🔔
                  </Text>
                  {merchantOrders.filter((o) => o.status === 'New Order').length > 0 && (
                    <View style={styles.merchantUnreadDot}>
                      <Text style={styles.merchantUnreadDotText}>
                        {merchantOrders.filter((o) => o.status === 'New Order').length}
                      </Text>
                    </View>
                  )}
                </View>
                <Text style={[styles.merchantNavText, merchantTab === 'orders' && styles.merchantNavTextActive]}>
                  Orders
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.merchantNavItem}
                onPress={() => setMerchantTab('inventory')}
              >
                <Text style={[styles.merchantNavIcon, merchantTab === 'inventory' && styles.merchantNavIconActive]}>
                  📦
                </Text>
                <Text style={[styles.merchantNavText, merchantTab === 'inventory' && styles.merchantNavTextActive]}>
                  Catalog
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.merchantNavItem}
                onPress={() => setMerchantTab('finances')}
              >
                <Text style={[styles.merchantNavIcon, merchantTab === 'finances' && styles.merchantNavIconActive]}>
                  💰
                </Text>
                <Text style={[styles.merchantNavText, merchantTab === 'finances' && styles.merchantNavTextActive]}>
                  Finances
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.merchantNavItem}
                onPress={() => setMerchantTab('store')}
              >
                <Text style={[styles.merchantNavIcon, merchantTab === 'store' && styles.merchantNavIconActive]}>
                  🏪
                </Text>
                <Text style={[styles.merchantNavText, merchantTab === 'store' && styles.merchantNavTextActive]}>
                  Store Profile
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </View>
      )}

      {/* --- ENHANCED ADD PRODUCT & INVENTORY ONBOARDING MODAL --- */}
      <Modal
        visible={addProductModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setAddProductModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={() => setAddProductModalVisible(false)}
            >
              <Text style={styles.modalBackBtnText}>✕ Close</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.modalHeaderTitle}>Add Items to Inventory</Text>
              <Text style={{ fontSize: 10, color: COLORS.roseGoldLight, fontWeight: '700' }}>
                {currentMerchantStore?.name}
              </Text>
            </View>
            <View style={{ width: 60 }} />
          </View>

          {/* Modal Tabs Header: Suggested vs Custom */}
          <View style={styles.addModalTabContainer}>
            <TouchableOpacity
              style={[
                styles.addModalTabBtn,
                addModalTab === 'suggested' && styles.addModalTabBtnActive,
              ]}
              onPress={() => setAddModalTab('suggested')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.addModalTabText,
                  addModalTab === 'suggested' && styles.addModalTabTextActive,
                ]}
              >
                ⚡ Suggested Catalog ({NIGERIAN_GROCERIES_CATALOG.length})
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[
                styles.addModalTabBtn,
                addModalTab === 'custom' && styles.addModalTabBtnActive,
              ]}
              onPress={() => setAddModalTab('custom')}
              activeOpacity={0.8}
            >
              <Text
                style={[
                  styles.addModalTabText,
                  addModalTab === 'custom' && styles.addModalTabTextActive,
                ]}
              >
                📷 Custom Product
              </Text>
            </TouchableOpacity>
          </View>

          {/* TAB 1: SUGGESTED NIGERIAN GROCERIES (1-TAP QUICK ADD) */}
          {addModalTab === 'suggested' && (
            <View style={{ flex: 1, backgroundColor: COLORS.beigeBg }}>
              {/* Search Bar */}
              <View style={styles.addSearchWrap}>
                <TextInput
                  style={styles.addSearchInput}
                  placeholder="🔍 Search groceries, drinks, biscuits, skincare, panadol, indomie..."
                  placeholderTextColor="#94A3B8"
                  value={suggestedSearch}
                  onChangeText={setSuggestedSearch}
                />
                {suggestedSearch.length > 0 && (
                  <TouchableOpacity
                    style={styles.addSearchClearBtn}
                    onPress={() => setSuggestedSearch('')}
                  >
                    <Text style={{ fontSize: 12, color: '#64748B', fontWeight: '800' }}>✕</Text>
                  </TouchableOpacity>
                )}
              </View>

              {/* Category Filter Pills */}
              <View style={{ height: 44 }}>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  contentContainerStyle={styles.addCategoryScroll}
                >
                  {[
                    { id: 'All', label: '🛒 All Products (General Store)' },
                    { id: 'Pharmacy', label: '💊 Pharmacy & Healthcare' },
                    { id: 'Pantry', label: '🍚 Groceries & Pantry' },
                    { id: 'Drinks', label: '🥤 Drinks & Beverages' },
                    { id: 'Biscuits', label: '🍪 Biscuits & Snacks' },
                    { id: 'Skincare', label: '🧴 Skincare & Personal Care' },
                    { id: 'Baby Care', label: '👶 Baby Care & Nutrition' },
                    { id: 'Household', label: '🧼 Household & Cleaning' },
                  ].map((cat) => {
                    const active = suggestedCategoryFilter === cat.id;
                    return (
                      <TouchableOpacity
                        key={cat.id}
                        style={[
                          styles.addCatPill,
                          active && styles.addCatPillActive,
                        ]}
                        onPress={() => setSuggestedCategoryFilter(cat.id)}
                      >
                        <Text
                          style={[
                            styles.addCatPillText,
                            active && styles.addCatPillTextActive,
                          ]}
                        >
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>

              {/* Suggested Groceries List (High Performance Virtualized FlatList) */}
              <FlatList
                data={filteredSuggestedProducts}
                keyExtractor={(item) => item.id}
                style={{ flex: 1 }}
                contentContainerStyle={{ padding: 14, paddingBottom: 60 }}
                keyboardShouldPersistTaps="handled"
                initialNumToRender={10}
                maxToRenderPerBatch={10}
                windowSize={5}
                removeClippedSubviews={true}
                ListHeaderComponent={
                  <Text style={styles.addListHeaderNote}>
                    {suggestedCategoryFilter === 'All'
                      ? 'Showing all everyday supermarket items (Pantry, Drinks, Snacks, Skincare, Baby & Household). For medicines and health supplies, select the Pharmacy & Healthcare category.'
                      : `Showing items in ${suggestedCategoryFilter}. Tap the '+' sign to add any item to your shop with 1 click.`}
                  </Text>
                }
                ListEmptyComponent={
                  <View style={{ alignItems: 'center', padding: 36 }}>
                    <Text style={{ fontSize: 32, marginBottom: 8 }}>🔍</Text>
                    <Text style={{ fontSize: 15, fontWeight: '700', color: COLORS.textDark }}>No matching products</Text>
                    <Text style={{ fontSize: 13, color: COLORS.textMuted, marginTop: 4, textAlign: 'center' }}>
                      Try a different search term or category filter.
                    </Text>
                  </View>
                }
                renderItem={({ item }) => {
                  const isAdded = !!addedItemsTracker[item.id];
                  const currentPriceValue =
                    adjustedPrices[item.id] !== undefined
                      ? String(adjustedPrices[item.id])
                      : String(item.suggestedPrice);
                  const imgSource = getProductImageSource(item.imageUrl);

                  return (
                    <View key={item.id} style={styles.suggestedCard}>
                      <View style={styles.suggestedCardTopRow}>
                        <View style={styles.suggestedIconWrap}>
                          {imgSource ? (
                            <Image
                              source={imgSource}
                              style={{ width: 44, height: 44, borderRadius: 8 }}
                              resizeMode="contain"
                            />
                          ) : (
                            <Text style={{ fontSize: 26 }}>{item.icon}</Text>
                          )}
                        </View>
                        <View style={{ flex: 1, marginLeft: 10 }}>
                          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Text style={styles.suggestedCategoryTag}>{item.category.toUpperCase()}</Text>
                            <Text style={styles.suggestedRangeTag}>Range: {item.priceRange}</Text>
                          </View>
                          <Text style={styles.suggestedTitle}>{item.name}</Text>
                          <Text style={styles.suggestedDesc} numberOfLines={1}>
                            {item.description}
                          </Text>
                        </View>
                      </View>

                      {/* Price Editor & Add Button Row */}
                      <View style={styles.suggestedBottomRow}>
                        <View style={styles.suggestedPriceBox}>
                          <Text style={styles.suggestedPricePrefix}>₦</Text>
                          <TextInput
                            style={styles.suggestedPriceInput}
                            keyboardType="numeric"
                            value={currentPriceValue}
                            onChangeText={(txt) => {
                              const cleaned = txt.replace(/[^0-9]/g, '');
                              setAdjustedPrices((prev) => ({
                                ...prev,
                                [item.id]: cleaned,
                              }));
                            }}
                            placeholder="Price"
                            placeholderTextColor="#94A3B8"
                          />
                        </View>

                        <TouchableOpacity
                          style={[
                            styles.suggestedAddBtn,
                            isAdded && styles.suggestedAddBtnDone,
                          ]}
                          onPress={() => handleAddSuggestedProduct(item)}
                          activeOpacity={0.7}
                        >
                          <Text style={styles.suggestedAddBtnText}>
                            {isAdded ? '✓ Added to Store' : '+ Add to Store'}
                          </Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  );
                }}
              />
            </View>
          )}

          {/* TAB 2: CUSTOM PRODUCT WITH IMAGE UPLOAD */}
          {addModalTab === 'custom' && (
            <ScrollView
              style={{ flex: 1, backgroundColor: COLORS.beigeBg }}
              contentContainerStyle={{ padding: 16, paddingBottom: 80 }}
              keyboardShouldPersistTaps="handled"
            >
              <View style={styles.customHeroCard}>
                <Text style={styles.customHeroTitle}>Add Custom Store Product</Text>
                <Text style={styles.customHeroSub}>
                  Upload a photo of your product, choose its category, and set your custom selling price.
                </Text>

                {/* Product Photo Upload Section */}
                <Text style={styles.customFieldLabel}>PRODUCT PHOTO</Text>
                {customProductImage ? (
                  <View style={styles.customImagePreviewWrap}>
                    <Image
                      source={{ uri: customProductImage }}
                      style={styles.customImagePreview}
                      resizeMode="cover"
                    />
                    <TouchableOpacity
                      style={styles.customRemoveImageBtn}
                      onPress={() => setCustomProductImage(null)}
                    >
                      <Text style={styles.customRemoveImageText}>✕ Remove Photo</Text>
                    </TouchableOpacity>
                  </View>
                ) : (
                  <TouchableOpacity
                    style={styles.customUploadBox}
                    onPress={handlePickCustomProductImage}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 32, marginBottom: 6 }}>📷</Text>
                    <Text style={styles.customUploadTitle}>Tap to Upload Product Photo</Text>
                    <Text style={styles.customUploadSub}>
                      JPG, PNG, or WEBP from phone gallery or camera
                    </Text>
                  </TouchableOpacity>
                )}

                {/* Fallback Icon Selector */}
                {!customProductImage && (
                  <View style={{ marginTop: 12 }}>
                    <Text style={styles.customFieldSubLabel}>Or choose an emoji icon:</Text>
                    <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 6 }}>
                      {['🛍️', '🥩', '🥖', '🍾', '🍯', '🥑', '🍅', '🧀', '🫒', '🐟', '🍉', '☕'].map((ico) => (
                        <TouchableOpacity
                          key={ico}
                          style={[
                            styles.customIconCircle,
                            customProductIcon === ico && styles.customIconCircleActive,
                          ]}
                          onPress={() => setCustomProductIcon(ico)}
                        >
                          <Text style={{ fontSize: 22 }}>{ico}</Text>
                        </TouchableOpacity>
                      ))}
                    </ScrollView>
                  </View>
                )}

                {/* Product Name */}
                <Text style={[styles.customFieldLabel, { marginTop: 14 }]}>PRODUCT NAME</Text>
                <TextInput
                  style={styles.customTextInput}
                  placeholder="e.g. Fresh Goat Meat (500g Cut)"
                  placeholderTextColor="#94A3B8"
                  value={customProductName}
                  onChangeText={setCustomProductName}
                />

                {/* Price */}
                <Text style={[styles.customFieldLabel, { marginTop: 14 }]}>SELLING PRICE (₦ NAIRA)</Text>
                <TextInput
                  style={styles.customTextInput}
                  placeholder="e.g. 4500"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={customProductPrice}
                  onChangeText={setCustomProductPrice}
                />

                {/* Category Selection */}
                <Text style={[styles.customFieldLabel, { marginTop: 14 }]}>CATEGORY</Text>
                <View style={styles.customCatChoicesRow}>
                  {['Produce', 'Pantry', 'Drinks', 'Biscuits', 'Household', 'Deli/Bakery'].map((cat) => (
                    <TouchableOpacity
                      key={cat}
                      style={[
                        styles.customCatChip,
                        customProductCategory === cat && styles.customCatChipActive,
                      ]}
                      onPress={() => setCustomProductCategory(cat)}
                    >
                      <Text
                        style={[
                          styles.customCatChipText,
                          customProductCategory === cat && styles.customCatChipTextActive,
                        ]}
                      >
                        {cat}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                {/* Submit Button */}
                <TouchableOpacity
                  style={styles.customSubmitBtn}
                  onPress={handleAddCustomProduct}
                  activeOpacity={0.85}
                >
                  <Text style={styles.customSubmitBtnText}>Publish Custom Product to Store ➔</Text>
                </TouchableOpacity>
              </View>
            </ScrollView>
          )}
        </SafeAreaView>
      </Modal>

      {/* --- BULK INVENTORY & CATALOG IMPORT MODAL FOR MERCHANTS --- */}
      <Modal
        visible={bulkImportModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setBulkImportModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={() => setBulkImportModalVisible(false)}
            >
              <Text style={styles.modalBackBtnText}>✕ Close</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.modalHeaderTitle}>Bulk Catalog Import</Text>
              <Text style={{ fontSize: 10, color: COLORS.roseGoldLight, fontWeight: '700' }}>
                {currentMerchantStore?.name}
              </Text>
            </View>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            style={{ flex: 1, backgroundColor: COLORS.beigeBg }}
            contentContainerStyle={{ padding: 16, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Top Info Banner */}
            <View style={styles.bulkModalHeroBanner}>
              <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                <Text style={{ fontSize: 26, marginRight: 10 }}>⚡</Text>
                <View style={{ flex: 1 }}>
                  <Text style={styles.bulkModalHeroTitle}>Rapid POS & File Onboarding</Text>
                  <Text style={styles.bulkModalHeroSub}>
                    Import all your products and prices in 1 second. Export from your shop POS or spreadsheet as .srt, .csv, or plain text.
                  </Text>
                </View>
              </View>

              <View style={styles.bulkSupportedFormatsRow}>
                <View style={styles.formatTag}>
                  <Text style={styles.formatTagText}>📁 .SRT (Subtitle/Index)</Text>
                </View>
                <View style={styles.formatTag}>
                  <Text style={styles.formatTagText}>📊 .CSV / .TSV</Text>
                </View>
                <View style={styles.formatTag}>
                  <Text style={styles.formatTagText}>🧾 POS Lines</Text>
                </View>
              </View>
            </View>

            {/* Three Mode Tabs: Upload File | Paste Text | Sample Templates */}
            <View style={styles.bulkTabsNav}>
              <TouchableOpacity
                style={[
                  styles.bulkTabBtn,
                  bulkImportActiveTab === 'upload' && styles.bulkTabBtnActive,
                ]}
                onPress={() => setBulkImportActiveTab('upload')}
              >
                <Text
                  style={[
                    styles.bulkTabBtnText,
                    bulkImportActiveTab === 'upload' && styles.bulkTabBtnTextActive,
                  ]}
                >
                  📁 Upload File
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bulkTabBtn,
                  bulkImportActiveTab === 'paste' && styles.bulkTabBtnActive,
                ]}
                onPress={() => setBulkImportActiveTab('paste')}
              >
                <Text
                  style={[
                    styles.bulkTabBtnText,
                    bulkImportActiveTab === 'paste' && styles.bulkTabBtnActive,
                  ]}
                >
                  📋 Paste POS Text
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[
                  styles.bulkTabBtn,
                  bulkImportActiveTab === 'template' && styles.bulkTabBtnActive,
                ]}
                onPress={() => setBulkImportActiveTab('template')}
              >
                <Text
                  style={[
                    styles.bulkTabBtnText,
                    bulkImportActiveTab === 'template' && styles.bulkTabBtnTextActive,
                  ]}
                >
                  💡 Templates
                </Text>
              </TouchableOpacity>
            </View>

            {/* TAB 1: UPLOAD FILE */}
            {bulkImportActiveTab === 'upload' && (
              <View style={styles.bulkTabContentBox}>
                <TouchableOpacity
                  style={styles.bulkUploadDropzone}
                  onPress={handlePickInventoryFile}
                  disabled={isParsingFile}
                  activeOpacity={0.8}
                >
                  <View style={styles.bulkUploadIconCircle}>
                    {isParsingFile ? (
                      <ActivityIndicator size="small" color="#FFFFFF" />
                    ) : (
                      <Text style={{ fontSize: 30 }}>📂</Text>
                    )}
                  </View>
                  <Text style={styles.bulkUploadDropzoneTitle}>
                    {isParsingFile ? 'Reading & Parsing File...' : 'Tap to Select Inventory File'}
                  </Text>
                  <Text style={styles.bulkUploadDropzoneSub}>
                    Supports .srt, .csv, .tsv, .xlsx, or .txt POS exports from your computer/device
                  </Text>
                  <View style={styles.bulkUploadSelectBtn}>
                    <Text style={styles.bulkUploadSelectBtnText}>Browse Files ➔</Text>
                  </View>
                </TouchableOpacity>

                {bulkSelectedFileName ? (
                  <View style={styles.bulkSelectedFileCard}>
                    <Text style={{ fontSize: 18, marginRight: 8 }}>📄</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bulkSelectedFileName} numberOfLines={1}>
                        {bulkSelectedFileName}
                      </Text>
                      <Text style={styles.bulkSelectedFileStatus}>
                        ✓ Parsed {bulkParsedProducts.length} products successfully
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => {
                        setBulkSelectedFileName('');
                        setBulkImportText('');
                        setBulkParsedProducts([]);
                      }}
                      hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                    >
                      <Text style={{ color: '#DC2626', fontWeight: '800', fontSize: 13 }}>✕</Text>
                    </TouchableOpacity>
                  </View>
                ) : null}
              </View>
            )}

            {/* TAB 2: PASTE TEXT */}
            {bulkImportActiveTab === 'paste' && (
              <View style={styles.bulkTabContentBox}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
                  <Text style={styles.bulkInputSectionLabel}>
                    PASTE PRODUCTS & PRICES (Auto-Parsed in Real-Time):
                  </Text>
                  {bulkImportText.length > 0 && (
                    <TouchableOpacity
                      onPress={() => {
                        setBulkImportText('');
                        setBulkParsedProducts([]);
                      }}
                    >
                      <Text style={{ fontSize: 11, color: COLORS.roseGold, fontWeight: '700' }}>Clear</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <TextInput
                  style={styles.bulkPasteInput}
                  multiline
                  numberOfLines={7}
                  placeholder={`Paste from Excel or POS, e.g.:\nItem Name, Price, Category\n\nOr SRT format:\n1\nMoët & Chandon Brut\n₦48,500\nCellar`}
                  placeholderTextColor="#94A3B8"
                  value={bulkImportText}
                  onChangeText={handleBulkTextChange}
                  textAlignVertical="top"
                />
              </View>
            )}

            {/* TAB 3: TEMPLATES */}
            {bulkImportActiveTab === 'template' && (
              <View style={styles.bulkTabContentBox}>
                <Text style={styles.bulkInputSectionLabel}>
                  TAP TO LOAD TEST / INDUSTRY SAMPLES:
                </Text>
                <View style={{ gap: 8, marginTop: 4 }}>
                  <TouchableOpacity
                    style={styles.bulkTemplateCard}
                    onPress={() => handleLoadTemplate('supermarket')}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 24, marginRight: 10 }}>🛒</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bulkTemplateCardTitle}>Gourmet Supermarket (SRT Format)</Text>
                      <Text style={styles.bulkTemplateCardSub}>
                        Truffle oil, Wagyu beef, parmigiano, sourdough bread, salmon (7 items)
                      </Text>
                    </View>
                    <Text style={styles.bulkTemplateLoadArrow}>Load ➔</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.bulkTemplateCard}
                    onPress={() => handleLoadTemplate('pharmacy')}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 24, marginRight: 10 }}>💊</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bulkTemplateCardTitle}>Pharmacy & Health (CSV Format)</Text>
                      <Text style={styles.bulkTemplateCardSub}>
                        Paracetamol, Vitamin C, Fish Oil, Thermometer, Cleanser (7 items)
                      </Text>
                    </View>
                    <Text style={styles.bulkTemplateLoadArrow}>Load ➔</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.bulkTemplateCard}
                    onPress={() => handleLoadTemplate('cellar')}
                    activeOpacity={0.8}
                  >
                    <Text style={{ fontSize: 24, marginRight: 10 }}>🍾</Text>
                    <View style={{ flex: 1 }}>
                      <Text style={styles.bulkTemplateCardTitle}>Wine, Champagne & Spirits (CSV Format)</Text>
                      <Text style={styles.bulkTemplateCardSub}>
                        Moët, Veuve Clicquot, Hennessy, Blue Label, Dom Pérignon (6 items)
                      </Text>
                    </View>
                    <Text style={styles.bulkTemplateLoadArrow}>Load ➔</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            {/* LIVE PREVIEW OF RECOGNIZED PRODUCTS */}
            <View style={styles.bulkPreviewSection}>
              <View style={styles.bulkPreviewHeaderRow}>
                <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                  <Text style={styles.bulkPreviewTitle}>Recognized Products</Text>
                  <View style={styles.bulkPreviewCountBadge}>
                    <Text style={styles.bulkPreviewCountText}>{bulkParsedProducts.length}</Text>
                  </View>
                </View>
                {bulkParsedProducts.length > 0 && (
                  <Text style={styles.bulkPreviewStatusReady}>✓ Ready to Publish</Text>
                )}
              </View>

              {bulkParsedProducts.length === 0 ? (
                <View style={styles.bulkPreviewEmptyBox}>
                  <Text style={{ fontSize: 24, marginBottom: 4 }}>📋</Text>
                  <Text style={styles.bulkPreviewEmptyTitle}>No Products Recognized Yet</Text>
                  <Text style={styles.bulkPreviewEmptySub}>
                    Select a file in "Upload File", paste text in "Paste POS Text", or tap a template to auto-populate.
                  </Text>
                </View>
              ) : (
                <View style={{ gap: 8, marginTop: 8 }}>
                  {bulkParsedProducts.map((p, idx) => (
                    <View key={p.id || idx} style={styles.bulkPreviewItemCard}>
                      <Text style={{ fontSize: 22, marginRight: 10 }}>{p.icon || '🛍️'}</Text>
                      <View style={{ flex: 1, marginRight: 8 }}>
                        <Text style={styles.bulkPreviewItemName} numberOfLines={1}>
                          {p.name}
                        </Text>
                        <Text style={styles.bulkPreviewItemMeta}>
                          {p.category}
                        </Text>
                      </View>
                      <Text style={styles.bulkPreviewItemPrice}>{formatNaira(p.price)}</Text>
                      <TouchableOpacity
                        style={styles.bulkPreviewItemRemoveBtn}
                        onPress={() => handleRemoveBulkItem(idx)}
                        hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                      >
                        <Text style={{ color: '#EF4444', fontWeight: '800', fontSize: 13 }}>✕</Text>
                      </TouchableOpacity>
                    </View>
                  ))}
                </View>
              )}
            </View>

            {/* CONFIRM IMPORT BUTTON */}
            {bulkParsedProducts.length > 0 && (
              <TouchableOpacity
                style={[styles.primaryActionBtn, { marginTop: 20 }]}
                onPress={handleConfirmBulkImport}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>
                  Publish All {bulkParsedProducts.length} Products to Store Catalog ➔
                </Text>
              </TouchableOpacity>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- CREATE & LAUNCH NEW STORE MODAL --- */}
      <Modal
        visible={createStoreModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setCreateStoreModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={() => setCreateStoreModalVisible(false)}
            >
              <Text style={styles.modalBackBtnText}>✕ Close</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.modalHeaderTitle}>🏬 Register New Store</Text>
              <Text style={styles.modalHeaderSubtitle}>Live immediately for all buyers across Nigeria</Text>
            </View>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            style={{ flex: 1, backgroundColor: COLORS.beigeBg }}
            contentContainerStyle={{ padding: 18, paddingBottom: 90 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero Card */}
            <View style={styles.customHeroCard}>
              <Text style={{ fontSize: 26, marginBottom: 4 }}>🏪 ✨</Text>
              <Text style={styles.customHeroTitle}>Create Your Storefront</Text>
              <Text style={styles.customHeroSub}>
                Set up your store identity, pick your neighborhood or city, and start selling groceries, fresh foods, or provisions across Nigeria.
              </Text>
            </View>

            {/* Store Name Input */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>STORE NAME *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Basit Gourmet Market, Maitama Provisions"
                placeholderTextColor="#94A3B8"
                value={newStoreName}
                onChangeText={setNewStoreName}
              />
            </View>

            {/* Category Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>STORE CATEGORY *</Text>
              <View style={styles.categoryPillWrap}>
                {[
                  { id: 'Gourmet Marts', icon: '🛒', label: 'Gourmet Mart' },
                  { id: 'Organic & Fresh', icon: '🌿', label: 'Organic & Produce' },
                  { id: 'Artisan Bakery', icon: '🥖', label: 'Artisan Bakery' },
                  { id: 'Pantry & Cellar', icon: '🍷', label: 'Pantry & Cellar' },
                  { id: 'Local Specialties', icon: '🌾', label: 'Local Staples' },
                  { id: 'Pharmacy & Health', icon: '💊', label: 'Pharmacy & Health' },
                ].map((cat) => {
                  const active = newStoreCategory === cat.id;
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      style={[styles.customCatPill, active && styles.customCatPillActive]}
                      onPress={() => setNewStoreCategory(cat.id)}
                    >
                      <Text style={{ fontSize: 13, marginRight: 6 }}>{cat.icon}</Text>
                      <Text style={[styles.customCatPillText, active && styles.customCatPillTextActive]}>
                        {cat.label}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* District Location Selection */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>ABUJA DISTRICT / ZONE *</Text>
              <View style={styles.categoryPillWrap}>
                {[
                  'Maitama District, Abuja',
                  'Wuse 2, Abuja',
                  'Asokoro Presidential Wing, Abuja',
                  'Jabi District, Abuja',
                  'Gwarinpa Estate, Abuja',
                  'Garki District, Abuja',
                  'Katampe, Abuja',
                  'Guzape District, Abuja',
                ].map((dist) => {
                  const active = newStoreDistrict === dist;
                  const shortName = dist
                    .split(',')[0]
                    .replace(' Presidential Wing', '')
                    .replace(' District', '')
                    .replace(' Estate', '');
                  return (
                    <TouchableOpacity
                      key={dist}
                      style={[styles.customCatPill, active && styles.customCatPillActive]}
                      onPress={() => setNewStoreDistrict(dist)}
                    >
                      <Text style={{ fontSize: 12, marginRight: 4 }}>📍</Text>
                      <Text style={[styles.customCatPillText, active && styles.customCatPillTextActive]}>
                        {shortName}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* Street Address */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>PHYSICAL STREET ADDRESS / LANDMARK *</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. Plot 14 Gana Street, Opposite Transcorp"
                placeholderTextColor="#94A3B8"
                value={newStoreAddress}
                onChangeText={setNewStoreAddress}
              />
            </View>

            {/* Phone & Delivery Fee Row */}
            <View style={{ flexDirection: 'row', gap: 12 }}>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>MERCHANT PHONE *</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="+234 803 123 4567"
                  placeholderTextColor="#94A3B8"
                  keyboardType="phone-pad"
                  value={newStorePhone}
                  onChangeText={setNewStorePhone}
                />
              </View>
              <View style={[styles.formGroup, { flex: 1 }]}>
                <Text style={styles.formLabel}>DELIVERY FEE (₦)</Text>
                <TextInput
                  style={styles.formInput}
                  placeholder="1200"
                  placeholderTextColor="#94A3B8"
                  keyboardType="numeric"
                  value={newStoreDeliveryFee}
                  onChangeText={setNewStoreDeliveryFee}
                />
              </View>
            </View>

            {/* Estimated Delivery Time */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>ESTIMATED DELIVERY WINDOW</Text>
              <TextInput
                style={styles.formInput}
                placeholder="e.g. 15-25 min"
                placeholderTextColor="#94A3B8"
                value={newStoreDeliveryTime}
                onChangeText={setNewStoreDeliveryTime}
              />
            </View>

            {/* Store Description */}
            <View style={styles.formGroup}>
              <Text style={styles.formLabel}>STORE DESCRIPTION (OPTIONAL)</Text>
              <TextInput
                style={[styles.formInput, { height: 70, textAlignVertical: 'top' }]}
                placeholder="Brief tagline or description for buyers..."
                placeholderTextColor="#94A3B8"
                multiline
                value={newStoreDescription}
                onChangeText={setNewStoreDescription}
              />
            </View>

            {/* Submit Button */}
            <TouchableOpacity
              style={[styles.primaryActionBtn, { marginTop: 12 }]}
              onPress={handleCreateStore}
              disabled={isCreatingStore}
              activeOpacity={0.85}
            >
              {isCreatingStore ? (
                <ActivityIndicator color="#FFFFFF" />
              ) : (
                <Text style={styles.primaryActionBtnText}>
                  🚀 Launch Store on GETIT ➔
                </Text>
              )}
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- BUYER & SELLER ACCOUNT CREATION & SWITCHER MODAL --- */}
      <Modal
        visible={authModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setAuthModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={() => setAuthModalVisible(false)}
            >
              <Text style={styles.modalBackBtnText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Account Center</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Header intro card */}
            <View style={styles.authHeroCard}>
              <View style={styles.authHeroBadge}>
                <Text style={styles.authHeroBadgeText}>GETIT LUXURY CONCIERGE</Text>
              </View>
              <Text style={styles.authHeroTitle}>Personal & Merchant Profiles</Text>
              <Text style={styles.authHeroSub}>
                Seamlessly create and switch between your personal shopper (Buyer) account and your commercial store (Seller) dashboard.
              </Text>
            </View>

            {/* Current Active User Banner */}
            <View style={styles.authActiveUserBanner}>
              <View style={styles.authActiveUserAvatar}>
                <Text style={{ fontSize: 20 }}>
                  {currentUser?.role === 'seller' ? '🏪' : '🛍️'}
                </Text>
              </View>
              <View style={{ flex: 1, marginLeft: 12 }}>
                <Text style={styles.authActiveUserLabel}>ACTIVE SESSION</Text>
                <Text style={styles.authActiveUserName}>{currentUser?.fullName || 'Distinguished Client'}</Text>
                <Text style={styles.authActiveUserRole}>
                  {currentUser?.role === 'seller'
                    ? `Seller Account • ${currentUser?.businessName || 'Store Owner'}`
                    : 'Buyer Account • Nigeria Delivery'}
                </Text>
              </View>
            </View>

            {/* Role Switcher Tabs */}
            <View style={styles.authTabsWrap}>
              <TouchableOpacity
                style={[styles.authTabBtn, authTab === 'buyer' && styles.authTabBtnActive]}
                onPress={() => setAuthTab('buyer')}
                activeOpacity={0.8}
              >
                <Text style={[styles.authTabBtnText, authTab === 'buyer' && styles.authTabBtnTextActive]}>
                  🛍️ Buyer Account
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={[styles.authTabBtn, authTab === 'seller' && styles.authTabBtnActive]}
                onPress={() => setAuthTab('seller')}
                activeOpacity={0.8}
              >
                <Text style={[styles.authTabBtnText, authTab === 'seller' && styles.authTabBtnTextActive]}>
                  🏪 Seller / Merchant
                </Text>
              </TouchableOpacity>
            </View>

            {/* --- BUYER TAB CONTENT --- */}
            {authTab === 'buyer' ? (
              <View style={styles.authSectionBox}>
                <Text style={styles.authSectionTitle}>Create New Buyer Profile</Text>
                <Text style={styles.authSectionSub}>
                  Enter details to register a customer account for instant ordering across Nigeria.
                </Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>FULL NAME *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Fatima Bello"
                    placeholderTextColor="#94A3B8"
                    value={authName}
                    onChangeText={setAuthName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>EMAIL ADDRESS</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. fatima.bello@example.ng"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={authEmail}
                    onChangeText={setAuthEmail}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>PHONE NUMBER (WHATSAPP/CALLS)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. +234 802 345 6789"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={authPhone}
                    onChangeText={setAuthPhone}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>DELIVERY ADDRESS (NIGERIA)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Plot 14 Gana Street, Maitama"
                    placeholderTextColor="#94A3B8"
                    value={authAddress}
                    onChangeText={setAuthAddress}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, { marginTop: 10 }]}
                  onPress={handleRegisterBuyer}
                  activeOpacity={0.85}
                >
                  <Text style={styles.primaryActionBtnText}>
                    🛍️ Create Buyer Account & Start Shopping ➔
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              /* --- SELLER TAB CONTENT --- */
              <View style={styles.authSectionBox}>
                <Text style={styles.authSectionTitle}>Create Merchant Account & Launch Shop</Text>
                <Text style={styles.authSectionSub}>
                  Set up your business profile, open your store to buyers, and configure live shop hours.
                </Text>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>STORE / BUSINESS NAME *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Daily Fresh Organics"
                    placeholderTextColor="#94A3B8"
                    value={authBusinessName}
                    onChangeText={setAuthBusinessName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>OWNER / MANAGER FULL NAME *</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Chinedu Eze"
                    placeholderTextColor="#94A3B8"
                    value={authName}
                    onChangeText={setAuthName}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>BUSINESS EMAIL</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. chinedu@freshdaily.ng"
                    placeholderTextColor="#94A3B8"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    value={authEmail}
                    onChangeText={setAuthEmail}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>OFFICIAL PHONE / WHATSAPP</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. +234 803 555 7788"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                    value={authPhone}
                    onChangeText={setAuthPhone}
                  />
                </View>

                <View style={styles.formGroup}>
                  <Text style={styles.formLabel}>SHOP LOCATION / ADDRESS (NIGERIA)</Text>
                  <TextInput
                    style={styles.formInput}
                    placeholder="e.g. Adetokunbo Ademola Crescent, Wuse 2"
                    placeholderTextColor="#94A3B8"
                    value={authAddress}
                    onChangeText={setAuthAddress}
                  />
                </View>

                <TouchableOpacity
                  style={[styles.primaryActionBtn, { marginTop: 10, backgroundColor: COLORS.goldPrimary }]}
                  onPress={handleRegisterSeller}
                  activeOpacity={0.85}
                >
                  <Text style={[styles.primaryActionBtnText, { color: '#000000', fontWeight: '800' }]}>
                    🚀 Register Seller Account & Go Live ➔
                  </Text>
                </TouchableOpacity>
              </View>
            )}
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- SHOP OPERATING HOURS & 24H TIMING SCHEDULE MODAL --- */}
      <Modal
        visible={timingModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setTimingModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

          {/* Modal Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={() => setTimingModalVisible(false)}
            >
              <Text style={styles.modalBackBtnText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Shop Operating Hours</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Store Banner */}
            <View style={styles.timingStoreBanner}>
              <Text style={styles.timingStoreName}>{currentMerchantStore?.name}</Text>
              <Text style={styles.timingStoreSub}>📍 {currentMerchantStore?.address || 'Abuja, Nigeria'}</Text>
              
              <View style={styles.timingLivePillRow}>
                <TouchableOpacity
                  style={[
                    styles.storeStatusToggle,
                    storeOpenStatus ? styles.statusOpen : styles.statusPaused,
                    { alignSelf: 'flex-start', marginTop: 10 }
                  ]}
                  onPress={handleToggleStoreLive}
                  activeOpacity={0.8}
                >
                  <Text style={styles.storeStatusToggleText}>
                    {storeOpenStatus ? '🟢 STORE IS LIVE (ONLINE)' : '⏸ STORE IS PAUSED (OFFLINE)'}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>

            {/* 24 Hours Toggle Card */}
            <View style={[styles.timing24Card, tempIs24Hours && styles.timing24CardActive]}>
              <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                <View style={{ flex: 1, paddingRight: 14 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                    <Text style={{ fontSize: 22, marginRight: 8 }}>⚡</Text>
                    <Text style={styles.timing24Title}>Open 24 Hours</Text>
                  </View>
                  <Text style={styles.timing24Sub}>
                    Run continuously day and night. Your store will never automatically close and buyers can place orders 24/7.
                  </Text>
                </View>

                <TouchableOpacity
                  style={[styles.switchToggleBase, tempIs24Hours ? styles.switchToggleOn : styles.switchToggleOff]}
                  onPress={() => setTempIs24Hours(!tempIs24Hours)}
                  activeOpacity={0.8}
                >
                  <View style={[styles.switchToggleThumb, tempIs24Hours ? styles.switchThumbOn : styles.switchThumbOff]} />
                </TouchableOpacity>
              </View>

              {tempIs24Hours && (
                <View style={styles.timing24BadgeRow}>
                  <Text style={styles.timing24BadgeText}>
                    ✓ Always Open 24/7 Mode Enabled
                  </Text>
                </View>
              )}
            </View>

            {/* Custom Daily Hours Section (Visible if not 24h) */}
            {!tempIs24Hours && (
              <View style={styles.customTimingBox}>
                <Text style={styles.customTimingSectionHeader}>Daily Operating Schedule</Text>
                <Text style={styles.customTimingSectionSub}>
                  Specify your regular morning opening time and evening closing time.
                </Text>

                {/* Opening Time */}
                <View style={styles.timingFieldGroup}>
                  <Text style={styles.formLabel}>STORE OPENS AT</Text>
                  <TextInput
                    style={styles.formInput}
                    value={tempOpenTime}
                    onChangeText={setTempOpenTime}
                    placeholder="e.g. 08:00 AM"
                    placeholderTextColor="#94A3B8"
                  />
                  <View style={styles.timingPresetRow}>
                    {['06:00 AM', '07:00 AM', '08:00 AM', '09:00 AM', '10:00 AM'].map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.timingPresetPill, tempOpenTime === t && styles.timingPresetPillActive]}
                        onPress={() => setTempOpenTime(t)}
                      >
                        <Text style={[styles.timingPresetText, tempOpenTime === t && styles.timingPresetTextActive]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Closing Time */}
                <View style={styles.timingFieldGroup}>
                  <Text style={styles.formLabel}>STORE CLOSES AT</Text>
                  <TextInput
                    style={styles.formInput}
                    value={tempCloseTime}
                    onChangeText={setTempCloseTime}
                    placeholder="e.g. 10:00 PM"
                    placeholderTextColor="#94A3B8"
                  />
                  <View style={styles.timingPresetRow}>
                    {['10:00 AM', '12:00 PM', '04:00 PM', '08:00 PM', '09:00 PM', '10:00 PM', '11:00 PM', '12:00 AM'].map((t) => (
                      <TouchableOpacity
                        key={t}
                        style={[styles.timingPresetPill, tempCloseTime === t && styles.timingPresetPillActive]}
                        onPress={() => setTempCloseTime(t)}
                      >
                        <Text style={[styles.timingPresetText, tempCloseTime === t && styles.timingPresetTextActive]}>
                          {t}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>

                {/* Operating Days */}
                <View style={styles.timingFieldGroup}>
                  <Text style={styles.formLabel}>OPERATING DAYS</Text>
                  <TextInput
                    style={styles.formInput}
                    value={tempOperatingDays}
                    onChangeText={setTempOperatingDays}
                    placeholder="e.g. Mon - Sun (Daily)"
                    placeholderTextColor="#94A3B8"
                  />
                  <View style={styles.timingPresetRow}>
                    {['Mon - Sun (Daily)', 'Mon - Sat', 'Mon - Fri', 'Weekends Only'].map((d) => (
                      <TouchableOpacity
                        key={d}
                        style={[styles.timingPresetPill, tempOperatingDays === d && styles.timingPresetPillActive]}
                        onPress={() => setTempOperatingDays(d)}
                      >
                        <Text style={[styles.timingPresetText, tempOperatingDays === d && styles.timingPresetTextActive]}>
                          {d}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                </View>
              </View>
            )}

            {/* Live Customer Preview */}
            <View style={styles.timingPreviewCard}>
              <Text style={styles.timingPreviewHeader}>PREVIEW: WHAT BUYERS SEE RIGHT NOW</Text>
              <View style={styles.timingPreviewBanner}>
                {(() => {
                  const now = new Date();
                  const curM = now.getHours() * 60 + now.getMinutes();
                  const isOpenToday = isStoreOpenOnDay(tempOperatingDays, now);

                  if (tempIs24Hours) {
                    if (!isOpenToday) {
                      return (
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <View style={[styles.greenPulseDot, { backgroundColor: '#DC2626' }]} />
                          <Text style={{ fontSize: 13, fontWeight: '800', color: '#DC2626', marginLeft: 6 }}>
                            🔴 Closed Right Now • Closed Today ({tempOperatingDays})
                          </Text>
                        </View>
                      );
                    }
                    return (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.greenPulseDot, { backgroundColor: '#047857' }]} />
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#047857', marginLeft: 6 }}>
                          ⚡ Open 24 Hours Today (Always Open)
                        </Text>
                      </View>
                    );
                  }

                  if (!isOpenToday) {
                    return (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.greenPulseDot, { backgroundColor: '#DC2626' }]} />
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#DC2626', marginLeft: 6 }}>
                          🔴 Closed Right Now • Closed Today ({tempOperatingDays})
                        </Text>
                      </View>
                    );
                  }

                  const oM = parseTimeToMinutes(tempOpenTime);
                  const cM = parseTimeToMinutes(tempCloseTime);
                  const isNowOpen = oM !== null && cM !== null && (
                    oM === cM ? true : oM < cM ? curM >= oM && curM < cM : curM >= oM || curM < cM
                  );

                  if (!isNowOpen) {
                    return (
                      <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                        <View style={[styles.greenPulseDot, { backgroundColor: '#DC2626' }]} />
                        <Text style={{ fontSize: 13, fontWeight: '800', color: '#DC2626', marginLeft: 6 }}>
                          🔴 Closed Right Now • Opens {tempOpenTime} ({tempOperatingDays})
                        </Text>
                      </View>
                    );
                  }
                  return (
                    <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                      <View style={[styles.greenPulseDot, { backgroundColor: '#047857' }]} />
                      <Text style={{ fontSize: 13, fontWeight: '800', color: '#047857', marginLeft: 6 }}>
                        🟢 Open Now • Closes {tempCloseTime} ({tempOperatingDays})
                      </Text>
                    </View>
                  );
                })()}
              </View>
            </View>

            {/* Save Schedule Button */}
            <TouchableOpacity
              style={[styles.primaryActionBtn, { marginTop: 16, backgroundColor: COLORS.emeraldPrimary }]}
              onPress={() => handleSaveStoreTiming()}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionBtnText}>
                💾 Save & Apply Shop Timing Schedule ➔
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- CHANGE STORE COVER PHOTO MODAL --- */}
      <Modal
        visible={storeImageModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setStoreImageModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={() => setStoreImageModalVisible(false)}
            >
              <Text style={styles.modalBackBtnText}>✕ Close</Text>
            </TouchableOpacity>
            <Text style={styles.modalHeaderTitle}>Store Cover Photo</Text>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            style={styles.modalContent}
            contentContainerStyle={{ padding: 20, paddingBottom: 60 }}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* Live Preview Card */}
            <Text style={styles.modalSectionHeading}>Live Store Photo Preview</Text>
            <View style={styles.photoModalPreviewCard}>
              <Image
                source={{ uri: customStoreImageUrl || currentMerchantStore?.image || 'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80' }}
                style={styles.photoModalPreviewImg}
                resizeMode="cover"
              />
              <View style={styles.photoModalPreviewFooter}>
                <Text style={styles.photoModalStoreName}>{currentMerchantStore?.name}</Text>
                <Text style={styles.photoModalStoreSub}>{currentMerchantStore?.categoryLabel} • {currentMerchantStore?.address}</Text>
              </View>
            </View>

            {/* Option 1: Upload from Phone Gallery */}
            <Text style={styles.modalSectionHeading}>Option 1: Upload from Device</Text>
            <TouchableOpacity
              style={styles.uploadOptionCard}
              onPress={handlePickStoreImageFromGallery}
              activeOpacity={0.85}
            >
              <View style={styles.uploadOptionIconBox}>
                <Text style={{ fontSize: 26 }}>📁</Text>
              </View>
              <View style={{ flex: 1, marginLeft: 14 }}>
                <Text style={styles.uploadOptionTitle}>Choose Photo from Phone</Text>
                <Text style={styles.uploadOptionSub}>
                  Select any high-resolution photo or store logo from your device library
                </Text>
              </View>
              <Text style={{ color: COLORS.emeraldPrimary, fontSize: 18, fontWeight: '800' }}>➔</Text>
            </TouchableOpacity>

            {/* Option 2: Curated Luxury Presets */}
            <Text style={[styles.modalSectionHeading, { marginTop: 22 }]}>
              Option 2: Luxury Store Showcase Presets
            </Text>
            <Text style={styles.presetSubtitle}>
              Tap any curated storefront below to immediately set it as your live store banner:
            </Text>

            <View style={styles.presetGrid}>
              {STORE_COVER_PRESETS.map((preset) => {
                const isCurrent = (customStoreImageUrl || currentMerchantStore?.image) === preset.url;
                return (
                  <TouchableOpacity
                    key={preset.id}
                    style={[styles.presetCard, isCurrent && styles.presetCardActive]}
                    onPress={() => {
                      setCustomStoreImageUrl(preset.url);
                      handleApplyStoreImage(preset.url);
                    }}
                    activeOpacity={0.85}
                  >
                    <Image
                      source={{ uri: preset.url }}
                      style={styles.presetThumb}
                      resizeMode="cover"
                    />
                    <View style={styles.presetCardContent}>
                      <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                        <Text style={{ fontSize: 13, marginRight: 5 }}>{preset.icon}</Text>
                        <Text style={styles.presetTitle} numberOfLines={1}>
                          {preset.title}
                        </Text>
                      </View>
                      <Text style={styles.presetCategory} numberOfLines={1}>
                        {preset.category}
                      </Text>

                      <View style={[styles.presetSelectPill, isCurrent && styles.presetSelectPillActive]}>
                        <Text style={[styles.presetSelectText, isCurrent && styles.presetSelectTextActive]}>
                          {isCurrent ? '✓ Current Photo' : 'Select Photo'}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>

            {/* Option 3: Paste Custom Image Link */}
            <Text style={[styles.modalSectionHeading, { marginTop: 22 }]}>
              Option 3: Paste Custom Image Link (URL)
            </Text>
            <View style={styles.urlInputCard}>
              <Text style={styles.urlInputLabel}>PASTE IMAGE URL (HTTPS)</Text>
              <TextInput
                style={styles.urlInputField}
                value={customStoreImageUrl}
                onChangeText={setCustomStoreImageUrl}
                placeholder="https://images.unsplash.com/photo-..."
                placeholderTextColor="#94A3B8"
                autoCapitalize="none"
                autoCorrect={false}
              />
              <TouchableOpacity
                style={[styles.primaryActionBtn, { marginTop: 10, backgroundColor: COLORS.emeraldPrimary }]}
                onPress={() => handleApplyStoreImage(customStoreImageUrl)}
                activeOpacity={0.85}
              >
                <Text style={styles.primaryActionBtnText}>Apply Photo URL ➔</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- EDIT STORE DETAILS MODAL --- */}
      <Modal
        visible={editStoreModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setEditStoreModalVisible(false)}
      >
        <SafeAreaView style={styles.editProfileSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

          {/* Sticky Luxury Header */}
          <View style={styles.editProfileHeader}>
            <TouchableOpacity
              style={styles.editProfileCloseBtn}
              onPress={() => setEditStoreModalVisible(false)}
              activeOpacity={0.7}
            >
              <Text style={styles.editProfileCloseBtnText}>✕ Close</Text>
            </TouchableOpacity>

            <View style={styles.editProfileHeaderCenter}>
              <Text style={styles.editProfileHeaderTitle}>🏪 Store Profile</Text>
              <Text style={styles.editProfileHeaderSub}>Live Storefront Settings</Text>
            </View>

            <TouchableOpacity
              style={styles.editProfileHeaderSaveBtn}
              onPress={handleSaveStoreDetails}
              activeOpacity={0.8}
            >
              <Text style={styles.editProfileHeaderSaveBtnText}>💾 Save</Text>
            </TouchableOpacity>
          </View>

          <ScrollView
            style={styles.editProfileScrollView}
            contentContainerStyle={styles.editProfileScrollContent}
            keyboardShouldPersistTaps="handled"
            showsVerticalScrollIndicator={false}
          >
            {/* 1. LIVE STORE CARD PREVIEW */}
            <View style={styles.editProfileSectionHeader}>
              <Text style={styles.editProfileSectionTitle}>👁️ Live Customer Preview</Text>
              <Text style={styles.editProfileSectionSub}>Real-time preview of how your shop appears to buyers</Text>
            </View>

            <View style={styles.editProfilePreviewCard}>
              <View style={styles.editProfilePreviewImageWrap}>
                <Image
                  source={{
                    uri:
                      editStoreImage ||
                      currentMerchantStore?.image ||
                      'https://images.unsplash.com/photo-1578916171728-46686eac8d58?auto=format&fit=crop&w=1200&q=80',
                  }}
                  style={styles.editProfilePreviewImage}
                  resizeMode="cover"
                />
                <View style={styles.editProfilePreviewGradientOverlay} />

                {/* Badges on preview image */}
                <View style={styles.editProfilePreviewBadgesRow}>
                  <View style={styles.editProfilePreviewBadge}>
                    <Text style={styles.editProfilePreviewBadgeText}>✨ VERIFIED PARTNER</Text>
                  </View>
                  <View style={[styles.editProfilePreviewBadge, { backgroundColor: 'rgba(16, 185, 129, 0.9)' }]}>
                    <Text style={styles.editProfilePreviewBadgeText}>● OPEN NOW</Text>
                  </View>
                </View>

                {/* Quick overlay change photo button */}
                <TouchableOpacity
                  style={styles.editProfilePreviewChangePhotoBtn}
                  onPress={handlePickEditStoreImage}
                  activeOpacity={0.85}
                >
                  <Text style={styles.editProfilePreviewChangePhotoText}>📷 Change Cover</Text>
                </TouchableOpacity>
              </View>

              <View style={styles.editProfilePreviewDetails}>
                <Text style={styles.editProfilePreviewStoreName} numberOfLines={1}>
                  {editStoreName || 'Your Store Name'}
                </Text>
                <View style={styles.editProfilePreviewMetaRow}>
                  <View style={styles.editProfilePreviewCategoryTag}>
                    <Text style={styles.editProfilePreviewCategoryText} numberOfLines={1}>
                      🏷️ {editStoreCategory || 'Gourmet Groceries'}
                    </Text>
                  </View>
                  <View style={styles.editProfilePreviewFeeTag}>
                    <Text style={styles.editProfilePreviewFeeText}>
                      ⚡ Rapid Courier Dispatch
                    </Text>
                  </View>
                </View>
                <Text style={styles.editProfilePreviewAddress} numberOfLines={1}>
                  📍 {editStoreAddress || 'Add your store address'}
                </Text>
              </View>
            </View>

            {/* 2. CARD: STORE IDENTITY */}
            <View style={styles.editProfileCard}>
              <View style={styles.editProfileCardHeader}>
                <View style={styles.editProfileCardIconBox}>
                  <Text style={{ fontSize: 18 }}>🏪</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.editProfileCardTitle}>Store Identity & Branding</Text>
                  <Text style={styles.editProfileCardSubtitle}>Your business name and grocery category</Text>
                </View>
              </View>

              {/* Store Name Input */}
              <View style={styles.editProfileInputGroup}>
                <Text style={styles.editProfileInputLabel}>STORE / BUSINESS NAME *</Text>
                <View style={styles.editProfileInputWrap}>
                  <Text style={styles.editProfileInputLeadingIcon}>🏪</Text>
                  <TextInput
                    style={styles.editProfileInput}
                    value={editStoreName}
                    onChangeText={setEditStoreName}
                    placeholder="e.g. Fresh Mart Maitama"
                    placeholderTextColor="#94A3B8"
                  />
                  {editStoreName.length > 0 && (
                    <TouchableOpacity onPress={() => setEditStoreName('')} style={styles.editProfileClearBtn}>
                      <Text style={{ color: '#94A3B8', fontSize: 14 }}>✕</Text>
                    </TouchableOpacity>
                  )}
                </View>
                <Text style={styles.editProfileInputHint}>Appears prominently at the top of customer search results</Text>
              </View>

              {/* Store Category Input */}
              <View style={[styles.editProfileInputGroup, { marginTop: 14 }]}>
                <Text style={styles.editProfileInputLabel}>PRIMARY CATEGORY *</Text>
                <View style={styles.editProfileInputWrap}>
                  <Text style={styles.editProfileInputLeadingIcon}>🏷️</Text>
                  <TextInput
                    style={styles.editProfileInput}
                    value={editStoreCategory}
                    onChangeText={setEditStoreCategory}
                    placeholder="e.g. Gourmet Groceries & Deli"
                    placeholderTextColor="#94A3B8"
                  />
                </View>

                {/* Quick Category Chips */}
                <Text style={[styles.editProfileInputHint, { marginTop: 8, marginBottom: 6, fontWeight: '700' }]}>
                  ⚡ Tap to choose a popular category:
                </Text>
                <View style={styles.editProfileChipsWrap}>
                  {[
                    { label: 'Gourmet Groceries & Deli', icon: '🛒' },
                    { label: 'Farm-to-Table & Produce', icon: '🥦' },
                    { label: 'French Bakery & Pastries', icon: '🥐' },
                    { label: 'Sommelier & Luxury Pantry', icon: '🍾' },
                    { label: 'Supermarket & Provisions', icon: '🏪' },
                    { label: 'Pharmacy & Health', icon: '💊' },
                    { label: 'Premium Nigerian Staples', icon: '🥩' },
                    { label: 'Artisan Cafe & Treats', icon: '☕' },
                  ].map((cat) => {
                    const isSelected = editStoreCategory === cat.label;
                    return (
                      <TouchableOpacity
                        key={cat.label}
                        style={[styles.editProfileChip, isSelected && styles.editProfileChipSelected]}
                        onPress={() => setEditStoreCategory(cat.label)}
                        activeOpacity={0.8}
                      >
                        <Text style={styles.editProfileChipIcon}>{cat.icon}</Text>
                        <Text style={[styles.editProfileChipText, isSelected && styles.editProfileChipTextSelected]}>
                          {cat.label}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            </View>

            {/* 3. CARD: STOREFRONT COVER PHOTO */}
            <View style={styles.editProfileCard}>
              <View style={styles.editProfileCardHeader}>
                <View style={styles.editProfileCardIconBox}>
                  <Text style={{ fontSize: 18 }}>📸</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.editProfileCardTitle}>Storefront Banner & Photo</Text>
                  <Text style={styles.editProfileCardSubtitle}>High-res photo to represent your storefront</Text>
                </View>
              </View>

              {/* Upload Action Button */}
              <TouchableOpacity
                style={styles.editProfileUploadBtn}
                onPress={handlePickEditStoreImage}
                activeOpacity={0.85}
              >
                <View style={styles.editProfileUploadBtnIconBox}>
                  <Text style={{ fontSize: 20 }}>📁</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 12 }}>
                  <Text style={styles.editProfileUploadBtnTitle}>Upload Photo from Device</Text>
                  <Text style={styles.editProfileUploadBtnSubtitle}>Choose any image or logo from your photo gallery</Text>
                </View>
                <Text style={styles.editProfileUploadBtnArrow}>➔</Text>
              </TouchableOpacity>

              {/* Luxury Preset Swatches */}
              <Text style={[styles.editProfileInputHint, { marginTop: 14, marginBottom: 8, fontWeight: '700' }]}>
                ✨ Or select a curated luxury storefront:
              </Text>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={{ gap: 10, paddingVertical: 4 }}
              >
                {STORE_COVER_PRESETS.map((preset) => {
                  const isCur = (editStoreImage || currentMerchantStore?.image) === preset.url;
                  return (
                    <TouchableOpacity
                      key={preset.id}
                      style={[styles.editProfilePresetThumbCard, isCur && styles.editProfilePresetThumbCardActive]}
                      onPress={() => setEditStoreImage(preset.url)}
                      activeOpacity={0.85}
                    >
                      <Image source={{ uri: preset.url }} style={styles.editProfilePresetThumbImg} />
                      <View style={styles.editProfilePresetThumbFooter}>
                        <Text style={{ fontSize: 11 }}>{preset.icon}</Text>
                        <Text style={styles.editProfilePresetThumbTitle} numberOfLines={1}>
                          {preset.title}
                        </Text>
                      </View>
                      {isCur && (
                        <View style={styles.editProfilePresetCheckBadge}>
                          <Text style={{ color: '#FFFFFF', fontSize: 10, fontWeight: '900' }}>✓</Text>
                        </View>
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* URL input */}
              <View style={[styles.editProfileInputGroup, { marginTop: 14 }]}>
                <Text style={styles.editProfileInputLabel}>OR PASTE PHOTO URL</Text>
                <View style={styles.editProfileInputWrap}>
                  <Text style={styles.editProfileInputLeadingIcon}>🔗</Text>
                  <TextInput
                    style={styles.editProfileInput}
                    value={editStoreImage}
                    onChangeText={setEditStoreImage}
                    placeholder="https://images.unsplash.com/..."
                    placeholderTextColor="#94A3B8"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                </View>
              </View>
            </View>

            {/* 4. CARD: LOCATION & CONTACT */}
            <View style={styles.editProfileCard}>
              <View style={styles.editProfileCardHeader}>
                <View style={styles.editProfileCardIconBox}>
                  <Text style={{ fontSize: 18 }}>📍</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.editProfileCardTitle}>Location & Customer Contact</Text>
                  <Text style={styles.editProfileCardSubtitle}>Pickup address and merchant support phone</Text>
                </View>
              </View>

              {/* Address */}
              <View style={styles.editProfileInputGroup}>
                <Text style={styles.editProfileInputLabel}>PHYSICAL ADDRESS / LANDMARK *</Text>
                <View style={styles.editProfileInputWrap}>
                  <Text style={styles.editProfileInputLeadingIcon}>📍</Text>
                  <TextInput
                    style={styles.editProfileInput}
                    value={editStoreAddress}
                    onChangeText={setEditStoreAddress}
                    placeholder="e.g. Plot 14 Gana Street, Maitama, Abuja"
                    placeholderTextColor="#94A3B8"
                  />
                </View>
                <Text style={styles.editProfileInputHint}>Riders and shoppers navigate here for pickup orders</Text>
              </View>

              {/* Phone */}
              <View style={[styles.editProfileInputGroup, { marginTop: 14 }]}>
                <Text style={styles.editProfileInputLabel}>OFFICIAL PHONE / WHATSAPP NUMBER *</Text>
                <View style={styles.editProfileInputWrap}>
                  <Text style={styles.editProfileInputLeadingIcon}>📞</Text>
                  <TextInput
                    style={styles.editProfileInput}
                    value={editStorePhone}
                    onChangeText={setEditStorePhone}
                    placeholder="e.g. +234 803 123 4567"
                    placeholderTextColor="#94A3B8"
                    keyboardType="phone-pad"
                  />
                </View>
                <Text style={styles.editProfileInputHint}>Used for order notifications and dispatch rider calls</Text>
              </View>

              {/* Store GPS Map Location Box */}
              <View style={[styles.editProfileInputGroup, { marginTop: 14 }]}>
                <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
                  <Text style={styles.editProfileInputLabel}>STOREFRONT GPS PIN ON MAP *</Text>
                  <TouchableOpacity
                    onPress={() => setStoreMapModalVisible(true)}
                    activeOpacity={0.7}
                  >
                    <Text style={{ fontSize: 11, fontWeight: '800', color: COLORS.emeraldPrimary }}>
                      ⛶ Fullscreen ➔
                    </Text>
                  </TouchableOpacity>
                </View>

                <View style={styles.storeMiniMapContainer}>
                  <MapView
                    ref={storeMiniMapRef}
                    style={styles.storeMiniMap}
                    initialRegion={{
                      latitude: Number(editStoreLatitude) || 9.0882,
                      longitude: Number(editStoreLongitude) || 7.4933,
                      latitudeDelta: 0.008,
                      longitudeDelta: 0.008,
                    }}
                    scrollEnabled={true}
                    zoomEnabled={true}
                    pitchEnabled={true}
                    rotateEnabled={true}
                    zoomTapEnabled={true}
                    zoomControlEnabled={false}
                    showsUserLocation={true}
                    showsMyLocationButton={false}
                    onRegionChangeComplete={(r) => {
                      if (r) setStoreMapRegion(r);
                    }}
                    onPress={(e) => {
                      if (e && e.nativeEvent && e.nativeEvent.coordinate) {
                        const { latitude, longitude } = e.nativeEvent.coordinate;
                        setEditStoreLatitude(latitude);
                        setEditStoreLongitude(longitude);
                        setStoreMapRegion((prev) => ({ ...prev, latitude, longitude }));
                      }
                    }}
                  >
                    {/* Live Phone Location Blue Dot Beacon */}
                    {userLiveCoords && (
                      <Marker
                        coordinate={userLiveCoords}
                        title="📱 Your Current Phone Location"
                        description="Live GPS position of your phone"
                        anchor={{ x: 0.5, y: 0.5 }}
                      >
                        <View style={styles.liveBeaconOuter}>
                          <View style={styles.liveBeaconInner} />
                        </View>
                      </Marker>
                    )}

                    <Marker
                      coordinate={{
                        latitude: Number(editStoreLatitude) || 9.0882,
                        longitude: Number(editStoreLongitude) || 7.4933,
                      }}
                      draggable={true}
                      onDragEnd={(e) => {
                        if (e && e.nativeEvent && e.nativeEvent.coordinate) {
                          const { latitude, longitude } = e.nativeEvent.coordinate;
                          setEditStoreLatitude(latitude);
                          setEditStoreLongitude(longitude);
                          setStoreMapRegion((prev) => ({ ...prev, latitude, longitude }));
                        }
                      }}
                      title={editStoreName || 'Your Store'}
                      description="Drag or tap to place shop pin"
                      pinColor={COLORS.emeraldPrimary}
                    />
                  </MapView>

                  {/* Top Guide Hint Pill */}
                  <View style={styles.storeMiniMapTopHint}>
                    <Text style={styles.storeMiniMapTopHintText} numberOfLines={1}>
                      👆 Drag pin to shop • 🔵 Blue dot = Phone GPS
                    </Text>
                  </View>

                  {/* Mini Map Floating Zoom FABs */}
                  <View style={styles.storeMiniMapZoomFabCol}>
                    <TouchableOpacity
                      style={styles.storeMiniMapZoomBtn}
                      onPress={() => handleZoomStoreMiniMap(true)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.storeMiniMapZoomText}>➕</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.storeMiniMapZoomBtn}
                      onPress={() => handleZoomStoreMiniMap(false)}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.storeMiniMapZoomText}>➖</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Overlay Coordinates Pill */}
                  <View style={styles.storeMiniMapBadge}>
                    <Text style={styles.storeMiniMapBadgeText}>
                      🎯 Pinned: {(Number(editStoreLatitude) || 9.0882).toFixed(4)}° N, {(Number(editStoreLongitude) || 7.4933).toFixed(4)}° E
                    </Text>
                  </View>
                </View>

                {/* Map Pin Action Buttons Row */}
                <View style={styles.storeMapActionRow}>
                  <TouchableOpacity
                    style={styles.storeMapOpenBtn}
                    onPress={() => setStoreMapModalVisible(true)}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.storeMapOpenBtnText}>📍 Pin on Fullscreen Map ➔</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    style={styles.storeMapGpsBtn}
                    onPress={handleGetMerchantStoreLiveLocation}
                    activeOpacity={0.85}
                  >
                    <Text style={styles.storeMapGpsBtnText}>🎯 Locate GPS</Text>
                  </TouchableOpacity>
                </View>
                <Text style={styles.editProfileInputHint}>
                  This pin ensures buyers in your neighborhood discover your shop on the map and receive accurate delivery estimates.
                </Text>
              </View>
            </View>

            {/* 5. CARD: ABOUT & SPECIALTY */}
            <View style={styles.editProfileCard}>
              <View style={styles.editProfileCardHeader}>
                <View style={styles.editProfileCardIconBox}>
                  <Text style={{ fontSize: 18 }}>📝</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.editProfileCardTitle}>Store Bio & Specialty</Text>
                  <Text style={styles.editProfileCardSubtitle}>Tell buyers about fresh arrivals, imports & specialty</Text>
                </View>
              </View>

              <View style={styles.editProfileInputGroup}>
                <Text style={styles.editProfileInputLabel}>STORE DESCRIPTION</Text>
                <View style={[styles.editProfileInputWrap, { alignItems: 'flex-start', paddingTop: 10 }]}>
                  <Text style={[styles.editProfileInputLeadingIcon, { marginTop: 2 }]}>✍️</Text>
                  <TextInput
                    style={[styles.editProfileInput, { height: 90, textAlignVertical: 'top' }]}
                    value={editStoreDescription}
                    onChangeText={setEditStoreDescription}
                    placeholder="Describe your store (e.g. Daily fresh organic produce, imported European cheese, fine wines, and same-day doorstep dispatch)..."
                    placeholderTextColor="#94A3B8"
                    multiline
                  />
                </View>
                <Text style={styles.editProfileInputHint}>
                  A friendly, welcoming bio helps build shopper confidence and increases orders.
                </Text>
              </View>
            </View>

            {/* Bottom Save Action Button */}
            <TouchableOpacity
              style={styles.editProfilePrimarySaveBtn}
              onPress={handleSaveStoreDetails}
              activeOpacity={0.85}
            >
              <Text style={styles.editProfilePrimarySaveBtnText}>
                ✨ Save & Publish Store Profile ➔
              </Text>
            </TouchableOpacity>

            <Text style={styles.editProfileFooterNote}>
              🔒 Changes sync instantly across the Buyer app and GETIT merchant directory.
            </Text>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* --- STORE MAP PINNING MODAL --- */}
      <Modal
        visible={storeMapModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setStoreMapModalVisible(false)}
        onShow={() => {
          setTimeout(() => {
            if (storeFullMapRef.current) {
              storeFullMapRef.current.animateToRegion({
                latitude: Number(editStoreLatitude) || 9.0882,
                longitude: Number(editStoreLongitude) || 7.4933,
                latitudeDelta: 0.008,
                longitudeDelta: 0.008,
              }, 300);
            }
          }, 150);

          (async () => {
            try {
              const { status } = await Location.getForegroundPermissionsAsync();
              if (status === 'granted') {
                const loc = await Location.getCurrentPositionAsync({ accuracy: Location.Accuracy.Balanced });
                if (loc && loc.coords) {
                  setUserLiveCoords({
                    latitude: loc.coords.latitude,
                    longitude: loc.coords.longitude,
                  });
                }
              }
            } catch (e) {
              // quiet
            }
          })();
        }}
      >
        <SafeAreaView style={styles.storeMapModalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

          {/* Header */}
          <View style={styles.storeMapModalHeader}>
            <TouchableOpacity
              style={styles.storeMapModalCloseBtn}
              onPress={() => setStoreMapModalVisible(false)}
              activeOpacity={0.8}
            >
              <Text style={styles.storeMapModalCloseBtnText}>✕ Cancel</Text>
            </TouchableOpacity>

            <View style={{ alignItems: 'center' }}>
              <Text style={styles.storeMapModalTitle}>Pin Storefront Location</Text>
              <Text style={styles.storeMapModalSub}>Drag pin to shop • 🔵 Blue dot = Your phone</Text>
            </View>

            <TouchableOpacity
              style={styles.storeMapModalConfirmHeaderBtn}
              onPress={() => {
                setStoreMapModalVisible(false);
                Alert.alert('✅ Location Pinned!', 'Your storefront GPS coordinates have been set. Tap "Save" on the profile page to publish changes.');
              }}
              activeOpacity={0.8}
            >
              <Text style={styles.storeMapModalConfirmHeaderText}>Done</Text>
            </TouchableOpacity>
          </View>

          {/* Quick Landmark Jump Chips */}
          <View style={styles.storeMapChipsContainer}>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              contentContainerStyle={{ paddingHorizontal: 14, gap: 8 }}
            >
              {[
                { name: 'Maitama', lat: 9.0882, lng: 7.4933 },
                { name: 'Wuse 2', lat: 9.0792, lng: 7.4721 },
                { name: 'Asokoro', lat: 9.0435, lng: 7.5218 },
                { name: 'Garki 2', lat: 9.0354, lng: 7.4891 },
                { name: 'Jabi Lake', lat: 9.0684, lng: 7.4265 },
                { name: 'Gwarinpa', lat: 9.1085, lng: 7.3912 },
                { name: 'Utako', lat: 9.0578, lng: 7.4412 },
                { name: 'Guzape', lat: 9.0221, lng: 7.5142 },
                { name: 'Victoria Island', lat: 6.4281, lng: 3.4219 },
                { name: 'Lekki Phase 1', lat: 6.4474, lng: 3.4735 },
                { name: 'Ikoyi', lat: 6.4549, lng: 3.4352 },
                { name: 'Ikeja GRA', lat: 6.5892, lng: 3.3582 },
              ].map((loc) => (
                <TouchableOpacity
                  key={loc.name}
                  style={styles.storeMapChip}
                  onPress={() => {
                    setEditStoreLatitude(loc.lat);
                    setEditStoreLongitude(loc.lng);
                    const nextReg = {
                      latitude: loc.lat,
                      longitude: loc.lng,
                      latitudeDelta: 0.010,
                      longitudeDelta: 0.010,
                    };
                    setStoreMapRegion(nextReg);
                    if (storeFullMapRef.current) {
                      storeFullMapRef.current.animateToRegion(nextReg, 350);
                    }
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.storeMapChipText}>📍 {loc.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Interactive Map View */}
          <View style={{ flex: 1, position: 'relative' }}>
            <MapView
              ref={storeFullMapRef}
              style={{ width: '100%', height: '100%' }}
              initialRegion={storeMapRegion}
              scrollEnabled={true}
              zoomEnabled={true}
              pitchEnabled={true}
              rotateEnabled={true}
              zoomTapEnabled={true}
              zoomControlEnabled={false}
              showsUserLocation={true}
              showsMyLocationButton={false}
              onRegionChangeComplete={(r) => {
                if (r) setStoreMapRegion(r);
              }}
              onPress={(e) => {
                if (e && e.nativeEvent && e.nativeEvent.coordinate) {
                  const { latitude, longitude } = e.nativeEvent.coordinate;
                  setEditStoreLatitude(latitude);
                  setEditStoreLongitude(longitude);
                  setStoreMapRegion((prev) => ({ ...prev, latitude, longitude }));
                }
              }}
            >
              {/* Live Phone Location Blue Dot Beacon */}
              {userLiveCoords && (
                <Marker
                  coordinate={userLiveCoords}
                  title="📱 Your Current Phone Location"
                  description="Live GPS position of your phone"
                  anchor={{ x: 0.5, y: 0.5 }}
                >
                  <View style={styles.liveBeaconOuter}>
                    <View style={styles.liveBeaconInner} />
                  </View>
                </Marker>
              )}

              {/* Draggable Store Pin */}
              <Marker
                coordinate={{
                  latitude: Number(editStoreLatitude) || 9.0882,
                  longitude: Number(editStoreLongitude) || 7.4933,
                }}
                draggable={true}
                onDragEnd={(e) => {
                  if (e && e.nativeEvent && e.nativeEvent.coordinate) {
                    const { latitude, longitude } = e.nativeEvent.coordinate;
                    setEditStoreLatitude(latitude);
                    setEditStoreLongitude(longitude);
                    setStoreMapRegion((prev) => ({ ...prev, latitude, longitude }));
                  }
                }}
                title={editStoreName || 'Your Storefront'}
                description="Drag to exact shop entrance"
                pinColor={COLORS.emeraldPrimary}
              />
            </MapView>

            {/* Floating Live Coordinates Banner & Legend */}
            <View style={styles.storeMapFloatCoordsBanner}>
              <Text style={styles.storeMapFloatCoordsText}>
                🎯 Store Pin: {(Number(editStoreLatitude) || 9.0882).toFixed(5)}° N, {(Number(editStoreLongitude) || 7.4933).toFixed(5)}° E
              </Text>
              <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 4, gap: 10 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                  <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: COLORS.emeraldPrimary }} />
                  <Text style={{ fontSize: 9.5, color: '#FFFFFF', fontWeight: '700' }}>Storefront Pin</Text>
                </View>
                {userLiveCoords && (
                  <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
                    <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#2563EB' }} />
                    <Text style={{ fontSize: 9.5, color: '#93C5FD', fontWeight: '700' }}>Your Phone GPS (Blue Dot)</Text>
                  </View>
                )}
              </View>
            </View>

            {/* Map Action Floating Controls (GPS, Zoom In, Zoom Out, Center Pin) */}
            <View style={styles.storeMapFabStack}>
              <TouchableOpacity
                style={styles.storeMapFabBtn}
                onPress={handleGetMerchantStoreLiveLocation}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 20 }}>🎯</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.storeMapFabBtn}
                onPress={() => handleZoomStoreFullMap(true)}
                activeOpacity={0.85}
              >
                <Text style={styles.storeMapFabZoomText}>➕</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.storeMapFabBtn}
                onPress={() => handleZoomStoreFullMap(false)}
                activeOpacity={0.85}
              >
                <Text style={styles.storeMapFabZoomText}>➖</Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.storeMapFabBtn}
                onPress={() => {
                  if (storeFullMapRef.current) {
                    storeFullMapRef.current.animateToRegion({
                      latitude: Number(editStoreLatitude) || 9.0882,
                      longitude: Number(editStoreLongitude) || 7.4933,
                      latitudeDelta: 0.008,
                      longitudeDelta: 0.008,
                    }, 250);
                  }
                }}
                activeOpacity={0.85}
              >
                <Text style={{ fontSize: 18 }}>📍</Text>
              </TouchableOpacity>
            </View>

            {/* Bottom Confirm Bar */}
            <View style={styles.storeMapBottomConfirmBar}>
              <View style={{ marginBottom: 10 }}>
                <Text style={styles.storeMapBottomPromptTitle}>
                  🏪 {editStoreName || 'Store Location'}
                </Text>
                <Text style={styles.storeMapBottomPromptSub} numberOfLines={1}>
                  {editStoreAddress || 'Near selected coordinates'}
                </Text>
              </View>

              <TouchableOpacity
                style={styles.storeMapBottomConfirmBtn}
                onPress={() => {
                  setStoreMapModalVisible(false);
                  Alert.alert('✅ Location Pinned!', 'Your storefront GPS coordinates have been set. Tap "Save" on the profile page to publish changes.');
                }}
                activeOpacity={0.85}
              >
                <Text style={styles.storeMapBottomConfirmBtnText}>
                  ✅ Confirm Pinned Store Location ➔
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* --- POST-ORDER REVIEWS & FEEDBACK MODAL (NUMBER 7) --- */}
      {/* ========================================================================= */}
      <Modal
        visible={reviewModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setReviewModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

          {/* Header */}
          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={() => setReviewModalVisible(false)}
            >
              <Text style={styles.modalBackBtnText}>✕ Close</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.modalHeaderTitle}>⭐ Rate Experience</Text>
              <Text style={styles.modalHeaderSubtitle}>
                Order #{targetReviewOrder?.id || 'GETIT'}
              </Text>
            </View>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            style={{ flex: 1, backgroundColor: COLORS.beigeBg }}
            contentContainerStyle={{ padding: 18, paddingBottom: 100 }}
            keyboardShouldPersistTaps="handled"
          >
            {/* Hero Card */}
            <View style={styles.reviewHeroCard}>
              <Text style={{ fontSize: 28, marginBottom: 4 }}>✨ 🛍️</Text>
              <Text style={styles.reviewHeroTitle}>How Was Your Order?</Text>
              <Text style={styles.reviewHeroSub}>
                Your verified ratings help our merchants maintain luxury standards and reward hardworking Abuja couriers.
              </Text>
            </View>

            {/* If Multi-Store Order: Store Selector Tabs */}
            {targetReviewOrder?.stops && targetReviewOrder.stops.length > 1 && (
              <View style={{ marginBottom: 16 }}>
                <Text style={styles.reviewSectionLabel}>SELECT STORE TO RATE</Text>
                <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 8 }}>
                  {targetReviewOrder.stops.map((st, idx) => {
                    const isActive = reviewStoreIndex === idx;
                    const stRating = storeRatingsMap[st.storeId]?.rating || 5;
                    return (
                      <TouchableOpacity
                        key={st.storeId || idx}
                        style={[
                          styles.reviewStoreTabBtn,
                          isActive && styles.reviewStoreTabBtnActive,
                        ]}
                        onPress={() => setReviewStoreIndex(idx)}
                      >
                        <Text style={[styles.reviewStoreTabBtnText, isActive && styles.reviewStoreTabBtnTextActive]}>
                          Stop {idx + 1}: {st.storeName} (★ {stRating})
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>
              </View>
            )}

            {/* PART 1: STORE & PROVISIONS RATING */}
            {(() => {
              const currentStoreId =
                targetReviewOrder?.stops && targetReviewOrder.stops.length > 0
                  ? targetReviewOrder.stops[reviewStoreIndex]?.storeId
                  : targetReviewOrder?.storeId || 's1';
              const currentStoreName =
                targetReviewOrder?.stops && targetReviewOrder.stops.length > 0
                  ? targetReviewOrder.stops[reviewStoreIndex]?.storeName
                  : targetReviewOrder?.storeName || 'The Gourmet Emporium';
              const stReviewData = storeRatingsMap[currentStoreId] || {
                rating: 5,
                tags: [],
                comment: '',
              };

              const setStoreRating = (stars) => {
                setStoreRatingsMap((prev) => ({
                  ...prev,
                  [currentStoreId]: {
                    ...stReviewData,
                    storeId: currentStoreId,
                    storeName: currentStoreName,
                    rating: stars,
                  },
                }));
              };

              const toggleStoreTag = (tag) => {
                const currentTags = stReviewData.tags || [];
                const updated = currentTags.includes(tag)
                  ? currentTags.filter((t) => t !== tag)
                  : [...currentTags, tag];
                setStoreRatingsMap((prev) => ({
                  ...prev,
                  [currentStoreId]: {
                    ...stReviewData,
                    storeId: currentStoreId,
                    storeName: currentStoreName,
                    tags: updated,
                  },
                }));
              };

              const setStoreComment = (text) => {
                setStoreRatingsMap((prev) => ({
                  ...prev,
                  [currentStoreId]: {
                    ...stReviewData,
                    storeId: currentStoreId,
                    storeName: currentStoreName,
                    comment: text,
                  },
                }));
              };

              const positiveStoreTags = [
                '🍲 Fresh & Delicious',
                '🍱 Pristine Packaging',
                '✨ Generous Portion',
                '🔥 Temperature Perfect',
                '💯 Exactly as Ordered',
              ];
              const criticalStoreTags = [
                '❄️ Arrived Cold',
                '📦 Leaking Package',
                '⚠️ Missing Items',
                '⏳ Took Too Long',
                '👎 Quality Issue',
              ];
              const activeTagList = stReviewData.rating >= 4 ? positiveStoreTags : criticalStoreTags;

              return (
                <View style={styles.reviewCardSection}>
                  <View style={styles.reviewCardHeaderRow}>
                    <View style={styles.reviewCardAvatarCircle}>
                      <Text style={{ fontSize: 18 }}>🏪</Text>
                    </View>
                    <View style={{ flex: 1, marginLeft: 10 }}>
                      <Text style={styles.reviewCardTitle}>{currentStoreName}</Text>
                      <Text style={styles.reviewCardSub}>Provisions & Packaging Quality</Text>
                    </View>
                  </View>

                  {/* 1-5 Star Interactive Selector */}
                  <View style={styles.starsSelectorRow}>
                    {[1, 2, 3, 4, 5].map((starNum) => (
                      <TouchableOpacity
                        key={starNum}
                        onPress={() => setStoreRating(starNum)}
                        style={styles.starTouchItem}
                        activeOpacity={0.7}
                      >
                        <Text style={[styles.starIcon, starNum <= stReviewData.rating && styles.starIconActive]}>
                          ★
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </View>
                  <Text style={styles.starScoreFeedbackText}>
                    {stReviewData.rating === 5 && '🌟 Exceptional! Pure Luxury'}
                    {stReviewData.rating === 4 && '👍 Very Good Quality'}
                    {stReviewData.rating === 3 && '😐 Average Experience'}
                    {stReviewData.rating === 2 && '👎 Room for Improvement'}
                    {stReviewData.rating === 1 && '⚠️ Poor / Disappointing'}
                  </Text>

                  {/* Quick Compliment / Issue Tags */}
                  <Text style={styles.reviewTagsPrompt}>What stood out? (Tap tags)</Text>
                  <View style={styles.reviewTagsWrap}>
                    {activeTagList.map((tag) => {
                      const isTagSelected = (stReviewData.tags || []).includes(tag);
                      return (
                        <TouchableOpacity
                          key={tag}
                          style={[styles.reviewTagChip, isTagSelected && styles.reviewTagChipSelected]}
                          onPress={() => toggleStoreTag(tag)}
                        >
                          <Text style={[styles.reviewTagChipText, isTagSelected && styles.reviewTagChipTextSelected]}>
                            {tag}
                          </Text>
                        </TouchableOpacity>
                      );
                    })}
                  </View>

                  {/* Comment Input */}
                  <TextInput
                    style={styles.reviewCommentInput}
                    placeholder={`Write a quick note for ${currentStoreName} (optional)...`}
                    placeholderTextColor="#94A3B8"
                    multiline
                    numberOfLines={3}
                    value={stReviewData.comment || ''}
                    onChangeText={setStoreComment}
                  />
                </View>
              );
            })()}

            {/* PART 2: COURIER & DELIVERY RATING */}
            <View style={[styles.reviewCardSection, { marginTop: 16 }]}>
              <View style={styles.reviewCardHeaderRow}>
                <View style={[styles.reviewCardAvatarCircle, { backgroundColor: '#EFF6FF' }]}>
                  <Text style={{ fontSize: 18 }}>🛵</Text>
                </View>
                <View style={{ flex: 1, marginLeft: 10 }}>
                  <Text style={styles.reviewCardTitle}>
                    {targetReviewOrder?.boltRider?.name || 'Musa Ibrahim'}
                  </Text>
                  <Text style={styles.reviewCardSub}>
                    Courier Service • {targetReviewOrder?.boltRider?.vehicle || 'Bajaj Boxer 150'}
                  </Text>
                </View>
              </View>

              {/* 1-5 Star Interactive Selector */}
              <View style={styles.starsSelectorRow}>
                {[1, 2, 3, 4, 5].map((starNum) => (
                  <TouchableOpacity
                    key={starNum}
                    onPress={() => setCourierRatingScore(starNum)}
                    style={styles.starTouchItem}
                    activeOpacity={0.7}
                  >
                    <Text style={[styles.starIcon, starNum <= courierRatingScore && styles.starIconActive]}>
                      ★
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>
              <Text style={styles.starScoreFeedbackText}>
                {courierRatingScore === 5 && '⚡ Lightning Fast & Courteous!'}
                {courierRatingScore === 4 && '🛵 Great Delivery Handover'}
                {courierRatingScore === 3 && '😐 Standard Delivery'}
                {courierRatingScore <= 2 && '⏳ Delayed or Careless Handling'}
              </Text>

              {/* Courier Quick Tags */}
              <Text style={styles.reviewTagsPrompt}>Courier Compliments</Text>
              <View style={styles.reviewTagsWrap}>
                {[
                  '⚡ Lightning Fast',
                  '🛵 Courteous & Polite',
                  '🎯 Followed Delivery Notes',
                  '🧤 Handled with Care',
                  '✨ Smooth Handover',
                ].map((tag) => {
                  const isSelected = courierSelectedTags.includes(tag);
                  return (
                    <TouchableOpacity
                      key={tag}
                      style={[styles.reviewTagChip, isSelected && styles.reviewTagChipSelected]}
                      onPress={() => {
                        setCourierSelectedTags((prev) =>
                          prev.includes(tag) ? prev.filter((t) => t !== tag) : [...prev, tag]
                        );
                      }}
                    >
                      <Text style={[styles.reviewTagChipText, isSelected && styles.reviewTagChipTextSelected]}>
                        {tag}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>

              {/* Courier Tip Chips */}
              <Text style={[styles.reviewTagsPrompt, { marginTop: 14 }]}>
                Add Courier Tip (Optional)
              </Text>
              <View style={styles.tipChipsRow}>
                {[0, 200, 500, 1000, 2000].map((tipVal) => {
                  const isTipActive = courierTipAmount === tipVal;
                  return (
                    <TouchableOpacity
                      key={tipVal}
                      style={[styles.tipChip, isTipActive && styles.tipChipActive]}
                      onPress={() => setCourierTipAmount(tipVal)}
                    >
                      <Text style={[styles.tipChipText, isTipActive && styles.tipChipTextActive]}>
                        {tipVal === 0 ? 'No Tip' : `+₦${tipVal.toLocaleString()}`}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            </View>

            {/* SUBMIT BUTTON */}
            <TouchableOpacity
              style={[styles.primaryActionBtn, { marginTop: 22 }]}
              onPress={submitOrderReview}
              disabled={isSubmittingReview}
              activeOpacity={0.85}
            >
              <Text style={styles.primaryActionBtnText}>
                {isSubmittingReview ? 'Submitting Feedback...' : '⭐ Submit Verified Review ➔'}
              </Text>
            </TouchableOpacity>
          </ScrollView>
        </SafeAreaView>
      </Modal>

      {/* ========================================================================= */}
      {/* --- STORE VERIFIED CLIENT REVIEWS MODAL --- */}
      {/* ========================================================================= */}
      <Modal
        visible={storeReviewsModalVisible}
        animationType="slide"
        transparent={false}
        onRequestClose={() => setStoreReviewsModalVisible(false)}
      >
        <SafeAreaView style={styles.modalSafeArea}>
          <StatusBar barStyle="light-content" backgroundColor={COLORS.emeraldDeep} />

          <View style={styles.modalHeader}>
            <TouchableOpacity
              style={styles.modalBackBtn}
              onPress={() => setStoreReviewsModalVisible(false)}
            >
              <Text style={styles.modalBackBtnText}>✕ Close</Text>
            </TouchableOpacity>
            <View style={{ alignItems: 'center' }}>
              <Text style={styles.modalHeaderTitle}>⭐ Verified Reviews</Text>
              <Text style={styles.modalHeaderSubtitle}>Authentic Shopper Experiences</Text>
            </View>
            <View style={{ width: 60 }} />
          </View>

          <ScrollView
            style={{ flex: 1, backgroundColor: COLORS.beigeBg }}
            contentContainerStyle={{ padding: 18, paddingBottom: 60 }}
          >
            {/* Store Rating Highlight Banner */}
            <View style={styles.storeReviewSummaryCard}>
              <Text style={styles.storeReviewSummaryBigStar}>★ 4.9</Text>
              <View style={{ flexDirection: 'row', gap: 3, marginVertical: 4 }}>
                <Text style={{ fontSize: 18, color: '#F59E0B' }}>★★★★★</Text>
              </View>
              <Text style={styles.storeReviewSummarySub}>
                Based on {storeReviewsViewing.length || 42} verified customer orders
              </Text>
              <View style={styles.verifiedShopperBadge}>
                <Text style={styles.verifiedShopperBadgeText}>🛡️ 100% VERIFIED PURCHASE REVIEWS</Text>
              </View>
            </View>

            <Text style={[styles.reviewSectionLabel, { marginTop: 16, marginBottom: 10 }]}>
              RECENT REVIEWS ({storeReviewsViewing.length})
            </Text>

            {storeReviewsViewing.map((rev, rIdx) => (
              <View key={rev.id || rIdx} style={styles.verifiedReviewItemCard}>
                <View style={styles.verifiedReviewItemHeader}>
                  <View style={styles.verifiedReviewAvatarCircle}>
                    <Text style={{ fontSize: 13, fontWeight: '800', color: COLORS.emeraldDeep }}>
                      {(rev.customerName || 'V').slice(0, 1)}
                    </Text>
                  </View>
                  <View style={{ flex: 1, marginLeft: 10 }}>
                    <Text style={styles.verifiedReviewCustomerName}>{rev.customerName}</Text>
                    <Text style={styles.verifiedReviewDate}>{rev.createdAt || 'Recent order'}</Text>
                  </View>
                  <View style={styles.verifiedReviewStarsPill}>
                    <Text style={styles.verifiedReviewStarsPillText}>★ {rev.storeRating || 5}.0</Text>
                  </View>
                </View>

                {/* Tags */}
                {rev.storeTags && rev.storeTags.length > 0 && (
                  <View style={styles.verifiedReviewTagsRow}>
                    {rev.storeTags.map((tg, tIdx) => (
                      <View key={tIdx} style={styles.verifiedReviewTagBadge}>
                        <Text style={styles.verifiedReviewTagBadgeText}>{tg}</Text>
                      </View>
                    ))}
                  </View>
                )}

                {/* Comment */}
                {rev.storeComment ? (
                  <Text style={styles.verifiedReviewCommentText}>"{rev.storeComment}"</Text>
                ) : null}

                {/* Courier Note if any */}
                {rev.riderName && (
                  <View style={styles.verifiedReviewCourierFooter}>
                    <Text style={styles.verifiedReviewCourierText}>
                      🛵 Courier: {rev.riderName} (★ {rev.riderRating || 5}.0)
                    </Text>
                  </View>
                )}
              </View>
            ))}
          </ScrollView>
        </SafeAreaView>
      </Modal>
    </SafeAreaView>
  );
}

// --- High Luxury Stylesheet ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: COLORS.emeraldDeep,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
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
  storeTitle: {
    fontSize: 16.5,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
    letterSpacing: 0.2,
    marginBottom: 4,
  },
  storeCategoryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  storeCategoryTag: {
    fontSize: 12,
    color: COLORS.emeraldDeep,
    fontWeight: '700',
    letterSpacing: 0.2,
  },
  storeTimingRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  storeOpenPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 7,
  },
  greenPulseDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    marginRight: 5,
  },
  storeOpenText: {
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  storeDescription: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginBottom: 10,
  },
  storeDeliveryRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    marginBottom: 10,
  },
  deliveryFeeText: {
    fontSize: 11.5,
    color: COLORS.textDark,
    fontWeight: '700',
  },
  deliveryDot: {
    marginHorizontal: 6,
    color: COLORS.textMuted,
  },
  minOrderText: {
    fontSize: 11,
    color: COLORS.emeraldPrimary,
    fontWeight: '700',
  },
  viewStoreFullBtn: {
    backgroundColor: COLORS.emeraldDeep,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 2,
    shadowColor: COLORS.emeraldDeep,
    shadowOpacity: 0.18,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  viewStoreFullBtnText: {
    fontSize: 12.5,
    color: '#FFFFFF',
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  storeClosedOverlayBadge: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(220, 38, 38, 0.92)',
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
  },
  storeClosedOverlayBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  viewStoreFullBtnClosed: {
    backgroundColor: '#374151',
    shadowColor: '#374151',
  },
  viewStoreFullBtnTextClosed: {
    color: '#D1D5DB',
  },
  storeClosedNoticeBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FEF2F2',
    borderWidth: 1.5,
    borderColor: '#FCA5A5',
    borderRadius: 14,
    padding: 14,
    marginVertical: 12,
    gap: 12,
  },
  storeClosedNoticeIconBox: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeClosedNoticeIcon: {
    fontSize: 18,
  },
  storeClosedNoticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#991B1B',
    marginBottom: 2,
  },
  storeClosedNoticeSub: {
    fontSize: 12,
    color: '#7F1D1D',
    lineHeight: 16,
  },
  productBoxClosedTag: {
    position: 'absolute',
    top: 6,
    left: 6,
    backgroundColor: 'rgba(220, 38, 38, 0.92)',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
    zIndex: 5,
  },
  productBoxClosedTagText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  productBoxClosedBtn: {
    backgroundColor: '#F3F4F6',
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#D1D5DB',
  },
  productBoxClosedBtnText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
  },
  productClosedBtn: {
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 9,
    borderWidth: 1,
    borderColor: '#D1D5DB',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productClosedBtnText: {
    color: '#6B7280',
    fontSize: 11,
    fontWeight: '700',
  },
  bottomCartFloatingBarWarning: {
    backgroundColor: '#1E293B',
  },
  floatingCheckoutBtnWarning: {
    backgroundColor: '#475569',
  },

  // Store Details Modal
  modalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.beigeBg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
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
  catalogViewToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F7F5F0',
    borderRadius: 8,
    padding: 2,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  catalogViewToggleBtn: {
    paddingHorizontal: 9,
    paddingVertical: 4.5,
    borderRadius: 6,
  },
  catalogViewToggleBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2,
    elevation: 1,
  },
  catalogViewToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  catalogViewToggleTextActive: {
    color: COLORS.emeraldDeep,
  },

  // Box form product grid (rows and columns)
  productGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    marginTop: 6,
  },
  productBoxCard: {
    width: '48.5%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 155, 0.35)',
    marginBottom: 12,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'space-between',
  },
  productBoxMediaWrap: {
    height: 116,
    backgroundColor: '#FAF8F5',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(217, 185, 155, 0.2)',
  },
  productBoxImage: {
    width: 76,
    height: 76,
    borderRadius: 8,
  },
  productBoxEmoji: {
    fontSize: 44,
  },
  productBoxBadge: {
    position: 'absolute',
    top: 7,
    left: 7,
    backgroundColor: 'rgba(255, 255, 255, 0.94)',
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(217, 185, 155, 0.35)',
    maxWidth: '75%',
  },
  productBoxBadgeText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.roseGold,
  },
  productBoxInCartPill: {
    position: 'absolute',
    top: 7,
    right: 7,
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 6,
    paddingVertical: 2.5,
    borderRadius: 6,
  },
  productBoxInCartPillText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  productBoxBody: {
    padding: 10,
    flex: 1,
    justifyContent: 'space-between',
  },
  productBoxTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
    lineHeight: 16,
    minHeight: 32,
  },
  productBoxPriceRow: {
    marginTop: 6,
    marginBottom: 8,
  },
  productBoxPrice: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
  },
  productBoxActionRow: {
    width: '100%',
  },
  productBoxAddBtn: {
    backgroundColor: COLORS.emeraldDeep,
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: COLORS.emeraldDeep,
    shadowOffset: { width: 0, height: 1.5 },
    shadowOpacity: 0.15,
    shadowRadius: 3,
    elevation: 1,
  },
  productBoxAddBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  productBoxQtyControls: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.emeraldSurface,
    borderRadius: 9,
    height: 32,
    paddingHorizontal: 4,
    borderWidth: 1,
    borderColor: 'rgba(6, 78, 59, 0.12)',
  },
  productBoxQtyBtn: {
    width: 24,
    height: 24,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productBoxQtyBtnText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
  },
  productBoxQtyCount: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    paddingHorizontal: 4,
  },
  productBoxSoldOut: {
    backgroundColor: '#F3F4F6',
    height: 32,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  productBoxSoldOutText: {
    color: '#9CA3AF',
    fontSize: 11,
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
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  clearCartBtn: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  clearCartBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#DC2626',
  },
  removeItemBtn: {
    marginLeft: 8,
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  removeItemBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#DC2626',
  },
  cartSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  cartStoreGroupCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  cartStoreStopPill: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(217, 119, 6, 0.12)',
    borderWidth: 1,
    borderColor: 'rgba(217, 119, 6, 0.3)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    marginBottom: 8,
  },
  cartStoreStopPillText: {
    color: '#B45309',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  cartStoreGroupHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingBottom: 10,
    marginBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  cartStoreGroupName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  cartStoreStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  cartStoreStatusText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  cartStoreSubtotal: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emeraldPrimary,
    marginTop: 2,
  },
  cartStoreGroupClearBtn: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
  },
  cartStoreGroupClearBtnText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#EF4444',
  },
  cartStoreClosedBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.1)',
    borderRadius: 8,
    padding: 8,
    marginBottom: 10,
    borderLeftWidth: 3,
    borderLeftColor: '#EF4444',
  },
  cartStoreClosedText: {
    fontSize: 11,
    color: '#B91C1C',
    fontWeight: '600',
    lineHeight: 15,
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
  // Cart Confirmed Destination & Embedded Map Structure
  cartDestinationCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cartDestHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  cartDestBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    letterSpacing: 0.8,
  },
  cartDestTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 1,
  },
  cartDestEditBtn: {
    backgroundColor: COLORS.roseGoldSurface,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(183, 110, 121, 0.3)',
  },
  cartDestEditBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.roseGold,
  },
  cartDestDetailsBox: {
    backgroundColor: COLORS.beigeBg,
    borderRadius: 10,
    padding: 8,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  cartDestDetailRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 2,
  },
  cartDestDetailKey: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
    marginRight: 6,
    minWidth: 95,
  },
  cartDestDetailVal: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
    flex: 1,
  },
  diffLocationPromptCard: {
    backgroundColor: '#FEF3C7',
    borderRadius: 14,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1.5,
    borderColor: '#F59E0B',
  },
  diffLocationPromptHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  diffLocationPromptBadge: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.8,
  },
  diffLocationPromptDist: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#D97706',
    backgroundColor: '#FDE68A',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 6,
  },
  diffLocationPromptTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#92400E',
    marginTop: 2,
  },
  diffLocationPromptSub: {
    fontSize: 11,
    color: '#78350F',
    marginTop: 2,
    lineHeight: 15,
  },
  diffLocationPromptActions: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  diffLocationKeepBtn: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#D97706',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffLocationKeepBtnText: {
    color: '#92400E',
    fontSize: 10.5,
    fontWeight: '800',
  },
  diffLocationSwitchBtn: {
    flex: 1.2,
    backgroundColor: '#D97706',
    paddingVertical: 8,
    paddingHorizontal: 8,
    borderRadius: 8,
    alignItems: 'center',
    justifyContent: 'center',
  },
  diffLocationSwitchBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },
  multiStopItineraryFlowBar: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  multiStopFlowPill: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F3F4F6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  multiStopFlowBadge: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  multiStopFlowBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  multiStopFlowName: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
    maxWidth: 100,
  },
  multiStopFlowArrow: {
    fontSize: 10,
    color: COLORS.textMuted,
    fontWeight: '800',
  },
  cartMapContainer: {
    height: 220,
    borderRadius: 16,
    overflow: 'hidden',
    position: 'relative',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    marginBottom: 10,
  },
  cartMapCanvas: {
    width: '100%',
    height: '100%',
  },
  cartMapStoreMarkerPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.emeraldPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  cartMapStopNumberBadge: {
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: '#D97706',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 5,
  },
  cartMapStopNumberBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
  },
  cartMapStoreMarkerText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textDark,
    maxWidth: 110,
  },
  cartMapHomeMarkerPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#DC2626',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  cartMapHomeIconBadge: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#FEE2E2',
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartMapHomeMarkerTitle: {
    fontSize: 9,
    fontWeight: '900',
    color: '#DC2626',
    letterSpacing: 0.5,
  },
  cartMapHomeMarkerSub: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textDark,
    maxWidth: 95,
  },
  cartMapDistanceBanner: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 8,
    backgroundColor: 'rgba(6, 78, 59, 0.94)',
    paddingVertical: 7,
    paddingHorizontal: 10,
    borderRadius: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.18,
    shadowRadius: 3,
  },
  cartMapDistanceTitle: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cartMapDistanceSub: {
    color: COLORS.emeraldSurface,
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 1,
  },
  cartMapDistanceBadge: {
    backgroundColor: COLORS.emeraldLight,
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 8,
    marginLeft: 6,
  },
  cartMapDistanceBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cartMapLegendBar: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.88)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  cartMapLegendItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  cartMapLegendDot: {
    width: 7,
    height: 7,
    borderRadius: 3.5,
  },
  cartMapLegendText: {
    color: '#FFFFFF',
    fontSize: 9,
    fontWeight: '700',
  },
  cartMapFitBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  cartMapFitBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
  },
  cartMapZoomPill: {
    position: 'absolute',
    top: 54,
    right: 10,
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    borderWidth: 1.5,
    borderColor: COLORS.emeraldPrimary,
    elevation: 30,
    zIndex: 999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    overflow: 'hidden',
  },
  cartMapZoomBtn: {
    width: 38,
    height: 38,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
  },
  cartMapZoomBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.emeraldDeep,
  },
  cartMapZoomDivider: {
    height: 1,
    backgroundColor: COLORS.borderLight,
    width: '100%',
  },
  cartMapInlineZoomBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 7,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  cartMapInlineZoomLabel: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  cartMapInlineZoomBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  cartMapInlineZoomBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
  },
  cartMapControlsCluster: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    zIndex: 100,
    elevation: 20,
  },
  cartMapResizeBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 14,
    elevation: 25,
    zIndex: 101,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  cartMapResizeBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
  },
  cartMapFullscreenBtn: {
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 14,
    elevation: 25,
    zIndex: 101,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  cartMapFullscreenBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  cartMapActionBtnFullscreen: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.emeraldPrimary,
    paddingVertical: 9,
    paddingHorizontal: 6,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartMapActionBtnFullscreenText: {
    color: COLORS.emeraldPrimary,
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  cartFullscreenOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: '#FFFFFF',
    zIndex: 99999,
    elevation: 99999,
  },
  cartFullscreenModalContainer: {
    flex: 1,
    backgroundColor: '#F8FAFC',
  },
  cartFullscreenHeaderBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : (StatusBar.currentHeight || 24) + 12,
    paddingBottom: 12,
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 3,
    zIndex: 10,
  },
  cartFullscreenBackBtn: {
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    backgroundColor: 'rgba(5, 107, 75, 0.1)',
  },
  cartFullscreenBackBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
  },
  cartFullscreenHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  cartFullscreenHeaderSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  cartFullscreenCloseCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F1F5F9',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  cartFullscreenFloatingExitBtn: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.90)',
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    zIndex: 25,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  cartFullscreenFloatingExitBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  cartFullscreenControlsCluster: {
    position: 'absolute',
    top: 14,
    right: 14,
    alignItems: 'center',
    gap: 8,
    zIndex: 20,
  },
  cartFullscreenControlBtn: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
  },
  cartFullscreenControlBtnText: {
    fontSize: 20,
    fontWeight: '900',
    color: COLORS.emeraldDeep,
  },
  cartFullscreenBottomCard: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 28 : 16,
    left: 16,
    right: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 8,
  },
  cartFullscreenBottomTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  cartFullscreenDistBadge: {
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
  },
  cartFullscreenDistBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  cartMapGpsBadge: {
    position: 'absolute',
    top: 8,
    left: 8,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
  },
  cartMapGpsBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  cartMapTapOverlay: {
    position: 'absolute',
    bottom: 8,
    right: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  cartMapTapOverlayText: {
    color: COLORS.emeraldDeep,
    fontSize: 10.5,
    fontWeight: '800',
  },
  cartMapActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  cartMapActionBtnSecondary: {
    flex: 1.4,
    backgroundColor: COLORS.emeraldDeep,
    paddingVertical: 9,
    paddingHorizontal: 8,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartMapActionBtnSecondaryText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
    textAlign: 'center',
  },
  cartMapActionBtnOutline: {
    flex: 0.75,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartMapActionBtnOutlineText: {
    color: COLORS.textDark,
    fontSize: 11,
    fontWeight: '700',
  },
  // Rider Note Box in Basket
  riderNoteCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 14,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  riderNoteHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 6,
  },
  riderNoteIcon: {
    fontSize: 20,
  },
  riderNoteBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    letterSpacing: 0.8,
  },
  riderNoteTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  riderNoteClearText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.roseGold,
    paddingHorizontal: 4,
  },
  riderNoteSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginBottom: 10,
    lineHeight: 15,
  },
  riderNoteInputWrap: {
    backgroundColor: COLORS.beigeBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginBottom: 12,
  },
  riderNoteInput: {
    fontSize: 12.5,
    color: COLORS.textDark,
    minHeight: 55,
    padding: 0,
    textAlignVertical: 'top',
  },
  riderNotePresetsLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  riderNotePresetsScroll: {
    gap: 8,
    paddingBottom: 2,
  },
  riderNotePresetChip: {
    backgroundColor: COLORS.beigeBg,
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  riderNotePresetChipActive: {
    backgroundColor: '#ECFDF5',
    borderColor: COLORS.emeraldPrimary,
  },
  riderNotePresetChipText: {
    fontSize: 11,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  riderNotePresetChipTextActive: {
    color: COLORS.emeraldDeep,
    fontWeight: '800',
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
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 12,
  },
  orderCardHeaderCollapsed: {
    marginBottom: 0,
  },
  orderCardDateText: {
    fontSize: 10.5,
    color: '#64748B',
    marginTop: 3,
    fontWeight: '500',
  },
  orderAccordionToggleBadge: {
    marginTop: 6,
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  orderAccordionToggleText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#056B4B',
  },
  orderExpandedBodyWrap: {
    marginTop: 8,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
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
  confirmHandoverBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#056B4B',
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#10B981',
    shadowColor: '#056B4B',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 4,
  },
  confirmHandoverBtnIcon: {
    fontSize: 20,
  },
  confirmHandoverBtnTitle: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  confirmHandoverBtnSub: {
    color: '#D1FAE5',
    fontSize: 11,
    marginTop: 2,
    fontWeight: '500',
  },
  confirmHandoverBtnChevron: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '700',
    marginLeft: 6,
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
  orderBatchBadge: {
    backgroundColor: 'rgba(183, 110, 121, 0.12)',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  orderBatchBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.roseGold,
    letterSpacing: 0.5,
  },
  funnelRouteBadge: {
    backgroundColor: 'rgba(5, 107, 75, 0.08)',
    borderColor: 'rgba(5, 107, 75, 0.28)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  funnelRouteBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#056B4B',
    letterSpacing: 0.4,
  },
  smartRouteBadge: {
    backgroundColor: 'rgba(37, 99, 235, 0.08)',
    borderColor: 'rgba(37, 99, 235, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
    alignSelf: 'flex-start',
    marginBottom: 8,
  },
  smartRouteBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#2563EB',
    letterSpacing: 0.4,
  },
  stopProximityDistanceText: {
    fontSize: 10,
    fontWeight: '700',
    color: '#2563EB',
    marginTop: 1.5,
  },
  orderMultiStopProgressBox: {
    backgroundColor: '#FFFBEB',
    borderRadius: 10,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  orderMultiStopProgressTitle: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },
  orderMultiStopProgressSub: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#78350F',
    marginTop: 2,
  },
  orderMultiStopPinBadge: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#F59E0B',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 2,
  },
  orderMultiStopPinBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#B45309',
  },
  multiStopJourneyAlertCard: {
    backgroundColor: '#ECFDF5',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    borderRadius: 12,
    padding: 10,
    marginBottom: 12,
  },
  multiStopJourneyAlertTitle: {
    fontSize: 10.5,
    fontWeight: '900',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  multiStopJourneyAlertMsg: {
    fontSize: 12,
    color: '#047857',
    fontWeight: '700',
    lineHeight: 16,
  },
  stopsTimelineContainer: {
    backgroundColor: '#F9FAFB',
    borderRadius: 14,
    padding: 12,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  stopsTimelineTitle: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  stopTimelineCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 10,
    padding: 10,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    borderLeftWidth: 4,
    borderLeftColor: '#D1D5DB',
  },
  stopTimelineCardActive: {
    borderColor: COLORS.emeraldPrimary,
    borderLeftColor: COLORS.emeraldPrimary,
    backgroundColor: '#F0FDF4',
  },
  stopTimelineIcon: {
    width: 20,
    height: 20,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  stopTimelineIconDone: {
    backgroundColor: '#056B4B',
  },
  stopTimelineIconCurrent: {
    backgroundColor: '#D97706',
  },
  stopTimelineIconQueued: {
    backgroundColor: '#9CA3AF',
  },
  stopTimelineStoreName: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  stopStatusBadge: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
  },
  stopStatusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  stopItemsSummaryText: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    fontWeight: '600',
  },
  stopPickupPinBadge: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  stopPickupPinBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#92400E',
  },
  liveNavigatingStatusPill: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 8,
    gap: 8,
    marginTop: 4,
  },
  liveGreenPulsingDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },
  liveNavigatingStatusText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  riderLiveMarkerPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 2,
    borderColor: '#2563EB',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 3.5,
  },
  riderPillLabelBox: {
    flexDirection: 'column',
  },
  riderPillName: {
    fontSize: 9.5,
    fontWeight: '900',
    color: '#1E40AF',
  },
  riderPillSpeed: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#059669',
  },
  roadPinContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadPinCallout: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 7,
    paddingVertical: 3.5,
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#94A3B8',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3,
  },
  roadPinCalloutActive: {
    borderColor: '#2563EB',
    backgroundColor: '#EFF6FF',
    transform: [{ scale: 1.05 }],
  },
  roadPinCalloutDone: {
    borderColor: '#056B4B',
    backgroundColor: '#F0FDF4',
  },
  roadPinBadgeNum: {
    width: 16,
    height: 16,
    borderRadius: 8,
    backgroundColor: '#64748B',
    alignItems: 'center',
    justifyContent: 'center',
  },
  roadPinBadgeNumText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  roadPinCalloutText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#0F172A',
    maxWidth: 90,
  },
  roadPinNeedle: {
    width: 2.5,
    height: 8,
    backgroundColor: '#64748B',
  },
  roadPinDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#FFFFFF',
    borderWidth: 3.5,
    borderColor: '#64748B',
    marginTop: -2,
  },
  roadPinDotActive: {
    borderColor: '#2563EB',
    backgroundColor: '#DBEAFE',
    width: 14,
    height: 14,
    borderRadius: 7,
  },
  roadPinDotDone: {
    borderColor: '#056B4B',
    backgroundColor: '#DCFCE7',
  },
  googleMapsRiderMarkerContainer: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMapsRiderBadge: {
    backgroundColor: '#0F172A',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: 2,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 2.5,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.25)',
  },
  googleMapsLiveBeaconDot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: '#10B981',
  },
  googleMapsRiderBadgeName: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  googleMapsRiderBadgeSpeed: {
    fontSize: 8.5,
    fontWeight: '700',
    color: '#38BDF8',
  },
  googleMapsMotorbikePuckWrap: {
    width: 34,
    height: 34,
    alignItems: 'center',
    justifyContent: 'center',
  },
  googleMapsMotorbikePulseRing: {
    position: 'absolute',
    width: 34,
    height: 34,
    borderRadius: 17,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
  },
  googleMapsMotorbikeCorePuck: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: '#FFFFFF',
    borderWidth: 2.5,
    borderColor: '#2563EB',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 7,
    shadowColor: '#1D4ED8',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.45,
    shadowRadius: 3,
  },
  buyerOrderSupportBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  buyerOrderSupportBtnText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#374151',
  },
  buyerRateOrderBtn: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#FEF3C7',
    borderWidth: 1,
    borderColor: '#F59E0B',
  },
  buyerRateOrderBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#92400E',
  },
  orderReviewedBadge: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: '#ECFDF5',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  orderReviewedBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#065F46',
  },
  reviewHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  reviewHeroTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    marginBottom: 6,
  },
  reviewHeroSub: {
    fontSize: 12.5,
    color: '#64748B',
    textAlign: 'center',
    lineHeight: 18,
  },
  reviewSectionLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
    letterSpacing: 0.8,
    marginBottom: 8,
  },
  reviewStoreTabBtn: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewStoreTabBtnActive: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldDeep,
  },
  reviewStoreTabBtnText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#475569',
  },
  reviewStoreTabBtnTextActive: {
    color: '#FFFFFF',
  },
  reviewCardSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 1,
  },
  reviewCardHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
  },
  reviewCardAvatarCircle: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#F0FDF4',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  reviewCardTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  reviewCardSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginTop: 1,
  },
  starsSelectorRow: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    gap: 12,
    marginVertical: 10,
  },
  starTouchItem: {
    padding: 6,
  },
  starIcon: {
    fontSize: 34,
    color: '#D1D5DB',
  },
  starIconActive: {
    color: '#F59E0B',
  },
  starScoreFeedbackText: {
    textAlign: 'center',
    fontSize: 12.5,
    fontWeight: '700',
    color: '#92400E',
    marginBottom: 12,
  },
  reviewTagsPrompt: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#475569',
    marginBottom: 8,
  },
  reviewTagsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 14,
  },
  reviewTagChip: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  reviewTagChipSelected: {
    backgroundColor: '#EFF6FF',
    borderColor: '#3B82F6',
  },
  reviewTagChipText: {
    fontSize: 11.5,
    fontWeight: '600',
    color: '#64748B',
  },
  reviewTagChipTextSelected: {
    color: '#1D4ED8',
    fontWeight: '700',
  },
  reviewCommentInput: {
    backgroundColor: '#F8FAFC',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
    fontSize: 13,
    color: COLORS.textDark,
    textAlignVertical: 'top',
    minHeight: 70,
  },
  tipChipsRow: {
    flexDirection: 'row',
    gap: 6,
  },
  tipChip: {
    flex: 1,
    paddingVertical: 8,
    borderRadius: 8,
    backgroundColor: '#F8FAFC',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    alignItems: 'center',
  },
  tipChipActive: {
    backgroundColor: '#FEF3C7',
    borderColor: '#F59E0B',
  },
  tipChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  tipChipTextActive: {
    color: '#B45309',
  },
  storeReviewSummaryCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 20,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    marginBottom: 16,
  },
  storeReviewSummaryBigStar: {
    fontSize: 42,
    fontWeight: '900',
    color: '#F59E0B',
  },
  storeReviewSummarySub: {
    fontSize: 12.5,
    color: '#64748B',
    marginTop: 2,
  },
  verifiedShopperBadge: {
    marginTop: 10,
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedShopperBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#065F46',
    letterSpacing: 0.5,
  },
  verifiedReviewItemCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E2E8F0',
  },
  verifiedReviewItemHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  verifiedReviewAvatarCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  verifiedReviewCustomerName: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  verifiedReviewDate: {
    fontSize: 10.5,
    color: '#94A3B8',
    marginTop: 1,
  },
  verifiedReviewStarsPill: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedReviewStarsPillText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  verifiedReviewTagsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 5,
    marginVertical: 6,
  },
  verifiedReviewTagBadge: {
    backgroundColor: '#F1F5F9',
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
  },
  verifiedReviewTagBadgeText: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#475569',
  },
  verifiedReviewCommentText: {
    fontSize: 12.5,
    color: '#334155',
    lineHeight: 18,
    fontStyle: 'italic',
    marginTop: 4,
  },
  verifiedReviewCourierFooter: {
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  verifiedReviewCourierText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#64748B',
  },
  floatingNotificationBanner: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 44 : 20,
    left: 16,
    right: 16,
    zIndex: 99999,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 20,
  },
  floatingNotificationInner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0F172A',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#38BDF8',
  },
  floatingNotificationIconBox: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: '#1E293B',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#334155',
  },
  floatingNotificationTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
    flex: 1,
  },
  floatingNotificationTime: {
    fontSize: 10.5,
    fontWeight: '600',
    color: '#94A3B8',
    marginLeft: 6,
  },
  floatingNotificationBody: {
    fontSize: 12,
    color: '#E2E8F0',
    marginTop: 2,
    lineHeight: 16,
  },
  floatingNotificationClose: {
    padding: 6,
    marginLeft: 6,
  },
  orderCancelledBanner: {
    backgroundColor: 'rgba(239, 68, 68, 0.08)',
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(239, 68, 68, 0.25)',
  },
  orderCancelledBannerTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: '#B91C1C',
    marginBottom: 2,
  },
  orderCancelledBannerSub: {
    fontSize: 11,
    color: '#7F1D1D',
    lineHeight: 15,
  },
  ordersClearHistoryBtn: {
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  ordersClearHistoryBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  ordersFilterTabBar: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingRight: 16,
    paddingBottom: 4,
  },
  ordersFilterTabBtn: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 16,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    flexShrink: 0,
  },
  ordersFilterTabBtnActive: {
    backgroundColor: 'rgba(5, 107, 75, 0.12)',
    borderColor: COLORS.emeraldPrimary,
  },
  ordersFilterTabText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  ordersFilterTabTextActive: {
    color: COLORS.emeraldDeep,
    fontWeight: '800',
  },
  ordersEmptyBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 28,
    alignItems: 'center',
    justifyContent: 'center',
    marginVertical: 20,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  ordersEmptyTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
    marginBottom: 6,
  },
  ordersEmptySub: {
    fontSize: 12,
    color: COLORS.textMuted,
    textAlign: 'center',
    lineHeight: 18,
    maxWidth: 260,
  },
  justPlacedOrderBanner: {
    backgroundColor: 'rgba(5, 107, 75, 0.12)',
    borderWidth: 1.5,
    borderColor: COLORS.emeraldPrimary,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    alignSelf: 'flex-start',
    marginBottom: 10,
  },
  justPlacedOrderBannerText: {
    fontSize: 10,
    fontWeight: '900',
    color: COLORS.emeraldDeep,
    letterSpacing: 0.5,
  },
  orderItemsToggleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#F9FAFB',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  orderItemsToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  orderItemsToggleChevron: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
  },
  orderItemsListExpanded: {
    backgroundColor: '#FFFFFF',
    borderRadius: 8,
    padding: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
    gap: 4,
  },
  orderItemExpandedRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 3,
  },
  orderItemExpandedName: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '600',
    flex: 1,
    marginRight: 8,
  },
  orderItemExpandedPrice: {
    fontSize: 11,
    color: COLORS.textMuted,
    fontWeight: '700',
  },
  boltTrackingSummaryCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 10,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  boltRiderAvatarSmall: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltRiderNameSmall: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#166534',
  },
  boltEtaPillTextSmall: {
    fontSize: 10,
    fontWeight: '700',
    color: '#15803D',
    marginTop: 1,
  },
  boltToggleMapBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: '#86EFAC',
    borderRadius: 6,
    paddingHorizontal: 7,
    paddingVertical: 4,
  },
  boltToggleMapBtnText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#166534',
  },
  boltCallBtnSmall: {
    backgroundColor: '#16A34A',
    borderRadius: 6,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  boltCallBtnSmallText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  boltSummaryActionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'flex-end',
    gap: 8,
    marginTop: 8,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: 'rgba(187, 247, 208, 0.45)',
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

  // Sold Out Pill for store customer view
  soldOutPill: {
    backgroundColor: '#FEE2E2',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  soldOutText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#DC2626',
  },

  // Customer Profile Merchant Switch Card
  merchantSwitchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginTop: 14,
    borderWidth: 1.5,
    borderColor: COLORS.champagneGold,
    shadowColor: COLORS.champagneGold,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  merchantSwitchTopRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  merchantIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 14,
    backgroundColor: COLORS.emeraldSurface,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: 'rgba(5, 107, 75, 0.2)',
  },
  merchantTagRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginBottom: 2,
  },
  merchantTag: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.roseGold,
    letterSpacing: 0.8,
  },
  merchantActiveBadge: {
    backgroundColor: 'rgba(5, 107, 75, 0.12)',
    paddingHorizontal: 6,
    paddingVertical: 1,
    borderRadius: 4,
  },
  merchantActiveText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
  },
  merchantCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  merchantCardSub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  merchantStatsMiniRow: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.beigeBg,
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 8,
    marginTop: 12,
    marginBottom: 12,
  },
  merchantStatMini: {
    flex: 1,
    alignItems: 'center',
  },
  merchantStatVal: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.emeraldDeep,
  },
  merchantStatLbl: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  merchantStatDivider: {
    width: 1,
    height: 20,
    backgroundColor: COLORS.borderBeige,
  },
  merchantSwitchBtn: {
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 12,
    paddingVertical: 11,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.champagneGold,
  },
  merchantSwitchBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // Merchant Portal Screen
  merchantSafeArea: {
    flex: 1,
    backgroundColor: COLORS.emeraldDeep,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  merchantTopHeader: {
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 16,
    paddingVertical: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.1)',
  },
  merchantTopHeaderLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8,
  },
  merchantHeaderSub: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.roseGoldLight,
    letterSpacing: 1,
  },
  merchantHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: '#FFFFFF',
    fontFamily: 'serif',
  },
  merchantTopHeaderRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  storeStatusToggle: {
    paddingHorizontal: 8,
    paddingVertical: 5,
    borderRadius: 8,
  },
  statusOpen: {
    backgroundColor: '#065F46',
    borderWidth: 1,
    borderColor: '#10B981',
  },
  statusPaused: {
    backgroundColor: '#7F1D1D',
    borderWidth: 1,
    borderColor: '#EF4444',
  },
  storeStatusToggleText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  exitMerchantBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 8,
  },
  exitMerchantBtnText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  merchantMainScroll: {
    flex: 1,
    backgroundColor: COLORS.beigeBg,
  },
  merchantSectionTitleRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
  },
  merchantViewTitle: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  merchantViewSub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  revenueBadgePill: {
    backgroundColor: COLORS.emeraldSurface,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: 'rgba(5, 107, 75, 0.2)',
  },
  revenueBadgeText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
  },
  testChimeBtn: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: '#F59E0B',
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 6,
  },
  testChimeBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#B45309',
  },
  merchantFilterChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  merchantFilterChipActive: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldDeep,
  },
  merchantFilterText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  merchantFilterTextActive: {
    color: '#FFFFFF',
  },
  merchantEmptyBox: {
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 30,
    marginTop: 16,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  merchantEmptyTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  merchantEmptySub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: '85%',
  },

  // Merchant Order Cards
  mOrderCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 5,
    elevation: 2,
  },
  mOrderHeader: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 8,
  },
  mOrderId: {
    fontSize: 13,
    fontWeight: '900',
    color: COLORS.emeraldDeep,
  },
  mOrderTime: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  mStatusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  mStatusBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
  },
  mCustomerInfoBox: {
    backgroundColor: COLORS.beigeBg,
    borderRadius: 10,
    padding: 9,
    marginVertical: 8,
  },
  mCustomerAddress: {
    fontSize: 11.5,
    fontWeight: '600',
    color: COLORS.textDark,
  },
  mPickupPinNotice: {
    fontSize: 11,
    color: COLORS.roseGold,
    marginTop: 3,
  },
  mItemsList: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
    paddingBottom: 8,
    marginBottom: 8,
  },
  mItemRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 2,
  },
  mItemIcon: {
    fontSize: 14,
    marginRight: 6,
  },
  mItemName: {
    flex: 1,
    fontSize: 12,
    color: COLORS.textDark,
  },
  mItemPrice: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  mFinancialsRow: {
    flexDirection: 'row',
    alignItems: 'baseline',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  mNetPayoutLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
  },
  mNetPayoutValue: {
    fontSize: 15,
    fontWeight: '900',
    color: COLORS.emeraldPrimary,
  },
  mCustomerPaid: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  mActionsRow: {
    flexDirection: 'row',
    gap: 8,
  },
  mRejectBtn: {
    flex: 1,
    backgroundColor: '#FEE2E2',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#FCA5A5',
  },
  mRejectBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#DC2626',
  },
  mAcceptBtn: {
    flex: 2,
    backgroundColor: COLORS.emeraldDeep,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  mAcceptBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mReadyBtn: {
    flex: 1,
    backgroundColor: '#0284C7',
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  mReadyBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mCompleteBtn: {
    flex: 1,
    backgroundColor: COLORS.emeraldPrimary,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
  },
  mAutonomousRiderStatusBox: {
    backgroundColor: 'rgba(16, 185, 129, 0.08)',
    borderRadius: 8,
    paddingVertical: 8,
    paddingHorizontal: 12,
    marginTop: 8,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.2)',
  },
  mAutonomousRiderStatusText: {
    fontSize: 12,
    color: '#10B981',
    fontWeight: '600',
    textAlign: 'center',
  },
  mCompleteBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mCompletedBanner: {
    flex: 1,
    backgroundColor: '#F0FDF4',
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#BBF7D0',
  },
  mCompletedBannerText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#15803D',
  },

  // Merchant Inventory
  bulkImportBtnHeader: {
    backgroundColor: COLORS.champagneGold,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 10,
  },
  bulkImportBtnHeaderText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  bulkOnboardingHeroCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginVertical: 12,
    borderWidth: 1.5,
    borderColor: 'rgba(197, 160, 89, 0.4)',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 2,
  },
  bulkOnboardingIconWrap: {
    width: 44,
    height: 44,
    borderRadius: 12,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  bulkOnboardingBadge: {
    fontSize: 8.5,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    letterSpacing: 0.8,
  },
  bulkFormatPill: {
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  bulkFormatPillText: {
    fontSize: 8,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
  },
  bulkOnboardingTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  bulkOnboardingSub: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 14,
  },
  bulkOnboardingArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.champagneGold,
    marginLeft: 6,
  },
  bulkModalHeroBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  bulkModalHeroTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  bulkModalHeroSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  bulkSupportedFormatsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  formatTag: {
    backgroundColor: COLORS.beigeBg,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  formatTagText: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.emeraldDeep,
  },
  bulkTabsNav: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
  },
  bulkTabBtn: {
    flex: 1,
    paddingVertical: 9,
    alignItems: 'center',
    borderRadius: 10,
  },
  bulkTabBtnActive: {
    backgroundColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  bulkTabBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  bulkTabBtnTextActive: {
    color: COLORS.emeraldDeep,
    fontWeight: '800',
  },
  bulkTabContentBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  bulkUploadDropzone: {
    borderWidth: 2,
    borderColor: 'rgba(5, 107, 75, 0.3)',
    borderStyle: 'dashed',
    borderRadius: 14,
    padding: 20,
    alignItems: 'center',
    backgroundColor: '#F0FDF4',
  },
  bulkUploadIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: COLORS.emeraldDeep,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
  },
  bulkUploadDropzoneTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
  },
  bulkUploadDropzoneSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 4,
    maxWidth: 260,
  },
  bulkUploadSelectBtn: {
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 10,
    marginTop: 12,
  },
  bulkUploadSelectBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  bulkSelectedFileCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#ECFDF5',
    padding: 10,
    borderRadius: 10,
    marginTop: 10,
    borderWidth: 1,
    borderColor: '#A7F3D0',
  },
  bulkSelectedFileName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  bulkSelectedFileStatus: {
    fontSize: 10,
    color: '#059669',
    fontWeight: '600',
  },
  bulkInputSectionLabel: {
    fontSize: 9,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
  },
  bulkPasteInput: {
    backgroundColor: COLORS.beigeBg,
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    fontSize: 12,
    color: COLORS.textDark,
    minHeight: 120,
    fontFamily: 'monospace',
  },
  bulkTemplateCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.beigeBg,
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  bulkTemplateCardTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  bulkTemplateCardSub: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  bulkTemplateLoadArrow: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    marginLeft: 6,
  },
  bulkPreviewSection: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  bulkPreviewHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  bulkPreviewTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  bulkPreviewCountBadge: {
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 6,
  },
  bulkPreviewCountText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  bulkPreviewStatusReady: {
    fontSize: 11,
    fontWeight: '700',
    color: '#059669',
  },
  bulkPreviewEmptyBox: {
    alignItems: 'center',
    paddingVertical: 24,
  },
  bulkPreviewEmptyTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  bulkPreviewEmptySub: {
    fontSize: 11,
    color: COLORS.textMuted,
    textAlign: 'center',
    marginTop: 2,
    maxWidth: 260,
  },
  bulkPreviewItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.beigeBg,
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  bulkPreviewItemName: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  bulkPreviewItemMeta: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  bulkPreviewItemPrice: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    marginRight: 8,
  },
  bulkPreviewItemRemoveBtn: {
    padding: 4,
  },
  addProductBtnHeader: {
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 10,
  },
  addProductBtnHeaderText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  stockStatsRow: {
    flexDirection: 'row',
    gap: 8,
    marginVertical: 12,
  },
  stockStatCard: {
    flex: 1,
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  stockStatVal: {
    fontSize: 16,
    fontWeight: '900',
    color: COLORS.emeraldDeep,
  },
  stockStatLbl: {
    fontSize: 9.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  inventoryItemCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 12,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  inventoryItemName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  inventoryItemCategory: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  stockTagGreen: {
    alignSelf: 'flex-start',
    backgroundColor: '#ECFDF5',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockTagGreenText: {
    fontSize: 9.5,
    color: '#059669',
    fontWeight: '700',
  },
  stockTagRed: {
    alignSelf: 'flex-start',
    backgroundColor: '#FEF2F2',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4,
  },
  stockTagRedText: {
    fontSize: 9.5,
    color: '#DC2626',
    fontWeight: '700',
  },
  stockToggleActionBtn: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    marginLeft: 8,
    borderWidth: 1,
  },
  btnMakeAvailable: {
    backgroundColor: '#ECFDF5',
    borderColor: '#6EE7B7',
  },
  btnMakeOutOfStock: {
    backgroundColor: '#FEF2F2',
    borderColor: '#FCA5A5',
  },
  stockToggleActionText: {
    fontSize: 10.5,
    fontWeight: '800',
  },

  // Merchant Finances
  financesHeroCard: {
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 18,
    padding: 18,
    marginVertical: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8,
    elevation: 4,
  },
  financesHeroSub: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.roseGoldLight,
    letterSpacing: 1,
  },
  financesHeroVal: {
    fontSize: 28,
    fontWeight: '900',
    color: '#FFFFFF',
    marginVertical: 4,
  },
  financesHeroNote: {
    fontSize: 11,
    color: '#D1FAE5',
    marginBottom: 14,
  },
  requestPayoutBtn: {
    backgroundColor: COLORS.champagneGold,
    borderRadius: 12,
    paddingVertical: 10,
    alignItems: 'center',
  },
  requestPayoutBtnText: {
    color: COLORS.emeraldDeep,
    fontSize: 12.5,
    fontWeight: '900',
  },
  financeBreakdownCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  financeCardTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
    fontFamily: 'serif',
  },
  financeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 6,
  },
  financeLabel: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  financeVal: {
    fontSize: 12,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  financeDivider: {
    height: 1,
    backgroundColor: COLORS.borderBeige,
    marginVertical: 8,
  },
  bankAccountCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },

  // --- Redesigned Luxury & Friendly Store Profile Styles ---
  storeProfileHeaderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  storePreviewPillBtn: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1.5,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  storePreviewPillText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#065F46',
  },
  heroStoreShowcaseCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 22,
    overflow: 'hidden',
    marginTop: 8,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 3,
  },
  heroStoreBannerWrap: {
    position: 'relative',
    width: '100%',
    height: 185,
    backgroundColor: '#1E293B',
  },
  heroStoreBannerImg: {
    width: '100%',
    height: '100%',
  },
  heroStoreBannerScrim: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.28)',
  },
  changeCoverBtnFloating: {
    position: 'absolute',
    top: 14,
    right: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
    borderWidth: 1,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 20,
  },
  changeCoverBtnIcon: {
    fontSize: 13,
    marginRight: 6,
  },
  changeCoverBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  heroStoreLiveBadgeFloat: {
    position: 'absolute',
    top: 14,
    left: 14,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(15, 23, 42, 0.75)',
    borderColor: 'rgba(255, 255, 255, 0.25)',
    borderWidth: 1,
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 14,
  },
  pulseDotSmall: {
    width: 7,
    height: 7,
    borderRadius: 4,
    marginRight: 6,
  },
  heroStoreLiveBadgeText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#FFFFFF',
    letterSpacing: 0.5,
  },
  floatingStoreAvatar: {
    position: 'absolute',
    bottom: -22,
    left: 18,
    width: 64,
    height: 64,
    borderRadius: 32,
    backgroundColor: COLORS.emeraldDeep,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 3.5,
    borderColor: '#FFFFFF',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.2,
    shadowRadius: 6,
    elevation: 4,
  },
  floatingStoreAvatarInitials: {
    fontSize: 22,
    fontWeight: '900',
    color: COLORS.gold,
    fontFamily: 'serif',
  },
  avatarCameraBadge: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  heroStoreBody: {
    paddingHorizontal: 18,
    paddingTop: 30,
    paddingBottom: 18,
  },
  heroStoreTitleRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    justifyContent: 'space-between',
  },
  heroStoreName: {
    fontSize: 19,
    fontWeight: '900',
    color: COLORS.textDark,
    fontFamily: 'serif',
    letterSpacing: 0.2,
  },
  verifiedPartnerBadge: {
    backgroundColor: '#FEF3C7',
    borderColor: '#FDE68A',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  verifiedPartnerText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#92400E',
    letterSpacing: 0.6,
  },
  heroStoreMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 6,
    gap: 8,
    flexWrap: 'wrap',
  },
  heroCategoryPill: {
    backgroundColor: COLORS.beigeBg,
    borderColor: COLORS.borderBeige,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 3,
    borderRadius: 8,
  },
  heroCategoryText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  heroStoreRatingText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#D97706',
  },
  editStoreInfoBtn: {
    backgroundColor: COLORS.beigeBg,
    borderColor: COLORS.borderBeige,
    borderWidth: 1,
    paddingHorizontal: 11,
    paddingVertical: 7,
    borderRadius: 12,
  },
  editStoreInfoBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
  },
  heroStoreLocationBox: {
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
    gap: 3,
  },
  heroStoreLocationText: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
  },
  heroStorePhoneText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.emeraldDeep,
  },
  heroStoreDescription: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 8,
    lineHeight: 17,
  },
  friendlyStatusCard: {
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    flexDirection: 'row',
    alignItems: 'center',
  },
  statusCardLive: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  statusCardPaused: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  friendlyStatusTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  friendlyStatusSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  friendlyStatusToggleBtn: {
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderRadius: 12,
  },
  toggleBtnLive: {
    backgroundColor: '#FEE2E2',
    borderWidth: 1,
    borderColor: '#FECACA',
  },
  toggleBtnPaused: {
    backgroundColor: COLORS.emeraldPrimary,
  },
  friendlyStatusToggleText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  sectionHeaderTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
    marginTop: 4,
    letterSpacing: 0.2,
  },
  storeMetricsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 16,
  },
  metricGridCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  metricCardTop: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  metricCardActionText: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
  },
  metricCardLabel: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textMuted,
    textTransform: 'uppercase',
    letterSpacing: 0.5,
  },
  metricCardValue: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.textDark,
    marginVertical: 3,
  },
  metricCardNote: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },
  topMerchantBadge: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
    borderWidth: 1,
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 6,
  },
  quickActionTileList: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 12,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    marginBottom: 16,
    gap: 6,
  },
  quickActionTile: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 8,
    borderRadius: 12,
  },
  quickActionTileIconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    backgroundColor: COLORS.beigeBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderLight,
  },
  quickActionTileTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  quickActionTileSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  quickActionTileArrow: {
    fontSize: 15,
    color: COLORS.emeraldPrimary,
    fontWeight: '900',
    marginLeft: 6,
  },
  branchImageThumb: {
    width: 44,
    height: 44,
    borderRadius: 10,
    marginRight: 10,
  },
  activeBranchCheckBadge: {
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  activeBranchCheckText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  photoModalPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    marginBottom: 16,
  },
  photoModalPreviewImg: {
    width: '100%',
    height: 160,
  },
  photoModalPreviewFooter: {
    padding: 12,
  },
  photoModalStoreName: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  photoModalStoreSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  uploadOptionCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: COLORS.emeraldDeep,
    marginBottom: 12,
  },
  uploadOptionIconBox: {
    width: 46,
    height: 46,
    borderRadius: 14,
    backgroundColor: '#ECFDF5',
    alignItems: 'center',
    justifyContent: 'center',
  },
  uploadOptionTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  uploadOptionSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 15,
  },
  presetSubtitle: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginBottom: 10,
  },
  presetGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 10,
    marginBottom: 14,
  },
  presetCard: {
    width: '48%',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.borderBeige,
  },
  presetCardActive: {
    borderColor: COLORS.emeraldPrimary,
    borderWidth: 2,
  },
  presetThumb: {
    width: '100%',
    height: 90,
  },
  presetCardContent: {
    padding: 10,
  },
  presetTitle: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
    flex: 1,
  },
  presetCategory: {
    fontSize: 10,
    color: COLORS.textMuted,
    marginBottom: 8,
  },
  presetSelectPill: {
    backgroundColor: COLORS.beigeBg,
    paddingVertical: 4,
    borderRadius: 8,
    alignItems: 'center',
  },
  presetSelectPillActive: {
    backgroundColor: COLORS.emeraldDeep,
  },
  presetSelectText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  presetSelectTextActive: {
    color: '#FFFFFF',
  },
  urlInputCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  urlInputLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  urlInputField: {
    backgroundColor: COLORS.beigeBg,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12,
    color: COLORS.textDark,
  },
  quickCategoryPillsRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  quickCatPill: {
    backgroundColor: COLORS.beigeBg,
    borderColor: COLORS.borderBeige,
    borderWidth: 1,
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 10,
  },
  quickCatPillActive: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldDeep,
  },
  quickCatPillText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  quickCatPillTextActive: {
    color: '#FFFFFF',
  },
  switchBranchCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  branchItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 10,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderLight,
    marginBottom: 6,
  },
  branchItemActive: {
    borderColor: COLORS.emeraldPrimary,
    backgroundColor: COLORS.emeraldSurface,
  },
  branchName: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  branchNameActive: {
    color: COLORS.emeraldDeep,
    fontWeight: '800',
  },
  branchSub: {
    fontSize: 10.5,
    color: COLORS.textMuted,
  },

  // Merchant Bottom Navigation
  merchantBottomNav: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 68,
    backgroundColor: COLORS.emeraldDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-around',
    borderTopWidth: 1,
    borderTopColor: 'rgba(255, 255, 255, 0.1)',
    paddingBottom: 6,
  },
  merchantNavItem: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 4,
  },
  merchantNavIcon: {
    fontSize: 18,
    marginBottom: 2,
    opacity: 0.6,
  },
  merchantNavIconActive: {
    opacity: 1,
  },
  merchantNavText: {
    fontSize: 10,
    fontWeight: '600',
    color: COLORS.roseGoldLight,
    opacity: 0.7,
  },
  merchantNavTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
    opacity: 1,
  },
  merchantUnreadDot: {
    position: 'absolute',
    top: -3,
    right: -8,
    backgroundColor: '#EF4444',
    borderRadius: 8,
    minWidth: 15,
    height: 15,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 2,
  },
  merchantUnreadDotText: {
    color: '#FFFFFF',
    fontSize: 8.5,
    fontWeight: '900',
  },

  // Add Product Modal
  addProductModalBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 20,
    width: '90%',
    maxWidth: 400,
  },
  addInputLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 10,
    marginBottom: 4,
  },
  addTextInput: {
    backgroundColor: COLORS.beigeBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 8,
    fontSize: 12.5,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    color: COLORS.textDark,
  },
  categoryPickerRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginVertical: 4,
  },
  catChoicePill: {
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
    backgroundColor: COLORS.beigeBg,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  catChoicePillActive: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldDeep,
  },
  catChoiceText: {
    fontSize: 11,
    color: COLORS.textDark,
    fontWeight: '600',
  },
  catChoiceTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  iconChoiceCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: COLORS.beigeBg,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  iconChoiceCircleActive: {
    borderColor: COLORS.emeraldPrimary,
    backgroundColor: COLORS.emeraldSurface,
    borderWidth: 2,
  },

  // Customer Order GPS Destination Card
  orderGpsCard: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.emeraldSurface,
    borderRadius: 12,
    padding: 12,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: 'rgba(5, 107, 75, 0.2)',
  },
  orderGpsTitle: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    letterSpacing: 0.8,
  },
  orderGpsCoords: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
    marginTop: 2,
  },
  orderGpsLandmark: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  orderGpsNotes: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emeraldDeep,
    marginTop: 3,
    fontStyle: 'italic',
  },
  openMapsBtn: {
    backgroundColor: COLORS.emeraldDeep,
    paddingHorizontal: 10,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 8,
  },
  openMapsBtnText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '800',
  },

  // Merchant Order GPS Row
  mGpsRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 4,
    marginBottom: 4,
  },
  mGpsCoordsText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emeraldPrimary,
  },
  mGoogleMapsLink: {
    backgroundColor: '#E0F2FE',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#BAE6FD',
  },
  mGoogleMapsLinkText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#0284C7',
  },
  mLandmarkText: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // Google Map Location Picker Modal
  modalGpsNavBtn: {
    backgroundColor: 'rgba(255, 255, 255, 0.18)',
    paddingHorizontal: 10,
    paddingVertical: 5,
    borderRadius: 8,
  },
  modalGpsNavText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  mapHeaderNoticeBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 14,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  mapHeaderNoticeTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  mapHeaderNoticeSub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 3,
    lineHeight: 16,
  },

  // Google Maps Style Search Bar & Autocomplete Dropdown
  mapSearchBarContainer: {
    marginBottom: 12,
    position: 'relative',
    zIndex: 20,
  },
  mapSearchInputBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 9,
    borderWidth: 1.5,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.06,
    shadowRadius: 5,
    elevation: 3,
  },
  mapSearchIcon: {
    fontSize: 16,
    marginRight: 8,
  },
  mapSearchInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    paddingVertical: 2,
  },
  mapSearchClearBtn: {
    paddingHorizontal: 6,
    paddingVertical: 4,
  },
  mapSearchGoBtn: {
    backgroundColor: COLORS.emeraldPrimary,
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    marginLeft: 6,
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapSearchGoBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  mapSuggestionsDropdown: {
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    marginTop: 6,
    borderWidth: 1.5,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.12,
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden',
  },
  mapSuggestionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F1F5F9',
  },
  mapSuggestionPinIconWrap: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: COLORS.emeraldSurface,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  mapSuggestionTitle: {
    fontSize: 12.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  mapSuggestionSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  mapSuggestionArrow: {
    fontSize: 12,
    color: COLORS.emeraldPrimary,
    fontWeight: '800',
    marginLeft: 8,
  },

  // Live Location Quick Trigger Banner
  mapLiveLocationBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EFF6FF',
    borderWidth: 1.2,
    borderColor: '#BFDBFE',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginBottom: 14,
    gap: 10,
  },
  mapLiveIconPill: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DBEAFE',
    justifyContent: 'center',
    alignItems: 'center',
  },
  mapLiveBannerTitle: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#1E40AF',
  },
  mapLiveBannerSub: {
    fontSize: 11,
    color: '#3B82F6',
    marginTop: 1,
  },
  mapLiveGpsStatusDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#10B981',
  },

  // Live GPS Beacon (Google Maps Blue Beacon)
  liveBeaconOuter: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: 'rgba(37, 99, 235, 0.25)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: 'rgba(37, 99, 235, 0.6)',
  },
  liveBeaconInner: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#2563EB',
    borderWidth: 2,
    borderColor: '#FFFFFF',
  },

  // Map Container & Canvas
  mapContainerBox: {
    borderRadius: 18,
    overflow: 'hidden',
    height: 280,
    backgroundColor: '#E2E8F0',
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: COLORS.borderBeige,
    position: 'relative',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  mapCanvas: {
    width: '100%',
    height: '100%',
  },
  mapCoordsOverlayPill: {
    position: 'absolute',
    top: 10,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(6, 78, 59, 0.92)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 10,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    elevation: 3,
  },
  mapCoordsText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  mapLocateMeFab: {
    position: 'absolute',
    bottom: 50,
    right: 12,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 5,
    elevation: 6,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
  },
  mapToolsRow: {
    position: 'absolute',
    bottom: 10,
    left: 10,
    right: 64,
    flexDirection: 'row',
    justifyContent: 'flex-start',
    gap: 8,
  },
  mapToolBtn: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 7,
    paddingHorizontal: 11,
    borderRadius: 10,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.15,
    shadowRadius: 4,
    elevation: 3,
  },
  // Multi-Location Discovered Chips & Banner
  mapPinsRowLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.6,
    marginBottom: 6,
  },
  searchPinChip: {
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 14,
    backgroundColor: '#FFFFFF',
    borderWidth: 1.2,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  searchPinChipActive: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldDeep,
  },
  searchPinChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  searchPinChipTextActive: {
    color: '#FFFFFF',
  },
  mapFoundPlacesBanner: {
    position: 'absolute',
    top: 42,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderWidth: 1,
    borderColor: '#E2E8F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 3,
  },
  mapFoundPlacesBannerText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#0F172A',
    flex: 1,
  },
  mapFoundPlacesClearBtn: {
    paddingHorizontal: 7,
    paddingVertical: 2,
    backgroundColor: '#F1F5F9',
    borderRadius: 6,
    marginLeft: 6,
  },
  mapFoundPlacesClearBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#64748B',
  },

  // Address Details Form Card
  locationDetailsCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  locationDetailsCardTitle: {
    fontSize: 14.5,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 10,
    fontFamily: 'serif',
  },
  mapInputLbl: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 10,
    marginBottom: 4,
  },
  mapTextInput: {
    backgroundColor: COLORS.beigeBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 12.5,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    color: COLORS.textDark,
  },

  // --- Bolt Delivery & Partner Selection Styles ---
  deliveryTierContainer: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginVertical: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  deliveryTierHeader: {
    fontSize: 12,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.6,
  },
  deliveryTierSub: {
    fontSize: 11.5,
    color: '#64748B',
    marginBottom: 12,
    marginTop: 2,
  },
  deliveryTierOption: {
    backgroundColor: '#F8FAFC',
    borderRadius: 14,
    padding: 12,
    borderWidth: 1.5,
    borderColor: '#E2E8F0',
    marginBottom: 10,
  },
  deliveryTierOptionActive: {
    backgroundColor: '#F0FDF4',
    borderColor: '#10B981',
  },
  deliveryTierTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  boltIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  conciergeIconBadge: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FEF3C7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  deliveryTierTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#0F172A',
  },
  boltFastestBadge: {
    backgroundColor: '#10B981',
    borderRadius: 6,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6,
  },
  boltFastestText: {
    fontSize: 9,
    fontWeight: '900',
    color: '#FFFFFF',
  },
  deliveryTierTime: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 1,
  },
  deliveryTierPrice: {
    fontSize: 14,
    fontWeight: '900',
    color: COLORS.emeraldDeep,
  },
  deliveryTierPerks: {
    fontSize: 10.5,
    color: '#475569',
    marginTop: 6,
    paddingTop: 6,
    borderTopWidth: 1,
    borderTopColor: '#E2E8F0',
  },

  // --- Live Bolt Tracking Card in Orders Tab ---
  boltTrackingCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1.5,
    borderColor: '#86EFAC',
    marginVertical: 10,
  },
  boltTrackingTopRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 10,
  },
  boltNetworkTag: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  boltNetworkTitle: {
    fontSize: 12,
    fontWeight: '900',
    color: '#047857',
    marginLeft: 5,
  },
  boltEtaPill: {
    backgroundColor: '#047857',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 3,
  },
  boltEtaPillText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  boltTrackingMapWrap: {
    height: 240,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: '#6EE7B7',
    marginBottom: 12,
  },
  boltTrackingMap: {
    width: '100%',
    height: '100%',
  },
  boltRiderBox: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#DCFCE7',
  },
  boltRiderAvatar: {
    width: 38,
    height: 38,
    borderRadius: 19,
    backgroundColor: '#DCFCE7',
    alignItems: 'center',
    justifyContent: 'center',
  },
  boltRiderName: {
    fontSize: 13,
    fontWeight: '800',
    color: '#0F172A',
  },
  boltRiderRating: {
    fontSize: 10.5,
    color: '#15803D',
    fontWeight: '700',
  },
  boltRiderVehicle: {
    fontSize: 10.5,
    color: '#64748B',
  },
  boltCallBtn: {
    backgroundColor: '#047857',
    borderRadius: 8,
    paddingHorizontal: 10,
    paddingVertical: 7,
    flexDirection: 'row',
    alignItems: 'center',
  },
  boltCallBtnText: {
    fontSize: 11,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Merchant Bolt Action Styles
  mBoltDispatchBtn: {
    backgroundColor: '#047857',
    borderRadius: 12,
    paddingVertical: 10,
    paddingHorizontal: 14,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 8,
  },
  mBoltDispatchBtnText: {
    fontSize: 12.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  mBoltAssignedCard: {
    backgroundColor: '#F0FDF4',
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: '#86EFAC',
    marginVertical: 6,
  },
  mBoltAssignedTitle: {
    fontSize: 11.5,
    fontWeight: '800',
    color: '#047857',
  },
  mBoltAssignedRider: {
    fontSize: 11,
    color: '#15803D',
    marginTop: 2,
  },

  // --- Add Product Modal: Suggested vs Custom Tab Switcher ---
  addModalTabContainer: {
    flexDirection: 'row',
    backgroundColor: '#FFFFFF',
    borderBottomWidth: 1,
    borderBottomColor: '#E2E8F0',
  },
  addModalTabBtn: {
    flex: 1,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
    borderBottomWidth: 3,
    borderBottomColor: 'transparent',
  },
  addModalTabBtnActive: {
    borderBottomColor: COLORS.emeraldDeep,
    backgroundColor: '#F8FAFC',
  },
  addModalTabText: {
    fontSize: 12.5,
    fontWeight: '700',
    color: '#64748B',
  },
  addModalTabTextActive: {
    color: COLORS.emeraldDeep,
    fontWeight: '800',
  },

  // Search & Filter in Add Modal
  addSearchWrap: {
    paddingHorizontal: 14,
    paddingTop: 12,
    paddingBottom: 8,
    position: 'relative',
  },
  addSearchInput: {
    backgroundColor: '#FFFFFF',
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 10,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    color: COLORS.textDark,
  },
  addSearchClearBtn: {
    position: 'absolute',
    right: 26,
    top: 22,
    padding: 4,
  },
  addCategoryScroll: {
    paddingHorizontal: 14,
    gap: 8,
    alignItems: 'center',
  },
  addCatPill: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  addCatPillActive: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldDeep,
  },
  addCatPillText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  addCatPillTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  addListHeaderNote: {
    fontSize: 11,
    color: '#64748B',
    marginBottom: 10,
    lineHeight: 16,
  },

  // Suggested Item Card
  suggestedCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 10,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  suggestedCardTopRow: {
    flexDirection: 'row',
  },
  suggestedIconWrap: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: COLORS.emeraldSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  suggestedCategoryTag: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    letterSpacing: 0.5,
  },
  suggestedRangeTag: {
    fontSize: 10.5,
    fontWeight: '700',
    color: '#64748B',
  },
  suggestedTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
    marginTop: 2,
  },
  suggestedDesc: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  suggestedBottomRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 10,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#F1F5F9',
  },
  suggestedPriceBox: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.beigeBg,
    borderRadius: 10,
    paddingHorizontal: 8,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  suggestedPricePrefix: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    marginRight: 4,
  },
  suggestedPriceInput: {
    width: 85,
    paddingVertical: 5,
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  suggestedAddBtn: {
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    flexDirection: 'row',
    alignItems: 'center',
  },
  suggestedAddBtnDone: {
    backgroundColor: '#DCFCE7',
    borderWidth: 1,
    borderColor: '#86EFAC',
  },
  suggestedAddBtnText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#FFFFFF',
  },

  // Custom Product Screen Styles
  customHeroCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  customHeroTitle: {
    fontSize: 15.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  customHeroSub: {
    fontSize: 12,
    color: '#64748B',
    marginTop: 3,
    marginBottom: 14,
    lineHeight: 16,
  },
  customFieldLabel: {
    fontSize: 11,
    fontWeight: '800',
    color: COLORS.textDark,
    letterSpacing: 0.5,
    marginTop: 10,
    marginBottom: 6,
  },
  customFieldSubLabel: {
    fontSize: 11,
    color: '#64748B',
  },
  customImagePreviewWrap: {
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    position: 'relative',
    height: 160,
  },
  customImagePreview: {
    width: '100%',
    height: 160,
  },
  customRemoveImageBtn: {
    position: 'absolute',
    top: 10,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.65)',
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  customRemoveImageText: {
    fontSize: 11,
    fontWeight: '700',
    color: '#FFFFFF',
  },
  customUploadBox: {
    borderStyle: 'dashed',
    borderWidth: 1.5,
    borderColor: COLORS.champagneGold,
    borderRadius: 14,
    padding: 22,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.beigeBg,
  },
  customUploadTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  customUploadSub: {
    fontSize: 11,
    color: '#64748B',
    marginTop: 2,
  },
  customIconCircle: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: COLORS.beigeBg,
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: 8,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  customIconCircleActive: {
    borderColor: COLORS.emeraldDeep,
    borderWidth: 2,
    backgroundColor: COLORS.emeraldSurface,
  },
  customTextInput: {
    backgroundColor: COLORS.beigeBg,
    borderRadius: 10,
    paddingHorizontal: 12,
    paddingVertical: 9,
    fontSize: 13,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    color: COLORS.textDark,
  },
  customCatChoicesRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  customCatChip: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: COLORS.beigeBg,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  customCatChipActive: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldDeep,
  },
  customCatChipText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#64748B',
  },
  customCatChipTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  customSubmitBtn: {
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    marginTop: 20,
  },
  customSubmitBtnText: {
    fontSize: 13.5,
    fontWeight: '800',
    color: '#FFFFFF',
  },
  inventoryItemImageThumbnail: {
    width: 42,
    height: 42,
    borderRadius: 8,
    marginRight: 12,
    backgroundColor: '#E2E8F0',
  },
  createStorePromptCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 6,
    elevation: 2,
  },
  createStoreIconWrap: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: COLORS.emeraldSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createStorePromptTitle: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  createStorePromptSub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 2,
    lineHeight: 16,
  },
  createStoreLaunchBtn: {
    marginTop: 14,
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  createStoreLaunchBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },

  // --- Auth & Account Center Styles ---
  authHeroCard: {
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 18,
    padding: 18,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: 'rgba(217, 169, 78, 0.3)',
  },
  authHeroBadge: {
    alignSelf: 'flex-start',
    backgroundColor: 'rgba(217, 169, 78, 0.2)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 6,
    marginBottom: 8,
  },
  authHeroBadgeText: {
    color: COLORS.goldLight,
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1,
  },
  authHeroTitle: {
    color: '#FFFFFF',
    fontSize: 18,
    fontWeight: '800',
    marginBottom: 6,
  },
  authHeroSub: {
    color: '#D1D5DB',
    fontSize: 12,
    lineHeight: 17,
  },
  authActiveUserBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  authActiveUserAvatar: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#F3F4F6',
    alignItems: 'center',
    justifyContent: 'center',
  },
  authActiveUserLabel: {
    fontSize: 9.5,
    fontWeight: '800',
    color: COLORS.emeraldPrimary,
    letterSpacing: 0.8,
  },
  authActiveUserName: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  authActiveUserRole: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  authTabsWrap: {
    flexDirection: 'row',
    backgroundColor: '#E5E7EB',
    borderRadius: 12,
    padding: 4,
    marginBottom: 16,
  },
  authTabBtn: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  authTabBtnActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.08,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  authTabBtnText: {
    fontSize: 13,
    fontWeight: '700',
    color: '#6B7280',
  },
  authTabBtnTextActive: {
    color: COLORS.emeraldDeep,
    fontWeight: '800',
  },
  authSectionBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    padding: 18,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  authSectionTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  authSectionSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    lineHeight: 17,
    marginBottom: 16,
  },
  quickDemoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 18,
  },
  quickDemoLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#E5E7EB',
  },
  quickDemoDividerText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#9CA3AF',
    letterSpacing: 1,
    marginHorizontal: 10,
  },
  quickDemoBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  quickDemoBtnIcon: {
    fontSize: 22,
  },
  quickDemoBtnTitle: {
    fontSize: 13,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  quickDemoBtnSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },

  // --- Shop Timing & Operating Hours Styles ---
  timingStoreBanner: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timingStoreName: {
    fontSize: 17,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  timingStoreSub: {
    fontSize: 12,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  timingLivePillRow: {
    marginTop: 4,
  },
  timing24Card: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1.5,
    borderColor: '#E5E7EB',
  },
  timing24CardActive: {
    borderColor: COLORS.emeraldPrimary,
    backgroundColor: '#F0FDF4',
  },
  timing24Title: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  timing24Sub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginTop: 4,
    lineHeight: 16,
  },
  timing24BadgeRow: {
    marginTop: 12,
    paddingTop: 10,
    borderTopWidth: 1,
    borderTopColor: '#DCFCE7',
  },
  timing24BadgeText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#047857',
  },
  switchToggleBase: {
    width: 52,
    height: 30,
    borderRadius: 15,
    padding: 3,
    justifyContent: 'center',
  },
  switchToggleOn: {
    backgroundColor: COLORS.emeraldPrimary,
  },
  switchToggleOff: {
    backgroundColor: '#D1D5DB',
  },
  switchToggleThumb: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  switchThumbOn: {
    alignSelf: 'flex-end',
  },
  switchThumbOff: {
    alignSelf: 'flex-start',
  },
  customTimingBox: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  customTimingSectionHeader: {
    fontSize: 15,
    fontWeight: '800',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  customTimingSectionSub: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    lineHeight: 16,
    marginBottom: 14,
  },
  timingFieldGroup: {
    marginBottom: 16,
  },
  timingPresetRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 8,
  },
  timingPresetPill: {
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 8,
    backgroundColor: '#F3F4F6',
    borderWidth: 1,
    borderColor: '#E5E7EB',
    marginBottom: 4,
  },
  timingPresetPillActive: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldDeep,
  },
  timingPresetText: {
    fontSize: 11,
    fontWeight: '600',
    color: '#4B5563',
  },
  timingPresetTextActive: {
    color: '#FFFFFF',
    fontWeight: '800',
  },
  timingPreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  timingPreviewHeader: {
    fontSize: 10,
    fontWeight: '800',
    color: '#6B7280',
    letterSpacing: 1,
    marginBottom: 8,
  },
  timingPreviewBanner: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },

  // --- Dedicated Luxury Login / Sign Up Page Styles ---
  authPageSafeArea: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  authPageScroll: {
    flex: 1,
    backgroundColor: '#FAF7F2',
  },
  authPageScrollContent: {
    paddingHorizontal: 20,
    paddingTop: 24,
    paddingBottom: 60,
  },
  authPageBrandSection: {
    alignItems: 'center',
    marginBottom: 20,
  },
  luxeLogoMedallion: {
    width: 94,
    height: 94,
    borderRadius: 47,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 12,
    borderWidth: 1.5,
    borderColor: '#DFC694',
    shadowColor: '#C5A059',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.18,
    shadowRadius: 10,
    elevation: 5,
    marginBottom: 6,
  },
  luxeLogoImg: {
    width: 52,
    height: 42,
  },
  authPageBrandTitle: {
    fontSize: 24,
    fontWeight: '900',
    color: COLORS.emeraldDeep,
    letterSpacing: 2,
  },
  luxeBrandBadgePill: {
    backgroundColor: 'rgba(217, 169, 78, 0.15)',
    paddingHorizontal: 12,
    paddingVertical: 3.5,
    borderRadius: 16,
    marginTop: 4,
    borderWidth: 1,
    borderColor: 'rgba(217, 169, 78, 0.35)',
  },
  luxeBrandBadgeText: {
    fontSize: 9.5,
    fontWeight: '800',
    color: '#8A6D3B',
    letterSpacing: 0.8,
  },
  authPageBrandTagline: {
    fontSize: 11.5,
    color: '#78716C',
    marginTop: 4,
    textAlign: 'center',
    fontWeight: '500',
  },

  // Top Portal Badges & Indicators
  luxeShopperOnlyPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 18,
    marginTop: 8,
    borderWidth: 1.5,
    borderColor: '#E2D9CC',
    elevation: 1,
  },
  luxeShopperOnlyText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    letterSpacing: 0.8,
  },
  luxeMerchantOnlyPill: {
    backgroundColor: '#FFFBEB',
    paddingHorizontal: 14,
    paddingVertical: 5,
    borderRadius: 18,
    borderWidth: 1.5,
    borderColor: '#FDE68A',
  },
  luxeMerchantOnlyText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: '#92400E',
    letterSpacing: 0.8,
  },
  luxeBackToBuyerPill: {
    marginTop: 6,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
    backgroundColor: '#F5EFE6',
  },
  luxeBackToBuyerText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emeraldDeep,
    textDecorationLine: 'underline',
  },

  // Luxury Card
  luxeAuthCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 20,
    padding: 18,
    borderWidth: 1.5,
    borderColor: '#EFE7DA',
    shadowColor: '#443A2B',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.06,
    shadowRadius: 12,
    elevation: 3,
    marginBottom: 12,
  },
  luxeCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  luxeCardTitle: {
    fontSize: 16,
    fontWeight: '800',
    color: '#1C1917',
    letterSpacing: 0.2,
  },
  luxeCardSub: {
    fontSize: 11,
    color: '#78716C',
    marginTop: 2,
    lineHeight: 15,
  },
  luxePortalBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 8,
    borderWidth: 1,
  },
  buyerBadgePill: {
    backgroundColor: '#ECFDF5',
    borderColor: '#A7F3D0',
  },
  buyerBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#047857',
    letterSpacing: 0.5,
  },
  merchantBadgePill: {
    backgroundColor: '#FFFBEB',
    borderColor: '#FDE68A',
  },
  merchantBadgeText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#B45309',
    letterSpacing: 0.5,
  },

  // Mode Switcher Pills
  luxeModePillsWrap: {
    flexDirection: 'row',
    backgroundColor: '#F5EFE6',
    borderRadius: 12,
    padding: 3,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: '#E8DFD0',
  },
  luxeModePillBtn: {
    flex: 1,
    paddingVertical: 7,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
  },
  luxeModePillActive: {
    backgroundColor: '#FFFFFF',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.05,
    shadowRadius: 2,
    shadowOffset: { width: 0, height: 1 },
  },
  luxeModePillText: {
    fontSize: 12,
    fontWeight: '700',
    color: '#78716C',
  },
  luxeModePillTextActive: {
    color: COLORS.emeraldDeep,
    fontWeight: '800',
  },

  // Luxury Organized Input Boxes
  luxeFormContainer: {
    gap: 2,
  },
  luxeInputBox: {
    height: 50,
    backgroundColor: '#FAFAF9',
    borderRadius: 12,
    borderWidth: 1.5,
    borderColor: '#E7DFD3',
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    marginBottom: 8,
  },
  luxeInputIconWrap: {
    width: 30,
    height: 30,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#EAE1D5',
    marginRight: 8,
  },
  luxeInputIcon: {
    fontSize: 14,
  },
  luxeInputContent: {
    flex: 1,
    justifyContent: 'center',
  },
  luxeInputLabel: {
    fontSize: 8.5,
    fontWeight: '800',
    color: '#8C827A',
    letterSpacing: 0.6,
    marginBottom: 1,
  },
  luxeTextInput: {
    fontSize: 13,
    fontWeight: '600',
    color: '#1C1917',
    padding: 0,
    margin: 0,
  },
  luxeEyeToggleBtn: {
    paddingHorizontal: 7,
    paddingVertical: 3,
    borderRadius: 6,
    backgroundColor: '#F5EFE6',
  },
  luxeEyeToggleText: {
    fontSize: 10.5,
    fontWeight: '700',
    color: COLORS.emeraldDeep,
  },

  // Action Buttons
  luxePrimaryBtn: {
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 4,
    elevation: 2,
    shadowColor: COLORS.emeraldDeep,
    shadowOpacity: 0.2,
    shadowRadius: 6,
    shadowOffset: { width: 0, height: 3 },
  },
  luxePrimaryBtnText: {
    color: '#FFFFFF',
    fontSize: 13.5,
    fontWeight: '800',
    letterSpacing: 0.3,
  },
  luxeDemoDivider: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  luxeDemoLine: {
    flex: 1,
    height: 1,
    backgroundColor: '#EAE1D5',
  },
  luxeDemoDividerText: {
    fontSize: 9,
    fontWeight: '800',
    color: '#A8A29E',
    letterSpacing: 0.8,
    marginHorizontal: 8,
  },
  luxeDemoCardBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#F5EFE6',
    borderRadius: 11,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderWidth: 1,
    borderColor: '#E2D9CC',
    marginTop: 8,
  },
  luxeDemoIconBadge: {
    width: 26,
    height: 26,
    borderRadius: 8,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  luxeDemoCardTitle: {
    fontSize: 11.5,
    fontWeight: '700',
    color: '#44403C',
  },
  luxeDemoCardSub: {
    fontSize: 10,
    color: '#78716C',
    marginTop: 1,
  },
  luxeGuestBrowseBtn: {
    alignItems: 'center',
    marginTop: 8,
    paddingVertical: 4,
  },
  luxeGuestBrowseText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.emeraldDeep,
    textDecorationLine: 'underline',
  },
  luxeOptionalToggle: {
    alignItems: 'center',
    paddingVertical: 4,
    marginVertical: 2,
  },
  luxeOptionalToggleText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.emeraldPrimary,
  },

  // VIP Partner Bar
  luxeVipPartnerBar: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    paddingVertical: 11,
    paddingHorizontal: 14,
    borderWidth: 1.5,
    borderColor: '#DFD7C7',
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.04,
    shadowRadius: 4,
    shadowOffset: { width: 0, height: 2 },
  },
  luxeVipPartnerIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFBEB',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: '#FDE68A',
  },
  luxeVipPartnerTitle: {
    fontSize: 12,
    fontWeight: '700',
    color: '#44403C',
  },
  luxeVipPartnerSub: {
    fontSize: 10,
    color: '#78716C',
    marginTop: 1,
  },
  luxeVipPartnerArrowPill: {
    backgroundColor: '#F5EFE6',
    borderRadius: 8,
    paddingHorizontal: 8,
    paddingVertical: 4,
    marginLeft: 6,
  },
  luxeVipPartnerArrowText: {
    fontSize: 12,
    fontWeight: '800',
    color: '#92400E',
    marginLeft: 6,
  },

  // --- Form Fallback Styles ---
  formFieldGroup: {
    marginBottom: 16,
  },
  formLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  formInput: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 12,
    fontSize: 13,
    color: COLORS.textDark,
  },

  // --- Friendly Edit Store Profile Styles ---
  editProfileSafeArea: {
    flex: 1,
    backgroundColor: COLORS.beigeBg,
  },
  editProfileHeader: {
    backgroundColor: COLORS.emeraldDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(255, 255, 255, 0.12)',
  },
  editProfileCloseBtn: {
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  editProfileCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 12.5,
    fontWeight: '700',
  },
  editProfileHeaderCenter: {
    alignItems: 'center',
  },
  editProfileHeaderTitle: {
    color: '#FFFFFF',
    fontSize: 16,
    fontWeight: '800',
    letterSpacing: 0.2,
  },
  editProfileHeaderSub: {
    color: COLORS.emeraldSurface,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  editProfileHeaderSaveBtn: {
    backgroundColor: COLORS.emeraldLight,
    paddingVertical: 6,
    paddingHorizontal: 14,
    borderRadius: 20,
    elevation: 2,
    shadowColor: '#000',
    shadowOpacity: 0.15,
    shadowRadius: 3,
    shadowOffset: { width: 0, height: 1 },
  },
  editProfileHeaderSaveBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  editProfileScrollView: {
    flex: 1,
    backgroundColor: COLORS.beigeBg,
  },
  editProfileScrollContent: {
    padding: 16,
    paddingBottom: 60,
  },
  editProfileSectionHeader: {
    marginBottom: 10,
    marginTop: 4,
  },
  editProfileSectionTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    letterSpacing: 0.2,
  },
  editProfileSectionSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 2,
  },
  editProfilePreviewCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    marginBottom: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
  },
  editProfilePreviewImageWrap: {
    position: 'relative',
    width: '100%',
    height: 140,
    backgroundColor: '#1E293B',
  },
  editProfilePreviewImage: {
    width: '100%',
    height: '100%',
  },
  editProfilePreviewGradientOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.18)',
  },
  editProfilePreviewBadgesRow: {
    position: 'absolute',
    top: 10,
    left: 10,
    flexDirection: 'row',
    gap: 6,
  },
  editProfilePreviewBadge: {
    backgroundColor: 'rgba(6, 78, 59, 0.92)',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 12,
  },
  editProfilePreviewBadgeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },
  editProfilePreviewChangePhotoBtn: {
    position: 'absolute',
    bottom: 10,
    right: 10,
    backgroundColor: 'rgba(25, 30, 36, 0.85)',
    paddingHorizontal: 11,
    paddingVertical: 5.5,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  editProfilePreviewChangePhotoText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  editProfilePreviewDetails: {
    padding: 13,
  },
  editProfilePreviewStoreName: {
    fontSize: 17,
    fontWeight: '900',
    color: COLORS.textDark,
    marginBottom: 4,
  },
  editProfilePreviewMetaRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  editProfilePreviewCategoryTag: {
    backgroundColor: COLORS.emeraldSurface,
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  editProfilePreviewCategoryText: {
    color: COLORS.emeraldDeep,
    fontSize: 11,
    fontWeight: '700',
  },
  editProfilePreviewFeeTag: {
    backgroundColor: '#FEF3C7',
    paddingHorizontal: 8,
    paddingVertical: 3.5,
    borderRadius: 6,
  },
  editProfilePreviewFeeText: {
    color: '#92400E',
    fontSize: 11,
    fontWeight: '700',
  },
  editProfilePreviewAddress: {
    fontSize: 11.5,
    color: COLORS.textMuted,
  },
  editProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    marginBottom: 14,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
  },
  editProfileCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 14,
    paddingBottom: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  editProfileCardIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: COLORS.emeraldSurface,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileCardTitle: {
    fontSize: 14,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  editProfileCardSubtitle: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  editProfileInputGroup: {
    marginBottom: 2,
  },
  editProfileInputLabel: {
    fontSize: 10,
    fontWeight: '800',
    color: COLORS.textMuted,
    letterSpacing: 0.8,
    marginBottom: 6,
  },
  editProfileInputWrap: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.beigeBg,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    paddingHorizontal: 12,
    minHeight: 46,
  },
  editProfileInputLeadingIcon: {
    fontSize: 15,
    marginRight: 8,
  },
  editProfileInput: {
    flex: 1,
    fontSize: 13,
    color: COLORS.textDark,
    paddingVertical: 10,
  },
  editProfileClearBtn: {
    padding: 4,
  },
  editProfileInputHint: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 5,
  },
  editProfileChipsWrap: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
    marginTop: 4,
  },
  editProfileChip: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.beigeBg,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 20,
  },
  editProfileChipSelected: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldDeep,
  },
  editProfileChipIcon: {
    fontSize: 12,
    marginRight: 5,
  },
  editProfileChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  editProfileChipTextSelected: {
    color: '#FFFFFF',
  },
  editProfileUploadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.emeraldSurface,
    borderWidth: 1,
    borderColor: COLORS.emeraldPrimary,
    borderRadius: 12,
    padding: 12,
    marginBottom: 8,
  },
  editProfileUploadBtnIconBox: {
    width: 36,
    height: 36,
    borderRadius: 10,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfileUploadBtnTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
  },
  editProfileUploadBtnSubtitle: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  editProfileUploadBtnArrow: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
    marginLeft: 8,
  },
  editProfilePresetThumbCard: {
    width: 115,
    height: 88,
    borderRadius: 10,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.borderBeige,
    position: 'relative',
    backgroundColor: '#FFFFFF',
  },
  editProfilePresetThumbCardActive: {
    borderColor: COLORS.emeraldPrimary,
    borderWidth: 2.5,
  },
  editProfilePresetThumbImg: {
    width: '100%',
    height: 56,
  },
  editProfilePresetThumbFooter: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 6,
    paddingVertical: 3.5,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 3,
  },
  editProfilePresetThumbTitle: {
    fontSize: 9.5,
    fontWeight: '700',
    color: COLORS.textDark,
    flex: 1,
  },
  editProfilePresetCheckBadge: {
    position: 'absolute',
    top: 4,
    right: 4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: COLORS.emeraldPrimary,
    alignItems: 'center',
    justifyContent: 'center',
  },
  editProfilePrimarySaveBtn: {
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 14,
    paddingVertical: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 10,
    elevation: 3,
    shadowColor: COLORS.emeraldDeep,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
  },
  editProfilePrimarySaveBtnText: {
    color: '#FFFFFF',
    fontSize: 14.5,
    fontWeight: '800',
    letterSpacing: 0.4,
  },
  editProfileFooterNote: {
    textAlign: 'center',
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 12,
    marginBottom: 10,
  },

  // --- Buyer Map Explore & Store View Mode Switcher ---
  storeViewModeSwitcher: {
    flexDirection: 'row',
    backgroundColor: '#EDE8DF',
    borderRadius: 20,
    padding: 3,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  storeViewModeBtn: {
    paddingHorizontal: 10,
    paddingVertical: 4.5,
    borderRadius: 16,
  },
  storeViewModeBtnActive: {
    backgroundColor: COLORS.emeraldDeep,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.15,
    shadowRadius: 2,
  },
  storeViewModeText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textMuted,
  },
  storeViewModeTextActive: {
    color: '#FFFFFF',
  },
  buyerExploreMapCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    borderWidth: 1.5,
    borderColor: COLORS.borderBeige,
    marginHorizontal: 16,
    marginTop: 10,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 6,
    position: 'relative',
  },
  buyerExploreMapCanvas: {
    width: '100%',
    height: 390,
  },
  buyerMapBanner: {
    position: 'absolute',
    top: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(6, 78, 59, 0.92)',
    paddingVertical: 7,
    paddingHorizontal: 12,
    borderRadius: 20,
    alignItems: 'center',
  },
  buyerMapBannerText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '700',
  },
  customStoreMarkerPill: {
    backgroundColor: '#FFFFFF',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 16,
    borderWidth: 1.5,
    borderColor: COLORS.emeraldPrimary,
    flexDirection: 'row',
    alignItems: 'center',
    elevation: 3,
  },
  customStoreMarkerPillActive: {
    backgroundColor: COLORS.emeraldDeep,
    borderColor: COLORS.emeraldLight,
  },
  customStoreMarkerText: {
    fontSize: 10.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  customStoreMarkerTextActive: {
    color: '#FFFFFF',
  },
  buyerMapSelectedStoreCard: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: '#FFFFFF',
    borderRadius: 14,
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    elevation: 4,
  },
  buyerMapStoreThumb: {
    width: 50,
    height: 50,
    borderRadius: 10,
  },
  buyerMapStoreTitle: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  buyerMapStoreSub: {
    fontSize: 10.5,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  buyerMapStoreHours: {
    fontSize: 10,
    color: COLORS.emeraldPrimary,
    fontWeight: '700',
    marginTop: 1,
  },
  buyerMapEnterStoreBtn: {
    backgroundColor: COLORS.emeraldPrimary,
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 10,
  },
  buyerMapEnterStoreBtnText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  buyerMapTapHint: {
    position: 'absolute',
    bottom: 12,
    left: 12,
    right: 12,
    backgroundColor: 'rgba(25, 30, 36, 0.85)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 12,
    alignItems: 'center',
  },
  buyerMapTapHintText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '600',
  },

  // --- Merchant Store Location Mini Map & Full Pin Picker Modal ---
  storeMiniMapContainer: {
    width: '100%',
    height: 210,
    borderRadius: 14,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    marginTop: 6,
    position: 'relative',
  },
  storeMiniMap: {
    width: '100%',
    height: '100%',
  },
  storeMiniMapTopHint: {
    position: 'absolute',
    top: 8,
    left: 8,
    right: 48,
    backgroundColor: 'rgba(15, 23, 42, 0.78)',
    paddingHorizontal: 9,
    paddingVertical: 5,
    borderRadius: 12,
  },
  storeMiniMapTopHintText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '700',
  },
  storeMiniMapZoomFabCol: {
    position: 'absolute',
    top: 8,
    right: 8,
    flexDirection: 'column',
    gap: 6,
    zIndex: 10,
  },
  storeMiniMapZoomBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.18,
    shadowRadius: 2,
  },
  storeMiniMapZoomText: {
    fontSize: 13,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
  },
  storeMiniMapBadge: {
    position: 'absolute',
    bottom: 8,
    left: 8,
    backgroundColor: 'rgba(6, 78, 59, 0.92)',
    paddingHorizontal: 9,
    paddingVertical: 4,
    borderRadius: 12,
  },
  storeMiniMapBadgeText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '800',
  },
  storeMapActionRow: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 10,
  },
  storeMapOpenBtn: {
    flex: 1,
    backgroundColor: COLORS.emeraldSurface,
    borderWidth: 1,
    borderColor: COLORS.emeraldPrimary,
    borderRadius: 10,
    paddingVertical: 10,
    alignItems: 'center',
  },
  storeMapOpenBtnText: {
    fontSize: 11.5,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
  },
  storeMapGpsBtn: {
    backgroundColor: '#FFFFFF',
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    borderRadius: 10,
    paddingVertical: 10,
    paddingHorizontal: 12,
    alignItems: 'center',
  },
  storeMapGpsBtnText: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  storeMapModalSafeArea: {
    flex: 1,
    backgroundColor: COLORS.beigeBg,
    paddingTop: Platform.OS === 'android' ? (StatusBar.currentHeight || 24) : 0,
  },
  storeMapModalHeader: {
    backgroundColor: COLORS.emeraldDeep,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
  },
  storeMapModalCloseBtn: {
    paddingVertical: 5,
    paddingHorizontal: 10,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
  },
  storeMapModalCloseBtnText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '700',
  },
  storeMapModalTitle: {
    color: '#FFFFFF',
    fontSize: 15,
    fontWeight: '800',
  },
  storeMapModalSub: {
    color: COLORS.emeraldSurface,
    fontSize: 10,
    fontWeight: '600',
    marginTop: 1,
  },
  storeMapModalConfirmHeaderBtn: {
    backgroundColor: COLORS.emeraldLight,
    paddingVertical: 5,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  storeMapModalConfirmHeaderText: {
    color: '#FFFFFF',
    fontSize: 12,
    fontWeight: '800',
  },
  storeMapChipsContainer: {
    backgroundColor: '#FFFFFF',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.borderLight,
  },
  storeMapChip: {
    backgroundColor: COLORS.beigeBg,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  storeMapChipText: {
    fontSize: 11,
    fontWeight: '700',
    color: COLORS.textDark,
  },
  storeMapFloatCoordsBanner: {
    position: 'absolute',
    top: 12,
    left: 14,
    right: 70,
    backgroundColor: 'rgba(6, 78, 59, 0.94)',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderRadius: 16,
  },
  storeMapFloatCoordsText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: '800',
  },
  storeMapFloatSubText: {
    color: COLORS.emeraldSurface,
    fontSize: 9.5,
    fontWeight: '600',
    marginTop: 2,
  },
  storeMapFabStack: {
    position: 'absolute',
    top: 12,
    right: 14,
    flexDirection: 'column',
    gap: 8,
    zIndex: 10,
  },
  storeMapFabBtn: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  storeMapFabZoomText: {
    fontSize: 18,
    fontWeight: '800',
    color: COLORS.emeraldDeep,
  },
  storeMapFabGps: {
    position: 'absolute',
    top: 10,
    right: 14,
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFFFFF',
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 4,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  storeMapBottomConfirmBar: {
    position: 'absolute',
    bottom: 16,
    left: 16,
    right: 16,
    backgroundColor: '#FFFFFF',
    borderRadius: 16,
    padding: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
    elevation: 5,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 6,
  },
  storeMapBottomPromptTitle: {
    fontSize: 13.5,
    fontWeight: '800',
    color: COLORS.textDark,
  },
  storeMapBottomPromptSub: {
    fontSize: 11,
    color: COLORS.textMuted,
    marginTop: 1,
  },
  storeMapBottomConfirmBtn: {
    backgroundColor: COLORS.emeraldDeep,
    borderRadius: 12,
    paddingVertical: 13,
    alignItems: 'center',
    justifyContent: 'center',
  },
  storeMapBottomConfirmBtnText: {
    color: '#FFFFFF',
    fontSize: 13,
    fontWeight: '800',
  },
  // --- ANIMATED CLOSED STOREFRONT DOOR STYLES ---
  doorPortalContainer: {
    width: '100%',
    backgroundColor: '#0F172A',
    borderBottomWidth: 2,
    borderBottomColor: '#334155',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.35,
    shadowRadius: 8,
  },
  doorPortalHeader: {
    backgroundColor: '#090D16',
    paddingVertical: 9,
    paddingHorizontal: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderBottomWidth: 1,
    borderBottomColor: '#1E293B',
  },
  doorPortalHeaderTitle: {
    color: '#F59E0B',
    fontSize: 11,
    fontWeight: '800',
    letterSpacing: 0.8,
  },
  doorPortalStatusPill: {
    backgroundColor: '#DC2626',
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 6,
  },
  doorPortalStatusPillText: {
    color: '#FFFFFF',
    fontSize: 10,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  doorStage: {
    height: 210,
    backgroundColor: '#0B0F19',
    position: 'relative',
    overflow: 'hidden',
  },
  doorInteriorBackdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: '#111827',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 10,
  },
  doorInteriorBackdropText: {
    color: '#475569',
    fontSize: 10,
    fontWeight: '800',
    letterSpacing: 1.2,
    marginTop: 6,
  },
  doorsWrap: {
    flexDirection: 'row',
    width: '100%',
    height: '100%',
  },
  doorPanel: {
    width: '50%',
    height: '100%',
    backgroundColor: '#23150C',
    padding: 8,
    justifyContent: 'space-between',
  },
  doorPanelLeft: {
    borderRightWidth: 2,
    borderRightColor: '#5C331B',
    borderLeftWidth: 1,
    borderLeftColor: '#382012',
  },
  doorPanelRight: {
    borderLeftWidth: 2,
    borderLeftColor: '#5C331B',
    borderRightWidth: 1,
    borderRightColor: '#382012',
  },
  doorWindowRow: {
    flexDirection: 'row',
    gap: 6,
    justifyContent: 'center',
  },
  doorWindowPane: {
    flex: 1,
    height: 44,
    backgroundColor: 'rgba(245, 158, 11, 0.08)',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#4A2818',
    overflow: 'hidden',
    position: 'relative',
  },
  doorGlassHighlight: {
    position: 'absolute',
    top: 0,
    left: 0,
    width: 14,
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.12)',
    transform: [{ skewX: '-20deg' }],
  },
  doorKickPlate: {
    height: 28,
    backgroundColor: '#170E08',
    borderRadius: 4,
    borderWidth: 1,
    borderColor: '#422413',
    alignItems: 'center',
    justifyContent: 'center',
  },
  doorHandleLeft: {
    position: 'absolute',
    right: 6,
    top: '44%',
    width: 6,
    height: 48,
    backgroundColor: '#F59E0B',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#B45309',
    elevation: 4,
  },
  doorHandleRight: {
    position: 'absolute',
    left: 6,
    top: '44%',
    width: 6,
    height: 48,
    backgroundColor: '#F59E0B',
    borderRadius: 3,
    borderWidth: 1,
    borderColor: '#B45309',
    elevation: 4,
  },
  hangingSignWrapper: {
    position: 'absolute',
    top: 8,
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 20,
  },
  hangingSignChainsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    width: 120,
    marginBottom: -4,
  },
  hangingSignBoard: {
    backgroundColor: '#1C1917',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 10,
    paddingVertical: 7,
    paddingHorizontal: 16,
    alignItems: 'center',
    elevation: 7,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.45,
    shadowRadius: 5,
  },
  hangingSignTitle: {
    color: '#FEF08A',
    fontSize: 12,
    fontWeight: '900',
    letterSpacing: 0.5,
  },
  hangingSignSub: {
    color: '#E2E8F0',
    fontSize: 10.5,
    fontWeight: '700',
    marginTop: 2,
  },
  doorCenterLock: {
    position: 'absolute',
    top: '44%',
    left: 0,
    right: 0,
    alignItems: 'center',
    zIndex: 25,
  },
  doorCenterLockInner: {
    backgroundColor: '#DC2626',
    borderWidth: 2,
    borderColor: '#F59E0B',
    borderRadius: 20,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.5,
    shadowRadius: 5,
  },
  doorCenterLockText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginLeft: 5,
  },
  doorSpeechBubble: {
    backgroundColor: '#FEF3C7',
    paddingVertical: 9,
    paddingHorizontal: 14,
    borderTopWidth: 1,
    borderTopColor: '#FDE68A',
  },
  doorSpeechBubbleText: {
    color: '#92400E',
    fontSize: 11.5,
    fontWeight: '700',
    lineHeight: 16,
  },
  doorFooterBar: {
    backgroundColor: '#0B0F19',
    paddingVertical: 8,
    paddingHorizontal: 12,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  doorKnockActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  doorKnockActionBtnText: {
    color: '#F8FAFC',
    fontSize: 11.5,
    fontWeight: '700',
  },
  doorReplayActionBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E293B',
    paddingHorizontal: 12,
    paddingVertical: 7,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#475569',
  },
  doorReplayActionBtnText: {
    color: '#CBD5E1',
    fontSize: 11,
    fontWeight: '700',
  },
  doorCustomerAdviceBox: {
    backgroundColor: '#131D2E',
    paddingVertical: 8,
    paddingHorizontal: 12,
    borderTopWidth: 1,
    borderTopColor: '#1E293B',
  },
  doorCustomerAdviceText: {
    color: '#94A3B8',
    fontSize: 10.5,
    lineHeight: 15,
  },
  // Store Card Closed Door Overlay Styles
  storeClosedDoorCardOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(15, 23, 42, 0.85)',
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
  },
  cardClosedDoorPanelLeft: {
    position: 'absolute',
    left: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: '#23150C',
    borderRightWidth: 1.5,
    borderRightColor: '#5C331B',
    opacity: 0.94,
  },
  cardClosedDoorPanelRight: {
    position: 'absolute',
    right: 0,
    top: 0,
    bottom: 0,
    width: '50%',
    backgroundColor: '#23150C',
    borderLeftWidth: 1.5,
    borderLeftColor: '#5C331B',
    opacity: 0.94,
  },
  cardClosedLockBadge: {
    position: 'absolute',
    top: '36%',
    backgroundColor: '#DC2626',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 16,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 5,
    paddingHorizontal: 12,
    zIndex: 15,
    elevation: 6,
  },
  cardClosedLockBadgeText: {
    color: '#FFFFFF',
    fontSize: 10.5,
    fontWeight: '900',
    letterSpacing: 0.8,
    marginLeft: 5,
  },
  cardClosedSignBoard: {
    position: 'absolute',
    bottom: 12,
    backgroundColor: '#1C1917',
    borderWidth: 1.5,
    borderColor: '#F59E0B',
    borderRadius: 8,
    paddingVertical: 4,
    paddingHorizontal: 10,
    zIndex: 15,
  },
  cardClosedSignBoardText: {
    color: '#FEF08A',
    fontSize: 9.5,
    fontWeight: '800',
    letterSpacing: 0.5,
  },

  mStraightTrackContainer: {
    backgroundColor: '#0F172A',
    borderRadius: 14,
    padding: 12,
    marginVertical: 8,
    borderWidth: 1,
    borderColor: '#1E293B',
    width: '100%',
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 4,
  },
  mStraightTrackHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexWrap: 'wrap',
    gap: 6,
    marginBottom: 6,
  },
  mStraightTitleGroup: {
    flexDirection: 'row',
    alignItems: 'center',
    flexShrink: 1,
    marginRight: 4,
  },
  mStraightRadarDot: {
    width: 7,
    height: 7,
    borderRadius: 4,
    backgroundColor: '#10B981',
    marginRight: 6,
  },
  mStraightTrackTitle: {
    fontSize: 10,
    fontWeight: '900',
    color: '#10B981',
    letterSpacing: 0.6,
  },
  mStraightEtaPill: {
    backgroundColor: 'rgba(16, 185, 129, 0.15)',
    paddingHorizontal: 7,
    paddingVertical: 2.5,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: 'rgba(16, 185, 129, 0.3)',
    flexShrink: 0,
  },
  mStraightEtaText: {
    fontSize: 10,
    fontWeight: '800',
    color: '#34D399',
  },
  mStraightRiderRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: 6,
    marginBottom: 8,
  },
  mStraightRiderText: {
    fontSize: 11,
    color: '#94A3B8',
    fontWeight: '600',
    flex: 1,
    flexShrink: 1,
  },
  mStraightPinBadge: {
    backgroundColor: 'rgba(30, 41, 59, 0.9)',
    paddingHorizontal: 7,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: 'rgba(52, 211, 153, 0.25)',
    flexShrink: 0,
  },
  mStraightPinBadgeText: {
    fontSize: 10.5,
    color: '#CBD5E1',
    fontWeight: '700',
  },
  mStraightLineWrapper: {
    height: 38,
    justifyContent: 'center',
    position: 'relative',
    marginHorizontal: 12,
    marginVertical: 4,
  },
  mStraightTrackBackground: {
    height: 5,
    backgroundColor: '#334155',
    borderRadius: 3,
    width: '100%',
  },
  mStraightTrackFill: {
    position: 'absolute',
    left: 0,
    height: 5,
    backgroundColor: '#10B981',
    borderRadius: 3,
  },
  mStraightOriginNode: {
    position: 'absolute',
    left: 0,
    top: 15,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -4 }],
  },
  mStraightOriginDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: '#64748B',
  },
  mStraightMiddleStopWrapper: {
    position: 'absolute',
    left: '50%',
    top: 10,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: -9 }],
  },
  mStraightStopNode: {
    width: 18,
    height: 18,
    borderRadius: 9,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1.5,
    borderColor: '#0F172A',
  },
  mStraightStopNodeActive: {
    backgroundColor: '#F59E0B',
  },
  mStraightStopNodeDone: {
    backgroundColor: '#10B981',
  },
  mStraightStopNodeText: {
    color: '#FFFFFF',
    fontSize: 9.5,
    fontWeight: '900',
  },
  mStraightDestNodeWrapper: {
    position: 'absolute',
    right: 0,
    top: 8,
    alignItems: 'center',
    justifyContent: 'center',
    transform: [{ translateX: 10 }],
  },
  mStraightDestNode: {
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: '#065F46',
    borderWidth: 1.5,
    borderColor: '#34D399',
    alignItems: 'center',
    justifyContent: 'center',
  },
  mStraightBikeMarker: {
    position: 'absolute',
    top: 5,
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 10,
    transform: [{ translateX: -14 }],
  },
  mStraightBikeBubble: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: '#1E293B',
    borderWidth: 1.5,
    borderColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.35,
    shadowRadius: 3,
    elevation: 4,
  },
  mStraightMilestonesRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginTop: 2,
    marginBottom: 6,
    paddingHorizontal: 2,
  },
  mStraightMilestoneLeft: {
    fontSize: 9,
    color: '#64748B',
    fontWeight: '700',
    flex: 1,
    textAlign: 'left',
  },
  mStraightMilestoneCenter: {
    fontSize: 9,
    color: '#F59E0B',
    fontWeight: '800',
    flex: 1,
    textAlign: 'center',
  },
  mStraightMilestoneRight: {
    fontSize: 9,
    color: '#A7F3D0',
    fontWeight: '800',
    flex: 1,
    textAlign: 'right',
  },
  mStraightStatusBanner: {
    backgroundColor: 'rgba(30, 41, 59, 0.7)',
    borderRadius: 8,
    paddingHorizontal: 9,
    paddingVertical: 6,
    marginTop: 2,
    borderLeftWidth: 3,
    borderLeftColor: '#10B981',
  },
  mStraightStatusText: {
    fontSize: 10.5,
    color: '#E2E8F0',
    fontWeight: '600',
    lineHeight: 15,
  },

});
