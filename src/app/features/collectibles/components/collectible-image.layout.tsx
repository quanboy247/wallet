import { useState } from 'react';

import { ErrorImageUnavailable } from './components/error-image-unavailable';

interface ImageCollectibleProps {
  src: string;
}
export function CollectibleImageLayout({ src }: ImageCollectibleProps) {
  const [isError, setIsError] = useState(false);

  if (isError) return <ErrorImageUnavailable />;

  return (
    <img
      onError={() => setIsError(true)}
      src={src}
      style={{
        width: '100%',
        height: '100%',
        aspectRatio: '1 / 1',
        objectFit: 'cover',
      }}
    />
  );
}
