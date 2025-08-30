import React from 'react';
import { Helmet } from 'react-helmet-async';
import JsonLd from '../components/JsonLd';

export const useSEO = ({
  title,
  description,
  keywords,
  image,
  url,
  type = 'website',
  structuredData
}) => {
  return (
    <Helmet>
      {title && <title>{title}</title>}
      {description && <meta name="description" content={description} />}
      {keywords && <meta name="keywords" content={keywords} />}
      {url && <link rel="canonical" href={url} />}
      
      {/* Open Graph tags */}
      {url && <meta property="og:url" content={url} />}
      {title && <meta property="og:title" content={title} />}
      {description && <meta property="og:description" content={description} />}
      {type && <meta property="og:type" content={type} />}
      {image && <meta property="og:image" content={image} />}
      
      {/* Twitter Card tags */}
      {title && <meta name="twitter:title" content={title} />}
      {description && <meta name="twitter:description" content={description} />}
      {image && <meta name="twitter:image" content={image} />}

      {structuredData && <JsonLd data={structuredData} />}
    </Helmet>
  );
};

export const generateProductStructuredData = (product, settings) => {
  return {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": product.name,
    "description": product.description,
    "image": product.images,
    "sku": product._id,
    "brand": {
      "@type": "Brand",
      "name": settings?.general?.siteName || "Marrakech.Reviews"
    },
    "offers": {
      "@type": "Offer",
      "price": product.price,
      "priceCurrency": settings?.general?.currency || "USD",
      "availability": product.inStock ? "https://schema.org/InStock" : "https://schema.org/OutOfStock",
      "seller": {
        "@type": "Organization",
        "name": settings?.general?.siteName || "Marrakech.Reviews"
      }
    },
    "aggregateRating": product.rating && product.numReviews ? {
      "@type": "AggregateRating",
      "ratingValue": product.rating,
      "reviewCount": product.numReviews
    } : undefined
  };
};

export const generateBreadcrumbStructuredData = (breadcrumbs) => {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": breadcrumbs.map((crumb, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": crumb.name,
      "item": crumb.url
    }))
  };
};
