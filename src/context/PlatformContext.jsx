import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  INITIAL_LOCATIONS,
  INITIAL_VENDORS,
  INITIAL_PRODUCTS,
  INITIAL_RIDERS,
  INITIAL_ORDERS,
  INITIAL_CONFIG,
} from '../data/mockData';
import { calculateOrderTotals } from '../utils/feeCalculator';

const PlatformContext = createContext(null);

const STORAGE_KEYS = {
  ORDERS: 'getit_orders_v1',
  PRODUCTS: 'getit_products_v4', // Bumped to v4 to include Zobo, Hollandia, and La Casera photo items
  VENDORS: 'getit_vendors_v1',
  RIDERS: 'getit_riders_v1',
  CONFIG: 'getit_config_v1',
};

function loadStored(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    if (!raw) return fallback;
    const data = JSON.parse(raw);
    
    // For products, always guarantee fresh image URLs and newly added items from INITIAL_PRODUCTS
    if (key === STORAGE_KEYS.PRODUCTS && Array.isArray(data) && Array.isArray(fallback)) {
      const fallbackMap = new Map(fallback.map((p) => [p.id, p]));
      const merged = data.map((item) => {
        const fresh = fallbackMap.get(item.id);
        if (fresh && fresh.imageUrl && fresh.imageUrl.startsWith('/')) {
          return { ...item, imageUrl: fresh.imageUrl, name: fresh.name, brand: fresh.brand };
        }
        return item;
      });

      // Add any new items from fallback that are not yet in stored list
      for (const fresh of fallback) {
        if (!merged.some((m) => m.id === fresh.id)) {
          merged.push(fresh);
        }
      }
      return merged;
    }

    return data;
  } catch (err) {
    console.warn('Error reading from localStorage', err);
    return fallback;
  }
}

function saveStored(key, data) {
  try {
    localStorage.setItem(key, JSON.stringify(data));
  } catch (err) {
    console.warn('Error writing to localStorage', err);
  }
}

