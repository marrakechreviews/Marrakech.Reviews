export const optimizeImage = (src, width, quality = 75) => {
  if (!src) return '';
  // Return the original source path directly, bypassing Vercel Image Optimization.
  return src.startsWith('/') ? src : `/${src}`;
};
