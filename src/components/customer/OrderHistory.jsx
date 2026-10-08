import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { formatNaira } from '../../utils/feeCalculator';
import { ShoppingBag, Clock, ChevronRight, CheckCircle2, AlertTriangle, ArrowRight } from 'lucide-react';

export default function OrderHistory({ onSelectOrder, onStartShopping }) {
  const { orders } = usePlatform();

  const getStatusBadge = (status) => {
    switch (status) {
      case 'DELIVERED':
      case 'COMPLETED':
        return <span className="badge-status badge-delivered">DELIVERED</span>;
      case 'IN_TRANSIT':
      case 'ARRIVED':
        return <span className="badge-status badge-in-transit">IN TRANSIT</span>;
      case 'READY_FOR_PICKUP':
        return <span className="badge-status badge-ready">READY FOR PICKUP</span>;
      case 'PREPARING':
        return <span className="badge-status badge-preparing">PREPARING</span>;
      case 'PAID':
        return <span className="badge-status badge-paid">PAID</span>;
      case 'VENDOR_REJECTED':
      case 'CUSTOMER_CANCELLED':
        return <span className="badge-status badge-rejected">CANCELLED</span>;
      case 'REFUNDED':
        return <span className="badge-status badge-refunded">REFUNDED</span>;
      default:
        return <span className="badge-status badge-paid">{status}</span>;
    }
  };

  return (
    <div style={{ padding: '1rem', background: '#F8FAFC', minHeight: '100%' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem' }}>
        <h3 style={{ fontSize: '1.05rem', fontWeight: 800, color: '#0F172A' }}>
          Your Orders & Errands
        </h3>
        <span style={{ fontSize: '0.72rem', color: '#64748B' }}>{orders.length} total</span>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '3rem 1rem', background: '#FFFFFF', borderRadius: '16px' }}>
          <ShoppingBag size={40} color="#94A3B8" style={{ margin: '0 auto 8px' }} />
          <h4 style={{ fontSize: '1rem', fontWeight: 700, color: '#0F172A' }}>No Orders Yet</h4>
          <p style={{ fontSize: '0.78rem', color: '#64748B', marginTop: '4px', marginBottom: '1rem' }}>
            Start searching for provisions or request fresh market items.
          </p>
          <button
            onClick={onStartShopping}
            style={{
              padding: '8px 16px',
              background: '#008751',
              color: 'white',
              borderRadius: '8px',
              fontWeight: 700,
              fontSize: '0.82rem',
            }}
          >
            Start Shopping
          </button>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
          {orders.map((ord) => (
            <div
              key={ord.id}
              onClick={() => onSelectOrder(ord.id)}
              style={{
                background: '#FFFFFF',
                borderRadius: '16px',
                padding: '1rem',
                border: '1px solid #E2E8F0',
                cursor: 'pointer',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '6px' }}>
                <div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                    <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A' }}>
                      {ord.id}
                    </h4>
                    <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                      {ord.type === 'MARKET_TASK' ? 'Market Errand' : 'Shop Order'}
                    </span>
                  </div>
                  <p style={{ fontSize: '0.75rem', color: '#475569', fontWeight: 600 }}>
                    {ord.vendorName || ord.targetMarket || "Mama's Provision Store"}
                  </p>
                </div>

                {getStatusBadge(ord.status)}
              </div>

              <div style={{ fontSize: '0.72rem', color: '#64748B', marginBottom: '8px', lineHeight: 1.3 }}>
                {ord.items.map((it) => (it.quantity ? `${it.quantity}x ${it.name}` : `${it.name}`)).join(', ')}
              </div>

              <div
                style={{
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  paddingTop: '6px',
                  borderTop: '1px solid #F1F5F9',
                }}
              >
                <div>
                  <span style={{ fontSize: '0.68rem', color: '#64748B' }}>Total: </span>
                  <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#008751' }}>
                    {formatNaira(ord.totalAmountPaid)}
                  </span>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', gap: '3px', fontSize: '0.72rem', color: '#008751', fontWeight: 700 }}>
                  <span>Track Details</span>
                  <ChevronRight size={14} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
