'use client';

import Chat from '@/components/Chat';

export default function Home() {
  return (
    <div className="flex-1 flex flex-col items-center h-[calc(100vh-64px)]">
      {/* Full Chat Interface */}
      <div className="w-full max-w-5xl mx-auto h-full">
        <Chat />
      </div>
    </div>
  );
}
