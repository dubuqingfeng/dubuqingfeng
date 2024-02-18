import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Center from "@site/src/components/Center/center";
import Select from "react-select";
import { Web3, HttpProvider } from "web3";

import { ToolsSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/Main/styles.module.css";
import DocRootStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/styles.module.css";
import { eip155data, pushtxAPIData } from "@site/src/data";

export default function PublishTX() {
  let select_coin = "bitcoin";
  function FormatString(str: string, ...val: string[]) {
    for (let index = 0; index < val.length; index++) {
      str = str.replace(`{${index}}`, val[index]);
    }
    return str;
  }
  async function handlePushTx(e) {
    e.preventDefault();
    let serializedTx = document.getElementById("inputarea").value.trim();
    let outputtext = "";
    const node = eip155data[select_coin];
    if (node == null) {
      let tx = serializedTx;
      const node = pushtxAPIData[select_coin];
      for (const [key, value] of Object.entries(node.api)) {
        let body = value.body;
        await fetch(value.url, {
          method: "POST",
          body: FormatString(body, tx),
          headers: {
            "Content-type": "application/json; charset=UTF-8",
          },
        })
          .then((res) => res.json())
          .then((result) => {
            outputtext =
              outputtext +
              `${value.url} Push Tx Result: ${JSON.stringify(result)}\n\n`;
            console.log(result);
          })
          .catch((err) => {
            console.log(err.message);
            outputtext =
              outputtext + `${value.url} Push Tx Error: ${err.toString()}\n\n`;
            outputtext =
              outputtext +
              `curl -X POST --header 'Content-Type: application/json' -d '${FormatString(
                body,
                tx
              )}' ${value.url}\n\n`;
          });
        document.getElementById("outputarea").value = outputtext;
      }
    } else {
      for (const [key, value] of Object.entries(node.rpcs)) {
        let rpcurl = "";
        if (typeof value == "string") {
          rpcurl = value;
        } else {
          rpcurl = value.url;
        }
        const provider = new Web3.providers.HttpProvider(rpcurl);
        const web3 = new Web3(new HttpProvider(rpcurl));
        try {
          const result = await web3.eth.sendSignedTransaction(serializedTx);
          console.log(result);
          outputtext =
            outputtext +
            `${rpcurl} Push Tx Success: ${result.transactionHash}\n`;
        } catch (err) {
          console.log(err);
          outputtext =
            outputtext + `${rpcurl} Push Tx Error: ${err.toString()}\n`;
        }
        document.getElementById("outputarea").value = outputtext;
      }
    }
  }
  const options = [
    { value: "bitcoin", label: "Bitcoin Mainnet", sort: 1100 },
    { value: "bitcointestnet", label: "Bitcoin Testnet3", sort: 1050 },
    { value: "dash", label: "Dash", sort: 1050 },
    { value: "dogecoin", label: "Dogecoin", sort: 1060 },
    { value: "litecoin", label: "Litecoin", sort: 1030 },
    { value: "blockcypher", label: "BlockCypher Test", sort: 8 },
  ];

  for (const [key, value] of Object.entries(eip155data)) {
    options.push({ value: value.chainId, label: value.name, sort: value.sort });
  }
  options.sort(function (a, b) {
    if (a.sort === b.sort) {
      return 0;
    }
    if (typeof a.sort === "undefined") {
      return 1;
    }
    if (typeof b.sort === "undefined") {
      return -1;
    }
    return b.sort - a.sort;
  });
  function handleChange(selectedOption) {
    select_coin = selectedOption.value;
    console.log(`Option selected:`, selectedOption);
  }
  return (
    <Layout
      title="Publish Serialized Transaction"
      description="Publish serialized transaction"
    >
      <div className={DocRootStyles.docRoot}>
        <PageSidebar
          sidebar={ToolsSidebarData}
          path="/tools/blockchain/publishtx"
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
