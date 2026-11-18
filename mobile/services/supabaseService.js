import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { NIGERIAN_GROCERIES_CATALOG } from '../data/nigerianGroceriesCatalog';
import {
  DEFAULT_MARKETPLACE_TAXONOMY,
  TAXONOMY_STORAGE_KEY,
  CATEGORY_REQUESTS_STORAGE_KEY,
  REMOVED_TEST_STORE_IDS,
  normalizeTaxonomyCatalog,
  getDefaultStoreCoverImage,
} from '../data/marketplaceTaxonomy';

/**
 * Supabase Data Service for Mobile App
 * Provides seamless sync between cloud PostgreSQL and local offline fallback.
 */

let lastNetworkNoticeTime = 0;
export function isNetworkOrDnsError(err) {
  if (!err) return false;
  const str = String(err?.message || '') + ' ' + String(err?.details || '') + ' ' + String(err || '');
  return (
    str.includes('hostname could not be found') ||
    str.includes('Network request failed') ||
    str.includes('network connection was lost') ||
    str.includes('fetch failed') ||
    str.includes('AbortError') ||
    str.includes('ENOTFOUND') ||
    str.includes('EAI_AGAIN') ||
    str.includes('timed out')
  );
}

export function logNetworkNotice(context, err) {
  const now = Date.now();
  if (isNetworkOrDnsError(err)) {
    if (now - lastNetworkNoticeTime > 45000) {
      lastNetworkNoticeTime = now;
      console.log(`📡 [Network Notice] ${context}: Device currently cannot reach Supabase. Operating with local offline storage.`);
    }
  } else {
    console.warn(`[Supabase Error] ${context}:`, err?.message || err);
  }
}

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
    logNetworkNotice('getStoreInventory', err);
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
    snappedWaypoints: order.snappedWaypoints || [],
    riderOrigin: order.riderOrigin || null,
    isMultiStore: Boolean(order.isMultiStore || (order.stops && order.stops.length > 1)),
    currentStopIndex: Number(order.currentStopIndex) || 0,
    roadPointIndex: Number(order.roadPointIndex) || 0,
    legStartedAt: order.status === 'On the Way' ? (Number(order.legStartedAt) || Date.now()) : (Number(order.legStartedAt) || 0),
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
      const savedOrder = data || record;
      try {
        broadcastLiveEvent('NEW_ORDER', {
          orderId: savedOrder.id,
          order: savedOrder,
        });
      } catch (broadcastErr) {}
      return savedOrder;
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
  // Broadcast explicit updates immediately for sub-50ms cross-device responsiveness
  try {
    broadcastLiveEvent('ORDER_UPDATE', {
      orderId,
      ...updates,
    });
  } catch (earlyBroadcastErr) {}

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

    const resolveProposalMerge = (existingProp, updateProp) => {
      if (updateProp === null) return null;
      if (updateProp !== undefined) {
        if (
          existingProp &&
          existingProp.status &&
          existingProp.status !== 'pending' &&
          updateProp.status === 'pending' &&
          (!updateProp.id || !existingProp.id || updateProp.id === existingProp.id)
        ) {
          return existingProp;
        }
        return updateProp;
      }
      return existingRider ? existingProp || null : null;
    };

    const mergedRider = {
      ...existingRider,
      ...(updates.boltRider || {}),
      replacementProposal: resolveProposalMerge(existingRider.replacementProposal, updates.replacementProposal),
      outOfStockProposal: resolveProposalMerge(existingRider.outOfStockProposal, updates.outOfStockProposal),
      stops: updates.stops !== undefined ? updates.stops : (existingRider.stops || []),
      journeyAlert: updates.journeyAlert !== undefined ? updates.journeyAlert : existingRider.journeyAlert,
      currentStopIndex: updates.currentStopIndex !== undefined ? updates.currentStopIndex : (existingRider.currentStopIndex || 0),
      roadPointIndex: updates.roadPointIndex !== undefined ? updates.roadPointIndex : (existingRider.roadPointIndex || 0),
      legStartedAt: updates.legStartedAt !== undefined ? updates.legStartedAt : (existingRider.legStartedAt || 0),
      riderOrigin: updates.riderOrigin !== undefined ? updates.riderOrigin : (existingRider.riderOrigin || null),
      messages: updates.messages !== undefined ? updates.messages : (existingRider.messages || []),
      courierArrivedOutside: updates.courierArrivedOutside !== undefined ? updates.courierArrivedOutside : (existingRider.courierArrivedOutside || false),
      hasNotifiedArrived: updates.hasNotifiedArrived !== undefined ? updates.hasNotifiedArrived : (existingRider.hasNotifiedArrived || false),
      isMultiStore: updates.isMultiStore !== undefined ? updates.isMultiStore : (updates.stops ? updates.stops.length > 1 : (existingRider.isMultiStore || false)),
      transferredFromStoreId: updates.transferredFromStoreId !== undefined ? updates.transferredFromStoreId : (existingRider.transferredFromStoreId || null),
      transferredFromStoreName: updates.transferredFromStoreName !== undefined ? updates.transferredFromStoreName : (existingRider.transferredFromStoreName || null),
      transferredFromStoreIds: updates.transferredFromStoreIds !== undefined ? updates.transferredFromStoreIds : (existingRider.transferredFromStoreIds || []),
      transferredFromStoreNames: updates.transferredFromStoreNames !== undefined ? updates.transferredFromStoreNames : (existingRider.transferredFromStoreNames || []),
      roadRouteCoordinates: updates.roadRouteCoordinates !== undefined ? updates.roadRouteCoordinates : (updates.boltRider?.roadRouteCoordinates || existingRider.roadRouteCoordinates || []),
      roadLegs: updates.roadLegs !== undefined ? updates.roadLegs : (updates.boltRider?.roadLegs || existingRider.roadLegs || []),
      snappedWaypoints: updates.snappedWaypoints !== undefined ? updates.snappedWaypoints : (updates.boltRider?.snappedWaypoints || existingRider.snappedWaypoints || []),
    };

    if (!updates.boltRider && !existingRider.name && updates.status !== 'On the Way') {
      delete mergedRider.name;
      delete mergedRider.phone;
      delete mergedRider.vehicle;
      delete mergedRider.plate;
    } else if (updates.status === 'On the Way' && (!mergedRider.name || !mergedRider.phone)) {
      mergedRider.id = mergedRider.id || 'bolt-rider-01';
      mergedRider.name = 'Musa Ibrahim';
      mergedRider.phone = '+234 803 294 1194';
      mergedRider.rating = '4.95';
      mergedRider.vehicle = 'Bajaj Boxer 150 (Red)';
      mergedRider.plate = 'ABJ-492-KW';
      mergedRider.avatar = '🛵';
    }

    dbUpdates.bolt_rider = mergedRider;
    if (updates.items !== undefined) dbUpdates.items = updates.items;
    if (updates.subtotal !== undefined) dbUpdates.subtotal = updates.subtotal;
    if (updates.total !== undefined) dbUpdates.total = updates.total;
    if (updates.storeId !== undefined) dbUpdates.store_id = updates.storeId;
    if (updates.storeName !== undefined) dbUpdates.store_name = updates.storeName;
    if (updates.deliveryFee !== undefined) dbUpdates.delivery_fee = updates.deliveryFee;

    // Resilient update with exponential backoff (handles Expo/iOS "network connection was lost")
    let updateResult = null;
    let lastErr = null;
    for (let attempt = 1; attempt <= 3; attempt++) {
      try {
        const { data, error } = await supabase
          .from('orders')
          .update(dbUpdates)
          .eq('id', orderId)
          .select('id')
          .maybeSingle();

        if (error) throw error;
        updateResult = data || { id: orderId };
        break;
      } catch (err) {
        lastErr = err;
        const isNetworkErr = isNetworkOrDnsError(err);

        if (attempt < 3 && isNetworkErr) {
          await new Promise((r) => setTimeout(r, attempt * 600));
          continue;
        }
        break;
      }
    }

    if (!updateResult && lastErr) {
      throw lastErr;
    }

    try {
      broadcastLiveEvent('ORDER_UPDATE', {
        orderId,
        ...mergedRider,
        ...updates,
        replacementProposal: mergedRider.replacementProposal,
        outOfStockProposal: mergedRider.outOfStockProposal,
      });
    } catch (bErr) {}
    return updateResult;
  } catch (err) {
    logNetworkNotice('updateDatabaseOrderStatus', err);

    // Queue update locally in AsyncStorage so it automatically syncs when connection returns
    try {
      const rawQueue = await AsyncStorage.getItem('getit_pending_order_updates');
      const queue = rawQueue ? JSON.parse(rawQueue) : [];
      queue.push({ orderId, updates, queuedAt: Date.now() });
      await AsyncStorage.setItem('getit_pending_order_updates', JSON.stringify(queue.slice(-20)));
    } catch (qErr) {}

    try {
      broadcastLiveEvent('ORDER_UPDATE', {
        orderId,
        ...updates,
        replacementProposal: updates.replacementProposal,
        outOfStockProposal: updates.outOfStockProposal,
      });
    } catch (bErr) {}
    return null;
  }
}

