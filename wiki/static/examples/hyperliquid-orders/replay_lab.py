#!/usr/bin/env python3
"""Execute synthetic official-shaped order/fill messages and REST recovery rounds.
Not an exchange simulator, SDK reconnect implementation, or live trading trace.
"""
import copy
import hashlib
import json
import sys
from decimal import Decimal as D
from pathlib import Path

HERE=Path(__file__).parent

def fingerprint(x):
    return hashlib.sha256(json.dumps(x,sort_keys=True,separators=(',',':')).encode()).hexdigest()


class Ledger:
    def __init__(self, user):
        self.user=user
        self.orders={}
        self.intents={}
        self.fills={}
        self.order_events=set()
        self.needs_query=set()
        self.audit=[]

    def register(self,intent):
        cloid=intent['cloid']
        assert cloid not in self.intents
        self.intents[cloid]={**intent,'state':'pending','oid':None}
        self.audit.append('pending intent '+cloid)

    def timeout(self,cloid):
        intent=self.intents[cloid]
        if intent['oid'] is None:
            intent['state']='unknown'
            self.audit.append('timeout unknown '+cloid)

    def order(self,event,source='ws'):
        oid=str(event['order']['oid'])
        key=fingerprint(event)
        if key in self.order_events:
            self.audit.append('duplicate order '+oid);return
        self.order_events.add(key)
        old=self.orders.get(oid)
        if old and event['statusTimestamp'] < old['statusTimestamp']:
            self.audit.append('stale order '+oid);return
        if old and event['statusTimestamp']==old['statusTimestamp'] and old!=event:
            self.needs_query.add(oid);self.audit.append('same-time conflict '+oid);return
        # Timestamps provide a heuristic for a single order, never a stream cursor.
        if old and old['status']!='open' and event['status']=='open':
            self.needs_query.add(oid);self.audit.append('terminal conflict '+oid);return
        self.orders[oid]=copy.deepcopy(event)
        cloid=event['order'].get('cloid')
        if cloid in self.intents:
            self.intents[cloid].update(state=event['status'],oid=oid)
        self.audit.append(source+' order '+oid+' '+event['status'])

    def fill(self,fill,source='ws'):
        # Documented trade tuple, scoped by network and account. No aggregation in fixtures.
        key=('Testnet',self.user,fill['time'],fill['coin'],fill['tid'])
        old=self.fills.get(key)
        if old:
            if old!=fill:
                self.needs_query.add(str(fill['oid']));self.audit.append('conflicting fill');return
            self.audit.append('duplicate fill '+str(fill['tid']));return
        self.fills[key]=copy.deepcopy(fill)
        self.audit.append(source+' fill '+str(fill['tid']))

    def message(self,msg):
        if msg['channel']=='orderUpdates':
            for event in msg['data']:self.order(event)
        elif msg['channel']=='userFills':
            assert msg['data']['user']==self.user
            for fill in msg['data']['fills']:self.fill(fill,'snapshot' if msg['data'].get('isSnapshot') else 'ws')
        else:raise ValueError('Unexpected fixture channel')

    def reconcile(self,round_,tracked):
        # REST requests are not an atomic snapshot. Repeated identical rounds only establish
        # convergence for this quiescent fixture. Live mismatches require another query round.
        for fill in round_['userFillsByTime']:self.fill(fill,'rest')
        unresolved=[]
        for local_id in tracked:
            answer=round_['orderStatus'][local_id]
            if answer['status']=='order':
                self.order(answer['order'],'rest')
            else:
                assert answer['status']=='unknownOid';unresolved.append(local_id)
                self.intents[local_id].update(state='unknown',queryResult='unknownOid')
        current_open={str(o['oid']):o for o in round_['openOrders']}
        known_open={oid:e['order'] for oid,e in self.orders.items() if e['status']=='open'}
        consistent=set(current_open)==set(known_open)
        for oid in current_open.keys() & known_open.keys():
            consistent &= D(current_open[oid]['sz'])==D(known_open[oid]['sz'])
        position=round_['clearinghouseState']['assetPositions'][0]['position']
        # The fixture starts flat, has no transfers, other markets, funding or liquidation.
        derived=sum((D(f['sz'])*(1 if f['side']=='B' else -1) for f in self.fills.values()),D(0))
        consistent &= derived==D(position['szi'])
        self.audit.append('rest reconciliation '+str(bool(consistent)))
        return dict(consistent=bool(consistent),unresolved=unresolved,position=position,
                    fillDerivedSzi=str(derived),openOids=sorted(current_open),
                    digest=fingerprint(dict(openOrders=round_['openOrders'],orderStatus=round_['orderStatus'],position=position)))


