import React, { useState, useRef, useEffect } from 'react';
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
  Linking,
  ActivityIndicator,
} from 'react-native';
import MapView, { Marker } from 'react-native-maps';
import * as Location from 'expo-location';
import * as DocumentPicker from 'expo-document-picker';
import { SAMPLE_BOLT_RIDERS } from './services/boltDeliveryService';

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

export default function App() {
  const [selectedLocation, setSelectedLocation] = useState('Plot 14 Gana Street, Maitama, Abuja');
  const [locationModalVisible, setLocationModalVisible] = useState(false);
  const [activeCategory, setActiveCategory] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [favorites, setFavorites] = useState(['s1', 's3']);

  // Pinned Map Location State for Customer & Riders
  const mapRef = useRef(null);
  const cartMapRef = useRef(null);
  const [cameFromCart, setCameFromCart] = useState(false);
  const searchDebounceRef = useRef(null);
  const [mapSearchText, setMapSearchText] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLocatingUser, setIsLocatingUser] = useState(false);
  const [isSearchingGeocode, setIsSearchingGeocode] = useState(false);
  const [userLiveCoords, setUserLiveCoords] = useState(null);
  const [activeSearchPins, setActiveSearchPins] = useState([]);
  const [liveApiResults, setLiveApiResults] = useState([]);

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

  // Cart State
  const [cart, setCart] = useState([]);
  const [cartModalVisible, setCartModalVisible] = useState(false);
  const [checkoutModalVisible, setCheckoutModalVisible] = useState(false);
  const [selectedDeliveryTier, setSelectedDeliveryTier] = useState('bolt'); // 'bolt' | 'concierge'

  const [storesList, setStoresList] = useState(STORES_AROUND_ME);
  const [appMode, setAppMode] = useState('customer'); // 'customer' | 'merchant'
  const [merchantTab, setMerchantTab] = useState('orders'); // 'orders' | 'inventory' | 'finances' | 'store'
  const [merchantStoreId, setMerchantStoreId] = useState('s1'); // default: The Gourmet Emporium
  const [merchantOrderFilter, setMerchantOrderFilter] = useState('all'); // 'all' | 'new' | 'preparing' | 'ready' | 'completed'
  const [storeOpenStatus, setStoreOpenStatus] = useState(true);
  const [addProductModalVisible, setAddProductModalVisible] = useState(false);
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

  // Active Orders
  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'orders' | 'profile'
  const [orders, setOrders] = useState([
    {
      id: 'ORD-98231',
      storeName: 'The Gourmet Emporium',
      itemsCount: 3,
      items: [
        { id: 'gp1', name: 'Truffle Infused Extra Virgin Oil (250ml)', price: 16500, qty: 1, icon: '🫒' },
        { id: 'gp2', name: 'Aged Parmigiano Reggiano (300g)', price: 12800, qty: 1, icon: '🧀' },
        { id: 'gp3', name: 'Organic Cold-Pressed Valencia Juices', price: 4200, qty: 1, icon: '🍊' },
      ],
      total: 33500,
      vendorPayout: 30150,
      status: 'On the Way',
      deliveryPartner: 'bolt',
      boltStatus: 'IN_TRANSIT',
      boltTrackingCode: 'BOLT-ABJ-89412',
      boltRider: {
        name: 'Musa Ibrahim',
        phone: '+234 803 294 1194',
        rating: '4.95',
        trips: 1420,
        vehicle: 'Bajaj Boxer 150 (Red)',
        plate: 'ABJ-492-KW',
      },
      boltCoords: {
        latitude: 9.0912,
        longitude: 7.4912,
      },
      eta: '11 mins',
      deliveryPin: '4928',
      pickupPin: '7391',
      customerName: 'Chief Emeka Okafor',
      customerAddress: 'Plot 14 Gana Street, Maitama, Abuja',
      deliveryLocation: {
        latitude: 9.0882,
        longitude: 7.4933,
        landmark: 'Opposite Transcorp Hilton, Black Gate with Security Post',
        apartment: 'Suite 4B',
        notes: 'Call on arrival for estate gate clearance',
      },
      createdAt: '12:45 PM',
    },
    {
      id: 'ORD-98240',
      storeName: 'The Gourmet Emporium',
      itemsCount: 2,
      items: [
        { id: 'gp5', name: 'Smoked Atlantic Salmon Fillet (200g)', price: 14200, qty: 1, icon: '🐟' },
        { id: 'gp7', name: 'San Pellegrino Sparkling Water (750ml)', price: 2900, qty: 2, icon: '🍾' },
      ],
      total: 20000,
      vendorPayout: 18000,
      status: 'New Order',
      eta: '25 mins',
      deliveryPin: '8214',
      pickupPin: '3940',
      customerName: 'Hajiya Aisha Danjuma',
      customerAddress: 'Nelson Mandela Street, Asokoro, Abuja',
      deliveryLocation: {
        latitude: 9.0435,
        longitude: 7.5218,
        landmark: 'Close to ECOWAS Secretariat, Villa 7',
        apartment: 'Villa 7',
      },
      createdAt: '1:10 PM',
    },
  ]);

  // Live Animated Bolt Motorbike Rider Glide Simulation
  useEffect(() => {
    const timer = setInterval(() => {
      setOrders((prev) =>
        prev.map((ord) => {
          if (
            ord.deliveryPartner === 'bolt' &&
            ord.boltCoords &&
            ord.deliveryLocation &&
            (ord.status === 'On the Way' || ord.boltStatus === 'IN_TRANSIT')
          ) {
            // Nudge rider 10% closer to customer dropoff destination
            const targetLat = ord.deliveryLocation.latitude;
            const targetLng = ord.deliveryLocation.longitude;
            const stepLat = (targetLat - ord.boltCoords.latitude) * 0.12;
            const stepLng = (targetLng - ord.boltCoords.longitude) * 0.12;
            return {
              ...ord,
              boltCoords: {
                latitude: ord.boltCoords.latitude + stepLat,
                longitude: ord.boltCoords.longitude + stepLng,
              },
            };
          }
          return ord;
        })
      );
    }, 4000);
    return () => clearInterval(timer);
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
    closeLocationModal();
    Alert.alert(
      'Location Pinned on Map! 📍',
      `Riders will navigate directly to ${updated.latitude.toFixed(4)}° N, ${updated.longitude.toFixed(4)}° E.\nLandmark: ${updated.landmark || 'Set on map'}`
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
  const deliveryFee = cart.length > 0 ? (selectedDeliveryTier === 'bolt' ? 1200 : 2500) : 0;
  const conciergeFee = Math.round(cartSubtotal * 0.04);
  const cartTotal = cartSubtotal + deliveryFee + conciergeFee;

  const handleCheckout = () => {
    if (cart.length === 0) return;
    const newOrder = {
      id: `ORD-${Math.floor(10000 + Math.random() * 90000)}`,
      storeName: cart[0]?.storeName || 'The Gourmet Emporium',
      itemsCount: cart.reduce((sum, i) => sum + i.qty, 0),
      items: cart.map((i) => ({
        id: i.id,
        name: i.name,
        price: i.price,
        qty: i.qty,
        icon: i.icon,
      })),
      total: cartTotal,
      vendorPayout: Math.round(cartSubtotal * 0.9),
      deliveryPartner: selectedDeliveryTier,
      deliveryFee,
      boltStatus: selectedDeliveryTier === 'bolt' ? 'PENDING_VENDOR' : null,
      boltTrackingCode: selectedDeliveryTier === 'bolt' ? `BOLT-ABJ-${Math.floor(10000 + Math.random() * 90000)}` : null,
      boltRider: null,
      boltCoords: null,
      status: 'New Order',
      eta: selectedDeliveryTier === 'bolt' ? '18 mins (Bolt Express)' : '25 mins (Concierge)',
      deliveryPin: `${Math.floor(1000 + Math.random() * 9000)}`,
      pickupPin: `${Math.floor(1000 + Math.random() * 9000)}`,
      customerName: 'Alhaji Farouk Bello',
      customerAddress: pinnedLocation.name,
      deliveryLocation: {
        latitude: pinnedLocation.latitude,
        longitude: pinnedLocation.longitude,
        landmark: pinnedLocation.landmark,
        apartment: pinnedLocation.apartment,
        notes: riderDeliveryNote || pinnedLocation.notes,
      },
      createdAt: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };
    setOrders([newOrder, ...orders]);
    setCart([]);
    setCheckoutModalVisible(false);
    setCartModalVisible(false);
    if (selectedStore) setSelectedStore(null);
    setActiveTab('orders');
    Alert.alert('Order Confirmed!', `Your order ${newOrder.id} has been placed via ${selectedDeliveryTier === 'bolt' ? 'Bolt Express' : 'GETIT Concierge'}.`);
  };

  // Merchant Helper Computations & Actions
  const currentMerchantStore =
    storesList.find((s) => s.id === merchantStoreId) || storesList[0];

  const merchantOrders = orders.filter(
    (o) => o.storeName === currentMerchantStore?.name
  );

  const merchantFilteredOrders = merchantOrders.filter((o) => {
    if (merchantOrderFilter === 'all') return true;
    if (merchantOrderFilter === 'new') return o.status === 'New Order';
    if (merchantOrderFilter === 'preparing') return o.status === 'Preparing';
    if (merchantOrderFilter === 'ready') return o.status === 'Ready for Pickup';
    if (merchantOrderFilter === 'completed') return o.status === 'Completed' || o.status === 'On the Way';
    return true;
  });

  const merchantTotalRevenue = merchantOrders.reduce(
    (sum, o) => sum + (o.vendorPayout || Math.round(o.total * 0.9)),
    0
  );

  const acceptMerchantOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Preparing' } : o))
    );
    Alert.alert('Order Accepted', `Order ${orderId} is now marked as Preparing in your shop.`);
  };

  const dispatchBoltCourier = (orderId) => {
    const targetOrder = orders.find((o) => o.id === orderId);
    const assignedRider = SAMPLE_BOLT_RIDERS[Math.floor(Math.random() * SAMPLE_BOLT_RIDERS.length)];
    const boltCode = `BOLT-ABJ-${Math.floor(10000 + Math.random() * 90000)}`;
    const storeLat = 9.0882;
    const storeLng = 7.4933;
    const riderLat = storeLat + (Math.random() - 0.5) * 0.005;
    const riderLng = storeLng + (Math.random() - 0.5) * 0.005;

    setOrders((prev) =>
      prev.map((o) => {
        if (o.id === orderId) {
          return {
            ...o,
            deliveryPartner: 'bolt',
            boltStatus: 'IN_TRANSIT',
            boltTrackingCode: boltCode,
            boltRider: assignedRider,
            boltCoords: { latitude: riderLat, longitude: riderLng },
            status: 'On the Way',
            eta: '14 mins (Bolt Motorbike)',
          };
        }
        return o;
      })
    );

    Alert.alert(
      '🟢 Bolt Courier Dispatched!',
      `Bolt rider ${assignedRider.name} (${assignedRider.vehicle}, ${assignedRider.plate}) is dispatched to your store!\n\nPickup PIN: ${targetOrder?.pickupPin || '7391'}\nTracking Code: ${boltCode}\nETA: 4 mins.`
    );
  };

  const readyMerchantOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Ready for Pickup' } : o))
    );
    Alert.alert('Order Ready', `Order ${orderId} is packaged. Courier has been notified with the Pickup PIN.`);
  };

  const completeMerchantOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((o) => (o.id === orderId ? { ...o, status: 'Completed', eta: 'Delivered' } : o))
    );
    Alert.alert('Handover Complete', `Order ${orderId} handed over to courier and marked completed.`);
  };

  const rejectMerchantOrder = (orderId) => {
    Alert.alert('Reject Order', 'Are you sure you want to reject this order? Customer will be notified.', [
      { text: 'Cancel', style: 'cancel' },
      {
        text: 'Reject Order',
        style: 'destructive',
        onPress: () => {
          setOrders((prev) =>
            prev.map((o) => (o.id === orderId ? { ...o, status: 'Rejected' } : o))
          );
        },
      },
    ]);
  };

  const toggleStock = (productId) => {
    setStoresList((prev) =>
      prev.map((store) => {
        if (store.id === merchantStoreId) {
          return {
            ...store,
            products: store.products.map((p) =>
              p.id === productId ? { ...p, outOfStock: !p.outOfStock } : p
            ),
          };
        }
        return store;
      })
    );
  };

  const addNewProduct = () => {
    if (!newProductName.trim() || !newProductPrice.trim()) {
      Alert.alert('Required Fields', 'Please enter a product name and price.');
      return;
    }
    const newProd = {
      id: `p-${Date.now()}`,
      name: newProductName.trim(),
      price: Number(newProductPrice) || 2500,
      icon: newProductIcon || '🛍️',
      category: newProductCategory,
      outOfStock: false,
    };
    setStoresList((prev) =>
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
    setNewProductName('');
    setNewProductPrice('');
    Alert.alert('Product Live', `${newProd.name} added to ${currentMerchantStore?.name} catalog!`);
  };

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

    setStoresList((prev) =>
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

  // Filtered stores on homepage
  const filteredStores = storesList.filter((store) => {
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

              {/* --- IN-APP BOLT LIVE COURIER TRACKING (IF BOLT ORDER) --- */}
              {ord.deliveryPartner === 'bolt' && (
                <View style={styles.boltTrackingCard}>
                  <View style={styles.boltTrackingTopRow}>
                    <View style={styles.boltNetworkTag}>
                      <Text style={{ fontSize: 16 }}>🟢</Text>
                      <Text style={styles.boltNetworkTitle}>BOLT DELIVERY NETWORK</Text>
                    </View>
                    <View style={styles.boltEtaPill}>
                      <Text style={styles.boltEtaPillText}>{ord.eta || '12 mins'}</Text>
                    </View>
                  </View>

                  {/* Interactive In-App Moving Courier Map */}
                  <View style={styles.boltTrackingMapWrap}>
                    <MapView
                      style={styles.boltTrackingMap}
                      initialRegion={{
                        latitude: ord.deliveryLocation?.latitude || 9.0882,
                        longitude: ord.deliveryLocation?.longitude || 7.4933,
                        latitudeDelta: 0.015,
                        longitudeDelta: 0.015,
                      }}
                      scrollEnabled={true}
                      zoomEnabled={true}
                    >
                      {/* Customer Dropoff Pin */}
                      <Marker
                        coordinate={{
                          latitude: ord.deliveryLocation?.latitude || 9.0882,
                          longitude: ord.deliveryLocation?.longitude || 7.4933,
                        }}
                        title="Your Delivery Destination"
                        description={ord.customerAddress}
                        pinColor="#056B4B"
                      />

                      {/* Store Origin Pin */}
                      <Marker
                        coordinate={{
                          latitude: (ord.deliveryLocation?.latitude || 9.0882) + 0.005,
                          longitude: (ord.deliveryLocation?.longitude || 7.4933) + 0.004,
                        }}
                        title={ord.storeName}
                        description="Store Fulfillment Hub"
                        pinColor="#B76E79"
                      />

                      {/* Moving Bolt Motorbike Rider Pin */}
                      <Marker
                        coordinate={
                          ord.boltCoords || {
                            latitude: (ord.deliveryLocation?.latitude || 9.0882) + 0.002,
                            longitude: (ord.deliveryLocation?.longitude || 7.4933) + 0.002,
                          }
                        }
                        title={`🛵 ${ord.boltRider?.name || 'Musa Ibrahim'} (Bolt Courier)`}
                        description={`${ord.boltRider?.vehicle || 'Bajaj Boxer 150'} • ${ord.boltRider?.plate || 'ABJ-492-KW'}`}
                      />
                    </MapView>
                  </View>

                  {/* Bolt Courier Profile & Call Bar */}
                  <View style={styles.boltRiderBox}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', flex: 1 }}>
                      <View style={styles.boltRiderAvatar}>
                        <Text style={{ fontSize: 20 }}>🛵</Text>
                      </View>
                      <View style={{ marginLeft: 10, flex: 1 }}>
                        <View style={{ flexDirection: 'row', alignItems: 'center' }}>
                          <Text style={styles.boltRiderName}>
                            {ord.boltRider?.name || 'Musa Ibrahim'}
                          </Text>
                          <Text style={styles.boltRiderRating}>
                            {' '}• {ord.boltRider?.rating || '4.95'}★
                          </Text>
                        </View>
                        <Text style={styles.boltRiderVehicle} numberOfLines={1}>
                          {ord.boltRider?.vehicle || 'Bajaj Boxer 150'} ({ord.boltRider?.plate || 'ABJ-492-KW'})
                        </Text>
                      </View>
                    </View>

                    <TouchableOpacity
                      style={styles.boltCallBtn}
                      onPress={() =>
                        Linking.openURL(`tel:${ord.boltRider?.phone || '+2348032941194'}`)
                      }
                      activeOpacity={0.8}
                    >
                      <Text style={styles.boltCallBtnText}>📞 Call Courier</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              )}

              {/* Pinned Google Map Destination for Rider */}
              <View style={styles.orderGpsCard}>
                <View style={{ flex: 1 }}>
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 2 }}>
                    <Text style={styles.orderGpsTitle}>📍 PINNED GPS FOR COURIER</Text>
                  </View>
                  <Text style={styles.orderGpsCoords}>
                    {ord.deliveryLocation?.latitude?.toFixed(4) || '9.0882'}° N,{' '}
                    {ord.deliveryLocation?.longitude?.toFixed(4) || '7.4933'}° E
                  </Text>
                  <Text style={styles.orderGpsLandmark} numberOfLines={2}>
                    Landmark: {ord.deliveryLocation?.landmark || 'Near Transcorp Hilton, Black Gate'}
                  </Text>
                  {(ord.deliveryLocation?.notes || ord.deliveryLocation?.apartment) ? (
                    <Text style={styles.orderGpsNotes} numberOfLines={2}>
                      🛵 Courier Note: "{ord.deliveryLocation?.notes || `Deliver to ${ord.deliveryLocation?.apartment}`}"
                    </Text>
                  ) : null}
                </View>

                <TouchableOpacity
                  style={styles.openMapsBtn}
                  onPress={() =>
                    openExternalGoogleMaps(
                      ord.deliveryLocation?.latitude || 9.0882,
                      ord.deliveryLocation?.longitude || 7.4933
                    )
                  }
                  activeOpacity={0.8}
                >
                  <Text style={styles.openMapsBtnText}>Open Maps ➔</Text>
                </TouchableOpacity>
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

          {/* --- MERCHANT HUB SWITCHER CARD --- */}
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
                  Manage orders, catalog stock & daily payouts for {currentMerchantStore?.name}
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
                  {currentMerchantStore?.rating || '4.9'} ★
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

                        {prod.outOfStock ? (
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
                style={styles.bottomCartFloatingBar}
                onPress={() => setCartModalVisible(true)}
                activeOpacity={0.9}
              >
                <View>
                  <Text style={styles.floatingCartCount}>
                    {cart.reduce((s, i) => s + i.qty, 0)} Items Selected
                  </Text>
                  <Text style={styles.floatingCartTotal}>{formatNaira(cartTotal)}</Text>
                </View>
                <View style={styles.floatingCheckoutBtn}>
                  <Text style={styles.floatingCheckoutBtnText}>View Basket & Pay →</Text>
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

                  {/* Interactive Mini-Map Preview Structure */}
                  <View style={styles.cartMapContainer}>
                    <MapView
                      ref={cartMapRef}
                      style={styles.cartMapCanvas}
                      region={{
                        latitude: pinnedLocation?.latitude || mapCoords.latitude,
                        longitude: pinnedLocation?.longitude || mapCoords.longitude,
                        latitudeDelta: 0.0035,
                        longitudeDelta: 0.0035,
                      }}
                      showsUserLocation={true}
                      showsCompass={false}
                      scrollEnabled={true}
                      zoomEnabled={true}
                      pitchEnabled={false}
                      rotateEnabled={false}
                      onPress={openLocationPickerFromCart}
                    >
                      <Marker
                        key={`cart-pin-${(pinnedLocation?.latitude || mapCoords.latitude).toFixed(6)}-${(pinnedLocation?.longitude || mapCoords.longitude).toFixed(6)}`}
                        coordinate={{
                          latitude: pinnedLocation?.latitude || mapCoords.latitude,
                          longitude: pinnedLocation?.longitude || mapCoords.longitude,
                        }}
                        title={pinnedLocation?.name || "Delivery Destination"}
                        description={pinnedLocation?.landmark || "Rider dropoff coordinates"}
                        pinColor={COLORS.emeraldPrimary}
                      />
                    </MapView>

                    {/* GPS Coordinates Badge on Map */}
                    <View style={styles.cartMapGpsBadge}>
                      <Text style={styles.cartMapGpsBadgeText}>
                        🎯 {(pinnedLocation?.latitude || mapCoords.latitude).toFixed(4)}° N,{' '}
                        {(pinnedLocation?.longitude || mapCoords.longitude).toFixed(4)}° E
                      </Text>
                    </View>

                    {/* Tap to Adjust Overlay Pill */}
                    <TouchableOpacity
                      style={styles.cartMapTapOverlay}
                      onPress={openLocationPickerFromCart}
                      activeOpacity={0.85}
                    >
                      <Text style={styles.cartMapTapOverlayText}>🔍 Tap Map to Adjust or Search</Text>
                    </TouchableOpacity>
                  </View>

                  {/* Quick Action Buttons Row */}
                  <View style={styles.cartMapActionsRow}>
                    <TouchableOpacity
                      style={styles.cartMapActionBtnSecondary}
                      onPress={openLocationPickerFromCart}
                      activeOpacity={0.8}
                    >
                      <Text style={styles.cartMapActionBtnSecondaryText}>
                        🔍 Search & Pick on Map
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
                  onPress={() => {
                    const next = !storeOpenStatus;
                    setStoreOpenStatus(next);
                    Alert.alert(
                      'Store Status Updated',
                      next ? 'Your store is now OPEN and accepting orders.' : 'Your store is PAUSED. Customers cannot order.'
                    );
                  }}
                  activeOpacity={0.8}
                >
                  <Text style={styles.storeStatusToggleText}>
                    {storeOpenStatus ? '● OPEN' : '⏸ PAUSED'}
                  </Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={styles.exitMerchantBtn}
                  onPress={() => setAppMode('customer')}
                  activeOpacity={0.8}
                >
                  <Text style={styles.exitMerchantBtnText}>👤 Customer</Text>
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
                  <View style={styles.revenueBadgePill}>
                    <Text style={styles.revenueBadgeText}>
                      Sales: {formatNaira(merchantTotalRevenue)}
                    </Text>
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
                    { id: 'all', label: `All (${merchantOrders.length})` },
                    { id: 'new', label: `New (${merchantOrders.filter((o) => o.status === 'New Order').length})` },
                    { id: 'preparing', label: `Preparing (${merchantOrders.filter((o) => o.status === 'Preparing').length})` },
                    { id: 'ready', label: `Ready (${merchantOrders.filter((o) => o.status === 'Ready for Pickup').length})` },
                    { id: 'completed', label: `Done (${merchantOrders.filter((o) => o.status === 'Completed' || o.status === 'On the Way').length})` },
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
                    const isNew = ord.status === 'New Order';
                    const isPrep = ord.status === 'Preparing';
                    const isReady = ord.status === 'Ready for Pickup';
                    const isDone = ord.status === 'Completed' || ord.status === 'On the Way';

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
                              {ord.status}
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
                          {ord.pickupPin && (
                            <Text style={styles.mPickupPinNotice}>
                              Shop Handover PIN: <Text style={{ fontWeight: '800' }}>{ord.pickupPin}</Text>
                            </Text>
                          )}
                        </View>

                        {/* Items ordered */}
                        <View style={styles.mItemsList}>
                          {ord.items?.map((it, idx) => (
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

                        {/* Order Financials & Net Payout */}
                        <View style={styles.mFinancialsRow}>
                          <View>
                            <Text style={styles.mNetPayoutLabel}>YOUR SETTLEMENT (90%)</Text>
                            <Text style={styles.mNetPayoutValue}>
                              {formatNaira(ord.vendorPayout || Math.round(ord.total * 0.9))}
                            </Text>
                          </View>
                          <Text style={styles.mCustomerPaid}>Customer Paid: {formatNaira(ord.total)}</Text>
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

                              {ord.boltRider && (
                                <View style={styles.mBoltAssignedCard}>
                                  <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between' }}>
                                    <Text style={styles.mBoltAssignedTitle}>
                                      🟢 Bolt Rider: {ord.boltRider.name}
                                    </Text>
                                    <Text style={{ fontSize: 11, fontWeight: '800', color: '#047857' }}>
                                      {ord.eta || '4 mins away'}
                                    </Text>
                                  </View>
                                  <Text style={styles.mBoltAssignedRider}>
                                    {ord.boltRider.vehicle} • Plate: {ord.boltRider.plate}
                                  </Text>
                                  <Text style={{ fontSize: 10.5, color: '#475569', marginTop: 3 }}>
                                    Tracking: {ord.boltTrackingCode} • Shop Handover PIN: <Text style={{ fontWeight: '800', color: '#047857' }}>{ord.pickupPin}</Text>
                                  </Text>
                                </View>
                              )}

                              <TouchableOpacity
                                style={styles.mCompleteBtn}
                                onPress={() => completeMerchantOrder(ord.id)}
                              >
                                <Text style={styles.mCompleteBtnText}>
                                  {ord.boltRider ? '🚴 Hand Over to Bolt Courier (Complete)' : '🚴 Hand Over to Courier (Verified)'}
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
                      <Text style={{ fontSize: 26, marginRight: 12 }}>{p.icon || '🛍️'}</Text>
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
                  <Text style={styles.financeCardTitle}>Commission Structure</Text>
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>Store Gross Sales</Text>
                    <Text style={styles.financeVal}>
                      {formatNaira(Math.round(merchantTotalRevenue / 0.9))}
                    </Text>
                  </View>
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>Platform Commission (10%)</Text>
                    <Text style={[styles.financeVal, { color: '#DC2626' }]}>
                      -{formatNaira(Math.round(merchantTotalRevenue * 0.1))}
                    </Text>
                  </View>
                  <View style={styles.financeRow}>
                    <Text style={styles.financeLabel}>Courier Cost (Covered by Client)</Text>
                    <Text style={styles.financeVal}>₦0.00</Text>
                  </View>
                  <View style={styles.financeDivider} />
                  <View style={styles.financeRow}>
                    <Text style={[styles.financeLabel, { fontWeight: '800', color: COLORS.textDark }]}>
                      Net Vendor Payout (90%)
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
                contentContainerStyle={{ padding: 16, paddingBottom: 110 }}
              >
                <Text style={styles.merchantViewTitle}>Store Profile & Management</Text>
                <Text style={styles.merchantViewSub}>Manage partner details and switch store branch</Text>

                <View style={styles.storeProfileCard}>
                  <Image
                    source={{ uri: currentMerchantStore?.image }}
                    style={styles.storeProfileBanner}
                  />
                  <View style={styles.storeProfileBody}>
                    <Text style={styles.storeProfileName}>{currentMerchantStore?.name}</Text>
                    <Text style={styles.storeProfileCategory}>{currentMerchantStore?.categoryLabel}</Text>
                    <Text style={styles.storeProfileAddress}>📍 {currentMerchantStore?.address}</Text>

                    <View style={styles.storeProfileRow}>
                      <Text style={styles.storeProfileLbl}>Status:</Text>
                      <Text style={[styles.storeProfileVal, { color: storeOpenStatus ? '#047857' : '#B91C1C' }]}>
                        {storeOpenStatus ? 'Open for Orders' : 'Paused / Offline'}
                      </Text>
                    </View>
                    <View style={styles.storeProfileRow}>
                      <Text style={styles.storeProfileLbl}>Delivery Window:</Text>
                      <Text style={styles.storeProfileVal}>{currentMerchantStore?.deliveryTime}</Text>
                    </View>
                    <View style={styles.storeProfileRow}>
                      <Text style={styles.storeProfileLbl}>Customer Rating:</Text>
                      <Text style={styles.storeProfileVal}>★ {currentMerchantStore?.rating} ({currentMerchantStore?.reviewCount} reviews)</Text>
                    </View>
                  </View>
                </View>

                {/* Switch Store Branch Selector */}
                <View style={styles.switchBranchCard}>
                  <Text style={styles.financeCardTitle}>Select Store Branch to Manage</Text>
                  <Text style={{ fontSize: 11.5, color: COLORS.textMuted, marginBottom: 10 }}>
                    Switch between partner stores in your merchant account:
                  </Text>
                  {storesList.map((st) => {
                    const isSelected = st.id === merchantStoreId;
                    return (
                      <TouchableOpacity
                        key={st.id}
                        style={[styles.branchItem, isSelected && styles.branchItemActive]}
                        onPress={() => setMerchantStoreId(st.id)}
                      >
                        <Text style={{ fontSize: 18, marginRight: 10 }}>🏬</Text>
                        <View style={{ flex: 1 }}>
                          <Text style={[styles.branchName, isSelected && styles.branchNameActive]}>
                            {st.name}
                          </Text>
                          <Text style={styles.branchSub}>{st.categoryLabel}</Text>
                        </View>
                        {isSelected && <Text style={{ color: COLORS.emeraldPrimary, fontWeight: '900' }}>✓</Text>}
                      </TouchableOpacity>
                    );
                  })}
                </View>

                {/* Back to Customer Button */}
                <TouchableOpacity
                  style={[styles.merchantSwitchBtn, { marginTop: 14 }]}
                  onPress={() => setAppMode('customer')}
                >
                  <Text style={styles.merchantSwitchBtnText}>
                    Switch Back to Customer View 👤
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

      {/* --- ADD PRODUCT MODAL FOR MERCHANT --- */}
      <Modal
        visible={addProductModalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setAddProductModalVisible(false)}
      >
        <View style={styles.locationModalOverlay}>
          <View style={styles.addProductModalBox}>
            <View style={styles.locationModalHeader}>
              <Text style={styles.locationModalTitle}>Add Product to Store</Text>
              <TouchableOpacity onPress={() => setAddProductModalVisible(false)}>
                <Text style={{ fontSize: 18, color: COLORS.textMuted }}>✕</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.addInputLabel}>Product Name</Text>
            <TextInput
              style={styles.addTextInput}
              placeholder="e.g. Imported Gouda Cheese (250g)"
              placeholderTextColor="#94A3B8"
              value={newProductName}
              onChangeText={setNewProductName}
            />

            <Text style={styles.addInputLabel}>Price (₦)</Text>
            <TextInput
              style={styles.addTextInput}
              placeholder="e.g. 7500"
              placeholderTextColor="#94A3B8"
              keyboardType="numeric"
              value={newProductPrice}
              onChangeText={setNewProductPrice}
            />

            <Text style={styles.addInputLabel}>Category</Text>
            <View style={styles.categoryPickerRow}>
              {['Produce', 'Pantry', 'Deli', 'Beverage', 'Pastry'].map((cat) => (
                <TouchableOpacity
                  key={cat}
                  style={[
                    styles.catChoicePill,
                    newProductCategory === cat && styles.catChoicePillActive,
                  ]}
                  onPress={() => setNewProductCategory(cat)}
                >
                  <Text
                    style={[
                      styles.catChoiceText,
                      newProductCategory === cat && styles.catChoiceTextActive,
                    ]}
                  >
                    {cat}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>

            <Text style={styles.addInputLabel}>Product Emoji Icon</Text>
            <View style={styles.categoryPickerRow}>
              {['🧀', '🫒', '🥩', '🥖', '🍾', '🍯', '🥑', '🍅'].map((ico) => (
                <TouchableOpacity
                  key={ico}
                  style={[
                    styles.iconChoiceCircle,
                    newProductIcon === ico && styles.iconChoiceCircleActive,
                  ]}
                  onPress={() => setNewProductIcon(ico)}
                >
                  <Text style={{ fontSize: 20 }}>{ico}</Text>
                </TouchableOpacity>
              ))}
            </View>

            <TouchableOpacity
              style={[styles.primaryActionBtn, { marginTop: 16 }]}
              onPress={addNewProduct}
            >
              <Text style={styles.primaryActionBtnText}>Publish to Store</Text>
            </TouchableOpacity>
          </View>
        </View>
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
  cartMapContainer: {
    height: 165,
    borderRadius: 14,
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
    flex: 1.2,
    backgroundColor: COLORS.emeraldDeep,
    paddingVertical: 9,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  cartMapActionBtnSecondaryText: {
    color: '#FFFFFF',
    fontSize: 11.5,
    fontWeight: '800',
  },
  cartMapActionBtnOutline: {
    flex: 0.9,
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

  // Store Profile Management
  storeProfileCard: {
    backgroundColor: '#FFFFFF',
    borderRadius: 18,
    overflow: 'hidden',
    marginTop: 12,
    marginBottom: 14,
    borderWidth: 1,
    borderColor: COLORS.borderBeige,
  },
  storeProfileBanner: {
    width: '100%',
    height: 120,
  },
  storeProfileBody: {
    padding: 16,
  },
  storeProfileName: {
    fontSize: 16,
    fontWeight: '800',
    color: COLORS.textDark,
    fontFamily: 'serif',
  },
  storeProfileCategory: {
    fontSize: 11.5,
    color: COLORS.roseGold,
    marginTop: 2,
  },
  storeProfileAddress: {
    fontSize: 11.5,
    color: COLORS.textMuted,
    marginVertical: 6,
  },
  storeProfileRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 4,
    borderTopWidth: 1,
    borderTopColor: COLORS.borderLight,
  },
  storeProfileLbl: {
    fontSize: 11,
    color: COLORS.textMuted,
  },
  storeProfileVal: {
    fontSize: 11.5,
    fontWeight: '700',
    color: COLORS.textDark,
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
    height: 160,
    borderRadius: 12,
    overflow: 'hidden',
    borderWidth: 1,
    borderColor: '#BBF7D0',
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
});


