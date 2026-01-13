import { motion } from 'framer-motion';
import { getInitials, getAvatarUrl, generateGradient } from '../../utils/helpers';

const Avatar = ({ 
  user, 
  src, 
  name, 
  size = 'md', 
  online = false,
  showOnline = false,
  className = '',
  onClick,
  ...props 
}) => {
  const avatarSrc = src || user?.avatar;
  const displayName = name || user?.name;
  
  const sizes = {
    xs: 'w-8 h-8 text-xs',
    sm: 'w-10 h-10 text-sm',
    md: 'w-12 h-12 text-base',
    lg: 'w-16 h-16 text-lg',
    xl: 'w-24 h-24 text-2xl',
    '2xl': 'w-32 h-32 text-4xl',
  };

  const onlineSizes = {
    xs: 'w-2 h-2 border',
    sm: 'w-2.5 h-2.5 border-2',
    md: 'w-3 h-3 border-2',
    lg: 'w-4 h-4 border-2',
    xl: 'w-5 h-5 border-2',
    '2xl': 'w-6 h-6 border-2',
  };

  const imageUrl = getAvatarUrl(avatarSrc);
  const initials = getInitials(displayName);
  const gradient = generateGradient(displayName || 'User');

  return (
    <motion.div 
      className={`relative flex-shrink-0 ${onClick ? 'cursor-pointer' : ''}`}
      whileHover={onClick ? { scale: 1.1 } : {}}
      whileTap={onClick ? { scale: 0.95 } : {}}
      onClick={onClick}
      {...props}
    >
      <div className={`${sizes[size]} rounded-full overflow-hidden ring-2 ring-[var(--border)] ${className}`}>
        {imageUrl ? (
          <img 
            src={imageUrl} 
            alt={displayName || 'Avatar'} 
            className="w-full h-full object-cover"
          />
        ) : (
          <div 
            className="w-full h-full flex items-center justify-center text-white font-bold"
            style={{ background: gradient }}
          >
            {initials}
          </div>
        )}
      </div>
      
      {showOnline && (
        <motion.div 
          className={`absolute bottom-0 right-0 ${onlineSizes[size]} rounded-full ${
            online ? 'bg-green-500' : 'bg-gray-500'
          } border-[var(--surface)]`}
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ delay: 0.2 }}
        />
      )}
    </motion.div>
  );
};

export default Avatar;
