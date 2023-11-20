const pushtxAPIData = {
  bitcoin: {
    api: [
      {
        name: "blockcypher",
        url: "https://api.blockcypher.com/v1/btc/main/txs/push",
        method: "POST",
        "content-type": "application/json",
        body: '{"tx":"{0}"}',
      },
      {
        name: "oklink",
        url: "https://www.oklink.com/api/v5/explorer/transaction/publish-tx",
        method: "POST",
        "content-type": "application/json",
        body: '{"signedTx":"{0}","chainShortName":"btc"}',
      },
      // {
      //   name: "blockchain.info",
      //   url: "https://blockchain.info/pushtx",
      //   method: "POST",
      //   "content-type": "application/json",
      //   body: 'tx={0}',
      // },
      // {
      //   name: "blockstream",
      //   url: "https://blockstream.info/api/tx",
      //   method: "POST",
      //   "content-type": "application/json",
      //   body: '{0}',
      // },
      // {
      //   name: "btc.com",
      //   url: "https://btc.com/service/tx/publish",
      //   method: "POST",
      //   "content-type": "application/x-www-form-urlencoded",
      //   body: '{"rawhex":"{0}"}',
      // },
      // {
      //   name: "mempool",
      //   url: "https://mempool.space/api/tx",
      //   method: "POST",
      //   body: '{0}',
      // },
      // {
      //   name: "blockchair",
      //   url: "https://mempool.space/api/tx",
      //   method: "POST",
      //   body: '{0}',
      // },
    ],
  },
  dash: {
    api: [
      {
        name: "blockcypher",
        url: "https://api.blockcypher.com/v1/dash/main/txs/push",
        method: "POST",
        "content-type": "application/json",
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
        "content-type": "application/json",
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
        "content-type": "application/json",
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
        "content-type": "application/json",
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
        "content-type": "application/json",
        body: '{"tx":"{0}"}',
      },
    ],
  },
};

export { pushtxAPIData };
