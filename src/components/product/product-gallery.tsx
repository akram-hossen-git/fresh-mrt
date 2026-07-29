'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Image from 'next/image';
import { cn } from '@/lib/utils';
import { useProductVariant } from '@/components/product/product-variant-context';

interface Photo {
  variant: string;
  color: string;
  path: string;
}

interface ProductGalleryProps {
  photos: Photo[];
  productName: string;
}

export default function ProductGallery({ photos, productName }: ProductGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isZooming, setIsZooming] = useState(false);
  const [zoomPosition, setZoomPosition] = useState({ x: 50, y: 50 });
  const mainImageRef = useRef<HTMLDivElement>(null);
  const thumbnailContainerRef = useRef<HTMLDivElement>(null);
  const variantCtx = useProductVariant();
  const selectedColorCode = variantCtx?.selectedColorCode ?? '';

  // Gallery is color-driven: show the selected color's images, falling back to the
  // general product photos (color === "") when that color has no dedicated images.
  // Size selection never changes the gallery.
  const fallbackPhotos = photos.filter((p) => p.color === '');
  const colorPhotos = selectedColorCode
    ? photos.filter((p) => p.color === selectedColorCode)
    : [];
  const displayPhotos = colorPhotos.length > 0 ? colorPhotos : fallbackPhotos;

  // Reset to the first image whenever the displayed color gallery changes.
  useEffect(() => {
    setActiveIndex(0);
    setIsZooming(false);
  }, [selectedColorCode]);

  const activePhoto = displayPhotos[activeIndex] ?? displayPhotos[0];

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLDivElement>) => {
      if (!mainImageRef.current) return;
      const rect = mainImageRef.current.getBoundingClientRect();
      const x = ((e.clientX - rect.left) / rect.width) * 100;
      const y = ((e.clientY - rect.top) / rect.height) * 100;
      setZoomPosition({
        x: Math.max(0, Math.min(100, x)),
        y: Math.max(0, Math.min(100, y)),
      });
    },
    []
  );

  const handleMouseEnter = useCallback(() => {
    setIsZooming(true);
  }, []);

  const handleMouseLeave = useCallback(() => {
    setIsZooming(false);
  }, []);

  const handleThumbnailClick = useCallback((index: number) => {
    setActiveIndex(index);
    setIsZooming(false);
  }, []);

  if (!displayPhotos || displayPhotos.length === 0) {
    return (
      <div className="flex items-center justify-center aspect-square rounded-[8px] bg-neutral-100 dark:bg-neutral-800">
        <span className="text-neutral-400 dark:text-neutral-500 font-sans text-sm">
          No images available
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col md:flex-row gap-3 w-full">
      {/* Thumbnails - horizontal on mobile, vertical on desktop */}
      <div
        ref={thumbnailContainerRef}
        className={cn(
          'order-2 md:order-1',
          'flex md:flex-col gap-2',
          'overflow-x-auto md:overflow-x-visible md:overflow-y-auto',
          'pb-2 md:pb-0 md:pr-1',
          'md:max-h-[600px] md:w-20 shrink-0',
          'scrollbar-thin scrollbar-thumb-neutral-300 dark:scrollbar-thumb-neutral-600'
        )}
      >
        {displayPhotos.map((photo, index) => (
          <button
            key={`${photo.color}-${photo.variant}-${index}`}
            onClick={() => handleThumbnailClick(index)}
            className={cn(
              'relative shrink-0 w-16 h-16 md:w-full md:h-20 rounded-[8px] overflow-hidden',
              'border-2 transition-all duration-300',
              'focus:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-2',
              'dark:focus-visible:ring-offset-neutral-900',
              index === activeIndex
                ? 'border-accent shadow-md'
                : 'border-neutral-200 dark:border-neutral-700 hover:border-neutral-300 dark:hover:border-neutral-600'
            )}
            aria-label={`View ${photo.variant || productName} image`}
            aria-current={index === activeIndex ? 'true' : undefined}
          >
            <Image
              src={photo.path}
              alt={`${productName} - ${photo.variant}`}
              fill
              sizes="80px"
              className={cn(
                'object-cover transition-all duration-300',
                index === activeIndex ? 'opacity-100' : 'opacity-70 hover:opacity-100'
              )}
            />
          </button>
        ))}
      </div>

      {/* Main image with zoom */}
      <div className="order-1 md:order-2 flex-1 min-w-0">
        <div
          ref={mainImageRef}
          onMouseMove={handleMouseMove}
          onMouseEnter={handleMouseEnter}
          onMouseLeave={handleMouseLeave}
          className={cn(
            'relative w-full aspect-square rounded-[8px] overflow-hidden',
            'bg-neutral-50 dark:bg-neutral-800',
            'cursor-crosshair select-none'
          )}
          role="img"
          aria-label={`${productName} - ${activePhoto?.variant ?? ''} (hover to zoom)`}
        >
          {/* Base image layer */}
          {displayPhotos.map((photo, index) => (
            <div
              key={`main-${photo.color}-${photo.variant}-${index}`}
              className={cn(
                'absolute inset-0 transition-all duration-500',
                index === activeIndex ? 'opacity-100 z-10' : 'opacity-0 z-0'
              )}
            >
              <Image
                src={photo.path}
                alt={`${productName} - ${photo.variant}`}
                fill
                sizes="(max-width: 768px) 100vw, 50vw"
                className="object-cover"
                priority={index === 0}
              />
            </div>
          ))}

          {/* Zoom overlay */}
          {activePhoto && (
            <div
              className={cn(
                'absolute inset-0 z-20 overflow-hidden pointer-events-none',
                'transition-opacity duration-300',
                isZooming ? 'opacity-100' : 'opacity-0'
              )}
              aria-hidden="true"
            >
              <div
                className="absolute w-full h-full"
                style={{
                  backgroundImage: `url(${activePhoto.path})`,
                  backgroundSize: '200%',
                  backgroundPosition: `${zoomPosition.x}% ${zoomPosition.y}%`,
                  backgroundRepeat: 'no-repeat',
                }}
              />
            </div>
          )}

          {/* Zoom hint badge */}
          <div
            className={cn(
              'absolute bottom-3 right-3 z-30',
              'px-3 py-1.5 rounded-[8px]',
              'bg-black/50 dark:bg-white/20 backdrop-blur-sm',
              'text-white text-xs font-sans',
              'transition-all duration-300',
              'pointer-events-none select-none',
              isZooming ? 'opacity-0' : 'opacity-100'
            )}
          >
            Hover to zoom
          </div>
        </div>

        {/* Variant label */}
        {activePhoto?.variant && (
          <p className="mt-2 text-sm font-sans text-neutral-500 dark:text-neutral-400 transition-all duration-300">
            {activePhoto.variant}
          </p>
        )}
      </div>
    </div>
  );
}
