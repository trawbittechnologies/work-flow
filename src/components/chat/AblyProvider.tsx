"use client";

import { Realtime } from 'ably';
import { AblyProvider as ReactAblyProvider } from 'ably/react';
import { ReactNode, useMemo } from 'react';

export function AblyProvider({ children }: { children: ReactNode }) {
  const client = useMemo(() => {
    if (typeof window === 'undefined') {
      return {} as Realtime;
    }
    return new Realtime({
      authUrl: '/api/ably/token',
    });
  }, []);

  return (
    <ReactAblyProvider client={client}>
      {children}
    </ReactAblyProvider>
  );
}
