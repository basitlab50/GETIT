import React from 'react';
import { usePlatform } from '../../context/PlatformContext';
import { formatNaira } from '../../utils/feeCalculator';
import { Star, MapPin, Clock, Plus, Store, Check, ArrowRight } from 'lucide-react';
import ProductMedia from '../common/ProductMedia';

export default function ProductSearchCompare({ searchQuery, onSelectShop }) {
  const { products, vendors, addToCart, cart } = usePlatform();

  // Filter products by keyword, name, or brand
  const filteredProducts = products.filter((p) => {
    const q = searchQuery.toLowerCase().trim();
    if (!q) return true;
    const matchName = p.name.toLowerCase().includes(q);
    const matchBrand = p.brand?.toLowerCase().includes(q);
    const matchKeywords = p.keywords?.some((k) => k.toLowerCase().includes(q));
    return matchName || matchBrand || matchKeywords;
  });

  // Group products by generic name or brand to enable multi-shop comparison (Spec Section 9)
  const groupedByName = filteredProducts.reduce((acc, prod) => {
    // Simplify name key (e.g. "Indomie Instant Noodles (Chicken Flavour 70g)")
    const key = prod.name;
    if (!acc[key]) acc[key] = [];
    acc[key].push(prod);
    return acc;
  }, {});

  return (
    <div style={{ padding: '0.5rem 0' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.85rem' }}>
        <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0F172A' }}>
          Search & Shop Comparison ({filteredProducts.length} results)
        </h3>
        <span style={{ fontSize: '0.72rem', color: '#008751', fontWeight: 700 }}>
          ⚡ Best Price Matching
        </span>
      </div>

      {Object.keys(groupedByName).length === 0 ? (
        <div style={{ textAlign: 'center', padding: '2rem 1rem', background: '#FFFFFF', borderRadius: '16px' }}>
          <p style={{ fontSize: '0.85rem', color: '#64748B' }}>
            No products found matching "{searchQuery}". Try searching "Indomie", "Rice", "Milo", or "Tomatoes".
          </p>
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1.25rem' }}>
          {Object.entries(groupedByName).map(([productTitle, variants]) => {
            // Sort variants by price ascending
            const sortedVariants = [...variants].sort((a, b) => a.price - b.price);
            const lowestPrice = sortedVariants[0]?.price;

            return (
              <div
                key={productTitle}
                style={{
                  background: '#FFFFFF',
                  borderRadius: '16px',
                  padding: '1rem',
                  border: '1px solid #E2E8F0',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.02)',
                }}
              >
                {/* Product Header */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '10px', marginBottom: '0.85rem' }}>
                  <div
                    style={{
                      width: '46px',
                      height: '46px',
                      background: '#FFFFFF',
                      border: '1px solid #E2E8F0',
                      borderRadius: '12px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      overflow: 'hidden',
                      padding: '2px',
                      flexShrink: 0,
                    }}
                  >
                    <ProductMedia src={variants[0].imageUrl} alt={productTitle} size={42} />
                  </div>
                  <div>
                    <h4 style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0F172A', lineHeight: 1.2 }}>
                      {productTitle}
                    </h4>
                    <span style={{ fontSize: '0.72rem', color: '#64748B' }}>
                      Available in {variants.length} nearby shop{variants.length > 1 ? 's' : ''}
                    </span>
                  </div>
                </div>

                {/* Shop Comparison Cards Grid (Spec Section 9) */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {sortedVariants.map((item) => {
                    const vendor = vendors.find((v) => v.id === item.vendorId);
                    const isLowest = item.price === lowestPrice;
                    const inCartCount = cart.find((c) => c.productId === item.id)?.quantity || 0;

                    return (
                      <div
                        key={item.id}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'space-between',
                          padding: '0.65rem 0.85rem',
                          borderRadius: '12px',
                          background: isLowest ? '#F0FDF4' : '#F8FAFC',
                          border: isLowest ? '1px solid #86EFAC' : '1px solid #E2E8F0',
                        }}
                      >
                        {/* Shop info */}
                        <div style={{ flex: 1 }}>
                          <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                            <span style={{ fontSize: '0.82rem', fontWeight: 800, color: '#0F172A' }}>
                              {item.vendorName}
                            </span>
                            {isLowest && (
                              <span
                                style={{
                                  background: '#008751',
                                  color: 'white',
                                  fontSize: '0.62rem',
                                  padding: '1px 5px',
                                  borderRadius: '4px',
                                  fontWeight: 800,
                                }}
                              >
                                CHEAPEST
                              </span>
                            )}
                          </div>

                          <div
                            style={{
                              display: 'flex',
                              alignItems: 'center',
                              gap: '10px',
                              fontSize: '0.7rem',
                              color: '#64748B',
                              marginTop: '2px',
                            }}
                          >
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Star size={11} fill="#F59E0B" color="#F59E0B" />
                              <strong>{vendor?.rating || 4.7}</strong>
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <MapPin size={11} /> {vendor?.distanceKm || 1.5} km
                            </span>
                            <span style={{ display: 'flex', alignItems: 'center', gap: '2px' }}>
                              <Clock size={11} /> {vendor?.prepTimeMins || '15'} mins
                            </span>
                          </div>
                        </div>

                        {/* Price & Action */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                          <div style={{ textAlign: 'right' }}>
                            <div style={{ fontSize: '0.95rem', fontWeight: 900, color: isLowest ? '#008751' : '#0F172A' }}>
                              {formatNaira(item.price)}
                            </div>
                            <span style={{ fontSize: '0.65rem', color: '#64748B' }}>
                              {item.stock > 0 ? `${item.stock} in stock` : 'Out of stock'}
                            </span>
                          </div>

                          <button
                            onClick={() => addToCart(item, 1)}
                            disabled={item.stock <= 0}
                            style={{
                              background: isLowest ? '#008751' : '#1E293B',
                              color: '#FFFFFF',
                              padding: '6px 10px',
                              borderRadius: '8px',
                              fontSize: '0.75rem',
                              fontWeight: 700,
                              display: 'flex',
                              alignItems: 'center',
                              gap: '4px',
                            }}
                          >
                            <Plus size={13} />
                            {inCartCount > 0 ? `(${inCartCount})` : 'Add'}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
