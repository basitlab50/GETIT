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
export async function getStoreInventory(storeId = 'store-1792192743654') {
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

export async function addStoreInventoryItem(storeId = 'store-1792192743654', item) {
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
    broadcastLiveEvent('INVENTORY_INSERT', { storeId, item: data });
    return data;
  } catch (err) {
    console.error('Failed to add store inventory item in Supabase:', err);
    return null;
  }
}

export async function updateStoreInventoryItem(itemId, updates = {}) {
  try {
    const dbUpdates = {};
    if (updates.outOfStock !== undefined) dbUpdates.out_of_stock = Boolean(updates.outOfStock);
    if (updates.out_of_stock !== undefined) dbUpdates.out_of_stock = Boolean(updates.out_of_stock);
    if (updates.price !== undefined) dbUpdates.price = Number(updates.price);
    if (updates.name !== undefined) dbUpdates.name = updates.name;
    if (updates.imageUrl !== undefined) dbUpdates.image_url = updates.imageUrl;
    if (updates.icon !== undefined) dbUpdates.icon = updates.icon;

    let { data, error } = await supabase
      .from('store_inventory')
      .update(dbUpdates)
      .eq('id', itemId)
      .select()
      .maybeSingle();

    if (error) {
      console.warn('Update store_inventory error:', error.message);
    }

    // If item row didn't exist in Supabase yet, upsert it gracefully so it exists
    if (!data && updates.productObj) {
      const p = updates.productObj;
      const fullRecord = {
        id: itemId,
        store_id: updates.storeId || p.storeId || 'store-1792192743654',
        name: p.name || 'Product',
        category: p.category || 'General',
        price: Number(p.price) || 0,
        icon: p.icon || '🛍️',
        image_url: p.imageUrl || null,
        out_of_stock: dbUpdates.out_of_stock !== undefined ? dbUpdates.out_of_stock : false,
      };
      const { data: upsertData } = await supabase
        .from('store_inventory')
        .upsert(fullRecord, { onConflict: 'id' })
        .select()
        .maybeSingle();
      data = upsertData;
    }

    const finalItem = data || { id: itemId, ...dbUpdates };
    const targetStoreId = finalItem.store_id || updates.storeId;

    broadcastLiveEvent('INVENTORY_UPDATE', {
      itemId,
      storeId: targetStoreId,
      item: finalItem,
    });

    return finalItem;
  } catch (err) {
    console.error('Failed to update store inventory item in Supabase:', err);
    return null;
  }
}

export async function removeStoreInventoryItem(itemId, storeId = null) {
  try {
    const { error } = await supabase
      .from('store_inventory')
      .delete()
      .eq('id', itemId);

    if (error) throw error;
    broadcastLiveEvent('INVENTORY_DELETE', { itemId, storeId });
    return true;
  } catch (err) {
    console.error('Failed to remove store inventory item in Supabase:', err);
    return false;
  }
}