export function PlatformProvider({ children }) {
  // Global View/Role State
  const [activeRole, setActiveRole] = useState('customer'); // 'customer' | 'vendor' | 'rider' | 'admin'
  const [isMobileFrame, setIsMobileFrame] = useState(true); // For customer app realistic mobile frame toggle
  const [selectedLocation, setSelectedLocation] = useState(INITIAL_LOCATIONS[0]);
  
  // Portals Context Entities
  const [selectedVendorId, setSelectedVendorId] = useState('vendor-1');
  const [selectedRiderId, setSelectedRiderId] = useState('rider-1');

  // Core Data
  const [vendors, setVendors] = useState(() => loadStored(STORAGE_KEYS.VENDORS, INITIAL_VENDORS));
  const [riders, setRiders] = useState(() => loadStored(STORAGE_KEYS.RIDERS, INITIAL_RIDERS));
  const [products, setProducts] = useState(() => loadStored(STORAGE_KEYS.PRODUCTS, INITIAL_PRODUCTS));
  const [orders, setOrders] = useState(() => loadStored(STORAGE_KEYS.ORDERS, INITIAL_ORDERS));
  const [config, setConfig] = useState(() => loadStored(STORAGE_KEYS.CONFIG, INITIAL_CONFIG));

  // Customer Cart: { productId, product, quantity, vendorId }
  const [cart, setCart] = useState([]);
  
  // Real-time toast alert state
  const [toasts, setToasts] = useState([]);

  // Active tracking order for customer
  const [activeCustomerOrderId, setActiveCustomerOrderId] = useState(INITIAL_ORDERS[0]?.id || null);

  // Sync to localStorage
  useEffect(() => saveStored(STORAGE_KEYS.ORDERS, orders), [orders]);
  useEffect(() => saveStored(STORAGE_KEYS.PRODUCTS, products), [products]);
  useEffect(() => saveStored(STORAGE_KEYS.VENDORS, vendors), [vendors]);
  useEffect(() => saveStored(STORAGE_KEYS.RIDERS, riders), [riders]);
  useEffect(() => saveStored(STORAGE_KEYS.CONFIG, config), [config]);

  const notify = (title, message, type = 'info') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev, { id, title, message, type, time: new Date() }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 5500);
  };

  // Helper 4-digit PIN generator
  const generatePin = () => Math.floor(1000 + Math.random() * 9000).toString();

  // --- Cart Operations ---
  const addToCart = (product, quantity = 1) => {
    // Check if adding from different vendor
    const existingVendorId = cart[0]?.product?.vendorId;
    if (cart.length > 0 && existingVendorId && existingVendorId !== product.vendorId) {
      const vendorName = vendors.find((v) => v.id === existingVendorId)?.name || 'another shop';
      const confirmClear = window.confirm(
        `Your cart already has items from "${vendorName}". Create a separate order or clear cart to switch shops?`
      );
      if (!confirmClear) return;
      setCart([{ productId: product.id, product, quantity, vendorId: product.vendorId }]);
      notify('Cart Updated', `Switched shop to ${product.vendorName}`, 'info');
      return;
    }

    setCart((prev) => {
      const idx = prev.findIndex((item) => item.productId === product.id);
      if (idx >= 0) {
        const next = [...prev];
        next[idx] = { ...next[idx], quantity: next[idx].quantity + quantity };
        return next;
      }
      return [...prev, { productId: product.id, product, quantity, vendorId: product.vendorId }];
    });

    notify('Added to Cart', `${product.name} (x${quantity})`, 'success');
  };

  const updateCartQuantity = (productId, newQty) => {
    if (newQty <= 0) {
      removeFromCart(productId);
      return;
    }
    setCart((prev) =>
      prev.map((item) => (item.productId === productId ? { ...item, quantity: newQty } : item))
    );
  };

  const removeFromCart = (productId) => {
    setCart((prev) => prev.filter((item) => item.productId !== productId));
    notify('Item Removed', 'Product removed from cart', 'info');
  };

  const clearCart = () => setCart([]);

  // --- Order Creation (Spec Section 20) ---
  const createShopOrder = ({
    customerName,
    customerPhone,
    customerAddress,
    deliveryInstructions,
    paymentMethod,
    paymentReference,
  }) => {
    if (cart.length === 0) return null;

    const vendorId = cart[0].product.vendorId;
    const vendor = vendors.find((v) => v.id === vendorId);

    // Calculate product subtotal
    const productSubtotal = cart.reduce(
      (sum, item) => sum + item.product.price * item.quantity,
      0
    );

    const financials = calculateOrderTotals(productSubtotal, null, config);

    const newOrderId = `ORD-${Math.floor(100000 + Math.random() * 900000)}`;
    const pickupPin = generatePin();
    const deliveryPin = generatePin();

    const newOrder = {
      id: newOrderId,
      type: 'SHOP_ORDER',
      customerId: 'cust-current',
      customerName: customerName || 'Customer',
      customerPhone: customerPhone || '+234 800 000 0000',
      customerAddress: customerAddress || selectedLocation.name,
      deliveryInstructions: deliveryInstructions || '',
      vendorId,
      vendorName: vendor ? vendor.name : cart[0].product.vendorName,
      items: cart.map((item) => ({
        productId: item.productId,
        name: item.product.name,
        price: item.product.price,
        quantity: item.quantity,
        total: item.product.price * item.quantity,
      })),
      productSubtotal: financials.productSubtotal,
      serviceFee: financials.serviceFee,
      serviceFeeRate: financials.serviceFeeRate,
      serviceFeeLabel: financials.serviceFeeLabel,
      deliveryFee: financials.deliveryFee,
      deliveryProviderCost: financials.deliveryProviderCost,
      deliveryPlatformMargin: financials.deliveryPlatformMargin,
      paymentProcessingFee: financials.paymentProcessingFee,
      totalAmountPaid: financials.totalAmountPaid,
      shopCommission: financials.shopCommission,
      shopCommissionRate: financials.shopCommissionRate,
      vendorSettlement: financials.vendorSettlement,
      platformGrossRevenue: financials.platformGrossRevenue,
      paymentMethod: paymentMethod || 'Paystack Online',
      paymentStatus: 'PAID', // Backend verified
      paymentReference: paymentReference || `PSTK_LIVE_${Date.now()}`,
      status: 'PAID', // Spec Flow: PAID -> SENT_TO_VENDOR
      pickupPin,
      deliveryPin,
      assignedRiderId: null,
      assignedRiderName: null,
      deliveryProvider: config.delivery.defaultProvider === 'BOLT' ? 'Bolt Courier' : 'GETIT Fleet Rider',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ratings: null,
      notes: [],
    };

    setOrders((prev) => [newOrder, ...prev]);
    clearCart();
    setActiveCustomerOrderId(newOrderId);

    // Audio/Toast Alert for shop
    notify(
      'New Order Placed!',
      `Order ${newOrderId} (${formatNaira(financials.totalAmountPaid)}) paid via Paystack. Sent to ${vendor?.name}.`,
      'success'
    );

    return newOrder;
  };

  // --- Marketplace Order Creation (Spec Section 2.B & 33-35) ---
  const createMarketplaceTask = ({
    customerName,
    customerPhone,
    customerAddress,
    targetMarket = 'Utako Modern Market',
    deliveryInstructions = '',
    marketItems = [],
  }) => {
    if (!marketItems || marketItems.length === 0) return null;

    const estimatedSubtotal = marketItems.reduce(
      (sum, item) => sum + (Number(item.estimatedPrice) || 0),
      0
    );

    // Marketplace orders delivery fee typically slightly higher for errand shopping
    const deliveryOverride = { customerFee: 1500, providerCost: 1200 };
    const financials = calculateOrderTotals(estimatedSubtotal, deliveryOverride, config);

    const newTaskId = `TASK-${Math.floor(1000 + Math.random() * 9000)}`;
    const pickupPin = generatePin();
    const deliveryPin = generatePin();

    const newTask = {
      id: newTaskId,
      type: 'MARKET_TASK',
      customerId: 'cust-current',
      customerName: customerName || 'Market Shopper Client',
      customerPhone: customerPhone || '+234 800 000 0000',
      customerAddress: customerAddress || selectedLocation.name,
      deliveryInstructions,
      targetMarket,
      shopperId: null,
      shopperName: null,
      items: marketItems.map((item) => ({
        name: item.name,
        qty: item.qty || item.defaultQty || '1 item',
        estimatedPrice: Number(item.estimatedPrice) || 0,
        completed: false,
        actualCost: null,
      })),
      productSubtotal: financials.productSubtotal,
      serviceFee: financials.serviceFee,
      serviceFeeRate: financials.serviceFeeRate,
      serviceFeeLabel: financials.serviceFeeLabel,
      deliveryFee: financials.deliveryFee,
      deliveryProviderCost: financials.deliveryProviderCost,
      deliveryPlatformMargin: financials.deliveryPlatformMargin,
      paymentProcessingFee: financials.paymentProcessingFee,
      totalAmountPaid: financials.totalAmountPaid,
      shopCommission: financials.shopCommission,
      shopCommissionRate: financials.shopCommissionRate,
      vendorSettlement: financials.vendorSettlement,
      platformGrossRevenue: financials.platformGrossRevenue,
      paymentStatus: 'PAID',
      paymentReference: `PSTK_MKT_${Date.now()}`,
      status: 'PAID', // Spec Flow: PAID -> Dispatched to shopper
      pickupPin,
      deliveryPin,
      deliveryProvider: 'Market Shopper Agent',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      ratings: null,
      notes: [],
    };

    setOrders((prev) => [newTask, ...prev]);
    setActiveCustomerOrderId(newTaskId);

    notify(
      'Marketplace Errand Created!',
      `Task ${newTaskId} created for ${targetMarket}. Assigned to market shopper network.`,
      'success'
    );

    return newTask;
  };

  // --- Vendor Actions ---
  const vendorAcceptOrder = (orderId) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'PREPARING',
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    notify('Order Accepted', `Order ${orderId} is now being prepared in shop.`, 'info');
  };

  const vendorRejectOrder = (orderId, reason = 'Out of Stock') => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'VENDOR_REJECTED',
            rejectionReason: reason,
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    notify('Order Rejected', `Order ${orderId} was rejected (${reason}). Refund queued.`, 'warning');
  };

  const vendorMarkOrderReady = (orderId) => {
    // Once ready, Delivery Engine automatically assigns an available rider
    const availableRider = riders.find((r) => r.isOnline && r.status === 'AVAILABLE') || riders[0];

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'READY_FOR_PICKUP',
            assignedRiderId: availableRider ? availableRider.id : 'rider-1',
            assignedRiderName: availableRider ? availableRider.name : 'Tunde Adeleke',
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );

    if (availableRider) {
      setRiders((prev) =>
        prev.map((r) => (r.id === availableRider.id ? { ...r, status: 'ASSIGNED', currentJobId: orderId } : r))
      );
    }

    notify(
      'Order Packaged & Ready!',
      `Order ${orderId} marked ready. Delivery Engine assigned: ${availableRider?.name || 'Rider'}.`,
      'success'
    );
  };

  // Out of Stock Handler (Spec Section 32)
  const vendorReportOutOfStock = (orderId, productId, availableQty, resolution = 'adjust_quantity') => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          const updatedItems = ord.items.map((item) => {
            if (item.productId === productId) {
              const diffQty = item.quantity - availableQty;
              return {
                ...item,
                quantity: availableQty,
                total: item.price * availableQty,
                outOfStockAdjusted: true,
                removedQty: diffQty,
              };
            }
            return item;
          });

          // Recalculate subtotal
          const newSubtotal = updatedItems.reduce((sum, it) => sum + it.total, 0);
          const financials = calculateOrderTotals(newSubtotal, null, config);

          return {
            ...ord,
            items: updatedItems,
            productSubtotal: financials.productSubtotal,
            serviceFee: financials.serviceFee,
            totalAmountPaid: financials.totalAmountPaid,
            vendorSettlement: financials.vendorSettlement,
            platformGrossRevenue: financials.platformGrossRevenue,
            status: 'PREPARING',
            updatedAt: new Date().toISOString(),
            notes: [
              ...(ord.notes || []),
              `Vendor adjusted ${productId} to ${availableQty} units due to stock shortage. Refund difference credited to customer.`,
            ],
          };
        }
        return ord;
      })
    );

    notify(
      'Inventory Adjusted',
      `Order ${orderId} updated to ${availableQty} units. Difference calculated for customer refund.`,
      'info'
    );
  };

  // --- Rider / Delivery Engine Operations (Spec Section 25, 27, 29) ---
  const riderAcceptJob = (orderId, riderId) => {
    const rider = riders.find((r) => r.id === riderId);
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'RIDER_ASSIGNED',
            assignedRiderId: riderId,
            assignedRiderName: rider?.name || 'Assigned Rider',
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    notify('Delivery Job Accepted', `Rider en route to vendor location.`, 'info');
  };

  const riderArrivedAtPickup = (orderId) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: 'RIDER_AT_PICKUP', updatedAt: new Date().toISOString() }
          : ord
      )
    );
    notify('Rider Arrived at Shop', 'Rider is now requesting package and providing Pickup PIN.', 'info');
  };

  const riderConfirmPickup = (orderId, enteredPin) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    // Validate PIN (or allow bypass for dev simulation)
    if (order.pickupPin && enteredPin.trim() !== order.pickupPin.trim()) {
      return { success: false, message: `Invalid Pickup PIN! Shop PIN is ${order.pickupPin}` };
    }

    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'PICKED_UP',
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );

    notify(
      'Pickup Verified (PIN Match)',
      `Package handed to rider. Order ${orderId} is now IN TRANSIT.`,
      'success'
    );
    return { success: true };
  };

  const riderStartTransit = (orderId) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: 'IN_TRANSIT', updatedAt: new Date().toISOString() }
          : ord
      )
    );
    notify('Delivery In Transit', 'Rider is on the way to the customer address.', 'info');
  };

  const riderArrivedAtCustomer = (orderId) => {
    setOrders((prev) =>
      prev.map((ord) =>
        ord.id === orderId
          ? { ...ord, status: 'ARRIVED', updatedAt: new Date().toISOString() }
          : ord
      )
    );
    notify('Rider Arrived at Destination', 'Customer notified to meet rider and provide Delivery PIN.', 'info');
  };

  const riderConfirmDelivery = (orderId, enteredPin) => {
    const order = orders.find((o) => o.id === orderId);
    if (!order) return { success: false, message: 'Order not found' };

    if (order.deliveryPin && enteredPin.trim() !== order.deliveryPin.trim()) {
      return { success: false, message: `Invalid Delivery PIN! Customer's PIN is ${order.deliveryPin}` };
    }

    // Complete delivery & credit rider earnings
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'DELIVERED',
            completedAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );

    // Update rider stats
    setRiders((prev) =>
      prev.map((r) => {
        if (r.id === order.assignedRiderId) {
          return {
            ...r,
            completedDeliveries: r.completedDeliveries + 1,
            earningsTotal: r.earningsTotal + (order.deliveryProviderCost || 850),
            status: 'AVAILABLE',
            currentJobId: null,
          };
        }
        return r;
      })
    );

    // Update vendor settlement balance
    setVendors((prev) =>
      prev.map((v) => {
        if (v.id === order.vendorId) {
          return {
            ...v,
            settlementBalance: v.settlementBalance + (order.vendorSettlement || 0),
          };
        }
        return v;
      })
    );

    notify(
      'Order Delivered Successfully!',
      `Order ${orderId} confirmed via customer PIN. Funds settled to financial ledger.`,
      'success'
    );
    return { success: true };
  };

  // --- Market Errand Shopping Operations ---
  const updateMarketItemStatus = (taskId, itemIndex, completed, actualCost = null) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === taskId) {
          const nextItems = [...ord.items];
          nextItems[itemIndex] = {
            ...nextItems[itemIndex],
            completed,
            actualCost: actualCost !== null ? Number(actualCost) : nextItems[itemIndex].actualCost,
          };

          const allDone = nextItems.every((it) => it.completed);

          return {
            ...ord,
            items: nextItems,
            status: allDone ? 'READY_FOR_PICKUP' : 'PREPARING',
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
  };

  // --- Customer Rating & Feedback ---
  const rateOrder = (orderId, { shopRating, deliveryRating, comment }) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'COMPLETED',
            ratings: { shopRating, deliveryRating, comment, createdAt: new Date().toISOString() },
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    notify('Thank You!', 'Your rating and feedback have been recorded.', 'success');
  };

  // --- Product Management (Vendor & Admin) ---
  const updateProductStock = (productId, newStock) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId
          ? { ...p, stock: Number(newStock), isAvailable: Number(newStock) > 0 }
          : p
      )
    );
    notify('Stock Updated', `Product inventory updated to ${newStock} units.`, 'info');
  };

  const updateProductPrice = (productId, newPrice) => {
    setProducts((prev) =>
      prev.map((p) =>
        p.id === productId ? { ...p, price: Number(newPrice) } : p
      )
    );
    notify('Price Updated', `Product price updated to ₦${Number(newPrice).toLocaleString()}.`, 'info');
  };

  const addNewProduct = (productData) => {
    const newId = `prod-${Date.now()}`;
    const newProd = {
      id: newId,
      ...productData,
      isAvailable: Number(productData.stock) > 0,
    };
    setProducts((prev) => [newProd, ...prev]);
    notify('Product Added', `${productData.name} added to catalog.`, 'success');
  };

  // --- Admin Config & Financials ---
  const updateFeeConfig = (newConfig) => {
    setConfig(newConfig);
    notify('Settings Updated', 'Platform commission & fee tiers updated.', 'success');
  };

  const processAdminRefund = (orderId, amount, reason) => {
    setOrders((prev) =>
      prev.map((ord) => {
        if (ord.id === orderId) {
          return {
            ...ord,
            status: 'REFUNDED',
            refundAmount: amount || ord.totalAmountPaid,
            refundReason: reason || 'Customer dispute resolved by admin',
            updatedAt: new Date().toISOString(),
          };
        }
        return ord;
      })
    );
    notify('Refund Processed', `Order ${orderId} refunded: ₦${Number(amount).toLocaleString()}`, 'warning');
  };

  const resetAllDataToDefault = () => {
    localStorage.clear();
    setVendors(INITIAL_VENDORS);
    setRiders(INITIAL_RIDERS);
    setProducts(INITIAL_PRODUCTS);
    setOrders(INITIAL_ORDERS);
    setConfig(INITIAL_CONFIG);
    setCart([]);
    notify('Demo Reset', 'System reloaded with initial Nigerian grocery test data.', 'info');
  };

  return (
    <PlatformContext.Provider
      value={{
        // Role & Frame
        activeRole,
        setActiveRole,
        isMobileFrame,
        setIsMobileFrame,
        selectedLocation,
        setSelectedLocation,

        // Specific IDs
        selectedVendorId,
        setSelectedVendorId,
        selectedRiderId,
        setSelectedRiderId,

        // Entities
        vendors,
        riders,
        products,
        orders,
        config,

        // Cart
        cart,
        addToCart,
        updateCartQuantity,
        removeFromCart,
        clearCart,

        // Order flow
        createShopOrder,
        createMarketplaceTask,
        vendorAcceptOrder,
        vendorRejectOrder,
        vendorMarkOrderReady,
        vendorReportOutOfStock,

        // Rider flow
        riderAcceptJob,
        riderArrivedAtPickup,
        riderConfirmPickup,
        riderStartTransit,
        riderArrivedAtCustomer,
        riderConfirmDelivery,

        // Marketplace checklist
        updateMarketItemStatus,

        // Feedback & Stock
        rateOrder,
        updateProductStock,
        updateProductPrice,
        addNewProduct,

        // Admin & Config
        updateFeeConfig,
        processAdminRefund,
        resetAllDataToDefault,

        // Active customer order
        activeCustomerOrderId,
        setActiveCustomerOrderId,

        // Toasts
        toasts,
        notify,
      }}
    >
      {children}
    </PlatformContext.Provider>
  );
}

export function usePlatform() {
  const ctx = useContext(PlatformContext);
  if (!ctx) throw new Error('usePlatform must be used within PlatformProvider');
  return ctx;
}
