import { useMemo } from 'react';

import { initialParams } from '@shared/initial-params';
import { getPayloadFromToken } from '@shared/utils/requests';

export function useTransactionRequest() {
  return initialParams.get('request');
}

export function useTransactionRequestState() {
  const requestToken = useTransactionRequest();
  return useMemo(() => {
    if (!requestToken) return null;
    return getPayloadFromToken(requestToken);
  }, [requestToken]);
}
