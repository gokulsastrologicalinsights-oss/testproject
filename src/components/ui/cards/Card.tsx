'use client';

import { ReactNode } from 'react';

interface CardProps {
  children: ReactNode;
  className?: string;
  onClick?: () => void;
}

export default function Card({ children, className = '', onClick }: CardProps) {
  return (
    <div
      onClick={onClick}
      className={`bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800/80 rounded-3xl p-6 shadow-sm hover:shadow-md transition-all duration-300 ${
        onClick ? 'cursor-pointer hover:scale-[1.01]' : ''
      } ${className}`}
    >
      {children}
    </div>
  );
}
