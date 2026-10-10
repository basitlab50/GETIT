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
