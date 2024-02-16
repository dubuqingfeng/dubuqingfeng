import React, { useState } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Center from "@site/src/components/Center/center";
import Select from "react-select";
import CreatableSelect from "react-select/creatable";
import Web3 from "web3";

import useIsBrowser from "@docusaurus/useIsBrowser";
import { RunRPCSidebarData } from "@site/src/data";
import PageSidebar from "@site/src/components/PageSidebar/index";
import MainStyles from "@docusaurus/theme-classic/lib/theme/DocPage/Layout/Main/styles.module.css";
import DocPageStyles from "@docusaurus/theme-classic/lib/theme/DocPage/Layout/styles.module.css";
import { eip155data, pushtxAPIData } from "@site/src/data";
import { RequestManager, HTTPTransport, Client } from "@open-rpc/client-js";

interface Option {
  readonly label: string;
  readonly value: string;
}

const createOption = (label: string) => ({
  label,
  value: label,
});

function CreateableSelect({ defaultOptions, onChange, defaultValue }) {
  const [isLoading, setIsLoading] = useState(false);
  const [options, setOptions] = useState(defaultOptions);
  const [value, setValue] = useState<Option | null>();

  const handleCreate = (inputValue: string) => {
    setIsLoading(true);
    setTimeout(() => {
      const newOption = createOption(inputValue);
      setIsLoading(false);
      setOptions((prev) => [...prev, newOption]);
      setValue(newOption);
      onChange(newOption);
    }, 200);
  };

  return (
    <CreatableSelect
      isClearable
      isDisabled={isLoading}
      isLoading={isLoading}
      onChange={onChange}
      onCreateOption={handleCreate}
      options={options}
      value={value}
      defaultValue={defaultValue}
    />
  );
}

