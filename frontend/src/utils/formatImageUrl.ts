/**
 * Ensures that image URLs are correctly formatted with the server base URL
 * if they are relative paths
 * 
 * @param url The image URL to format
 * @returns Formatted URL with server base path if needed
 */
export const formatImageUrl = (url: string): string => {
  if (!url) return 'https://via.placeholder.com/600x450';
  
  // If the URL already has http/https, return as is
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url;
  }
  
  // If it's a relative path, add the server base URL
  const serverBaseUrl = import.meta.env.VITE_API_URL?.replace('/api', '') || 'http://localhost:5001';
  return `${serverBaseUrl}${url.startsWith('/') ? '' : '/'}${url}`;
}; 