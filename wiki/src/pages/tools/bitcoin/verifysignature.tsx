import React from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Center from "@site/src/components/Center/center";
import styles from "@site/src/pages/tools/ethereum/decodetx";
import { ToolsSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocPage/Layout/Main/styles.module.css";
import DocPageStyles from "@docusaurus/theme-classic/lib/theme/DocPage/Layout/styles.module.css";
import { Transaction } from "bitcoinjs-lib";
import { fromOutputScript } from "bitcoinjs-lib/src/address";

export default function VerifySignature() {
  // function verify_message(signature, message, addrtype) {
  //     try {
  //         var sig = Crypto.util.base64ToBytes(signature);
  //     } catch(err) {
  //         return false;
  //     }

  //     if (sig.length != 65)
  //         return false;

  //     // extract r,s from signature
  //     var r = BigInteger.fromByteArrayUnsigned(sig.slice(1,1+32));
  //     var s = BigInteger.fromByteArrayUnsigned(sig.slice(33,33+32));

  //     // get recid
  //     var compressed = false;
  //     var nV = sig[0];
  //     if (nV < 27 || nV >= 35)
  //         return false;
  //     if (nV >= 31) {
  //         compressed = true;
  //         nV -= 4;
  //     }
  //     var recid = BigInteger.valueOf(nV - 27);

  //     var ecparams = getSECCurveByName("secp256k1");
  //     var curve = ecparams.getCurve();
  //     var a = curve.getA().toBigInteger();
  //     var b = curve.getB().toBigInteger();
  //     var p = curve.getQ();
  //     var G = ecparams.getG();
  //     var order = ecparams.getN();

  //     var x = r.add(order.multiply(recid.divide(BigInteger.valueOf(2))));
  //     var alpha = x.multiply(x).multiply(x).add(a.multiply(x)).add(b).mod(p);
  //     var beta = alpha.modPow(p.add(BigInteger.ONE).divide(BigInteger.valueOf(4)), p);
  //     var y = beta.subtract(recid).isEven() ? beta : p.subtract(beta);

  //     var R = new ECPointFp(curve, curve.fromBigInteger(x), curve.fromBigInteger(y));
  //     var e = BigInteger.fromByteArrayUnsigned(msg_digest(message));
  //     var minus_e = e.negate().mod(order);
  //     var inv_r = r.modInverse(order);
  //     var Q = (R.multiply(s).add(G.multiply(minus_e))).multiply(inv_r);

  //     var public_key = Q.getEncoded(compressed);
  //     var addr = new Bitcoin.Address(Bitcoin.Util.sha256ripe160(public_key));

  //     addr.version = addrtype ? addrtype : 0;
  //     return addr.toString();
  // }
  function decodeTx(serializedTx) {
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
        };
      }),
      vout: tx.outs.map((output) => {
        return {
          value: output.value,
          scriptPubKey: {
            asm: output.script.toString("hex"),
            hex: output.script.toString("hex"),
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
      title="Verify Bitcoin Signature"
      description="Decode Bitcoin serialized transaction"
    >
      <div className={DocPageStyles.docPage}>
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
              <div className="grid grid-cols-3 gap-6">
                <div className="col-span-3 sm:col-span-2">
                  <label
                    htmlFor="company-website"
                    className="block text-md font-medium text-gray-700"
                  >
                    Address
                  </label>
                  <div className="mt-1 flex rounded-md shadow-sm">
                    <input
                      type="text"
                      name="company-website"
                      id="company-website"
                      className="block w-full flex-1 rounded-none rounded-r-md border-gray-300 focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      placeholder=""
                    />
                  </div>
                </div>
              </div>

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
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder=""
                    defaultValue={""}
                  />
                </div>
              </div>
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
                    rows={3}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    placeholder=""
                    defaultValue={""}
                  />
                </div>
                <p className="mt-2 text-sm text-gray-500"></p>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
