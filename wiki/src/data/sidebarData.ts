const ToolsSidebarData = [
  {
    label: "General Tools",
    type: "category",
    items: [
      { type: "link", href: "/tools/urlparam", label: "URL Parameter Tool" },
      { type: "link", href: "/tools/imageocr", label: "图片文字识别" },
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
        href: "/tools/bitcoin/verifysignature",
        label: "Verify Signature",
      },
    ],
  },
];

export { ToolsSidebarData };
