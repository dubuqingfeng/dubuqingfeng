#!/usr/bin/env python3
"""Read-only RPC evidence collector. No wallet, signing, or third-party packages."""

import argparse
from datetime import datetime, timezone
import json
from pathlib import Path
import platform
import sys
import urllib.parse
import urllib.request


def now():
    return datetime.now(timezone.utc).isoformat()


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument("--rpc", default="https://api.devnet.solana.com")
    parser.add_argument("--signature", required=True)
    parser.add_argument("--max-version", type=int, default=1)
    parser.add_argument("--output", type=Path, required=True)
    args = parser.parse_args()
    alphabet = set("123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz")
    if not 64 <= len(args.signature) <= 88 or not set(args.signature) <= alphabet:
        parser.error("signature must be a base58 transaction signature (64..88 characters)")
    digits = "123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz"
    decoded = 0
    for character in args.signature:
        decoded = decoded * 58 + digits.index(character)
    leading_zeros = len(args.signature) - len(args.signature.lstrip("1"))
    if leading_zeros + (decoded.bit_length() + 7) // 8 != 64:
        parser.error("signature must decode to exactly 64 bytes")
    endpoint = urllib.parse.urlparse(args.rpc)
    if endpoint.scheme != "https" or not endpoint.hostname or endpoint.username or endpoint.password:
        parser.error("rpc must be an HTTPS URL without embedded credentials")
    if not 0 <= args.max_version <= 127:
        parser.error("max-version must be in 0..127")

    evidence = {
        "started_at": now(),
        "environment": {"python": platform.python_version(), "platform": platform.platform()},
        "rpc": args.rpc,
        "signature": args.signature,
        "max_supported_transaction_version": args.max_version,
        "exchanges": [],
    }

    def rpc(method, params):
        request = {"jsonrpc": "2.0", "id": len(evidence["exchanges"]) + 1,
                   "method": method, "params": params}
        exchange = {"started_at": now(), "request": request}
        evidence["exchanges"].append(exchange)
        req = urllib.request.Request(args.rpc, data=json.dumps(request).encode(),
                                     headers={"Content-Type": "application/json"})
        with urllib.request.urlopen(req, timeout=30) as response:
            exchange["http_status"] = response.status
            body = json.load(response)
        exchange["received_at"] = now()
        exchange["response"] = body
        if body.get("id") != request["id"] or "error" in body or "result" not in body:
            raise RuntimeError(f"{method}: invalid or failed RPC response: {body}")
        return body["result"]

    exit_code = 0
    try:
        evidence["genesis_hash"] = rpc("getGenesisHash", [])
        evidence["node_version"] = rpc("getVersion", [])
        tx = rpc("getTransaction", [args.signature, {
            "commitment": "finalized", "encoding": "jsonParsed",
            "maxSupportedTransactionVersion": args.max_version}])
        if tx is None:
            raise RuntimeError("transaction unavailable at finalized; null does not prove it never executed")
        if tx["transaction"]["signatures"][0] != args.signature:
            raise RuntimeError("returned signature mismatch")
        status_result = rpc("getSignatureStatuses", [[args.signature], {"searchTransactionHistory": True}])
        status = status_result["value"][0]
        if status is None or status["slot"] != tx["slot"] or status["err"] != tx["meta"]["err"]:
            raise RuntimeError("status missing or inconsistent with transaction")
        if status["confirmationStatus"] != "finalized":
            raise RuntimeError("status has not reached finalized")
        block = rpc("getBlock", [tx["slot"], {
            "commitment": "finalized", "encoding": "json", "transactionDetails": "signatures",
            "maxSupportedTransactionVersion": args.max_version, "rewards": False}])
        if block is None:
            raise RuntimeError("block unavailable")
        index = block["signatures"].index(args.signature)
        keys = tx["transaction"]["message"]["accountKeys"]
        writable_keys = [key["pubkey"] for key in keys if key["writable"]]
        current = rpc("getMultipleAccounts", [writable_keys, {
            "commitment": "finalized", "encoding": "base64", "dataSlice": {"offset": 0, "length": 0},
            "minContextSlot": tx["slot"]}])
        pre, post = tx["meta"]["preBalances"], tx["meta"]["postBalances"]
        if len(keys) != len(pre) or len(pre) != len(post):
            raise RuntimeError("account/balance length mismatch")
        evidence["summary"] = {
            "slot": tx["slot"], "blockhash": block["blockhash"],
            "parent_slot": block["parentSlot"], "transaction_index": index,
            "transaction_version": tx["version"], "err": tx["meta"]["err"],
            "confirmation_status": status["confirmationStatus"], "fee_lamports": tx["meta"]["fee"],
            "compute_units_consumed": tx["meta"].get("computeUnitsConsumed"),
            "account_balances": [{"pubkey": key["pubkey"], "pre": a, "post": b, "delta": b - a}
                                 for key, a, b in zip(keys, pre, post)],
            "sum_balance_delta": sum(post) - sum(pre),
            "current_accounts_context_slot": current["context"]["slot"],
            "current_accounts_are_transaction_snapshot": False,
        }
        print(json.dumps(evidence["summary"], ensure_ascii=False, indent=2))
    except Exception as error:
        evidence["failure"] = {"type": type(error).__name__, "message": str(error)}
        print(f"FAILED: {error}", file=sys.stderr)
        exit_code = 1
    finally:
        evidence["finished_at"] = now()
        args.output.parent.mkdir(parents=True, exist_ok=True)
        args.output.write_text(json.dumps(evidence, ensure_ascii=False, indent=2) + "\n")
    return exit_code


if __name__ == "__main__":
    sys.exit(main())