def run(data):
    ledger=Ledger(data['user'])
    for intent in data['intents']:ledger.register(intent)
    assert all(x['state']=='pending' for x in ledger.intents.values())
    transitions=[]
    for msg in data['beforeDisconnect']:
        ledger.message(msg)
        filled=sum((D(f['sz']) for f in ledger.fills.values() if f['oid']==101),D(0))
        e=ledger.orders.get('101')
        transitions.append(dict(oid101=e['status'] if e else 'pending',knownFills=str(filled),
                                clientPartial=bool(e and e['status']=='open' and filled>0)))
    assert any(t['clientPartial'] for t in transitions)
    assert ledger.orders['101']['status']=='open'
    assert sum(D(f['sz']) for f in ledger.fills.values())==D('0.4')
    # Querying an empty open-order list cannot resolve these two timed-out intents.
    for cloid in data['transportTimeouts']:ledger.timeout(cloid)
    unresolved_before=sorted(k for k,v in ledger.intents.items() if v['state']=='unknown')
    assert unresolved_before==data['transportTimeouts']
    # Caller buffers the new WS connection while collecting REST views.
    buffered=data['bufferedAfterReconnect']
    rounds=[]
    for round_ in data['restRounds']:
        rounds.append(ledger.reconcile(round_,data['tracked']))
        for msg in buffered:ledger.message(msg)
    assert all(r['consistent'] for r in rounds)
    assert rounds[-1]['digest']==rounds[-2]['digest']
    assert rounds[-1]['unresolved']==[unresolved_before[1]]
    assert ledger.orders['101']['status']=='canceled'
    assert ledger.orders['102']['status']=='rejected'
    assert ledger.orders['103']['status']=='filled'
    assert ledger.orders['104']['status']=='open'
    assert len(ledger.fills)==3
    assert sum(D(f['sz']) for f in ledger.fills.values())==D('0.75')
    assert sum(D(f['fee']) for f in ledger.fills.values())==D('0.075')
    assert not ledger.needs_query
    assert ledger.intents[unresolved_before[0]]['state']=='filled'
    assert ledger.intents[unresolved_before[1]]['state']=='unknown'
    # Conflict cases remain dirty instead of guessing a tie-breaker.
    conflict=Ledger(data['user']);first=data['beforeDisconnect'][0]['data'][0]
    conflict.order(first);changed=copy.deepcopy(first);changed['status']='canceled';conflict.order(changed)
    conflict.fill(data['restRounds'][0]['userFillsByTime'][0]);changed_fill=copy.deepcopy(next(iter(conflict.fills.values())))
    changed_fill['sz']='0.9';conflict.fill(changed_fill)
    assert conflict.needs_query=={'101'}
    # Mixed HTTP 200: correlate per input index; outer status ok is insufficient.
    response=data['mixedHttpResponse'];items=response['response']['data']['statuses']
    outcomes=['resting' if 'resting' in x else 'filled' if 'filled' in x else 'error' for x in items]
    assert outcomes==['resting','filled','error']
    return dict(scope=data['scope'],transitions=transitions,unknownBefore=unresolved_before,
                restRounds=rounds,orders=ledger.orders,localIntents=ledger.intents,uniqueFills=list(ledger.fills.values()),
                totalSize='0.75',totalFee='0.075',positionSource='REST clearinghouseState',
                unresolved=rounds[-1]['unresolved'],audit=ledger.audit,conflictAudit=conflict.audit,
                httpOutcomes=outcomes,invariants='passed',
                limits=['No global sequence, atomic REST cut, exactly-once, nonce replay or live outage tested',
                        'unknownOid remains unresolved; stable repeated fixture is not a live finality guarantee'])


if __name__=='__main__':
    source=Path(sys.argv[1]) if len(sys.argv)>1 else HERE/'replay-input.json'
    target=Path(sys.argv[2]) if len(sys.argv)>2 else HERE/'replay-output.json'
    target.write_text(json.dumps(run(json.loads(source.read_text())),ensure_ascii=False,indent=2)+'\n')
    print('PASS: partial/cancel/reject/unknown, duplicates/out-of-order, gap recovery, conflicts and mixed HTTP statuses')
