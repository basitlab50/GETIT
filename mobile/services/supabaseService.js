import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { NIGERIAN_GROCERIES_CATALOG } from '../data/nigerianGroceriesCatalog';

/**
 * Supabase Data Service for Mobile App
 * Provides seamless sync between cloud PostgreSQL and local offline fallback.
 */

// 1. Master Catalog Products
export async function getMasterCatalog() {
  try {
    const { data, error } = await supabase
      .from('master_catalog_products')
      .select('*')
      .order('category', { ascending: true });

    if (error || !data || data.length === 0) {
      console.log('Using local fallback catalog:', error?.message);
      return NIGERIAN_GROCERIES_CATALOG;
    }

    // Map database snake_case columns back to UI camelCase
    return data.map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      subcategory: item.subcategory,
      brand: item.brand,
      icon: item.icon || '🛍️',
      suggestedPrice: Number(item.suggested_price) || 0,
      priceRange: item.price_range,
      description: item.description,
      imageUrl: item.image_url
    }));
  } catch (err) {
    console.warn('Master catalog fetch failed, falling back to local:', err);
    return NIGERIAN_GROCERIES_CATALOG;
  }
}

// 2. Store Inventory
export async function getStoreInventory(storeId = 'store-fresh-mart') {
  try {
    const { data, error } = await supabase
      .from('store_inventory')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      name: item.name,
      category: item.category,
      price: Number(item.price) || 0,
      icon: item.icon || '🛍️',
      imageUrl: item.image_url,
      outOfStock: !!item.out_of_stock
    }));
  } catch (err) {
    console.warn('Failed to fetch store inventory from Supabase:', err);
    return null;
  }
}

export async function addStoreInventoryItem(storeId = 'store-fresh-mart', item) {
  try {
    const record = {
      id: item.id || `inv-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      store_id: storeId,
      name: item.name,
      category: item.category,
      price: Number(item.price) || 0,
      icon: item.icon || '🛍️',
      image_url: item.imageUrl || null,
      out_of_stock: !!item.outOfStock
    };

    const { data, error } = await supabase
      .from('store_inventory')
      .upsert(record, { onConflict: 'id' })
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to add store inventory item in Supabase:', err);
    return null;
  }
}

export async function removeStoreInventoryItem(itemId) {
  try {
    const { error } = await supabase
      .from('store_inventory')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error('Failed to remove store inventory item in Supabase:', err);
    return false;
  }
}

// 3. Orders & Realtime Sync
export async function createDatabaseOrder(order) {
  try {
    const record = {
      id: order.id,
      store_id: order.storeId || 'store-fresh-mart',
      store_name: order.storeName || 'Fresh Mart Maitama',
      customer_name: order.customerName,
      customer_phone: order.customerPhone,
      customer_address: order.customerAddress,
      delivery_lat: order.deliveryLat,
      delivery_lng: order.deliveryLng,
      courier_notes: order.courierNotes,
      items: order.items || [],
      items_count: order.itemsCount || (order.items ? order.items.length : 1),
      subtotal: Number(order.subtotal) || 0,
      total: Number(order.total) || 0,
      vendor_payout: Number(order.vendorPayout) || 0,
      delivery_fee: Number(order.deliveryFee) || 1200,
      status: order.status || 'New Order',
      delivery_partner: order.deliveryPartner || 'bolt',
      bolt_status: order.boltStatus || 'PENDING_VENDOR',
      bolt_tracking_code: order.boltTrackingCode,
      bolt_rider: order.boltRider || null,
      bolt_coords: order.boltCoords || null,
      delivery_pin: String(order.deliveryPin || '2489'),
      pickup_pin: String(order.pickupPin || '7731'),
      eta: order.eta || '20 mins',
      payment_method: order.paymentMethod || 'Paystack',
      payment_reference: order.paymentReference || null
    };

    const { data, error } = await supabase
      .from('orders')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to insert order into Supabase:', err);
    return null;
  }
}

export async function updateDatabaseOrderStatus(orderId, updates) {
  try {
    const dbUpdates = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.boltStatus !== undefined) dbUpdates.bolt_status = updates.boltStatus;
    if (updates.boltRider !== undefined) dbUpdates.bolt_rider = updates.boltRider;
    if (updates.boltCoords !== undefined) dbUpdates.bolt_coords = updates.boltCoords;
    if (updates.eta !== undefined) dbUpdates.eta = updates.eta;

    const { data, error } = await supabase
      .from('orders')
      .update(dbUpdates)
      .eq('id', orderId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to update order status in Supabase:', err);
    return null;
  }
}

// 4. Realtime Subscription for Orders
export function subscribeToOrders(callback) {
  const channel = supabase
    .channel('public:orders')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'orders' },
      payload => {
        if (callback) callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

// 5. Stores Management & Sync
export async function getStores() {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Failed to fetch stores from Supabase:', err);
    return [];
  }
}

export async function createDatabaseStore(store) {
  try {
    const record = {
      id: store.id || `store-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: store.name,
      category: store.category || 'Gourmet & Groceries',
      address: store.address || 'Abuja, Nigeria',
      district: store.district || 'Maitama, Abuja',
      city: store.city || 'Abuja',
      latitude: Number(store.latitude) || 9.0882,
      longitude: Number(store.longitude) || 7.4933,
      phone: store.phone || '+234 800 000 0000',
      rating: Number(store.rating) || 5.0,
      is_open: store.isOpen !== undefined ? store.isOpen : true,
      delivery_fee: Number(store.deliveryFee) || 1200,
    };

    const { data, error } = await supabase
      .from('stores')
      .insert(record)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to create store in Supabase:', err);
    return null;
  }
}

