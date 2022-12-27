import React from 'react';
import clsx from "clsx";
import Layout from '@theme/Layout';
import Center from '@site/src/components/Center/center';
import styles from "@site/src/pages/tools/ethereum/decodetx";
import Link from "@docusaurus/Link";
import { toBuffer, bufferToHex, bigIntToBuffer } from '@ethereumjs/util';
import { TransactionFactory } from '@ethereumjs/tx';
import Web3 from 'web3';

export default function DecodeTX() {
  function decodeTx(serializedTx) {
      let buf = toBuffer(serializedTx);
      var tx = TransactionFactory.fromSerializedData(buf);
      console.log('tx', tx)
      var rawTx = {
          nonce: parseInt(tx.nonce.toString() || '0', 10),
          gasLimit: parseInt(tx.gasLimit.toString(), 10),
          to: tx.to.toString(),
          value: parseInt(tx.value.toString() || '0', 10),
          data: tx.data.toString('hex'),
      };
      if (tx.gasPrice) {
        rawTx.gasPrice = parseInt(tx.gasPrice.toString(), 10);
      }
      if (tx.maxFeePerGas) {
        rawTx.maxFeePerGas = parseInt(tx.maxFeePerGas.toString(), 10);
      }
      if (tx.maxPriorityFeePerGas) {
        rawTx.maxPriorityFeePerGas = parseInt(tx.maxPriorityFeePerGas.toString(), 10);
      }
      let pubkey = tx.getSenderPublicKey();
      if (pubkey) {
        rawTx.pubkey = pubkey.toString('hex');
      }
      let sender = tx.getSenderAddress();
      if (sender) {
        rawTx.from = sender.toString();
      }
      if (tx.hash()) {
        rawTx.hash = bufferToHex(tx.hash());
      }
      if (tx.r) {
        rawTx = {
          ...rawTx,    
          r: bufferToHex(bigIntToBuffer(tx.r)),
          v: bufferToHex(bigIntToBuffer(tx.v)),
          s: bufferToHex(bigIntToBuffer(tx.s)),
        }
      }
    
      return rawTx
  }

    function pushtx(serializedTx) {
      const NETWORK = 'MAINNET'

      const WEB3_PROVIDERS = {
        MAINNET: new Web3.providers.HttpProvider(`https://eth-mainnet.public.blastapi.io/`),
        TESTNET: new Web3.providers.HttpProvider(`https://rinkeby.infura.io/`),
        LOCALNET: new Web3.providers.HttpProvider(`http://localhost:7545`),
      }

      const web3 = new Web3(WEB3_PROVIDERS[NETWORK] || "ws://localhost:8545");

      let result = web3.eth.sendSignedTransaction(serializedTx);
      console.log(result);
      return result
    }
    function handleSubmit(e) {
        e.preventDefault();
        let serializedTx = document.getElementById("inputarea").value.trim();
        let outputtext = '';
        try {
          const rawTx = decodeTx(serializedTx)
          outputtext = JSON.stringify(rawTx, null, "  ");
        } catch (err) {
          console.log(err);
          outputtext = `Decode Error: ${err.toString()}`
        }
        document.getElementById("outputarea").value = outputtext;
    }

    async function handlePushTx(e) {
      e.preventDefault();
      let serializedTx = document.getElementById("inputarea").value.trim();
      let outputtext = '';
      try {
        const result = await pushtx(serializedTx).on('transactionHash', hash => console.log('tx hash', hash))
      } catch (err) {
        console.log(err);
        outputtext = `Push Tx Error: ${err.toString()}`
      }
      document.getElementById("outputarea").value = outputtext;
    }
  return (
    <Layout title="Decode Ethereum Serialized Transaction" description="Decode Ethereum serialized transaction">
      <div>
        <Center>
            <h1 style={{ marginTop: "16px", }}>Decode Ethereum Serialized Transaction</h1>
        </Center>
      </div>
      <div>
        <Center>
            <textarea name="inputarea" id="inputarea" cols={100} rows={20} defaultValue="">
            </textarea>
        </Center>
      </div>
      <div style={{ marginTop: "16px", }}>
        <Center>
            <Link
                style={{ marginRight: "16px" }}
                className={clsx(
                    "button",
                    "button--secondary",
                    "button--sm",
                    styles.heroTextAreaButton
                )}
                onClick={ handleSubmit }
                >
                Decode
            </Link>
            <Link
                style={{ marginLeft: "16px" }}
                className={clsx(
                    "button",
                    "button--secondary",
                    "button--sm",
                    styles.heroTextAreaButton
                )}
                onClick={ handlePushTx }
                >
                Publish
            </Link>
        </Center>
      </div>
      <div style={{ marginTop: "16px", marginBottom: "16px" }}>
        <Center>
            <textarea name="outputarea" id="outputarea" cols={100} rows={20} defaultValue="">
            </textarea>
        </Center>
      </div>
    </Layout>
  );
}