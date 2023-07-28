import { Circle, color } from '@stacks/ui';

import { SupportedInscription } from '@shared/models/inscription.model';

interface BitcoinTransactionInscriptionIconProps {
  inscription: SupportedInscription;
}

export function BitcoinTransactionInscriptionIcon({
  inscription,
  ...rest
}: BitcoinTransactionInscriptionIconProps) {
  switch (inscription.type) {
    case 'image': {
      return (
        <Circle
          bg={color('accent')}
          color={color('bg')}
          flexShrink={0}
          position="relative"
          size="36px"
          {...rest}
        >
          <img
            src={inscription.src}
            style={{
              width: '100%',
              height: '100%',
              aspectRatio: '1 / 1',
              objectFit: 'cover',
              borderRadius: '6px',
              //   display: isLoading ? 'none' : 'inherit',
              //   imageRendering: width <= 40 ? 'pixelated' : 'auto',
            }}
          />
          {/* <TransactionTypeIcon transaction={transaction} /> */}
        </Circle>
      );
    }

    default:
      return null;
  }
}
