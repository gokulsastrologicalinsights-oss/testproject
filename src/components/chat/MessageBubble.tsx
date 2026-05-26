'use client';
export default function MessageBubble({ message, isSelf }: { message: string; isSelf: boolean }) {
  return (
    <div className={`flex flex-col ${isSelf ? 'items-end' : 'items-start'} w-full`}>
      <div 
        className={`p-3.5 rounded-2xl max-w-[70%] text-sm leading-relaxed ${
          isSelf 
            ? 'luxury-gradient text-white rounded-tr-none shadow-md' 
            : 'bg-sandal-50/70 dark:bg-zinc-800 text-zinc-850 dark:text-zinc-100 border border-sandal-100 dark:border-zinc-750 rounded-tl-none'
        }`}
      >
        {message}
      </div>
    </div>
  );
}
