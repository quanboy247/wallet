import * as bitcoin from 'bitcoinjs-lib';
import bip32Factory from 'bip32';
import * as bip39 from 'bip39';
import * as ecc from 'tiny-secp256k1';

const bip32 = bip32Factory(ecc);

describe('some bitcoin stuff', () => {
  test('lskjdffs', () => {
    expect(true).toBe(true);
  });

  it('can generate a P2SH, pay-to-multisig (2-of-3) address', () => {
    const pubkeys = [
      '026477115981fe981a6918a6297d9803c4dc04f328f22041bedff886bbc2962e01',
      '02c96db2302d19b43d4c69368babace7854cc84eb9e061cde51cfa77ca4a22b8b9',
      '03c6103b3b83e4a24a0e33a4df246ef11772f9992663db0c35759a5e2ebf68d8e9',
    ].map(hex => Buffer.from(hex, 'hex'));

    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2ms({ m: 2, pubkeys }),
    });

    expect(address).toEqual('36NUkt6FWUi3LAWBqWRdDmdTWbt91Yvfu7');
  });

  it('can create a BIP49, bitcoin testnet, account 0, external address', () => {
    const mnemonic =
      'abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon abandon about';
    const seed = bip39.mnemonicToSeedSync(mnemonic);
    const root = bip32.fromSeed(seed);

    const path = "m/49'/1'/0'/0/0";
    const child = root.derivePath(path);

    const { address } = bitcoin.payments.p2sh({
      redeem: bitcoin.payments.p2wpkh({
        pubkey: child.publicKey,
        network: bitcoin.networks.testnet,
      }),
      network: bitcoin.networks.testnet,
    });
    expect(address).toEqual('2Mww8dCYPUpKHofjgcXcBCEGmniw9CoaiD2');
  });
});
