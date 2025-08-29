import React from 'react';

const CLOUDFLARE_CONFIG = {
  domain: 'www.marrakech.reviews',
  imageResizingEnabled: true,
  supportedFormats: ['webp', 'avif', 'jpeg', 'png'],
  defaultQuality: 85,
  defaultFormat: 'webp'
};

/**
 * Generates an optimized image URL using Cloudflare Image Resizing.
 * @param {string} src - The original image source path.
 * @param {object} options - Resizing options (width, height, quality, format, etc.).
 * @returns {string} The optimized image URL.
 */
export function getOptimizedImageUrl(src, options = {}) {
  if (!src || !CLOUDFLARE_CONFIG.imageResizingEnabled) {
    return src;
  }

  // Ensure src is a relative path from the root
  const imagePath = src.startsWith('/') ? src : `/${src}`;

  // If the src is already a full URL, don't modify it
  if (src.startsWith('http')) {
    return src;
  }

  const params = new URLSearchParams();
  const { width, height, quality, format, fit } = {
    quality: CLOUDFLARE_CONFIG.defaultQuality,
    format: CLOUDFLARE_CONFIG.defaultFormat,
    ...options
  };

  if (width) params.set('width', width);
  if (height) params.set('height', height);
  if (quality) params.set('quality', quality);
  if (format) params.set('format', format);
  if (fit) params.set('fit', fit);

  return `https://images.marrakech.reviews/cdn-cgi/image/${params.toString()}${imagePath}`;
}

/**
 * A React component that renders an optimized image with srcset for different formats.
 */
export const OptimizedImage = ({
  src,
  alt,
  width,
  height,
  sizes,
  className,
  loading = 'lazy',
  priority = false,
  ...props
}) => {
  if (!src) {
    return null;
  }

  const commonOptions = { width, height, quality: CLOUDFLARE_CONFIG.defaultQuality, ...props };

  const webpSrc = getOptimizedImageUrl(src, { ...commonOptions, format: 'webp' });
  const avifSrc = getOptimizedImageUrl(src, { ...commonOptions, format: 'avif' });
  const fallbackSrc = getOptimizedImageUrl(src, { ...commonOptions, format: 'jpeg' });

  // Generate srcset for different resolutions
  const generateSrcSet = (format) => {
    const resolutions = [width, width * 2, width * 3].filter(Boolean);
    return resolutions
      .map(w => `${getOptimizedImageUrl(src, { ...commonOptions, width: w, format })} ${w}w`)
      .join(', ');
  };

  return (
    <picture>
      <source type="image/avif" srcSet={generateSrcSet('avif')} sizes={sizes} />
      <source type="image/webp" srcSet={generateSrcSet('webp')} sizes={sizes} />
      <source type="image/jpeg" srcSet={generateSrcSet('jpeg')} sizes={sizes} />
      <img
        src={fallbackSrc}
        alt={alt}
        width={width}
        height={height}
        loading={loading}
        className={className}
        fetchpriority={priority ? 'high' : 'auto'}
        {...props}
      />
    </picture>
  );
};

export const PRESETS = {
  hero: {
    desktop: { width: 1920, height: 1080, quality: 90 },
    mobile: { width: 768, height: 1024, quality: 85 }
  },
  thumbnail: {
    large: { width: 400, height: 300, quality: 85 },
    medium: { width: 250, height: 188, quality: 80 },
    small: { width: 150, height: 113, quality: 75 }
  },
  avatar: {
    large: { width: 128, height: 128, fit: 'crop' },
    small: { width: 64, height: 64, fit: 'crop' }
  }
};

export function getPresetImage(src, presetName, sizeName) {
  const preset = PRESETS[presetName]?.[sizeName];
  if (!preset) {
    console.warn(`Image preset "${presetName}.${sizeName}" not found.`);
    return src;
  }
  return getOptimizedImageUrl(src, preset);
}

export function useOptimizedImage(src, options) {
    const optimizedSrc = getOptimizedImageUrl(src, options);
    const webpSrc = getOptimizedImageUrl(src, { ...options, format: 'webp' });
    const avifSrc = getOptimizedImageUrl(src, { ...options, format: 'avif' });

    return { optimizedSrc, webpSrc, avifSrc };
}