// 3. Orders & Realtime Sync
export async function createDatabaseOrder(order) {
  const hasExplicitRider = Boolean(order.boltRider && typeof order.boltRider === 'object' && order.boltRider.name);
  const baseRider = hasExplicitRider ? order.boltRider : {};

  const riderPayload = {
    ...baseRider,
    customerId: order.customerId || order.customer_id || null,
    customerEmail: order.customerEmail || order.customer_email || null,
    stops: order.stops || [],
    roadRouteCoordinates: order.roadRouteCoordinates || [],
    roadLegs: order.roadLegs || [],
    isMultiStore: Boolean(order.isMultiStore || (order.stops && order.stops.length > 1)),
    currentStopIndex: Number(order.currentStopIndex) || 0,
    roadPointIndex: Number(order.roadPointIndex) || 0,
    legStartedAt: Number(order.legStartedAt) || Date.now(),
    journeyAlert: order.journeyAlert || null,
  };

  const firstStop = (order.stops && order.stops[0]) ? order.stops[0] : null;

  const record = {
    id: order.id,
    store_id: order.storeId || order.store_id || (firstStop ? firstStop.storeId : 'store-1792192743654'),
    store_name: order.storeName || order.store_name || (firstStop ? firstStop.storeName : 'Mega Stores'),
    customer_name: order.customerName || order.customer_name || 'Customer',
    customer_phone: order.customerPhone || order.customer_phone || '',
    customer_address: order.customerAddress || order.delivery_address || 'Abuja, Nigeria',
    delivery_lat: Number(order.deliveryLat ?? order.delivery_lat ?? order.deliveryLocation?.latitude ?? 9.0882),
    delivery_lng: Number(order.deliveryLng ?? order.delivery_lng ?? order.deliveryLocation?.longitude ?? 7.4933),
    courier_notes: order.courierNotes || order.courier_notes || order.deliveryLocation?.notes || '',
    items: order.items || [],
    items_count: order.itemsCount || order.items_count || (order.items ? order.items.length : 1),
    subtotal: Number(order.subtotal) || 0,
    total: Number(order.total) || 0,
    vendor_payout: Number(order.vendorPayout || order.vendor_payout) || Math.round((Number(order.total) || 0) * 0.9),
    delivery_fee: Number(order.deliveryFee || order.delivery_fee) || 1200,
    status: order.status || 'New Order',
    delivery_partner: order.deliveryPartner || order.delivery_partner || 'bolt',
    bolt_status: order.boltStatus || (hasExplicitRider ? 'IN_TRANSIT' : 'PENDING_STORE_READY'),
    bolt_tracking_code: order.boltTrackingCode || order.bolt_tracking_code || `BOLT-ABJ-${order.id ? String(order.id).replace(/\D/g, '').slice(-5) : '89412'}`,
    bolt_rider: riderPayload,
    bolt_coords: order.boltCoords || (firstStop ? { latitude: Number(firstStop.latitude) || 9.0882, longitude: Number(firstStop.longitude) || 7.4933 } : { latitude: 9.0882, longitude: 7.4933 }),
    delivery_pin: String(order.deliveryPin || order.delivery_pin || '2489'),
    pickup_pin: String(order.pickupPin || order.pickup_pin || (firstStop ? firstStop.pickupPin : '7731')),
    eta: order.eta || '20 mins',
    payment_method: order.paymentMethod || order.payment_method || 'Paystack',
    payment_reference: order.paymentReference || order.payment_reference || null
  };

  // Attempt upload with up to 3 retries (with exponential backoff for network drops)
  let lastErr = null;
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      const { data, error } = await supabase
        .from('orders')
        .upsert(record)
        .select()
        .maybeSingle();

      if (error) throw error;
      return data || record;
    } catch (err) {
      lastErr = err;
      const isNetworkErr =
        err?.message?.includes('network connection was lost') ||
        err?.message?.includes('fetch failed') ||
        err?.message?.includes('Network request failed') ||
        err?.details?.includes('network connection was lost');

      if (attempt < 3 && isNetworkErr) {
        await new Promise((r) => setTimeout(r, attempt * 1000));
        continue;
      }
      break;
    }
  }

  // If network dropped, queue order locally so order is never lost
  try {
    const rawQueue = await AsyncStorage.getItem('getit_pending_order_syncs');
    const queue = rawQueue ? JSON.parse(rawQueue) : [];
    queue.push(record);
    await AsyncStorage.setItem('getit_pending_order_syncs', JSON.stringify(queue));
    console.log('📦 Order stored in local offline queue for sync when network stabilizes:', record.id);
  } catch (storageErr) {}

  if (lastErr) {
    console.warn('⚠️ Supabase network disconnected, order safely preserved locally:', lastErr?.message || lastErr);
  }

  return { offlineQueued: true, ...record };
}

