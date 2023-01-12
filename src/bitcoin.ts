// Lib rather than tinysecp256k1
// @ts-ignore
import * as ecc from '@bitcoinerlab/secp256k1';
import { bytesToHex, hexToBytes } from '@noble/hashes/utils';
import * as secp from '@noble/secp256k1';
import { HDKey } from '@scure/bip32';
import * as bip39 from '@scure/bip39';
import { deepStrictEqual } from 'assert';
import * as bitcoin from 'bitcoinjs-lib';
import { ECPairFactory } from 'ecpair';
import * as btc from 'micro-btc-signer';

const ECPair = ECPairFactory(ecc);

// import { connectBitcoinLedgerApp } from '@app/features/ledger/ledger-utils';

// const form = document.querySelector('.bitcoin-ledger');

// if (!form) throw new Error();

// form.addEventListener('submit', async e => {
//   e.preventDefault();
//   console.log('connect ledger');
//   const { app, transport } = await connectBitcoinLedgerApp();
//   const resp = await app.getWalletPublicKey("84'/1'/0'/0/0", { format: 'bech32' });
//   console.log(resp);
//   await transport.close();
// });

const softwareForm = document.querySelector('.bitcoin-software');

if (!softwareForm) throw new Error();

const btcTestnetNetworkConfig = { bech32: 'tb', pubKeyHash: 0x6f, scriptHash: 0xc4, wif: 0x12 };

softwareForm.addEventListener('submit', async e => {
  e.preventDefault();
  const seed = await bip39.mnemonicToSeed(
    'mobile pumpkin list since angle seat carpet filter ancient control object hat'
  );
  const keychain = HDKey.fromMasterSeed(seed);

  if (!keychain.privateKey) return;

  const rootZeroAccount = keychain.derive(`m/84'/1'/0'`);

  const zeroAddressIndex = rootZeroAccount.deriveChild(0).deriveChild(0);

  if (!zeroAddressIndex.privateKey) throw new Error('No private key');

  //
  // bitcoinjs-lib implementation
  const network = bitcoin.networks.testnet;

  const keyPairAlice1 = ECPair.fromPrivateKey(Buffer.from(zeroAddressIndex.privateKey!), {
    network,
  });

  const psbt = new bitcoin.Psbt({ network })
    .addInput({
      hash: 'b7c20d6ac25302aec052392b9e8bb22d93e31d926b8a11382dcf8b7f410612f7',
      index: 0,
      witnessUtxo: {
        script: Buffer.from('0014' + bytesToHex(zeroAddressIndex.pubKeyHash!), 'hex'),
        value: 3672960,
      },
    })
    .addOutput({
      address: 'tb1qtd703hdmsmfrsptk4mq6h57k5pvzjy7r0k0wqe',
      value: 3662960,
    });

  deepStrictEqual(
    bytesToHex(
      Uint8Array.from(Buffer.from('0014' + bytesToHex(zeroAddressIndex.pubKeyHash!), 'hex'))
    ),
    Buffer.from('0014' + bytesToHex(zeroAddressIndex.pubKeyHash!), 'hex').toString('hex')
  );

  psbt.signInput(0, keyPairAlice1);
  psbt.finalizeAllInputs();

  const rawSignedTxBitcoinJsLib = psbt.extractTransaction().toHex();
  console.log({ psbt, rawSignedTxBitcoinJsLib });

  deepStrictEqual(rawSignedTxBitcoinJsLib, rawSignedTxBitcoinJsLib);

  //
  // micro-btc-signer
  const tx = new btc.Transaction();
  tx.addInput({
    txid: hexToBytes('b7c20d6ac25302aec052392b9e8bb22d93e31d926b8a11382dcf8b7f410612f7'),
    index: 0,
    witnessUtxo: {
      script: new Uint8Array(Buffer.from('0014' + bytesToHex(zeroAddressIndex.pubKeyHash!), 'hex')),
      amount: 3672960n,
    },
  });
  tx.addOutputAddress(
    'tb1qtd703hdmsmfrsptk4mq6h57k5pvzjy7r0k0wqe',
    3662960n,
    btcTestnetNetworkConfig
  );
  tx.sign(zeroAddressIndex.privateKey);
  tx.finalize();
  console.log('hex', tx.hex);
  console.log(rawSignedTxBitcoinJsLib);

  deepStrictEqual(tx.hex, rawSignedTxBitcoinJsLib);

  // console.log(address);
  // const psbt = new bitcoin.Psbt();
  // const scriptPubKey = bitcoin.script.witnessPubKeyHash.output.encode(pubkeyhash);
  // const addressDetails = btc.p2wpkh(zeroAccount.publicKey!, btcTestnetNetworkConfig as any);
  // console.log(addressDetails);
});
