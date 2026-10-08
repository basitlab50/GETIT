import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { formatNaira } from '../../utils/feeCalculator';
import {
  Bike,
  MapPin,
  Phone,
  ShieldCheck,
  CheckCircle2,
  Navigation,
  Key,
  DollarSign,
  Package,
  Sparkles,
  CheckSquare,
  Square,
  Clock,
  ArrowRight,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

export default function RiderApp() {
  const {
    riders,
    selectedRiderId,
    setSelectedRiderId,
    orders,
    riderAcceptJob,
    riderArrivedAtPickup,
    riderConfirmPickup,
    riderStartTransit,
    riderArrivedAtCustomer,
    riderConfirmDelivery,
    updateMarketItemStatus,
  } = usePlatform();

  const currentRider = riders.find((r) => r.id === selectedRiderId) || riders[0];
  const [isOnline, setIsOnline] = useState(currentRider.isOnline ?? true);
  
  // PIN entry states
  const [pickupPinInput, setPickupPinInput] = useState('');
  const [pickupPinError, setPickupPinError] = useState('');
  const [deliveryPinInput, setDeliveryPinInput] = useState('');
  const [deliveryPinError, setDeliveryPinError] = useState('');

  // Active Jobs assigned to this rider or available for dispatch
  const activeJobs = orders.filter((o) =>
    ['READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'RIDER_AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED', 'PREPARING'].includes(o.status)
  );

  const completedJobs = orders.filter((o) =>
    ['DELIVERED', 'COMPLETED'].includes(o.status)
  );

  const handleVerifyPickup = (orderId) => {
    const result = riderConfirmPickup(orderId, pickupPinInput);
    if (!result.success) {
      setPickupPinError(result.message);
    } else {
      setPickupPinInput('');
      setPickupPinError('');
    }
  };

  const handleVerifyDelivery = (orderId) => {
    const result = riderConfirmDelivery(orderId, deliveryPinInput);
    if (!result.success) {
      setDeliveryPinError(result.message);
    } else {
      setDeliveryPinInput('');
      setDeliveryPinError('');
    }
  };

  return (
    <div style={{ padding: '1.5rem', maxWidth: '1000px', margin: '0 auto', color: '#F8FAFC' }}>
      {/* Top Rider Profile Bar */}
      <div
        style={{
          background: 'rgba(30, 41, 59, 0.75)',
          border: '1px solid rgba(255, 255, 255, 0.1)',
          backdropFilter: 'blur(10px)',
          borderRadius: '18px',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          marginBottom: '1.5rem',
          flexWrap: 'wrap',
          gap: '1rem',
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <div
            style={{
              width: '50px',
              height: '50px',
              borderRadius: '50%',
              background: '#008751',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: 'white',
              fontSize: '1.5rem',
              boxShadow: '0 4px 14px rgba(0, 135, 81, 0.4)',
            }}
          >
            <Bike size={26} />
          </div>

          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <h2 style={{ fontSize: '1.25rem', fontWeight: 800 }}>{currentRider.name}</h2>
              <span
                style={{
                  fontSize: '0.68rem',
                  padding: '2px 8px',
                  borderRadius: '12px',
                  background: currentRider.type === 'BOLT_DISPATCH' ? 'rgba(56, 189, 248, 0.2)' : 'rgba(16, 185, 129, 0.2)',
                  color: currentRider.type === 'BOLT_DISPATCH' ? '#38BDF8' : '#34D399',
                  fontWeight: 700,
                }}
              >
                {currentRider.providerName}
              </span>
            </div>
            <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
              {currentRider.vehicle} • Rating: <strong>{currentRider.rating}★</strong> ({currentRider.completedDeliveries} trips)
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          {/* Online/Offline Toggle */}
          <button
            onClick={() => setIsOnline(!isOnline)}
            style={{
              padding: '8px 16px',
              borderRadius: '10px',
              background: isOnline ? '#065F46' : '#7F1D1D',
              color: isOnline ? '#34D399' : '#FCA5A5',
              fontSize: '0.82rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              border: `1px solid ${isOnline ? '#10B981' : '#EF4444'}`,
            }}
          >
            <span
              style={{
                width: '8px',
                height: '8px',
                borderRadius: '50%',
                background: isOnline ? '#10B981' : '#EF4444',
              }}
            />
            {isOnline ? 'ONLINE (ACTIVE)' : 'OFFLINE'}
          </button>

          {/* Switch Driver View */}
          <select
            value={selectedRiderId}
            onChange={(e) => setSelectedRiderId(e.target.value)}
            style={{
              background: '#0F172A',
              color: '#FFFFFF',
              border: '1px solid #334155',
              padding: '8px 12px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
            }}
          >
            {riders.map((r) => (
              <option key={r.id} value={r.id}>
                {r.name} ({r.type === 'BOLT_DISPATCH' ? 'Bolt' : 'Fleet'})
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Rider KPI Summary */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
          gap: '1rem',
          marginBottom: '1.5rem',
        }}
      >
        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '1.1rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>ACTIVE JOBS</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#38BDF8', margin: '4px 0' }}>
            {activeJobs.length}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Dispatch queue</span>
        </div>

        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '1.1rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>COMPLETED TRIPS</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#34D399', margin: '4px 0' }}>
            {currentRider.completedDeliveries}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Verified via PIN</span>
        </div>

        <div style={{ background: '#1E293B', border: '1px solid #334155', borderRadius: '16px', padding: '1.1rem' }}>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8', fontWeight: 700 }}>TOTAL EARNINGS</span>
          <h3 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#FBBF24', margin: '4px 0' }}>
            {formatNaira(currentRider.earningsTotal)}
          </h3>
          <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Ready for bank withdrawal</span>
        </div>
      </div>

      {/* Active Jobs & Market Tasks */}
      <div style={{ marginBottom: '2rem' }}>
        <h3 style={{ fontSize: '1.15rem', fontWeight: 800, marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '8px' }}>
          <Package size={20} color="#008751" />
          Active Delivery Jobs & Marketplace Tasks ({activeJobs.length})
        </h3>

        {activeJobs.length === 0 ? (
          <div style={{ background: '#1E293B', padding: '3rem', borderRadius: '16px', textAlign: 'center' }}>
            <Bike size={44} color="#64748B" style={{ margin: '0 auto 8px' }} />
            <h4>No active delivery jobs currently</h4>
            <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>
              When a customer places an order and the shop marks it ready, the Delivery Engine dispatches it here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
            {activeJobs.map((job) => {
              const isMarketTask = job.type === 'MARKET_TASK';
              const isAtShopPickup = ['READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'RIDER_AT_PICKUP'].includes(job.status);
              const isInTransit = ['PICKED_UP', 'IN_TRANSIT', 'ARRIVED'].includes(job.status);

              return (
                <div
                  key={job.id}
                  style={{
                    background: '#1E293B',
                    borderRadius: '16px',
                    border: '1px solid #334155',
                    padding: '1.25rem',
                    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                  }}
                >
                  {/* Job Header */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                    <div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        <h4 style={{ fontSize: '1.1rem', fontWeight: 800 }}>
                          {isMarketTask ? `Marketplace Errand #${job.id}` : `Delivery Job #${job.id}`}
                        </h4>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: isMarketTask ? '#7C3AED' : '#0284C7',
                            color: 'white',
                            fontWeight: 700,
                          }}
                        >
                          {isMarketTask ? 'MARKET SHOPPING' : 'GROCERY SHOP'}
                        </span>
                        <span
                          style={{
                            fontSize: '0.68rem',
                            padding: '2px 8px',
                            borderRadius: '10px',
                            background: '#F59E0B',
                            color: '#1E293B',
                            fontWeight: 800,
                          }}
                        >
                          {job.status}
                        </span>
                      </div>
                      <p style={{ fontSize: '0.78rem', color: '#94A3B8', marginTop: '2px' }}>
                        Customer: <strong>{job.customerName}</strong> ({job.customerPhone})
                      </p>
                    </div>

                    <div style={{ textAlign: 'right' }}>
                      <span style={{ fontSize: '0.72rem', color: '#94A3B8' }}>Rider Payout</span>
                      <h3 style={{ fontSize: '1.25rem', fontWeight: 900, color: '#34D399' }}>
                        {formatNaira(job.deliveryProviderCost || 850)}
                      </h3>
                    </div>
                  </div>

                  {/* Route & Locations */}
                  <div
                    style={{
                      background: '#0F172A',
                      borderRadius: '12px',
                      padding: '1rem',
                      marginBottom: '1rem',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '10px',
                    }}
                  >
                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#F59E0B' }} />
                      <div style={{ fontSize: '0.82rem' }}>
                        <span style={{ color: '#94A3B8', fontSize: '0.7rem', display: 'block' }}>PICKUP FROM</span>
                        <strong>{job.vendorName || job.targetMarket}</strong>
                      </div>
                    </div>

                    <div style={{ width: '2px', height: '14px', background: '#334155', marginLeft: '5px' }} />

                    <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                      <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: '#008751' }} />
                      <div style={{ fontSize: '0.82rem' }}>
                        <span style={{ color: '#94A3B8', fontSize: '0.7rem', display: 'block' }}>DELIVER TO</span>
                        <strong>{job.customerAddress}</strong>
                      </div>
                    </div>
                  </div>

                  {/* If Marketplace Task: Show Interactive Shopping Checklist (Spec Section 34) */}
                  {isMarketTask && (
                    <div
                      style={{
                        background: '#0F172A',
                        borderRadius: '12px',
                        padding: '1rem',
                        marginBottom: '1rem',
                        border: '1px solid rgba(124, 58, 237, 0.4)',
                      }}
                    >
                      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '8px' }}>
                        <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#C4B5FD', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <Sparkles size={14} /> MARKET SHOPPING CHECKLIST (Collect items at market stalls)
                        </span>
                        <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>
                          {job.items.filter((i) => i.completed).length} of {job.items.length} items collected
                        </span>
                      </div>

                      <div style={{ display: 'flex', flexDirection: 'column', gap: '6px' }}>
                        {job.items.map((item, idx) => (
                          <div
                            key={idx}
                            onClick={() => updateMarketItemStatus(job.id, idx, !item.completed)}
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              padding: '8px 10px',
                              borderRadius: '8px',
                              background: item.completed ? 'rgba(16, 185, 129, 0.15)' : 'rgba(255,255,255,0.04)',
                              border: item.completed ? '1px solid #10B981' : '1px solid transparent',
                              cursor: 'pointer',
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              {item.completed ? (
                                <CheckSquare size={16} color="#34D399" />
                              ) : (
                                <Square size={16} color="#64748B" />
                              )}
                              <span
                                style={{
                                  fontSize: '0.85rem',
                                  fontWeight: 700,
                                  color: item.completed ? '#6EE7B7' : '#FFFFFF',
                                  textDecoration: item.completed ? 'line-through' : 'none',
                                }}
                              >
                                {item.name} ({item.qty})
                              </span>
                            </div>
                            <span style={{ fontSize: '0.78rem', color: '#94A3B8' }}>
                              ~{formatNaira(item.estimatedPrice)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Rider Action Workflow Controls */}
                  <div style={{ borderTop: '1px solid #334155', paddingTop: '1rem' }}>
                    {/* Stage 1: Arrive at shop and Enter Pickup PIN (Spec Section 27) */}
                    {isAtShopPickup && (
                      <div>
                        {job.status === 'READY_FOR_PICKUP' && (
                          <button
                            onClick={() => riderArrivedAtPickup(job.id)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: '#0284C7',
                              color: 'white',
                              borderRadius: '10px',
                              fontWeight: 800,
                              fontSize: '0.88rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <Navigation size={16} /> I Have Arrived at Shop
                          </button>
                        )}

                        {(job.status === 'RIDER_AT_PICKUP' || job.status === 'RIDER_ASSIGNED') && (
                          <div style={{ background: '#0F172A', padding: '1rem', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#FDE047', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <Key size={14} /> SHOP PICKUP VERIFICATION PIN
                            </span>
                            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '4px 0 10px' }}>
                              Ask shop keeper for their 4-digit Pickup PIN (Demo PIN is <strong>{job.pickupPin}</strong>):
                            </p>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="Enter 4-digit PIN"
                                value={pickupPinInput}
                                onChange={(e) => setPickupPinInput(e.target.value)}
                                style={{
                                  width: '150px',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  background: '#1E293B',
                                  border: '1px solid #334155',
                                  color: '#FFFFFF',
                                  fontSize: '1.1rem',
                                  fontWeight: 800,
                                  letterSpacing: '0.1em',
                                  textAlign: 'center',
                                }}
                              />
                              <button
                                onClick={() => handleVerifyPickup(job.id)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#008751',
                                  color: 'white',
                                  borderRadius: '8px',
                                  fontWeight: 800,
                                  fontSize: '0.85rem',
                                }}
                              >
                                Verify & Collect Package
                              </button>
                            </div>
                            {pickupPinError && (
                              <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '6px' }}>
                                {pickupPinError}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}

                    {/* Stage 2: In transit to Customer -> Arrived -> Enter Delivery PIN (Spec Section 29) */}
                    {isInTransit && (
                      <div>
                        {job.status === 'PICKED_UP' && (
                          <button
                            onClick={() => riderStartTransit(job.id)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: '#0284C7',
                              color: 'white',
                              borderRadius: '10px',
                              fontWeight: 800,
                              fontSize: '0.88rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <Navigation size={16} /> Start Ride to Customer Address
                          </button>
                        )}

                        {job.status === 'IN_TRANSIT' && (
                          <button
                            onClick={() => riderArrivedAtCustomer(job.id)}
                            style={{
                              width: '100%',
                              padding: '10px',
                              background: '#F59E0B',
                              color: '#1E293B',
                              borderRadius: '10px',
                              fontWeight: 800,
                              fontSize: '0.88rem',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'center',
                              gap: '6px',
                            }}
                          >
                            <MapPin size={16} /> I Have Arrived at Customer Gate
                          </button>
                        )}

                        {job.status === 'ARRIVED' && (
                          <div style={{ background: '#0F172A', padding: '1rem', borderRadius: '12px' }}>
                            <span style={{ fontSize: '0.75rem', fontWeight: 800, color: '#34D399', display: 'flex', alignItems: 'center', gap: '4px' }}>
                              <ShieldCheck size={14} /> CUSTOMER DELIVERY PIN VERIFICATION
                            </span>
                            <p style={{ fontSize: '0.78rem', color: '#94A3B8', margin: '4px 0 10px' }}>
                              Ask customer for their 4-digit Delivery PIN (Demo PIN is <strong>{job.deliveryPin}</strong>):
                            </p>

                            <div style={{ display: 'flex', gap: '8px' }}>
                              <input
                                type="text"
                                maxLength={4}
                                placeholder="Enter 4-digit PIN"
                                value={deliveryPinInput}
                                onChange={(e) => setDeliveryPinInput(e.target.value)}
                                style={{
                                  width: '150px',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  background: '#1E293B',
                                  border: '1px solid #334155',
                                  color: '#FFFFFF',
                                  fontSize: '1.1rem',
                                  fontWeight: 800,
                                  letterSpacing: '0.1em',
                                  textAlign: 'center',
                                }}
                              />
                              <button
                                onClick={() => handleVerifyDelivery(job.id)}
                                style={{
                                  padding: '8px 16px',
                                  background: '#008751',
                                  color: 'white',
                                  borderRadius: '8px',
                                  fontWeight: 800,
                                  fontSize: '0.85rem',
                                }}
                              >
                                Complete Delivery & Get Paid
                              </button>
                            </div>
                            {deliveryPinError && (
                              <p style={{ color: '#F87171', fontSize: '0.75rem', marginTop: '6px' }}>
                                {deliveryPinError}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Trip & Earnings History */}
      <div style={{ background: '#1E293B', borderRadius: '16px', padding: '1.25rem', border: '1px solid #334155' }}>
        <h3 style={{ fontSize: '1rem', fontWeight: 800, marginBottom: '0.75rem' }}>
          Completed Deliveries & Payout History
        </h3>
        {completedJobs.length === 0 ? (
          <p style={{ fontSize: '0.8rem', color: '#94A3B8' }}>No completed trips recorded yet.</p>
        ) : (
          <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
            {completedJobs.map((cj) => (
              <div
                key={cj.id}
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
                  <span style={{ fontWeight: 800, color: 'white' }}>{cj.id}</span>
                  <span style={{ color: '#94A3B8', marginLeft: '6px' }}>
                    ({cj.vendorName || cj.targetMarket} → {cj.customerName})
                  </span>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                  <span style={{ color: '#34D399', fontWeight: 800 }}>
                    +{formatNaira(cj.deliveryProviderCost || 850)}
                  </span>
                  <span style={{ color: '#6EE7B7', fontSize: '0.7rem' }}>✓ DELIVERED</span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
