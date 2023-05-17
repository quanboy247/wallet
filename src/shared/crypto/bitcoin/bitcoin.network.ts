import * as bitcoinJs from 'bitcoinjs-lib';

import { BitcoinNetworkModes } from '@shared/constants';

// See this PR https://github.com/paulmillr/@scure/btc-signer/pull/15
// Atttempting to add these directly to the library
export interface BtcSignerNetwork {
  bech32: string;
  pubKeyHash: number;
  scriptHash: number;
  wif: number;
}

const bitcoinMainnet: BtcSignerNetwork = {
  bech32: 'bc',
  pubKeyHash: 0x00,
  scriptHash: 0x05,
  wif: 0x80,
};

const bitcoinTestnet: BtcSignerNetwork = {
  bech32: 'tb',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

const bitcoinRegtest: BtcSignerNetwork = {
  bech32: 'bcrt',
  pubKeyHash: 0x6f,
  scriptHash: 0xc4,
  wif: 0xef,
};

const bitcoinSignet: BtcSignerNetwork = {
  bech32: 'sb',
  pubKeyHash: 0x3f,
  scriptHash: 0x7f,
  wif: 0x80,
};

const btcSignerLibNetworks: Record<BitcoinNetworkModes, BtcSignerNetwork> = {
  mainnet: bitcoinMainnet,
  testnet: bitcoinTestnet,
  regtest: bitcoinRegtest,
  signet: bitcoinSignet,
};

export function getBtcSignerLibNetworkConfigByMode(network: BitcoinNetworkModes) {
  return btcSignerLibNetworks[network];
}

const bitcoinJsLibNetworks: Record<BitcoinNetworkModes, bitcoinJs.Network> = {
  mainnet: bitcoinJs.networks.bitcoin,
  testnet: bitcoinJs.networks.testnet,
  regtest: bitcoinJs.networks.regtest,
  // Signet doesn't exist in bitcoinjs-lib
  signet: bitcoinJs.networks.regtest,
};

export function getBitcoinJsLibNetworkConfigByMode(network: BitcoinNetworkModes) {
  return bitcoinJsLibNetworks[network];
}
