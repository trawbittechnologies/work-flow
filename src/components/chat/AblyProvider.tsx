"use client";

import { Realtime } from 'ably';
import { AblyProvider as ReactAblyProvider } from 'ably/react';
import { useEffect, useState, ReactNode } from 'react';

export function AblyProvider({ children }: { children: ReactNode }) {
  const [client, setClient] = useState<Realtime | null>(null);

  useEffect(() => {
    // Only initialize if we're in the browser to avoid SSR issues
    if (typeof window !== 'undefined') {
      const ablyClient = new Realtime({
        authUrl: '/api/ably/token',
        // Optional: you can add recovery mechanism or other config here
      });
      setClient(ablyClient);

      return () => {
        ablyClient.close();
      };
    }
  }, []);

  if (!client) {
    return <>{children}</>;
  }

  return (
    <ReactAblyProvider client={client}>
      {children}
    </ReactAblyProvider>
  );
}
