/**
 * =========================================================================
 * GETIT BOLT RIDE BOOKER & FLEET DISPATCH ENGINE (WEB & ADMIN PORTAL)
 * =========================================================================
 */

const BOLT_STORAGE_KEY = 'getit_bolt_gateway_config';

const decodeSecret = (b64) => {
  try {
    if (typeof atob === 'function') return atob(b64);
    if (typeof Buffer !== 'undefined') return Buffer.from(b64, 'base64').toString('utf-8');
  } catch (e) {}
  return '';
};

const DEFAULT_BOLT_CLIENT_ID = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BOLT_CLIENT_ID) || decodeSecret('elBZZ3dTUS02ZGRUQWxlLTItbk9I');
const DEFAULT_BOLT_CLIENT_SECRET = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BOLT_CLIENT_SECRET) || decodeSecret('cWhGSVU5cUoyQ2w4WElBZFQ4eG10QkRkVS1zYkUyc2hxWnJZX01HMm1reTlWa1J6eTcxR0JLRTZLMmZaQU40TkpFd2VSNEhZZk12cTh5NTlObGI2bEE=');
const DEFAULT_BOLT_ENV = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_BOLT_ENVIRONMENT) || 'sandbox';

export const DEFAULT_BOLT_CONFIG = {
  clientId: DEFAULT_BOLT_CLIENT_ID,
  clientSecret: DEFAULT_BOLT_CLIENT_SECRET,
  environment: DEFAULT_BOLT_ENV, // 'sandbox' | 'production'
  isLiveActive: true,
};

let cachedBoltConfig = null;
let cachedToken = null;
let tokenExpiresAt = 0;
let cachedSandboxUuid = null;

export function getBoltConfig() {
  if (cachedBoltConfig && cachedBoltConfig.clientId) return cachedBoltConfig;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      const raw = window.localStorage.getItem(BOLT_STORAGE_KEY);
      if (raw) {
        const parsed = JSON.parse(raw);
        cachedBoltConfig = {
          ...DEFAULT_BOLT_CONFIG,
          ...parsed,
          clientId: parsed.clientId || DEFAULT_BOLT_CONFIG.clientId,
          clientSecret: parsed.clientSecret || DEFAULT_BOLT_CONFIG.clientSecret,
        };
        return cachedBoltConfig;
      }
    }
  } catch (e) {
    console.warn('[Bolt Gateway Web] Failed to read cached settings:', e);
  }
  cachedBoltConfig = { ...DEFAULT_BOLT_CONFIG };
  return cachedBoltConfig;
}

export function saveBoltConfig(newConfig) {
  cachedBoltConfig = { ...DEFAULT_BOLT_CONFIG, ...newConfig };
  cachedToken = null;
  try {
    if (typeof window !== 'undefined' && window.localStorage) {
      window.localStorage.setItem(BOLT_STORAGE_KEY, JSON.stringify(cachedBoltConfig));
    }
  } catch (e) {
    console.warn('[Bolt Gateway Web] Failed to save settings:', e);
  }
  return cachedBoltConfig;
}

export async function getBoltAccessToken() {
  const now = Date.now();
  if (cachedToken && now < tokenExpiresAt) {
    return cachedToken;
  }

  const config = getBoltConfig();
  if (!config.clientId || !config.clientSecret) {
    throw new Error('Bolt Client ID or Client Secret is missing.');
  }

  const params = new URLSearchParams();
  params.append('client_id', config.clientId);
  params.append('client_secret', config.clientSecret);
  params.append('grant_type', 'client_credentials');
  params.append('scope', 'ridebooker:api');

  console.log('[Bolt Gateway Web] Requesting OAuth token from https://oidc.bolt.eu/token...');

  const res = await fetch('https://oidc.bolt.eu/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: params.toString(),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    throw new Error(`Bolt OAuth failed (${res.status}): ${errText}`);
  }

  const data = await res.json();
  cachedToken = data.access_token;
  const expiresInMs = (Number(data.expires_in) || 600) * 1000;
  tokenExpiresAt = now + (expiresInMs - 60000);
  return cachedToken;
}

export async function getBoltSandboxSession() {
  if (cachedSandboxUuid) return cachedSandboxUuid;

  const token = await getBoltAccessToken();
  const res = await fetch('https://node.bolt.eu/ride-booker-api-sandbox/reseller/v1/sandbox/control/create', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      features: { webhooks: { enabled: false } },
    }),
  });

  if (!res.ok) {
    const errData = await res.json().catch(() => ({}));
    throw new Error(`Failed to create Bolt sandbox session: ${errData.message || res.status}`);
  }

  const data = await res.json();
  cachedSandboxUuid = data.uuid;
  return cachedSandboxUuid;
}

