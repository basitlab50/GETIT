import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { formatNaira } from '../../utils/feeCalculator';
import { CATEGORIES } from '../../data/mockData';
import { ArrowLeft, Star, MapPin, Clock, Phone, Plus, Minus, ShoppingBag } from 'lucide-react';

export default function ShopDetail({ vendorId, onBack, onOpenCart }) {
  const { vendors, products, addToCart, cart } = usePlatform();
  const [selectedCat, setSelectedCat] = useState('all');

  const vendor = vendors.find((v) => v.id === vendorId) || vendors[0];
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

      {/* Products Grid */}
      <div style={{ padding: '1rem', display: 'flex', flexDirection: 'column', gap: '0.75rem' }}>
        {displayedProducts.map((prod) => {
          const inCart = cart.find((c) => c.productId === prod.id);
          return (
            <div
              key={prod.id}
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
                padding: '0.85rem',
                background: '#FFFFFF',
                borderRadius: '14px',
                border: '1px solid #E2E8F0',
                boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
              }}
            >
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <div
                  style={{
                    width: '46px',
                    height: '46px',
                    borderRadius: '10px',
                    background: '#F8FAFC',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '1.6rem',
                  }}
                >
                  {prod.imageUrl || '🛒'}
                </div>
                <div>
                  <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.25 }}>
                    {prod.name}
                  </h4>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '6px', marginTop: '2px' }}>
                    <span style={{ fontSize: '0.7rem', color: '#64748B' }}>{prod.unit}</span>
                    <span style={{ fontSize: '0.7rem', color: '#94A3B8' }}>•</span>
                    <span style={{ fontSize: '0.7rem', color: prod.stock > 5 ? '#059669' : '#DC2626' }}>
                      {prod.stock > 0 ? `${prod.stock} in stock` : 'Out of stock'}
                    </span>
                  </div>
                  <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#008751', marginTop: '2px' }}>
                    {formatNaira(prod.price)}
                  </div>
                </div>
              </div>

              {/* Add Button */}
              <div>
                <button
                  disabled={prod.stock <= 0}
                  onClick={() => addToCart(prod, 1)}
                  style={{
                    padding: '7px 12px',
                    borderRadius: '8px',
                    background: inCart ? '#008751' : '#1E293B',
                    color: '#FFFFFF',
                    fontSize: '0.78rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px',
                  }}
                >
                  <Plus size={13} />
                  {inCart ? `Added (${inCart.quantity})` : 'Add'}
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
