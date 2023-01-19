import { useState } from 'react';
import toast from 'react-hot-toast';
import { Outlet, useNavigate } from 'react-router-dom';

import { LedgerError } from '@zondax/ledger-stacks';
import * as bjs from 'bitcoinjs-lib';

import { logger } from '@shared/logger';
import { RouteUrls } from '@shared/route-urls';

import { useScrollLock } from '@app/common/hooks/use-scroll-lock';
import { delay } from '@app/common/utils';
import { BaseDrawer } from '@app/components/drawer/base-drawer';
import {
  LedgerRequestKeysContext,
  LedgerRequestKeysProvider,
} from '@app/features/ledger/flows/request-stacks-keys/ledger-request-keys.context';
import { useLedgerAnalytics } from '@app/features/ledger/hooks/use-ledger-analytics.hook';
import { useLedgerNavigate } from '@app/features/ledger/hooks/use-ledger-navigate';
import {
  connectBitcoinLedgerApp,
  doesLedgerStacksAppVersionSupportJwtAuth,
  getAppVersion,
  isStacksLedgerAppClosed,
  prepareLedgerDeviceConnection,
  useActionCancellableByUser,
  useLedgerResponseState,
} from '@app/features/ledger/ledger-utils';

import { pullKeysFromLedgerDevice } from './request-keys.utils';
import { useTriggerLedgerDeviceRequestKeys } from './use-trigger-ledger-request-keys';

