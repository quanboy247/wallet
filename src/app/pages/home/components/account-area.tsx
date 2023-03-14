import { memo } from 'react';

import { Stack, StackProps } from '@stacks/ui';

import { CurrentAccountAvatar } from '@app/features/current-account/current-account-avatar';
import { CurrentAccountName } from '@app/features/current-account/current-account-name';
import { useConfigBitcoinEnabled } from '@app/query/common/hiro-config/hiro-config.query';
import { useCurrentStacksAccount } from '@app/store/accounts/blockchain/stacks/stacks-account.hooks';

import { AccountTotalBalance, StxTotalBalance } from './account-total-balance';

export const CurrentAccount = memo((props: StackProps) => {
  const isBitcoinEnabled = useConfigBitcoinEnabled();

  const currentAccount = useCurrentStacksAccount();
  if (!currentAccount) return null;
  return (
    <Stack spacing="base-tight" alignItems="center" isInline {...props}>
      <CurrentAccountAvatar />
      <Stack overflow="hidden" display="block" alignItems="flex-start" spacing="base-tight">
        <CurrentAccountName />
        {isBitcoinEnabled && <AccountTotalBalance />}
        {!isBitcoinEnabled && <StxTotalBalance />}
      </Stack>
    </Stack>
  );
});
