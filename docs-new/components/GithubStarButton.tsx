'use client';
import Script from 'next/script';
import * as React from 'react';

export const GithubStarsButton = () => {
  const id = React.useId();
  return (
    <>
      <span className="h-[20px] text-transparent">
        <a
          href="https://github.com/twgrid/react"
          data-color-scheme={'light'}
          data-icon="octicon-star"
          data-show-count="true"
          aria-label="Star twgrid/react on GitHub"
          className="github-button"
          suppressHydrationWarning
        >
          Star
        </a>
      </span>
      <Script src={`https://buttons.github.io/buttons.js?v=${id}`} strategy="lazyOnload" />
    </>
  );
};
