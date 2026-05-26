'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface OutlineButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
}

export default function OutlineButton({
  children,
  loading = false,
  icon,
  className = '',
  ...props
}: OutlineButtonProps) {
  return (
    <button
      disabled={loading || props.disabled}
      className={`h-11 px-6 rounded-full border border-zinc-200 dark:border-zinc-800 bg-transparent text-zinc-700 dark:text-zinc-305 text-xs font-semibold uppercase tracking-widest hover:bg-zinc-50 dark:hover:bg-zinc-900 flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer disabled:opacity-50 ${className}`}
      {...props}
    >
      {loading ? (
        <div className="h-4 w-4 border-2 border-zinc-400 border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {children}
          {icon && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}