export function subscribeToStores(callback) {
  const channel = supabase
    .channel('public:stores')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'stores' },
      payload => {
        if (callback) callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export async function updateDatabaseStore(storeId, updates) {
  try {
    const dbUpdates = {};
    if (updates.isOpen !== undefined) dbUpdates.is_open = updates.isOpen;
    if (updates.is_open !== undefined) dbUpdates.is_open = updates.is_open;
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.category !== undefined) dbUpdates.category = updates.category;
    if (updates.address !== undefined) dbUpdates.address = updates.address;
    if (updates.district !== undefined) dbUpdates.district = updates.district;
    if (updates.deliveryFee !== undefined) dbUpdates.delivery_fee = Number(updates.deliveryFee);
    if (updates.phone !== undefined) dbUpdates.phone = updates.phone;

    const { data, error } = await supabase
      .from('stores')
      .update(dbUpdates)
      .eq('id', storeId)
      .select()
      .single();

    if (error) throw error;
    return data;
  } catch (err) {
    console.error('Failed to update store in Supabase:', err);
    return null;
  }
}

// 6. User Accounts & Database Authentication
export const DEFAULT_DATABASE_USERS = [
  {
    id: 'user-shopper-amina',
    role: 'buyer',
    fullName: 'Amina Bello',
    email: 'amina@getit.ng',
    phone: '08032941194',
    password: 'password123',
    address: 'Plot 14 Gana Street, Maitama, Abuja',
    businessName: null,
    storeId: null,
    createdAt: '2026-10-10T00:00:00.000Z',
  },
  {
    id: 'user-merchant-emeka',
    role: 'seller',
    fullName: 'Emeka Okafor',
    email: 'emeka@freshmart.ng',
    phone: '08031112233',
    password: 'password123',
    address: 'Adetokunbo Ademola Crescent, Wuse 2, Abuja',
    businessName: 'The Gourmet Emporium',
    storeId: 's1',
    createdAt: '2026-10-10T00:00:00.000Z',
  },
];

// In-memory cache for ultra-fast, zero-latency user matching
let MEMORY_REGISTERED_USERS = [...DEFAULT_DATABASE_USERS];

/**
 * Normalizes phone numbers to their core 10 digits (e.g. 08031234567 or +2348031234567 -> 8031234567)
 */
function getCorePhoneDigits(val) {
  if (!val) return '';
  const digits = String(val).replace(/\D/g, '');
  return digits.length >= 10 ? digits.slice(-10) : digits;
}

/**
 * Check if a user record matches the supplied search identifier
 */
