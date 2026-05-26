'use client';

import { SelectHTMLAttributes, forwardRef, ReactNode } from 'react';

interface SelectInputProps extends SelectHTMLAttributes<HTMLSelectElement> {
  label: string;
  error?: string;
  children: ReactNode;
}

const SelectInput = forwardRef<HTMLSelectElement, SelectInputProps>(
  ({ label, error, children, className = '', ...props }, ref) => {
    return (
      <div className="flex flex-col gap-1 text-left w-full">
        <label className="text-xs font-bold text-zinc-500 uppercase tracking-wider">{label}</label>
        <select
          ref={ref}
          className={`w-full h-11 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-transparent text-sm focus:outline-none focus:ring-1 focus:ring-maroon-500 text-zinc-850 dark:text-zinc-150 px-3.5 ${className}`}
          {...props}
        >
          {children}
        </select>
        {error && <span className="text-[11px] text-red-500 font-semibold">{error}</span>}
      </div>
    );
  }
);

SelectInput.displayName = 'SelectInput';

export default SelectInput;
