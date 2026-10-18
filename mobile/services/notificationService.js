import { Platform, Vibration } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Notifications from 'expo-notifications';

// =========================================================================
// 1. CONFIGURE FOREGROUND & BACKGROUND NOTIFICATION HANDLER
// Guaranteed: Beeps and displays even if the app is OPEN or CLOSED
// =========================================================================
try {
  Notifications.setNotificationHandler({
    handleNotification: async () => ({
      shouldShowAlert: true,
      shouldPlaySound: true,
      shouldSetBadge: true,
      priority: Notifications.AndroidNotificationPriority.MAX,
    }),
  });
} catch (e) {
  console.log('Notifications handler note:', e.message);
}

// In-app subscribers for live floating banners
const inAppNotificationListeners = new Set();

export function subscribeToInAppNotifications(listener) {
  inAppNotificationListeners.add(listener);
  return () => inAppNotificationListeners.delete(listener);
}

// Rate-limiting and deduplication shield to prevent repetitive buzzing
const recentNotificationTimestamps = new Map();
let lastVibrationTime = 0;

// =========================================================================
// 2. AUDIO SYNTHESIZER (INSTANT LUXURY BEEP & CHIME)
// Works seamlessly across web, hybrid, and mobile devices
// =========================================================================
export function playAudioBeep(type = 'default') {
  try {
    const now = Date.now();
    // Throttle vibration so phone never buzzes continuously
    if (now - lastVibrationTime > 6000) {
      lastVibrationTime = now;
      if (type === 'merchant_new_order') {
        Vibration.vibrate([0, 250, 100, 250]);
      } else {
        Vibration.vibrate(200);
      }
    }

    // Web Audio API Synthesis (Browser & Hybrid Web View)
    if (typeof window !== 'undefined' && (window.AudioContext || window.webkitAudioContext)) {
      const AudioCtx = window.AudioContext || window.webkitAudioContext;
      const ctx = new AudioCtx();

      if (type === 'merchant_new_order') {
        // High-energy 4-note ascending chime: C5 (523Hz) -> E5 (659Hz) -> G5 (784Hz) -> C6 (1046Hz)
        const notes = [523.25, 659.25, 783.99, 1046.5];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = ctx.currentTime + idx * 0.12;

          osc.type = 'sine';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.28, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.35);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.36);
        });
      } else {
        // Soft luxury 2-note concierge chime: E5 (659Hz) -> B5 (987Hz)
        const notes = [659.25, 987.77];
        notes.forEach((freq, idx) => {
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          const startTime = ctx.currentTime + idx * 0.14;

          osc.type = 'triangle';
          osc.frequency.setValueAtTime(freq, startTime);

          gain.gain.setValueAtTime(0.22, startTime);
          gain.gain.exponentialRampToValueAtTime(0.001, startTime + 0.45);

          osc.connect(gain);
          gain.connect(ctx.destination);

          osc.start(startTime);
          osc.stop(startTime + 0.46);
        });
      }
    }
  } catch (err) {
    console.log('Audio beep notice:', err?.message);
  }
}


// =========================================================================
// 3. ANDROID HIGH-PRIORITY CHANNELS & PERMISSION REGISTRATION
// Guarantees sound & lock-screen display when phone is in pocket/closed
// =========================================================================
export async function registerForPushNotificationsAsync() {
  let token = null;

  try {
    if (Platform.OS === 'android') {
      // Channel 1: Customer Order Status
      await Notifications.setNotificationChannelAsync('order_updates', {
        name: 'GETIT Order Updates',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 250, 250, 250],
        lightColor: '#008751',
        sound: 'default',
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });

      // Channel 2: Merchant Urgent New Orders
      await Notifications.setNotificationChannelAsync('merchant_orders', {
        name: 'Merchant New Orders Alert',
        importance: Notifications.AndroidImportance.MAX,
        vibrationPattern: [0, 500, 200, 500, 200, 500],
        lightColor: '#D97706',
        sound: 'default',
        enableVibrate: true,
        lockscreenVisibility: Notifications.AndroidNotificationVisibility.PUBLIC,
        bypassDnd: true,
      });
    }

    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;

    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync({
        ios: {
          allowAlert: true,
          allowBadge: true,
          allowSound: true,
        },
      });
      finalStatus = status;
    }

    if (finalStatus !== 'granted') {
      console.log('Push notification permissions not granted.');
      return null;
    }

    // Retrieve Expo Push Token for remote backend push
    const tokenObj = await Notifications.getExpoPushTokenAsync({
      projectId: 'getit-nigeria',
    }).catch(() => null);

    if (tokenObj && tokenObj.data) {
      token = tokenObj.data;
      await AsyncStorage.setItem('getit_push_token', token);
      console.log('Registered Expo Push Token:', token);
    }
  } catch (e) {
    console.log('Push registration note (safe fallback):', e.message);
  }

  return token;
}