export function LedgerRequestKeysContainer() {
  const navigate = useNavigate();
  const ledgerNavigate = useLedgerNavigate();
  const ledgerAnalytics = useLedgerAnalytics();

  const canUserCancelAction = useActionCancellableByUser();

  useScrollLock(true);

  const { completeLedgerDeviceOnboarding, fireErrorMessageToast } =
    useTriggerLedgerDeviceRequestKeys();

  const [outdatedAppVersionWarning, setAppVersionOutdatedWarning] = useState(false);
  const [latestDeviceResponse, setLatestDeviceResponse] = useLedgerResponseState();
  const [awaitingDeviceConnection, setAwaitingDeviceConnection] = useState(false);

  const pullStacksPublicKeysFromDevice = async () => {
    const stacksApp = await prepareLedgerDeviceConnection({
      setLoadingState: setAwaitingDeviceConnection,
      onError() {
        ledgerNavigate.toErrorStep();
      },
    });

    const versionInfo = await getAppVersion(stacksApp);
    ledgerAnalytics.trackDeviceVersionInfo(versionInfo);
    setLatestDeviceResponse(versionInfo);

    if (versionInfo.deviceLocked) {
      setAwaitingDeviceConnection(false);
      return;
    }

    if (versionInfo.returnCode !== LedgerError.NoErrors) {
      if (!isStacksLedgerAppClosed(versionInfo)) toast.error(versionInfo.errorMessage);
      return;
    }

    if (doesLedgerStacksAppVersionSupportJwtAuth(versionInfo)) {
      setAppVersionOutdatedWarning(true);
      return;
    }

    try {
      ledgerNavigate.toConnectionSuccessStep();
      await delay(1250);

      const resp = await pullKeysFromLedgerDevice(stacksApp)({
        onRequestKey(index) {
          ledgerNavigate.toDeviceBusyStep(`Requesting STX addresses (${index + 1}…5)`);
        },
      });
      if (resp.status === 'failure') {
        fireErrorMessageToast(resp.errorMessage);
        ledgerNavigate.toErrorStep(resp.errorMessage);
        return;
      }
      ledgerNavigate.toDeviceBusyStep();
      completeLedgerDeviceOnboarding(resp.publicKeys, latestDeviceResponse!?.targetId);
      ledgerAnalytics.publicKeysPulledFromLedgerSuccessfully();
      // navigate(RouteUrls.Home);
      // await stacksApp.transport.close();
    } catch (e) {
      logger.error('Failed to request STX keys from Ledger', e);
      ledgerNavigate.toErrorStep();
    }
    console.log('fetching btc keys');
    // fetch bitcoin xpub keys
    await delay(2000);
    navigate('bitcoin', { relative: 'route' });
    toast.success('Please open the Bitcoin app on your device');
    await delay(2000);
  };

  const pullBitcoinPublicKeysFromDevice = async () => {
    const { app: bitcoinApp } = await connectBitcoinLedgerApp();

    console.log(bjs);

    try {
      const xpub = await bitcoinApp.getWalletXpub({ path: "84'/0'/0'", xpubVersion: 0x0488b21e });
      console.log(xpub);

      // const { address } = bjs.payments.p2sh({
      //   redeem: bjs.payments.p2wpkh({
      //     pubkey: bip32.fromBase58(xpub).derive(0).derive(1).publicKey,
      //   }),
      // });

      // console.log({ address });
      console.log(lib, Purpose);
      console.log(
        'xxxx',
        lib.addressesFromExtPubKey({
          extPubKey: xpub,
          network: 'mainnet',
          addressCount: 3,
          purpose: Purpose.Purpose.P2WPKH,
        })
      );
    } catch (e) {
      console.log(e);
    }

    // const versionInfo = await getAppVersion(bitcoinApp);
    // ledgerAnalytics.trackDeviceVersionInfo(versionInfo);
    // setLatestDeviceResponse(versionInfo);

    // if (versionInfo.deviceLocked) {
    //   setAwaitingDeviceConnection(false);
    //   return;
    // }

    // if (versionInfo.returnCode !== LedgerError.NoErrors) {
    //   if (!isStacksLedgerAppClosed(versionInfo)) toast.error(versionInfo.errorMessage);
    //   return;
    // }

    // if (doesLedgerStacksAppVersionSupportJwtAuth(versionInfo)) {
    //   setAppVersionOutdatedWarning(true);
    //   return;
    // }

    // try {
    //   ledgerNavigate.toConnectionSuccessStep();
    //   await delay(1250);

    //   const resp = await pullKeysFromLedgerDevice(stacksApp)({
    //     onRequestKey(index) {
    //       ledgerNavigate.toDeviceBusyStep(`Requesting STX addresses (${index + 1}…5)`);
    //     },
    //   });
    //   if (resp.status === 'failure') {
    //     fireErrorMessageToast(resp.errorMessage);
    //     ledgerNavigate.toErrorStep(resp.errorMessage);
    //     return;
    //   }
    //   ledgerNavigate.toDeviceBusyStep();
    //   completeLedgerDeviceOnboarding(resp.publicKeys, latestDeviceResponse!?.targetId);
    //   ledgerAnalytics.publicKeysPulledFromLedgerSuccessfully();
    //   // navigate(RouteUrls.Home);
    //   // await stacksApp.transport.close();
    // } catch (e) {
    //   logger.error('Failed to request STX keys from Ledger', e);
    //   ledgerNavigate.toErrorStep();
    // }
    // console.log('fetching btc keys');
    // // fetch bitcoin xpub keys
    // await delay(2000);
    // navigate('bitcoin', { relative: 'route' });
    // toast.success('Please open the Bitcoin app on your device');
    // await delay(2000);
  };

  const onCancelConnectLedger = () => navigate(RouteUrls.Onboarding);

  const ledgerContextValue: LedgerRequestKeysContext = {
    pullStacksPublicKeysFromDevice,
    pullBitcoinPublicKeysFromDevice,
    latestDeviceResponse,
    awaitingDeviceConnection,
    outdatedAppVersionWarning,
  };

  return (
    <LedgerRequestKeysProvider value={ledgerContextValue}>
      <BaseDrawer
        isShowing
        isWaitingOnPerformedAction={awaitingDeviceConnection || canUserCancelAction}
        onClose={onCancelConnectLedger}
        pauseOnClickOutside
        waitingOnPerformedActionMessage="Ledger device in use"
      >
        <Outlet />
      </BaseDrawer>
    </LedgerRequestKeysProvider>
  );
}