export default function RunRPC() {
  let select_coin = "bitcoin";
  let defaultOption;
  let select_rpc_url = "";

  const isBrowser = useIsBrowser();

  function FormatString(str: string, ...val: string[]) {
    for (let index = 0; index < val.length; index++) {
      str = str.replace(`{${index}}`, val[index]);
    }
    return str;
  }

  function getNowFormatDate() {
    var date = new Date();
    var seperator1 = "-";
    var seperator2 = ":";
    var year = date.getFullYear();
    let month = date.getMonth() + 1;
    var strDate = date.getDate();
    if (month >= 1 && month <= 9) {
      month = "0" + month;
    }
    if (strDate >= 0 && strDate <= 9) {
      strDate = "0" + strDate;
    }
    var currentdate =
      year +
      seperator1 +
      month +
      seperator1 +
      strDate +
      " " +
      date.getHours() +
      seperator2 +
      date.getMinutes() +
      seperator2 +
      date.getSeconds();
    return currentdate;
  }
  // 处理调用 rpc
  async function handleExecRPC(e) {
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
              `${value.url} Run Result: ${JSON.stringify(result)}\n\n`;
            console.log(result);
          })
          .catch((err) => {
            console.log(err.message);
            outputtext =
              outputtext + `${value.url} Run Error: ${err.toString()}\n\n`;
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
      const transport = new HTTPTransport(select_rpc_url);
      const client = new Client(new RequestManager([transport]));
      const request = JSON.parse(serializedTx);
      try {
        const result = await client.request(request);
        console.log(result);
        outputtext =
          outputtext +
          getNowFormatDate() +
          ` ${select_rpc_url} Run RPC Success: ${result}\n`;
        const web3 = new Web3();
        if (web3.utils.isHexStrict(result) && !web3.utils.isAddress(result)) {
          outputtext =
            outputtext +
            `\nDec Result: ${web3.utils.hexToNumberString(result)}\n`;
        }
      } catch (err) {
        console.log(err);
        outputtext =
          outputtext +
          getNowFormatDate() +
          ` ${select_rpc_url} Run RPC Error: ${err.toString()}\n`;
      }
      document.getElementById("outputarea").value = outputtext;
    }
  }

  // handleGenCURL 处理生成 curl 命令
  async function handleGenCURL(e) {
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
              `${value.url} Run Result: ${JSON.stringify(result)}\n\n`;
            console.log(result);
          })
          .catch((err) => {
            console.log(err.message);
            outputtext =
              outputtext + `${value.url} Run Error: ${err.toString()}\n\n`;
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
      const transport = new HTTPTransport(select_rpc_url);
      const client = new Client(new RequestManager([transport]));
      const request = JSON.parse(serializedTx);
      try {
        const result = await client.request(request);
        console.log(result);
        outputtext =
          outputtext +
          getNowFormatDate() +
          ` ${select_rpc_url} Run RPC Success: ${result}\n`;
        const web3 = new Web3();
        if (web3.utils.isHexStrict(result) && !web3.utils.isAddress(result)) {
          outputtext =
            outputtext +
            `\nDec Result: ${web3.utils.hexToNumberString(result)}\n`;
        }
      } catch (err) {
        console.log(err);
        outputtext =
          outputtext +
          getNowFormatDate() +
          ` ${select_rpc_url} Run RPC Error: ${err.toString()}\n`;
      }
      document.getElementById("outputarea").value = outputtext;
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

  let secondOptions = [];
  let defaultSecondOption = "";

  function handleChange(selectedOption) {
    select_coin = selectedOption.value;
    const node = eip155data[select_coin];
    if (node == null) {
      secondOptions = [];
      defaultSecondOption = "";
      return;
    }
    secondOptions.length = 0;
    for (const [key, value] of Object.entries(node.rpcs)) {
      let rpcurl = "";
      if (typeof value == "string") {
        rpcurl = value;
      } else {
        rpcurl = value.url;
      }
      if (rpcurl != "" && rpcurl != undefined) {
        secondOptions.push({ value: rpcurl, label: rpcurl });
      }
    }
    defaultSecondOption = secondOptions[0];
    select_rpc_url = defaultSecondOption.value;

    if (isBrowser) {
      if (window.localStorage) {
        var storage = window.localStorage;
        storage.setItem("select_coin", select_coin);
      }
    }
  }

  if (isBrowser) {
    if (window.localStorage) {
      var storage = window.localStorage;
      select_coin = storage.getItem("select_coin");
      defaultOption = options.find((item) => item.value == select_coin);
    }
  }
  if (defaultOption == undefined) {
    defaultOption = options[0];
  }
  handleChange(defaultOption);

  function handleSecondChange(selectedOption) {
    if (selectedOption == null) {
      return;
    }
    select_rpc_url = selectedOption.value;
    console.log(`Option selected:`, select_rpc_url);
    let serializedTx = document.getElementById("inputarea").value.trim();
    navigator.clipboard.writeText(serializedTx);
  }
  let nodeParam = "";
  let rpcMethod = "";

  if (isBrowser) {
    const search = window.location.search;
    nodeParam = new URLSearchParams(search).get("node") ?? "";
    rpcMethod = new URLSearchParams(search).get("rpc") ?? "";
  }
  nodeParam = nodeParam ? nodeParam.toLowerCase() : "";
  rpcMethod = rpcMethod ? rpcMethod.toLowerCase() : "";

  // 遍历 RunRPCSidebarData，写入 map
  let RunRPCSidebarMap = {};
  for (const [key, value] of Object.entries(RunRPCSidebarData)) {
    for (const [key2, value2] of Object.entries(value.items)) {
      RunRPCSidebarMap[
        value.label.toLowerCase() + "/" + value2.label.toLowerCase()
      ] = value2;
    }
  }
  let rpc = RunRPCSidebarMap[nodeParam + "/" + rpcMethod] ?? "";
  let rpcDescription = rpc.description ?? "";
  let rpcRequest = rpc.request ?? "";
  let rpcInitRequest = rpc.request ?? "";
  let rpcParams = rpc.params ?? [];
  let rpcRealParams = {};

  // handleParamChange
  function handleParamChange(name, value) {
    let rpcParam = rpcParams.find((item) => item.name == name);
    if (rpcParam == undefined) {
      return;
    }
    // if (rpcParam.type == "number") {
    //   value = parseInt(value);
    // }
    rpcRealParams[rpcParam.replace] = value;
    rpcRequest = rpcInitRequest;
    console.log(rpcRealParams);
    for (const [key, value] of Object.entries(rpcRealParams)) {
      rpcRequest = rpcRequest.replace(key, value);
      console.log(rpcRequest);
    }
    document.getElementById("inputarea").value = rpcRequest;
    navigator.clipboard.writeText(rpcRequest);
  }

  return (
    <Layout title="Run RPC" description="">
      <div style={{ marginTop: "16px" }}>
        <Center style={{ marginTop: "8px" }}>
          <div className="" style={{ marginRight: "16px", width: "190px" }}>
            <Select
              className="basic-single"
              options={options}
              styles={{
                option: provided => ({
                  ...provided,
                  color: 'black'
                }),
              }}
              defaultValue={defaultOption}
              defaultInputValue=""
              onChange={handleChange}
            />
          </div>
          <div className="" style={{ marginRight: "16px", width: "400px" }}>
            <CreateableSelect
              defaultOptions={secondOptions}
              onChange={handleSecondChange}
              defaultValue={defaultSecondOption}
            />
          </div>
          <div style={{ marginLeft: "16px" }}>
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={handleExecRPC}
            >
              Exec
            </button>
          </div>
          <div style={{ marginLeft: "16px" }}>
            <button
              type="button"
              className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 py-2 px-4 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
              onClick={handleGenCURL}
            >
              Curl
            </button>
          </div>
        </Center>
      </div>
      <div className={DocPageStyles.docPage}>
        <PageSidebar
          sidebar={RunRPCSidebarData}
          path={
            "/tools/blockchain/runrpc?node=" + nodeParam + "&rpc=" + nodeParam
          }
        ></PageSidebar>
        <main className={clsx(MainStyles.docMainContainer)}>
          <div
            className={clsx(
              "container",
              "padding-top--md",
              "padding-bottom--lg"
            )}
          >
            <h1>{rpcMethod}</h1>
            <p>{rpcDescription}</p>
            <div style={{ marginTop: "8px" }}>
              <div>
                {rpcParams.map((item, index) => {
                  return (
                    <div key={item.name}>
                      <label
                        htmlFor="address"
                        className="block text-md font-medium text-gray-700"
                      >
                        <b>{item.name}</b> - {item.description}
                      </label>
                      <div className="mt-1">
                        <textarea
                          style={{ lineHeight: "2rem" }}
                          id={item.name}
                          key={item.name}
                          name={item.name}
                          defaultValue={item.default}
                          rows={1}
                          cols={75}
                          onChange={(e) =>
                            handleParamChange(e.target.name, e.target.value)
                          }
                          className="mt-1 block rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                          placeholder=""
                        />
                      </div>
                    </div>
                  );
                })}
                <Center></Center>
              </div>
            </div>
          </div>
          <div
            className={clsx(
              "container",
              "padding-top--md",
              "padding-bottom--lg"
            )}
          >
            <div style={{ marginTop: "8px" }}>
              <div>
                <Center>
                  <textarea
                    name="inputarea"
                    id="inputarea"
                    cols={100}
                    rows={10}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    // defaultValue={rpcRequest}
                    onChange={(e) => {
                      rpcRequest = e.target.value;
                    }}
                    value={rpcRequest}
                  />
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
