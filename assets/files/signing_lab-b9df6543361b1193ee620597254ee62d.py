#!/usr/bin/env python3
"""Offline official-SDK experiment. Public upstream test key; never fund it.
All socket connections are blocked before SDK construction. HTTP is an in-memory fixture.
"""
import copy
import importlib.metadata
import json
import socket
import sys
from decimal import Decimal
from pathlib import Path
from unittest.mock import patch

import msgpack
from eth_account import Account
from eth_account.messages import encode_typed_data
from eth_keys import keys
from eth_utils import keccak
from hyperliquid.exchange import Exchange
from hyperliquid.utils.constants import TESTNET_API_URL
from hyperliquid.utils import signing as s
from hyperliquid.utils.types import Cloid


def no_network(*args, **kwargs):
    raise AssertionError('Offline experiment forbids network connections')


def plain(value):
    if isinstance(value, bytes):
        return '0x'+value.hex()
    if isinstance(value, dict):
        return {k: plain(v) for k, v in value.items()}
    if isinstance(value, (list, tuple)):
        return [plain(v) for v in value]
    return value


def digest_and_recover(typed, signature):
    # Separate secp256k1 recovery path, without the SDK recovery helper.
    message = encode_typed_data(full_message=typed)
    digest = keccak(b'\x19'+message.version+message.header+message.body)
    sig = keys.Signature(vrs=(signature['v']-27, int(signature['r'],16), int(signature['s'],16)))
    recovered = sig.recover_public_key_from_msg_hash(digest).to_checksum_address()
    return dict(domainSeparator=message.header, structHash=message.body,
                eip712Digest=digest, recovered=recovered)


def rule_check(px, sz, sz_decimals, spot=False):
    # Decimal reference for the documented precision constraints, NOT full exchange validation.
    p, q = Decimal(px), Decimal(sz)
    assert p.is_finite() and q.is_finite() and p > 0 and q > 0
    decimals = lambda x: max(0, -x.normalize().as_tuple().exponent)
    significant = len(p.normalize().as_tuple().digits)
    return dict(price=(p == p.to_integral_value() or significant <= 5)
                      and decimals(p) <= (8 if spot else 6)-sz_decimals,
                size=decimals(q) <= sz_decimals)


