import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { MARKETPLACE_ITEMS_PRESETS } from '../../data/mockData';
import { formatNaira, calculateOrderTotals } from '../../utils/feeCalculator';
import PaystackModal from './PaystackModal';
import { ShoppingCart, Plus, Check, Trash2, MapPin, Sparkles, CheckCircle2, ShieldCheck, ArrowRight } from 'lucide-react';

export default function MarketplaceService({ onTaskCreated }) {
  const { createMarketplaceTask, selectedLocation } = usePlatform();

  // Selected market
  const [targetMarket, setTargetMarket] = useState('Utako Modern Market');
  
  // Market items list
  const [selectedItems, setSelectedItems] = useState([
    { name: 'Fresh Red Tomatoes', qty: '1 Big Basket (~12kg)', estimatedPrice: 9500 },
    { name: 'Dry Red Onions', qty: 'Half Bag', estimatedPrice: 8500 },
    { name: 'Ata Rodo Pepper', qty: '1 Big Bowl', estimatedPrice: 6000 },
    { name: 'Benue Big Yams', qty: '5 Large Tubers', estimatedPrice: 15000 },
  ]);

  // Custom Item Input Form
  const [customName, setCustomName] = useState('');
  const [customQty, setCustomQty] = useState('');
  const [customPrice, setCustomPrice] = useState('');

  // Checkout state
  const [customerName, setCustomerName] = useState('Amina Bello');
  const [customerPhone, setCustomerPhone] = useState('+234 810 444 3322');
  const [deliveryAddress, setDeliveryAddress] = useState(`House 12, 4th Avenue, Gwarinpa, ${selectedLocation.name}`);
  const [instructions, setInstructions] = useState('Call me when you are picking the yams so I can confirm the size.');
  const [showPaystack, setShowPaystack] = useState(false);

  // Financial calculations
  const estimatedSubtotal = selectedItems.reduce((sum, it) => sum + (Number(it.estimatedPrice) || 0), 0);
  const deliveryOverride = { customerFee: 1500, providerCost: 1200 };
  const financials = calculateOrderTotals(estimatedSubtotal, deliveryOverride);

  const handleAddPreset = (preset) => {
    const exists = selectedItems.find((it) => it.name === preset.name);
    if (exists) return;
    setSelectedItems((prev) => [
      ...prev,
      { name: preset.name, qty: preset.defaultQty, estimatedPrice: preset.estimatedPrice },
    ]);
  };

  const handleAddCustom = (e) => {
    e.preventDefault();
    if (!customName) return;
    setSelectedItems((prev) => [
      ...prev,
      {
        name: customName,
        qty: customQty || '1 measure',
        estimatedPrice: Number(customPrice) || 3000,
      },
    ]);
    setCustomName('');
    setCustomQty('');
    setCustomPrice('');
  };

  const handleRemoveItem = (index) => {
    setSelectedItems((prev) => prev.filter((_, i) => i !== index));
  };

  const handlePaystackSuccess = (result) => {
    setShowPaystack(false);
    const newTask = createMarketplaceTask({
      customerName,
      customerPhone,
      customerAddress: deliveryAddress,
      targetMarket,
      deliveryInstructions: instructions,
      marketItems: selectedItems,
    });

    if (onTaskCreated && newTask) {
      onTaskCreated(newTask.id);
    }
  };

  return (
    <div style={{ padding: '1rem', background: '#F8FAFC', minHeight: '100%' }}>
      {/* Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #065F46 50%, #047857 100%)',
          color: '#FFFFFF',
          padding: '1.25rem',
          borderRadius: '18px',
          marginBottom: '1.25rem',
          boxShadow: '0 8px 20px rgba(4, 120, 87, 0.25)',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginBottom: '4px' }}>
          <Sparkles size={16} color="#FBBF24" />
          <span style={{ fontSize: '0.72rem', fontWeight: 800, letterSpacing: '0.05em', color: '#6EE7B7' }}>
            MARKETPLACE SHOPPING SERVICE
          </span>
        </div>
        <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#FFFFFF', margin: '2px 0 6px' }}>
          Fresh Market Shopper & Errand
        </h2>
        <p style={{ fontSize: '0.78rem', color: '#D1FAE5', lineHeight: 1.4 }}>
          Want items directly from physical markets? Our dedicated market shopper collects your produce across stalls and delivers right to your door.
        </p>

        {/* Market Selector */}
        <div style={{ marginTop: '0.85rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <MapPin size={15} color="#FBBF24" />
          <span style={{ fontSize: '0.75rem', fontWeight: 600 }}>Target Market:</span>
          <select
            value={targetMarket}
            onChange={(e) => setTargetMarket(e.target.value)}
            style={{
              background: 'rgba(0, 0, 0, 0.25)',
              border: '1px solid rgba(255, 255, 255, 0.2)',
              color: 'white',
              padding: '4px 8px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
            }}
          >
            <option value="Utako Modern Market">Utako Modern Market (Abuja)</option>
            <option value="Wuse Main Market">Wuse Main Market (Abuja)</option>
            <option value="Garki International Market">Garki Market (Abuja)</option>
            <option value="Mile 12 Produce Market">Mile 12 Market (Lagos)</option>
            <option value="Bodija Foodstuff Market">Bodija Market (Ibadan)</option>
          </select>
        </div>
      </div>

      {/* Preset Produce Quick Add Chips */}
      <div style={{ marginBottom: '1.25rem' }}>
        <h4 style={{ fontSize: '0.85rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem' }}>
          Quick Add Popular Market Produce
        </h4>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
          {MARKETPLACE_ITEMS_PRESETS.map((preset) => {
            const isAdded = selectedItems.some((it) => it.name === preset.name);
            return (
              <button
                key={preset.id}
                onClick={() => handleAddPreset(preset)}
                style={{
                  padding: '5px 10px',
                  borderRadius: '20px',
                  fontSize: '0.74rem',
                  fontWeight: 600,
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: isAdded ? '#D1FAE5' : '#FFFFFF',
                  color: isAdded ? '#065F46' : '#1E293B',
                  border: isAdded ? '1px solid #10B981' : '1px solid #E2E8F0',
                }}
              >
                <span>{preset.icon}</span>
                <span>{preset.name}</span>
                {isAdded ? <Check size={12} color="#059669" /> : <Plus size={12} color="#64748B" />}
              </button>
            );
          })}
        </div>
      </div>

      {/* Your Market Errand List */}
      <div
        style={{
          background: '#FFFFFF',
          borderRadius: '16px',
          padding: '1.1rem',
          border: '1px solid #E2E8F0',
          marginBottom: '1.25rem',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
          <h4 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
            Shopping Task List ({selectedItems.length} items)
          </h4>
          <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Shopper will check off each item</span>
        </div>

        {selectedItems.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: '#94A3B8', textAlign: 'center', padding: '1rem 0' }}>
            No items in market list. Click the produce buttons above or add custom items below.
          </p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {selectedItems.map((item, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '8px 12px',
                  background: '#F8FAFC',
                  borderRadius: '10px',
                  border: '1px solid #E2E8F0',
                }}
              >
                <div>
                  <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>{item.name}</h5>
                  <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Qty: {item.qty}</span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#008751' }}>
                    ~{formatNaira(item.estimatedPrice)}
                  </span>
                  <button
                    onClick={() => handleRemoveItem(idx)}
                    style={{
                      background: 'transparent',
                      color: '#EF4444',
                      padding: '4px',
                    }}
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Add Custom Item Form */}
        <form onSubmit={handleAddCustom} style={{ marginTop: '1rem', display: 'flex', gap: '6px' }}>
          <input
            type="text"
            placeholder="Custom item (e.g. Catfish, Egusi)"
            value={customName}
            onChange={(e) => setCustomName(e.target.value)}
            style={{
              flex: 2,
              padding: '6px 10px',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#0F172A',
            }}
          />
          <input
            type="text"
            placeholder="Qty"
            value={customQty}
            onChange={(e) => setCustomQty(e.target.value)}
            style={{
              flex: 1,
              padding: '6px 10px',
              border: '1px solid #CBD5E1',
              borderRadius: '8px',
              fontSize: '0.78rem',
              color: '#0F172A',
            }}
          />
          <button
            type="submit"
            style={{
              background: '#008751',
              color: '#FFFFFF',
              padding: '6px 12px',
              borderRadius: '8px',
              fontSize: '0.78rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '4px',
            }}
          >
            <Plus size={14} /> Add
          </button>
        </form>
      </div>

      {/* Pricing Estimate Card */}
      {selectedItems.length > 0 && (
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.1rem',
            border: '1px solid #E2E8F0',
            marginBottom: '1.25rem',
          }}
        >
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.6rem' }}>
            Errand Cost Estimation
          </h4>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.8rem', color: '#64748B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Estimated Produce Cost</span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.productSubtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Platform Service Fee ({financials.serviceFeeLabel})</span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.serviceFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Market Shopper & Delivery</span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.deliveryFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Paystack Processing Fee</span>
              <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.paymentProcessingFee)}</span>
            </div>
            <div style={{ height: '1px', background: '#E2E8F0', margin: '6px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>Total Deposit</span>
              <span style={{ fontWeight: 900, color: '#008751', fontSize: '1.15rem' }}>
                {formatNaira(financials.totalAmountPaid)}
              </span>
            </div>
            <p style={{ fontSize: '0.68rem', color: '#94A3B8', marginTop: '4px' }}>
              * If actual market receipt total is lower, the exact difference is refunded to your wallet.
            </p>
          </div>

          <button
            onClick={() => setShowPaystack(true)}
            style={{
              width: '100%',
              marginTop: '1rem',
              padding: '0.85rem',
              background: '#008751',
              color: '#FFFFFF',
              borderRadius: '12px',
              fontWeight: 800,
              fontSize: '0.92rem',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              boxShadow: '0 4px 14px rgba(0, 135, 81, 0.4)',
            }}
          >
            <span>Dispatch Market Shopper</span>
            <ArrowRight size={16} />
          </button>
        </div>
      )}

      {/* Paystack Payment Modal */}
      <PaystackModal
        isOpen={showPaystack}
        onClose={() => setShowPaystack(false)}
        totalAmount={financials.totalAmountPaid}
        customerEmail="amina.bello@gmail.com"
        onPaymentSuccess={handlePaystackSuccess}
      />
    </div>
  );
}
