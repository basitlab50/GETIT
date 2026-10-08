import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import CustomerHome from './CustomerHome';
import ShopDetail from './ShopDetail';
import MarketplaceService from './MarketplaceService';
import OrderTracker from './OrderTracker';
import OrderHistory from './OrderHistory';
import CartModal from './CartModal';
import CheckoutModal from './CheckoutModal';
import {
  Home,
  Store,
  Sparkles,
  ShoppingBag,
  Clock,
  Wifi,
  Battery,
  Signal
} from 'lucide-react';

export default function CustomerApp() {
  const { isMobileFrame, cart, activeCustomerOrderId, setActiveCustomerOrderId } = usePlatform();

  const [activeTab, setActiveTab] = useState('home'); // 'home' | 'marketplace' | 'orders' | 'tracking'
  const [selectedShopId, setSelectedShopId] = useState(null);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);

  const cartCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  const handleSelectShop = (shopId) => {
    setSelectedShopId(shopId);
  };

  const handleOrderPlaced = (newOrderId) => {
    setActiveCustomerOrderId(newOrderId);
    setSelectedShopId(null);
    setActiveTab('tracking');
  };

  const handleMarketTaskCreated = (newTaskId) => {
    setActiveCustomerOrderId(newTaskId);
    setActiveTab('tracking');
  };

  return (
    <div className="mobile-view-stage">
      <div className={`mobile-phone-frame ${!isMobileFrame ? 'fullscreen-mode' : ''}`}>
        {/* Realistic Mobile Notch Bar (Simulates modern smartphone viewport) */}
        {isMobileFrame && (
          <div className="phone-notch-bar">
            <span>09:41</span>
            <div className="phone-speaker-notch">
              <div className="notch-camera" />
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '5px' }}>
              <Signal size={12} />
              <Wifi size={12} />
              <Battery size={12} />
            </div>
          </div>
        )}

        {/* Customer Screen Viewport */}
        <div className="customer-screen-content">
          {selectedShopId ? (
            <ShopDetail
              vendorId={selectedShopId}
              onBack={() => setSelectedShopId(null)}
              onOpenCart={() => setIsCartOpen(true)}
            />
          ) : activeTab === 'home' ? (
            <CustomerHome
              onSelectShop={handleSelectShop}
              onOpenMarketplace={() => setActiveTab('marketplace')}
              onOpenCart={() => setIsCartOpen(true)}
            />
          ) : activeTab === 'marketplace' ? (
            <MarketplaceService onTaskCreated={handleMarketTaskCreated} />
          ) : activeTab === 'tracking' ? (
            <OrderTracker
              orderId={activeCustomerOrderId}
              onBack={() => setActiveTab('home')}
            />
          ) : activeTab === 'orders' ? (
            <OrderHistory
              onSelectOrder={(ordId) => {
                setActiveCustomerOrderId(ordId);
                setActiveTab('tracking');
              }}
              onStartShopping={() => setActiveTab('home')}
            />
          ) : null}
        </div>

        {/* Customer Bottom Navigation Bar */}
        <nav className="customer-bottom-nav">
          <button
            className={`customer-nav-item ${activeTab === 'home' && !selectedShopId ? 'active' : ''}`}
            onClick={() => {
              setSelectedShopId(null);
              setActiveTab('home');
            }}
          >
            <Home size={18} />
            <span>Stores</span>
          </button>

          <button
            className={`customer-nav-item ${activeTab === 'marketplace' ? 'active' : ''}`}
            onClick={() => {
              setSelectedShopId(null);
              setActiveTab('marketplace');
            }}
          >
            <Sparkles size={18} color={activeTab === 'marketplace' ? '#008751' : '#64748B'} />
            <span>Market Errand</span>
          </button>

          <button
            className="customer-nav-item"
            onClick={() => setIsCartOpen(true)}
          >
            <div style={{ position: 'relative' }}>
              <ShoppingBag size={18} />
              {cartCount > 0 && <span className="cart-nav-badge">{cartCount}</span>}
            </div>
            <span>Cart</span>
          </button>

          <button
            className={`customer-nav-item ${activeTab === 'orders' || activeTab === 'tracking' ? 'active' : ''}`}
            onClick={() => {
              setSelectedShopId(null);
              setActiveTab('orders');
            }}
          >
            <Clock size={18} />
            <span>Activity</span>
          </button>
        </nav>
      </div>

      {/* Cart Modal */}
      <CartModal
        isOpen={isCartOpen}
        onClose={() => setIsCartOpen(false)}
        onOpenCheckout={() => setIsCheckoutOpen(true)}
      />

      {/* Checkout Modal */}
      <CheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        onOrderPlaced={handleOrderPlaced}
      />
    </div>
  );
}
