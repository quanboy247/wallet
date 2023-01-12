import { useContext } from 'react';

import { CommonLedgerDeviceInlineWarnings } from '@app/features/ledger/components/ledger-inline-warnings';
import { ledgerRequestKeysContext } from '@app/features/ledger/flows/request-stacks-keys/ledger-request-keys.context';
import { ConnectLedgerLayout } from '@app/features/ledger/generic-steps/connect-device/connect-ledger.layout';
import { useWhenReattemptingLedgerConnection } from '@app/features/ledger/hooks/use-when-reattempt-ledger-connection';

export const ConnectLedgerRequestBitcoinKeys = () => {
  const {
    pullBitcoinPublicKeysFromDevice,
    latestDeviceResponse,
    awaitingDeviceConnection,
    outdatedAppVersionWarning,
  } = useContext(ledgerRequestKeysContext);

  useWhenReattemptingLedgerConnection(() => pullBitcoinPublicKeysFromDevice());

  return (
    <>
      get bitcoin xpubkey
      <button onClick={pullBitcoinPublicKeysFromDevice}>get keys</button>
    </>
  );
};