function userMatchesIdentifier(user, cleanId, digitsOnly) {
  if (!user) return false;
  const uEmail = (user.email || '').toLowerCase().trim();
  const uPhoneDigits = (user.phone || '').replace(/\D/g, '');
  const uPhoneCore = getCorePhoneDigits(user.phone);
  const uName = (user.fullName || user.full_name || '').toLowerCase().trim();
  const uBusiness = (user.businessName || user.business_name || '').toLowerCase().trim();
  const uId = (user.id || '').toLowerCase().trim();

  // 1. Direct email match or email prefix/handle match
  if (uEmail) {
    if (uEmail === cleanId) return true;
    const emailPrefix = uEmail.split('@')[0];
    if (emailPrefix && (emailPrefix === cleanId || cleanId === emailPrefix.replace(/[^a-z0-9]/g, ''))) return true;
    if (cleanId.includes('@') && (uEmail.includes(cleanId) || cleanId.includes(uEmail))) return true;
  }

  // 2. Full Name match (case-insensitive)
  if (uName) {
    if (uName === cleanId) return true;
    const cleanIdNoSpaces = cleanId.replace(/\s+/g, '');
    const uNameNoSpaces = uName.replace(/\s+/g, '');
    if (cleanIdNoSpaces && uNameNoSpaces && (cleanIdNoSpaces === uNameNoSpaces || uNameNoSpaces.includes(cleanIdNoSpaces))) return true;
  }

  // 3. Phone number match (core 10 digits or exact digits)
  if (digitsOnly && digitsOnly.length >= 5) {
    if (uPhoneDigits === digitsOnly) return true;
    const targetCore = getCorePhoneDigits(digitsOnly);
    if (targetCore && uPhoneCore && targetCore.length >= 8 && uPhoneCore === targetCore) return true;
    if (uPhoneDigits && (uPhoneDigits.endsWith(digitsOnly) || digitsOnly.endsWith(uPhoneDigits))) return true;
  }

  // 4. Business / Store Name match
  if (uBusiness && (uBusiness === cleanId || cleanId.includes(uBusiness) || uBusiness.includes(cleanId))) return true;

  // 5. User ID match
  if (uId && uId === cleanId) return true;

  return false;
}

export async function seedDefaultDatabaseUsers() {
  try {
    const raw = await AsyncStorage.getItem('getit_registered_users');
    let localUsers = raw ? JSON.parse(raw) : [];
    if (!Array.isArray(localUsers) || localUsers.length === 0) {
      localUsers = [...DEFAULT_DATABASE_USERS];
      await AsyncStorage.setItem('getit_registered_users', JSON.stringify(localUsers));
    } else {
      DEFAULT_DATABASE_USERS.forEach((def) => {
        if (!localUsers.some((u) => u.id === def.id || getCorePhoneDigits(u.phone) === getCorePhoneDigits(def.phone))) {
          localUsers.push(def);
        }
      });
      await AsyncStorage.setItem('getit_registered_users', JSON.stringify(localUsers));
    }

    // Sync memory cache
    localUsers.forEach((u) => {
      if (!MEMORY_REGISTERED_USERS.some((m) => m.id === u.id)) {
        MEMORY_REGISTERED_USERS.push(u);
      }
    });

    // Also sync localStorage if on web
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('getit_registered_users', JSON.stringify(MEMORY_REGISTERED_USERS));
    }
  } catch (e) {
    console.warn('Failed to seed default users in local storage:', e);
  }
}

export async function findDatabaseUser(identifier) {
  if (!identifier) return null;
  const cleanId = String(identifier).trim().toLowerCase();
  const digitsOnly = cleanId.replace(/\D/g, '');

  // 1. First check in-memory cache for immediate zero-latency lookup
  const memMatch = MEMORY_REGISTERED_USERS.find((u) => userMatchesIdentifier(u, cleanId, digitsOnly));
  if (memMatch) return memMatch;

  // 2. Query persistent local database storage (AsyncStorage)
  try {
    const raw = await AsyncStorage.getItem('getit_registered_users');
    if (raw) {
      const localUsers = JSON.parse(raw);
      if (Array.isArray(localUsers)) {
        // Sync memory cache with anything read
        localUsers.forEach((u) => {
          if (!MEMORY_REGISTERED_USERS.some((m) => m.id === u.id)) {
            MEMORY_REGISTERED_USERS.push(u);
          }
        });
        const match = localUsers.find((u) => userMatchesIdentifier(u, cleanId, digitsOnly));
        if (match) return match;
      }
    }
  } catch (err) {
    console.warn('Local database lookup failed:', err);
  }

  // 3. Also check browser localStorage if on web
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const webRaw = window.localStorage.getItem('getit_registered_users');
      if (webRaw) {
        const webUsers = JSON.parse(webRaw);
        if (Array.isArray(webUsers)) {
          const match = webUsers.find((u) => userMatchesIdentifier(u, cleanId, digitsOnly));
          if (match) return match;
        }
      }
    }
  } catch (e) {}

  // 4. Try querying remote Supabase 'users' table
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && Array.isArray(data) && data.length > 0) {
      const match = data.find((u) => {
        const mapped = {
          id: u.id,
          role: u.role,
          fullName: u.full_name,
          email: u.email,
          phone: u.phone,
          password: u.password_hash || u.password,
          address: u.address,
          businessName: u.business_name,
          storeId: u.store_id,
          createdAt: u.created_at,
        };
        return userMatchesIdentifier(mapped, cleanId, digitsOnly);
      });
      if (match) {
        const formatted = {
          id: match.id,
          role: match.role,
          fullName: match.full_name,
          email: match.email,
          phone: match.phone,
          password: match.password_hash || match.password,
          address: match.address,
          businessName: match.business_name,
          storeId: match.store_id,
          createdAt: match.created_at,
        };
        // Update memory and local cache
        if (!MEMORY_REGISTERED_USERS.some((m) => m.id === formatted.id)) {
          MEMORY_REGISTERED_USERS.push(formatted);
        }
        return formatted;
      }
    }
  } catch (err) {
    // If Supabase table is not yet reachable or table is not created yet
  }

  return null;
}