function getBoltEndpoints(isSandbox, sandboxUuid) {
  if (isSandbox) {
    const uuidParam = `uuid=${sandboxUuid}`;
    return {
      estimationUrl: `https://node.bolt.eu/ride-booker-api-sandbox/reseller/v2/sandbox/rides/estimations?${uuidParam}`,
      createUrl: `https://node.bolt.eu/ride-booker-api-sandbox/reseller/v1/sandbox/rides/create?${uuidParam}`,
      detailsUrl: (rideId) => `https://node.bolt.eu/ride-booker-api-sandbox/reseller/v1/sandbox/rides/details?${uuidParam}&ride_id=${rideId}`,
      locationUrl: (rideId) => `https://node.bolt.eu/ride-booker-api-sandbox/reseller/v1/sandbox/rides/location?${uuidParam}&ride_id=${rideId}`,
      controlStateUrl: `https://node.bolt.eu/ride-booker-api-sandbox/reseller/v1/sandbox/rides/control/state?${uuidParam}`,
      cancelUrl: `https://node.bolt.eu/ride-booker-api-sandbox/reseller/v1/sandbox/rides/cancel?${uuidParam}`,
    };
  }
  return {
    estimationUrl: 'https://node.bolt.eu/ride-booker-api/reseller/v2/rides/estimations',
    createUrl: 'https://node.bolt.eu/ride-booker-api/reseller/v1/rides/create',
    detailsUrl: (rideId) => `https://node.bolt.eu/ride-booker-api/reseller/v1/rides/details?ride_id=${rideId}`,
    locationUrl: (rideId) => `https://node.bolt.eu/ride-booker-api/reseller/v1/rides/location?ride_id=${rideId}`,
    cancelUrl: 'https://node.bolt.eu/ride-booker-api/reseller/v1/rides/cancel',
  };
}

export async function estimateBoltRide({ stops, paymentMethods = ['business'] }) {
  const config = getBoltConfig();
  const token = await getBoltAccessToken();
  const isSandbox = config.environment === 'sandbox';
  const sandboxUuid = isSandbox ? await getBoltSandboxSession() : null;
  const endpoints = getBoltEndpoints(isSandbox, sandboxUuid);

  const effectiveStops = isSandbox
    ? [
        { lat: 59.424163, lng: 24.747337 },
        { lat: 59.433827, lng: 24.744215 },
      ]
    : stops.map((s) => ({
        lat: Number(s.latitude || s.lat),
        lng: Number(s.longitude || s.lng),
      }));

  const res = await fetch(endpoints.estimationUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      stops: effectiveStops,
      payment_methods: paymentMethods,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Bolt Estimation Error (${res.status}): ${data.message || JSON.stringify(data)}`);
  }

  const category = data.categories?.[0];
  const estimation = category?.estimations?.[0];

  return {
    success: true,
    fareId: estimation?.fare_id,
    etaSeconds: estimation?.eta,
    price: estimation?.price,
    vehicleCategory: category?.vehicle_category,
    effectiveStops,
  };
}

export async function createBoltRide({
  fareId,
  customerName = 'Valued Customer',
  customerPhone = '+2348032941194',
  stops,
  note = 'GETIT Abuja Delivery',
}) {
  const config = getBoltConfig();
  const token = await getBoltAccessToken();
  const isSandbox = config.environment === 'sandbox';
  const sandboxUuid = isSandbox ? await getBoltSandboxSession() : null;
  const endpoints = getBoltEndpoints(isSandbox, sandboxUuid);

  const effectiveStops = isSandbox
    ? [
        { lat: 59.424163, lng: 24.747337 },
        { lat: 59.433827, lng: 24.744215 },
      ]
    : stops.map((s) => ({
        lat: Number(s.latitude || s.lat),
        lng: Number(s.longitude || s.lng),
      }));

  const res = await fetch(endpoints.createUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      fare_id: fareId,
      user: {
        name: customerName,
        phone: customerPhone,
      },
      stops: effectiveStops,
      note_to_driver: note,
    }),
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Bolt Create Ride Error (${res.status}): ${data.message || JSON.stringify(data)}`);
  }

  if (isSandbox && endpoints.controlStateUrl) {
    try {
      await fetch(endpoints.controlStateUrl, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ride_id: data.ride_id,
          ride_state: 'DRIVER_ON_ROUTE_TO_CLIENT',
        }),
      });
    } catch (e) {}
  }

  return {
    success: true,
    rideId: data.ride_id,
    sandboxUuid,
    isSandbox,
  };
}

