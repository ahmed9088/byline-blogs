import React from 'react';

export const SkeletonLine = ({ className = '' }: { className?: string }) => {
  return (
    <div className={`animate-pulse bg-neutral-200 dark:bg-neutral-800 rounded-lg ${className}`} />
  );
};

export const SkeletonCard = () => {
  return (
    <div className="border border-zinc-200/50 dark:border-zinc-850 p-4 rounded-2xl bg-white/50 dark:bg-zinc-950/40 space-y-3">
      <SkeletonLine className="aspect-video w-full" />
      <SkeletonLine className="h-4 w-1/3" />
      <SkeletonLine className="h-6 w-3/4" />
      <SkeletonLine className="h-4 w-5/6" />
    </div>
  );
};
