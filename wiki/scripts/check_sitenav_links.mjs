#!/usr/bin/env node
/**
 * Check connectivity for URLs referenced by:
 * - static/json/right_links.yaml
 *
 * Usage:
 *   node scripts/check_sitenav_links.mjs
 *   node scripts/check_sitenav_links.mjs --timeout 8000 --concurrency 10
 *
 * Notes:
 * - Many sites reject HEAD; we fall back to GET.
 * - This script requires network access when you run it.
 */

import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";
import { createRequire } from "node:module";
import http from "node:http";
import https from "node:https";

const require = createRequire(import.meta.url);
const yaml = require("js-yaml");

const DEFAULT_TIMEOUT_MS = 8000;
const DEFAULT_CONCURRENCY = 10;

function parseArgs(argv) {
  const args = {
    timeoutMs: DEFAULT_TIMEOUT_MS,
    concurrency: DEFAULT_CONCURRENCY,
    only: null, // substring filter
  };
  for (let i = 0; i < argv.length; i++) {
    const a = argv[i];
    if (a === "--timeout" && argv[i + 1]) {
      args.timeoutMs = Number(argv[++i]);
      continue;
    }
    if (a === "--concurrency" && argv[i + 1]) {
      args.concurrency = Number(argv[++i]);
      continue;
    }
    if (a === "--only" && argv[i + 1]) {
      args.only = String(argv[++i]);
      continue;
    }
    if (a === "--help" || a === "-h") {
      console.log(`Usage:
  node scripts/check_sitenav_links.mjs [--timeout ms] [--concurrency n] [--only substring]
`);
      process.exit(0);
    }
  }
  if (!Number.isFinite(args.timeoutMs) || args.timeoutMs <= 0) {
    throw new Error(`Invalid --timeout: ${args.timeoutMs}`);
  }
  if (!Number.isFinite(args.concurrency) || args.concurrency <= 0) {
    throw new Error(`Invalid --concurrency: ${args.concurrency}`);
  }
  return args;
}

function normalizeUrl(url) {
  if (!url) return url;
  if (url.startsWith("http://") || url.startsWith("https://")) return url;
  return `https://${url}`;
}

function uniq(arr) {
  return Array.from(new Set(arr));
}

function extractFromRight(right) {
  const urls = [];
  for (const sec of right ?? []) {
    for (const l of sec?.special ?? []) {
      if (l?.link) urls.push(String(l.link));
    }
    for (const c of sec?.classify ?? []) {
      for (const l of c?.links ?? []) {
        if (l?.link) urls.push(String(l.link));
      }
    }
  }
  return urls;
}

async function readDataFiles() {
  const rightPath = path.resolve(process.cwd(), "static/json/right_links.yaml");

  const rightText = await fs.readFile(rightPath, "utf8");
  const right = yaml.load(rightText);
  return { right };
}

async function checkUrl(url, timeoutMs) {
  const startedAt = Date.now();

  const headers = {
    // Some servers behave better with a UA.
    "user-agent": "sitenav-link-check/1.0",
    accept: "text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8",
  };

  function requestOnce(targetUrl, method, maxRedirects = 5) {
    return new Promise((resolve, reject) => {
      const u = new URL(targetUrl);
      const lib = u.protocol === "https:" ? https : http;

      const req = lib.request(
        {
          protocol: u.protocol,
          hostname: u.hostname,
          port: u.port || undefined,
          path: `${u.pathname}${u.search}`,
          method,
          headers,
        },
        (res) => {
          // Follow redirects ourselves (Node 16 compatible).
          const redirectCodes = new Set([301, 302, 303, 307, 308]);
          const loc = res.headers.location;
          if (redirectCodes.has(res.statusCode) && loc && maxRedirects > 0) {
            res.resume();
            const next = new URL(loc, u).toString();
            requestOnce(next, method === "HEAD" ? "HEAD" : "GET", maxRedirects - 1)
              .then(resolve)
              .catch(reject);
            return;
          }

          res.resume(); // discard body
          res.on("end", () => {
            resolve({ status: res.statusCode ?? null });
          });
        }
      );

      req.on("error", reject);
      req.setTimeout(timeoutMs, () => {
        req.destroy(new Error("timeout"));
      });
      req.end();
    });
  }

  try {
    let res = null;
    try {
      res = await requestOnce(url, "HEAD");
      // Some sites return 403/405 for HEAD but are reachable via GET.
      if (res.status === 403 || res.status === 405 || res.status === 400) {
        res = await requestOnce(url, "GET");
      }
    } catch {
      // HEAD might fail due to TLS / method / proxy; try GET once.
      res = await requestOnce(url, "GET");
    }

    const ms = Date.now() - startedAt;
    const ok = res?.status != null && res.status >= 200 && res.status < 400;
    return { url, ok, status: res?.status ?? null, ms };
  } catch (e) {
    const ms = Date.now() - startedAt;
    const msg = e?.message ?? String(e);
    return { url, ok: false, status: null, ms, error: msg };
  }
}

async function runPool(items, concurrency, worker) {
  const results = [];
  let idx = 0;

  async function runOne() {
    while (true) {
      const i = idx++;
      if (i >= items.length) return;
      results[i] = await worker(items[i], i);
    }
  }

  await Promise.all(Array.from({ length: Math.min(concurrency, items.length) }, runOne));
  return results;
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const { right } = await readDataFiles();

  const urls = uniq(
    [...extractFromRight(right)]
      .filter(Boolean)
      .map((u) => normalizeUrl(String(u).trim()))
      .filter(Boolean)
  ).filter((u) => (args.only ? u.includes(args.only) : true));

  if (urls.length === 0) {
    console.log("No URLs found.");
    return;
  }

  console.log(
    `Checking ${urls.length} URLs (timeout=${args.timeoutMs}ms, concurrency=${args.concurrency})...`
  );

  const results = await runPool(urls, args.concurrency, (u) =>
    checkUrl(u, args.timeoutMs)
  );

  const ok = results.filter((r) => r.ok);
  const fail = results.filter((r) => !r.ok);

  console.log(`OK: ${ok.length}, FAIL: ${fail.length}`);

  if (fail.length) {
    console.log("\nFailures:");
    for (const r of fail) {
      const status = r.status == null ? "-" : String(r.status);
      const extra = r.error ? ` (${r.error})` : "";
      console.log(`- [${status}] ${r.url} (${r.ms}ms)${extra}`);
    }
    process.exitCode = 1;
  }
}

main().catch((e) => {
  console.error(e);
  process.exit(2);
});
