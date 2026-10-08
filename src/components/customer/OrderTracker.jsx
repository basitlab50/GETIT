import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { formatNaira } from '../../utils/feeCalculator';
import {
  CheckCircle2,
  Clock,
  Bike,
  Store,
  MapPin,
  Phone,
  ShieldCheck,
  Star,
  AlertCircle,
  Key,
  ChevronRight,
  HelpCircle,
  ArrowLeft
} from 'lucide-react';

const ORDER_STEPS = [
  { key: 'PAID', label: 'Order Paid', desc: 'Payment verified via Paystack' },
  { key: 'PREPARING', label: 'Shop Preparing', desc: 'Shop has accepted & packaging items' },
  { key: 'READY_FOR_PICKUP', label: 'Ready for Pickup', desc: 'Awaiting rider arrival at shop' },
  { key: 'PICKED_UP', label: 'Package Picked Up', desc: 'Rider confirmed Pickup PIN with shop' },
  { key: 'IN_TRANSIT', label: 'On The Way', desc: 'Rider is driving to your delivery address' },
  { key: 'ARRIVED', label: 'Rider Arrived', desc: 'Meet rider and share your Delivery PIN' },
  { key: 'DELIVERED', label: 'Order Delivered', desc: 'Package handed over and completed' },
];

function getStepIndex(status) {
  switch (status) {
    case 'PAID': return 0;
    case 'SENT_TO_VENDOR': return 0;
    case 'VENDOR_ACCEPTED': return 1;
    case 'PREPARING': return 1;
    case 'READY_FOR_PICKUP': return 2;
    case 'DELIVERY_REQUESTED': return 2;
    case 'RIDER_ASSIGNED': return 2;
    case 'RIDER_AT_PICKUP': return 2;
    case 'PICKED_UP': return 3;
    case 'IN_TRANSIT': return 4;
    case 'ARRIVED': return 5;
    case 'DELIVERED':
    case 'COMPLETED': return 6;
    default: return 0;
  }
}

