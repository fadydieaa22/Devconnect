import { motion } from 'framer-motion';

const Card = ({ 
  children, 
  className = '', 
  hover = true,
  glass = false,
  gradient = false,
  onClick,
  ...props 
}) => {
  const baseStyles = "rounded-xl overflow-hidden transition-all duration-300";
  
  const glassStyles = glass 
    ? "bg-white/5 backdrop-blur-lg border border-white/10 shadow-xl" 
    : "card-surface";
    
  const gradientStyles = gradient 
    ? "bg-gradient-to-br from-[var(--surface)] via-[var(--surface-hover)] to-[var(--surface)]"
    : "";

  const hoverStyles = hover 
    ? "hover:shadow-2xl hover:scale-[1.02] cursor-pointer" 
    : "";

  const clickable = onClick ? "cursor-pointer" : "";

  return (
    <motion.div
      className={`${baseStyles} ${glassStyles} ${gradientStyles} ${hoverStyles} ${clickable} ${className}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      whileHover={hover ? { scale: 1.02, transition: { duration: 0.2 } } : {}}
      {...props}
    >
      {children}
    </motion.div>
  );
};

export const GlassCard = ({ children, className = '', ...props }) => (
  <Card glass className={className} {...props}>
    {children}
  </Card>
);

export const GradientCard = ({ children, className = '', ...props }) => (
  <Card gradient className={className} {...props}>
    {children}
  </Card>
);

export default Card;
