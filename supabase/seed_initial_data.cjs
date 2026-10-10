/**
 * Seed Initial Stores and Riders into Supabase
 */

const fs = require('fs');
const path = require('path');

let supabaseUrl = process.env.SUPABASE_URL || 'https://pqekoqryvpfomexmptik.supabase.co';
let supabaseKey = process.env.SUPABASE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InBxZWtvcXJ5dnBmb21leG1wdGlrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3OTE2MzA0ODIsImV4cCI6MjEwNzIwNjQ4Mn0.r32Ax0I_rW9EkmkyDSIbUc7lSUU0P51StmpDhsXf7G8';

const STORES = [
  {
    id: 'store-fresh-mart',
    name: 'Fresh Mart Maitama',
    category: 'Gourmet & Groceries',
    address: 'Plot 14 Gana Street, Maitama',
    district: 'Maitama, Abuja',
    city: 'Abuja',
    latitude: 9.0882,
    longitude: 7.4933,
    phone: '+234 803 111 2233',
    rating: 4.90,
    is_open: true,
    delivery_fee: 1200.00
  },
  {
    id: 'store-h-medix',
    name: 'H-Medix Pharmacy & Supermarket',
    category: 'Pharmacy & Groceries',
    address: 'Plot 43 Ademola Adetokunbo Crescent, Wuse 2',
    district: 'Wuse 2, Abuja',
    city: 'Abuja',
    latitude: 9.0765,
    longitude: 7.4893,
    phone: '+234 802 333 4455',
    rating: 4.88,
    is_open: true,
    delivery_fee: 1200.00
  },
  {
    id: 'store-exclusive',
    name: 'Exclusive Stores',
    category: 'Supermarket & Bakery',
    address: 'Plot 1200 Ahmadu Bello Way, Area 11, Garki',
    district: 'Garki, Abuja',
    city: 'Abuja',
    latitude: 9.0321,
    longitude: 7.4890,
    phone: '+234 805 777 8899',
    rating: 4.85,
    is_open: true,
    delivery_fee: 1200.00
  }
];

const RIDERS = [
  {
    id: 'rider-ibrahim',
    name: 'Ibrahim Bello',
    phone: '+234 803 234 5678',
    rating: 4.95,
    trips: 1420,
    vehicle: 'Bajaj Boxer 150',
    plate: 'ABJ-421-XY',
    avatar: '🛵',
    current_lat: 9.0882,
    current_lng: 7.4933,
    is_active: true
  },
  {
    id: 'rider-chinedu',
    name: 'Chinedu Okafor',
    phone: '+234 802 987 6543',
    rating: 4.91,
    trips: 980,
    vehicle: 'TVS Apache 160',
    plate: 'ABJ-882-AB',
    avatar: '🛵',
    current_lat: 9.0765,
    current_lng: 7.4893,
    is_active: true
  },
  {
    id: 'rider-musa',
    name: 'Musa Danjuma',
    phone: '+234 814 555 1212',
    rating: 4.88,
    trips: 640,
    vehicle: 'Honda Ace 125',
    plate: 'ABJ-119-KZ',
    avatar: '🛵',
    current_lat: 9.0622,
    current_lng: 7.4412,
    is_active: true
  }
];

async function seedData() {
  console.log('Seeding stores...');
  const storeRes = await fetch(`${supabaseUrl}/rest/v1/stores`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(STORES)
  });
  console.log('Stores response status:', storeRes.status);

  console.log('Seeding riders...');
  const riderRes = await fetch(`${supabaseUrl}/rest/v1/riders`, {
    method: 'POST',
    headers: {
      'apikey': supabaseKey,
      'Authorization': `Bearer ${supabaseKey}`,
      'Content-Type': 'application/json',
      'Prefer': 'resolution=merge-duplicates'
    },
    body: JSON.stringify(RIDERS)
  });
  console.log('Riders response status:', riderRes.status);

  console.log('✔ Initial stores and riders successfully seeded into Supabase!');
}

seedData().catch(console.error);
