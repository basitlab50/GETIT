import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { formatNaira } from '../../utils/feeCalculator';
import {
  Store,
  Bell,
  CheckCircle2,
  XCircle,
  Package,
  Clock,
  DollarSign,
  TrendingUp,
  AlertTriangle,
  Key,
  Plus,
  Edit2,
  Check,
  RefreshCw,
  Search
} from 'lucide-react';

export default function VendorPortal() {
  const {
    vendors,
    selectedVendorId,
    setSelectedVendorId,
    orders,
    products,
    vendorAcceptOrder,
    vendorRejectOrder,
    vendorMarkOrderReady,
    vendorReportOutOfStock,
    updateProductStock,
    updateProductPrice,
    addNewProduct,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState('orders'); // 'orders' | 'inventory' | 'finance'
  const [filterStatus, setFilterStatus] = useState('ALL');
  
  // New Product Modal State
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [newProdName, setNewProdName] = useState('');
  const [newProdCategory, setNewProdCategory] = useState('noodles');
  const [newProdPrice, setNewProdPrice] = useState('');
  const [newProdStock, setNewProdStock] = useState('50');
  const [newProdUnit, setNewProdUnit] = useState('1 pack');

  // Out of stock modal state
  const [stockModalOrder, setStockModalOrder] = useState(null);
  const [stockModalItem, setStockModalItem] = useState(null);
  const [stockAvailableQty, setStockAvailableQty] = useState(1);

  const currentVendor = vendors.find((v) => v.id === selectedVendorId) || vendors[0];

  // Orders for this vendor
  const vendorOrders = orders.filter((o) => o.vendorId === currentVendor.id);
  const vendorProducts = products.filter((p) => p.vendorId === currentVendor.id);

  // Status counts
  const newOrdersCount = vendorOrders.filter((o) => o.status === 'PAID').length;
  const preparingCount = vendorOrders.filter((o) => o.status === 'PREPARING').length;
  const readyCount = vendorOrders.filter((o) => o.status === 'READY_FOR_PICKUP').length;
  const completedCount = vendorOrders.filter((o) => ['DELIVERED', 'COMPLETED'].includes(o.status)).length;

  // Financial calculations (Spec Section 15 & 36)
  const totalGrossSales = vendorOrders
    .filter((o) => !['VENDOR_REJECTED', 'REFUNDED'].includes(o.status))
    .reduce((sum, o) => sum + (o.productSubtotal || 0), 0);

  const totalCommissionDeducted = vendorOrders
    .filter((o) => !['VENDOR_REJECTED', 'REFUNDED'].includes(o.status))
    .reduce((sum, o) => sum + (o.shopCommission || (o.productSubtotal * 0.07)), 0);

  const netSettlement = totalGrossSales - totalCommissionDeducted;

  const handleCreateProduct = (e) => {
    e.preventDefault();
    if (!newProdName || !newProdPrice) return;
    addNewProduct({
      name: newProdName,
      brand: 'Nigerian Grocery',
      category: newProdCategory,
      unit: newProdUnit,
      imageUrl: '📦',
      vendorId: currentVendor.id,
      vendorName: currentVendor.name,
      price: Number(newProdPrice),
      stock: Number(newProdStock),
      keywords: [newProdName.toLowerCase(), newProdCategory],
      description: 'Fresh quality provision item.',
    });
    setShowAddProduct(false);
    setNewProdName('');
    setNewProdPrice('');
  };

  const handleResolveOutOfStock = (e) => {
    e.preventDefault();
    if (!stockModalOrder || !stockModalItem) return;
    vendorReportOutOfStock(stockModalOrder.id, stockModalItem.productId, Number(stockAvailableQty));
    setStockModalOrder(null);
    setStockModalItem(null);
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1200px', margin: '0 auto', color: '#F8FAFC' }}>
      {/* Top Vendor Switcher Bar */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.7)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '18px',
          padding: '1rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '48px',
              height: '48px',
              borderRadius: '12px',
              background: '#008751',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.5rem',
            }}
          >
            {currentVendor.avatar || '🏪'}
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentVendor.name}</h2>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34D399',
                  fontWeight: 700,
                }}
              >
                OPEN FOR ORDERS
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
              {currentVendor.address} • Standard Commission: {currentVendor.commissionRate}%
            </p>
          </div>
        </div>

        {/* Switch Vendor Dropdown */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
          <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Simulate Store:</span>
          <select
            value={selectedVendorId}
            onChange={(e) => setSelectedVendorId(e.target.value)}
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid #334155',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            {vendors.map((v) => (
              <option key={v.id} value={v.id}>
                {v.name} ({v.category})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* KPI Cards (Spec Section 36) */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700 }}>
            <span>NEW ORDERS</span>
            <Bell size={16} color={newOrdersCount > 0 ? '#EF4444' : '#64748B'} />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: newOrdersCount > 0 ? '#F87171' : '#FFFFFF', margin: '4px 0' }}>
            {newOrdersCount}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Requires acceptance</span>
        </div>

        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700 }}>
            <span>PREPARING</span>
            <Clock size={16} color="#F59E0B" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#FBBF24', margin: '4px 0' }}>
            {preparingCount}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Being packed in store</span>
        </div>

        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700 }}>
            <span>READY FOR PICKUP</span>
            <Package size={16} color="#38BDF8" />
          </div>
          <h3 style={{ fontSize: '1.8rem', fontWeight: 900, color: '#38BDF8', margin: '4px 0' }}>
            {readyCount}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Rider en route to shop</span>
        </div>

        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '1.1rem' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700 }}>
            <span>NET SETTLEMENT (93%)</span>
            <DollarSign size={16} color="#34D399" />
          </div>
          <h3 style={{ fontSize: '1.6rem', fontWeight: 900, color: '#34D399', margin: '4px 0' }}>
            {formatNaira(netSettlement)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>
            Gross: {formatNaira(totalGrossSales)} (-7% fee)
          </span>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #334155',
          paddingBottom: '0.5rem',
          marginBottom: '1.5rem',
        }}
      >
        <button
          onClick={() => setActiveTab('orders')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            background: activeTab === 'orders' ? '#008751' : 'transparent',
            color: activeTab === 'orders' ? '#FFFFFF' : '#94A3B8',
          }}
        >
          Orders Management ({vendorOrders.length})
        </button>

        <button
          onClick={() => setActiveTab('inventory')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            background: activeTab === 'inventory' ? '#008751' : 'transparent',
            color: activeTab === 'inventory' ? '#FFFFFF' : '#94A3B8',
          }}
        >
          Product Catalog & Stock ({vendorProducts.length})
        </button>

        <button
          onClick={() => setActiveTab('finance')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            background: activeTab === 'finance' ? '#008751' : 'transparent',
            color: activeTab === 'finance' ? '#FFFFFF' : '#94A3B8',
          }}
        >
          Financial Settlements (7% Commission)
        </button>
      </div>

      {/* Orders Tab View */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800 }}>Incoming & Active Orders</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'PAID', 'PREPARING', 'READY_FOR_PICKUP', 'DELIVERED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setFilterStatus(st)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: filterStatus === st ? '#334155' : 'transparent',
                    color: filterStatus === st ? '#FFFFFF' : '#94A3B8',
                    border: '1px solid #334155',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          {vendorOrders.length === 0 ? (
            <div style={{ background: '#1E293B', padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
              <Package size={48} color="#64748B" style={{ margin: '0 auto 8px' }} />
              <h4>No orders for {currentVendor.name} yet</h4>
              <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
                Switch to Customer App to place an order from this shop.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {vendorOrders
                .filter((o) => filterStatus === 'ALL' || o.status === filterStatus)
                .map((order) => {
                  const isNewPaid = order.status === 'PAID';
                  const isPreparing = order.status === 'PREPARING';
                  const isReady = order.status === 'READY_FOR_PICKUP';

                  return (
                    <div
                      key={order.id}
                      style={{
                        background: '#1E293B',
                        borderRadius: '16px',
                        border: isNewPaid ? '2px solid #EF4444' : '1px solid #334155',
                        padding: '1.25rem',
                      }}
                    >
                      {/* Order Header */}
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.85rem' }}>
                        <div>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                            <h4 style={{ fontSize: '1.05rem', fontWeight: 800 }}>Order #{order.id}</h4>
                            <span
                              style={{
                                fontSize: '0.72rem',
                                padding: '2px 8px',
                                borderRadius: '10px',
                                background: isNewPaid ? '#EF4444' : isPreparing ? '#F59E0B' : '#008751',
                                color: 'white',
                                fontWeight: 800,
                              }}
                            >
                              {order.status}
                            </span>
                          </div>
                          <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                            Customer: <strong>{order.customerName}</strong> ({order.customerPhone}) • Destination: {order.customerAddress}
                          </p>
                          {order.deliveryInstructions && (
                            <p style={{ fontSize: '0.75rem', color: '#FCD34D', marginTop: '2px' }}>
                              Note: "{order.deliveryInstructions}"
                            </p>
                          )}
                        </div>

                        <div style={{ textAlign: 'right' }}>
                          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Order Value</span>
                          <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34D399' }}>
                            {formatNaira(order.productSubtotal)}
                          </h3>
                        </div>
                      </div>

                      {/* Item List with Out-Of-Stock trigger (Spec Section 32) */}
                      <div
                        style={{
                          background: '#0F172A',
                          borderRadius: '12px',
                          padding: '0.85rem 1rem',
                          marginBottom: '1rem',
                        }}
                      >
                        <span style={{ fontSize: '0.7rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                          PACKAGING CHECKLIST & INVENTORY
                        </span>

                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginTop: '6px' }}>
                          {order.items.map((item, idx) => (
                            <div
                              key={idx}
                              style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                fontSize: '0.85rem',
                                padding: '4px 0',
                                borderBottom: '1px solid rgba(255,255,255,0.05)',
                              }}
                            >
                              <div>
                                <span style={{ fontWeight: 800, color: '#F8FAFC' }}>
                                  {item.quantity}x {item.name}
                                </span>
                                {item.outOfStockAdjusted && (
                                  <span style={{ color: '#F59E0B', fontSize: '0.72rem', marginLeft: '6px' }}>
                                    (Adjusted from original shortage)
                                  </span>
                                )}
                              </div>

                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <span style={{ color: '#94A3B8', fontWeight: 600 }}>
                                  {formatNaira(item.total)}
                                </span>

                                {/* Out of stock button if preparing */}
                                {isPreparing && (
                                  <button
                                    onClick={() => {
                                      setStockModalOrder(order);
                                      setStockModalItem(item);
                                      setStockAvailableQty(Math.max(1, item.quantity - 1));
                                    }}
                                    style={{
                                      background: 'rgba(239, 68, 68, 0.2)',
                                      color: '#F87171',
                                      border: '1px solid rgba(239, 68, 68, 0.3)',
                                      padding: '2px 6px',
                                      borderRadius: '6px',
                                      fontSize: '0.68rem',
                                      fontWeight: 700,
                                    }}
                                    title="Report stock shortage for this item"
                                  >
                                    Shortage?
                                  </button>
                                )}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Pickup PIN Reveal Card (Spec Section 27) */}
                      {isReady && (
                        <div
                          style={{
                            background: 'rgba(56, 189, 248, 0.1)',
                            border: '1px solid #38BDF8',
                            borderRadius: '12px',
                            padding: '0.85rem',
                            marginBottom: '1rem',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                          }}
                        >
                          <div>
                            <span style={{ fontSize: '0.72rem', color: '#7DD3FC', fontWeight: 700 }}>
                              SECURITY PICKUP PIN
                            </span>
                            <p style={{ fontSize: '0.78rem', color: '#E0F2FE' }}>
                              Ask rider <strong>{order.assignedRiderName || 'Rider'}</strong> for this PIN before handing package:
                            </p>
                          </div>
                          <div
                            style={{
                              fontSize: '1.4rem',
                              fontWeight: 900,
                              letterSpacing: '0.12em',
                              color: '#FDE047',
                              background: '#0F172A',
                              padding: '4px 12px',
                              borderRadius: '8px',
                              border: '1px solid #38BDF8',
                            }}
                          >
                            {order.pickupPin}
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div style={{ display: 'flex', gap: '10px', justifyContent: 'flex-end' }}>
                        {isNewPaid && (
                          <>
                            <button
                              onClick={() => vendorRejectOrder(order.id, 'Item out of stock')}
                              style={{
                                padding: '8px 16px',
                                background: '#7F1D1D',
                                color: '#FCA5A5',
                                borderRadius: '8px',
                                fontSize: '0.82rem',
                                fontWeight: 700,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '4px',
                              }}
                            >
                              <XCircle size={15} /> Reject
                            </button>

                            <button
                              onClick={() => vendorAcceptOrder(order.id)}
                              style={{
                                padding: '8px 20px',
                                background: '#008751',
                                color: '#FFFFFF',
                                borderRadius: '8px',
                                fontSize: '0.85rem',
                                fontWeight: 800,
                                display: 'flex',
                                alignItems: 'center',
                                gap: '6px',
                              }}
                            >
                              <CheckCircle2 size={16} /> Accept Order
                            </button>
                          </>
                        )}

                        {isPreparing && (
                          <button
                            onClick={() => vendorMarkOrderReady(order.id)}
                            style={{
                              padding: '10px 22px',
                              background: '#008751',
                              color: '#FFFFFF',
                              borderRadius: '8px',
                              fontSize: '0.88rem',
                              fontWeight: 800,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '6px',
                              boxShadow: '0 4px 12px rgba(0, 135, 81, 0.4)',
                            }}
                          >
                            <Package size={16} /> Mark Packaged & Ready for Rider Pickup
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
            </div>
          )}
        </div>
      )}

      {/* Inventory & Product Catalog Tab */}
      {activeTab === 'inventory' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.25rem' }}>
            <div>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Product Catalog & Stock Controls</h3>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Manage live grocery prices and available stock inventory for {currentVendor.name}.
              </p>
            </div>

            <button
              onClick={() => setShowAddProduct(true)}
              style={{
                padding: '8px 16px',
                background: '#008751',
                color: '#FFFFFF',
                borderRadius: '8px',
                fontWeight: 800,
                fontSize: '0.82rem',
                display: 'flex',
                alignItems: 'center',
                gap: '6px',
              }}
            >
              <Plus size={16} /> Add New Product
            </button>
          </div>

          <div
            style={{
              background: '#1E293B',
              borderRadius: '16px',
              border: '1px solid #334155',
              overflow: 'hidden',
            }}
          >
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.82rem' }}>
              <thead>
                <tr style={{ background: '#0F172A', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '12px 16px' }}>PRODUCT</th>
                  <th style={{ padding: '12px 16px' }}>UNIT</th>
                  <th style={{ padding: '12px 16px' }}>PRICE (₦)</th>
                  <th style={{ padding: '12px 16px' }}>STOCK QTY</th>
                  <th style={{ padding: '12px 16px' }}>STATUS</th>
                  <th style={{ padding: '12px 16px', textAlign: 'right' }}>QUICK UPDATE</th>
                </tr>
              </thead>
              <tbody>
                {vendorProducts.map((prod) => (
                  <tr key={prod.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                    <td style={{ padding: '12px 16px' }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <span style={{ fontSize: '1.3rem' }}>{prod.imageUrl}</span>
                        <div>
                          <span style={{ fontWeight: 800, color: '#FFFFFF', display: 'block' }}>{prod.name}</span>
                          <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{prod.brand}</span>
                        </div>
                      </div>
                    </td>
                    <td style={{ padding: '12px 16px', color: '#CBD5E1' }}>{prod.unit}</td>
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="number"
                        defaultValue={prod.price}
                        onBlur={(e) => updateProductPrice(prod.id, e.target.value)}
                        style={{
                          width: '90px',
                          background: '#0F172A',
                          border: '1px solid #334155',
                          color: '#34D399',
                          fontWeight: 800,
                          padding: '4px 6px',
                          borderRadius: '6px',
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      <input
                        type="number"
                        defaultValue={prod.stock}
                        onBlur={(e) => updateProductStock(prod.id, e.target.value)}
                        style={{
                          width: '70px',
                          background: '#0F172A',
                          border: '1px solid #334155',
                          color: prod.stock > 5 ? '#FFFFFF' : '#F87171',
                          fontWeight: 800,
                          padding: '4px 6px',
                          borderRadius: '6px',
                        }}
                      />
                    </td>
                    <td style={{ padding: '12px 16px' }}>
                      {prod.stock > 0 ? (
                        <span style={{ color: '#34D399', fontWeight: 700 }}>In Stock</span>
                      ) : (
                        <span style={{ color: '#EF4444', fontWeight: 700 }}>Out of Stock</span>
                      )}
                    </td>
                    <td style={{ padding: '12px 16px', textAlign: 'right' }}>
                      <button
                        onClick={() => updateProductStock(prod.id, prod.stock > 0 ? 0 : 50)}
                        style={{
                          padding: '4px 8px',
                          borderRadius: '6px',
                          background: prod.stock > 0 ? '#7F1D1D' : '#065F46',
                          color: 'white',
                          fontSize: '0.72rem',
                          fontWeight: 700,
                        }}
                      >
                        {prod.stock > 0 ? 'Mark Out of Stock' : 'Restock (50)'}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Financial Settlements Tab (Spec Section 15, 36, 42) */}
      {activeTab === 'finance' && (
        <div>
          <div
            style={{
              background: '#1E293B',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #334155',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Vendor Sales & Commission Accounting
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
              Standard contract commission is <strong>7%</strong> on goods sold. Payout settlements are deposited directly into your verified Nigerian bank account.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '1rem' }}>
              <div style={{ background: '#0F172A', padding: '1rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Gross Merchandise Value</span>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#FFFFFF', marginTop: '2px' }}>
                  {formatNaira(totalGrossSales)}
                </h4>
              </div>

              <div style={{ background: '#0F172A', padding: '1rem', borderRadius: '12px' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Platform Commission (7%)</span>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#F87171', marginTop: '2px' }}>
                  -{formatNaira(totalCommissionDeducted)}
                </h4>
              </div>

              <div style={{ background: '#0F172A', padding: '1rem', borderRadius: '12px', border: '1px solid #008751' }}>
                <span style={{ fontSize: '0.72rem', color: '#34D399' }}>Available Net Settlement (93%)</span>
                <h4 style={{ fontSize: '1.4rem', fontWeight: 900, color: '#34D399', marginTop: '2px' }}>
                  {formatNaira(netSettlement)}
                </h4>
              </div>
            </div>
          </div>

          <div style={{ background: '#1E293B', borderRadius: '16px', padding: '1.25rem', border: '1px solid #334155' }}>
            <h4 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: '0.85rem' }}>
              Settlement Ledger History
            </h4>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {vendorOrders.map((ord) => (
                <div
                  key={ord.id}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '8px 12px',
                    background: '#0F172A',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 800, color: 'white' }}>{ord.id}</span>
                    <span style={{ color: '#64748B', marginLeft: '6px' }}>
                      ({ord.items.length} items sold)
                    </span>
                  </div>
                  <div style={{ display: 'flex', gap: '16px', alignItems: 'center' }}>
                    <span style={{ color: '#94A3B8' }}>Gross: {formatNaira(ord.productSubtotal)}</span>
                    <span style={{ color: '#F87171' }}>Comm (7%): -{formatNaira(ord.shopCommission || ord.productSubtotal * 0.07)}</span>
                    <span style={{ fontWeight: 800, color: '#34D399' }}>
                      Net: {formatNaira(ord.vendorSettlement || ord.productSubtotal * 0.93)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Out-Of-Stock Quantity Modal (Spec Section 32) */}
      {stockModalOrder && stockModalItem && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '1.5rem', background: '#1E293B', color: 'white' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#F87171', marginBottom: '0.5rem' }}>
              Handle Inventory Shortage
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#CBD5E1', marginBottom: '1rem' }}>
              Customer ordered <strong>{stockModalItem.quantity} units</strong> of <strong>{stockModalItem.name}</strong>, but physical stock is insufficient.
            </p>

            <form onSubmit={handleResolveOutOfStock}>
              <div style={{ marginBottom: '1rem' }}>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  AVAILABLE QUANTITY IN STORE
                </label>
                <input
                  type="number"
                  min={0}
                  max={stockModalItem.quantity - 1}
                  value={stockAvailableQty}
                  onChange={(e) => setStockAvailableQty(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#0F172A',
                    border: '1px solid #334155',
                    color: 'white',
                    fontSize: '1rem',
                    fontWeight: 800,
                  }}
                />
              </div>

              <p style={{ fontSize: '0.72rem', color: '#F59E0B', marginBottom: '1.25rem' }}>
                * The system will automatically remove the missing {stockModalItem.quantity - stockAvailableQty} units, recalculate order totals, and refund the difference to the customer.
              </p>

              <div style={{ display: 'flex', gap: '8px' }}>
                <button
                  type="button"
                  onClick={() => {
                    setStockModalOrder(null);
                    setStockModalItem(null);
                  }}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#334155',
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#008751',
                    color: 'white',
                    fontWeight: 800,
                  }}
                >
                  Adjust & Refund Diff
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Product Modal */}
      {showAddProduct && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '440px', padding: '1.5rem', background: '#1E293B', color: 'white' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem' }}>
              Add Product to {currentVendor.name}
            </h3>

            <form onSubmit={handleCreateProduct} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  PRODUCT NAME
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Dano Milk 400g"
                  value={newProdName}
                  onChange={(e) => setNewProdName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#0F172A',
                    border: '1px solid #334155',
                    color: 'white',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  CATEGORY
                </label>
                <select
                  value={newProdCategory}
                  onChange={(e) => setNewProdCategory(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#0F172A',
                    border: '1px solid #334155',
                    color: 'white',
                  }}
                >
                  <option value="noodles">Noodles & Pasta</option>
                  <option value="rice-grains">Rice & Grains</option>
                  <option value="beverages">Drinks & Beverages</option>
                  <option value="oil-spices">Cooking Oil & Spices</option>
                  <option value="dairy-milk">Milk & Dairy</option>
                  <option value="market-fresh">Market Fresh Produce</option>
                  <option value="snacks-bakery">Snacks & Bakery</option>
                </select>
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px' }}>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    PRICE (₦)
                  </label>
                  <input
                    type="number"
                    required
                    placeholder="1500"
                    value={newProdPrice}
                    onChange={(e) => setNewProdPrice(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      background: '#0F172A',
                      border: '1px solid #334155',
                      color: 'white',
                    }}
                  />
                </div>
                <div>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                    STOCK QTY
                  </label>
                  <input
                    type="number"
                    value={newProdStock}
                    onChange={(e) => setNewProdStock(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      borderRadius: '8px',
                      background: '#0F172A',
                      border: '1px solid #334155',
                      color: 'white',
                    }}
                  />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '8px', marginTop: '0.5rem' }}>
                <button
                  type="button"
                  onClick={() => setShowAddProduct(false)}
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#334155',
                    color: 'white',
                    fontWeight: 700,
                  }}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  style={{
                    flex: 1,
                    padding: '8px',
                    borderRadius: '8px',
                    background: '#008751',
                    color: 'white',
                    fontWeight: 800,
                  }}
                >
                  Save Product
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