export default function OrderTracker({ orderId, onBack }) {
  const { orders, rateOrder, riders } = usePlatform();
  const order = orders.find((o) => o.id === orderId) || orders[0];

  // Rating State
  const [shopRating, setShopRating] = useState(5);
  const [deliveryRating, setDeliveryRating] = useState(5);
  const [feedbackComment, setFeedbackComment] = useState('');
  const [hasRated, setHasRated] = useState(!!order?.ratings);

  // Issue Reporting Modal State
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueType, setIssueType] = useState('Missing Item');
  const [issueNote, setIssueNote] = useState('');
  const [issueSent, setIssueSent] = useState(false);

  if (!order) {
    return (
      <div style={{ padding: '2rem 1rem', textAlign: 'center' }}>
        <p style={{ color: '#64748B' }}>No active order found.</p>
        <button onClick={onBack} style={{ marginTop: '1rem', padding: '8px 16px', background: '#008751', color: 'white', borderRadius: '8px' }}>
          Back to Home
        </button>
      </div>
    );
  }

  const currentStep = getStepIndex(order.status);
  const isDelivered = ['DELIVERED', 'COMPLETED'].includes(order.status);
  const assignedRider = riders.find((r) => r.id === order.assignedRiderId);

  const handleSubmitRating = (e) => {
    e.preventDefault();
    rateOrder(order.id, { shopRating, deliveryRating, comment: feedbackComment });
    setHasRated(true);
  };

  const handleReportIssue = (e) => {
    e.preventDefault();
    setIssueSent(true);
    setTimeout(() => {
      setShowIssueModal(false);
      setIssueSent(false);
    }, 1800);
  };

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100%', paddingBottom: '3rem' }}>
      {/* Tracker Top Bar */}
      <div
        style={{
          background: '#FFFFFF',
          padding: '1rem 1.25rem',
          borderBottom: '1px solid #E2E8F0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'transparent',
            color: '#475569',
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
            fontSize: '0.82rem',
            fontWeight: 700,
          }}
        >
          <ArrowLeft size={16} /> Back
        </button>

        <div style={{ textAlign: 'center' }}>
          <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
            Tracking {order.id}
          </h3>
          <span style={{ fontSize: '0.68rem', color: '#64748B' }}>
            {order.type === 'MARKET_TASK' ? 'Market Errand Task' : 'Grocery Delivery'}
          </span>
        </div>

        <button
          onClick={() => setShowIssueModal(true)}
          style={{
            background: '#F1F5F9',
            border: 'none',
            color: '#64748B',
            padding: '5px 8px',
            borderRadius: '6px',
            fontSize: '0.72rem',
            fontWeight: 700,
            display: 'flex',
            alignItems: 'center',
            gap: '3px',
          }}
        >
          <HelpCircle size={13} /> Support
        </button>
      </div>

      <div style={{ padding: '1rem' }}>
        {/* Verification PINs Security Card (Spec Section 27 & 29) */}
        <div
          style={{
            background: 'linear-gradient(135deg, #064E3B 0%, #065F46 100%)',
            color: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.15rem',
            marginBottom: '1rem',
            boxShadow: '0 8px 20px rgba(0, 135, 81, 0.25)',
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.6rem' }}>
            <span style={{ fontSize: '0.72rem', fontWeight: 700, letterSpacing: '0.04em', color: '#6EE7B7' }}>
              SECURITY VERIFICATION CODES
            </span>
            <span style={{ fontSize: '0.7rem', display: 'flex', alignItems: 'center', gap: '3px', color: '#A7F3D0' }}>
              <ShieldCheck size={12} /> Double-PIN Protocol
            </span>
          </div>

          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '10px' }}>
            {/* Shop Pickup PIN */}
            <div
              style={{
                background: 'rgba(0,0,0,0.22)',
                borderRadius: '12px',
                padding: '0.65rem 0.8rem',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div style={{ fontSize: '0.68rem', color: '#CBD5E1', marginBottom: '2px' }}>
                Shop Pickup PIN
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.12em', color: '#FDE047' }}>
                {order.pickupPin}
              </div>
              <span style={{ fontSize: '0.62rem', color: '#94A3B8' }}>
                {currentStep >= 3 ? '✓ Verified at Shop' : 'Shop verifies with rider'}
              </span>
            </div>

            {/* Customer Drop-off Delivery PIN */}
            <div
              style={{
                background: 'rgba(0,0,0,0.22)',
                borderRadius: '12px',
                padding: '0.65rem 0.8rem',
                border: '1px solid rgba(255,255,255,0.15)',
              }}
            >
              <div style={{ fontSize: '0.68rem', color: '#CBD5E1', marginBottom: '2px' }}>
                Your Delivery PIN
              </div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, letterSpacing: '0.12em', color: '#6EE7B7' }}>
                {order.deliveryPin}
              </div>
              <span style={{ fontSize: '0.62rem', color: '#94A3B8' }}>
                {isDelivered ? '✓ Confirmed Delivered' : 'Give to rider upon arrival'}
              </span>
            </div>
          </div>
        </div>

        {/* Assigned Rider Contact Card */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1rem',
            border: '1px solid #E2E8F0',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div
              style={{
                width: '44px',
                height: '44px',
                borderRadius: '50%',
                background: '#E0F2FE',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                color: '#0284C7',
              }}
            >
              <Bike size={22} />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A' }}>
                  {order.assignedRiderName || 'Dispatching Rider...'}
                </h4>
                <span
                  style={{
                    fontSize: '0.62rem',
                    background: '#DCFCE7',
                    color: '#15803D',
                    padding: '1px 5px',
                    borderRadius: '4px',
                    fontWeight: 700,
                  }}
                >
                  {order.deliveryProvider || 'GETIT Rider'}
                </span>
              </div>
              <p style={{ fontSize: '0.72rem', color: '#64748B' }}>
                {assignedRider?.vehicle || 'Dispatched via Delivery Engine'}
              </p>
            </div>
          </div>

          <a
            href="tel:+2348091234567"
            style={{
              width: '36px',
              height: '36px',
              borderRadius: '50%',
              background: '#008751',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              textDecoration: 'none',
              boxShadow: '0 2px 6px rgba(0, 135, 81, 0.3)',
            }}
          >
            <Phone size={15} />
          </a>
        </div>

        {/* 7-Step Progress Timeline (Spec Section 28 & 31) */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.25rem 1rem',
            border: '1px solid #E2E8F0',
            marginBottom: '1rem',
          }}
        >
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '1rem' }}>
            Live Delivery Progress
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem', position: 'relative' }}>
            {ORDER_STEPS.map((step, idx) => {
              const isPast = idx < currentStep;
              const isCurrent = idx === currentStep;
              const isPending = idx > currentStep;

              return (
                <div key={step.key} style={{ display: 'flex', gap: '12px', alignItems: 'flex-start' }}>
                  {/* Step Dot */}
                  <div
                    style={{
                      width: '24px',
                      height: '24px',
                      borderRadius: '50%',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      background: isPast ? '#008751' : isCurrent ? '#F59E0B' : '#E2E8F0',
                      color: isPast || isCurrent ? '#FFFFFF' : '#94A3B8',
                      fontSize: '0.72rem',
                      fontWeight: 800,
                      flexShrink: 0,
                      boxShadow: isCurrent ? '0 0 10px rgba(245, 158, 11, 0.6)' : 'none',
                    }}
                  >
                    {isPast ? <CheckCircle2 size={14} /> : idx + 1}
                  </div>

                  {/* Step Content */}
                  <div style={{ flex: 1 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span
                        style={{
                          fontSize: '0.85rem',
                          fontWeight: isCurrent ? 800 : 700,
                          color: isCurrent ? '#0F172A' : isPast ? '#1E293B' : '#94A3B8',
                        }}
                      >
                        {step.label}
                      </span>
                      {isCurrent && (
                        <span
                          style={{
                            fontSize: '0.62rem',
                            background: '#FEF3C7',
                            color: '#92400E',
                            padding: '1px 5px',
                            borderRadius: '4px',
                            fontWeight: 800,
                          }}
                        >
                          ACTIVE
                        </span>
                      )}
                    </div>
                    <p style={{ fontSize: '0.72rem', color: isPending ? '#94A3B8' : '#64748B', marginTop: '1px' }}>
                      {step.desc}
                    </p>
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Order Items & Breakdown */}
        <div
          style={{
            background: '#FFFFFF',
            borderRadius: '16px',
            padding: '1.1rem',
            border: '1px solid #E2E8F0',
            marginBottom: '1rem',
          }}
        >
          <h4 style={{ fontSize: '0.9rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.75rem' }}>
            Order Items & Receipt
          </h4>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginBottom: '0.85rem' }}>
            {order.items.map((it, idx) => (
              <div
                key={idx}
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  fontSize: '0.8rem',
                  padding: '4px 0',
                  borderBottom: '1px dashed #F1F5F9',
                }}
              >
                <span style={{ color: '#1E293B' }}>
                  {it.quantity ? `${it.quantity}x ` : `${it.qty || '1x'} `}
                  {it.name}
                  {it.outOfStockAdjusted && (
                    <span style={{ color: '#D97706', fontSize: '0.68rem', marginLeft: '4px' }}>
                      (Stock Adjusted)
                    </span>
                  )}
                </span>
                <span style={{ fontWeight: 700, color: '#0F172A' }}>
                  {formatNaira(it.total || it.estimatedPrice)}
                </span>
              </div>
            ))}
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: '3px', fontSize: '0.76rem', color: '#64748B' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Subtotal</span>
              <span style={{ fontWeight: 700 }}>{formatNaira(order.productSubtotal)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Customer Service Fee ({order.serviceFeeLabel || '5%'})</span>
              <span style={{ fontWeight: 700 }}>{formatNaira(order.serviceFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Delivery Charge</span>
              <span style={{ fontWeight: 700 }}>{formatNaira(order.deliveryFee)}</span>
            </div>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span>Paystack Processing Fee</span>
              <span style={{ fontWeight: 700 }}>{formatNaira(order.paymentProcessingFee)}</span>
            </div>
            <div style={{ height: '1px', background: '#E2E8F0', margin: '4px 0' }} />
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.88rem' }}>
              <span style={{ fontWeight: 800, color: '#0F172A' }}>Total Paid</span>
              <span style={{ fontWeight: 900, color: '#008751' }}>{formatNaira(order.totalAmountPaid)}</span>
            </div>
          </div>
        </div>

        {/* Rating Widget (Spec Section 30) */}
        {isDelivered && (
          <div
            style={{
              background: '#FFFFFF',
              borderRadius: '16px',
              padding: '1.25rem',
              border: '1px solid #E2E8F0',
              textAlign: 'center',
            }}
          >
            <div style={{ fontSize: '2rem', marginBottom: '4px' }}>🎉</div>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>Order Delivered!</h4>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1rem' }}>
              Please rate your experience with the shop and delivery rider:
            </p>

            {hasRated ? (
              <div
                style={{
                  background: '#DCFCE7',
                  color: '#166534',
                  padding: '0.8rem',
                  borderRadius: '10px',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                }}
              >
                ✓ Thank you! Your ratings have been submitted.
              </div>
            ) : (
              <form onSubmit={handleSubmitRating}>
                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    RATE SHOP ({order.vendorName || 'Shop'})
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setShopRating(s)}
                        style={{ background: 'transparent', padding: '2px' }}
                      >
                        <Star
                          size={24}
                          fill={s <= shopRating ? '#F59E0B' : 'transparent'}
                          color={s <= shopRating ? '#F59E0B' : '#CBD5E1'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.75rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    RATE DELIVERY RIDER
                  </label>
                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                    {[1, 2, 3, 4, 5].map((s) => (
                      <button
                        type="button"
                        key={s}
                        onClick={() => setDeliveryRating(s)}
                        style={{ background: 'transparent', padding: '2px' }}
                      >
                        <Star
                          size={24}
                          fill={s <= deliveryRating ? '#F59E0B' : 'transparent'}
                          color={s <= deliveryRating ? '#F59E0B' : '#CBD5E1'}
                        />
                      </button>
                    ))}
                  </div>
                </div>

                <textarea
                  rows={2}
                  placeholder="Optional review or comments..."
                  value={feedbackComment}
                  onChange={(e) => setFeedbackComment(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '8px',
                    border: '1px solid #CBD5E1',
                    borderRadius: '8px',
                    fontSize: '0.8rem',
                    marginBottom: '0.85rem',
                    color: '#0F172A',
                  }}
                />

                <button
                  type="submit"
                  style={{
                    width: '100%',
                    padding: '8px',
                    background: '#008751',
                    color: 'white',
                    borderRadius: '8px',
                    fontWeight: 700,
                    fontSize: '0.85rem',
                  }}
                >
                  Submit Ratings
                </button>
              </form>
            )}
          </div>
        )}
      </div>

      {/* Customer Support Modal */}
      {showIssueModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={{ maxWidth: '420px', padding: '1.25rem' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#0F172A', marginBottom: '0.4rem' }}>
              Report an Issue with Order #{order.id}
            </h3>
            <p style={{ fontSize: '0.78rem', color: '#64748B', marginBottom: '1rem' }}>
              Our operations team in Nigeria will investigate and initiate a refund if applicable.
            </p>

            {issueSent ? (
              <div style={{ textAlign: 'center', padding: '1.5rem 0' }}>
                <CheckCircle2 size={44} color="#10B981" style={{ margin: '0 auto 8px' }} />
                <h4 style={{ fontSize: '1rem', fontWeight: 800 }}>Complaint Submitted</h4>
                <p style={{ fontSize: '0.75rem', color: '#64748B' }}>Ticket #TKT-8842 opened with Support.</p>
              </div>
            ) : (
              <form onSubmit={handleReportIssue}>
                <div style={{ marginBottom: '0.85rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    ISSUE CATEGORY
                  </label>
                  <select
                    value={issueType}
                    onChange={(e) => setIssueType(e.target.value)}
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                    }}
                  >
                    <option value="Missing Item">Missing Item in Package</option>
                    <option value="Wrong Item">Wrong Item Received</option>
                    <option value="Damaged Product">Damaged or Expired Product</option>
                    <option value="Late Delivery">Severe Delivery Delay</option>
                    <option value="Rider Complaint">Rider Complaint</option>
                    <option value="Refund Request">Refund Request</option>
                  </select>
                </div>

                <div style={{ marginBottom: '1rem' }}>
                  <label style={{ fontSize: '0.72rem', fontWeight: 700, color: '#475569', display: 'block', marginBottom: '4px' }}>
                    DESCRIPTION
                  </label>
                  <textarea
                    rows={3}
                    required
                    value={issueNote}
                    onChange={(e) => setIssueNote(e.target.value)}
                    placeholder="Provide details about the issue..."
                    style={{
                      width: '100%',
                      padding: '8px',
                      border: '1px solid #CBD5E1',
                      borderRadius: '8px',
                      fontSize: '0.82rem',
                    }}
                  />
                </div>

                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    onClick={() => setShowIssueModal(false)}
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#F1F5F9',
                      color: '#475569',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                    }}
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    style={{
                      flex: 1,
                      padding: '8px',
                      background: '#EF4444',
                      color: '#FFFFFF',
                      borderRadius: '8px',
                      fontWeight: 700,
                      fontSize: '0.82rem',
                    }}
                  >
                    Submit Report
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
