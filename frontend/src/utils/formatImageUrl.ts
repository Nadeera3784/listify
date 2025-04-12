
export const formatImageUrl = (url: string): string => {
  if (!url) return 'https://via.placeholder.com/600x450';
  
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  const serverBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
  return `${serverBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}; 