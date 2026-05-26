'use client';
export default function MessageBubble({ message, isSelf }: { message: string; isSelf: boolean }) {
  return (
    <div className={`p-3 rounded-xl max-w-xs ${isSelf ? 'bg-maroon-600 text-white self-end' : 'bg-zinc-100 text-zinc-800 self-start'}`}>
      {message}
    </div>
  );
}
