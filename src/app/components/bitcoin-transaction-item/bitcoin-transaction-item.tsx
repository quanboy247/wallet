import { useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';

import { BoxProps } from '@stacks/ui';

import { BitcoinTx } from '@shared/models/transactions/bitcoin-transaction.model';
import { RouteUrls } from '@shared/route-urls';

import { useAnalytics } from '@app/common/hooks/analytics/use-analytics';
import { useExplorerLink } from '@app/common/hooks/use-explorer-link';
import {
  getBitcoinTxCaption,
  getBitcoinTxValue,
  isBitcoinTxInbound,
} from '@app/common/transactions/bitcoin/utils';
import { useWalletType } from '@app/common/use-wallet-type';
import { usePressable } from '@app/components/item-hover';
import { IncreaseFeeButton } from '@app/components/stacks-transaction-item/increase-fee-button';
import { TransactionTitle } from '@app/components/transaction/transaction-title';
import { convertInscriptionToSupportedInscriptionType } from '@app/query/bitcoin/ordinals/inscription.hooks';
import { useGetInscriptionByParamQuery } from '@app/query/bitcoin/ordinals/use-inscription-by-param';
import { useCurrentAccountNativeSegwitAddressIndexZero } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { TransactionItemLayout } from '../transaction-item/transaction-item.layout';
import { BitcoinTransactionCaption } from './bitcoin-transaction-caption';
import { BitcoinTransactionIcon } from './bitcoin-transaction-icon';
import { BitcoinTransactionInscriptionIcon } from './bitcoin-transaction-inscription-icon';
import { BitcoinTransactionStatus } from './bitcoin-transaction-status';
import { BitcoinTransactionValue } from './bitcoin-transaction-value';

interface BitcoinTransactionItemProps extends BoxProps {
  transaction?: BitcoinTx;
}
export function BitcoinTransactionItem({ transaction, ...rest }: BitcoinTransactionItemProps) {
  const [component, bind, { isHovered }] = usePressable(true);
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const { whenWallet } = useWalletType();

  const { data: inscriptionData } = useGetInscriptionByParamQuery(`output=${transaction?.txid}:0`, {
    select(data) {
      const inscription = data.results[0];
      if (!inscription) return;
      return convertInscriptionToSupportedInscriptionType(inscription);
    },
  });

  const bitcoinAddress = useCurrentAccountNativeSegwitAddressIndexZero();
  const { handleOpenTxLink } = useExplorerLink();
  const analytics = useAnalytics();
  const caption = useMemo(() => getBitcoinTxCaption(transaction), [transaction]);
  const value = useMemo(
    () => getBitcoinTxValue(bitcoinAddress, transaction),
    [bitcoinAddress, transaction]
  );

  if (!transaction) return null;

  const onIncreaseFee = () => {
    whenWallet({
      ledger: () => {
        // TO-DO when implement BTC in Ledger
      },
      software: () => navigate(RouteUrls.IncreaseBtcFee, { state: { btcTx: transaction } }),
    })();
  };

  const openTxLink = () => {
    void analytics.track('view_bitcoin_transaction');
    handleOpenTxLink({
      blockchain: 'bitcoin',
      txid: transaction?.txid || '',
    });
  };

  const isOriginator = !isBitcoinTxInbound(bitcoinAddress, transaction);
  const isEnabled = isOriginator && !transaction.status.confirmed;

  const txCaption = <BitcoinTransactionCaption>{caption}</BitcoinTransactionCaption>;
  const txValue = <BitcoinTransactionValue>{value}</BitcoinTransactionValue>;
  const txIcon = inscriptionData ? (
    <BitcoinTransactionInscriptionIcon inscription={inscriptionData} />
  ) : (
    <BitcoinTransactionIcon transaction={transaction} btcAddress={bitcoinAddress} />
  );
  const increaseFeeButton = (
    <IncreaseFeeButton
      isEnabled={isEnabled}
      isHovered={isHovered}
      isSelected={pathname === RouteUrls.IncreaseBtcFee}
      onIncreaseFee={onIncreaseFee}
    />
  );
  return (
    <TransactionItemLayout
      openTxLink={openTxLink}
      txCaption={txCaption}
      txIcon={txIcon}
      txStatus={<BitcoinTransactionStatus transaction={transaction} />}
      txTitle={<TransactionTitle title="Bitcoin" />}
      txValue={txValue}
      belowCaptionEl={increaseFeeButton}
      {...bind}
      {...rest}
    >
      {component}
    </TransactionItemLayout>
  );
}