export async function registerDatabaseUser(user) {
  const cleanEmail = user.email ? user.email.trim().toLowerCase() : null;
  const cleanPhone = user.phone ? user.phone.trim() : '';
  const cleanName = user.fullName || user.full_name || 'Valued User';

  const userRecord = {
    id: user.id || `user-${user.role || 'buyer'}-${Date.now()}`,
    role: user.role || 'buyer',
    fullName: cleanName,
    email: cleanEmail || `${cleanName.toLowerCase().replace(/[^a-z0-9]/g, '')}@getit.ng`,
    phone: cleanPhone,
    password: user.password || 'password123',
    address: user.address || '',
    businessName: user.businessName || user.business_name || null,
    storeId: user.storeId || user.store_id || null,
    createdAt: new Date().toISOString(),
  };

  // 1. Immediately store in MEMORY cache
  const existingMemoryIdx = MEMORY_REGISTERED_USERS.findIndex(
    (u) =>
      u.id === userRecord.id ||
      (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) ||
      (cleanPhone && getCorePhoneDigits(u.phone) === getCorePhoneDigits(cleanPhone))
  );
  if (existingMemoryIdx >= 0) {
    MEMORY_REGISTERED_USERS[existingMemoryIdx] = userRecord;
  } else {
    MEMORY_REGISTERED_USERS.push(userRecord);
  }

  // 2. Persist to persistent local database (AsyncStorage)
  try {
    const raw = await AsyncStorage.getItem('getit_registered_users');
    let localUsers = raw ? JSON.parse(raw) : [...DEFAULT_DATABASE_USERS];
    if (!Array.isArray(localUsers)) localUsers = [...DEFAULT_DATABASE_USERS];
    const existsIndex = localUsers.findIndex(
      (u) =>
        u.id === userRecord.id ||
        (cleanEmail && u.email && u.email.toLowerCase() === cleanEmail) ||
        (cleanPhone && getCorePhoneDigits(u.phone) === getCorePhoneDigits(cleanPhone))
    );
    if (existsIndex >= 0) {
      localUsers[existsIndex] = userRecord;
    } else {
      localUsers.push(userRecord);
    }
    await AsyncStorage.setItem('getit_registered_users', JSON.stringify(localUsers));
  } catch (err) {
    console.warn('AsyncStorage save failed:', err);
  }

  // 3. Persist to browser window.localStorage if on web
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem('getit_registered_users', JSON.stringify(MEMORY_REGISTERED_USERS));
    }
  } catch (e) {}

  // 4. Try to persist to Supabase 'users' table
  try {
    await supabase.from('users').upsert(
      {
        id: userRecord.id,
        role: userRecord.role,
        full_name: userRecord.fullName,
        email: userRecord.email,
        phone: userRecord.phone,
        password_hash: userRecord.password,
        address: userRecord.address,
        business_name: userRecord.businessName,
        store_id: userRecord.storeId,
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    console.warn('Supabase users table insert failed, stored locally:', err);
  }

  return userRecord;
}



