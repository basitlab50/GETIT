import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { formatNaira } from '../../utils/feeCalculator';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Package,
  Bike,
  Store,
  Users,
  Settings,
  AlertCircle,
  FileText,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Sliders,
  Eye,
  ArrowUpRight,
  Filter
} from 'lucide-react';

export default function AdminDashboard() {
  const {
    orders,
    vendors,
    riders,
    products,
    config,
    updateFeeConfig,
    processAdminRefund,
    resetAllDataToDefault,
  } = usePlatform();

  const [activeTab, setActiveTab] = useState('overview'); // 'overview' | 'orders' | 'delivery_engine' | 'finance' | 'settings'
  const [selectedInspectOrder, setSelectedInspectOrder] = useState(null);
  const [orderFilter, setOrderFilter] = useState('ALL');

  // Config form local state
  const [vendorCommRate, setVendorCommRate] = useState(config.standardShopCommissionRate ?? 7.0);
  const [deliveryBaseFee, setDeliveryBaseFee] = useState(config.delivery.baseCustomerFee ?? 1000);
  const [deliveryProviderCost, setDeliveryProviderCost] = useState(config.delivery.baseProviderPayout ?? 850);
  const [deliveryProviderType, setDeliveryProviderType] = useState(config.delivery.defaultProvider ?? 'HYBRID');

  // Overall Financial Calculations (Spec Section 42, 44, 45)
  const nonCancelledOrders = orders.filter((o) => !['VENDOR_REJECTED', 'REFUNDED'].includes(o.status));

  const totalGMV = nonCancelledOrders.reduce((sum, o) => sum + (o.productSubtotal || 0), 0);
  const totalCustomerServiceFees = nonCancelledOrders.reduce((sum, o) => sum + (o.serviceFee || 0), 0);
  const totalShopCommissions = nonCancelledOrders.reduce((sum, o) => sum + (o.shopCommission || (o.productSubtotal * 0.07)), 0);
  const totalDeliveryMargins = nonCancelledOrders.reduce((sum, o) => sum + (o.deliveryPlatformMargin || 150), 0);
  const totalPlatformGrossRevenue = totalCustomerServiceFees + totalShopCommissions + totalDeliveryMargins;
  const totalVendorSettlements = nonCancelledOrders.reduce((sum, o) => sum + (o.vendorSettlement || (o.productSubtotal * 0.93)), 0);

  const activeDeliveriesCount = orders.filter((o) =>
    ['PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED'].includes(o.status)
  ).length;

  const handleSaveSettings = (e) => {
    e.preventDefault();
    updateFeeConfig({
      ...config,
      standardShopCommissionRate: Number(vendorCommRate),
      delivery: {
        ...config.delivery,
        defaultProvider: deliveryProviderType,
        baseCustomerFee: Number(deliveryBaseFee),
        baseProviderPayout: Number(deliveryProviderCost),
        defaultPlatformMargin: Number(deliveryBaseFee) - Number(deliveryProviderCost),
      },
    });
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1280px', margin: '0 auto', color: '#F8FAFC' }}>
      {/* Admin Top Header */}
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div
              style={{
                width: '36px',
                height: '36px',
                borderRadius: '8px',
                background: '#0284C7',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: 'white',
              }}
            >
              <ShieldCheck size={20} />
            </div>
            <div>
              <h1 style={{ fontSize: '1.4rem', fontWeight: 900 }}>GETIT Operations Command Center</h1>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                Master Administration, Commission Ledger & Logistics Engine
              </p>
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', gap: '8px' }}>
          <button
            onClick={resetAllDataToDefault}
            style={{
              padding: '6px 12px',
              borderRadius: '8px',
              background: '#334155',
              color: 'white',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <RotateCcw size={13} /> Reset Mock State
          </button>
        </div>
      </div>

      {/* Admin Top Navigation Tabs */}
      <div
        style={{
          display: 'flex',
          gap: '8px',
          borderBottom: '1px solid #334155',
          paddingBottom: '0.5rem',
          marginBottom: '1.5rem',
          overflowX: 'auto',
        }}
      >
        <button
          onClick={() => setActiveTab('overview')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            background: activeTab === 'overview' ? '#008751' : 'transparent',
            color: activeTab === 'overview' ? '#FFFFFF' : '#94A3B8',
          }}
        >
          Executive Overview
        </button>

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
          Orders Control Room ({orders.length})
        </button>

        <button
          onClick={() => setActiveTab('delivery_engine')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            background: activeTab === 'delivery_engine' ? '#008751' : 'transparent',
            color: activeTab === 'delivery_engine' ? '#FFFFFF' : '#94A3B8',
          }}
        >
          Delivery Engine & Fleet
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
          Double-Entry Financial Ledger
        </button>

        <button
          onClick={() => setActiveTab('settings')}
          style={{
            padding: '8px 16px',
            borderRadius: '10px',
            fontSize: '0.85rem',
            fontWeight: 700,
            background: activeTab === 'settings' ? '#008751' : 'transparent',
            color: activeTab === 'settings' ? '#FFFFFF' : '#94A3B8',
          }}
        >
          Commission & Fee Tiers Settings
        </button>
      </div>

      {/* OVERVIEW TAB */}
      {activeTab === 'overview' && (
        <div>
          {/* Key KPI Metrics Cards (Spec Section 44) */}
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
              gap: '1rem',
              marginBottom: '1.5rem',
            }}
          >
            <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>GROSS MERCHANDISE VALUE</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FFFFFF', margin: '4px 0' }}>
                {formatNaira(totalGMV)}
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#34D399' }}>Across Nigerian stores & markets</span>
            </div>

            <div style={{ background: '#1E293B', border: '1px solid #008751', borderRadius: '16px', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#34D399', fontWeight: 800 }}>PLATFORM GROSS REVENUE</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34D399', margin: '4px 0' }}>
                {formatNaira(totalPlatformGrossRevenue)}
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Commissions + Fees + Delivery Margin</span>
            </div>

            <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>ACTIVE DELIVERIES</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38BDF8', margin: '4px 0' }}>
                {activeDeliveriesCount}
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>In transit or being packed</span>
            </div>

            <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '1.25rem' }}>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>PENDING VENDOR SETTLEMENTS</span>
              <h2 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FBBF24', margin: '4px 0' }}>
                {formatNaira(totalVendorSettlements)}
              </h2>
              <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>93% payable to shops</span>
            </div>
          </div>

          {/* Revenue Breakdown Tree (Spec Section 19 & 45) */}
          <div
            style={{
              background: '#1E293B',
              borderRadius: '16px',
              padding: '1.5rem',
              border: '1px solid #334155',
              marginBottom: '1.5rem',
            }}
          >
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Platform Revenue Architecture (Spec Breakdown)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
              Demonstrating the 3 primary revenue pillars specified in the master blueprint:
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '1rem' }}>
              {/* Pillar 1: Shop Commission */}
              <div style={{ background: '#0F172A', padding: '1.2rem', borderRadius: '12px', borderLeft: '4px solid #10B981' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>PILLAR 1</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '2px 0 6px' }}>Shop Commission (7%)</h4>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#34D399' }}>
                  {formatNaira(totalShopCommissions)}
                </div>
                <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                  Standard 7% withheld from gross vendor sales at settlement.
                </p>
              </div>

              {/* Pillar 2: Customer Service Fee */}
              <div style={{ background: '#0F172A', padding: '1.2rem', borderRadius: '12px', borderLeft: '4px solid #38BDF8' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>PILLAR 2</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '2px 0 6px' }}>Customer Service Fee (3.5% - 5%)</h4>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#38BDF8' }}>
                  {formatNaira(totalCustomerServiceFees)}
                </div>
                <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                  5% (&lt;₦30k), 4% (₦30k-₦50k), 3.5% (&gt;₦50k) uncapped.
                </p>
              </div>

              {/* Pillar 3: Delivery Margin */}
              <div style={{ background: '#0F172A', padding: '1.2rem', borderRadius: '12px', borderLeft: '4px solid #F59E0B' }}>
                <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>PILLAR 3</span>
                <h4 style={{ fontSize: '1rem', fontWeight: 800, margin: '2px 0 6px' }}>Delivery Platform Margin</h4>
                <div style={{ fontSize: '1.35rem', fontWeight: 900, color: '#FBBF24' }}>
                  {formatNaira(totalDeliveryMargins)}
                </div>
                <p style={{ fontSize: '0.72rem', color: '#94A3B8', marginTop: '4px' }}>
                  e.g. ₦1,000 paid by customer - ₦850 provider payout = ₦150 margin retained.
                </p>
              </div>
            </div>
          </div>

          {/* Quick Active Orders Preview */}
          <div style={{ background: '#1E293B', borderRadius: '16px', padding: '1.25rem', border: '1px solid #334155' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1rem', fontWeight: 800 }}>Recent Order Transactions</h3>
              <button
                onClick={() => setActiveTab('orders')}
                style={{ background: 'transparent', color: '#34D399', fontSize: '0.78rem', fontWeight: 700 }}
              >
                View All Orders →
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {orders.slice(0, 5).map((ord) => (
                <div
                  key={ord.id}
                  onClick={() => setSelectedInspectOrder(ord)}
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    padding: '10px 14px',
                    background: '#0F172A',
                    borderRadius: '10px',
                    cursor: 'pointer',
                    fontSize: '0.82rem',
                  }}
                >
                  <div>
                    <span style={{ fontWeight: 800, color: 'white' }}>{ord.id}</span>
                    <span style={{ color: '#94A3B8', marginLeft: '8px' }}>
                      {ord.customerName} • {ord.vendorName || ord.targetMarket}
                    </span>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
                    <span style={{ fontWeight: 800, color: '#34D399' }}>
                      {formatNaira(ord.totalAmountPaid)}
                    </span>
                    <span
                      style={{
                        padding: '2px 8px',
                        borderRadius: '6px',
                        fontSize: '0.7rem',
                        fontWeight: 800,
                        background: '#334155',
                        color: '#F8FAFC',
                      }}
                    >
                      {ord.status}
                    </span>
                    <Eye size={15} color="#94A3B8" />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ORDERS CONTROL ROOM TAB */}
      {activeTab === 'orders' && (
        <div>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800 }}>Full Orders & Tasks Register</h3>
            <div style={{ display: 'flex', gap: '6px' }}>
              {['ALL', 'PAID', 'PREPARING', 'READY_FOR_PICKUP', 'IN_TRANSIT', 'DELIVERED', 'REFUNDED'].map((st) => (
                <button
                  key={st}
                  onClick={() => setOrderFilter(st)}
                  style={{
                    padding: '4px 10px',
                    borderRadius: '8px',
                    fontSize: '0.72rem',
                    fontWeight: 700,
                    background: orderFilter === st ? '#334155' : 'transparent',
                    color: orderFilter === st ? '#FFFFFF' : '#94A3B8',
                    border: '1px solid #334155',
                  }}
                >
                  {st}
                </button>
              ))}
            </div>
          </div>

          <div style={{ background: '#1E293B', borderRadius: '16px', border: '1px solid #334155', overflow: 'hidden' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.8rem' }}>
              <thead>
                <tr style={{ background: '#0F172A', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                  <th style={{ padding: '12px 14px' }}>ORDER ID</th>
                  <th style={{ padding: '12px 14px' }}>CUSTOMER</th>
                  <th style={{ padding: '12px 14px' }}>VENDOR / MARKET</th>
                  <th style={{ padding: '12px 14px' }}>SUBTOTAL</th>
                  <th style={{ padding: '12px 14px' }}>TOTAL PAID</th>
                  <th style={{ padding: '12px 14px' }}>COMM (7%)</th>
                  <th style={{ padding: '12px 14px' }}>STATUS</th>
                  <th style={{ padding: '12px 14px', textAlign: 'right' }}>ACTION</th>
                </tr>
              </thead>
              <tbody>
                {orders
                  .filter((o) => orderFilter === 'ALL' || o.status === orderFilter)
                  .map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.06)' }}>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: 'white' }}>{ord.id}</td>
                      <td style={{ padding: '12px 14px' }}>{ord.customerName}</td>
                      <td style={{ padding: '12px 14px' }}>{ord.vendorName || ord.targetMarket}</td>
                      <td style={{ padding: '12px 14px' }}>{formatNaira(ord.productSubtotal)}</td>
                      <td style={{ padding: '12px 14px', fontWeight: 800, color: '#34D399' }}>
                        {formatNaira(ord.totalAmountPaid)}
                      </td>
                      <td style={{ padding: '12px 14px', color: '#F87171' }}>
                        {formatNaira(ord.shopCommission || ord.productSubtotal * 0.07)}
                      </td>
                      <td style={{ padding: '12px 14px' }}>
                        <span
                          style={{
                            padding: '3px 8px',
                            borderRadius: '6px',
                            fontSize: '0.68rem',
                            fontWeight: 800,
                            background: '#0F172A',
                            border: '1px solid #334155',
                            color: ord.status === 'DELIVERED' ? '#34D399' : '#FBBF24',
                          }}
                        >
                          {ord.status}
                        </span>
                      </td>
                      <td style={{ padding: '12px 14px', textAlign: 'right' }}>
                        <button
                          onClick={() => setSelectedInspectOrder(ord)}
                          style={{
                            padding: '4px 8px',
                            borderRadius: '6px',
                            background: '#0284C7',
                            color: 'white',
                            fontSize: '0.72rem',
                            fontWeight: 700,
                          }}
                        >
                          Inspect & Ledger
                        </button>
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* DELIVERY ENGINE HUB TAB (Spec Section 25 & 47) */}
      {activeTab === 'delivery_engine' && (
        <div>
          <div style={{ background: '#1E293B', borderRadius: '16px', padding: '1.5rem', border: '1px solid #334155', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Pluggable Delivery Engine Controls (Spec Architecture)
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
              The platform does not rely solely on one delivery provider. Orders are dynamically dispatched between third-party providers (Bolt) and company-owned riders.
            </p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1rem', marginBottom: '1.5rem' }}>
              {/* Provider 1: Bolt */}
              <div
                style={{
                  background: '#0F172A',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  border: deliveryProviderType === 'BOLT' ? '2px solid #38BDF8' : '1px solid #334155',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Bolt Delivery Integration</h4>
                  <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: '#0284C7', color: 'white', fontWeight: 700 }}>
                    API CONNECTED
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '6px 0 10px' }}>
                  External third-party courier dispatch via Bolt delivery API in Abuja and Lagos.
                </p>
                <button
                  onClick={() => setDeliveryProviderType('BOLT')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: deliveryProviderType === 'BOLT' ? '#38BDF8' : '#334155',
                    color: deliveryProviderType === 'BOLT' ? '#0F172A' : '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {deliveryProviderType === 'BOLT' ? 'Active Primary Provider' : 'Set as Primary'}
                </button>
              </div>

              {/* Provider 2: Company Fleet */}
              <div
                style={{
                  background: '#0F172A',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  border: deliveryProviderType === 'COMPANY_RIDER' ? '2px solid #10B981' : '1px solid #334155',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Company-Owned Fleet</h4>
                  <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: '#008751', color: 'white', fontWeight: 700 }}>
                    INTERNAL
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '6px 0 10px' }}>
                  Directly dispatched to verified company riders (e.g. Tunde Adeleke).
                </p>
                <button
                  onClick={() => setDeliveryProviderType('COMPANY_RIDER')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: deliveryProviderType === 'COMPANY_RIDER' ? '#10B981' : '#334155',
                    color: deliveryProviderType === 'COMPANY_RIDER' ? '#0F172A' : '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {deliveryProviderType === 'COMPANY_RIDER' ? 'Active Primary Provider' : 'Set as Primary'}
                </button>
              </div>

              {/* Provider 3: Hybrid */}
              <div
                style={{
                  background: '#0F172A',
                  padding: '1.2rem',
                  borderRadius: '12px',
                  border: deliveryProviderType === 'HYBRID' ? '2px solid #F59E0B' : '1px solid #334155',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Smart Hybrid Routing</h4>
                  <span style={{ fontSize: '0.68rem', padding: '2px 6px', borderRadius: '4px', background: '#D97706', color: 'white', fontWeight: 700 }}>
                    RECOMMENDED
                  </span>
                </div>
                <p style={{ fontSize: '0.75rem', color: '#94A3B8', margin: '6px 0 10px' }}>
                  Dispatches to company riders first; automatically fails over to Bolt if company riders are busy.
                </p>
                <button
                  onClick={() => setDeliveryProviderType('HYBRID')}
                  style={{
                    padding: '6px 12px',
                    borderRadius: '6px',
                    background: deliveryProviderType === 'HYBRID' ? '#F59E0B' : '#334155',
                    color: deliveryProviderType === 'HYBRID' ? '#0F172A' : '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 800,
                  }}
                >
                  {deliveryProviderType === 'HYBRID' ? 'Active Primary Mode' : 'Set Hybrid Mode'}
                </button>
              </div>
            </div>

            {/* Delivery Margin Config Form */}
            <form onSubmit={handleSaveSettings} style={{ background: '#0F172A', padding: '1.2rem', borderRadius: '12px', display: 'flex', alignItems: 'center', gap: '1rem', flexWrap: 'wrap' }}>
              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  CUSTOMER CHARGE (₦)
                </label>
                <input
                  type="number"
                  value={deliveryBaseFee}
                  onChange={(e) => setDeliveryBaseFee(e.target.value)}
                  style={{ background: '#1E293B', border: '1px solid #334155', color: 'white', padding: '6px 10px', borderRadius: '6px', width: '120px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#94A3B8', display: 'block', marginBottom: '4px' }}>
                  PROVIDER PAYOUT (₦)
                </label>
                <input
                  type="number"
                  value={deliveryProviderCost}
                  onChange={(e) => setDeliveryProviderCost(e.target.value)}
                  style={{ background: '#1E293B', border: '1px solid #334155', color: 'white', padding: '6px 10px', borderRadius: '6px', width: '120px' }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.72rem', color: '#34D399', display: 'block', marginBottom: '4px', fontWeight: 700 }}>
                  PLATFORM MARGIN (RETAINED)
                </label>
                <span style={{ fontSize: '1.1rem', fontWeight: 900, color: '#34D399' }}>
                  {formatNaira(Number(deliveryBaseFee) - Number(deliveryProviderCost))}
                </span>
              </div>

              <div style={{ marginLeft: 'auto' }}>
                <button
                  type="submit"
                  style={{ padding: '8px 16px', background: '#008751', color: 'white', borderRadius: '8px', fontWeight: 800, fontSize: '0.82rem' }}
                >
                  Save Delivery Rates
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOUBLE-ENTRY FINANCIAL LEDGER TAB (Spec Section 42 & 43) */}
      {activeTab === 'finance' && (
        <div>
          <div style={{ background: '#1E293B', borderRadius: '16px', padding: '1.5rem', border: '1px solid #334155', marginBottom: '1.5rem' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Master Financial Ledger & Revenue Allocations
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.25rem' }}>
              Every movement of money is strictly balanced according to Spec Section 42.
            </p>

            <div style={{ background: '#0F172A', borderRadius: '12px', overflow: 'hidden' }}>
              <table style={{ width: '100%', borderCollapse: 'collapse', textAlign: 'left', fontSize: '0.78rem' }}>
                <thead>
                  <tr style={{ background: '#090E17', color: '#94A3B8', borderBottom: '1px solid #334155' }}>
                    <th style={{ padding: '10px 12px' }}>ORDER #</th>
                    <th style={{ padding: '10px 12px' }}>CUSTOMER PAID</th>
                    <th style={{ padding: '10px 12px' }}>SHOP COMM (7%)</th>
                    <th style={{ padding: '10px 12px' }}>SERVICE FEE</th>
                    <th style={{ padding: '10px 12px' }}>DELIVERY MARGIN</th>
                    <th style={{ padding: '10px 12px' }}>VENDOR NET (93%)</th>
                    <th style={{ padding: '10px 12px' }}>RIDER PAYOUT</th>
                    <th style={{ padding: '10px 12px' }}>PLATFORM GROSS</th>
                  </tr>
                </thead>
                <tbody>
                  {orders.map((ord) => (
                    <tr key={ord.id} style={{ borderBottom: '1px solid rgba(255,255,255,0.05)' }}>
                      <td style={{ padding: '10px 12px', fontWeight: 800, color: 'white' }}>{ord.id}</td>
                      <td style={{ padding: '10px 12px', color: '#34D399', fontWeight: 800 }}>
                        {formatNaira(ord.totalAmountPaid)}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#F87171' }}>
                        {formatNaira(ord.shopCommission || ord.productSubtotal * 0.07)}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#38BDF8' }}>
                        {formatNaira(ord.serviceFee)}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#FBBF24' }}>
                        {formatNaira(ord.deliveryPlatformMargin || 150)}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#E2E8F0' }}>
                        {formatNaira(ord.vendorSettlement || ord.productSubtotal * 0.93)}
                      </td>
                      <td style={{ padding: '10px 12px', color: '#E2E8F0' }}>
                        {formatNaira(ord.deliveryProviderCost || 850)}
                      </td>
                      <td style={{ padding: '10px 12px', fontWeight: 900, color: '#10B981' }}>
                        {formatNaira(ord.platformGrossRevenue || 2550)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SETTINGS TAB (Spec Section 14, 15, 61) */}
      {activeTab === 'settings' && (
        <div>
          <div style={{ background: '#1E293B', borderRadius: '16px', padding: '1.5rem', border: '1px solid #334155' }}>
            <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '0.4rem' }}>
              Fee & Commission Configuration Engine
            </h3>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8', marginBottom: '1.5rem' }}>
              Configure the exact commercial commission rules from the master business blueprint.
            </p>

            <form onSubmit={handleSaveSettings} style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', maxWidth: '600px' }}>
              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', display: 'block', marginBottom: '6px' }}>
                  STANDARD SHOP COMMISSION RATE (%)
                </label>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <input
                    type="number"
                    step="0.1"
                    value={vendorCommRate}
                    onChange={(e) => setVendorCommRate(e.target.value)}
                    style={{
                      width: '120px',
                      padding: '8px 12px',
                      background: '#0F172A',
                      border: '1px solid #334155',
                      color: 'white',
                      borderRadius: '8px',
                      fontWeight: 800,
                    }}
                  />
                  <span style={{ fontSize: '0.85rem', color: '#94A3B8' }}>% of goods sold (Spec specifies 7%)</span>
                </div>
              </div>

              <div>
                <label style={{ fontSize: '0.82rem', fontWeight: 800, color: '#FFFFFF', display: 'block', marginBottom: '6px' }}>
                  CUSTOMER SERVICE FEE TIERS (SPEC SECTION 14)
                </label>
                <div style={{ background: '#0F172A', padding: '1rem', borderRadius: '12px', display: 'flex', flexDirection: 'column', gap: '8px', fontSize: '0.82rem' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Orders below ₦30,000</span>
                    <strong style={{ color: '#34D399' }}>5.0%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Orders from ₦30,000 to ₦50,000</span>
                    <strong style={{ color: '#38BDF8' }}>4.0%</strong>
                  </div>
                  <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span>Orders above ₦50,000</span>
                    <strong style={{ color: '#FBBF24' }}>3.5%</strong>
                  </div>
                  <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>* No maximum fee cap applied.</span>
                </div>
              </div>

              <button
                type="submit"
                style={{
                  alignSelf: 'flex-start',
                  padding: '10px 24px',
                  background: '#008751',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.88rem',
                }}
              >
                Save All Platform Settings
              </button>
            </form>
          </div>
        </div>
      )}

      {/* Order Inspector Modal */}
      {selectedInspectOrder && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '540px', padding: '1.5rem', background: '#1E293B', color: 'white' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800 }}>Inspect Order #{selectedInspectOrder.id}</h3>
              <button
                onClick={() => setSelectedInspectOrder(null)}
                style={{ background: 'transparent', color: '#94A3B8', fontSize: '1.2rem' }}
              >
                ✕
              </button>
            </div>

            <div style={{ background: '#0F172A', padding: '1rem', borderRadius: '12px', marginBottom: '1rem' }}>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Customer: <strong>{selectedInspectOrder.customerName}</strong> ({selectedInspectOrder.customerPhone})</p>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Destination: <strong>{selectedInspectOrder.customerAddress}</strong></p>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Vendor/Market: <strong>{selectedInspectOrder.vendorName || selectedInspectOrder.targetMarket}</strong></p>
              <p style={{ fontSize: '0.78rem', color: '#94A3B8' }}>Rider: <strong>{selectedInspectOrder.assignedRiderName || 'Unassigned'}</strong> ({selectedInspectOrder.deliveryProvider})</p>
              <div style={{ display: 'flex', gap: '12px', marginTop: '6px' }}>
                <span style={{ fontSize: '0.75rem', color: '#FDE047' }}>Pickup PIN: <strong>{selectedInspectOrder.pickupPin}</strong></span>
                <span style={{ fontSize: '0.75rem', color: '#6EE7B7' }}>Delivery PIN: <strong>{selectedInspectOrder.deliveryPin}</strong></span>
              </div>
            </div>

            {/* Financial Ledger Split */}
            <div style={{ background: '#0F172A', padding: '1rem', borderRadius: '12px', marginBottom: '1rem', fontSize: '0.8rem' }}>
              <h5 style={{ fontWeight: 800, marginBottom: '6px', color: '#38BDF8' }}>Financial Allocation Ledger:</h5>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0' }}>
                <span>Product Gross Value:</span>
                <span>{formatNaira(selectedInspectOrder.productSubtotal)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#F87171' }}>
                <span>Platform Shop Commission (7%):</span>
                <span>-{formatNaira(selectedInspectOrder.shopCommission || selectedInspectOrder.productSubtotal * 0.07)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#34D399' }}>
                <span>Vendor Net Settlement:</span>
                <span>{formatNaira(selectedInspectOrder.vendorSettlement || selectedInspectOrder.productSubtotal * 0.93)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#38BDF8' }}>
                <span>Customer Service Fee:</span>
                <span>+{formatNaira(selectedInspectOrder.serviceFee)}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '2px 0', color: '#FBBF24' }}>
                <span>Platform Delivery Margin:</span>
                <span>+{formatNaira(selectedInspectOrder.deliveryPlatformMargin || 150)}</span>
              </div>
              <div style={{ height: '1px', background: '#334155', margin: '4px 0' }} />
              <div style={{ display: 'flex', justifyContent: 'space-between', fontWeight: 900, color: '#10B981' }}>
                <span>Platform Gross Revenue on Order:</span>
                <span>{formatNaira(selectedInspectOrder.platformGrossRevenue || 2550)}</span>
              </div>
            </div>

            {/* Administrative Override Actions */}
            <div style={{ display: 'flex', gap: '8px' }}>
              <button
                onClick={() => {
                  processAdminRefund(selectedInspectOrder.id, selectedInspectOrder.totalAmountPaid, 'Admin processed full refund');
                  setSelectedInspectOrder(null);
                }}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#7F1D1D',
                  color: '#FCA5A5',
                  borderRadius: '8px',
                  fontWeight: 800,
                  fontSize: '0.8rem',
                }}
              >
                Trigger Refund
              </button>

              <button
                onClick={() => setSelectedInspectOrder(null)}
                style={{
                  flex: 1,
                  padding: '8px',
                  background: '#334155',
                  color: 'white',
                  borderRadius: '8px',
                  fontWeight: 700,
                  fontSize: '0.8rem',
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
