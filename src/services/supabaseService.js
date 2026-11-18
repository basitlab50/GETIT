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
    if (updates.latitude !== undefined) dbUpdates.latitude = Number(updates.latitude);
    if (updates.longitude !== undefined) dbUpdates.longitude = Number(updates.longitude);

    const { data, error } = await supabase
      .from('stores')
      .update(dbUpdates)
      .eq('id', storeId)
      .select()
      .maybeSingle();

    if (error) throw error;

    // If store row didn't exist in Supabase yet, upsert it gracefully so it exists
    if (!data && Object.keys(dbUpdates).length > 0) {
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
        return null;
      }
      return upsertData;
    }

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

// 5. Cloud Audit Logging
export async function logDatabaseEvent(action, payload = {}, userIdentifier = 'SYSTEM') {
  const logId = `log-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`;
  const timestamp = new Date().toISOString();
  const serialized = typeof payload === 'string' ? payload : JSON.stringify({
    action,
    ...payload,
    timestamp
  });

  // 1. Try to insert into dedicated audit_logs table
  try {
    await supabase.from('audit_logs').insert({
      id: logId,
      action: action,
      user_identifier: String(userIdentifier || 'SYSTEM'),
      payload: serialized,
      created_at: timestamp
    });
  } catch (e) {}

  // 2. Always persist to Supabase riders table with 'log-%' prefix
  try {
    await supabase.from('riders').insert({
      id: logId,
      name: action,
      phone: String(userIdentifier || 'SYSTEM'),
      vehicle: payload.role || 'system',
      plate: payload.platform || 'GETIT Web',
      avatar: serialized,
      is_active: true
    });
  } catch (err) {
    console.warn('Database event logging error:', err);
  }

  return logId;
}

export async function getDatabaseLogs(limit = 100) {
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
  } catch (e) {}
  return [];
}

// 7. Executive Commercial Policy & Revenue Synchronization
export const COMMERCIAL_POLICY_CHANNEL_NAME = 'getit_commercial_policy_live_channel';

// Dedicated broadcast sender for instant sync
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
      const bcChannel = supabase.channel(`policy_bc_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`);
      bcChannel.subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          bcChannel.send({
            type: 'broadcast',
            event: 'COMMERCIAL_POLICY_UPDATE',
            payload: policyPayload,
          });
          setTimeout(() => supabase.removeChannel(bcChannel), 2000);
        }
      });
    } catch (bcErr) {
      console.warn('Realtime broadcast dispatch notice:', bcErr);
    }

    // 2. Solidify into Supabase audit_logs as immutable ledger record
    const record = {
      id: `policy-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      action: 'COMMERCIAL_POLICY_UPDATE',
      user_identifier: 'CEO_DASHBOARD',
      payload: JSON.stringify(policyPayload),
    };

    const { data, error } = await supabase
      .from('audit_logs')
      .insert(record)
      .select()
      .single();

    if (error) {
      console.warn('Supabase commercial policy insert warning:', error.message);
    }

    // 3. Persist locally for immediate offline/hybrid availability
    try {
      localStorage.setItem('getit_cms_business_rules_v1', JSON.stringify(policyPayload));
      localStorage.setItem('getit_commercial_policy_live', JSON.stringify(policyPayload));
    } catch (e) {}

    // 4. Dispatch global event for instant in-tab update
    if (typeof window !== 'undefined') {
      window.dispatchEvent(new CustomEvent('getit_policy_updated', { detail: policyPayload }));
    }

    return policyPayload;
  } catch (err) {
    console.error('Failed to publish commercial policy to Supabase:', err);
    return null;
  }
}

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
      return parsed;
    }
  } catch (err) {
    console.warn('Could not fetch commercial policy from Supabase, checking fallback:', err);
  }

  // Fallback to local storage if offline
  try {
    const local = localStorage.getItem('getit_commercial_policy_live') || localStorage.getItem('getit_cms_business_rules_v1');
    if (local) return JSON.parse(local);
  } catch (e) {}

  return null;
}

export function subscribeToCommercialPolicyUpdates(callback) {
  try {
    const channelName = `${COMMERCIAL_POLICY_CHANNEL_NAME}_${Date.now()}_${Math.random().toString(36).slice(2, 6)}`;
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
              console.warn('Error parsing policy realtime payload:', e);
            }
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Realtime policy subscription unavailable:', err);
    return () => {};
  }
}

/**
 * Universal Real-Time Orders Subscription for Instant Dashboard Sync
 * Listens to WebSocket broadcasts and Postgres Changes for sub-50ms sync
 */
export function subscribeToLiveOrderEvents(callback) {
  try {
    const channel = supabase
      .channel('getit_live_sync_channel', {
        config: { broadcast: { ack: false, self: true } },
      })
      .on(
        'broadcast',
        { event: 'GETIT_SYNC_UPDATE' },
        (msg) => {
          if (callback && msg?.payload) {
            callback(msg.payload);
          }
        }
      )
      .on(
        'postgres_changes',
        { event: '*', schema: 'public', table: 'orders' },
        (payload) => {
          if (callback && payload) {
            callback({ eventType: 'POSTGRES_CHANGE', payload });
          }
        }
      )
      .subscribe();

    return () => {
      supabase.removeChannel(channel);
    };
  } catch (err) {
    console.warn('Live order event subscription notice:', err);
    return () => {};
  }
}



