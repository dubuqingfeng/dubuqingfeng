import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Center from "@site/src/components/Center/center";
import styles from "@site/src/pages/tools/blockchain/decodetx";
import { ToolsSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import Link from "@docusaurus/Link";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/Main/styles.module.css";
import DocRootStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/styles.module.css";
import { toBuffer, bufferToHex, bigIntToBuffer } from "@ethereumjs/util";
import { TransactionFactory } from "@ethereumjs/tx";

export default function DecodeTX() {
  function decodeTx(serializedTx) {
    return serializedTx;
  }
  function handleSubmit(e) {
    e.preventDefault();
    let serializedTx = document.getElementById("inputarea").value.trim();
    let outputtext = "";
    try {
      const rawTx = decodeTx(serializedTx);
      outputtext = JSON.stringify(rawTx, null, "  ");
    } catch (err) {
      console.log(err);
      outputtext = `Decode Error: ${err.toString()}`;
    }
    document.getElementById("outputarea").value = outputtext;
  }
  return (
    <Layout
      title="Decode Ethereum Serialized Transaction"
      description="Decode Ethereum serialized transaction"
    >
      <div className={DocRootStyles.docRoot}>
        <PageSidebar
          sidebar={ToolsSidebarData}
          path="/tools/ethereum/decodetx"
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
                  <h1 style={{ marginTop: "16px" }}>Number Conversion</h1>
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
                  <button
                    type="button"
                    className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                    onClick={handleSubmit}
                  >
                    Decode
                  </button>
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
