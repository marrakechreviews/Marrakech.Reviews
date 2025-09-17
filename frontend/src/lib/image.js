export const optimizeImage = (src, width, quality = 75) => {
  if (!src) return '';

  // If the image is from an external source, return it as is.
  if (src.startsWith('http') || src.startsWith('//')) {
    return src;
  }

  // For internal images, ensure the path is absolute.
  // This helps in environments where the app is not served from the root.
  // e.g. "uploads/image.jpg" becomes "/uploads/image.jpg"
  return src.startsWith('/') ? src : `/${src}`;
};
