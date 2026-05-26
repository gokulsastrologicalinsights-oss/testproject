'use client';
import { ReactNode } from 'react';

export default function Alert({ title, children, type = 'info' }: { title: string; children: ReactNode; type?: 'info' | 'warning' | 'error' }) {
  const colors = {
    info: 'bg-blue-50 border-blue-200 text-blue-800',
    warning: 'bg-amber-50 border-amber-200 text-amber-800',
    error: 'bg-red-50 border-red-200 text-red-800'
  };
  return (
    <div className={`p-4 border rounded-xl ${colors[type]}`}>
      <h4 className="font-bold text-xs">{title}</h4>
      <div className="mt-1 text-[11px] font-light">{children}</div>
    </div>
  );
}
