const ToolsSidebarData = [
  // { label: "Tools", type: "category", items: [
  //     { type: "link", href: "/tools/ethereum/publishtx", label: "Publish Tx" }
  //   ], },
  {
    label: "Blockchain",
    type: "category",
    items: [
      { type: "link", href: "/tools/blockchain/decodetx", label: "Decode Tx" },
      {
        type: "link",
        href: "/tools/blockchain/publishtx",
        label: "Publish Tx",
      },
      // { type: "link", href: "/tools/bitcoin/verifysignature", label: "Verify Signature" }
    ],
  },
  {
    label: "Bitcoin",
    type: "category",
    items: [
      {
        type: "link",
        href: "/tools/bitcoin/publishtx",
        label: "Publish Tx",
      },
      {
        type: "link",
        href: "/tools/bitcoin/verifysignature",
        label: "Verify Signature",
      },
    ],
  },
  {
    label: "Ethereum",
    type: "category",
    items: [
      {
        type: "link",
        href: "/tools/ethereum/publishtx",
        label: "Publish Tx",
      },
    ],
  },
];

export { ToolsSidebarData };
