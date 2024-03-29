import React, { useState } from "react";
import clsx from "clsx";
import Layout from "@theme/Layout";
import Center from "@site/src/components/Center/center";
import MainStyles from "./styles.module.css";
import Select from "react-select";
import DocPageStyles from "@docusaurus/theme-classic/lib/theme/DocRoot/Layout/styles.module.css";
import ReactDiffViewer from "react-diff-viewer-continued";
import { useColorMode } from "@docusaurus/theme-common";

const syntaxHighlight = (str: string): any => {
  if (!str) return;
  // const language = P.highlight(str, P.languages.javascript);
  // return <span dangerouslySetInnerHTML={{ __html: str }} />;
  return <div>{str}</div>;
};

const defaultDiffView = (str: string): any => {
  if (!str) return;
  return <div>{str}</div>;
}

const ReactThemeDiffViewer = ({ oldValue, newValue }) => {
  const { colorMode, setColorMode } = useColorMode();
  return (
    <ReactDiffViewer
      oldValue={oldValue}
      newValue={newValue}
      splitView={true}
      showDiffOnly={false}
      renderContent={
        syntaxHighlight
      }
      useDarkTheme={colorMode === "dark"}
    />
  );
};

export default function CompareText() {
  let select_language = "";
  const [oldValue, setOldValue] = useState("");
  const [newValue, setNewValue] = useState("");
  function handleOldValueChange(event) {
    let value = event.target.value;
    setOldValue(value);
  }
  function handleNewValueChange(event) {
    let value = event.target.value;
    setNewValue(value);
  }
  function handleChange(selectedOption) {
    select_language = selectedOption.value;
    console.log(`Option selected:`, selectedOption);
  }
  const options = [
    { value: "javascript", label: "Javascript" },
    { value: "rust", label: "Rust" },
  ];
  return (
    <Layout title="Compare Text" description="Decode serialized transaction">
      <div className={DocPageStyles.docPage}>
        <main className={clsx(MainStyles.centerMainContainer)}>
          <div
            className={clsx(
              "padding-top--md",
              "padding-bottom--lg"
            )}
            style={{ marginLeft: "16px", marginRight: "16px" }}
          >
            <div>
              <div>
                <Center>
                  <h1 style={{ marginTop: "16px", marginRight: "16px" }}>Compare Text</h1>
                </Center>
              </div>
            </div>
            <div>
              <div>
                <Center>
                  <textarea
                    name="oldinputarea"
                    id="oldinputarea"
                    cols={100}
                    rows={25}
                    style={{ marginRight: "16px" }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    defaultValue={""}
                    onChange={handleOldValueChange}
                  />
                  <textarea
                    name="newinputarea"
                    id="newinputarea"
                    cols={100}
                    rows={25}
                    style={{ marginLeft: "16px" }}
                    className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                    defaultValue={""}
                    onChange={handleNewValueChange}
                  />
                </Center>
                <div style={{ marginTop: "16px" }}
                 className={clsx(MainStyles.diffViewContainer)}>
                  <ReactThemeDiffViewer
                    oldValue={oldValue}
                    newValue={newValue}
                  />
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>
    </Layout>
  );
}
