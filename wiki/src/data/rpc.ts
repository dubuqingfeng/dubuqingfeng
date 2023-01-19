const RunRPCSidebarData = [
  {
    label: "Blockchain",
    type: "category",
    items: [
      {
        type: "link",
        href: "/tools/blockchain/runrpc?node=bitcoin&rpc=getblock",
        label: "getblock",
        description: "",
      },
    ],
  },
  {
    label: "Bitcoin",
    type: "category",
    items: [
      {
        type: "link",
        href: "/tools/blockchain/runrpc?node=bitcoin&rpc=getblock",
        label: "getblock",
        description: "",
      },
    ],
  },
  {
    label: "Ethereum",
    type: "category",
    items: [
      {
        type: "link",
        href: "/tools/blockchain/runrpc?node=ethereum&rpc=eth_blockNumber",
        label: "eth_blockNumber",
        description: "Returns the number of most recent block.",
        request:
          '{\n\t"jsonrpc": "2.0",\n\t"method": "eth_blockNumber", \n\t"params": []\n}',
        params: [],
      },
      {
        type: "link",
        href: "/tools/blockchain/runrpc?node=ethereum&rpc=eth_call",
        label: "eth_call",
        description:
          "Executes a new message call immediately without creating a transaction on the block chain.",
        request:
          '{\n\t"jsonrpc": "2.0",\n\t"method": "eth_call", \n\t"params": []\n}',
        params: [],
      },
      {
        type: "link",
        href: "/tools/blockchain/runrpc?node=ethereum&rpc=eth_getCode",
        label: "eth_getCode",
        description: "Returns the number of most recent block.",
        request:
          '{\n\t"jsonrpc": "2.0",\n\t"method": "eth_getCode", \n\t"params": ["address", "latest"]\n}',
        params: [
          {
            name: "address",
            replace: "address",
            type: "string",
            description: "20 Bytes - address to check for code.",
          },
          {
            name: "block",
            type: "string",
            replace: "latest",
            default: "latest",
            description:
              "integer block number, or the string 'latest', 'earliest' or 'pending'.",
          },
        ],
      },
    ],
  },
];

export { RunRPCSidebarData };
