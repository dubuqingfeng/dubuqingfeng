import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Center from "@site/src/components/Center/center";
import { verify } from "bitcoinjs-message";
import { ToolsSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/Main/styles.module.css";
import DocRootStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/styles.module.css";

export default function VerifySignature() {
  let address = "";
  let message = "";
  let signature = "";
  function handleAddressChange(value) {
    address = value;
    const result = verifySignature(message, address, signature);
    document.getElementById("outputarea").innerText = result;
  }
  function handleMessageChange(value) {
    message = value;
    const result = verifySignature(message, address, signature);
    document.getElementById("outputarea").innerText = result;
  }
  function handleSignatureChange(value) {
    signature = value;
    const result = verifySignature(message, address, signature);
    document.getElementById("outputarea").innerText = result;
  }
  const verifySignature = (message, address, signature) => {
    if (address === "") {
      document.getElementById("outputarea").className =
        "mt-2 text-sm text-red-500";
      return "Address is required";
    }
    if (message === "") {
      document.getElementById("outputarea").className =
        "mt-2 text-sm text-red-500";
      return "Message is required";
    }
    if (signature === "") {
      document.getElementById("outputarea").className =
        "mt-2 text-sm text-red-500";
      return "Signature is required";
    }
    if (verify(message, address, signature)) {
      document.getElementById("outputarea").className =
        "mt-2 text-sm text-green-500";
      return "Signature verified";
    } else {
      document.getElementById("outputarea").className =
        "mt-2 text-sm text-red-500";
      return "Signature not verified";
    }
  };
  return (
    <Layout
      title="Verify Bitcoin Signature"
      description="Decode Bitcoin serialized transaction"
    >
      <div className={DocRootStyles.docRoot}>
        <PageSidebar
          sidebar={ToolsSidebarData}
          path="/tools/bitcoin/verifysignature"
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
                    Verify Bitcoin Signature
                  </h1>
                </Center>
              </div>
            </div>
            <div>
              <div>
                <label
                  htmlFor="address"
                  className="block text-md font-medium text-gray-700"
                >
                  Address
                </label>
                <div className="mt-1">
                  <textarea
                    style={{ lineHeight: "2rem" }}
                    id="address"
                    name="address"
                    rows={1}
                    cols={75}
                    onChange={(e) => handleAddressChange(e.target.value)}
                    className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder=""
                    defaultValue={""}
                  />
                </div>
              </div>
              <br></br>
              <div>
                <label
                  htmlFor="about"
                  className="block text-md font-medium text-gray-700"
                >
                  Message
                </label>
                <div className="mt-1">
                  <textarea
                    id="about"
                    name="about"
                    rows={4}
                    onChange={(e) => handleMessageChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder=""
                    defaultValue={""}
                  />
                </div>
              </div>
              <br></br>
              <div>
                <label
                  htmlFor="about"
                  className="block text-md font-medium text-gray-700"
                >
                  Signature
                </label>
                <div className="mt-1">
                  <textarea
                    id="about"
                    name="about"
                    rows={4}
                    onChange={(e) => handleSignatureChange(e.target.value)}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder=""
                    defaultValue={""}
                  />
                </div>
                <br></br>
                <p
                  className={`mt-2 text-sm text-green-500`}
                  id="outputarea"
                ></p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
