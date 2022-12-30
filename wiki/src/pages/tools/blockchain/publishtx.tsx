import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Center from "@site/src/components/Center/center";
import styles from "./select.module.css";
import Select from "react-select";
import Web3 from "web3";

import { ToolsSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocPage/Layout/Main/styles.module.css";
import DocPageStyles from "@docusaurus/theme-classic/lib/theme/DocPage/Layout/styles.module.css";

export default function PublishTX() {
  function pushtx(serializedTx, network) {
    const NETWORK = "MAINNET";

    const WEB3_PROVIDERS = {
      MAINNET: new Web3.providers.HttpProvider(
        `https://eth-mainnet.public.blastapi.io/`
      ),
      TESTNET: new Web3.providers.HttpProvider(`https://rinkeby.infura.io/`),
      LOCALNET: new Web3.providers.HttpProvider(`http://localhost:7545`),
    };

    const web3 = new Web3(WEB3_PROVIDERS[NETWORK] || "ws://localhost:8545");

    let result = web3.eth.sendSignedTransaction(serializedTx);
    console.log(result);
    return result;
  }
  async function handlePushTx(e) {
    e.preventDefault();
    let serializedTx = document.getElementById("inputarea").value.trim();
    let outputtext = "";
    try {
      const result = await pushtx(serializedTx).on("transactionHash", (hash) =>
        console.log("tx hash", hash)
      );
    } catch (err) {
      console.log(err);
      outputtext = `Push Tx Error: ${err.toString()}`;
    }
    document.getElementById("outputarea").value = outputtext;
  }
  const options = [
    { value: "bitcoin", label: "Bitcoin" },
    { value: "ethereum", label: "Ethereum" },
    { value: "polygon", label: "Polygon" },
  ];
  return (
    <Layout
      title="Publish Ethereum Serialized Transaction"
      description="Publish Ethereum serialized transaction"
    >
      <div className={DocPageStyles.docPage}>
        <PageSidebar
          sidebar={ToolsSidebarData}
          path="/tools/ethereum/publishtx"
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
                    Publish Serialized Transaction
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
                      className="basic-single"
                      options={options}
                      defaultValue={options[0]}
                      defaultInputValue=""
                    />
                  </div>
                  <div style={{ marginLeft: "16px" }}>
                    <button
                      type="button"
                      className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      onClick={handlePushTx}
                    >
                      Publish
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
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
