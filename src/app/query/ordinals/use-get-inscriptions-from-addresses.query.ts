import { useQuery } from '@tanstack/react-query';

import { OrdinalsClient } from './ordinals-client';
import { useOrdinalsClient } from './ordinals-client.hooks';

function createQueryFn(client: OrdinalsClient, addresses: string[]) {
  return async function () {
    return client.inscriptionsApi.getInscriptionsFromAddresses(addresses);
  };
}

export function useGetInscriptionsFromAddresses(addresses: string[]) {
  const client = useOrdinalsClient();
  return useQuery({
    queryKey: ['ordinal-inscriptions-from-addresses', client.configuration, addresses],
    queryFn: createQueryFn(client, addresses),
  });
}
