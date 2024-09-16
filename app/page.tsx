'use client';

import dynamic from 'next/dynamic';

import { useMemo } from 'react';

export default function Home() {
  const SimpleMap = useMemo(
    () =>
      dynamic(() => import('./simpleMap'), {
        loading: () => <p>map loading...</p>,
        ssr: false,
      }),
    []
  );
  return <SimpleMap />;
}