def run():
    assert importlib.metadata.version('hyperliquid-python-sdk') == '0.24.0'
    wallet = Account.from_key('0x0123456789012345678901234567890123456789012345678901234567890123')
    # Deliberately synthetic metadata. ETH index=1 is not a current-market assertion.
    meta = {'universe':[{'name':'BTC','szDecimals':5},{'name':'ETH','szDecimals':3}]}
    spot_meta = {'universe':[], 'tokens':[]}
    nonce, expiry = 1700000000000, 1700000060000
    cloid = '0x00000000000000000000000000000001'
    request = dict(coin='ETH', is_buy=True, sz=0.125, limit_px=2000.5,
                   reduce_only=False, order_type={'limit':{'tif':'Gtc'}},cloid=Cloid.from_str(cloid))
    response = {'status':'ok','response':{'type':'order','data':{'statuses':[{'resting':{'oid':101}}]}}}
    captured = []
    class Response:
        status_code = 200
        text = json.dumps(response)
        def json(self):
            return copy.deepcopy(response)
    def http(url, **kwargs):
        captured.append(dict(url=url, **kwargs))
        return Response()
    with patch.object(socket.socket, 'connect', no_network), patch('socket.create_connection', no_network):
        ex = Exchange(wallet, TESTNET_API_URL, meta=meta,spot_meta=spot_meta,timeout=5)
        ex.set_expires_after(expiry)
        with patch.object(ex.session,'post',http), patch('hyperliquid.exchange.get_timestamp_ms',return_value=nonce):
            returned = ex.order(name=request['coin'], **{k:v for k,v in request.items() if k!='coin'})
    assert returned == response and len(captured) == 1
    envelope = captured[0]['json'];action = envelope['action'];sig = envelope['signature']
    # Independent reconstruction of the preimage, including optional vault/expiry tags.
    packed = msgpack.packb(action)
    preimage = packed+nonce.to_bytes(8,'big')+b'\x00'+b'\x00'+expiry.to_bytes(8,'big')
    action_hash = keccak(preimage)
    assert action_hash == s.action_hash(action,None,nonce,expiry)
    typed = s.l1_payload(s.construct_phantom_agent(action_hash,False))
    recovered = s.recover_agent_or_user_from_l1_action(action,sig,None,nonce,expiry,False)
    independent = digest_and_recover(typed,sig)
    assert recovered == independent['recovered'] == wallet.address
    mutations = []
    for label, change in [
        ('action',dict(action={**action,'grouping':'normalTpsl'})),
        ('nonce',dict(nonce=nonce+1)),('network',dict(is_mainnet=True)),
        ('expiry',dict(expires_after=expiry+1)),('omitExpiry',dict(expires_after=None)),
        ('vault',dict(active_pool='0x'+'11'*20)),
        ('fieldOrder',dict(action=dict(reversed(list(action.items())))))]:
        args=dict(action=action,signature=sig,active_pool=None,nonce=nonce,expires_after=expiry,is_mainnet=False)
        args.update(change)
        other=s.recover_agent_or_user_from_l1_action(**args)
        assert other != wallet.address
        mutations.append(dict(case=label,recovered=other,matches=False))
    # Vault variant: vault bytes enter the action hash; signing identity remains the wallet.
    vault='0x'+'11'*20
    vault_preimage=packed+nonce.to_bytes(8,'big')+b'\x01'+bytes.fromhex(vault[2:])+b'\x00'+expiry.to_bytes(8,'big')
    assert keccak(vault_preimage)==s.action_hash(action,vault,nonce,expiry)
    vault_sig=s.sign_l1_action(wallet,action,vault,nonce,expiry,False)
    assert s.recover_agent_or_user_from_l1_action(action,vault_sig,vault,nonce,expiry,False)==wallet.address
    # Pure user-signed hashing only; never invoke Exchange transfer or send any envelope.
    user_action={'type':'usdSend','destination':'0x'+'22'*20,'amount':'1','time':nonce}
    user_sig=s.sign_usd_transfer_action(wallet,user_action,False)
    user_typed=s.user_signed_payload('HyperliquidTransaction:UsdSend',s.USD_SEND_SIGN_TYPES,user_action)
    user_recovered=s.recover_user_from_user_signed_action(copy.deepcopy(user_action),user_sig,s.USD_SEND_SIGN_TYPES,'HyperliquidTransaction:UsdSend',False)
    assert user_recovered == digest_and_recover(user_typed,user_sig)['recovered'] == wallet.address
    user_other=s.recover_user_from_user_signed_action(copy.deepcopy(user_action),user_sig,s.USD_SEND_SIGN_TYPES,'HyperliquidTransaction:UsdSend',True)
    assert user_other != wallet.address
    precision=[]
    for label,px,sz in [('valid','2000.5','0.125'),('sixSignificant','2000.55','0.125'),
                         ('badLot','2000.5','0.1251'),('integerException','123456','0.125'),
                         ('tooManyDecimals','0.001234','0.125')]:
        wire=s.order_request_to_order_wire({**request,'limit_px':float(px),'sz':float(sz)},1)
        precision.append(dict(case=label,input=dict(px=px,sz=sz),wire=wire,
                              documentedPrecision=rule_check(px,sz,3),sdkAccepted=True))
    boundary=[]
    for x in [0.1+0.2,1.234567891,0.000000001,0.0000000000001,-0.0]:
        try:boundary.append(dict(input=repr(x),wire=s.float_to_wire(x)))
        except ValueError as err:boundary.append(dict(input=repr(x),error=str(err)))
    assert precision[1]['documentedPrecision']['price'] is False
    assert precision[2]['documentedPrecision']['size'] is False
    assert 'error' in boundary[1] and 'error' in boundary[2]
    assert boundary[3]['wire']=='0' # SDK tolerance is not a positive-size validator.
    # Replay an upstream known hash vector to catch construction drift.
    upstream_request=dict(coin='ETH',is_buy=True,sz=0.0147,limit_px=1670.1,
                          reduce_only=False,order_type={'limit':{'tif':'Ioc'}},cloid=None)
    upstream_action=s.order_wires_to_order_action([s.order_request_to_order_wire(upstream_request,4)])
    assert s.action_hash(upstream_action,None,1677777606040,None).hex() == '0fcbeda5ae3c4950a548021552a4fea2226858c4453571bf3f24ba017eac2908'
    result=dict(scope='Offline real SDK; synthetic metadata/HTTP; no server signature/order test',
                sdk=importlib.metadata.version('hyperliquid-python-sdk'),python=sys.version,signer=wallet.address,
                request={**request,'cloid':cloid},metadata=meta,spotMetadata=spot_meta,
                capturedHttp=captured,response=returned,msgpack=packed,hashPreimage=preimage,
                actionHash=action_hash,typedData=typed,signature=sig,recovered=recovered,independent=independent,
                mutations=mutations,vault=dict(address=vault,hashPreimage=vault_preimage,actionHash=keccak(vault_preimage),signature=vault_sig),
                userSigned=dict(action=user_action,typedData=user_typed,signature=user_sig,recovered=user_recovered,changedNetworkRecovered=user_other,
                                independent=digest_and_recover(user_typed,user_sig)),
                precision=precision,floatBoundary=boundary,upstreamVector='passed')
    return plain(result)


if __name__=='__main__':
    target=Path(sys.argv[1]) if len(sys.argv)>1 else Path(__file__).with_name('signing-output.json')
    target.write_text(json.dumps(run(),ensure_ascii=False,indent=2)+'\n')
    print('PASS: SDK HTTP capture, independent hash/recovery, 7 mutations, vault/user-signed and precision boundaries')