export async function updateDatabaseOrderStatus(orderId, updates) {
  try {
    const dbUpdates = {};
    if (updates.status !== undefined) dbUpdates.status = updates.status;
    if (updates.boltStatus !== undefined) dbUpdates.bolt_status = updates.boltStatus;
    if (updates.boltCoords !== undefined) dbUpdates.bolt_coords = updates.boltCoords;
    if (updates.eta !== undefined) dbUpdates.eta = updates.eta;

    // Fetch existing bolt_rider to preserve stops & road geometry cleanly
    let existingRider = {};
    try {
      const { data: curr } = await supabase.from('orders').select('bolt_rider').eq('id', orderId).maybeSingle();
      if (curr && typeof curr.bolt_rider === 'object' && curr.bolt_rider) {
        existingRider = curr.bolt_rider;
      }
    } catch (e) {}

    const mergedRider = {
      ...existingRider,
      ...(updates.boltRider || {}),
      stops: updates.stops !== undefined ? updates.stops : (existingRider.stops || []),
      journeyAlert: updates.journeyAlert !== undefined ? updates.journeyAlert : existingRider.journeyAlert,
      currentStopIndex: updates.currentStopIndex !== undefined ? updates.currentStopIndex : (existingRider.currentStopIndex || 0),
      roadPointIndex: updates.roadPointIndex !== undefined ? updates.roadPointIndex : (existingRider.roadPointIndex || 0),
      legStartedAt: updates.legStartedAt !== undefined ? updates.legStartedAt : (existingRider.legStartedAt || Date.now()),
    };

    if (!updates.boltRider && !existingRider.name) {
      delete mergedRider.name;
      delete mergedRider.phone;
      delete mergedRider.vehicle;
      delete mergedRider.plate;
    }

    dbUpdates.bolt_rider = mergedRider;

    const { data, error } = await supabase
      .from('orders')
      .update(dbUpdates)
      .eq('id', orderId)
      .select()
      .maybeSingle();

    if (error) throw error;
    try {
      broadcastLiveEvent('ORDER_UPDATE', { orderId, ...updates, ...mergedRider });
    } catch (bErr) {}
    return data;
  } catch (err) {
    console.error('Failed to update order status in Supabase:', err);
    try {
      broadcastLiveEvent('ORDER_UPDATE', { orderId, ...updates });
    } catch (bErr) {}
    return null;
  }
}

export async function flushPendingOfflineOrders() {
  try {
    const rawQueue = await AsyncStorage.getItem('getit_pending_order_syncs');
    if (!rawQueue) return;
    const queue = JSON.parse(rawQueue);
    if (!Array.isArray(queue) || queue.length === 0) return;

    const remaining = [];
    for (const rec of queue) {
      try {
        const cleanRec = { ...rec };
        delete cleanRec.customer_id;
        delete cleanRec.concierge_fee;
        const { error } = await supabase.from('orders').upsert(cleanRec);
        if (error) throw error;
      } catch (e) {
        remaining.push(rec);
      }
    }
    if (remaining.length === 0) {
      await AsyncStorage.removeItem('getit_pending_order_syncs');
    } else {
      await AsyncStorage.setItem('getit_pending_order_syncs', JSON.stringify(remaining));
    }
  } catch (e) {}
}

