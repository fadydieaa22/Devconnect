import { motion } from 'framer-motion';
import { forwardRef } from 'react';

const Button = forwardRef(({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  fullWidth = false,
  disabled = false,
  isLoading = false,
  leftIcon,
  rightIcon,
  className = '',
  onClick,
  type = 'button',
  ...props 
}, ref) => {
  const baseStyles = "font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 relative overflow-hidden";
  
  const variants = {
    primary: "bg-gradient-to-r from-[#10b981] to-[#34d399] text-white hover:shadow-lg hover:shadow-[#10b981]/30 hover:scale-[1.02] active:scale-[0.98]",
    secondary: "bg-[var(--surface-hover)] border border-[var(--border)] text-primary hover:bg-[var(--surface)] hover:border-[var(--border-hover)]",
    outline: "bg-transparent border-2 border-[#10b981] text-[#10b981] hover:bg-[#10b981] hover:text-white",
    ghost: "bg-transparent text-secondary hover:bg-[var(--surface-hover)] hover:text-primary",
    danger: "bg-gradient-to-r from-red-500 to-red-600 text-white hover:shadow-lg hover:shadow-red-500/30 hover:scale-[1.02]",
    success: "bg-gradient-to-r from-[#10b981] to-[#34d399] text-white hover:shadow-lg hover:shadow-[#10b981]/30 hover:scale-[1.02]",
  };

  const sizes = {
    sm: "px-3 py-1.5 text-sm",
    md: "px-4 py-2 text-base",
    lg: "px-6 py-3 text-lg",
    xl: "px-8 py-4 text-xl",
  };

  const disabledStyles = disabled || isLoading ? "opacity-50 cursor-not-allowed pointer-events-none" : "cursor-pointer";
  const widthStyles = fullWidth ? "w-full" : "";

  return (
    <motion.button
      ref={ref}
      type={type}
      className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${disabledStyles} ${widthStyles} ${className}`}
      onClick={onClick}
      disabled={disabled || isLoading}
      whileHover={{ scale: disabled || isLoading ? 1 : 1.02 }}
      whileTap={{ scale: disabled || isLoading ? 1 : 0.98 }}
      {...props}
    >
      {isLoading && (
        <div className="absolute inset-0 flex items-center justify-center bg-inherit">
          <div className="w-5 h-5 border-2 border-current border-t-transparent rounded-full animate-spin"></div>
        </div>
      )}
      
      <span className={`flex items-center gap-2 ${isLoading ? 'opacity-0' : 'opacity-100'}`}>
        {leftIcon && <span className="flex-shrink-0">{leftIcon}</span>}
        {children}
        {rightIcon && <span className="flex-shrink-0">{rightIcon}</span>}
      </span>
    </motion.button>
  );
});

Button.displayName = 'Button';

export default Button;
