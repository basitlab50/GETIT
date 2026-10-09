import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { formatNaira, calculateOrderTotals } from '../../utils/feeCalculator';
import { ShoppingBag, Trash2, Plus, Minus, ArrowRight, X, AlertCircle } from 'lucide-react';

export default function CartModal({ isOpen, onClose, onOpenCheckout }) {
  const { cart, updateCartQuantity, removeFromCart, clearCart, config, vendors } = usePlatform();

  if (!isOpen) return null;

  const currentVendorId = cart[0]?.product?.vendorId;
  const currentVendor = vendors.find((v) => v.id === currentVendorId);

  // Subtotal
  const productSubtotal = cart.reduce(
    (sum, item) => sum + item.product.price * item.quantity,
    0
  );

  const financials = calculateOrderTotals(productSubtotal, null, config);

  const handleClearAll = () => {
    if (cart.length === 0) return;
    if (window.confirm('Are you sure you want to remove all items from your basket?')) {
      clearCart();
    }
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          maxWidth: '480px',
          background: '#FFFFFF',
          borderRadius: '24px',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '85vh',
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
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '8px',
                background: 'rgba(0, 135, 81, 0.12)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#008751',
              }}
            >
              <ShoppingBag size={18} />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A' }}>
                Your Basket / Cart
              </h3>
              {currentVendor && (
                <p style={{ fontSize: '0.72rem', color: '#64748B' }}>
                  Ordering from: <strong>{currentVendor.name}</strong>
                </p>
              )}
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {cart.length > 0 && (
              <button
                onClick={handleClearAll}
                title="Remove all items from basket"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '4px',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  padding: '4px 10px',
                  borderRadius: '8px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  cursor: 'pointer',
                }}
              >
                <Trash2 size={12} />
                <span>Clear All</span>
              </button>
            )}
            <button
              onClick={onClose}
              style={{
                background: '#E2E8F0',
                borderRadius: '50%',
                width: '28px',
                height: '28px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#475569',
                cursor: 'pointer',
              }}
            >
              <X size={16} />
            </button>
          </div>
        </div>

        {/* Cart Items List */}
        <div style={{ flex: 1, overflowY: 'auto', padding: '1rem 1.5rem' }}>
          {cart.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
              <div style={{ fontSize: '2.5rem', marginBottom: '0.5rem' }}>🛒</div>
              <h4 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#0F172A' }}>Your Basket is Empty</h4>
              <p style={{ fontSize: '0.8rem', color: '#64748B', marginTop: '4px' }}>
                Search for groceries or explore nearby shops to add items.
              </p>
            </div>
          ) : (
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
              {cart.map((item) => (
                <div
                  key={item.productId}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    padding: '0.75rem',
                    background: '#F8FAFC',
                    borderRadius: '12px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <span style={{ fontSize: '1.6rem' }}>{item.product.imageUrl || '🛒'}</span>
                    <div>
                      <h5 style={{ fontSize: '0.85rem', fontWeight: 700, color: '#0F172A', lineHeight: 1.2 }}>
                        {item.product.name}
                      </h5>
                      <span style={{ fontSize: '0.75rem', color: '#008751', fontWeight: 700 }}>
                        {formatNaira(item.product.price)} each
                      </span>
                    </div>
                  </div>

                  {/* Quantity Stepper & Remove */}
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        background: '#FFFFFF',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        overflow: 'hidden',
                      }}
                    >
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity - 1)}
                        title="Decrease quantity"
                        style={{
                          padding: '4px 8px',
                          background: 'transparent',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        <Minus size={13} />
                      </button>
                      <span style={{ padding: '0 8px', fontSize: '0.85rem', fontWeight: 700, color: '#0F172A' }}>
                        {item.quantity}
                      </span>
                      <button
                        onClick={() => updateCartQuantity(item.productId, item.quantity + 1)}
                        title="Increase quantity"
                        style={{
                          padding: '4px 8px',
                          background: 'transparent',
                          color: '#475569',
                          cursor: 'pointer',
                        }}
                      >
                        <Plus size={13} />
                      </button>
                    </div>

                    <button
                      onClick={() => removeFromCart(item.productId)}
                      title="Remove this item from basket"
                      style={{
                        background: '#FEE2E2',
                        color: '#EF4444',
                        padding: '6px',
                        borderRadius: '6px',
                        border: '1px solid #FECACA',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        cursor: 'pointer',
                      }}
                    >
                      <Trash2 size={14} />
                    </button>
                  </div>
                </div>
              ))}

              <button
                onClick={handleClearAll}
                style={{
                  alignSelf: 'flex-start',
                  background: '#FEE2E2',
                  color: '#DC2626',
                  border: '1px solid #FECACA',
                  borderRadius: '8px',
                  padding: '6px 12px',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  marginTop: '0.2rem',
                  cursor: 'pointer',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '6px',
                }}
              >
                <Trash2 size={13} />
                <span>Remove all items from basket</span>
              </button>
            </div>
          )}
        </div>

        {/* Pricing Summary (Spec Section 14, 16, 17, 18) */}
        {cart.length > 0 && (
          <div
            style={{
              padding: '1.2rem 1.5rem',
              borderTop: '1px solid #E2E8F0',
              background: '#FFFFFF',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', fontSize: '0.82rem', color: '#475569' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Products Subtotal</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.productSubtotal)}</span>
              </div>

              {/* Tiered Customer Service Fee */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
                  Platform Service Fee
                  <span
                    style={{
                      background: '#E0F2FE',
                      color: '#0369A1',
                      fontSize: '0.68rem',
                      padding: '1px 5px',
                      borderRadius: '4px',
                      fontWeight: 700,
                    }}
                  >
                    {financials.serviceFeeLabel}
                  </span>
                </span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.serviceFee)}</span>
              </div>

              {/* Delivery Fee */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Delivery Charge</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.deliveryFee)}</span>
              </div>

              {/* Payment Processing Fee (Passed to Customer) */}
              <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                <span>Payment Processing Fee</span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>{formatNaira(financials.paymentProcessingFee)}</span>
              </div>

              <div
                style={{
                  height: '1px',
                  background: '#E2E8F0',
                  margin: '0.3rem 0',
                }}
              />

              {/* Total */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <div>
                  <span style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>Total Amount</span>
                  <p style={{ fontSize: '0.68rem', color: '#64748B' }}>No hidden charges. Verified on checkout.</p>
                </div>
                <span style={{ fontSize: '1.25rem', fontWeight: 900, color: '#008751' }}>
                  {formatNaira(financials.totalAmountPaid)}
                </span>
              </div>
            </div>

            {/* Checkout Action Button */}
            <button
              onClick={() => {
                onClose();
                onOpenCheckout();
              }}
              style={{
                width: '100%',
                marginTop: '1rem',
                padding: '0.9rem',
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
              <span>Proceed to Checkout</span>
              <ArrowRight size={16} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
