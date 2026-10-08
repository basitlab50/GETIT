import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import {
  ShoppingBag,
  Store,
  Bike,
  ShieldCheck,
  Smartphone,
  Maximize2,
  RotateCcw,
  MapPin,
  Bell
} from 'lucide-react';
import { INITIAL_LOCATIONS } from '../../data/mockData';

export default function Header() {
  const {
    activeRole,
    setActiveRole,
    isMobileFrame,
    setIsMobileFrame,
    selectedLocation,
    setSelectedLocation,
    cart,
    orders,
    resetAllDataToDefault,
  } = usePlatform();

  // Badge calculations
  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);
  const activeOrdersCount = orders.filter((o) =>
    ['PAID', 'PREPARING', 'READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED'].includes(o.status)
  ).length;

  const vendorPendingOrders = orders.filter((o) =>
    ['PAID', 'PREPARING'].includes(o.status)
  ).length;

  const riderActiveJobs = orders.filter((o) =>
    ['READY_FOR_PICKUP', 'RIDER_ASSIGNED', 'RIDER_AT_PICKUP', 'PICKED_UP', 'IN_TRANSIT', 'ARRIVED'].includes(o.status)
  ).length;

  return (
    <header className="master-header">
      {/* Brand & Identity */}
      <div className="brand-section">
        <div className="brand-logo-badge">
          G
        </div>
        <div className="brand-title">
          <div className="brand-name">
            GETIT <span className="brand-badge">Nigeria</span>
          </div>
          <span className="brand-subtitle">
            Grocery, Provisions & Marketplace Delivery
          </span>
        </div>
      </div>

      {/* 4 Portals Role Switcher */}
      <nav className="role-switcher">
        <button
          className={`role-tab-btn ${activeRole === 'customer' ? 'active' : ''}`}
          onClick={() => setActiveRole('customer')}
        >
          <ShoppingBag size={16} />
          <span>Customer App</span>
          {cartCount > 0 && <span className="role-badge-count">{cartCount}</span>}
        </button>

        <button
          className={`role-tab-btn ${activeRole === 'vendor' ? 'active' : ''}`}
          onClick={() => setActiveRole('vendor')}
        >
          <Store size={16} />
          <span>Vendor Portal</span>
          {vendorPendingOrders > 0 && (
            <span className="role-badge-count" style={{ background: '#EF4444' }}>
              {vendorPendingOrders}
            </span>
          )}
        </button>

        <button
          className={`role-tab-btn ${activeRole === 'rider' ? 'active' : ''}`}
          onClick={() => setActiveRole('rider')}
        >
          <Bike size={16} />
          <span>Rider App</span>
          {riderActiveJobs > 0 && (
            <span className="role-badge-count" style={{ background: '#F59E0B' }}>
              {riderActiveJobs}
            </span>
          )}
        </button>

        <button
          className={`role-tab-btn ${activeRole === 'admin' ? 'active' : ''}`}
          onClick={() => setActiveRole('admin')}
        >
          <ShieldCheck size={16} />
          <span>Admin Command Center</span>
          {activeOrdersCount > 0 && (
            <span className="role-badge-count" style={{ background: '#0284C7' }}>
              {activeOrdersCount}
            </span>
          )}
        </button>
      </nav>

      {/* Header Utilities */}
      <div className="master-actions">
        {/* Quick Location Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '6px', background: 'rgba(255,255,255,0.06)', padding: '5px 10px', borderRadius: '20px', border: '1px solid rgba(255,255,255,0.1)' }}>
          <MapPin size={14} color="#34D399" />
          <select
            value={selectedLocation.id}
            onChange={(e) => {
              const loc = INITIAL_LOCATIONS.find((l) => l.id === e.target.value);
              if (loc) setSelectedLocation(loc);
            }}
            style={{
              background: 'transparent',
              color: '#F8FAFC',
              fontSize: '0.78rem',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            {INITIAL_LOCATIONS.map((loc) => (
              <option key={loc.id} value={loc.id} style={{ background: '#0F172A', color: 'white' }}>
                {loc.name}
              </option>
            ))}
          </select>
        </div>

        {/* Mobile View Toggle if Customer tab active */}
        {activeRole === 'customer' && (
          <button
            className="action-pill-btn"
            onClick={() => setIsMobileFrame(!isMobileFrame)}
            title={isMobileFrame ? 'Expand to Desktop View' : 'Switch to Mobile Phone View'}
          >
            {isMobileFrame ? <Maximize2 size={13} /> : <Smartphone size={13} />}
            <span>{isMobileFrame ? 'Expand View' : 'Phone Frame'}</span>
          </button>
        )}

        {/* Reset Demo Data */}
        <button
          className="action-pill-btn"
          onClick={resetAllDataToDefault}
          title="Reset sample orders & products to spec defaults"
        >
          <RotateCcw size={13} />
          <span>Reset Demo</span>
        </button>
      </div>
    </header>
  );
}
