import React, { useState } from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { CATEGORIES } from '../../data/mockData';
import { formatNaira } from '../../utils/feeCalculator';
import ProductSearchCompare from './ProductSearchCompare';
import {
  Search,
  MapPin,
  Star,
  Clock,
  Sparkles,
  ShoppingBag,
  ArrowRight,
  TrendingUp,
  Store,
  ChevronRight,
  Plus
} from 'lucide-react';

export default function CustomerHome({
  onSelectShop,
  onOpenMarketplace,
  onOpenCart,
}) {
  const { vendors, products, selectedLocation, addToCart, cart } = usePlatform();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState(null);

  // Filter nearby shops based on location or open status
  const nearbyShops = vendors;

  // Featured popular groceries
  const popularProducts = products.slice(0, 8);

  const cartTotalCount = cart.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <div style={{ padding: '0.85rem 1rem' }}>
      {/* Top Location & Greeting */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem' }}>
        <div>
          <span style={{ fontSize: '0.7rem', color: '#64748B', display: 'flex', alignItems: 'center', gap: '3px' }}>
            <MapPin size={12} color="#008751" /> Delivering To
          </span>
          <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0F172A' }}>
            {selectedLocation.name}
          </h3>
        </div>

        {cartTotalCount > 0 && (
          <button
            onClick={onOpenCart}
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              background: '#008751',
              color: '#FFFFFF',
              padding: '6px 12px',
              borderRadius: '20px',
              fontSize: '0.75rem',
              fontWeight: 800,
              boxShadow: '0 4px 10px rgba(0, 135, 81, 0.3)',
            }}
          >
            <ShoppingBag size={14} />
            <span>{cartTotalCount} items</span>
          </button>
        )}
      </div>

      {/* Global Search Bar (Spec Section 8 & 9) */}
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px',
          background: '#FFFFFF',
          padding: '0.7rem 0.95rem',
          borderRadius: '14px',
          border: '1px solid #CBD5E1',
          boxShadow: '0 2px 4px rgba(0,0,0,0.03)',
          marginBottom: '1rem',
        }}
      >
        <Search size={18} color="#64748B" />
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search Indomie, Golden Penny Rice, Milo..."
          style={{
            flex: 1,
            border: 'none',
            fontSize: '0.85rem',
            color: '#0F172A',
            background: 'transparent',
          }}
        />
        {searchQuery && (
          <button
            onClick={() => setSearchQuery('')}
            style={{ background: 'transparent', color: '#94A3B8', fontSize: '0.75rem', fontWeight: 700 }}
          >
            Clear
          </button>
        )}
      </div>

      {/* If searching, display multi-shop price comparison! */}
      {searchQuery ? (
        <ProductSearchCompare searchQuery={searchQuery} onSelectShop={onSelectShop} />
      ) : (
        <>
          {/* Marketplace Errand Service Card (Spec Section 2.B & 33) */}
          <div
            onClick={onOpenMarketplace}
            style={{
              background: 'linear-gradient(135deg, #008751 0%, #064E3B 100%)',
              color: '#FFFFFF',
              borderRadius: '16px',
              padding: '1rem 1.15rem',
              marginBottom: '1.25rem',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              boxShadow: '0 8px 18px rgba(0, 135, 81, 0.25)',
              transition: 'transform 0.2s ease',
            }}
          >
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '4px', marginBottom: '2px' }}>
                <Sparkles size={13} color="#FBBF24" />
                <span style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '0.05em', color: '#6EE7B7' }}>
                  MARKETPLACE SERVICE
                </span>
              </div>
              <h3 style={{ fontSize: '1.05rem', fontWeight: 800, margin: '2px 0' }}>
                Physical Market Shopping
              </h3>
              <p style={{ fontSize: '0.72rem', color: '#D1FAE5' }}>
                Tomatoes, Yams, Pepper & Meat collected directly from local market stalls.
              </p>
            </div>
            <div
              style={{
                width: '32px',
                height: '32px',
                borderRadius: '50%',
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <ArrowRight size={16} color="white" />
            </div>
          </div>

          {/* Grocery Categories */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                Browse Categories
              </h3>
              {selectedCategory && (
                <button
                  onClick={() => setSelectedCategory(null)}
                  style={{ background: 'transparent', color: '#008751', fontSize: '0.72rem', fontWeight: 700 }}
                >
                  Show All
                </button>
              )}
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(4, 1fr)',
                gap: '8px',
              }}
            >
              {CATEGORIES.map((cat) => {
                const isSelected = selectedCategory === cat.id;
                return (
                  <button
                    key={cat.id}
                    onClick={() => setSelectedCategory(isSelected ? null : cat.id)}
                    style={{
                      background: isSelected ? '#DCFCE7' : '#FFFFFF',
                      border: isSelected ? '1px solid #10B981' : '1px solid #E2E8F0',
                      borderRadius: '12px',
                      padding: '0.6rem 0.3rem',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '4px',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                    }}
                  >
                    <span style={{ fontSize: '1.4rem' }}>{cat.icon}</span>
                    <span
                      style={{
                        fontSize: '0.68rem',
                        fontWeight: 700,
                        color: isSelected ? '#008751' : '#334155',
                        textAlign: 'center',
                        lineHeight: 1.15,
                      }}
                    >
                      {cat.name.split(' ')[0]}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Nearby Shops Section (Spec Section 8) */}
          <div style={{ marginBottom: '1.25rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A' }}>
                Nearby Stores in {selectedLocation.name.split(',')[0]}
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Fast Delivery</span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              {nearbyShops.map((shop) => (
                <div
                  key={shop.id}
                  onClick={() => onSelectShop(shop.id)}
                  style={{
                    background: '#FFFFFF',
                    borderRadius: '14px',
                    padding: '0.85rem',
                    border: '1px solid #E2E8F0',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    cursor: 'pointer',
                    boxShadow: '0 1px 3px rgba(0,0,0,0.02)',
                  }}
                >
                  <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                    <div
                      style={{
                        width: '44px',
                        height: '44px',
                        borderRadius: '12px',
                        background: '#F1F5F9',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.4rem',
                      }}
                    >
                      {shop.avatar}
                    </div>

                    <div>
                      <h4 style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                        {shop.name}
                      </h4>
                      <p style={{ fontSize: '0.7rem', color: '#64748B', marginTop: '1px' }}>
                        {shop.category}
                      </p>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '8px',
                          fontSize: '0.68rem',
                          color: '#64748B',
                          marginTop: '3px',
                        }}
                      >
                        <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                          <Star size={11} fill="#F59E0B" color="#F59E0B" />
                          <strong style={{ color: '#0F172A' }}>{shop.rating}</strong>
                        </span>
                        <span>•</span>
                        <span>{shop.distanceKm} km</span>
                        <span>•</span>
                        <span>{shop.prepTimeMins} mins</span>
                      </div>
                    </div>
                  </div>

                  <ChevronRight size={18} color="#94A3B8" />
                </div>
              ))}
            </div>
          </div>

          {/* Popular Groceries Quick-Add */}
          <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.65rem' }}>
              <h3 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', display: 'flex', alignItems: 'center', gap: '4px' }}>
                <TrendingUp size={15} color="#008751" /> Popular Groceries
              </h3>
              <span style={{ fontSize: '0.72rem', color: '#64748B' }}>Fastest moving</span>
            </div>

            <div
              style={{
                display: 'grid',
                gridTemplateColumns: 'repeat(2, 1fr)',
                gap: '8px',
              }}
            >
              {popularProducts
                .filter((p) => !selectedCategory || p.category === selectedCategory)
                .map((product) => {
                  const inCart = cart.find((c) => c.productId === product.id);
                  return (
                    <div
                      key={product.id}
                      style={{
                        background: '#FFFFFF',
                        borderRadius: '14px',
                        padding: '0.75rem',
                        border: '1px solid #E2E8F0',
                        display: 'flex',
                        flexDirection: 'column',
                        justifyContent: 'space-between',
                      }}
                    >
                      <div>
                        <div
                          style={{
                            height: '56px',
                            background: '#F8FAFC',
                            borderRadius: '10px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '1.8rem',
                            marginBottom: '6px',
                          }}
                        >
                          {product.imageUrl}
                        </div>
                        <span style={{ fontSize: '0.62rem', color: '#64748B', display: 'block' }}>
                          {product.vendorName.split(' ')[0]}
                        </span>
                        <h5
                          style={{
                            fontSize: '0.78rem',
                            fontWeight: 800,
                            color: '#0F172A',
                            lineHeight: 1.25,
                            minHeight: '32px',
                          }}
                        >
                          {product.name}
                        </h5>
                      </div>

                      <div
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          marginTop: '6px',
                        }}
                      >
                        <span style={{ fontSize: '0.85rem', fontWeight: 900, color: '#008751' }}>
                          {formatNaira(product.price)}
                        </span>
                        <button
                          onClick={() => addToCart(product, 1)}
                          style={{
                            background: inCart ? '#008751' : '#1E293B',
                            color: 'white',
                            padding: '4px 8px',
                            borderRadius: '6px',
                            fontSize: '0.7rem',
                            fontWeight: 700,
                            display: 'flex',
                            alignItems: 'center',
                            gap: '2px',
                          }}
                        >
                          <Plus size={12} />
                          {inCart ? inCart.quantity : 'Add'}
                        </button>
                      </div>
                    </div>
                  );
                })}
            </div>
          </div>
        </>
      )}
    </div>
  );
}
