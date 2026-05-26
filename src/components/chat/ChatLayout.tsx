'use client';
import { ReactNode } from 'react';

export default function ChatLayout({ children }: { children: ReactNode }) {
  return <div className="flex h-[600px] border rounded-2xl overflow-hidden">{children}</div>;
}
