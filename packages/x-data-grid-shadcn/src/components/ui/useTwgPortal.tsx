'use client';
import * as React from 'react';

export const useTwgPortal = () => {
  const [portal, setPortal] = React.useState<HTMLElement | undefined>(() =>
    typeof document !== 'undefined'
      ? document.getElementById('twg-portal') || document.body
      : undefined,
  );
  React.useEffect(() => {
    setPortal(document.getElementById('twg-portal') || document.body);
  }, []);
  return portal;
};
