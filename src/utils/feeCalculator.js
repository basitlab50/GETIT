// GETIT Specification-compliant fee calculator and commercial allocation engine
// Supports tiered merchant markup (10% below ₦50k, 7% above ₦50k), 5% concierge & packaging app charge, and Bolt delivery markup (20%)

export function formatNaira(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₦0.00';
  return '₦' + Number(amount).toLocaleString('en-NG', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  });
}

export function formatNairaCompact(amount) {
  if (amount === undefined || amount === null || isNaN(amount)) return '₦0';
  return '₦' + Number(amount).toLocaleString('en-NG', {
    maximumFractionDigits: 0,
  });
}

// Helper to extract numeric tier cap (supports both .threshold and .upTo, with null/empty = Infinity)
export function getTierCap(tier) {
  if (!tier) return Infinity;
  const val = tier.threshold !== undefined && tier.threshold !== null && tier.threshold !== ''
    ? tier.threshold
    : (tier.upTo !== undefined && tier.upTo !== null && tier.upTo !== '' ? tier.upTo : null);
  return val === null ? Infinity : Number(val);
}

/**
 * Evaluates an amount against an array of tiers and returns the applied percentage.
 */
export function getAppliedRateFromTiers(amount, tiers, defaultRate = 10.0) {
  if (!Array.isArray(tiers) || tiers.length === 0) return defaultRate;

  const sorted = [...tiers].sort((a, b) => getTierCap(a) - getTierCap(b));

  for (const t of sorted) {
    if (amount < getTierCap(t)) {
      return Number(t.percent ?? defaultRate);
    }
  }

  const last = sorted[sorted.length - 1];
  return Number(last?.percent ?? defaultRate);
}

/**
 * Calculates GETIT Tiered Product Display Price & Markup:
 * Supports dynamic multi-tier thresholds and legacy 2-tier fallback (< ₦50k @ 10%, >= ₦50k @ 7%)
 * Example: Merchant uploads Coca-Cola for ₦1,000 -> Customer sees ₦1,100 (₦100 is GETIT Take, ₦1,000 to vendor)
 */
export function calculateTieredProductPrice(merchantBasePrice, customRules = null) {
  const base = Math.max(0, Number(merchantBasePrice) || 0);

  // Dynamic multi-tier engine
  if (Array.isArray(customRules?.markupTiers) && customRules.markupTiers.length > 0) {
    const appliedRatePct = getAppliedRateFromTiers(base, customRules.markupTiers, 10.0);
    const markupAmount = Math.round(base * (appliedRatePct / 100));
    return {
      merchantBasePrice: base,
      appliedRatePct,
      markupAmount,
      customerDisplayPrice: base + markupAmount,
    };
  }

  // Legacy 2-tier fallback
  const threshold = Number(customRules?.tierThresholdNaira ?? 50000);
  const lowRate = Number(customRules?.markupBelowThresholdPct ?? 10.0);
  const highRate = Number(customRules?.markupAboveThresholdPct ?? 7.0);

  const appliedRatePct = base < threshold ? lowRate : highRate;
  const markupAmount = Math.round(base * (appliedRatePct / 100));
  const customerDisplayPrice = base + markupAmount;

  return {
    merchantBasePrice: base,
    appliedRatePct,
    markupAmount, // GETIT Take from product markup
    customerDisplayPrice,
    isLowTier: base < threshold,
  };
}

/**
 * Convenient helper to get only the numeric display price for shelf rendering
 */
export function getProductDisplayPrice(merchantBasePrice, customRules = null) {
  return calculateTieredProductPrice(merchantBasePrice, customRules).customerDisplayPrice;
}

/**
 * Calculates Concierge & Packaging App Charge:
 * Supports dynamic multi-tier basket thresholds and legacy flat percentage fallback (Default 5%)
 */
export function calculateConciergePackagingFee(customerGoodsSubtotal, customRulesOrPct = 5.0) {
  const subtotal = Math.max(0, Number(customerGoodsSubtotal) || 0);
  let ratePct = 5.0;

  if (typeof customRulesOrPct === 'object' && customRulesOrPct !== null) {
    if (Array.isArray(customRulesOrPct.conciergeTiers) && customRulesOrPct.conciergeTiers.length > 0) {
      ratePct = getAppliedRateFromTiers(subtotal, customRulesOrPct.conciergeTiers, 5.0);
    } else {
      ratePct = Number(customRulesOrPct.conciergePackagingPct ?? 5.0);
    }
  } else {
    ratePct = Number(customRulesOrPct ?? 5.0);
  }

  const amount = Math.round(subtotal * (ratePct / 100));
  return {
    ratePct,
    amount,
  };
}

