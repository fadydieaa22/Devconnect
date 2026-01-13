import { motion, AnimatePresence } from 'framer-motion';
import { useState, useRef, useEffect } from 'react';

const Dropdown = ({ 
  trigger, 
  children, 
  align = 'right',
  className = '' 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const alignmentClasses = {
    left: 'left-0',
    right: 'right-0',
    center: 'left-1/2 -translate-x-1/2',
  };

  return (
    <div className="relative" ref={dropdownRef}>
      <div onClick={() => setIsOpen(!isOpen)} className="cursor-pointer">
        {trigger}
      </div>

      <AnimatePresence>
        {isOpen && (
          <motion.div
            className={`absolute ${alignmentClasses[align]} mt-2 min-w-[200px] bg-[var(--surface)] border border-[var(--border)] rounded-xl shadow-2xl overflow-hidden z-50 ${className}`}
            initial={{ opacity: 0, y: -10, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -10, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            {children}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export const DropdownItem = ({ 
  children, 
  onClick, 
  icon, 
  danger = false,
  className = '' 
}) => {
  return (
    <motion.button
      onClick={onClick}
      className={`
        w-full px-4 py-3 flex items-center gap-3 text-left
        ${danger ? 'text-red-400 hover:bg-red-500/10' : 'text-secondary hover:text-primary hover:bg-[var(--surface-hover)]'}
        transition-colors
        ${className}
      `}
      whileHover={{ x: 4 }}
      whileTap={{ scale: 0.98 }}
    >
      {icon && <span className="flex-shrink-0">{icon}</span>}
      <span className="flex-1">{children}</span>
    </motion.button>
  );
};

export const DropdownDivider = () => {
  return <div className="h-px bg-[var(--border)] my-1" />;
};

export default Dropdown;
