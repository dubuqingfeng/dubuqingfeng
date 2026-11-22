# LND v0.21.8 security assertions

Pinned baseline:

- release: `v0.21.8-beta`
- commit: `59dd7908b33710b511c960d848ecb24c47916c3a`
- release date: 2026-11-11

The script checks 51 constants, branches and ordering claims used in
`wiki/docs/wiki/blockchain/lightning/security.md`.

## Run

```bash
git clone --depth 1 --branch v0.21.8-beta \
  https://github.com/lightningnetwork/lnd.git lnd-v0.21.8
cd lnd-v0.21.8
git sparse-checkout set \
  brontide cert chanbackup channeldb contractcourt discovery funding \
  htlcswitch input invoices keychain lncfg lnrpc lnwallet lnwire macaroons \
  peer routing shachain tor watchtower
/path/to/security_assertions.sh "$PWD"
```

Expected tail:

```text
SUMMARY pass=51 fail=0 total=51
```

The script is a source-text check, not a runtime test. It proves the named
strings and branches exist at the pinned commit; it does not prove a specific
input triggers them.
