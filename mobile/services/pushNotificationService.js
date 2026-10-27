import AsyncStorage from '@react-native-async-storage/async-storage';
import { supabase } from '../lib/supabase';
import { triggerNotification, playAudioBeep } from './notificationService';

// Memory cache of registered device tokens
const REGISTERED_DEVICE_TOKENS = new Map();
const STORAGE_KEY_TOKENS = 'getit_device_push_tokens_registry';

/**
 * Register or update device push token for a user and role
 */
export async function registerDevicePushToken({ userId, role, storeId, pushToken }) {
  if (!pushToken || typeof pushToken !== 'string') return;
  const key = `${userId || 'guest'}_${role || 'customer'}_${storeId || 'none'}`;

  const tokenRecord = {
    id: key,
    userId: userId || 'anonymous',
    role: role || 'customer',
    storeId: storeId || null,
    pushToken,
    updatedAt: Date.now(),
  };

  REGISTERED_DEVICE_TOKENS.set(key, tokenRecord);

  // 1. Cache locally
  try {
    const stored = await AsyncStorage.getItem(STORAGE_KEY_TOKENS);
    const existing = stored ? JSON.parse(stored) : {};
    existing[key] = tokenRecord;
    await AsyncStorage.setItem(STORAGE_KEY_TOKENS, JSON.stringify(existing));
  } catch (e) {}

  // 2. Persist to Supabase getit_push_tokens table (with graceful fallback)
  try {
    await supabase
      .from('getit_push_tokens')
      .upsert(
        {
          id: key,
          user_id: tokenRecord.userId,
          role: tokenRecord.role,
          store_id: tokenRecord.storeId,
          push_token: tokenRecord.pushToken,
          updated_at: new Date().toISOString(),
        },
        { onConflict: 'id' }
      );
  } catch (err) {
    // Graceful notice if table not yet migrated
  }
}

/**
 * Fetch push tokens for target merchant / store owners
 */
export async function getStorePushTokens(storeId) {
  const tokens = new Set();

  // Try Supabase first
  try {
    const { data } = await supabase
      .from('getit_push_tokens')
      .select('push_token')
      .or(`store_id.eq.${storeId},role.eq.merchant`);

    if (data && data.length > 0) {
      data.forEach((r) => {
        if (r.push_token) tokens.add(r.push_token);
      });
    }
  } catch (e) {}

  // Memory & Local fallback
  REGISTERED_DEVICE_TOKENS.forEach((rec) => {
    if (rec.role === 'merchant' || (storeId && rec.storeId === storeId)) {
      if (rec.pushToken) tokens.add(rec.pushToken);
    }
  });

  return Array.from(tokens);
}

/**
 * Fetch push tokens for a target customer
 */
export async function getCustomerPushTokens(customerId) {
  const tokens = new Set();

  if (!customerId) return [];

  // Try Supabase
  try {
    const { data } = await supabase
      .from('getit_push_tokens')
      .select('push_token')
      .eq('user_id', customerId);

    if (data && data.length > 0) {
      data.forEach((r) => {
        if (r.push_token) tokens.add(r.push_token);
      });
    }
  } catch (e) {}

  // Local fallback
  REGISTERED_DEVICE_TOKENS.forEach((rec) => {
    if (rec.userId === customerId && rec.pushToken) {
      tokens.add(rec.pushToken);
    }
  });

  return Array.from(tokens);
}

/**
 * Send Remote Push Notification via Expo's Push Server
 * Reaches locked iPhones & Androids over APNs and FCM
 */
export async function sendExpoPushNotification({
  to,
  title,
  body,
  data = {},
  sound = 'default',
  channelId = 'order_updates',
  priority = 'high',
}) {
  if (!to) return null;
  const tokens = Array.isArray(to) ? to : [to];
  const validTokens = tokens.filter(
    (t) => typeof t === 'string' && t.startsWith('ExponentPushToken')
  );

  if (validTokens.length === 0) return null;

  const messages = validTokens.map((token) => ({
    to: token,
    sound,
    title,
    body,
    data: { ...data, timestamp: Date.now() },
    channelId,
    priority,
    _displayInForeground: true,
  }));

  try {
    const response = await fetch('https://exp.host/--/api/v2/push/send', {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Accept-encoding': 'gzip, deflate',
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(messages),
    });

    const result = await response.json();
    return result;
  } catch (err) {
    console.warn('Expo Push dispatch error:', err?.message);
    return null;
  }
}

/**
 * Broadcast remote push alert to store merchant when an order is created
 */
export async function dispatchMerchantNewOrderRemotePush(order) {
  if (!order) return;
  const storeId = order.storeId || order.store_id;
  const tokens = await getStorePushTokens(storeId);

  const title = '🔔 NEW ORDER RECEIVED!';
  const body = `Order #${order.id} for ${order.storeName || 'Store'} (₦${Number(
    order.total || 0
  ).toLocaleString()}). Tap to begin prepping!`;

  if (tokens.length > 0) {
    await sendExpoPushNotification({
      to: tokens,
      title,
      body,
      data: {
        orderId: order.id,
        type: 'merchant_new_order',
        storeId,
      },
      channelId: 'merchant_orders',
      sound: 'default',
      priority: 'high',
    });
  }
}

/**
 * Broadcast remote push alert to customer when order status changes
 */
export async function dispatchCustomerStatusRemotePush({
  customerId,
  orderId,
  title,
  body,
  status,
}) {
  if (!customerId) return;
  const tokens = await getCustomerPushTokens(customerId);

  if (tokens.length > 0) {
    await sendExpoPushNotification({
      to: tokens,
      title,
      body,
      data: {
        orderId,
        status,
        type: 'order_status',
      },
      channelId: 'order_updates',
      sound: 'default',
      priority: 'high',
    });
  }
}

/**
 * Broadcast remote push alert when a chat message is sent
 */
export async function dispatchChatRemotePush({
  recipientRole,
  recipientId,
  senderName,
  text,
  orderId,
}) {
  let tokens = [];

  if (recipientRole === 'merchant') {
    tokens = await getStorePushTokens(recipientId);
  } else {
    tokens = await getCustomerPushTokens(recipientId);
  }

  if (tokens.length > 0) {
    await sendExpoPushNotification({
      to: tokens,
      title: `💬 New Message from ${senderName || 'Store'}`,
      body: `"${text}"`,
      data: {
        orderId,
        type: 'chat',
        senderRole: recipientRole === 'merchant' ? 'buyer' : 'merchant',
      },
      channelId: 'chat_messages',
      sound: 'default',
      priority: 'high',
    });
  }
}
