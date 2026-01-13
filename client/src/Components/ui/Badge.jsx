import { motion } from 'framer-motion';

const Badge = ({ 
  children, 
  variant = 'default', 
  size = 'md',
  removable = false,
  onRemove,
  className = '',
  ...props 
}) => {
  const baseStyles = "inline-flex items-center gap-1.5 font-medium rounded-full transition-all duration-200";
  
  const variants = {
    default: "bg-[var(--surface-hover)] text-secondary border border-[var(--border)]",
    primary: "bg-gradient-to-r from-[#10b981]/20 to-[#34d399]/20 text-[#10b981] border border-[#10b981]/30",
    success: "bg-[#10b981]/20 text-[#10b981] border border-[#10b981]/30",
    warning: "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30",
    danger: "bg-red-500/20 text-red-400 border border-red-500/30",
    info: "bg-blue-500/20 text-blue-400 border border-blue-500/30",
  };

  const sizes = {
    sm: "px-2 py-0.5 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-1.5 text-base",
  };

  return (
    <motion.span
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}
      initial={{ scale: 0 }}
      animate={{ scale: 1 }}
      exit={{ scale: 0 }}
      whileHover={{ scale: 1.05 }}
      {...props}
    >
      <span>{children}</span>
      {removable && onRemove && (
        <button
          onClick={(e) => {
            e.stopPropagation();
            onRemove();
          }}
          className="ml-1 hover:text-primary transition-colors"
        >
          ×
        </button>
      )}
    </motion.span>
  );
};

export default Badge;