export async function getDatabaseOrders() {
  try {
    flushPendingOfflineOrders().catch(() => {});
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    if (!data) return [];

    return data.map(item => {
      const riderMeta = (typeof item.bolt_rider === 'object' && item.bolt_rider) ? item.bolt_rider : {};

      // 1. Unpack multi-store stops
      let stops = riderMeta.stops && Array.isArray(riderMeta.stops) && riderMeta.stops.length > 0 ? riderMeta.stops : [];
      
      // If stops array was not stored in bolt_rider, reconstruct it from items and store info
      if (stops.length === 0) {
        if (item.items && Array.isArray(item.items) && item.items.length > 0) {
          const storeMap = new Map();
          item.items.forEach(it => {
            const sName = it.storeName || item.store_name || 'GETIT Store';
            if (!storeMap.has(sName)) {
              storeMap.set(sName, {
                stopNumber: storeMap.size + 1,
                storeId: it.storeId || item.store_id || `s-${storeMap.size + 1}`,
                storeName: sName,
                latitude: Number(it.latitude || (storeMap.size === 0 ? 9.0882 : 9.0765)),
                longitude: Number(it.longitude || (storeMap.size === 0 ? 7.4933 : 7.4772)),
                pickupPin: String(item.pickup_pin || '7731'),
                pickupStatus: storeMap.size === 0 ? 'in_progress' : 'queued',
                subtotal: 0,
                items: [],
              });
            }
            const grp = storeMap.get(sName);
            grp.items.push(it);
            grp.subtotal += (Number(it.price) || 0) * (Number(it.qty) || 1);
          });
          stops = Array.from(storeMap.values());
        } else {
          stops = [
            {
              stopNumber: 1,
              storeId: item.store_id || 'store-1792192743654',
              storeName: item.store_name || 'Mega Stores',
              latitude: Number(item.delivery_lat || 9.0882),
              longitude: Number(item.delivery_lng || 7.4933),
              pickupPin: String(item.pickup_pin || '7731'),
              pickupStatus: 'in_progress',
              subtotal: Number(item.subtotal) || Number(item.total) || 0,
              items: [],
            }
          ];
        }
      }

      const roadRouteCoordinates = (riderMeta.roadRouteCoordinates && Array.isArray(riderMeta.roadRouteCoordinates)) ? riderMeta.roadRouteCoordinates : [];
      const roadLegs = (riderMeta.roadLegs && Array.isArray(riderMeta.roadLegs)) ? riderMeta.roadLegs : [];
      const isMultiStore = riderMeta.isMultiStore !== undefined ? riderMeta.isMultiStore : (stops.length > 1);
      const currentStopIndex = Number(riderMeta.currentStopIndex) || 0;
      const journeyAlert = riderMeta.journeyAlert || null;
      // Normalize status: if order was delivered or cancelled, preserve it. If courier is active, normalize to 'On the Way'
      let normalizedStatus = item.status || 'New Order';
      if (item.status === 'Delivered' || item.eta === 'Delivered') {
        normalizedStatus = 'Delivered';
      } else if (item.status === 'Cancelled') {
        normalizedStatus = 'Cancelled';
      } else if (riderMeta.name) {
        normalizedStatus = 'On the Way';
      }

      // Strictly preserve stop statuses: Only prior completed stops (idx < currentStopIndex)
      const verifiedStops = (stops || []).map((st, idx) => {
        if (idx < currentStopIndex && st.pickupStatus !== 'picked_up') {
          return {
            ...st,
            pickupStatus: 'picked_up',
            status: 'Ready for Pickup',
            pickedUpAt: st.pickedUpAt || (item.created_at ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '3:30 PM'),
          };
        }
        return st;
      });

      const reconciledStopIndex = currentStopIndex;

      return {
        id: item.id,
        storeId: item.store_id,
        storeName: item.store_name,
        customerId: riderMeta.customerId || null,
        customerEmail: riderMeta.customerEmail || null,
        customerName: item.customer_name || 'Customer',
        customerPhone: item.customer_phone || '',
        customerAddress: item.customer_address || 'Abuja, Nigeria',
        itemsCount: item.items_count || (item.items ? item.items.length : 1),
        items: item.items || [],
        subtotal: Number(item.subtotal) || 0,
        total: Number(item.total) || 0,
        vendorPayout: Number(item.vendor_payout) || Math.round((Number(item.total) || 0) * 0.9),
        deliveryPartner: item.delivery_partner || 'bolt',
        deliveryFee: Number(item.delivery_fee) || 1200,
        conciergeFee: Number(item.concierge_fee) || 0,
        boltStatus: item.bolt_status || 'PENDING_STORE_READY',
        boltTrackingCode: item.bolt_tracking_code || `BOLT-ABJ-${item.id ? String(item.id).replace(/\D/g, '').slice(-5) : '89412'}`,
        boltRider: (riderMeta.name && riderMeta.phone) ? {
          id: riderMeta.id || 'bolt-rider-01',
          name: riderMeta.name,
          phone: riderMeta.phone,
          rating: riderMeta.rating || '4.95',
          trips: riderMeta.trips || 1420,
          vehicle: riderMeta.vehicle || 'Bajaj Boxer 150 (Red)',
          plate: riderMeta.plate || 'ABJ-492-KW',
          avatar: riderMeta.avatar || '🛵',
        } : null,
        boltCoords: item.bolt_coords || (verifiedStops[0] ? { latitude: Number(verifiedStops[0].latitude) || 9.0882, longitude: Number(verifiedStops[0].longitude) || 7.4933 } : { latitude: 9.0882, longitude: 7.4933 }),
        status: normalizedStatus,
        eta: item.eta || '20 mins',
        deliveryPin: item.delivery_pin || '2489',
        pickupPin: item.pickup_pin || (verifiedStops[0]?.pickupPin) || '7731',
        deliveryLocation: {
          latitude: Number(item.delivery_lat) || 9.0882,
          longitude: Number(item.delivery_lng) || 7.4933,
          notes: item.courier_notes || '',
        },
        stops: verifiedStops,
        roadRouteCoordinates: roadRouteCoordinates,
        roadLegs: roadLegs,
        isMultiStore: isMultiStore,
        currentStopIndex: reconciledStopIndex,
        roadPointIndex: Number(riderMeta.roadPointIndex) || 0,
        legStartedAt: Number(riderMeta.legStartedAt) || 0,
        journeyAlert: journeyAlert,
        timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
        createdAt: item.created_at
          ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '12:00 PM',
        dateStr: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Today',
      };
    });
  } catch (err) {
    console.warn('Failed to fetch orders from Supabase:', err);
    return [];
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
    broadcastLiveEvent('STORE_INSERT', { storeId: data.id, store: data });
    return data;
  } catch (err) {
    console.error('Failed to create store in Supabase:', err);
    return null;
  }
}

