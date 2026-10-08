import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { formatNaira, calculateOrderTotals } from '../../utils/feeCalculator';
import PaystackModal from './PaystackModal';
import { MapPin, Phone, User, FileText, ArrowLeft, ShieldCheck, CheckCircle } from 'lucide-react';

export default function CheckoutModal({ isOpen, onClose, onOrderPlaced }) {
  const { cart, selectedLocation, config, createShopOrder } = usePlatform();

  // Customer Form
  const [name, setName] = useState('John Okafor');
  const [phone, setPhone] = useState('+234 803 999 8877');
  const [address, setAddress] = useState(`Apartment 4B, 14 Amazon Street, ${selectedLocation.name}`);
  const [instructions, setInstructions] = useState('Call me when you arrive at the gate.');
  const [showPaystack, setShowPaystack] = useState(false);

  if (!isOpen) return null;

  const productSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const financials = calculateOrderTotals(productSubtotal, null, config);

  const handleStartPayment = (e) => {
    e.preventDefault();
    if (!name || !phone || !address) {
      alert('Please fill in your delivery details.');
      return;
    }
    setShowPaystack(true);
  };

  const handlePaymentSuccess = (paymentResult) => {
    setShowPaystack(false);
    const newOrder = createShopOrder({
      customerName: name,
      customerPhone: phone,
      customerAddress: address,
      deliveryInstructions: instructions,
      paymentMethod: `Paystack (${paymentResult.channel.toUpperCase()})`,
      paymentReference: paymentResult.reference,
    });

    onClose();
    if (onOrderPlaced && newOrder) {
      onOrderPlaced(newOrder.id);
    }
  };

  return (
    <>
      <div className="modal-overlay">
        <div
          className="modal-content"
          style={{
            maxWidth: '500px',
            background: '#FFFFFF',
            borderRadius: '24px',
            overflow: 'hidden',
          }}
        >
          {/* Header */}
          <div
            style={{
              padding: '1.25rem 1.5rem',
              borderBottom: '1px solid #E2E8F0',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              background: '#F8FAFC',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <button
                onClick={onClose}
                style={{
                  background: 'transparent',
                  color: '#64748B',
                  display: 'flex',
                  alignItems: 'center',
                }}
              >
                <ArrowLeft size={18} />
              </button>
              <h3 style={{ fontSize: '1.15rem', fontWeight: 800, color: '#0F172A' }}>
                Checkout & Delivery
              </h3>
            </div>
            <span style={{ fontSize: '0.75rem', fontWeight: 700, color: '#008751', display: 'flex', alignItems: 'center', gap: '4px' }}>
              <ShieldCheck size={14} /> Encrypted
            </span>
          </div>

          <form onSubmit={handleStartPayment} style={{ padding: '1.4rem 1.5rem' }}>
            {/* Delivery Details Form */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.9rem', marginBottom: '1.25rem' }}>
              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <User size={13} /> FULL NAME
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <Phone size={13} /> NIGERIAN PHONE NUMBER
                </label>
                <input
                  type="tel"
                  required
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="+234 800 000 0000"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <MapPin size={13} /> DELIVERY ADDRESS
                </label>
                <textarea
                  rows={2}
                  required
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                    resize: 'none',
                  }}
                />
              </div>

              <div>
                <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '4px' }}>
                  <FileText size={13} /> RIDER INSTRUCTIONS (OPTIONAL)
                </label>
                <input
                  type="text"
                  value={instructions}
                  onChange={(e) => setInstructions(e.target.value)}
                  placeholder="e.g. Call when outside the estate gate"
                  style={{
                    width: '100%',
                    padding: '0.65rem 0.8rem',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.88rem',
                    color: '#0F172A',
                  }}
                />
              </div>
            </div>

            {/* Financial Breakdown Card (Spec Section 18) */}
            <div
              style={{
                background: '#F8FAFC',
                border: '1px solid #E2E8F0',
                borderRadius: '12px',
                padding: '1rem',
                marginBottom: '1.25rem',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>
                <span>Groceries Subtotal ({cart.length} items)</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.productSubtotal)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>
                <span>Customer Service Fee ({financials.serviceFeeLabel})</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.serviceFee)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>
                <span>Delivery Charge (Bolt / Fleet)</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.deliveryFee)}</span>
              </div>

              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.8rem', color: '#64748B', marginBottom: '4px' }}>
                <span>Payment Processing (Paystack)</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.paymentProcessingFee)}</span>
              </div>

              <div style={{ height: '1px', background: '#E2E8F0', margin: '8px 0' }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontWeight: 800, color: '#0F172A', fontSize: '0.92rem' }}>Grand Total Due</span>
                <span style={{ fontWeight: 900, color: '#008751', fontSize: '1.2rem' }}>
                  {formatNaira(financials.totalAmountPaid)}
                </span>
              </div>
            </div>

            {/* Pay Now Button */}
            <button
              type="submit"
              style={{
                width: '100%',
                padding: '0.9rem',
                background: '#008751',
                color: '#FFFFFF',
                borderRadius: '12px',
                fontWeight: 800,
                fontSize: '0.95rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 14px rgba(0, 135, 81, 0.4)',
              }}
            >
              <span>Pay with Paystack</span>
              <span style={{ fontSize: '0.82rem', opacity: 0.9 }}>
                ({formatNaira(financials.totalAmountPaid)})
              </span>
            </button>
          </form>
        </div>
      </div>

      {/* Paystack Gateway Modal */}
      <PaystackModal
        isOpen={showPaystack}
        onClose={() => setShowPaystack(false)}
        totalAmount={financials.totalAmountPaid}
        customerEmail="john.okafor@gmail.com"
        onPaymentSuccess={handlePaymentSuccess}
      />
    </>
  );
}
