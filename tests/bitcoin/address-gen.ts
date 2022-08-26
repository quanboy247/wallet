import { mnemonicToSeed } from '@scure/bip39';
import { HDKey } from '@scure/bip32';
import * as bitcoin from 'bitcoinjs-lib';
import { base58check } from '@scure/base';
import { sha256 } from '@noble/hashes/sha256';
import { ripemd160 } from '@noble/hashes/ripemd160';

const fromHexString = (hexString: string) =>
  Uint8Array.from(hexString.match(/.{1,2}/g)!.map(byte => parseInt(byte, 16)));

const toHexString = (bytes: Uint8Array) =>
  bytes.reduce((str, byte) => str + byte.toString(16).padStart(2, '0'), '');

export async function deriveBtcBip49SeedFromMnemonic(mnemonic: string) {
  return mnemonicToSeed(mnemonic);
}

export function deriveRootBtcKeychain(seed: Uint8Array) {
  return HDKey.fromMasterSeed(seed);
}

export async function deriveBtcPayment(
  publicKey: Uint8Array | Buffer,
  defaultNetwork: 'mainnet' | 'testnet' = 'mainnet'
) {
  const pubkey = Buffer.isBuffer(publicKey) ? publicKey : Buffer.from(publicKey);
  const network = defaultNetwork === 'mainnet' ? undefined : bitcoin.networks.testnet;
  return bitcoin.payments.p2sh({
    redeem: bitcoin.payments.p2wpkh({
      pubkey,
      network,
    }),
    network,
  });
}

export function decodeCompressedWifPrivateKey(key: string) {
  // https://en.bitcoinwiki.org/wiki/Wallet_import_format
  // Decode Compressed WIF format private key
  const compressedWifFormatPrivateKey = base58check(sha256).decode(key);
  // Drop leading network byte, trailing public key SEC format byte
  return compressedWifFormatPrivateKey.slice(1, compressedWifFormatPrivateKey.length - 1);
}

type BitcoinNetwork = 'mainnet' | 'testnet';

// https://en.bitcoin.it/wiki/List_of_address_prefixes
export const payToScriptHashMainnetPrefix = 0x05;
export const payToScriptHashTestnetPrefix = 0xc4;

const payToScriptHashPrefixMap: Record<BitcoinNetwork, number> = {
  mainnet: payToScriptHashMainnetPrefix,
  testnet: payToScriptHashTestnetPrefix,
};

function hash160(input: Uint8Array) {
  return ripemd160(sha256(input));
}

export function makePayToScriptHashKeyHash(publicKey: Uint8Array) {
  return hash160(publicKey);
}

export function makePayToScriptHashAddressBytes(keyHash: Uint8Array) {
  const redeemScript = Uint8Array.from([
    ...Uint8Array.of(0x00),
    ...Uint8Array.of(keyHash.length),
    ...keyHash,
  ]);
  return hash160(redeemScript);
}

export function makePayToScriptHashAddress(addressBytes: Uint8Array, network: BitcoinNetwork) {
  const networkByte = payToScriptHashPrefixMap[network];
  const addressWithPrefix = Uint8Array.from([networkByte, ...addressBytes]);
  return base58check(sha256).encode(addressWithPrefix);
}

export function publicKeyToPayToScriptHashAddress(publicKey: Uint8Array, network: BitcoinNetwork) {
  const hash = makePayToScriptHashKeyHash(publicKey);
  const addrBytes = makePayToScriptHashAddressBytes(hash);
  return makePayToScriptHashAddress(addrBytes, network);
}
