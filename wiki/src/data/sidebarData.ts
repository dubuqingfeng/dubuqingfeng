const ToolsSidebarData = [
  {
    label: "General Tools",
    type: "category",
    items: [
      { type: "link", href: "/tools/urlparam", label: "URL Parameter Tool" },
    ],
  },
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
      {
        type: "link",
        href: "/tools/bitcoin/decodetx",
        label: "Decode Tx",
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
      {
        type: "link",
        href: "/tools/ethereum/decodetx",
        label: "Decode Tx",
      },
    ],
  },
];

export { ToolsSidebarData };
