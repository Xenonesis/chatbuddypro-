'use client';

import Chat from '@/components/Chat';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center">
      {/* Full Chat Interface */}
      <div className="w-full max-w-5xl mx-auto px-3 sm:px-4 py-2 sm:py-4">
        <Chat />
      </div>
    </div>
  );
}
