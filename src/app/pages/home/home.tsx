import { useEffect } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';

import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import { hash160 } from '@stacks/transactions';

import { RouteUrls } from '@shared/route-urls';

import { useTrackFirstDeposit } from '@app/common/hooks/analytics/transactions-analytics.hooks';
import { useOnboardingState } from '@app/common/hooks/auth/use-onboarding-state';
import { useRouteHeader } from '@app/common/hooks/use-route-header';
import { Header } from '@app/components/header';
import { ActivityList } from '@app/features/activity-list/activity-list';
import { BalancesList } from '@app/features/balances-list/balances-list';
import { HiroMessages } from '@app/features/hiro-messages/hiro-messages';
import { connectBitcoinLedgerApp } from '@app/features/ledger/ledger-utils';
import { SuggestedFirstSteps } from '@app/features/suggested-first-steps/suggested-first-steps';
import { HomeActions } from '@app/pages/home/components/home-actions';
import { useBitcoinClient } from '@app/store/common/api-clients.hooks';

import { CurrentAccount } from './components/account-area';
import { HomeTabs } from './components/home-tabs';
import { HomeLayout } from './components/home.layout';
import { HomeContainer } from './home.container';

export function Home() {
  const { decodedAuthRequest } = useOnboardingState();
  const navigate = useNavigate();
  useTrackFirstDeposit();

  useRouteHeader(
    <>
      <HiroMessages mx="tight" />
      <Header />
    </>
  );

  const btcClient = useBitcoinClient();
  useEffect(() => {
    // async function run() {
    //   const resp = await btcClient.addressApi.getUtxosByAddress(
    //     'tb1q09zshdflc8qryqce8z078c6u3tl39z3k8c0dgd'
    //   );
    //   console.log(resp);
    // }
    // void run();
    if (decodedAuthRequest) navigate(RouteUrls.ChooseAccount);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // function createNativeSegWitOutputScript(publicKey: string) {
  //   return new Uint8Array([...Uint8Array.from([0]), ...hash160(hexToBytes(publicKey))]);
  // }

  return (
    <HomeContainer>
      {account => (
        <HomeLayout
          suggestedFirstSteps={<SuggestedFirstSteps />}
          currentAccount={<CurrentAccount />}
          actions={<HomeActions />}
        >
          <button
            onClick={async () => {
              const { app, transport } = await connectBitcoinLedgerApp();
              // console.log(await app.signP2SHTransaction)
              try {
                const path = "84'/0'/0'/0/0";
                console.log(path);
                const ledgerPublicKey = await app.getWalletPublicKey(path, {
                  verify: true,
                  format: 'bech32',
                });
                // const resp = await btcClient.addressApi.getUtxosByAddress(
                //   'tb1q09zshdflc8qryqce8z078c6u3tl39z3k8c0dgd'
                // );
                console.log(ledgerPublicKey);

                // app
                // console.log(resp, [resp[0].txid, resp[0].vout]);
                // const ledgerResp = await app.createPaymentTransaction({
                //   inputs: [[resp[0].txid, resp[0].vout, null, null]],
                //   associatedKeysets: ["0'/0/0"],
                //   outputScriptHex: bytesToHex(createNativeSegWitOutputScript()),
                //   segwit: true,
                //   additionals: ['bech32'],
                // });
                // console.log(ledgerResp);
              } catch (e) {
                console.log(e);
              } finally {
                void transport.close();
              }
            }}
          >
            sign transactions
          </button>
          <HomeTabs
            balances={<BalancesList address={account.address} />}
            activity={<ActivityList />}
          />
          <Outlet />
        </HomeLayout>
      )}
    </HomeContainer>
  );
}
