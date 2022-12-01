import { useMemo } from 'react';

import { initialParams } from '@shared/initial-params';
import { isString } from '@shared/utils';

export function useDefaultRequestParams() {
  return useMemo(() => {
    const origin = initialParams.get('origin');
    const tabId = initialParams.get('tabId');
    const flow = initialParams.get('flow');

    return {
      origin,
      flow,
      tabId: isString(tabId) ? parseInt(tabId) : tabId,
    };
  }, []);
}
