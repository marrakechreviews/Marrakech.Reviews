import React, { useState, useRef, useEffect } from 'react';

const CLOUDFLARE_CONFIG = {
  domain: 'www.marrakech.reviews',
  imageResizingEnabled: true,
  supportedFormats: ['webp', 'avif', 'jpeg', 'png'],
  defaultQuality: 85,
  defaultFormat: 'webp',
  placeholderImage: '/placeholder-product.jpg'
};

export function getOptimizedImageUrl(src, options = {}) {
  if (!CLOUDFLARE_CONFIG.imageResizingEnabled || !src) {
    return src;
  }
  if (src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }
  const absoluteSrc = src.startsWith('/') ? src : `/${src}`;
  const params = {
    quality: options.quality || CLOUDFLARE_CONFIG.defaultQuality,
    ...options,
  };
  const validOptions = Object.keys(params)
    .filter(key => !['src', 'alt', 'priority', 'className', 'sizes', 'loading', 'height', 'onError'].includes(key))
    .reduce((obj, key) => {
        obj[key] = params[key];
        return obj;
    }, {});
  const paramsString = Object.entries(validOptions).map(([key, value]) => `${key}=${value}`).join(',');
  return `https://${CLOUDFLARE_CONFIG.domain}/cdn-cgi/image/${paramsString}${absoluteSrc}`;
}

const generateSrcSet = (src, sizes, options) => {
    if (!sizes) return null;
    const srcSetWidths = [320, 480, 640, 750, 828, 1080, 1200, 1920, 2048, 3840].filter(w => w <= (options.width * 2));
    if (srcSetWidths.length === 0 || !options.width) return null;
    if (srcSetWidths.indexOf(options.width) === -1) srcSetWidths.push(options.width);
    return srcSetWidths
        .map(w => `${getOptimizedImageUrl(src, { ...options, width: w })} ${w}w`)
        .join(', ');
};

export const OptimizedImage = ({ src, alt, width, height, sizes, className, loading = 'lazy', priority = false, fit = 'cover', onError, ...rest }) => {
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return <img src={CLOUDFLARE_CONFIG.placeholderImage} alt={alt || 'Placeholder image'} width={width} height={height} className={className} />;
  }

  const handleError = (e) => {
    // Avoids a loop if the fallback image itself is broken
    if (!hasError) {
      setHasError(true);
      if (onError) onError(e);
    }
  };

  if (hasError) {
    // Fallback to original, un-optimized image
    return <img src={src} alt={alt} width={width} height={height} className={className} />;
  }

  const options = { width, fit, ...rest };
  const webpSrcSet = generateSrcSet(src, sizes, { ...options, format: 'webp' });
  const avifSrcSet = generateSrcSet(src, sizes, { ...options, format: 'avif' });
  const fallbackSrc = getOptimizedImageUrl(src, options);

  return (
    <picture>
      {avifSrcSet && <source srcSet={avifSrcSet} type="image/avif" sizes={sizes} onError={handleError} />}
      {webpSrcSet && <source srcSet={webpSrcSet} type="image/webp" sizes={sizes} onError={handleError} />}
      <img src={fallbackSrc} alt={alt} width={width} height={height} className={className} loading={priority ? 'eager' : loading} fetchpriority={priority ? 'high' : 'auto'} decoding="async" onError={handleError} />
    </picture>
  );
};

// Advanced Image component with Intersection Observer
export function IntelligentOptimizedImage({ src, alt, ...props }) {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsInView(true);
          observer.disconnect();
        }
      },
      { rootMargin: '50px' }
    );

    if (imgRef.current) {
      observer.observe(imgRef.current);
    }

    return () => observer.disconnect();
  }, []);

  return (
    <div ref={imgRef} className={`relative ${props.className || ''}`} style={{ width: props.width, height: props.height }}>
      {isInView && (
        <OptimizedImage
          src={src}
          alt={alt}
          onLoad={() => setIsLoaded(true)}
          className={`transition-opacity duration-300 ${isLoaded ? 'opacity-100' : 'opacity-0'}`}
          {...props}
        />
      )}
      {!isLoaded && (
        <div className="absolute inset-0 bg-gray-200 animate-pulse" style={{ width: props.width, height: props.height }} />
      )}
    </div>
  );
}

// Presets
export const MARRAKECH_PRESETS = {
  restaurant: {
    card: { width: 400, height: 300, quality: 85, fit: 'cover' },
    detail: { width: 800, height: 600, quality: 90, fit: 'cover' },
    thumbnail: { width: 150, height: 150, quality: 80, fit: 'crop' }
  },
  activity: {
    hero: { width: 1200, height: 600, quality: 90, fit: 'cover' },
    card: { width: 350, height: 250, quality: 85, fit: 'cover' },
    gallery: { width: 600, height: 400, quality: 88, fit: 'cover' }
  },
  accommodation: {
    showcase: { width: 1000, height: 667, quality: 92, fit: 'cover' },
    room: { width: 500, height: 375, quality: 87, fit: 'cover' },
    amenity: { width: 300, height: 200, quality: 83, fit: 'cover' }
  },
  hero: {
      desktop: { width: 1920, height: 1080, quality: 90 },
      mobile: { width: 768, height: 1024, quality: 85 }
  },
  thumbnail: {
      small: { width: 150, height: 150, quality: 80, fit: 'crop' },
      medium: { width: 300, height: 225, quality: 85, fit: 'cover' },
      large: { width: 400, height: 300, quality: 85, fit: 'cover' }
  },
  avatar: {
      small: { width: 48, height: 48, quality: 80, fit: 'crop' },
      large: { width: 96, height: 96, quality: 85, fit: 'crop' }
  }
};

export function getPresetImage(src, presetCategory, presetSize) {
  const preset = MARRAKECH_PRESETS[presetCategory]?.[presetSize];
  if (!preset) {
    console.warn(`Image preset not found for: ${presetCategory}.${presetSize}`);
    return src;
  }
  return getOptimizedImageUrl(src, preset);
}
