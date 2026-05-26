'use client';
import { ReactNode } from 'react';

export default function ChatLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex h-[calc(100vh-140px)] min-h-[500px] max-h-[750px] bg-white dark:bg-zinc-900 border border-sandal-200 dark:border-zinc-800/80 rounded-3xl shadow-xl overflow-hidden">
      {children}
    </div>
  );
}
