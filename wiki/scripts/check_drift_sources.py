#!/usr/bin/env python3
"""Validate fixed article references, production sources, test patch and IDL subset."""
import argparse
import hashlib
import json
import re
import subprocess
from pathlib import Path

p=argparse.ArgumentParser()
p.add_argument('--source-dir',required=True,type=Path)
p.add_argument('--output',required=True,type=Path)
args=p.parse_args()
root=args.source_dir.resolve()
site=Path(__file__).resolve().parents[1]
assets=site/'static/examples/drift-position'
commit='d686955cdc0d02ca4647c8fc71dac1dc4ed9c269'
git=lambda *a:subprocess.check_output(['git','-C',str(root),*a])
assert git('rev-parse','HEAD').decode().strip()==commit
article=(site/'docs/wiki/blockchain/defi/perps/drift-position-lifecycle.md').read_text()
refs=[]
for file,fragment in sorted(set(re.findall(r'https://github.com/drift-labs/protocol-v2/blob/'+commit+r'/([^\s)#]+)(#[^\s)]+)?',article))):
 content=git('show',commit+':'+file)
 assert (root/file).read_bytes()==content,file
 if fragment:
  m=re.fullmatch(r'#L(\d+)(?:-L(\d+))?',fragment);assert m,fragment
  assert 1<=int(m[1])<=int(m[2] or m[1])<=len(content.splitlines()),(file,fragment,len(content.splitlines()))
 refs.append({'file':file,'fragment':fragment,'sha256':hashlib.sha256(content).hexdigest()})
allowed={'programs/drift/src/controller/orders/tests.rs','programs/drift/src/controller/liquidation/tests.rs','programs/drift/src/test_utils.rs'}
changed=set(git('diff','--name-only').decode().splitlines())
assert changed==allowed,changed
assert git('diff','--','programs/drift/src/controller/orders/tests.rs','programs/drift/src/controller/liquidation/tests.rs','programs/drift/src/test_utils.rs')==(assets/'observations.patch').read_bytes()
hashes=json.loads((assets/'source-hashes.json').read_text())
for file,expected in hashes.items():
 content=(root/file).read_bytes()
 assert hashlib.sha256(content).hexdigest()==expected,file
 if file not in allowed:assert content==git('show',commit+':'+file),file
assert (root/'Cargo.lock').read_bytes()==(assets/'Cargo.lock').read_bytes()
schema=json.loads((assets/'event-schema.json').read_text())
idl=json.loads(git('show',commit+':sdk/src/idl/drift.json'))
assert schema['types']==idl['types']
for event in schema['events']:assert event in idl['events']
result={'status':'passed','commit':commit,'references':refs,'sourceFilesHashed':len(hashes),
 'onlyChangedUpstreamFiles':sorted(changed),'productionAndLockByteExact':True,'idlSubsetByteEquivalent':True,
 'scope':'Git objects and native Rust inputs; no mainnet ELF or SBF comparison'}
args.output.write_text(json.dumps(result,indent=2)+'\n')
print('PASS:',len(refs),'references;',len(hashes),'source/manifest/lock hashes; production unchanged')