/**
 * Calculates Bolt Delivery Markup (Default 20% added to Bolt courier fee)
 * Example: Bolt charges ₦1,000 -> Customer sees ₦1,200 (₦1,000 goes to Bolt, ₦200 to GETIT)
 */
export function calculateBoltDeliveryFee(boltBaseFee, customMarkupPct = 20.0) {
  const base = Math.max(0, Number(boltBaseFee) || 0);
  const markupPct = Number(customMarkupPct ?? 20.0);
  const markupAmount = Math.round(base * (markupPct / 100));
  const customerDeliveryFee = base + markupAmount;

  return {
    boltBaseFee: base,
    markupPct,
    markupAmount, // GETIT Take from delivery markup
    customerDeliveryFee,
  };
}

/**
 * Legacy support for standard percentage service fee
 */
export function calculateCustomerServiceFee(productSubtotal) {
  return calculateConciergePackagingFee(productSubtotal, 5.0);
}

/**
 * Legacy support for shop commission
 */
export function calculateShopCommission(productSubtotal, commissionRate = 7.0) {
  const subtotal = Math.max(0, Number(productSubtotal) || 0);
  const rateFraction = (commissionRate || 7.0) / 100;
  const commissionAmount = Math.round(subtotal * rateFraction);
  const vendorSettlement = subtotal - commissionAmount;

  return {
    commissionRate: commissionRate || 7.0,
    commissionAmount,
    vendorSettlement,
  };
}

/**
 * Complete Order Financial Breakdown conforming to CEO rules
 */
export function calculateOrderTotals(merchantItemsSubtotal, boltDeliveryBase = 1000, rules = null) {
  const baseSubtotal = Math.max(0, Number(merchantItemsSubtotal) || 0);

  // 1. Tiered product markup (10% if < ₦50k, 7% if >= ₦50k)
  const productPricing = calculateTieredProductPrice(baseSubtotal, rules);
  const customerGoodsTotal = productPricing.customerDisplayPrice;

  // 2. Concierge & Packaging app charge (5%)
  const concierge = calculateConciergePackagingFee(customerGoodsTotal, rules?.conciergePackagingPct ?? 5.0);

  // 3. Bolt delivery markup (20%)
  const delivery = calculateBoltDeliveryFee(boltDeliveryBase, rules?.boltDeliveryMarkupPct ?? 20.0);

  // 4. Total customer payment
  const totalAmountPaid = customerGoodsTotal + concierge.amount + delivery.customerDeliveryFee;

  // 5. Allocation Splits
  const vendorPayout = productPricing.merchantBasePrice;
  const boltPayout = delivery.boltBaseFee;
  const getitGrossRevenue = productPricing.markupAmount + concierge.amount + delivery.markupAmount;

  return {
    merchantBaseSubtotal: baseSubtotal,
    customerGoodsTotal,
    productSubtotal: customerGoodsTotal, // Backwards-compatible alias for legacy cart modals
    productMarkupAmount: productPricing.markupAmount,
    productMarkupPct: productPricing.appliedRatePct,

    conciergePackagingFee: concierge.amount,
    conciergePackagingPct: concierge.ratePct,
    serviceFee: concierge.amount, // Backwards-compatible alias for legacy cart modals
    serviceFeeLabel: `${concierge.ratePct}% (Concierge & Packaging)`,

    customerDeliveryFee: delivery.customerDeliveryFee,
    deliveryFee: delivery.customerDeliveryFee, // Backwards-compatible alias for legacy cart modals
    paymentProcessingFee: 0,
    boltBasePayout: delivery.boltBaseFee,
    deliveryMarkupAmount: delivery.markupAmount,
    deliveryMarkupPct: delivery.markupPct,

    totalAmountPaid,
    vendorPayout,
    boltPayout,
    getitGrossRevenue,
  };
}
