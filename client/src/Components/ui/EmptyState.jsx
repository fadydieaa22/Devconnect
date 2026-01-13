import { motion } from 'framer-motion';
import Button from './Button';

const EmptyState = ({ 
  icon = '📭',
  title = 'No data found',
  description,
  actionLabel,
  onAction,
  className = ''
}) => {
  return (
    <motion.div
      className={`flex flex-col items-center justify-center py-16 px-4 ${className}`}
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    >
      <motion.div
        className="text-8xl mb-6"
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        transition={{ type: 'spring', delay: 0.2 }}
      >
        {icon}
      </motion.div>
      
      <h3 className="text-2xl font-bold text-primary mb-2">{title}</h3>
      
      {description && (
        <p className="text-secondary text-center max-w-md mb-6">
          {description}
        </p>
      )}
      
      {actionLabel && onAction && (
        <Button onClick={onAction} variant="primary">
          {actionLabel}
        </Button>
      )}
    </motion.div>
  );
};

export default EmptyState;