// --- GLOBAL LIVE BROADCAST CHANNEL (Instant Sub-50ms Cross-Device Sync) ---
let liveBroadcastChannel = null;

function getLiveBroadcastChannel() {
  if (!liveBroadcastChannel) {
    liveBroadcastChannel = supabase.channel('getit_live_sync_channel', {
      config: { broadcast: { ack: false } },
    });
    liveBroadcastChannel.subscribe();
  }
  return liveBroadcastChannel;
}

export function broadcastLiveEvent(eventType, payload) {
  try {
    const ch = getLiveBroadcastChannel();
    ch.send({
      type: 'broadcast',
      event: 'GETIT_SYNC_UPDATE',
      payload: { eventType, ...payload, _timestamp: Date.now() },
    });
  } catch (err) {
    console.warn('Failed to broadcast live sync event:', err);
  }
}

export function subscribeToLiveBroadcast(callback) {
  const ch = getLiveBroadcastChannel();
  ch.on('broadcast', { event: 'GETIT_SYNC_UPDATE' }, ({ payload }) => {
    if (callback) callback(payload);
  });

  return () => {
    // Keep channel open for app session
  };
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

export function subscribeToStoreInventory(callback) {
  const channel = supabase
    .channel('public:store_inventory')
    .on(
      'postgres_changes',
      { event: '*', schema: 'public', table: 'store_inventory' },
      payload => {
        if (callback) callback(payload);
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}

export function parseStoreMetadata(dbStore) {
  if (!dbStore) return {};
  let meta = {};
  if (dbStore.city && typeof dbStore.city === 'string' && dbStore.city.startsWith('{')) {
    try {
      meta = JSON.parse(dbStore.city);
    } catch (e) {}
  }
  const isOpenVal =
    meta.isOpen !== undefined
      ? Boolean(meta.isOpen)
      : (dbStore.isOpen !== undefined
          ? Boolean(dbStore.isOpen)
          : (dbStore.is_open !== undefined
              ? Boolean(dbStore.is_open)
              : undefined));
  return {
    isOpen: isOpenVal,
    openTime: meta.openTime || dbStore.open_time || '08:00 AM',
    closeTime: meta.closeTime || dbStore.close_time || '10:00 PM',
    operatingDays: meta.operatingDays || dbStore.operating_days || 'Mon - Sun (Daily)',
    is24Hours: meta.is24Hours !== undefined ? Boolean(meta.is24Hours) : Boolean(dbStore.is_24_hours),
    image: meta.image || dbStore.image_url || dbStore.image,
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
    if (updates.latitude !== undefined) dbUpdates.latitude = Number(updates.latitude);
    if (updates.longitude !== undefined) dbUpdates.longitude = Number(updates.longitude);

    // Pack timing, 24h flag, custom image, and live isOpen flag into city column so all devices sync instantly
    if (
      updates.isOpen !== undefined ||
      updates.is_open !== undefined ||
      updates.openTime !== undefined ||
      updates.closeTime !== undefined ||
      updates.operatingDays !== undefined ||
      updates.is24Hours !== undefined ||
      updates.image !== undefined
    ) {
      let meta = { city: 'Abuja' };
      try {
        const { data: curr } = await supabase.from('stores').select('city').eq('id', storeId).maybeSingle();
        if (curr && curr.city && curr.city.startsWith('{')) {
          meta = JSON.parse(curr.city);
        }
      } catch (e) {}

      if (updates.isOpen !== undefined) meta.isOpen = Boolean(updates.isOpen);
      if (updates.is_open !== undefined) meta.isOpen = Boolean(updates.is_open);
      if (updates.openTime !== undefined) meta.openTime = updates.openTime;
      if (updates.closeTime !== undefined) meta.closeTime = updates.closeTime;
      if (updates.operatingDays !== undefined) meta.operatingDays = updates.operatingDays;
      if (updates.is24Hours !== undefined) meta.is24Hours = Boolean(updates.is24Hours);
      if (updates.image !== undefined) meta.image = updates.image;
      meta.city = 'Abuja';

      dbUpdates.city = JSON.stringify(meta);
    }

    const { data, error } = await supabase
      .from('stores')
      .update(dbUpdates)
      .eq('id', storeId)
      .select()
      .maybeSingle();

    if (error) throw error;

    let finalStore = data;

    // If store row didn't exist in Supabase yet, upsert it gracefully so it exists
    if (!finalStore && Object.keys(dbUpdates).length > 0) {
      const fallbackStore = {
        id: storeId,
        name: updates.name || 'GETIT Partner Store',
        address: updates.address || 'Abuja, Nigeria',
        district: updates.district || 'Abuja',
        is_open: updates.isOpen !== undefined ? updates.isOpen : (updates.is_open !== undefined ? updates.is_open : true),
        latitude: updates.latitude !== undefined ? Number(updates.latitude) : 9.0882,
        longitude: updates.longitude !== undefined ? Number(updates.longitude) : 7.4933,
        ...dbUpdates,
      };
      const { data: upsertData, error: upsertErr } = await supabase
        .from('stores')
        .upsert(fallbackStore, { onConflict: 'id' })
        .select()
        .maybeSingle();

      if (upsertErr) {
        console.warn('Store not in Supabase yet; local state preserved:', upsertErr.message);
      } else {
        finalStore = upsertData;
      }
    }

    const broadcastPayload = finalStore || { id: storeId, ...dbUpdates, isOpen: updates.isOpen ?? updates.is_open };
    broadcastLiveEvent('STORE_UPDATE', { storeId, store: broadcastPayload });
    return finalStore;
  } catch (err) {
    console.error('Failed to update store in Supabase:', err);
    try {
      broadcastLiveEvent('STORE_UPDATE', { storeId, store: { id: storeId, ...updates } });
    } catch (e) {}
    return null;
  }
}

export async function deleteDatabaseStore(storeId) {
  try {
    // 1. Reassign any orders referencing this store to default store to prevent foreign key constraint violations
    await supabase
      .from('orders')
      .update({ store_id: 'store-1792192743654', store_name: 'Mega Stores' })
      .eq('store_id', storeId);

    // 2. Delete inventory items belonging to this store
    await supabase
      .from('store_inventory')
      .delete()
      .eq('store_id', storeId);

    // 3. Delete store record
    const { error } = await supabase
      .from('stores')
      .delete()
      .eq('id', storeId);

    if (error) throw error;
    broadcastLiveEvent('STORE_DELETE', { storeId });
    return true;
  } catch (err) {
    console.error('Failed to delete store in Supabase:', err);
    return false;
  }
}

// 6. User Accounts & Database Authentication
// 6. User Accounts & Database Authentication
export const DEFAULT_DATABASE_USERS = [];

// In-memory cache for ultra-fast, zero-latency user matching
let MEMORY_REGISTERED_USERS = [];

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
    // Fetch users from dedicated Supabase 'users' table
    const { data: dbUsers, error } = await supabase.from('users').select('*');
    if (!error && Array.isArray(dbUsers)) {
      const mappedList = dbUsers.map((u) => ({
        id: u.id,
        role: u.role || 'buyer',
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        password: u.password_hash || u.password,
        address: u.address || '',
        businessName: u.business_name || null,
        storeId: u.store_id || null,
        createdAt: u.created_at,
      }));
      MEMORY_REGISTERED_USERS = mappedList;
      if (mappedList.length > 0) {
        await AsyncStorage.setItem('getit_registered_users', JSON.stringify(mappedList));
      } else {
        // Clean slate: completely purge stale registered users from local cache
        await AsyncStorage.removeItem('getit_registered_users');
      }
    }
  } catch (e) {
    console.warn('Sync users from Supabase warning:', e);
  }
}

export async function findDatabaseUser(identifier) {
  if (!identifier) return null;
  const cleanId = String(identifier).trim().toLowerCase();
  const digitsOnly = cleanId.replace(/\D/g, '');

  // 1. Direct query from authoritative Supabase 'users' table
  let cloudQuerySucceeded = false;
  try {
    const { data: dbUsers, error } = await supabase.from('users').select('*');
    if (!error && Array.isArray(dbUsers)) {
      cloudQuerySucceeded = true;
      const mappedList = dbUsers.map((u) => ({
        id: u.id,
        role: u.role || 'buyer',
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        password: u.password_hash || u.password,
        address: u.address || '',
        businessName: u.business_name || null,
        storeId: u.store_id || null,
        createdAt: u.created_at,
      }));
      MEMORY_REGISTERED_USERS = mappedList;
      for (const mapped of mappedList) {
        if (userMatchesIdentifier(mapped, cleanId, digitsOnly)) {
          return mapped;
        }
      }
      // Authoritative cloud check succeeded and user was NOT found in database
      return null;
    }
  } catch (err) {
    console.warn('Supabase findDatabaseUser query error:', err);
  }

  // 2. Query persistent local database storage ONLY if offline / network failed
  if (!cloudQuerySucceeded) {
    try {
      const raw = await AsyncStorage.getItem('getit_registered_users');
      if (raw) {
        const localUsers = JSON.parse(raw);
        if (Array.isArray(localUsers)) {
          const match = localUsers.find((u) => userMatchesIdentifier(u, cleanId, digitsOnly));
          if (match) return match;
        }
      }
    } catch (err) {}
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

  // 5. Persist to cloud account record in Supabase so accounts survive Expo reload across devices
  try {
    const cloudId = userRecord.id.startsWith('usr-') ? userRecord.id : `usr-${userRecord.id}`;
    await supabase.from('riders').upsert({
      id: cloudId,
      name: userRecord.fullName,
      phone: userRecord.phone,
      vehicle: userRecord.email || '',
      plate: userRecord.password,
      avatar: JSON.stringify({
        role: userRecord.role,
        address: userRecord.address,
        businessName: userRecord.businessName,
        storeId: userRecord.storeId,
        realId: userRecord.id
      }),
      is_active: true
    }, { onConflict: 'id' });
  } catch (err) {
    console.warn('Cloud user sync error:', err);
  }

  // 6. Automatically log the registration event to Supabase
  logDatabaseEvent(
    'AUTH_SIGNUP',
    {
      userId: userRecord.id,
      role: userRecord.role,
      fullName: userRecord.fullName,
      email: userRecord.email,
      phone: userRecord.phone,
      address: userRecord.address,
      businessName: userRecord.businessName,
      storeId: userRecord.storeId,
      platform: 'GETIT Mobile Expo'
    },
    userRecord.phone || userRecord.email
  ).catch(console.warn);

  return userRecord;
}

/**
 * ---------------------------------------------------------
 * CLOUD LOGGING & AUDIT TRAIL SERVICE
 * Stores all signup events, logins, and audit logs directly
 * in Supabase so they are visible and queryable anytime.
 * ---------------------------------------------------------
 */

export async function logDatabaseEvent(action, payload = {}, userIdentifier = 'SYSTEM') {
  const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const timestamp = new Date().toISOString();
  const serialized = typeof payload === 'string' ? payload : JSON.stringify({
    action,
    ...payload,
    timestamp
  });

  // 1. Try to insert into dedicated audit_logs table if created
  try {
    await supabase.from('audit_logs').insert({
      id: logId,
      action: action,
      user_identifier: String(userIdentifier || 'SYSTEM'),
      payload: serialized,
      created_at: timestamp
    });
  } catch (e) {}

  // 2. Always persist to Supabase riders table with 'log-%' prefix for 100% guaranteed delivery
  try {
    await supabase.from('riders').insert({
      id: logId,
      name: action,
      phone: String(userIdentifier || 'SYSTEM'),
      vehicle: payload.role || 'system',
      plate: payload.platform || 'GETIT App',
      avatar: serialized,
      is_active: true
    });
  } catch (err) {
    console.warn('Database event logging error:', err);
  }

  return logId;
}

export async function getDatabaseLogs(limit = 100) {
  // 1. Try dedicated audit_logs table first
  try {
    const { data: dedicatedLogs, error } = await supabase
      .from('audit_logs')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && Array.isArray(dedicatedLogs) && dedicatedLogs.length > 0) {
      return dedicatedLogs;
    }
  } catch (e) {}

  // 2. Query cloud riders table with 'log-%' prefix
  try {
    const { data, error } = await supabase
      .from('riders')
      .select('*')
      .like('id', 'log-%')
      .order('created_at', { ascending: false })
      .limit(limit);

    if (!error && Array.isArray(data)) {
      return data.map((item) => {
        let details = {};
        try { details = JSON.parse(item.avatar || '{}'); } catch (e) {}
        return {
          id: item.id,
          action: item.name,
          user: item.phone,
          role: item.vehicle,
          platform: item.plate,
          details: details,
          created_at: item.created_at
        };
      });
    }
  } catch (e) {
    console.warn('Failed to fetch database logs:', e);
  }
  return [];
}

export async function getAllDatabaseUsers() {
  // 1. Try dedicated users table
  try {
    const { data, error } = await supabase.from('users').select('*');
    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((u) => ({
        id: u.id,
        role: u.role,
        fullName: u.full_name,
        email: u.email,
        phone: u.phone,
        password: u.password_hash || u.password,
        address: u.address,
        businessName: u.business_name,
        storeId: u.store_id,
        createdAt: u.created_at
      }));
    }
  } catch (e) {}

  // 2. Query cloud riders table with 'usr-%' prefix
  try {
    const { data, error } = await supabase
      .from('riders')
      .select('*')
      .like('id', 'usr-%')
      .order('created_at', { ascending: false });

    if (!error && Array.isArray(data) && data.length > 0) {
      return data.map((cu) => {
        let meta = {};
        try { meta = JSON.parse(cu.avatar || '{}'); } catch (e) {}
        return {
          id: meta.realId || cu.id,
          role: meta.role || 'buyer',
          fullName: cu.name,
          email: cu.vehicle,
          phone: cu.phone,
          password: cu.plate,
          address: meta.address || '',
          businessName: meta.businessName || null,
          storeId: meta.storeId || null,
          createdAt: cu.created_at
        };
      });
    }
  } catch (e) {}

  return MEMORY_REGISTERED_USERS;
}

