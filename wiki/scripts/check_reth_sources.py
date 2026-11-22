#!/usr/bin/env python3
"""Check fixed source links against git blobs and the raw official HTTP bytes."""
import argparse
import concurrent.futures
import hashlib
import json
import re
import subprocess
import urllib.request
from pathlib import Path
ROOT=Path(__file__).resolve().parents[2]
PIN='b9abbcc1b982755baa9021e6874e2e58936ca65f'
def main():
 ap=argparse.ArgumentParser();ap.add_argument('--source',required=True,type=Path);ap.add_argument('--output',required=True,type=Path);a=ap.parse_args()
 refs=json.loads((ROOT/'wiki/plans/reth-source/references.json').read_text());docs=ROOT/'wiki/docs/wiki/blockchain/ethereum/reth';actual=set()
 for p in docs.glob('*.md'):
  text=p.read_text();assert '@@' not in text
  actual.update(re.findall(r'https://github.com/paradigmxyz/reth/blob/[^)\s]+',text))
 assert actual=={r['url'] for r in refs}
 files={}
 for r in refs:
  data=subprocess.check_output(['git','show',PIN+':'+r['file']],cwd=a.source);assert hashlib.sha256(data).hexdigest()==r['sha256']
  lines=data.decode().splitlines();assert 1<=r['firstLine']<=r['lastLine']<=len(lines)
  files[r['file']]=data
 def fetch(item):
  name,data=item;url='https://raw.githubusercontent.com/paradigmxyz/reth/'+PIN+'/'+name
  with urllib.request.urlopen(url,timeout=45) as response:body=response.read();status=response.status
  assert body==data,(name,'HTTP bytes differ from fixed git blob')
  return dict(file=name,url=url,status=status,bytes=len(body),sha256=hashlib.sha256(body).hexdigest())
 with concurrent.futures.ThreadPoolExecutor(max_workers=4) as executor:checks=list(executor.map(fetch,sorted(files.items())))
 # Prove the only checkout changes are the published observation patch.
 patch=subprocess.check_output(['git','diff','--','crates/transaction-pool/src/pool/txpool.rs','crates/ethereum/evm/src/executor.rs'],cwd=a.source)
 assert patch==(ROOT/'wiki/static/examples/reth-v2.11.0/observations.patch').read_bytes()
 changed=subprocess.check_output(['git','diff','--name-only'],cwd=a.source,text=True).splitlines();assert set(changed)=={'crates/transaction-pool/src/pool/txpool.rs','crates/ethereum/evm/src/executor.rs'}
 additions=[line for line in patch.decode().splitlines() if line.startswith('+') and not line.startswith('+++')]
 deletions=[line for line in patch.decode().splitlines() if line.startswith('-') and not line.startswith('---')]
 assert len(additions)==4 and not deletions and all('println!' in line for line in additions)
 # Every other tracked file, including all production code and Cargo.lock, is unchanged.
 a.output.write_text(json.dumps(dict(status='passed',commit=PIN,sourceReferences=len(refs),fixedHttpFiles=checks,checkoutDiff='Only four println additions within two original test functions; original assertions and all other tracked bytes unchanged',sourceLinks=refs),ensure_ascii=False,indent=2)+'\n')
 print('PASS',len(refs),'fixed line references;',len(checks),'official HTTP source files match git blobs; only test stdout additions')
if __name__=='__main__':main()
