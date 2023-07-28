import { useEffect, useMemo, useState } from 'react';
import { useInView } from 'react-intersection-observer';

import { Box } from '@stacks/ui';

import { useCurrentAccountNativeSegwitIndexZeroSigner } from '@app/store/accounts/blockchain/bitcoin/native-segwit-account.hooks';

import { TransactionListItem } from './transaction-list-item';
import { TransactionListLayout } from './transaction-list.layout';
import { TransactionListBitcoinTx, TransactionListStacksTx } from './transaction-list.model';
import { createTxDateFormatList, getTransactionId } from './transaction-list.utils';
import { TransactionsByDateLayout } from './transactions-by-date.layout';

interface TransactionListProps {
  bitcoinTxs: TransactionListBitcoinTx[];
  stacksTxs: TransactionListStacksTx[];
}

export function TransactionList({ bitcoinTxs, stacksTxs }: TransactionListProps) {
  const nativeSegwitSigner = useCurrentAccountNativeSegwitIndexZeroSigner();
  const currentBitcoinAddress = nativeSegwitSigner.address;

  const [visibleTxsNum, setVisibleTxsNum] = useState(10);
  const { ref: intersectionSentinel, inView } = useInView({
    rootMargin: '0% 0% 20% 0%',
  });

  useEffect(() => {
    if (inView) {
      setVisibleTxsNum(visibleTxsNum + 10);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [inView]);

  useEffect(() => {
    setVisibleTxsNum(10);
  }, [currentBitcoinAddress]);

  const txsGroupedByDate = useMemo(
    () =>
      bitcoinTxs.length || stacksTxs.length ? createTxDateFormatList(bitcoinTxs, stacksTxs) : [],
    [bitcoinTxs, stacksTxs]
  );

  const groupedByDateTxsLength = useMemo(() => {
    return txsGroupedByDate.reduce((acc: Record<string, number>, item, index) => {
      acc[index] = item.txs.length + (acc[index - 1] || 0);
      return acc;
    }, {});
  }, [txsGroupedByDate]);

  return (
    <TransactionListLayout>
      {txsGroupedByDate.map(({ date, displayDate, txs }, dateIndex) => {
        if (groupedByDateTxsLength[dateIndex - 1] > visibleTxsNum) {
          return null;
        }

        return (
          <TransactionsByDateLayout date={date} displayDate={displayDate} key={date}>
            {txs.map((tx, txIndex) => {
              if ((groupedByDateTxsLength[dateIndex - 1] || 0) + txIndex > visibleTxsNum)
                return null;

              return <TransactionListItem key={getTransactionId(tx)} tx={tx} />;
            })}
          </TransactionsByDateLayout>
        );
      })}
      <Box ref={intersectionSentinel} />
    </TransactionListLayout>
  );
}
