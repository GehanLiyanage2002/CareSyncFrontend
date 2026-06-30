export const getCleanImageUrl = (url) => {
  if (!url) return url;
  if (typeof url === 'string') {
    return url.replace(/http:\/\/(localhost|127\.0\.0\.1):5000/g, import.meta.env.VITE_API_URL);
  }
  return url;
};
