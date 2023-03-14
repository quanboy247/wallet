import { useCallback, useMemo } from 'react';
import { useSelector } from 'react-redux';

import { HDKey } from '@scure/bip32';
import * as btc from '@scure/btc-signer';

import { deriveAddressIndexZeroFromAccount } from '@shared/crypto/bitcoin/bitcoin.utils';
import { deriveNativeSegWitReceiveAddressIndex } from '@shared/crypto/bitcoin/p2wpkh-address-gen';
import { isUndefined } from '@shared/utils';

import { whenNetwork } from '@app/common/utils';
import {
  formatBitcoinAccount,
  tempHardwareAccountForTesting,
} from '@app/store/accounts/blockchain/bitcoin/bitcoin-account.models';
import { useCurrentNetwork } from '@app/store/networks/networks.selectors';

import { useCurrentAccountIndex } from '../../account';
import {
  selectMainnetNativeSegWitKeychain,
  selectTestnetNativeSegWitKeychain,
} from './bitcoin-keychain';

function useNativeSegWitCurrentNetworkAccountKeychain() {
  const network = useCurrentNetwork();
  return useSelector(
    whenNetwork(network.chain.bitcoin.network)({
      mainnet: selectMainnetNativeSegWitKeychain,
      testnet: selectTestnetNativeSegWitKeychain,
    })
  );
}

export function useAllBitcoinNativeSegWitNetworksByAccount() {
  const mainnetKeychainAtAccount = useSelector(selectMainnetNativeSegWitKeychain);
  const testnetKeychainAtAccount = useSelector(selectTestnetNativeSegWitKeychain);

  return useCallback(
    (accountIndex: number) => {
      if (!mainnetKeychainAtAccount || !testnetKeychainAtAccount)
        throw new Error('Cannot derive addresses in non-software mode');
      return {
        mainnet: deriveNativeSegWitReceiveAddressIndex({
          xpub: mainnetKeychainAtAccount(accountIndex).publicExtendedKey,
          network: 'mainnet',
        })?.address,
        testnet: deriveNativeSegWitReceiveAddressIndex({
          xpub: testnetKeychainAtAccount(accountIndex).publicExtendedKey,
          network: 'testnet',
        })?.address,
      };
    },
    [mainnetKeychainAtAccount, testnetKeychainAtAccount]
  );
}

function useBitcoinNativeSegwitAccount(index: number) {
  const keychain = useNativeSegWitCurrentNetworkAccountKeychain();
  return useMemo(() => {
    // TODO: Remove with bitcoin Ledger integration
    if (isUndefined(keychain)) return tempHardwareAccountForTesting;
    return formatBitcoinAccount(keychain(index))(index);
  }, [keychain, index]);
}

function useCurrentBitcoinNativeSegwitAccount() {
  const currentAccountIndex = useCurrentAccountIndex();
  return useBitcoinNativeSegwitAccount(currentAccountIndex);
}

function useDeriveNativeSegWitAccountIndexAddressIndexZero(xpub: string) {
  const network = useCurrentNetwork();
  return useMemo(
    () =>
      deriveNativeSegWitReceiveAddressIndex({
        xpub,
        network: network.chain.bitcoin.network,
      }),
    [xpub, network]
  );
}

export function useCurrentBtcNativeSegwitAccountAddressIndexZero() {
  const { xpub } = useCurrentBitcoinNativeSegwitAccount();
  const payment = useDeriveNativeSegWitAccountIndexAddressIndexZero(xpub);
  if (!payment.address) throw new Error('No address in payment');
  return payment.address;
}

export function useBtcNativeSegwitAccountIndexAddressIndexZero(accountIndex: number) {
  const { xpub } = useBitcoinNativeSegwitAccount(accountIndex);
  const payment = useDeriveNativeSegWitAccountIndexAddressIndexZero(xpub);
  if (!payment.address) throw new Error('No address in payment');
  return payment.address;
}

function useCurrentBitcoinNativeSegwitAccountKeychain() {
  const { xpub } = useCurrentBitcoinNativeSegwitAccount();
  const keychain = HDKey.fromExtendedKey(xpub);
  if (!keychain.publicKey) throw new Error('No public key for given keychain');
  if (!keychain.pubKeyHash) throw new Error('No pub key hash for given keychain');
  return keychain;
}

// Concept of current address index won't exist with privacy mode
export function useCurrentBitcoinNativeSegwitAddressIndexKeychain() {
  const keychain = useCurrentBitcoinNativeSegwitAccountKeychain();
  return deriveAddressIndexZeroFromAccount(keychain);
}

export function useSignBitcoinNativeSegwitTx() {
  const index = useCurrentAccountIndex();
  const keychain = useNativeSegWitCurrentNetworkAccountKeychain()(index);
  return useCallback(
    (tx: btc.Transaction) => {
      tx.sign(deriveAddressIndexZeroFromAccount(keychain).privateKey!);
    },
    [keychain]
  );
}

interface UseSignBitcoinNativeSegwitInputAtIndexArgs {
  allowedSighash?: btc.SignatureHash[];
  idx: number;
  tx: btc.Transaction;
}
export function useSignBitcoinNativeSegwitInputAtIndex() {
  const index = useCurrentAccountIndex();
  const keychain = useNativeSegWitCurrentNetworkAccountKeychain()(index);

  return useCallback(
    ({ allowedSighash, idx, tx }: UseSignBitcoinNativeSegwitInputAtIndexArgs) => {
      if (isUndefined(keychain)) return;
      tx.signIdx(deriveAddressIndexZeroFromAccount(keychain).privateKey!, idx, allowedSighash);
    },
    [keychain]
  );
}
