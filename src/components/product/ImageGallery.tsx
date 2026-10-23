import React, { useState } from 'react';
import { STORE_CONFIG } from '../../config/store';

interface ImageGalleryProps {
  images: string[];
  productName: string;
}

export const ImageGallery: React.FC<ImageGalleryProps> = ({ images, productName }) => {
  const safeImages = images && images.length > 0 ? images.slice(0, 4) : [STORE_CONFIG.placeholderImageUrl];
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [brokenImages, setBrokenImages] = useState<Record<number, boolean>>({});

  const handleImageError = (index: number) => {
    setBrokenImages((prev) => ({ ...prev, [index]: true }));
  };

  const currentImageSrc = brokenImages[selectedIndex]
    ? STORE_CONFIG.placeholderImageUrl
    : safeImages[selectedIndex] || STORE_CONFIG.placeholderImageUrl;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--space-3)' }}>
      {/* Imagen Principal */}
      <div
        style={{
          position: 'relative',
          width: '100%',
          paddingBottom: '100%',
          backgroundColor: 'var(--lavender-veil)',
          borderRadius: 'var(--radius-lg)',
          overflow: 'hidden',
          border: '1px solid var(--border-subtle)',
        }}
      >
        <img
          src={currentImageSrc}
          alt={`${productName} — Vista ${selectedIndex + 1}`}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'cover',
          }}
          onError={() => handleImageError(selectedIndex)}
        />
      </div>

      {/* Miniaturas de las 4 imágenes */}
      {safeImages.length > 1 && (
        <div
          role="tablist"
          aria-label="Selector de imágenes del producto"
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${safeImages.length}, 1fr)`,
            gap: 'var(--space-2)',
          }}
        >
          {safeImages.map((imgUrl, index) => {
            const isSelected = selectedIndex === index;
            const thumbSrc = brokenImages[index] ? STORE_CONFIG.placeholderImageUrl : imgUrl;

            return (
              <button
                key={index}
                type="button"
                role="tab"
                aria-selected={isSelected}
                aria-label={`Ver foto ${index + 1} de ${safeImages.length}`}
                onClick={() => setSelectedIndex(index)}
                style={{
                  position: 'relative',
                  width: '100%',
                  paddingBottom: '100%',
                  borderRadius: 'var(--radius-md)',
                  overflow: 'hidden',
                  border: isSelected ? '2px solid var(--rose-kiss)' : '1px solid var(--border-medium)',
                  backgroundColor: 'var(--lavender-veil)',
                  padding: 0,
                  cursor: 'pointer',
                  transition: 'border-color var(--transition-fast)',
                }}
              >
                <img
                  src={thumbSrc}
                  alt=""
                  aria-hidden="true"
                  loading="lazy"
                  onError={() => handleImageError(index)}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: 0,
                    width: '100%',
                    height: '100%',
                    objectFit: 'cover',
                  }}
                />
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};
