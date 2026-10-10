/**
 * Bolt Delivery Service for GETIT
 * 
 * Supports both:
 * 1. Live Bolt Business / Merchant Delivery API (once credentials are provided)
 * 2. Instant realistic sandbox simulator keeping users and vendors 100% inside GETIT.
 */

export const BOLT_CONFIG = {
  // Replace these with your live Bolt Business API credentials once approved:
  CLIENT_ID: process.env.BOLT_CLIENT_ID || 'BOLT_SANDBOX_GETIT_MERCHANT_2026',
  CLIENT_SECRET: process.env.BOLT_CLIENT_SECRET || 'BOLT_SECRET_PENDING_APPROVAL',
  BASE_URL: 'https://api.bolt.eu/delivery/v1',
  IS_LIVE: false, // Set to true once credentials are confirmed by Bolt
};

/**
 * Standard simulated Bolt dispatch profiles in Abuja & Lagos
 */
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
  {
    id: 'bolt-rider-03',
    name: 'Babajide Alabi',
    phone: '+234 902 334 8871',
    rating: '4.88',
    trips: 2150,
    vehicle: 'Honda Ace 125 (Black)',
    plate: 'LAG-304-KU',
    avatar: '🛵',
  },
];

/**
 * Request a new Bolt Courier Dispatch
 */
export async function requestBoltDelivery({
  orderId,
  storeLocation,
  deliveryLocation,
  customerName,
  customerPhone,
  deliveryNote,
}) {
  if (BOLT_CONFIG.IS_LIVE) {
    try {
      const response = await fetch(`${BOLT_CONFIG.BASE_URL}/orders/create`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${BOLT_CONFIG.CLIENT_SECRET}`,
        },
        body: JSON.stringify({
          client_order_id: orderId,
          pickup: {
            lat: storeLocation.latitude,
            lng: storeLocation.longitude,
            address: storeLocation.address,
          },
          dropoff: {
            lat: deliveryLocation.latitude,
            lng: deliveryLocation.longitude,
            address: deliveryLocation.address,
            contact_name: customerName,
            contact_phone: customerPhone,
            instructions: deliveryNote,
          },
        }),
      });
      return await response.json();
    } catch (err) {
      console.warn('Bolt API Live request failed, falling back to simulator:', err);
    }
  }

  // --- SIMULATED IN-APP BOLT DISPATCH ---
  const assignedRider = SAMPLE_BOLT_RIDERS[Math.floor(Math.random() * SAMPLE_BOLT_RIDERS.length)];
  const trackingCode = `BOLT-${Math.floor(100000 + Math.random() * 900000)}`;

  // Interpolate initial rider position halfway towards store
  const riderLat = storeLocation.latitude + (Math.random() - 0.5) * 0.005;
  const riderLng = storeLocation.longitude + (Math.random() - 0.5) * 0.005;

  return {
    success: true,
    boltOrderId: trackingCode,
    trackingCode,
    status: 'RIDER_ASSIGNED',
    rider: assignedRider,
    etaMinutes: 14,
    currentLocation: {
      latitude: riderLat,
      longitude: riderLng,
    },
    pickupEta: '4 mins',
    destinationEta: '14 mins',
  };
}
