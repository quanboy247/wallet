import { ChainID } from '@stacks/common';

import { ORDINALS_API_BASE_URL_MAINNET } from '@shared/constants';

import { whenStxChainId } from '@app/common/utils';
import { useCurrentNetworkState } from '@app/store/networks/networks.hooks';

import { OrdinalsClient } from './ordinals-client';

export function useOrdinalsClient() {
  const network = useCurrentNetworkState();

  const baseUrl = whenStxChainId(network.chain.stacks.chainId)({
    [ChainID.Mainnet]: ORDINALS_API_BASE_URL_MAINNET,
    [ChainID.Testnet]: '',
  });

  return new OrdinalsClient(baseUrl);
}
