import React from 'react';
import { PlatformProvider, usePlatform } from './context/PlatformContext';
import Header from './components/common/Header';
import CustomerApp from './components/customer/CustomerApp';
import VendorPortal from './components/vendor/VendorPortal';
import RiderApp from './components/rider/RiderApp';
import AdminDashboard from './components/admin/AdminDashboard';
import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

function PlatformContent() {
  const { activeRole, toasts } = usePlatform();

  return (
    <div className="app-container">
      {/* Global Top Multi-Portal Bar */}
      <Header />

      {/* Main Viewport depending on selected role */}
      <main style={{ flex: 1 }}>
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
    <PlatformProvider>
      <PlatformContent />
    </PlatformProvider>
  );
}
