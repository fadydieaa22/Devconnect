import { motion } from "framer-motion";

const shimmer = {
  hidden: { backgroundPosition: '-200% 0' },
  visible: { 
    backgroundPosition: '200% 0',
    transition: {
      repeat: Infinity,
      duration: 2,
      ease: 'linear'
    }
  }
};

const Skeleton = ({ className = '', width, height, circle = false }) => {
  const baseStyles = "bg-gradient-to-r from-[var(--surface-hover)] via-[var(--surface)] to-[var(--surface-hover)] bg-[length:200%_100%] rounded";
  
  return (
    <motion.div
      className={`${baseStyles} ${circle ? 'rounded-full' : 'rounded-lg'} ${className}`}
      style={{ width, height }}
      variants={shimmer}
      initial="hidden"
      animate="visible"
    />
  );
};

export const ProjectSkeleton = () => {
  return (
    <motion.div 
      className="card-surface p-6 rounded-xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
    >
      <Skeleton className="mb-4" height="200px" />
      <Skeleton className="mb-3" width="70%" height="24px" />
      <Skeleton className="mb-2" width="100%" height="16px" />
      <Skeleton className="mb-4" width="90%" height="16px" />
      <div className="flex gap-2 mt-4">
        <Skeleton width="60px" height="24px" />
        <Skeleton width="70px" height="24px" />
        <Skeleton width="65px" height="24px" />
      </div>
      <div className="flex items-center justify-between mt-4 pt-4 border-t border-[var(--border)]">
        <div className="flex items-center gap-2">
          <Skeleton circle width="32px" height="32px" />
          <Skeleton width="80px" height="16px" />
        </div>
        <Skeleton width="60px" height="16px" />
      </div>
    </motion.div>
  );
};

export const UserListSkeleton = () => {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
      {[1, 2, 3, 4, 5, 6].map((i) => (
        <motion.div 
          key={i} 
          className="card-surface rounded-xl p-6"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.1 }}
        >
          <div className="flex items-start gap-3 mb-4">
            <Skeleton circle width="56px" height="56px" />
            <div className="flex-1">
              <Skeleton width="120px" height="20px" className="mb-2" />
              <Skeleton width="80px" height="16px" />
            </div>
          </div>
          <Skeleton width="100%" height="16px" className="mb-2" />
          <Skeleton width="80%" height="16px" className="mb-4" />
          <div className="grid grid-cols-2 gap-3 mb-4 py-4 border-y border-[var(--border)]">
            <div className="text-center">
              <Skeleton width="40px" height="24px" className="mx-auto mb-1" />
              <Skeleton width="60px" height="12px" className="mx-auto" />
            </div>
            <div className="text-center">
              <Skeleton width="40px" height="24px" className="mx-auto mb-1" />
              <Skeleton width="60px" height="12px" className="mx-auto" />
            </div>
          </div>
          <Skeleton width="100%" height="40px" />
        </motion.div>
      ))}
    </div>
  );
};

export const ProfileSkeleton = () => {
  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <div className="card-surface p-8 rounded-2xl mb-8">
        <div className="flex flex-col md:flex-row gap-6">
          <Skeleton circle width="120px" height="120px" />
          <div className="flex-1">
            <Skeleton width="200px" height="32px" className="mb-3" />
            <Skeleton width="150px" height="20px" className="mb-4" />
            <Skeleton width="100%" height="16px" className="mb-2" />
            <Skeleton width="90%" height="16px" className="mb-6" />
            <div className="flex gap-4">
              <Skeleton width="100px" height="40px" />
              <Skeleton width="100px" height="40px" />
            </div>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {[1, 2, 3].map((i) => (
          <ProjectSkeleton key={i} />
        ))}
      </div>
    </motion.div>
  );
};

export const DashboardSkeleton = () => {
  return (
    <motion.div 
      className="max-w-7xl mx-auto px-4 py-8"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
    >
      <Skeleton width="300px" height="40px" className="mb-8" />
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        {[1, 2, 3].map((i) => (
          <div key={i} className="card-surface p-6 rounded-xl">
            <Skeleton width="100px" height="16px" className="mb-2" />
            <Skeleton width="60px" height="36px" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="card-surface p-6 rounded-xl">
          <Skeleton circle width="80px" height="80px" className="mb-4" />
          <Skeleton width="150px" height="24px" className="mb-2" />
          <Skeleton width="120px" height="16px" className="mb-6" />
          <Skeleton width="100%" height="40px" />
        </div>
        <div className="lg:col-span-2 card-surface p-6 rounded-xl">
          <Skeleton width="200px" height="28px" className="mb-6" />
          {[1, 2, 3].map((i) => (
            <div key={i} className="mb-4">
              <Skeleton width="100%" height="100px" />
            </div>
          ))}
        </div>
      </div>
    </motion.div>
  );
};

export default Skeleton;