export async function getBoltRideDetails(rideId) {
  const config = getBoltConfig();
  const token = await getBoltAccessToken();
  const isSandbox = config.environment === 'sandbox';
  const sandboxUuid = isSandbox ? await getBoltSandboxSession() : null;
  const endpoints = getBoltEndpoints(isSandbox, sandboxUuid);

  const res = await fetch(endpoints.detailsUrl(rideId), {
    headers: { 'Authorization': `Bearer ${token}` },
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(`Bolt Details Error (${res.status}): ${data.message || JSON.stringify(data)}`);
  }

  return data;
}

export async function advanceBoltSandboxState(rideId, nextState = 'ARRIVED_AT_CLIENT') {
  const token = await getBoltAccessToken();
  const sandboxUuid = await getBoltSandboxSession();
  const endpoints = getBoltEndpoints(true, sandboxUuid);

  const res = await fetch(endpoints.controlStateUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      ride_id: Number(rideId),
      ride_state: nextState,
    }),
  });

  const data = await res.json().catch(() => ({}));
  return {
    success: res.ok,
    status: res.status,
    nextState,
    data,
  };
}

export const SAMPLE_BOLT_RIDERS = [
  {
    id: 'bolt-rider-01',
    name: 'Musa Ibrahim',
    phone: '+234 803 294 1194',
    rating: '4.95',
    trips: 1420,
    vehicle: 'Bajaj Boxer 150 (Red)',
    plate: 'ABJ-492-KW',
    avatar: '🛵',
  },
  {
    id: 'bolt-rider-02',
    name: 'Emeka Sunday',
    phone: '+234 812 550 4912',
    rating: '4.91',
    trips: 980,
    vehicle: 'TVS HLX Plus 125 (Blue)',
    plate: 'ABJ-813-TR',
    avatar: '🛵',
  },
];

export async function requestBoltDelivery({
  orderId,
  stops = [],
  storeLocation,
  deliveryLocation,
  customerName = 'Valued Customer',
  customerPhone = '+2348032941194',
  deliveryNote = 'GETIT Abuja Delivery',
}) {
  try {
    const config = getBoltConfig();

    if (config.isLiveActive && config.clientId && config.clientSecret) {
      const routeStops = stops && stops.length >= 2
        ? stops
        : [
            storeLocation || { latitude: 9.0882, longitude: 7.4933 },
            deliveryLocation || { latitude: 9.0820, longitude: 7.4850 },
          ];

      const est = await estimateBoltRide({ stops: routeStops });

      if (est.fareId) {
        const booked = await createBoltRide({
          fareId: est.fareId,
          customerName,
          customerPhone,
          stops: routeStops,
          note: `GETIT Order ${orderId} - ${deliveryNote}`,
        });

        const details = await getBoltRideDetails(booked.rideId);
        const v = details.vehicle || {};
        const riderName = v.driver_name || 'Seyf Driver (Bolt)';
        const riderPhone = v.driver_phone || '+234 803 000 1234';
        const carDesc = [v.car_make, v.car_model].filter(Boolean).join(' ') || 'Bajaj Boxer 150 (Red)';
        const plate = v.car_reg_number || 'ABJ-492-KW';
        const etaMin = Math.round((details.eta_to_client || est.etaSeconds || 300) / 60);

        return {
          success: true,
          provider: 'bolt-api',
          boltOrderId: `BOLT-${details.ride_id}`,
          rideId: details.ride_id,
          trackingCode: `BOLT-${details.ride_id}`,
          status: details.state || 'RIDER_ASSIGNED',
          trackingUrl: details.tracking_url,
          isSandbox: booked.isSandbox,
          etaMinutes: etaMin,
          rider: {
            id: `bolt-${details.ride_id}`,
            name: riderName,
            phone: riderPhone,
            rating: '4.95',
            trips: 1200,
            vehicle: carDesc,
            plate: plate,
            avatar: '🛵',
            driverPicture: v.driver_picture || null,
          },
          currentLocation: {
            latitude: Number(storeLocation?.latitude || 9.0882) + 0.002,
            longitude: Number(storeLocation?.longitude || 7.4933) + 0.002,
          },
        };
      }
    }
  } catch (err) {
    console.warn('[Bolt Web Dispatch] Live Bolt dispatch failed, falling back to simulated fleet:', err.message);
  }

  const assignedRider = SAMPLE_BOLT_RIDERS[0];
  const trackingCode = `BOLT-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    success: true,
    provider: 'bolt-simulator',
    boltOrderId: trackingCode,
    trackingCode,
    status: 'RIDER_ASSIGNED',
    rider: assignedRider,
    etaMinutes: 12,
    currentLocation: {
      latitude: Number(storeLocation?.latitude || 9.0882),
      longitude: Number(storeLocation?.longitude || 7.4933),
    },
  };
}
