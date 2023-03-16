import { useQuery } from '@tanstack/react-query';
import { string } from 'yup';

import { createCounter } from '@app/common/utils/counter';
import { Inscription } from '@app/query/ordinals/ordinals-client';
import { useOrdinalsClient } from '@app/query/ordinals/ordinals-client.hooks';
import { useCurrentTaprootAccountKeychain } from '@app/store/accounts/blockchain/bitcoin/taproot-account.hooks';
// import { useBitcoinClient } from '@app/store/common/api-clients.hooks';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { UtxoResponseItem } from '../bitcoin-client';
import { getTaprootAddress, hasInscriptions } from './utils';

const stopSearchAfterNumberAddressesWithoutOrdinals = 20;

const addressSchema = string().required();

export interface TaprootUtxo extends UtxoResponseItem {
  addressIndex: number;
}

/**
 * Returns all utxos for the user's current taproot account. The search for utxos iterates through
 * all addresses until a sufficiently large number of empty addresses is found.
 */
export function useNewInscriptionsQuery() {
  const network = useCurrentNetwork();
  const keychain = useCurrentTaprootAccountKeychain();
  //   const client = useBitcoinClient();
  const ordinalsClient = useOrdinalsClient();

  return useQuery(['inscriptions', ordinalsClient.configuration], async () => {
    let currentNumberOfAddressesWithoutOrdinals = 0;
    const addressIndexCounter = createCounter(0);
    let foundInscriptions: Inscription[] = [];
    while (
      currentNumberOfAddressesWithoutOrdinals < stopSearchAfterNumberAddressesWithoutOrdinals
    ) {
      // NOTE: return type of `getTaprootAddress` is `any`. Validation ensures it is a string.
      const maybeAddress: unknown = getTaprootAddress({
        index: addressIndexCounter.getValue(),
        keychain,
        network: network.chain.bitcoin.network,
      });
      const address = addressSchema.validateSync(maybeAddress);

      const res = await ordinalsClient.inscriptionsApi.getInscriptionsFromAddresses([address]);

      console.log('ARY address', address);
      console.log('ARY results:', res.results);

      if (!hasInscriptions(res.results)) {
        currentNumberOfAddressesWithoutOrdinals += 1;
        addressIndexCounter.increment();
        continue;
      }

      foundInscriptions = [...foundInscriptions, ...res.results];

      currentNumberOfAddressesWithoutOrdinals = 0;
      addressIndexCounter.increment();
    }
    return foundInscriptions;
  });
}
