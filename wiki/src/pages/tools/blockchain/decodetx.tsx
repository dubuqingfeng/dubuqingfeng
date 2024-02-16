import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Center from "@site/src/components/Center/center";
import { ToolsSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import Link from "@docusaurus/Link";
import Select from "react-select";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocPage/Layout/Main/styles.module.css";
import DocPageStyles from "@docusaurus/theme-classic/lib/theme/DocPage/Layout/styles.module.css";
import { toBuffer, bufferToHex, bigIntToBuffer } from "@ethereumjs/util";
import { TransactionFactory } from "@ethereumjs/tx";
import { Transaction, script } from "bitcoinjs-lib";
import { fromOutputScript } from "bitcoinjs-lib/src/address";
import { useColorMode } from "@docusaurus/theme-common";

export default function DecodeTX() {
  let select_coin = "";
  function decodeBitcoinTx(serializedTx) {
    const tx = Transaction.fromHex(serializedTx);
    var rawTx = {
      hash: tx.getId(),
      version: tx.version,
      locktime: tx.locktime,
      vin: tx.ins.map((input) => {
        return {
          txid: input.hash.reverse().toString("hex"),
          vout: input.index,
          scriptSig: {
            asm: input.script.toString("hex"),
            hex: input.script.toString("hex"),
          },
          script: script.toASM(input.script),
          sequence: input.sequence,
        };
      }),
      vout: tx.outs.map((output) => {
        return {
          value: output.value,
          scriptPubKey: {
            asm: script.toASM(output.script),
            hex: output.script.toString("hex"),
            // type: script.classifyOutput(output.script),
          },

          address: fromOutputScript(output.script).toString(),
        };
      }),
      weight: tx.weight(),
      size: tx.byteLength(),
      virtualSize: tx.virtualSize(),
      hasWitnesses: tx.hasWitnesses(),
    };
    return rawTx;
  }
  function decodeEthereumTx(serializedTx) {
    let buf = toBuffer(serializedTx);
    var tx = TransactionFactory.fromSerializedData(buf);
    console.log("tx", tx);
    var rawTx = {
      nonce: parseInt(tx.nonce.toString() || "0", 10),
      gasLimit: parseInt(tx.gasLimit.toString(), 10),
      to: tx.to.toString(),
      value: parseInt(tx.value.toString() || "0", 10),
      data: tx.data.toString("hex"),
    };
    if (tx.gasPrice) {
      rawTx.gasPrice = parseInt(tx.gasPrice.toString(), 10);
    }
    if (tx.maxFeePerGas) {
      rawTx.maxFeePerGas = parseInt(tx.maxFeePerGas.toString(), 10);
    }
    if (tx.maxPriorityFeePerGas) {
      rawTx.maxPriorityFeePerGas = parseInt(
        tx.maxPriorityFeePerGas.toString(),
        10
      );
    }
    let pubkey = tx.getSenderPublicKey();
    if (pubkey) {
      rawTx.pubkey = pubkey.toString("hex");
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
      };
    }

    return rawTx;
  }
  function handleSubmit(e) {
    e.preventDefault();
    console.log(select_coin);
    let serializedTx = document.getElementById("inputarea").value.trim();
    let outputtext = "";
    try {
      let rawTx = {};

      if (select_coin === "ethereum") {
        rawTx = decodeEthereumTx(serializedTx);
      } else {
        // 如果以 0x 开头，就以 ethereum 解码
        if (serializedTx.startsWith("0x")) {
          rawTx = decodeEthereumTx(serializedTx);
        } else {
          rawTx = decodeBitcoinTx(serializedTx);
        }
      }
      outputtext = JSON.stringify(rawTx, null, "  ");
    } catch (err) {
      console.log(err);
      outputtext = `Decode Tx Error: ${err.toString()}`;
    }
    document.getElementById("outputarea").value = outputtext;
  }
  function handleChange(selectedOption) {
    select_coin = selectedOption.value;
    console.log(`Option selected:`, selectedOption);
  }
  const options = [
    { value: "bitcoin", label: "Bitcoin" },
    { value: "ethereum", label: "Ethereum" },
  ];
  return (
    <Layout
      title="Decode Serialized Transaction"
      description="Decode serialized transaction"
    >
      <div className={DocPageStyles.docPage}>
        <PageSidebar
          sidebar={ToolsSidebarData}
          path="/tools/blockchain/decodetx"
        ></PageSidebar>
        <main className={clsx(MainStyles.docMainContainer)}>
          <div
            className={clsx(
              "container",
              "padding-top--md",
              "padding-bottom--lg"
            )}
          >
            <div>
              <div>
                <Center>
                  <h1 style={{ marginTop: "16px" }}>
                    Decode Serialized Transaction
                  </h1>
                </Center>
              </div>
            </div>
            <div>
              <div>
                <Center>
                  <textarea
                    name="inputarea"
                    id="inputarea"
                    cols={100}
                    rows={20}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    defaultValue={""}
                  />
                </Center>
              </div>
              <div style={{ marginTop: "16px" }}>
                <Center>
                  <div className="" style={{ marginRight: "16px" }}>
                    <Select
                      id="select-coin"
                      className="basic-single"
                      options={options}
                      styles={{
                        option: provided => ({
                          ...provided,
                          color: 'black'
                        }),
                      }}
                      defaultValue={options[0]}
                      defaultInputValue=""
                      onChange={handleChange}
                    />
                  </div>
                  <div style={{ marginLeft: "16px" }}>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={handleSubmit}
                    >
                      Decode
                    </button>
                  </div>
                </Center>
              </div>
              <div style={{ marginTop: "16px", marginBottom: "16px" }}>
                <Center>
                  <textarea
                    name="outputarea"
                    id="outputarea"
                    cols={100}
                    rows={20}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    defaultValue={""}
                  />
                </Center>
              </div>
              <div>
                <p>
                  注： <br></br>1. bitcoin 可以调用{" "}
                  <code>decoderawtransaction</code>
                  rpc
                  <br></br>2. ethereum 可以调用
                  <code>
                    {" "}
                    tx := &types.Transaction rawTxBytes, err :=
                    hex.DecodeString(rawTx)
                  </code>
                </p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
