// Specification-compliant fee calculator and financial allocation engine

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

/**
 * Calculates customer service fee based on Spec Section 14:
 * Orders below ₦30,000: 5%
 * Orders from ₦30,000 to ₦50,000: 4%
 * Orders above ₦50,000: 3.5%
 * No maximum cap!
 */
export function calculateCustomerServiceFee(productSubtotal, configTiers) {
  const subtotal = Math.max(0, Number(productSubtotal) || 0);

  if (configTiers && Array.isArray(configTiers)) {
    for (const tier of configTiers) {
      if (subtotal < tier.maxThreshold) {
        return {
          rate: tier.rate,
          percentageLabel: `${(tier.rate * 100).toFixed(1)}%`,
          amount: subtotal * tier.rate,
        };
      }
    }
  }

  // Fallback to strict spec rules:
  if (subtotal < 30000) {
    return {
      rate: 0.05,
      percentageLabel: '5%',
      amount: subtotal * 0.05,
    };
  } else if (subtotal <= 50000) {
    return {
      rate: 0.04,
      percentageLabel: '4%',
      amount: subtotal * 0.04,
    };
  } else {
    return {
      rate: 0.035,
      percentageLabel: '3.5%',
      amount: subtotal * 0.035,
    };
  }
}

/**
 * Calculates shop commission based on Spec Section 15:
 * Standard 7% on value of goods sold
 * Shop settlement = Subtotal - 7%
 */
export function calculateShopCommission(productSubtotal, commissionRate = 7.0) {
  const subtotal = Math.max(0, Number(productSubtotal) || 0);
  const rateFraction = (commissionRate || 7.0) / 100;
  const commissionAmount = subtotal * rateFraction;
  const vendorSettlement = subtotal - commissionAmount;

  return {
    commissionRate: commissionRate || 7.0,
    commissionAmount,
    vendorSettlement,
  };
}

/**
 * Calculates payment processing fee based on Spec Section 17 & Paystack standards:
 * Passed to customer rather than absorbed.
 */
export function calculatePaymentProcessingFee(amountBeforeProcessing, config) {
  const amount = Math.max(0, Number(amountBeforeProcessing) || 0);
  const pct = config?.percentage ?? 0.015;
  const flat = amount >= 2500 ? (config?.flatFeeNaira ?? 100) : 0;
  const rawFee = (amount * pct) + flat;
  const cappedFee = config?.maxFeeCap ? Math.min(rawFee, config.maxFeeCap) : rawFee;
  return Math.round(cappedFee * 100) / 100;
}

/**
 * Complete Order Calculation Breakdown (Spec Section 18, 19, 42)
 */
export function calculateOrderTotals(productSubtotal, deliveryOverride = null, config = null) {
  const subtotal = Math.max(0, Number(productSubtotal) || 0);
  
  // 1. Service Fee
  const serviceFeeInfo = calculateCustomerServiceFee(subtotal, config?.serviceFeeTiers);
  
  // 2. Delivery breakdown
  const deliveryCustomerFee = deliveryOverride?.customerFee ?? config?.delivery?.baseCustomerFee ?? 1000;
  const deliveryProviderCost = deliveryOverride?.providerCost ?? config?.delivery?.baseProviderPayout ?? 850;
  const deliveryPlatformMargin = deliveryCustomerFee - deliveryProviderCost;
  
  // 3. Payment Processing
  const sumBeforeProcessing = subtotal + serviceFeeInfo.amount + deliveryCustomerFee;
  const paymentProcessingFee = calculatePaymentProcessingFee(sumBeforeProcessing, config?.paymentProcessing);
  
  // 4. Customer Total
  const totalAmountPaid = sumBeforeProcessing + paymentProcessingFee;

  // 5. Vendor & Platform Allocations (Spec Section 19 & 42)
  const shopCommissionInfo = calculateShopCommission(subtotal, config?.standardShopCommissionRate ?? 7.0);

  const platformGrossRevenue = 
    shopCommissionInfo.commissionAmount + 
    serviceFeeInfo.amount + 
    deliveryPlatformMargin;

  return {
    productSubtotal: subtotal,
    serviceFeeRate: serviceFeeInfo.rate,
    serviceFeeLabel: serviceFeeInfo.percentageLabel,
    serviceFee: serviceFeeInfo.amount,
    deliveryFee: deliveryCustomerFee,
    deliveryProviderCost,
    deliveryPlatformMargin,
    paymentProcessingFee,
    totalAmountPaid,
    
    // Internal Ledger Split
    shopCommission: shopCommissionInfo.commissionAmount,
    shopCommissionRate: shopCommissionInfo.commissionRate,
    vendorSettlement: shopCommissionInfo.vendorSettlement,
    platformGrossRevenue,
  };
}
