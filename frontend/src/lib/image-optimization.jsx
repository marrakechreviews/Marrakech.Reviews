import React, { useState, useRef, useEffect } from 'react';

const CLOUDINARY_CONFIG = {
  cloudName: 'dtzbxrapf',
  placeholderImage: '/placeholder-product.jpg'
};

export function getOptimizedImageUrl(src, options = {}) {
  if (!CLOUDINARY_CONFIG.cloudName || !src) {
    return src;
  }
  if (src.startsWith('http') || src.startsWith('data:')) {
    return src;
  }

  const transformationParams = [];
  if (options.width) transformationParams.push(`w_${options.width}`);
  if (options.height) transformationParams.push(`h_${options.height}`);

  if (options.width && options.height) {
    const fit = options.fit === 'crop' ? 'crop' : 'fill';
    transformationParams.push(`c_${fit}`);
  }

  if (options.quality) transformationParams.push(`q_${options.quality}`);
  else transformationParams.push('q_auto');

  if (options.format) transformationParams.push(`f_${options.format}`);
  else transformationParams.push('f_auto');

  const transformationString = transformationParams.join(',');

  const publicId = src.startsWith('/') ? src.substring(1) : src;

  return `https://res.cloudinary.com/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformationString}/${publicId}`;
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

export const OptimizedImage = ({ src, alt, width, height, sizes, className, loading = 'lazy', priority = false, fit = 'cover', onError, onLoad, ...rest }) => {
  const [hasError, setHasError] = useState(false);

  if (!src) {
    return <img src={CLOUDINARY_CONFIG.placeholderImage} alt={alt || 'Placeholder image'} width={width} height={height} className={className} />;
  }

  const handleError = (e) => {
    if (!hasError) {
      setHasError(true);
      if (onError) onError(e);
    }
  };

  if (hasError) {
    return <img src={src} alt={alt} width={width} height={height} className={className} onLoad={onLoad} />;
  }

  const options = { width, height, fit, ...rest };
  const webpSrcSet = generateSrcSet(src, sizes, { ...options, format: 'webp' });
  const avifSrcSet = generateSrcSet(src, sizes, { ...options, format: 'avif' });
  const fallbackSrc = getOptimizedImageUrl(src, options);

  return (
    <picture>
      {avifSrcSet && <source srcSet={avifSrcSet} type="image/avif" sizes={sizes} onError={handleError} />}
      {webpSrcSet && <source srcSet={webpSrcSet} type="image/webp" sizes={sizes} onError={handleError} />}
      <img src={fallbackSrc} alt={alt} width={width} height={height} className={className} loading={priority ? 'eager' : loading} fetchpriority={priority ? 'high' : 'auto'} decoding="async" onError={handleError} onLoad={onLoad} />
    </picture>
  );
};

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
