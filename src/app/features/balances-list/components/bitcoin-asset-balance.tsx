import { Box } from '@stacks/ui';

import { useBtcAssetBalance } from '@app/common/hooks/balance/use-btc-balance';
import { CryptoCurrencyAssetItem } from '@app/components/crypto-assets/crypto-currency-asset/crypto-currency-asset-item';
import { BtcIcon } from '@app/components/icons/btc-icon';

export function BitcoinAssetBalance() {
  const { btcAddress, btcAssetBalance, btcUsdBalance } = useBtcAssetBalance();

  return (
    <CryptoCurrencyAssetItem
      assetBalance={btcAssetBalance}
      usdBalance={btcUsdBalance}
      icon={<Box as={BtcIcon} />}
      address={btcAddress}
    />
  );
}
