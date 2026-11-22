#!/usr/bin/env python3
"""Independent integer arithmetic and Borsh log decoder; no Rust/SDK execution."""
import base64
import hashlib
import json
import re
from fractions import Fraction
from pathlib import Path

here = Path(__file__).resolve().parent
result = json.loads((here/'result.json').read_text())
log = (here/'execution.log').read_text()
observations = [json.loads(line[line.index('WIKI ')+5:]) for line in log.splitlines() if 'WIKI {' in line]
assert observations == result['observations']
assert log.count('test result: ok. 1 passed; 0 failed') == 5
by_stage = {row['stage']:row for row in observations}
B, Q = 10**9, 10**6
ceil_div = lambda a,b: (a+b-1)//b
match = by_stage['match']
quote = B*(100*Q)//B
fee, rebate = ceil_div(quote*5,10000), quote*3//10000
assert match == {'stage':'match','base':B,'quote':-quote-fee,'entry':-quote,
 'breakEven':-quote-fee,'fee':fee,'makerBase':-B,'makerQuote':quote+rebate,
 'rebate':rebate,'marketFee':fee-rebate}
delta = 10_000_000
payment = -((delta*B//10**6//1000)//1000)
funded = -quote-fee+payment
funding = by_stage['funding']
assert funding == {'stage':'funding','quote':funded,'entry':-quote,'breakEven':funded,
 'lastFunding':delta,'cumulativePayment':payment,'netUnsettledFundingPnl':-payment}
assert by_stage['funding-repeat']['quote'] == funded
risk = []
for row in observations:
 if row['stage'] != 'risk': continue
 price = row['price']
 notional = B*price//B
 pnl = notional+funded
 ratio = {'Initial':1000,'Fill':750,'Maintenance':500}[row['kind']]
 requirement = notional*ratio//10000
 assert row['pnl']==pnl and row['requirement']==requirement
 assert row['liability']==notional and row['value']==notional
 equity = 20*Q+pnl
 risk.append({**row,'assumedQuoteCollateral':20*Q,'assumedEquity':equity,
              'meetsUnderStatedAssumptions':equity>=requirement})
before, after = by_stage['failure-before'], by_stage['failure-after']
assert all(before[key]==0 for key in ['takerBase','takerQuote','makerBase','makerQuote'])
failed_quote = 95*Q
failed_fee, failed_rebate = ceil_div(failed_quote*5,10000), failed_quote*3//10000
assert after['error']=='InsufficientCollateral'
assert (after['takerBase'],after['takerQuote'])==(B,-failed_quote-failed_fee)
assert (after['makerBase'],after['makerQuote'])==(-B,failed_quote+failed_rebate)
maker_equity = 10*Q+failed_quote+failed_rebate-100*Q
maker_requirement = 100*Q*750//10000
assert maker_equity < maker_requirement
assert f'(margin requirement {maker_requirement}) (total_collateral {maker_equity})' in log
assert after['takerUnchanged'] is False and after['makerUnchanged'] is False
assert by_stage['oracle-band']=={'stage':'oracle-band','fillBase':0,'makerOrderAvailable':True,'makerBase':0}
liq=by_stage['liquidation']
transfer_quote = 100*Q - (100*Q//100)
assert liq=={'stage':'liquidation','userBase':0,'userQuote':-150*Q+transfer_quote,
 'openOrders':0,'liquidatorBase':B,'liquidatorQuote':-transfer_quote,'insuranceFee':0}
hybrid=by_stage['hybrid']
assert hybrid['base']==-hybrid['makerBase']+hybrid['ammBase']==B
assert hybrid['quote']==hybrid['entry']-hybrid['fee']

# Decode the raw emitted bytes using a fixed subset of the program tag's IDL.
schema=json.loads((here/'event-schema.json').read_text())
definitions={t['name']:t['type'] for t in schema['types']}
events={hashlib.sha256(('event:'+e['name']).encode()).digest()[:8]:e for e in schema['events']}

class Reader:
 def __init__(self,b): self.b,self.pos=b,0
 def take(self,n):
  assert self.pos+n<=len(self.b)
  b=self.b[self.pos:self.pos+n];self.pos+=n;return b
 def fields(self,fields): return {f['name']:self.read(f['type']) for f in fields}
 def read(self,t):
  if isinstance(t,str):
   if re.fullmatch('[ui](8|16|32|64|128)',t):return int.from_bytes(self.take(int(t[1:])//8),'little',signed=t[0]=='i')
   if t=='bool':
    value=self.read('u8');assert value in (0,1);return bool(value)
   if t=='publicKey':return self.take(32).hex()
   raise AssertionError(t)
  if 'option' in t:
   present=self.read('u8');assert present in (0,1)
   return self.read(t['option']) if present else None
  if 'array' in t:return [self.read(t['array'][0]) for _ in range(t['array'][1])]
  if 'vec' in t:return [self.read(t['vec']) for _ in range(self.read('u32'))]
  if 'defined' in t:
   definition=definitions[t['defined']]
   if definition['kind']=='struct':return self.fields(definition['fields'])
   variant=definition['variants'][self.read('u8')]
   assert not variant.get('fields'), variant
   return variant['name']
  raise AssertionError(t)

decoded=[];test=None
for line in log.splitlines():
 if line.startswith('$ cargo test '):test=line.split('--lib ',1)[1].split()[0]
 candidate=line.split(' ... ',1)[-1].removeprefix('data: ')
 if not re.fullmatch('[A-Za-z0-9+/]+={0,2}',candidate) or len(candidate)%4:continue
 binary=base64.b64decode(candidate,validate=True)
 event=events.get(binary[:8])
 if event is None:continue
 reader=Reader(binary[8:]);fields=reader.fields(event['fields'])
 assert reader.pos==len(binary)-8,(event['name'],reader.pos,len(binary)-8)
 decoded.append({'test':test,'event':event['name'],'fields':fields,'rawSha256':hashlib.sha256(binary).hexdigest()})
assert decoded
matching=[e['fields'] for e in decoded if 'start_of_auction' in e['test'] and e['event']=='OrderActionRecord' and e['fields']['action']=='Fill']
assert len(matching)==1
assert matching[0]['baseAssetAmountFilled']==B and matching[0]['quoteAssetAmountFilled']==quote
assert matching[0]['takerFee']==fee and matching[0]['makerFee']==-rebate
oracle_events=[e['fields'] for e in decoded if 'breaching_oracle_price_band' in e['test'] and e['event']=='OrderActionRecord']
assert any(e['action']=='Cancel' and e['actionExplanation']=='OraclePriceBreachedLimitPrice' for e in oracle_events)
failure_events=[e for e in decoded if 'insufficient_collateral' in e['test'] and e['event']=='OrderActionRecord']
assert any(e['fields']['action']=='Fill' for e in failure_events), 'Native function emitted a Fill before returning Err'

funding_events=[e['fields'] for e in decoded if e['event']=='FundingPaymentRecord']
assert len(funding_events)==1 and funding_events[0]['fundingPayment']==payment
hybrid_events=[e['fields'] for e in decoded if 'fulfill_with_amm_and_maker' in e['test'] and e['event']=='OrderActionRecord']
assert len(hybrid_events)==3
assert sum(e['baseAssetAmountFilled'] for e in hybrid_events)==B
assert sum(e['quoteAssetAmountFilled'] for e in hybrid_events)==-hybrid['entry']
assert sum(e['takerFee'] for e in hybrid_events)==hybrid['fee']
assert sum(e['fillerReward'] for e in hybrid_events)==hybrid['fillerReward']
for e in hybrid_events:
 assert e['takerFee']==ceil_div(e['quoteAssetAmountFilled']*5,10000)
 if e['makerFee'] is not None:
  assert -e['makerFee']==e['quoteAssetAmountFilled']*3//10000
liquidation_events=[e['fields'] for e in decoded if e['event']=='LiquidationRecord']
assert len(liquidation_events)==1
liquidation_event=liquidation_events[0]['liquidatePerp']
assert liquidation_event['baseAssetAmount']==-B and liquidation_event['quoteAssetAmount']==100*Q
assert liquidation_event['liquidatorFee']==Q and liquidation_event['ifFee']==0

report={'status':'passed','match':match,'fundingPayment':payment,'positionRiskAndAssumedCollateral':risk,
 'continuousBoundaryFraction':str(Fraction(8006,95)),
 'failureMakerRequirement':maker_requirement,'failureMakerEquity':maker_equity,
 'nativeFailureDidNotRollback':True,'liquidation':liq,'decodedEvents':decoded,
 'scope':'Independent integers and raw native logs; no runtime rollback, oracle network, deployment, whole-account risk or full independent AMM reconstruction'}
(here/'calculation.json').write_text(json.dumps(report,indent=2)+'\n')
print('PASS: fees, funding, nine risk values, real error, native non-rollback, liquidation and',len(decoded),'raw events')
