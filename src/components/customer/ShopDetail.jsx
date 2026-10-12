import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { formatNaira } from '../../utils/feeCalculator';
import { CATEGORIES } from '../../data/mockData';
import { ArrowLeft, Star, MapPin, Clock, Phone, Plus, Minus, ShoppingBag } from 'lucide-react';
import ProductMedia from '../common/ProductMedia';

export default function ShopDetail({ vendorId, onBack, onOpenCart }) {
  const { vendors, products, addToCart, cart } = usePlatform();
  const [selectedCat, setSelectedCat] = useState('all');

  const vendor = vendors.find((v) => v.id === vendorId) || vendors[0];
  const isVendorOpen = vendor ? (vendor.isOpen !== false && vendor.is_open !== false && vendor.status !== 'closed') : true;
  const vendorProducts = products.filter((p) => p.vendorId === vendor.id);

  const displayedProducts = selectedCat === 'all'
    ? vendorProducts
    : vendorProducts.filter((p) => p.category === selectedCat);

  const cartItemsCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ background: '#F8FAFC', minHeight: '100%' }}>
      {/* Store Header Banner */}
      <div
        style={{
          background: 'linear-gradient(135deg, #064E3B 0%, #0F172A 100%)',
          color: '#FFFFFF',
          padding: '1.25rem 1rem',
          position: 'relative',
        }}
      >
        <button
          onClick={onBack}
          style={{
            background: 'rgba(255, 255, 255, 0.15)',
            color: 'white',
            borderRadius: '50%',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            marginBottom: '0.75rem',
          }}
        >
          <ArrowLeft size={16} />
        </button>

        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <div
            style={{
              width: '56px',
              height: '56px',
              borderRadius: '16px',
              background: '#FFFFFF',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '1.8rem',
              boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
            }}
          >
            {vendor.avatar || '🏪'}
          </div>

          <div>
            <span
              style={{
                fontSize: '0.65rem',
                background: 'rgba(52, 211, 153, 0.2)',
                color: '#34D399',
                padding: '2px 8px',
                borderRadius: '12px',
                fontWeight: 700,
                textTransform: 'uppercase',
              }}
            >
              {vendor.category}
            </span>
            <h2 style={{ fontSize: '1.25rem', fontWeight: 800, margin: '2px 0 4px' }}>{vendor.name}</h2>
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px', fontSize: '0.72rem', color: '#CBD5E1' }}>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Star size={12} fill="#F59E0B" color="#F59E0B" />
                <strong style={{ color: '#FFFFFF' }}>{vendor.rating}</strong> ({vendor.reviewsCount})
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <MapPin size={12} /> {vendor.location} ({vendor.distanceKm} km)
              </span>
              <span>•</span>
              <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                <Clock size={12} /> {vendor.prepTimeMins} mins
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Internal Category Filter Chips */}
      <div
        style={{
          padding: '0.75rem 1rem',
          display: 'flex',
          gap: '6px',
          overflowX: 'auto',
          background: '#FFFFFF',
          borderBottom: '1px solid #E2E8F0',
        }}
      >
        <button
          onClick={() => setSelectedCat('all')}
          style={{
            padding: '5px 12px',
            borderRadius: '20px',
            fontSize: '0.75rem',
            fontWeight: 700,
            whiteSpace: 'nowrap',
            background: selectedCat === 'all' ? '#008751' : '#F1F5F9',
            color: selectedCat === 'all' ? '#FFFFFF' : '#475569',
          }}
        >
          All Items ({vendorProducts.length})
        </button>

        {CATEGORIES.map((cat) => {
          const count = vendorProducts.filter((p) => p.category === cat.id).length;
          if (count === 0) return null;
          return (
            <button
              key={cat.id}
              onClick={() => setSelectedCat(cat.id)}
              style={{
                padding: '5px 12px',
                borderRadius: '20px',
                fontSize: '0.75rem',
                fontWeight: 700,
                whiteSpace: 'nowrap',
                background: selectedCat === cat.id ? '#008751' : '#F1F5F9',
                color: selectedCat === cat.id ? '#FFFFFF' : '#475569',
              }}
            >
              {cat.icon} {cat.name} ({count})
            </button>
          );
        })}
      </div>

      {/* Products Grid - Box Forms Stacked in Rows and Columns */}
      <div
        style={{
          padding: '1rem',
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))',
          gap: '0.85rem',
        }}
      >
        {displayedProducts.map((prod) => {
          const inCart = cart.find((c) => c.productId === prod.id);
          return (
            <div
              key={prod.id}
              style={{
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'space-between',
                background: '#FFFFFF',
                borderRadius: '16px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 2px 6px rgba(0,0,0,0.03)',
                overflow: 'hidden',
                transition: 'transform 0.15s ease, box-shadow 0.15s ease',
              }}
            >
              {/* Box Image Preview on Top */}
              <div
                style={{
                  height: '110px',
                  background: '#F8FAFC',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  position: 'relative',
                  borderBottom: '1px solid #F1F5F9',
                }}
              >
                <ProductMedia src={prod.imageUrl} alt={prod.name} size={64} />
                <span
                  style={{
                    position: 'absolute',
                    top: '8px',
                    left: '8px',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: prod.stock > 5 ? '#047857' : '#DC2626',
                    background: 'rgba(255, 255, 255, 0.92)',
                    padding: '2px 6px',
                    borderRadius: '6px',
                    border: '1px solid #E2E8F0',
                  }}
                >
                  {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                </span>
                {inCart && (
                  <span
                    style={{
                      position: 'absolute',
                      top: '8px',
                      right: '8px',
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: '#FFFFFF',
                      background: '#008751',
                      padding: '2px 6px',
                      borderRadius: '6px',
                    }}
                  >
                    {inCart.quantity} in bag
                  </span>
                )}
              </div>

              {/* Box Content & Actions */}
              <div
                style={{
                  padding: '0.75rem',
                  display: 'flex',
                  flexDirection: 'column',
                  flex: 1,
                  justifyContent: 'space-between',
                }}
              >
                <div>
                  <h4
                    style={{
                      fontSize: '0.82rem',
                      fontWeight: 800,
                      color: '#0F172A',
                      lineHeight: 1.3,
                      minHeight: '2.4rem',
                      display: '-webkit-box',
                      WebkitLineClamp: 2,
                      WebkitBoxOrient: 'vertical',
                      overflow: 'hidden',
                    }}
                  >
                    {prod.name}
                  </h4>
                  <div style={{ fontSize: '0.68rem', color: '#64748B', marginTop: '2px' }}>
                    {prod.unit}
                  </div>
                  <div
                    style={{
                      fontSize: '0.92rem',
                      fontWeight: 800,
                      color: '#008751',
                      marginTop: '4px',
                      marginBottom: '8px',
                    }}
                  >
                    {formatNaira(prod.price)}
                  </div>
                </div>

                {/* Add Button */}
                <button
                  disabled={prod.stock <= 0 || !isVendorOpen}
                  onClick={() => {
                    if (!isVendorOpen) {
                      alert(`${vendor.name} is currently closed. Ordering and booking provisions are not available.`);
                      return;
                    }
                    addToCart(prod, 1);
                  }}
                  style={{
                    width: '100%',
                    padding: '8px 10px',
                    borderRadius: '9px',
                    background: !isVendorOpen ? '#94A3B8' : inCart ? '#008751' : '#0F172A',
                    color: '#FFFFFF',
                    fontSize: '0.75rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '4px',
                    border: 'none',
                    cursor: prod.stock <= 0 || !isVendorOpen ? 'not-allowed' : 'pointer',
                    opacity: prod.stock <= 0 ? 0.6 : 1,
                  }}
                >
                  {!isVendorOpen ? (
                    '🔒 Closed'
                  ) : (
                    <>
                      <Plus size={13} />
                      {inCart ? `Added (${inCart.quantity})` : 'Add to Basket'}
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Floating Bottom Cart Bar if items exist */}
      {cartItemsCount > 0 && (
        <div
          style={{
            position: 'sticky',
            bottom: '4.8rem',
            left: 0,
            right: 0,
            padding: '0.75rem 1rem',
            background: 'rgba(255, 255, 255, 0.95)',
            backdropFilter: 'blur(8px)',
            borderTop: '1px solid #E2E8F0',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            zIndex: 35,
          }}
        >
          <div>
            <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Cart Total</span>
            <h4 style={{ fontSize: '1rem', fontWeight: 800, color: '#0F172A' }}>
              {cartItemsCount} item{cartItemsCount > 1 ? 's' : ''} added
            </h4>
          </div>

          <button
            onClick={onOpenCart}
            style={{
              padding: '0.65rem 1.1rem',
              background: '#008751',
              color: 'white',
              borderRadius: '10px',
              fontWeight: 800,
              fontSize: '0.85rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
            }}
          >
            <ShoppingBag size={15} />
            <span>View Cart</span>
          </button>
        </div>
      )}
    </div>
  );
}
