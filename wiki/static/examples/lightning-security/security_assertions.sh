#!/usr/bin/env bash
set -u
cd "$1"
pass=0; fail=0
check() {
  local file="$1" pat="$2" name="$3"
  if grep -Fq -- "$pat" "$file"; then
    printf 'PASS  %-52s %s\n' "$name" "$file"
    pass=$((pass+1))
  else
    printf 'FAIL  %-52s %s\n' "$name" "$file"
    fail=$((fail+1))
  fi
}
check brontide/noise.go 'Noise_XK_secp256k1_ChaChaPoly_SHA256' 'brontide protocol name'
check brontide/noise.go 'keyRotationInterval = 1000' 'brontide key rotation = 1000 msgs'
check brontide/noise.go 'handshakeReadTimeout = time.Second * 5' 'brontide handshake read timeout 5s'
check peer/brontide.go 'idleTimeout = 5 * time.Minute' 'peer idle timeout 5m'
check peer/ping_limits.go 'pingFloodRate rate.Limit = 10' 'ping flood rate 10/s'
check peer/ping_limits.go 'pingFloodBurst = 200' 'ping flood burst 200'
check config.go 'defaultRemoteMaxHtlcs = 483' 'default remote max HTLCs 483'
check input/size.go 'MaxHTLCNumber = 966' 'max HTLCs per commitment 966'
check htlcswitch/link.go 'DefaultMaxOutgoingCltvExpiry = 2016' 'max outgoing CLTV 2016'
check htlcswitch/switch.go 'DefaultMaxFeeExposure = lnwire.MilliSatoshi(500_000_000)' 'max fee exposure 500k sat'
check lnwallet/commitment.go 'DefaultAnchorsCommitMaxFeeRateSatPerVByte = 10' 'anchor commit fee cap 10 sat/vB'
check lnwallet/chainfee/rates.go 'FeePerKwFloor SatPerKWeight = 253' 'fee floor 253 sat/kw'
check lncfg/config.go 'DefaultMaxPendingChannels = 1' 'max pending channels 1'
check lnrpc/metadata.go 'MaxGrpcMsgSize = 200 * 1024 * 1024' 'gRPC max message 200 MiB'
check funding/manager.go 'MinChanFundingSize = btcutil.Amount(20000)' 'min channel size 20000 sat'
check funding/manager.go 'MaxBtcFundingAmountWumbo = btcutil.Amount(1000000000)' 'wumbo cap 1e9 sat'
check lnwallet/reservation.go 'maxChanReserve := channelCapacity / 5' 'reserve <= 20% capacity'
check lnwallet/reservation.go 'if commitParams.CsvDelay == 0 {' 'zero CSV delay rejected'
check lnwallet/reservation.go 'if bounds.MaxAcceptedHtlcs > uint16(input.MaxHTLCNumber/2) {' 'max accepted HTLCs <= 483'
check cert/tls.go 'MinVersion:   tls.VersionTLS12' 'TLS minimum 1.2'
check lncfg/address.go 'Refusing to start' 'public no-auth refused'
check lnd.go 'adminMacaroonFilePermissions = 0640' 'admin macaroon 0640'
check lnd.go 'ctx, svc, invoiceFile, invoicePermissions, 0644' 'invoice macaroon 0644'
check lnd.go 'ctx, svc, roFile, readPermissions, 0644' 'readonly macaroon 0644'
check lnwallet/channel.go 'derivedCommitPoint.IsEqual(currentCommitPoint)' 'revocation point checked'
check lnwallet/channel.go 'revocation key mismatch' 'revocation mismatch rejected'
check lnwallet/channel.go 'store.AddNextEntry(revocation)' 'secret added after check'
check lnwallet/channel.go 'revokedLog, revokedLogLegacy, err := chanState.FindPreviousState(' 'breach needs revocation log'
check lnwallet/channel.go 'revocationPreimage, err := chanState.RevocationStore.LookUp(stateNum)' 'breach secret from shachain store'
check contractcourt/chain_watcher.go 'case err == channeldb.ErrLogEntryNotFound:' 'missing log is not a breach'
check contractcourt/chain_watcher.go 'if c.cfg.chanState.HasChanStatus(channeldb.ChanStatusRestored) {' 'restored skips known remote'
check contractcourt/chain_watcher.go "we won't be able to recover any HTLC funds" 'unknown state loses HTLCs'
check lnwallet/channel.go 'case msg.RemoteCommitTailHeight > localTailHeight || isRestoredChan:' 'DLP trigger condition'
check lnwallet/channel.go 'return nil, nil, nil, &ErrCommitSyncLocalDataLoss{' 'local data loss error'
check htlcswitch/link.go 'err := l.channel.MarkDataLoss(' 'local data loss marks channel'
check watchtower/blob/derivation.go 'BreachHintSize = 16' 'breach hint 16 bytes'
check watchtower/wtclient/backup_task.go 'SHA256(txid || txid)' 'watchtower key from txid'
check watchtower/lookout/lookout.go 'key = SHA256(txid || txid)' 'tower derives key from txid'
check chanbackup/single.go 'e, err := lnencrypt.KeyRingEncrypter(keyRing)' 'SCB encrypted by keyring'
check chanbackup/single.go "s.LocalChanCfg.RevocationBasePoint.Family" "SCB stores shachain locator"
check lnwallet/commitment.go 'revocationBasePoint = localChanCfg.RevocationBasePoint.PubKey' 'revocation key from base point'
check input/script_utils.go 'witnessStack[1] = []byte{1}' 'revoke witness selects branch 1'
check htlcswitch/link.go 'incomingDelta < timeDelta' 'CLTV delta minimum enforced'
check htlcswitch/link.go 'incomingDelta > l.cfg.MaxOutgoingCltvExpiry' 'CLTV delta maximum enforced'
check htlcswitch/link.go 'timeout > l.cfg.MaxOutgoingCltvExpiry+heightNow' 'absolute CLTV cap enforced'
check htlcswitch/link.go 'if totalLocalDust > l.cfg.MaxFeeExposure {' 'fee exposure cap enforced'
check discovery/gossiper.go 'DefaultMaxChannelUpdateBurst = 10' 'gossip update burst 10'
check discovery/gossiper.go 'DefaultChannelUpdateInterval = time.Minute' 'gossip update interval 1m'
check discovery/ban.go 'DefaultBanThreshold = 100' 'gossip ban threshold 100'
check lncfg/protocol.go 'onion-msg-peer-kbps' 'onion per-peer limiter flag'
check invoices/invoices.go 'MaxFinalCltvDelta = math.MaxUint16' 'final CLTV delta unbounded'
printf '\nSUMMARY pass=%d fail=%d total=%d\n' "$pass" "$fail" "$((pass+fail))"
