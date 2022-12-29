const ToolsSidebarData = [
    { label: "Tools", type: "category", items: [
        { type: "link", href: "/tools/ethereum/publishtx", label: "Publish Tx" }
      ], },
      { label: "Bitcoin Tools", type: "category", items: [
        { type: "link", href: "/tools/bitcoin/decodetx", label: "Decode Tx" },
        // { type: "link", href: "/tools/bitcoin/verifysignature", label: "Verify Signature" }
      ], },
    { label: "Ethereum Tools", type: "category", items: [
      { type: "link", href: "/tools/ethereum/decodetx", label: "Decode Tx" },
    ], },
]

export { ToolsSidebarData };
