import { useAccountTransactionsWithTransfers } from '@app/common/hooks/account/use-account-transactions-with-transfers.hooks';
import { useGetTransactionsByAddressQuery } from '@app/data/query-bitcoin/transactions/transactions-by-address.query';
import { useCurrentAccountFilteredMempoolTransactionsState } from '@app/data/query-stacks/mempool/mempool.hooks';
import { TransactionsList } from '@app/features/activity-list/components/transactions-list';
import { useSubmittedTransactions } from '@app/store/submitted-transactions/submitted-transactions.selectors';

import { NoAccountActivity } from './components/no-account-activity';
import { SubmittedTransactions } from './components/submitted-transactions';

export const ActivityList = () => {
  const transactions = useAccountTransactionsWithTransfers();
  const pendingTransactions = useCurrentAccountFilteredMempoolTransactionsState();
  const submittedTransactions = useSubmittedTransactions();
  // Query a random address for testing
  void useGetTransactionsByAddressQuery('3Kzh9qAqVWQhEsfQz7zEQL1EuSx5tyNLNS');

  const allTransactions = [...pendingTransactions, ...transactions];
  const hasTransactions = allTransactions.length > 0;
  const hasSubmittedTransactions = submittedTransactions.length > 0;
  const hasTxs = hasTransactions || hasSubmittedTransactions;

  if (!hasTxs) return <NoAccountActivity />;

  return (
    <>
      {hasSubmittedTransactions && <SubmittedTransactions txs={submittedTransactions} />}
      {hasTransactions && <TransactionsList txs={allTransactions} />}
    </>
  );
};