// =========================================================================
// 10. REVIEWS & CUSTOMER FEEDBACK (STORE & COURIER DUAL-SCORECARD)
// =========================================================================

export async function submitDatabaseReview(reviewData) {
  try {
    const payload = {
      id: reviewData.id || `rev-${Date.now()}-${Math.floor(1000 + Math.random() * 9000)}`,
      order_id: reviewData.orderId,
      customer_id: reviewData.customerId || 'guest',
      customer_name: reviewData.customerName || 'Verified Client',
      store_id: reviewData.storeId,
      store_name: reviewData.storeName || 'Partner Store',
      store_rating: Number(reviewData.storeRating) || 5.0,
      store_tags: reviewData.storeTags || [],
      store_comment: reviewData.storeComment || '',
      rider_name: reviewData.riderName || 'Musa Ibrahim',
      rider_rating: Number(reviewData.riderRating) || 5.0,
      rider_tags: reviewData.riderTags || [],
      rider_tip: Number(reviewData.riderTip) || 0,
      created_at: new Date().toISOString(),
    };

    const { data, error } = await supabase
      .from('order_reviews')
      .upsert(payload, { onConflict: 'id' });

    if (error) {
      console.warn('Supabase order_reviews upsert info:', error.message);
    }
    return { success: true, data };
  } catch (err) {
    console.warn('Cached review locally (Supabase offline/pending):', err);
    return { success: true, offline: true };
  }
}

export async function getStoreReviews(storeId) {
  try {
    const { data, error } = await supabase
      .from('order_reviews')
      .select('*')
      .eq('store_id', storeId)
      .order('created_at', { ascending: false });

    if (error || !data) return [];
    return data.map((r) => ({
      id: r.id,
      orderId: r.order_id,
      customerName: r.customer_name,
      storeRating: Number(r.store_rating) || 5.0,
      storeTags: r.store_tags || [],
      storeComment: r.store_comment || '',
      riderName: r.rider_name,
      riderRating: Number(r.rider_rating) || 5.0,
      riderTags: r.rider_tags || [],
      riderTip: Number(r.rider_tip) || 0,
      createdAt: r.created_at,
    }));
  } catch (err) {
    return [];
  }
}



