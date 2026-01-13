import { forwardRef } from 'react';
import { motion } from 'framer-motion';

const Input = forwardRef(({ 
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  className = '',
  containerClassName = '',
  ...props 
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary mb-2">
          {label}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-secondary">
            {leftIcon}
          </div>
        )}
        
        <motion.input
          ref={ref}
          className={`
            w-full px-4 py-2.5 rounded-lg
            bg-[var(--surface-hover)] 
            border border-[var(--border)]
            text-primary placeholder-muted
            focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent
            transition-all duration-200
            ${leftIcon ? 'pl-10' : ''}
            ${rightIcon ? 'pr-10' : ''}
            ${error ? 'border-red-500 focus:ring-red-500' : ''}
            ${className}
          `}
          whileFocus={{ scale: 1.01 }}
          {...props}
        />
        
        {rightIcon && (
          <div className="absolute right-3 top-1/2 -translate-y-1/2 text-secondary">
            {rightIcon}
          </div>
        )}
      </div>
      
      {error && (
        <motion.p 
          className="mt-1 text-sm text-red-400"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export const TextArea = forwardRef(({ 
  label,
  error,
  helperText,
  className = '',
  containerClassName = '',
  rows = 4,
  ...props 
}, ref) => {
  return (
    <div className={`w-full ${containerClassName}`}>
      {label && (
        <label className="block text-sm font-medium text-secondary mb-2">
          {label}
        </label>
      )}
      
      <motion.textarea
        ref={ref}
        rows={rows}
        className={`
          w-full px-4 py-2.5 rounded-lg
          bg-[var(--surface-hover)] 
          border border-[var(--border)]
          text-primary placeholder-muted
          focus:outline-none focus:ring-2 focus:ring-[#10b981] focus:border-transparent
          transition-all duration-200
          resize-none
          ${error ? 'border-red-500 focus:ring-red-500' : ''}
          ${className}
        `}
        whileFocus={{ scale: 1.01 }}
        {...props}
      />
      
      {error && (
        <motion.p 
          className="mt-1 text-sm text-red-400"
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
        >
          {error}
        </motion.p>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-xs text-muted">
          {helperText}
        </p>
      )}
    </div>
  );
});

TextArea.displayName = 'TextArea';

export default Input;
