import { Text } from '@stacks/ui';

import { useStxAssetBalance } from '@app/common/hooks/balance/use-stx-balance';
import { useTotalBalance } from '@app/common/hooks/balance/use-total-balance';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

export function AccountTotalBalance() {
  const totalBalance = useTotalBalance();

  if (!totalBalance) return null;

  return (
    <Text fontSize="14px" color="#777E88">
      {totalBalance.totalUsdBalance}
    </Text>
  );
}

export function StxTotalBalance() {
  const account = useCurrentStacksAccount();
  const { stxUsdBalance } = useStxAssetBalance(account?.address ?? '');

  if (!stxUsdBalance) return null;

  return (
    <Text fontSize="14px" color="#777E88">
      {stxUsdBalance}
    </Text>
  );
}
