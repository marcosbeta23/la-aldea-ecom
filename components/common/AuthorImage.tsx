'use client';

import React from 'react';

interface AuthorImageProps {
  src: string;
  alt: string;
}

export default function AuthorImage({ src, alt }: AuthorImageProps) {
  const [error, setError] = React.useState(false);

  return (
    <img
      src={error ? "/logo.svg" : src}
      alt={alt}
      className={`h-full w-full ${error ? 'object-contain p-2' : 'object-cover'}`}
      onError={() => setError(true)}
    />
  );
}
