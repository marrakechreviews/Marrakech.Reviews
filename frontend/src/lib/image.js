export const optimizeImage = (src, width, quality = 75) => {
  if (!src) return '';
  // Ensure the source path is absolute. Vercel's optimization requires a path from the root.
  const absoluteSrc = src.startsWith('/') ? src : `/${src}`;
  return `/_vercel/image?url=${encodeURIComponent(absoluteSrc)}&w=${width}&q=${quality}`;
};
