'use client';

import { ButtonHTMLAttributes, ReactNode } from 'react';

interface PrimaryButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  children: ReactNode;
  loading?: boolean;
  icon?: ReactNode;
}

export default function PrimaryButton({
  children,
  loading = false,
  icon,
  className = '',
  ...props
}: PrimaryButtonProps) {
  return (
    <button
      disabled={loading || props.disabled}
      className={`h-11 px-6 rounded-full luxury-gradient text-white text-xs font-semibold uppercase tracking-widest hover:opacity-90 shadow-md flex items-center justify-center gap-1.5 transition-all duration-200 cursor-pointer disabled:opacity-50 ${className}`}
      {...props}
    >
      {loading ? (
        <div className="h-4 w-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
      ) : (
        <>
          {children}
          {icon && <span className="shrink-0">{icon}</span>}
        </>
      )}
    </button>
  );
}
