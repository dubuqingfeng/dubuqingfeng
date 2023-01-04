const pushtxAPIData = {
  bitcoin: {
    api: [
      {
        name: "blockcypher",
        url: "https://api.blockcypher.com/v1/btc/main/txs/push",
        method: "POST",
        body: '{"tx":"{0}"}',
      },
      {
        name: "oklink",
        url: "https://www.oklink.com/api/v5/explorer/transaction/publish-tx",
        method: "POST",
        body: '{"signedTx":"{0}","chainShortName":"btc"}',
      },
    ],
  },
  dash: {
    api: [
      {
        name: "blockcypher",
        url: "https://api.blockcypher.com/v1/dash/main/txs/push",
        method: "POST",
        body: '{"tx":"{0}"}',
      },
    ],
  },
  dogecoin: {
    api: [
      {
        name: "blockcypher",
        url: "https://api.blockcypher.com/v1/doge/main/txs/push",
        method: "POST",
        body: '{"tx":"{0}"}',
      },
    ],
  },
  blockcypher: {
    api: [
      {
        name: "blockcypher",
        url: "https://api.blockcypher.com/v1/bcy/main/txs/push",
        method: "POST",
        body: '{"tx":"{0}"}',
      },
    ],
  },
  litecoin: {
    api: [
      {
        name: "blockcypher",
        url: "https://api.blockcypher.com/v1/ltc/main/txs/push",
        method: "POST",
        body: '{"tx":"{0}"}',
      },
    ],
  },
  bitcointestnet: {
    api: [
      {
        name: "blockcypher",
        url: "https://api.blockcypher.com/v1/btc/test3/txs/push",
        method: "POST",
        body: '{"tx":"{0}"}',
      },
    ],
  },
};

export { pushtxAPIData };
