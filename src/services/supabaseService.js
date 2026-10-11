import { supabase } from '../lib/supabase';
import { NIGERIAN_GROCERIES_CATALOG } from '../data/nigerianGroceriesCatalog';

/**
 * Supabase Data Service for Web App
 */

// 1. Master Catalog Products
export async function getMasterCatalog() {
  try {
    const { data, error } = await supabase
      .from('master_catalog_products')
      .select('*')
      .order('category', { ascending: true });

    if (error || !data || data.length === 0) {
      return NIGERIAN_GROCERIES_CATALOG;
    }

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

// 2. Stores & Merchants
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

// 3. Store Inventory
export async function getStoreInventory(storeId) {
  try {
    const query = supabase.from('store_inventory').select('*');
    if (storeId) query.eq('store_id', storeId);
    const { data, error } = await query.order('created_at', { ascending: false });

    if (error) throw error;
    return (data || []).map(item => ({
      id: item.id,
      storeId: item.store_id,
      name: item.name,
      category: item.category,
      price: Number(item.price) || 0,
      icon: item.icon || '🛍️',
      imageUrl: item.image_url,
      outOfStock: !!item.out_of_stock
    }));
  } catch (err) {
    console.warn('Failed to fetch store inventory from Supabase:', err);
    return [];
  }
}

// 4. Orders & Realtime Sync
export async function getOrders() {
  try {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (err) {
    console.warn('Failed to fetch orders from Supabase:', err);
    return [];
  }
}

export function subscribeToOrders(callback) {
  const channel = supabase
    .channel('web:orders')
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
