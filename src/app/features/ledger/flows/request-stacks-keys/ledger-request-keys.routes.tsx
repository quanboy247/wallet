import { Route } from 'react-router-dom';

import { RouteUrls } from '@shared/route-urls';

import {
  ConnectLedgerError,
  ConnectLedgerSuccessLayout,
  DeviceBusy,
  UnsupportedBrowserLayout,
} from '../../generic-steps';
import { LedgerRequestKeysContainer } from './ledger-request-keys-container';
import { ConnectLedgerRequestBitcoinKeys } from './steps/connect-ledger-request-bitcoin-keys';
import { ConnectLedgerRequestStacksKeys } from './steps/connect-ledger-request-stacks-keys';

export const ledgerRequestKeysRoutes = (
  <Route element={<LedgerRequestKeysContainer />}>
    <Route path={RouteUrls.ConnectLedger} element={<ConnectLedgerRequestStacksKeys />} />
    <Route path={'bitcoin'} element={<ConnectLedgerRequestBitcoinKeys />} />
    <Route path={RouteUrls.DeviceBusy} element={<DeviceBusy />} />
    <Route path={RouteUrls.ConnectLedgerError} element={<ConnectLedgerError />} />
    <Route path={RouteUrls.ConnectLedgerSuccess} element={<ConnectLedgerSuccessLayout />} />
    <Route path={RouteUrls.LedgerUnsupportedBrowser} element={<UnsupportedBrowserLayout />} />
  </Route>
);
