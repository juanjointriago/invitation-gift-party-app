import React from 'react';
import { motion } from 'framer-motion';

interface SkeletonLoaderProps {
  count?: number;
  type?: 'text' | 'card' | 'image' | 'avatar' | 'circle';
  width?: string;
  height?: string;
  className?: string;
}

const shimmerAnimation = {
  initial: { backgroundPosition: '0% 0%' },
  animate: { backgroundPosition: '100% 0%' },
  transition: { duration: 1.5, repeat: Infinity },
};

export const SkeletonLoader: React.FC<SkeletonLoaderProps> = ({
  count = 1,
  type = 'text',
  width = 'w-full',
  height = 'h-4',
  className,
}) => {
  const skeletons = Array.from({ length: count });

  const baseClasses =
    'bg-gradient-to-r from-gray-200 via-gray-100 to-gray-200 bg-[length:200%_100%] rounded';

  const typeClasses = {
    text: `${width} ${height} rounded`,
    card: `${width} h-48 rounded-lg`,
    image: `${width} h-64 rounded-lg`,
    avatar: 'w-12 h-12 rounded-full',
    circle: 'w-16 h-16 rounded-full',
  };

  return (
    <div className={className || 'space-y-4'}>
      {skeletons.map((_, index) => (
        <motion.div
          key={index}
          {...shimmerAnimation}
          className={`${baseClasses} ${typeClasses[type]}`}
        />
      ))}
    </div>
  );
};

// Skeleton para lista de cards
export const CardSkeletonLoader: React.FC<{ count?: number }> = ({ count = 3 }) => {
  return (
    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
      {Array.from({ length: count }).map((_, index) => (
        <motion.div
          key={index}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: index * 0.1 }}
          className="space-y-4 p-4 border border-border rounded-lg"
        >
          <SkeletonLoader type="image" />
          <SkeletonLoader type="text" height="h-6" />
          <SkeletonLoader type="text" height="h-4" width="w-3/4" />
          <div className="space-y-2 pt-2">
            <SkeletonLoader type="text" height="h-3" />
            <SkeletonLoader type="text" height="h-3" width="w-2/3" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

// Skeleton para tabla
export const TableSkeletonLoader: React.FC<{ rows?: number; columns?: number }> = ({
  rows = 5,
  columns = 4,
}) => {
  return (
    <div className="space-y-3">
      {Array.from({ length: rows }).map((_, rowIndex) => (
        <div key={rowIndex} className="flex gap-4">
          {Array.from({ length: columns }).map((_, colIndex) => (
            <SkeletonLoader
              key={colIndex}
              type="text"
              height="h-8"
              width={colIndex === 0 ? 'w-24' : 'flex-1'}
            />
          ))}
        </div>
      ))}
    </div>
  );
};
