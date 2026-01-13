import { formatDistanceToNow, format } from 'date-fns';
import { getImageUrl } from './imageUtils';

export const formatDate = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy');
};

export const formatDateTime = (date) => {
  if (!date) return '';
  return format(new Date(date), 'MMM d, yyyy h:mm a');
};

export const formatRelativeTime = (date) => {
  if (!date) return '';
  return formatDistanceToNow(new Date(date), { addSuffix: true });
};

export const truncateText = (text, maxLength = 100) => {
  if (!text || text.length <= maxLength) return text;
  return text.substring(0, maxLength) + '...';
};

export const getInitials = (name) => {
  if (!name) return 'U';
  return name
    .split(' ')
    .map((n) => n[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();
};

export const getAvatarUrl = (avatar) => {
  return getImageUrl(avatar);
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const validateEmail = (email) => {
  const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return re.test(email);
};

export const validateUsername = (username) => {
  const re = /^[a-z0-9_-]{3,20}$/;
  return re.test(username);
};

export const formatNumber = (num) => {
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + 'M';
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + 'K';
  }
  return num.toString();
};

export const generateGradient = (seed) => {
  const colors = [
    ['#FF6B6B', '#FF8E53'],
    ['#4ECDC4', '#44A08D'],
    ['#A770EF', '#CF8BF3'],
    ['#FFA07A', '#FD1D1D'],
    ['#00B4DB', '#0083B0'],
    ['#F2994A', '#F2C94C'],
  ];
  
  const index = Math.abs(seed.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0)) % colors.length;
  return `linear-gradient(135deg, ${colors[index][0]}, ${colors[index][1]})`;
};

export const copyToClipboard = async (text) => {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    return false;
  }
};

export const shareUrl = async (url, title) => {
  if (navigator.share) {
    try {
      await navigator.share({ title, url });
      return true;
    } catch (err) {
      return false;
    }
  }
  return copyToClipboard(url);
};
