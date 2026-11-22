#!/usr/bin/env python3
"""Run fixed upstream Rust cases with observations, preserving complete output."""
import argparse
import hashlib
import json
import os
import platform
import subprocess
import sys
from datetime import datetime, timezone
from pathlib import Path

here = Path(__file__).resolve().parent
p = argparse.ArgumentParser()
p.add_argument('source', type=Path)
args = p.parse_args()
source = args.source.resolve()
subprocess.run([sys.executable, str(here/'prepare.py'), str(source)], check=True)
tests = [
 'controller::orders::tests::fulfill_order_with_maker_order::long_taker_order_fulfilled_start_of_auction',
 'controller::orders::tests::fulfill_order::fulfill_with_amm_and_maker',
 'controller::orders::tests::fulfill_order::maker_insufficient_collateral',
 'controller::orders::tests::fill_order::maker_order_canceled_for_breaching_oracle_price_band',
 'controller::liquidation::tests::liquidate_perp::successful_liquidation_long_perp',
]
environment = {'date':datetime.now(timezone.utc).isoformat(), 'platform':platform.platform(),
 'machine':platform.machine(), 'python':sys.version, 'commands':[], 'scope':'native Rust library tests; no validator, SBF, RPC, SDK transaction or runtime rollback'}
for command in [['rustc','-Vv'], ['cargo','-V'], ['git','rev-parse','HEAD']]:
 environment[' '.join(command)] = subprocess.check_output(command, cwd=source).decode()
records = []
with (here/'execution.log').open('w') as log:
 for test in tests:
  command = ['cargo','test','--locked','-p','drift','--lib',test,'--','--exact','--nocapture','--test-threads=1']
  environment['commands'].append(command)
  log.write('$ '+' '.join(command)+'\n'); log.flush()
  result = subprocess.run(command, cwd=source, stdout=subprocess.PIPE, stderr=subprocess.STDOUT)
  output = result.stdout.decode()
  log.write(output); log.flush()
  assert result.returncode == 0, (test, result.returncode)
  assert '1 passed; 0 failed' in output and 'running 1 test' in output, test
  for line in output.splitlines():
   if 'WIKI {' in line: records.append(json.loads(line[line.index('WIKI ')+5:]))
  print('PASS',test,flush=True)
environment['cargoLockSha256'] = hashlib.sha256((source/'Cargo.lock').read_bytes()).hexdigest()
(here/'environment.json').write_text(json.dumps(environment, indent=2)+'\n')
(here/'result.json').write_text(json.dumps({'tests':tests,'observations':records}, indent=2)+'\n')
