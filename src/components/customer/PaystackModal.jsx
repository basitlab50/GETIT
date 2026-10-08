import React, { useState } from 'react';
import { formatNaira } from '../../utils/feeCalculator';
import { CreditCard, Building2, Smartphone, ShieldCheck, CheckCircle2, Lock, X } from 'lucide-react';

export default function PaystackModal({
  isOpen,
  onClose,
  totalAmount,
  customerEmail = 'customer@getit.ng',
  onPaymentSuccess,
}) {
  const [activeChannel, setActiveChannel] = useState('card'); // 'card' | 'transfer' | 'ussd'
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentDone, setPaymentDone] = useState(false);

  // Card form state
  const [cardNumber, setCardNumber] = useState('5399 8320 1928 4721');
  const [cardExpiry, setCardExpiry] = useState('11/28');
  const [cardCvv, setCardCvv] = useState('781');

  if (!isOpen) return null;

  const handleSimulatePayment = () => {
    setIsProcessing(true);
    // Simulate real backend gateway roundtrip
    setTimeout(() => {
      setIsProcessing(false);
      setPaymentDone(true);
      setTimeout(() => {
        const reference = `PSTK_LIVE_${Math.floor(10000000 + Math.random() * 90000000)}`;
        onPaymentSuccess({
          reference,
          channel: activeChannel,
          amountPaid: totalAmount,
        });
        setPaymentDone(false);
        onClose();
      }, 1200);
    }, 1800);
  };

  return (
    <div className="modal-overlay">
      <div
        className="modal-content"
        style={{
          maxWidth: '460px',
          background: '#FFFFFF',
          borderRadius: '20px',
          overflow: 'hidden',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.4)',
        }}
      >
        {/* Paystack Official Styled Header */}
        <div
          style={{
            background: '#0B2238',
            color: '#FFFFFF',
            padding: '1.25rem 1.5rem',
            position: 'relative',
          }}
        >
          <button
            onClick={onClose}
            style={{
              position: 'absolute',
              top: '1rem',
              right: '1rem',
              background: 'rgba(255,255,255,0.15)',
              color: 'white',
              borderRadius: '50%',
              width: '28px',
              height: '28px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <X size={16} />
          </button>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '4px' }}>
            <div
              style={{
                width: '18px',
                height: '18px',
                background: '#00C3F9',
                borderRadius: '3px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0B2238',
                fontWeight: 900,
                fontSize: '11px',
              }}
            >
              P
            </div>
            <span style={{ fontSize: '0.85rem', fontWeight: 700, letterSpacing: '0.04em' }}>
              paystack <span style={{ color: '#00C3F9', fontSize: '0.72rem' }}>SECURED</span>
            </span>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end', marginTop: '0.6rem' }}>
            <div>
              <p style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Paying GETIT Delivery Nigeria</p>
              <h2 style={{ fontSize: '1.5rem', fontWeight: 800, color: '#FFFFFF', marginTop: '2px' }}>
                {formatNaira(totalAmount)}
              </h2>
            </div>
            <span style={{ fontSize: '0.72rem', color: '#6EE7B7', display: 'flex', alignItems: 'center', gap: '3px' }}>
              <Lock size={12} /> 256-bit SSL
            </span>
          </div>
        </div>

        {/* Payment Channels Navigation */}
        <div
          style={{
            display: 'flex',
            background: '#F8FAFC',
            borderBottom: '1px solid #E2E8F0',
          }}
        >
          <button
            onClick={() => setActiveChannel('card')}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              background: activeChannel === 'card' ? '#FFFFFF' : 'transparent',
              color: activeChannel === 'card' ? '#008751' : '#64748B',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderBottom: activeChannel === 'card' ? '3px solid #008751' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <CreditCard size={15} />
            Card
          </button>

          <button
            onClick={() => setActiveChannel('transfer')}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              background: activeChannel === 'transfer' ? '#FFFFFF' : 'transparent',
              color: activeChannel === 'transfer' ? '#008751' : '#64748B',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderBottom: activeChannel === 'transfer' ? '3px solid #008751' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Building2 size={15} />
            Bank Transfer
          </button>

          <button
            onClick={() => setActiveChannel('ussd')}
            style={{
              flex: 1,
              padding: '0.75rem 0.5rem',
              background: activeChannel === 'ussd' ? '#FFFFFF' : 'transparent',
              color: activeChannel === 'ussd' ? '#008751' : '#64748B',
              fontWeight: 700,
              fontSize: '0.78rem',
              borderBottom: activeChannel === 'ussd' ? '3px solid #008751' : 'none',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '6px',
            }}
          >
            <Smartphone size={15} />
            USSD
          </button>
        </div>

        {/* Content Body */}
        <div style={{ padding: '1.5rem', color: '#0F172A' }}>
          {paymentDone ? (
            <div style={{ textAlign: 'center', padding: '2rem 0' }}>
              <CheckCircle2 size={54} color="#10B981" style={{ margin: '0 auto 1rem' }} />
              <h3 style={{ fontSize: '1.2rem', fontWeight: 800, color: '#0F172A' }}>Payment Verified!</h3>
              <p style={{ fontSize: '0.85rem', color: '#64748B', marginTop: '0.4rem' }}>
                Transaction approved by Paystack engine. Generating order...
              </p>
            </div>
          ) : (
            <>
              {activeChannel === 'card' && (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  <div>
                    <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                      CARD NUMBER
                    </label>
                    <input
                      type="text"
                      value={cardNumber}
                      onChange={(e) => setCardNumber(e.target.value)}
                      placeholder="0000 0000 0000 0000"
                      style={{
                        width: '100%',
                        padding: '0.7rem 0.85rem',
                        border: '1px solid #CBD5E1',
                        borderRadius: '8px',
                        fontSize: '0.9rem',
                        letterSpacing: '0.05em',
                        color: '#0F172A',
                      }}
                    />
                  </div>

                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.8rem' }}>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        EXPIRY DATE
                      </label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={(e) => setCardExpiry(e.target.value)}
                        placeholder="MM/YY"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          color: '#0F172A',
                        }}
                      />
                    </div>
                    <div>
                      <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                        CVV
                      </label>
                      <input
                        type="password"
                        value={cardCvv}
                        maxLength={3}
                        onChange={(e) => setCardCvv(e.target.value)}
                        placeholder="123"
                        style={{
                          width: '100%',
                          padding: '0.7rem 0.85rem',
                          border: '1px solid #CBD5E1',
                          borderRadius: '8px',
                          fontSize: '0.9rem',
                          color: '#0F172A',
                        }}
                      />
                    </div>
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', fontSize: '0.75rem', color: '#64748B' }}>
                    <span>Accepts:</span>
                    <span style={{ fontWeight: 700, color: '#1E293B' }}>Verve • Mastercard • Visa</span>
                  </div>
                </div>
              )}

              {activeChannel === 'transfer' && (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>
                    Transfer exactly <strong>{formatNaira(totalAmount)}</strong> to this dedicated temporary Nigerian bank account:
                  </p>

                  <div
                    style={{
                      background: '#F1F5F9',
                      border: '1px dashed #94A3B8',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1rem',
                    }}
                  >
                    <p style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Bank Name
                    </p>
                    <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A', margin: '2px 0 8px' }}>
                      Wema Bank / Titan Paystack
                    </h4>

                    <p style={{ fontSize: '0.72rem', color: '#64748B', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                      Account Number
                    </p>
                    <h3 style={{ fontSize: '1.4rem', fontWeight: 800, color: '#008751', letterSpacing: '0.08em' }}>
                      9948 201 842
                    </h3>

                    <p style={{ fontSize: '0.72rem', color: '#64748B', marginTop: '6px' }}>
                      Account Name: <strong>GETIT Tech / {customerEmail}</strong>
                    </p>
                  </div>

                  <p style={{ fontSize: '0.75rem', color: '#059669', fontWeight: 600 }}>
                    ⚡ Automatically detected within 30 seconds of transfer
                  </p>
                </div>
              )}

              {activeChannel === 'ussd' && (
                <div style={{ textAlign: 'center', padding: '0.5rem 0' }}>
                  <p style={{ fontSize: '0.8rem', color: '#64748B', marginBottom: '1rem' }}>
                    Choose your bank to generate the instant USSD code:
                  </p>

                  <div
                    style={{
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '8px',
                      textAlign: 'left',
                      background: '#F8FAFC',
                      padding: '1rem',
                      borderRadius: '12px',
                      border: '1px solid #E2E8F0',
                    }}
                  >
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>GTBank (*737#)</span>
                      <code style={{ color: '#008751', fontWeight: 700 }}>*737*33*8842#</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', borderBottom: '1px solid #E2E8F0' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Access Bank (*901#)</span>
                      <code style={{ color: '#008751', fontWeight: 700 }}>*901*000*8842#</code>
                    </div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0' }}>
                      <span style={{ fontSize: '0.82rem', fontWeight: 700 }}>Zenith Bank (*966#)</span>
                      <code style={{ color: '#008751', fontWeight: 700 }}>*966*00*8842#</code>
                    </div>
                  </div>
                </div>
              )}

              {/* Pay Button */}
              <button
                disabled={isProcessing}
                onClick={handleSimulatePayment}
                style={{
                  width: '100%',
                  marginTop: '1.4rem',
                  padding: '0.9rem',
                  background: isProcessing ? '#94A3B8' : '#008751',
                  color: '#FFFFFF',
                  fontWeight: 800,
                  fontSize: '0.95rem',
                  borderRadius: '10px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 14px rgba(0, 135, 81, 0.4)',
                }}
              >
                {isProcessing ? (
                  <>
                    <div className="pulse-dot" style={{ background: '#FFFFFF' }} />
                    <span>Verifying with Paystack Backend...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck size={18} />
                    <span>
                      {activeChannel === 'transfer' ? 'I Have Made The Transfer' : `Pay ${formatNaira(totalAmount)}`}
                    </span>
                  </>
                )}
              </button>

              <div style={{ textAlign: 'center', marginTop: '0.75rem', fontSize: '0.7rem', color: '#94A3B8' }}>
                Secured by Paystack Payments Limited. PCI-DSS Level 1 Certified.
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