export async function flushPendingOfflineOrders() {
  try {
    const rawQueue = await AsyncStorage.getItem('getit_pending_order_syncs');
    if (rawQueue) {
      const queue = JSON.parse(rawQueue);
      if (Array.isArray(queue) && queue.length > 0) {
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
      }
    }

    // Flush pending order updates (e.g., replacement approvals, out-of-stock items)
    const rawUpdateQueue = await AsyncStorage.getItem('getit_pending_order_updates');
    if (rawUpdateQueue) {
      const updateQueue = JSON.parse(rawUpdateQueue);
      if (Array.isArray(updateQueue) && updateQueue.length > 0) {
        const remainingUpdates = [];
        for (const item of updateQueue) {
          try {
            await updateDatabaseOrderStatus(item.orderId, item.updates);
          } catch (uErr) {
            remainingUpdates.push(item);
          }
        }
        if (remainingUpdates.length === 0) {
          await AsyncStorage.removeItem('getit_pending_order_updates');
        } else {
          await AsyncStorage.setItem('getit_pending_order_updates', JSON.stringify(remainingUpdates));
        }
      }
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
            const sName = item.store_name || it.storeName || 'Mega Stores';
            const sId = item.store_id || it.storeId || `s-${storeMap.size + 1}`;
            if (!storeMap.has(sName)) {
              storeMap.set(sName, {
                stopNumber: storeMap.size + 1,
                storeId: sId,
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
          // Genuine store coordinates in Abuja
          const defaultStoreLat = item.store_id === 'store-1792192743654' || (item.store_name || '').includes('Mega') ? 9.124943 : 9.113420;
          const defaultStoreLng = item.store_id === 'store-1792192743654' || (item.store_name || '').includes('Mega') ? 7.439559 : 7.440612;
          stops = [
            {
              stopNumber: 1,
              storeId: item.store_id || 'store-1792192743654',
              storeName: item.store_name || 'Mega Stores',
              latitude: defaultStoreLat,
              longitude: defaultStoreLng,
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
      // Normalize status: preserve explicit lifecycle statuses; only use 'On the Way' when dispatched
      let normalizedStatus = item.status || 'New Order';
      if (item.status === 'Delivered' || item.eta === 'Delivered') {
        normalizedStatus = 'Delivered';
      } else if (item.status === 'Cancelled') {
        normalizedStatus = 'Cancelled';
      } else if (
        item.status === 'New Order' ||
        item.status === 'Preparing' ||
        item.status === 'Ready for Pickup' ||
        item.status === 'Looking for Courier' ||
        item.status === 'On the Way'
      ) {
        normalizedStatus = item.status;
      } else if (riderMeta.name) {
        normalizedStatus = 'On the Way';
      }

      // Clamp currentStopIndex so the rider never skips ahead of unpicked store stops
      const verifiedStops = (stops || []).map((st) => ({ ...st }));
      const firstUnpickedIdx = verifiedStops.findIndex(
        (st) => st.pickupStatus !== 'picked_up' && st.status !== 'Completed'
      );
      const allStopsPicked = firstUnpickedIdx === -1 && verifiedStops.length > 0;
      const maxAllowedStopIdx = firstUnpickedIdx === -1 ? verifiedStops.length : firstUnpickedIdx;
      const reconciledStopIndex = normalizedStatus === 'Delivered'
        ? verifiedStops.length
        : Math.min(Math.max(0, currentStopIndex), maxAllowedStopIdx);

      return {
        id: item.id,
        storeId: item.store_id,
        storeName: item.store_name,
        customerId: riderMeta.customerId || null,
        customerEmail: riderMeta.customerEmail || null,
        replacementProposal: riderMeta.replacementProposal || null,
        outOfStockProposal: riderMeta.outOfStockProposal || null,
        transferredFromStoreId: riderMeta.transferredFromStoreId || null,
        transferredFromStoreName: riderMeta.transferredFromStoreName || null,
        transferredFromStoreIds: Array.isArray(riderMeta.transferredFromStoreIds) ? riderMeta.transferredFromStoreIds : (riderMeta.transferredFromStoreId ? [String(riderMeta.transferredFromStoreId)] : []),
        transferredFromStoreNames: Array.isArray(riderMeta.transferredFromStoreNames) ? riderMeta.transferredFromStoreNames : (riderMeta.transferredFromStoreName ? [String(riderMeta.transferredFromStoreName).toLowerCase()] : []),
        messages: (riderMeta.messages && Array.isArray(riderMeta.messages)) ? riderMeta.messages : [],
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
        boltRider: (normalizedStatus === 'On the Way' || normalizedStatus === 'Delivered') && (riderMeta.name && riderMeta.phone) ? {
          id: riderMeta.id || 'bolt-rider-01',
          name: riderMeta.name,
          phone: riderMeta.phone,
          rating: riderMeta.rating || '4.95',
          trips: riderMeta.trips || 1420,
          vehicle: riderMeta.vehicle || 'Bajaj Boxer 150 (Red)',
          plate: riderMeta.plate || 'ABJ-492-KW',
          avatar: riderMeta.avatar || '🛵',
        } : (normalizedStatus === 'On the Way' ? {
          id: 'bolt-rider-01',
          name: 'Musa Ibrahim',
          phone: '+234 803 294 1194',
          rating: '4.95',
          trips: 1420,
          vehicle: 'Bajaj Boxer 150 (Red)',
          plate: 'ABJ-492-KW',
          avatar: '🛵',
        } : null),
        boltCoords: item.bolt_coords || (verifiedStops[0] ? { latitude: Number(verifiedStops[0].latitude) || 9.0882, longitude: Number(verifiedStops[0].longitude) || 7.4933 } : { latitude: 9.0882, longitude: 7.4933 }),
        riderOrigin: riderMeta.riderOrigin || null,
        snappedWaypoints: (riderMeta.snappedWaypoints && Array.isArray(riderMeta.snappedWaypoints)) ? riderMeta.snappedWaypoints : [],
        courierArrivedOutside: Boolean(riderMeta.courierArrivedOutside && allStopsPicked),
        hasNotifiedArrived: Boolean(riderMeta.hasNotifiedArrived && allStopsPicked),
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
        legStartedAt: normalizedStatus === 'On the Way' ? (Number(riderMeta.legStartedAt) || 0) : 0,
        journeyAlert: journeyAlert,
        timestamp: item.created_at ? new Date(item.created_at).getTime() : Date.now(),
        createdAt: item.created_at
          ? new Date(item.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          : '12:00 PM',
        dateStr: item.created_at ? new Date(item.created_at).toLocaleDateString() : 'Today',
      };
    });
  } catch (err) {
    logNetworkNotice('getOrders', err);
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
const REMOVED_STORE_ID_SET = new Set(Array.isArray(REMOVED_TEST_STORE_IDS) ? REMOVED_TEST_STORE_IDS : []);

export function deduplicateAndCleanStores(rawStores = []) {
  if (!Array.isArray(rawStores)) return [];
  const seenIds = new Set();
  const seenNameKeys = new Map();
  const cleaned = [];

  for (const st of rawStores) {
    if (!st || !st.id) continue;
    if (REMOVED_STORE_ID_SET.has(st.id)) continue;
    if (seenIds.has(st.id)) continue;

    const normName = String(st.name || '').trim().toLowerCase();
    if (!normName) continue;

    if (seenNameKeys.has(normName)) {
      const existingIdx = seenNameKeys.get(normName);
      const existing = cleaned[existingIdx];
      // Prefer the store entry that has custom metadata/image or is Mega Stores' canonical ID
      const existingMeta = parseStoreMetadata(existing);
      const currentMeta = parseStoreMetadata(st);
      if (!existingMeta.image && currentMeta.image) {
        cleaned[existingIdx] = st;
      }
      continue;
    }

    seenIds.add(st.id);
    seenNameKeys.set(normName, cleaned.length);
    cleaned.push(st);
  }
  return cleaned;
}

export async function getStores() {
  try {
    const { data, error } = await supabase
      .from('stores')
      .select('*')
      .order('created_at', { ascending: false });

    if (error) throw error;
    const cleaned = deduplicateAndCleanStores(data || []);
    if (cleaned.length > 0) {
      AsyncStorage.setItem('getit_cloud_stores_raw', JSON.stringify(cleaned)).catch(() => {});
    }
    return cleaned;
  } catch (err) {
    logNetworkNotice('getStores', err);
    try {
      const cached = await AsyncStorage.getItem('getit_cloud_stores_raw');
      if (cached) return deduplicateAndCleanStores(JSON.parse(cached));
    } catch (e) {}
    return [];
  }
}

export async function createDatabaseStore(store) {
  try {
    const cleanName = String(store?.name || '').trim();
    if (!cleanName) return null;

    // Prevent duplicate store creation in Supabase if a store with the exact same name already exists
    const { data: existingRows } = await supabase
      .from('stores')
      .select('*')
      .ilike('name', cleanName);

    if (Array.isArray(existingRows) && existingRows.length > 0) {
      const exactMatch = existingRows.find(
        (r) => String(r.name || '').trim().toLowerCase() === cleanName.toLowerCase() && !REMOVED_STORE_ID_SET.has(r.id)
      );
      if (exactMatch && exactMatch.id !== store.id) {
        return { ...exactMatch, isDuplicate: true };
      }
    }

    const resolvedDeptId = store.primaryDepartmentId || (store.category === 'pharmacy' || store.storeType === 'pharmacy' ? 'pharmacy' : 'grocery');
    const resolvedFormat = store.storeTypeFormat || store.storeFormat || (store.category === 'pharmacy' || store.storeType === 'pharmacy' ? 'pharmacy' : 'supermarket');
    const resolvedCoverImage = store.image || getDefaultStoreCoverImage(resolvedDeptId, resolvedFormat, cleanName);

    const metadataPayload = {
      cityName: typeof store.city === 'string' && !store.city.startsWith('{') ? store.city : 'Abuja',
      storeType: store.storeType || (store.category === 'pharmacy' ? 'pharmacy' : 'grocery'),
      storeTypeFormat: resolvedFormat,
      storeTypeLabel: store.storeTypeLabel || store.categoryLabel || 'Partner Store',
      primaryDepartmentId: resolvedDeptId,
      additionalDepartmentIds: Array.isArray(store.additionalDepartmentIds) ? store.additionalDepartmentIds : [],
      specialisationSubcategories: Array.isArray(store.specialisationSubcategories) ? store.specialisationSubcategories : [],
      specialisationProducts: Array.isArray(store.specialisationProducts) ? store.specialisationProducts : [],
      regulatoryStatus: store.regulatoryStatus || (store.storeType === 'pharmacy' ? 'verified' : 'not_applicable'),
      pcnLicenseNo: store.pcnLicenseNo || store.pharmacist?.licenseNo || null,
      premisesLicenseNo: store.premisesLicenseNo || null,
      dispensingScope: Array.isArray(store.dispensingScope) ? store.dispensingScope : [],
      pharmacist: store.pharmacist || null,
      openTime: store.openTime || '08:00 AM',
      closeTime: store.closeTime || '10:00 PM',
      operatingDays: store.operatingDays || 'Mon - Sun (Daily)',
      is24Hours: Boolean(store.is24Hours),
      image: resolvedCoverImage,
      allowCustomerMessaging: store.allowCustomerMessaging !== undefined ? Boolean(store.allowCustomerMessaging) : true,
    };

    const record = {
      id: store.id || `store-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      name: cleanName,
      category: store.category || (store.storeType === 'pharmacy' ? 'pharmacy' : 'Gourmet & Groceries'),
      address: store.address || 'Abuja, Nigeria',
      district: store.district || 'Maitama, Abuja',
      city: JSON.stringify(metadataPayload),
      latitude: Number(store.latitude) || 9.0882,
      longitude: Number(store.longitude) || 7.4933,
      phone: store.phone || '+234 800 000 0000',
      rating: Number(store.rating) || 5.0,
      is_open: store.isOpen !== undefined ? store.isOpen : true,
      delivery_fee: Number(store.deliveryFee) || 1200,
    };

    const { data, error } = await supabase
      .from('stores')
      .upsert(record, { onConflict: 'id' })
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
let isBroadcastChannelSubscribed = false;
let broadcastReconnectTimer = null;
const liveBroadcastListeners = new Set();
const pendingBroadcastMessages = [];

export function ensureLiveBroadcastConnected() {
  try {
    if (!liveBroadcastChannel || !isBroadcastChannelSubscribed) {
      getLiveBroadcastChannel();
    }
  } catch (e) {}
}

function scheduleBroadcastChannelReconnect() {
  if (broadcastReconnectTimer) return;
  broadcastReconnectTimer = setTimeout(() => {
    broadcastReconnectTimer = null;
    reconnectBroadcastChannel();
  }, 1200);
}

function reconnectBroadcastChannel() {
  try {
    if (liveBroadcastChannel) {
      try {
        supabase.removeChannel(liveBroadcastChannel);
      } catch (e) {}
      liveBroadcastChannel = null;
    }
    isBroadcastChannelSubscribed = false;
    getLiveBroadcastChannel();
  } catch (e) {}
}

function getLiveBroadcastChannel() {
  if (!liveBroadcastChannel) {
    liveBroadcastChannel = supabase.channel('getit_live_sync_channel', {
      config: { broadcast: { ack: false, self: true } },
    });

    // Centralized listener: guarantees all app subscribers receive incoming broadcasts
    // even across WebSocket reconnection cycles
    liveBroadcastChannel.on('broadcast', { event: 'GETIT_SYNC_UPDATE' }, ({ payload }) => {
      liveBroadcastListeners.forEach((listener) => {
        try {
          listener(payload);
        } catch (lErr) {
          console.warn('Live broadcast listener error:', lErr);
        }
      });
    });

    liveBroadcastChannel.subscribe((status) => {
      if (status === 'SUBSCRIBED') {
        isBroadcastChannelSubscribed = true;
        while (pendingBroadcastMessages.length > 0) {
          const queued = pendingBroadcastMessages.shift();
          try {
            liveBroadcastChannel.send(queued).catch(() => {});
          } catch (e) {}
        }
      } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR' || status === 'TIMED_OUT') {
        isBroadcastChannelSubscribed = false;
        scheduleBroadcastChannelReconnect();
      }
    });
  }
  return liveBroadcastChannel;
}

export function broadcastLiveEvent(eventType, payload) {
  try {
    const ch = getLiveBroadcastChannel();
    const eventPayload = { eventType, ...payload, _timestamp: Date.now() };
    const message = {
      type: 'broadcast',
      event: 'GETIT_SYNC_UPDATE',
      payload: eventPayload,
    };

    if (isBroadcastChannelSubscribed) {
      ch.send(message).catch(() => {
        // Fallback to Realtime REST API if socket delivery experiences push rejection
        try {
          if (typeof ch.httpSend === 'function') {
            ch.httpSend('GETIT_SYNC_UPDATE', eventPayload).catch(() => {});
          }
        } catch (hErr) {}
      });
    } else {
      // WebSocket is connecting / recovering: immediately broadcast via REST API
      // so the message is received INSTANTLY without waiting for socket handshake!
      try {
        if (typeof ch.httpSend === 'function') {
          ch.httpSend('GETIT_SYNC_UPDATE', eventPayload).catch(() => {});
        } else {
          pendingBroadcastMessages.push(message);
          if (pendingBroadcastMessages.length > 50) pendingBroadcastMessages.shift();
        }
      } catch (hErr) {
        pendingBroadcastMessages.push(message);
      }
    }
  } catch (err) {
    // Gracefully catch offline errors
  }
}

export function subscribeToLiveBroadcast(callback) {
  if (callback) {
    liveBroadcastListeners.add(callback);
  }
  getLiveBroadcastChannel();

  return () => {
    if (callback) {
      liveBroadcastListeners.delete(callback);
    }
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
  const isPharm =
    meta.storeType === 'pharmacy' ||
    dbStore.store_type === 'pharmacy' ||
    dbStore.storeType === 'pharmacy' ||
    (dbStore.category && typeof dbStore.category === 'string' && dbStore.category.toLowerCase().includes('pharm'));

  const allowCustomerMessagingVal =
    isPharm
      ? true
      : (meta.allowCustomerMessaging !== undefined
          ? Boolean(meta.allowCustomerMessaging)
          : (dbStore.allow_customer_messaging !== undefined
              ? Boolean(dbStore.allow_customer_messaging)
              : (dbStore.allowCustomerMessaging !== undefined ? Boolean(dbStore.allowCustomerMessaging) : true)));

  return {
    isOpen: isOpenVal,
    allowCustomerMessaging: allowCustomerMessagingVal,
    openTime: meta.openTime || dbStore.open_time || '08:00 AM',
    closeTime: meta.closeTime || dbStore.close_time || '10:00 PM',
    operatingDays: meta.operatingDays || dbStore.operating_days || 'Mon - Sun (Daily)',
    is24Hours: meta.is24Hours !== undefined ? Boolean(meta.is24Hours) : Boolean(dbStore.is_24_hours),
    image: meta.image || dbStore.image_url || dbStore.image,
    storeType: isPharm ? 'pharmacy' : (meta.storeType || dbStore.store_type || 'grocery'),
    storeTypeFormat: meta.storeTypeFormat || (isPharm ? 'pharmacy' : undefined),
    storeTypeLabel: meta.storeTypeLabel || undefined,
    primaryDepartmentId: meta.primaryDepartmentId || (isPharm ? 'pharmacy' : undefined),
    additionalDepartmentIds: Array.isArray(meta.additionalDepartmentIds) ? meta.additionalDepartmentIds : [],
    specialisationSubcategories: Array.isArray(meta.specialisationSubcategories) ? meta.specialisationSubcategories : [],
    specialisationProducts: Array.isArray(meta.specialisationProducts) ? meta.specialisationProducts : [],
    regulatoryStatus: meta.regulatoryStatus || (isPharm ? 'verified' : 'not_applicable'),
    pcnLicenseNo: meta.pcnLicenseNo || meta.pharmacist?.licenseNo || null,
    premisesLicenseNo: meta.premisesLicenseNo || null,
    dispensingScope: Array.isArray(meta.dispensingScope) ? meta.dispensingScope : [],
    pharmacist: meta.pharmacist || (isPharm ? {
      name: 'On-Duty Clinical Pharmacist',
      qualification: 'B.Pharm, MPSN',
      licenseNo: 'PCN Verified',
      status: 'On-Duty • Available for Consult',
    } : null),
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

    // Pack timing, 24h flag, custom image, live isOpen flag, taxonomy specialisations, and allowCustomerMessaging into city column so all devices sync instantly
    if (
      updates.isOpen !== undefined ||
      updates.is_open !== undefined ||
      updates.openTime !== undefined ||
      updates.closeTime !== undefined ||
      updates.operatingDays !== undefined ||
      updates.is24Hours !== undefined ||
      updates.image !== undefined ||
      updates.allowCustomerMessaging !== undefined ||
      updates.primaryDepartmentId !== undefined ||
      updates.storeTypeFormat !== undefined ||
      updates.storeTypeLabel !== undefined ||
      updates.additionalDepartmentIds !== undefined ||
      updates.specialisationSubcategories !== undefined ||
      updates.specialisationProducts !== undefined ||
      updates.regulatoryStatus !== undefined ||
      updates.pharmacist !== undefined
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
      if (updates.allowCustomerMessaging !== undefined) meta.allowCustomerMessaging = Boolean(updates.allowCustomerMessaging);
      if (updates.primaryDepartmentId !== undefined) meta.primaryDepartmentId = updates.primaryDepartmentId;
      if (updates.storeTypeFormat !== undefined) meta.storeTypeFormat = updates.storeTypeFormat;
      if (updates.storeTypeLabel !== undefined) meta.storeTypeLabel = updates.storeTypeLabel;
      if (updates.additionalDepartmentIds !== undefined) meta.additionalDepartmentIds = updates.additionalDepartmentIds;
      if (updates.specialisationSubcategories !== undefined) meta.specialisationSubcategories = updates.specialisationSubcategories;
      if (updates.specialisationProducts !== undefined) meta.specialisationProducts = updates.specialisationProducts;
      if (updates.regulatoryStatus !== undefined) meta.regulatoryStatus = updates.regulatoryStatus;
      if (updates.pharmacist !== undefined) meta.pharmacist = updates.pharmacist;
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

// =========================================================================
// 8. ORDER LIVE CHAT & DIRECT MESSAGING (BUYER, MERCHANT & COURIER)
// Sub-50ms peer delivery via WebSocket + Supabase bolt_rider.messages sync
// =========================================================================

export async function sendOrderChatMessage(orderId, message, orderData = null) {
  try {
    // 1. Broadcast IMMEDIATELY over WebSocket / Realtime REST (sub-50ms transmission with zero disk-wait)
    const cleanOrderData = orderData
      ? {
          id: orderData.id,
          storeId: orderData.storeId,
          storeName: orderData.storeName,
          customerId: orderData.customerId,
          customerName: orderData.customerName,
          customerPhone: orderData.customerPhone,
          status: orderData.status,
          total: orderData.total,
          createdAt: orderData.createdAt,
        }
      : null;

    broadcastLiveEvent('CHAT_MESSAGE', {
      orderId,
      message,
      order: cleanOrderData,
    });

    // 2. Perform async local caching & cloud persistence concurrently in the background
    (async () => {
      let existingMessages = [];
      try {
        const cached = await AsyncStorage.getItem(`getit_chat_messages_${orderId}`);
        if (cached) {
          existingMessages = JSON.parse(cached);
        }
      } catch (e) {}

      let newMessages = existingMessages.map((m) => {
        if (m.prescription && message.prescriptionBillPaid && message.paidBillId) {
          if (m.prescription.billId === message.paidBillId) {
            return {
              ...m,
              prescription: {
                ...m.prescription,
                paid: true,
                paidAt: message.createdAt || new Date().toISOString(),
              },
            };
          }
        }
        return m;
      });

      if (!newMessages.some((m) => m.id === message.id)) {
        newMessages.push(message);
      }

      try {
        await AsyncStorage.setItem(`getit_chat_messages_${orderId}`, JSON.stringify(newMessages));
      } catch (e) {}

      // Persist to Supabase orders.bolt_rider.messages
      updateDatabaseOrderStatus(orderId, { messages: newMessages }).catch((err) => {
        logNetworkNotice('sendOrderChatMessage persist', err);
      });
    })();

    return [message];
  } catch (err) {
    logNetworkNotice('sendOrderChatMessage', err);
    return null;
  }
}

export async function getOrderChatMessages(orderId) {
  let localMsgs = [];
  try {
    const cached = await AsyncStorage.getItem(`getit_chat_messages_${orderId}`);
    if (cached) {
      localMsgs = JSON.parse(cached);
    }
  } catch (e) {}

  try {
    // 1. Check cloud order first for latest peer messages with 4s timeout guard
    const timeoutPromise = new Promise((_, reject) => setTimeout(() => reject(new Error('timeout')), 4000));
    const fetchPromise = supabase
      .from('orders')
      .select('bolt_rider')
      .eq('id', orderId)
      .maybeSingle();

    const { data } = await Promise.race([fetchPromise, timeoutPromise]);

    if (data?.bolt_rider?.messages && Array.isArray(data.bolt_rider.messages)) {
      const cloudMsgs = data.bolt_rider.messages;
      const msgMap = new Map();
      localMsgs.forEach((m) => m?.id && msgMap.set(m.id, m));
      cloudMsgs.forEach((m) => m?.id && msgMap.set(m.id, m));
      const merged = Array.from(msgMap.values()).sort(
        (a, b) => new Date(a.createdAt || 0) - new Date(b.createdAt || 0)
      );
      AsyncStorage.setItem(`getit_chat_messages_${orderId}`, JSON.stringify(merged)).catch(() => {});
      return merged;
    }
  } catch (e) {}

  // 2. Fall back to local AsyncStorage cache if offline / timeout
  return localMsgs;
}

// =========================================================================
// 9. DYNAMIC MARKETPLACE TAXONOMY & CENTRAL CATEGORY MANAGEMENT (ADMIN SYNC)
// =========================================================================

const CLOUD_TAXONOMY_RECORD_ID = 'cfg-marketplace-taxonomy-v3';
const CLOUD_CATEGORY_REQUESTS_RECORD_ID = 'cfg-category-requests-v1';

export async function getMarketplaceTaxonomy() {
  let cachedTaxonomy = null;
  try {
    const raw = await AsyncStorage.getItem(TAXONOMY_STORAGE_KEY);
    if (raw) {
      cachedTaxonomy = normalizeTaxonomyCatalog(JSON.parse(raw));
    }
  } catch (e) {}

  try {
    const { data, error } = await supabase
      .from('riders')
      .select('avatar')
      .eq('id', CLOUD_TAXONOMY_RECORD_ID)
      .maybeSingle();

    if (!error && data?.avatar) {
      const parsed = normalizeTaxonomyCatalog(JSON.parse(data.avatar));
      if (parsed && Array.isArray(parsed.departments) && parsed.departments.length > 0) {
        await AsyncStorage.setItem(TAXONOMY_STORAGE_KEY, JSON.stringify(parsed)).catch(() => {});
        return parsed;
      }
    }
  } catch (err) {
    logNetworkNotice('getMarketplaceTaxonomy', err);
  }

  return cachedTaxonomy && Array.isArray(cachedTaxonomy.departments)
    ? cachedTaxonomy
    : DEFAULT_MARKETPLACE_TAXONOMY;
}

export async function saveMarketplaceTaxonomy(newTaxonomy) {
  const payload = normalizeTaxonomyCatalog({
    ...DEFAULT_MARKETPLACE_TAXONOMY,
    ...(newTaxonomy || {}),
    updatedAt: new Date().toISOString(),
  });

  try {
    await AsyncStorage.setItem(TAXONOMY_STORAGE_KEY, JSON.stringify(payload));
  } catch (e) {}

  // Broadcast immediately so all connected buyer & merchant devices update in <50ms
  try {
    broadcastLiveEvent('TAXONOMY_UPDATE', { taxonomy: payload });
  } catch (e) {}

  try {
    await supabase.from('riders').upsert(
      {
        id: CLOUD_TAXONOMY_RECORD_ID,
        name: 'MARKETPLACE_TAXONOMY_V3',
        phone: 'ADMIN_CONFIG',
        vehicle: 'taxonomy',
        plate: payload.version || '3.0.0',
        avatar: JSON.stringify(payload),
        is_active: true,
      },
      { onConflict: 'id' }
    );
  } catch (err) {
    logNetworkNotice('saveMarketplaceTaxonomy', err);
  }

  return payload;
}

export async function getMerchantCategoryRequests() {
  let localReqs = [];
  try {
    const raw = await AsyncStorage.getItem(CATEGORY_REQUESTS_STORAGE_KEY);
    if (raw) localReqs = JSON.parse(raw);
  } catch (e) {}

  try {
    const { data, error } = await supabase
      .from('riders')
      .select('avatar')
      .eq('id', CLOUD_CATEGORY_REQUESTS_RECORD_ID)
      .maybeSingle();

    if (!error && data?.avatar) {
      const parsed = JSON.parse(data.avatar);
      if (Array.isArray(parsed)) {
        await AsyncStorage.setItem(CATEGORY_REQUESTS_STORAGE_KEY, JSON.stringify(parsed)).catch(() => {});
        return parsed;
      }
    }
  } catch (err) {}

  return Array.isArray(localReqs) ? localReqs : [];
}

export async function submitMerchantCategoryRequest(requestObj) {
  const currentList = await getMerchantCategoryRequests();
  const newEntry = {
    id: requestObj.id || `catreq-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
    storeId: requestObj.storeId || null,
    storeName: requestObj.storeName || 'Merchant Store',
    merchantName: requestObj.merchantName || 'Store Owner',
    merchantPhone: requestObj.merchantPhone || '',
    level: requestObj.level || 'subcategory', // 'department' | 'subcategory' | 'variety'
    parentDepartmentId: requestObj.parentDepartmentId || 'grocery',
    parentSubcategoryId: requestObj.parentSubcategoryId || null,
    requestedName: requestObj.requestedName || '',
    notes: requestObj.notes || '',
    status: 'pending', // 'pending' | 'approved' | 'rejected'
    createdAt: new Date().toISOString(),
  };

  const nextList = [newEntry, ...currentList];
  try {
    await AsyncStorage.setItem(CATEGORY_REQUESTS_STORAGE_KEY, JSON.stringify(nextList));
  } catch (e) {}

  try {
    broadcastLiveEvent('CATEGORY_REQUEST_UPDATE', { requests: nextList, latestRequest: newEntry });
  } catch (e) {}

  try {
    await supabase.from('riders').upsert(
      {
        id: CLOUD_CATEGORY_REQUESTS_RECORD_ID,
        name: 'MERCHANT_CATEGORY_REQUESTS',
        phone: 'ADMIN_CONFIG',
        vehicle: 'category_requests',
        plate: String(nextList.length),
        avatar: JSON.stringify(nextList),
        is_active: true,
      },
      { onConflict: 'id' }
    );
  } catch (err) {}

  return { request: newEntry, list: nextList };
}

export async function saveMerchantCategoryRequests(nextList) {
  try {
    await AsyncStorage.setItem(CATEGORY_REQUESTS_STORAGE_KEY, JSON.stringify(nextList));
  } catch (e) {}

  try {
    broadcastLiveEvent('CATEGORY_REQUEST_UPDATE', { requests: nextList });
  } catch (e) {}

  try {
    await supabase.from('riders').upsert(
      {
        id: CLOUD_CATEGORY_REQUESTS_RECORD_ID,
        name: 'MERCHANT_CATEGORY_REQUESTS',
        phone: 'ADMIN_CONFIG',
        vehicle: 'category_requests',
        plate: String(nextList.length),
        avatar: JSON.stringify(nextList),
        is_active: true,
      },
      { onConflict: 'id' }
    );
  } catch (err) {}

  return nextList;
}

// 21. Realtime Commercial Policy Synchronization (Tiered Markups, Concierge & Bolt Logistics)
export async function fetchActiveCommercialPolicy() {
  try {
    const { data, error } = await supabase
      .from('audit_logs')
      .select('*')
      .eq('action', 'COMMERCIAL_POLICY_UPDATE')
      .order('created_at', { ascending: false })
      .limit(1)
      .maybeSingle();

    if (!error && data && data.payload) {
      const parsed = typeof data.payload === 'string' ? JSON.parse(data.payload) : data.payload;
      try {
        await AsyncStorage.setItem('getit_cms_business_rules_v1', JSON.stringify(parsed));
      } catch (e) {}
      return parsed;
    }
  } catch (err) {
    logNetworkNotice('fetchActiveCommercialPolicy', err);
  }

  try {
    const local = await AsyncStorage.getItem('getit_cms_business_rules_v1');
    if (local) return JSON.parse(local);
  } catch (e) {}

  return null;
}

export const COMMERCIAL_POLICY_CHANNEL_NAME = 'getit_commercial_policy_live_channel';

// Persistent shared broadcast channel for lightning-fast sub-50ms mobile sync
let sharedPolicyMobileBroadcastChannel = null;
function getSharedPolicyMobileChannel() {
  if (!sharedPolicyMobileBroadcastChannel) {
    sharedPolicyMobileBroadcastChannel = supabase.channel(COMMERCIAL_POLICY_CHANNEL_NAME, {
      config: { broadcast: { ack: true } },
    });
    sharedPolicyMobileBroadcastChannel.subscribe();
  }
  return sharedPolicyMobileBroadcastChannel;
}

export async function publishCommercialPolicy(policyData) {
  try {
    const policyPayload = {
      version: policyData.version || `v4.${Date.now().toString().slice(-4)}`,
      publishedBy: policyData.publishedBy || 'CEO / General Management',
      publishedAt: new Date().toISOString(),
      markupBelowThresholdPct: Number(policyData.markupBelowThresholdPct ?? 10.0),
      markupAboveThresholdPct: Number(policyData.markupAboveThresholdPct ?? 7.0),
      tierThresholdNaira: Number(policyData.tierThresholdNaira ?? 50000),
      markupTiers: Array.isArray(policyData.markupTiers) ? policyData.markupTiers : undefined,
      conciergePackagingPct: Number(policyData.conciergePackagingPct ?? 5.0),
      conciergeTiers: Array.isArray(policyData.conciergeTiers) ? policyData.conciergeTiers : undefined,
      boltDeliveryMarkupPct: Number(policyData.boltDeliveryMarkupPct ?? 20.0),
      standardMerchantCommissionPct: Number(policyData.standardMerchantCommissionPct ?? 7.0),
      status: 'LIVE_ENFORCED',
    };

    // 1. Instantly broadcast across Supabase Realtime WebSocket to all mobile apps and dashboards
    try {
      const channel = getSharedPolicyMobileChannel();
      channel.send({
        type: 'broadcast',
        event: 'COMMERCIAL_POLICY_UPDATE',
        payload: policyPayload,
      });
    } catch (bcErr) {
      logNetworkNotice('publishCommercialPolicy broadcast', bcErr);
    }

    // 2. Solidify into Supabase audit_logs as immutable ledger record
    const record = {
      id: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action: 'COMMERCIAL_POLICY_UPDATE',
      user_identifier: 'CEO_MOBILE_DASHBOARD',
      payload: JSON.stringify(policyPayload),
    };

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(record)
      .select()
      .single();

    if (error) {
      logNetworkNotice('publishCommercialPolicy', error);
    }

    // 3. Persist locally for immediate offline/hybrid availability
    try {
      await AsyncStorage.setItem('getit_cms_business_rules_v1', JSON.stringify(policyPayload));
    } catch (e) {}

    return policyPayload;
  } catch (err) {
    logNetworkNotice('publishCommercialPolicy (critical)', err);
    return null;
  }
}

export function subscribeToCommercialPolicyUpdates(callback) {
  try {
    const channelName = `${COMMERCIAL_POLICY_CHANNEL_NAME}_mob_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
    const channel = supabase
      .channel(channelName)
      .on(
        'broadcast',
        { event: 'COMMERCIAL_POLICY_UPDATE' },
        (msg) => {
          if (msg?.payload && callback) {
            callback(msg.payload);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'audit_logs' },
        (payload) => {
          if (payload?.new?.action === 'COMMERCIAL_POLICY_UPDATE') {
            try {
              const parsed = typeof payload.new.payload === 'string'
                ? JSON.parse(payload.new.payload)
                : payload.new.payload;
              if (callback) callback(parsed);
            } catch (e) {
              console.warn('Realtime policy parse notice:', e);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    logNetworkNotice('subscribeToCommercialPolicyUpdates', err);
    return () => {};
  }
}





