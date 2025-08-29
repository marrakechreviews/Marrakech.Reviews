export const optimizeImage = (src, width, quality = 75) => {
  if (!src) return '';
  // Ensure the source path is absolute. Cloudflare's optimization requires a path from the root.
  const absoluteSrc = src.startsWith('/') ? src.substring(1) : src;
  return `/cdn-cgi/image/width=${width},quality=${quality}/${absoluteSrc}`;
};
