import React from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import Header from './components/common/Header';
import CustomerApp from './components/customer/CustomerApp';
import VendorPortal from './components/vendor/VendorPortal';
import RiderApp from './components/rider/RiderApp';
import AdminDashboard from './components/admin/AdminDashboard';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

class PortalErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }
  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', background: '#FAF7F0', minHeight: '100vh', color: '#06281B', fontFamily: 'sans-serif' }}>
          <h2>GETIT Executive Portal — Resetting Cached Session</h2>
          <p style={{ marginTop: '8px', color: '#DC2626' }}>{String(this.state.error?.message || this.state.error)}</p>
          <button
            onClick={() => {
              localStorage.clear();
              window.location.reload();
            }}
            style={{ marginTop: '16px', padding: '12px 20px', borderRadius: '10px', background: '#06281B', color: '#FFFFFF', fontWeight: 800, cursor: 'pointer' }}
          >
            Reset Local Cache & Reload Portal
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

function PlatformContent() {
  const { activeRole, toasts } = usePlatform();

  return (
    <div className="app-container" style={{ background: activeRole === 'admin' ? '#FAF7F0' : undefined }}>
      {/* Only show legacy demo bar when previewing non-admin simulators */}
      {activeRole !== 'admin' && <Header />}

      {/* Main Viewport depending on selected role */}
      <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
        {activeRole === 'customer' && <CustomerApp />}
        {activeRole === 'vendor' && <VendorPortal />}
        {activeRole === 'rider' && <RiderApp />}
        {activeRole === 'admin' && <AdminDashboard />}
      </main>

      {/* Universal Real-Time Toast Notifications */}
      <div className="toast-container">
        {toasts.map((toast) => (
          <div key={toast.id} className={`toast-card ${toast.type}`}>
            <div style={{ marginTop: '2px' }}>
              {toast.type === 'success' && <CheckCircle2 size={18} color="#10B981" />}
              {toast.type === 'warning' && <AlertTriangle size={18} color="#F59E0B" />}
              {toast.type === 'danger' && <AlertTriangle size={18} color="#EF4444" />}
              {toast.type === 'info' && <Info size={18} color="#38BDF8" />}
            </div>
            <div style={{ flex: 1 }}>
              <div className="toast-title">{toast.title}</div>
              <div className="toast-msg">{toast.message}</div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export default function App() {
  return (
    <PortalErrorBoundary>
      <PlatformProvider>
        <PlatformContent />
      </PlatformProvider>
    </PortalErrorBoundary>
  );
}
