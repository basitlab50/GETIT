/**
 * Bolt Delivery Service for GETIT Web App
 */

export const BOLT_CONFIG = {
  CLIENT_ID: import.meta.env?.VITE_BOLT_CLIENT_ID || 'BOLT_SANDBOX_GETIT_MERCHANT_2026',
  CLIENT_SECRET: import.meta.env?.VITE_BOLT_CLIENT_SECRET || 'BOLT_SECRET_PENDING_APPROVAL',
  BASE_URL: 'https://api.bolt.eu/delivery/v1',
  IS_LIVE: false,
};

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
  storeLocation,
  deliveryLocation,
  customerName,
  customerPhone,
  deliveryNote,
}) {
  const assignedRider = SAMPLE_BOLT_RIDERS[0];
  const trackingCode = `BOLT-${Math.floor(100000 + Math.random() * 900000)}`;

  return {
    success: true,
    boltOrderId: trackingCode,
    trackingCode,
    status: 'RIDER_ASSIGNED',
    rider: assignedRider,
    etaMinutes: 14,
    currentLocation: {
      latitude: (storeLocation?.latitude || 9.0882) + 0.003,
      longitude: (storeLocation?.longitude || 7.4933) + 0.003,
    },
    pickupEta: '4 mins',
    destinationEta: '14 mins',
  };
}
