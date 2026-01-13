// Utility to fix image URLs for proper loading
const API_BASE = import.meta.env.VITE_API_URL || "http://localhost:5000/api";
const SERVER_BASE = API_BASE.replace('/api', '');

export const getImageUrl = (imageUrl) => {
  if (!imageUrl) return null;
  
  // If already a full URL, return as is
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }
  
  // If relative path, prepend server base
  if (imageUrl.startsWith('/')) {
    return `${SERVER_BASE}${imageUrl}`;
  }
  
  // Default case
  return `${SERVER_BASE}/${imageUrl}`;
};

export default getImageUrl;
