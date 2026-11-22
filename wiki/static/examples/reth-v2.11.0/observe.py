#!/usr/bin/env python3
"""Add stdout observations to two fixed upstream tests; preserve all original assertions."""
import subprocess
import sys
from pathlib import Path
COMMIT='b9abbcc1b982755baa9021e6874e2e58936ca65f'
root=Path(sys.argv[1]).resolve()
assert subprocess.check_output(['git','rev-parse','HEAD'],cwd=root,text=True).strip()==COMMIT
edits=[
 ('crates/transaction-pool/src/pool/txpool.rs','best_transactions_nonce_order_on_gap_fill','best_transactions_nonce_order_mixed_promotions',[
  ('assert!(best.next().is_none(), "pool should have no pending txs yet");','assert!(best.next().is_none(), "pool should have no pending txs yet");\n        println!("RETH_OBS pool before_gap_best_empty=true");'),
  ('assert_eq!(t1.id().nonce, 1, "second yielded tx should be nonce 1, got {}", t1.id().nonce);','assert_eq!(t1.id().nonce, 1, "second yielded tx should be nonce 1, got {}", t1.id().nonce);\n        println!("RETH_OBS pool yielded_nonces={},{}", t0.id().nonce, t1.id().nonce);')]),
 ('crates/ethereum/evm/src/executor.rs','big_block_executor_preserves_state_across_segment_switch','amsterdam_admission_enforces_uncapped_state_gas_budget',[
  ('assert_eq!(changes.account_info(&from).expect("sender changed").nonce, 1);','assert_eq!(changes.account_info(&from).expect("sender changed").nonce, 1);\n                    println!("RETH_OBS execution discarded_candidate_nonce=1");'),
  ('        // The prewarming environment must not change the beneficiary reward during execution.','        println!("RETH_OBS execution receipts={} gas_used={} sender_nonce={} sender_balance={} first_balance={} second_balance={}", output.result.receipts.len(), output.result.gas_used, output.account(&from).unwrap().unwrap().nonce, output.account(&from).unwrap().unwrap().balance, output.account(&first_target).unwrap().unwrap().balance, output.account(&second_target).unwrap().unwrap().balance);\n        // The prewarming environment must not change the beneficiary reward during execution.')])]
for name,fn,nextfn,replacements in edits:
 p=root/name;original=subprocess.check_output(['git','show',COMMIT+':'+name],cwd=root).decode();actual=p.read_text();assert actual==original,(name,'requires pristine input')
 start=original.index('    fn '+fn+'(');end=original.index('    fn '+nextfn+'(',start);block=original[start:end]
 for old,new in replacements:assert block.count(old)==1,(name,old);block=block.replace(old,new)
 p.write_text(original[:start]+block+original[end:])
print('Only observation println! statements added to the two fixed upstream test functions.')
