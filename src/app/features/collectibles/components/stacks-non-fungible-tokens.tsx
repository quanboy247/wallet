import { useState } from 'react';

import StacksNft from '@assets/images/stacks-nft.png';

import { StacksNftMetadata } from '@shared/models/stacks-nft-metadata.model';
import { isValidUrl } from '@shared/utils/validate-url';

import { CollectibleItemLayout } from './collectible-item.layout';
import { ErrorImageUnavailable } from './components/error-image-unavailable';

const backgroundProps = {
  backgroundColor: 'transparent',
  border: 'transparent',
  borderRadius: '16px',
};

interface StacksNftCryptoAssetsProps {
  metadata: StacksNftMetadata;
}

export function StacksNonFungibleTokens({ metadata }: StacksNftCryptoAssetsProps) {
  const [isError, setIsError] = useState(false);
  const isImageAvailable = metadata && metadata.cached_image && isValidUrl(metadata?.cached_image);
  const placeholderImage = StacksNft;

  return (
    <CollectibleItemLayout
      backgroundElementProps={backgroundProps}
      subtitle="Stacks NFT"
      title={metadata?.name ?? 'Unknown'}
    >
      {isError || !isImageAvailable ? (
        <ErrorImageUnavailable />
      ) : (
        <img
          alt="nft image"
          onError={() => setIsError(true)}
          src={isImageAvailable ? metadata?.cached_image : placeholderImage}
          style={{ aspectRatio: '1 / 1', objectFit: 'cover' }}
        />
      )}
    </CollectibleItemLayout>
  );
}
