'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface SecondaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
}

export default function SecondaryButton({
  children,
  loading = false,
  icon,
  className = '',
  ...props
}: SecondaryButtonProps) {
  return (
    <button
      disabled={loading || props.disabled}
      className={`h-11 px-6 rounded-full bg-sandal-100 dark:bg-zinc-800 border border-sandal-300 dark:border-zinc-700 text-maroon-700 dark:text-gold-400 text-xs font-semibold uppercase tracking-widest hover:bg-sandal-200 dark:hover:bg-zinc-750 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer disabled:opacity-50 ${className}`}
      {...props}
    >
      {loading ? (
        <div className="h-4 w-4 border-2 border-maroon-600 dark:border-gold-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {children}
          {icon && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}