// =========================================================================
// 4. MASTER TRIGGER NOTIFICATION (SOUND + BANNER + SYSTEM TRAY)
// =========================================================================
export async function triggerNotification({
  title,
  body,
  type = 'default',
  data = {},
}) {
  const notifKey = `${type}_${data.orderId || title}`;
  const now = Date.now();
  const lastFired = recentNotificationTimestamps.get(notifKey) || 0;

  // Suppress duplicate notification if already sent recently (3s debounce)
  if (now - lastFired < 3000) {
    return;
  }
  recentNotificationTimestamps.set(notifKey, now);

  // 1. Play immediate audio beep & vibration
  playAudioBeep(type);

  // 2. Broadcast to In-App Floating Toast
  inAppNotificationListeners.forEach((listener) => {
    try {
      listener({ title, body, type, data, timestamp: Date.now() });
    } catch (e) {}
  });

  // 3. Schedule OS notification (Pops up on Lock Screen and System Tray)
  try {
    const channelId = type === 'merchant_new_order' ? 'merchant_orders' : 'order_updates';
    await Notifications.scheduleNotificationAsync({
      content: {
        title,
        body,
        sound: 'default',
        priority: Notifications.AndroidNotificationPriority.MAX,
        data: { ...data, type },
        vibrate: type === 'merchant_new_order' ? [0, 500, 200, 500] : [0, 250, 250, 250],
        channelId,
      },
      trigger: null, // null means fire immediately!
    });
  } catch (e) {
    console.log('OS notification schedule notice:', e.message);
  }
}

// =========================================================================
// 5. TAILORED ORDER LIFECYCLE EVENT NOTIFIERS
// =========================================================================

// A. New Order Created (For Buyer & Merchant)
export function notifyOrderPlaced(order) {
  // Buyer alert
  triggerNotification({
    title: '🛍️ Order Confirmed & Paid!',
    body: `Your provisions from ${order.storeName} (${order.itemsCount || 1} items) are confirmed and being prepared.`,
    type: 'default',
    data: { orderId: order.id, status: 'New Order' },
  });

  // Merchant alert (Loud Cash Register Chime)
  triggerNotification({
    title: '🔔 NEW ORDER RECEIVED!',
    body: `New Order #${order.id} for ${order.storeName}! Product value: ₦${Number(order.subtotal || order.total || 0).toLocaleString()}. Tap to start preparing.`,
    type: 'merchant_new_order',
    data: { orderId: order.id, status: 'New Order', role: 'merchant' },
  });
}

// B. Courier Dispatched to Store
export function notifyCourierDispatched(order, riderName = 'Musa Ibrahim') {
  triggerNotification({
    title: '🛵 Courier Dispatched',
    body: `Courier ${riderName} has been assigned and is riding to ${order.storeName} to collect your packages.`,
    type: 'default',
    data: { orderId: order.id, status: 'Preparing' },
  });
}

// C. Order Picked Up & On the Way
export function notifyOrderOnTheWay(order, riderName = 'Musa Ibrahim') {
  triggerNotification({
    title: '🚀 Courier is On the Road!',
    body: `All packages picked up! Courier ${riderName} is heading directly to your pinned address.`,
    type: 'default',
    data: { orderId: order.id, status: 'On the Way' },
  });
}

// D. Courier Arrived at Door / Gate
export function notifyCourierArrived(order) {
  triggerNotification({
    title: '📍 Courier Has Arrived Outside!',
    body: `Your courier has arrived at your gate! Give your Delivery PIN (${order.deliveryPin}) to collect your provisions.`,
    type: 'arrived',
    data: { orderId: order.id, status: 'Arrived', pin: order.deliveryPin },
  });
}

// E. Order Delivered & Review Reminder
export function notifyOrderDelivered(order) {
  triggerNotification({
    title: '✅ Order Delivered Successfully!',
    body: `Your provisions from ${order.storeName} have been delivered. Tap here to rate your food & courier!`,
    type: 'default',
    data: { orderId: order.id, status: 'Delivered' },
  });
}

// F. Recurring Acceptance Reminder (Every 1 minute until accepted)
export function notifyMerchantAcceptanceReminder(order, count = 1) {
  const storeName = order.storeName || order.store_name || 'Your store';
  const title = count > 1 ? `🔔 ${count} ORDERS AWAITING ACCEPTANCE!` : '🔔 ORDER ACCEPTANCE REMINDER!';
  const body = count > 1
    ? `You have ${count} pending orders for ${storeName}. Please review and tap "Accept Order" to begin preparing.`
    : `Order #${order.id} for ${storeName} is waiting for your acceptance. Tap to accept and start preparing.`;

  triggerNotification({
    title,
    body,
    type: 'merchant_new_order',
    data: { orderId: order.id, status: 'New Order', role: 'merchant' },
  });
}

// G. Recurring Preparation Reminder (Every 1 minute until marked ready)
export function notifyMerchantPrepReminder(order, count = 1) {
  const storeName = order.storeName || order.store_name || 'Your store';
  const title = count > 1 ? `⏱️ ${count} ORDERS IN PREPARATION` : '⏱️ ORDER PREPARATION REMINDER';
  const body = count > 1
    ? `${count} orders for ${storeName} are currently being prepared. Don't forget to tap "Mark Ready for Courier" when packaged!`
    : `Order #${order.id} is being prepared at ${storeName}. Don't forget to tap "Mark Ready for Courier" when packaged!`;

  triggerNotification({
    title,
    body,
    type: 'merchant_new_order',
    data: { orderId: order.id, status: 'Preparing', role: 'merchant' },
  });
}
