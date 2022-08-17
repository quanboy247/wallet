import { useQuery } from 'react-query';
import { NETWORKS, PROTOCOL, UbiquityClient } from '@ubiquity/ubiquity-ts-client';

import { BLOCKDAEMON_API_KEY } from '@shared/environment';

const client = new UbiquityClient(BLOCKDAEMON_API_KEY);

const staleTime = 15 * 60 * 1000; // 15 min

const queryOptions = {
  keepPreviousData: true,
  cacheTime: staleTime,
  refetchOnMount: false,
  refetchInterval: false,
  refetchOnReconnect: false,
} as const;

// Using Blockdaemon ts client library
export function useGetTransactionsByAddressQueryUsingUbiquityClient(address: string) {
  return client.accountsApi
    .getTxsByAddress(PROTOCOL.BITCOIN, NETWORKS.MAIN_NET, address)
    .then(txsPage1 => console.log(txsPage1.data))
    .catch(e => console.log(`error code::${e.response.status} url::${e.config.url}`));
}

// Using Bloackdaemon api directly with react-query
export function useGetTransactionsByAddressQuery(address: string) {
  const fetchTransactionsByAddress = async () => {
    const response = await fetch(
      `https://ubiquity.api.blockdaemon.com/v1/bitcoin/mainnet/account/${address}/txs?apiKey=${BLOCKDAEMON_API_KEY}`
    );
    if (!response.ok) {
      throw new Error('No transactions fetched');
    }
    const data = await response.json();
    console.log(data);
    return data;
  };

  return useQuery({
    queryKey: ['btc-txs-by-address', address],
    queryFn: fetchTransactionsByAddress,
    ...queryOptions,
  });
}
