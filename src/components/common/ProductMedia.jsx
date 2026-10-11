import React from 'react';

/**
 * Universal Product Media Component
 * Renders high-res real product image if URL exists, or falls back to emoji icon.
 */
export function ProductMedia({
  src,
  alt = 'Product',
  size = 44,
  fallback = '🛒',
  style = {},
  className = '',
}) {
  const isImage = typeof src === 'string' && (src.startsWith('/') || src.startsWith('http') || src.startsWith('data:'));

  if (isImage) {
    return (
      <img
        src={src}
        alt={alt}
        className={className}
        style={{
          width: typeof size === 'number' ? `${size}px` : size,
          height: typeof size === 'number' ? `${size}px` : size,
          objectFit: 'contain',
          borderRadius: '8px',
          display: 'block',
          ...style,
        }}
      />
    );
  }

  return (
    <span
      className={className}
      style={{
        fontSize: typeof size === 'number' ? `${Math.round(size * 0.6)}px` : '1.4rem',
        lineHeight: 1,
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        width: typeof size === 'number' ? `${size}px` : size,
        height: typeof size === 'number' ? `${size}px` : size,
        userSelect: 'none',
        ...style,
      }}
    >
      {src || fallback}
    </span>
  );
}

export default ProductMedia;
