#!/usr/bin/env python3
"""Independent Python integer reproduction; does not import EVM/math-library outputs."""
import json
from pathlib import Path
from fractions import Fraction

ROOT = Path(__file__).resolve().parent
RAY, WAD, BPS, YEAR = 10**27, 10**18, 10000, 365*86400

def ceildiv(a, b): return (a+b-1)//b

def half(a, b): return (a+b//2)//b

def raymul(a, b): return half(a*b, RAY)

def raydiv(a, b): return half(a*RAY, b)


def main():
    data = json.loads((ROOT/'result.json').read_text())
    stages = data['stages']
    checks = []
    types = data['storageLayout']['types']
    reserve_type = next(v['value'] for v in types.values() if v.get('label') == 'mapping(address => struct DataTypes.ReserveData)')
    members = types[reserve_type]['members']
    for name, stage in stages.items():
        collateral, debt, weighted_ltv, weighted_lt = 0, 0, 0, 0
        details = []
        for row in stage['reserves']:
            unit, price = 10**row['decimals'], int(row['price'])
            a = int(row['aTokenUserScaled'])*int(row['normalizedIncome'])//RAY
            v = ceildiv(int(row['vTokenUserScaled'])*int(row['normalizedDebt']), RAY)
            assert a == int(row['aTokenUser'])
            assert v == int(row['vTokenUser'])
            c = a*price//unit
            d = ceildiv(v*price, unit)
            collateral += c
            debt += d
            weighted_ltv += c*row['ltv']
            weighted_lt += c*row['liquidationThreshold']
            details.append({'asset':row['symbol'],'aBalance':a,'debtBalance':v,'collateralBaseFloor':c,'debtBaseCeil':d})
            # Independently decode actual compiler storage layout and raw EVM words.
            words = [int(v, 16) if v != '0x' else 0 for v in row['rawStorage'].values()]
            for member in members:
                field = member['label']
                if field in ['liquidityIndex','variableBorrowIndex','currentLiquidityRate','currentVariableBorrowRate','lastUpdateTimestamp','accruedToTreasury']:
                    width = int(types[member['type']]['numberOfBytes'])*8
                    actual = (words[int(member['slot'])] >> (int(member['offset'])*8)) & ((1<<width)-1)
                    assert actual == int(row['reserveData'][field]), (name, field)
        ltv = weighted_ltv//collateral
        lt = weighted_lt//collateral
        hf = half(weighted_lt*WAD, debt)//BPS if debt else 2**256-1
        available = max(collateral*ltv//BPS-debt, 0)
        expected = dict(totalCollateralBase=collateral,totalDebtBase=debt,ltv=ltv,currentLiquidationThreshold=lt,healthFactor=hf,availableBorrowsBase=available)
        assert expected == {k:int(v) for k,v in stage['account'].items()}, name
        checks.append({'stage':name,'weightedLtvSum':weighted_ltv,'weightedThresholdSum':weighted_lt,'details':details,**expected})
    start = stages['borrowed']['reserves'][2]
    end = stages['accruedView']['reserves'][2]
    dt = int(stages['accruedView']['timestamp'])-int(stages['borrowed']['timestamp'])
    # Exact curve, using arbitrary-precision integer half-up for ray operations.
    utilization = raydiv(15000*10**6, 100000*10**6)
    variable = 2*RAY//100 + raydiv(raymul(4*RAY//100, utilization), 80*RAY//100)
    liquidity = half(raymul(variable,utilization)*9000,BPS)
    assert variable == int(start['reserveData']['currentVariableBorrowRate'])
    assert liquidity == int(start['reserveData']['currentLiquidityRate'])
    x = variable*dt//YEAR
    compound = RAY+x+raymul(x, x//2+raymul(x,x//6))
    debt_index = raymul(int(start['reserveData']['variableBorrowIndex']),compound)
    supply_index = raymul(int(start['reserveData']['liquidityIndex']),RAY+liquidity*dt//YEAR)
    assert debt_index == int(end['normalizedDebt'])
    assert supply_index == int(end['normalizedIncome'])
    assert int(start['vTokenUserScaled']) == int(end['vTokenUserScaled'])
    assert start['reserveData']['variableBorrowIndex'] == end['reserveData']['variableBorrowIndex']
    stored = stages['accruedStored']['reserves'][2]
    assert int(stored['reserveData']['variableBorrowIndex']) == debt_index
    accrued_floor = int(start['vTokenTotalScaled'])*(debt_index-int(start['reserveData']['variableBorrowIndex']))//RAY
    treasury_amount = half(accrued_floor*1000,BPS)
    treasury_scaled = treasury_amount*RAY//supply_index
    assert treasury_scaled == int(stored['reserveData']['accruedToTreasury'])
    interest = {'seconds':dt,'utilizationRay':utilization,'variableRateRay':variable,'liquidityRateRay':liquidity,'xRay':x,'compoundRay':compound,'debtIndex':debt_index,'liquidityIndex':supply_index,'debtBalanceCeil':int(end['vTokenUser']),'lenderBalanceFloor':int(end['aTokenLender']),'treasuryAmount':treasury_amount,'treasuryScaled':treasury_scaled}
    # One-reserve debt, HF in (0.95,1), both selected collateral/debt exceed $2000.
    before = stages['price900']; u = before['reserves'][2]; a = before['reserves'][0]
    max_base = half(int(before['account']['totalDebtBase'])*5000,BPS)
    repaid = max_base*10**6//int(u['price'])
    base_collateral = int(u['price'])*repaid*10**18//(int(a['price'])*10**6)
    gross = base_collateral*10500//BPS
    bonus = gross-gross*BPS//10500
    fee = ceildiv(bonus*1000,BPS)
    liquidator_collateral = gross-fee
    debt_burn_scaled = repaid*RAY//debt_index
    after = stages['liquidated']
    assert int(after['reserves'][0]['aTokenUser']) == int(a['aTokenUser'])-gross
    assert int(after['reserves'][2]['vTokenUserScaled']) == int(u['vTokenUserScaled'])-debt_burn_scaled
    event = next(e for t in data['transactions'] if t['label'].startswith('liquidate') for e in t['events'] if e.get('name')=='LiquidationCall')
    assert int(event['args'][3]) == repaid
    assert int(event['args'][4]) == liquidator_collateral
    # The debt-token Burn event is net of interest since the user's previous index.
    burn = next(e for t in data['transactions'] if t['label'].startswith('liquidate') for e in t['events'] if e.get('name')=='Burn')
    balance_increase = int(u['vTokenUser'])-int(start['vTokenUser'])
    assert int(burn['args'][2]) == repaid-balance_increase
    available_after = int(after['reserves'][2]['virtualBalance'])
    debt_after = int(after['reserves'][2]['vTokenUser'])
    usage_after = raydiv(debt_after, available_after+debt_after)
    rate_after = 2*RAY//100+raydiv(raymul(4*RAY//100,usage_after),80*RAY//100)
    assert rate_after == int(after['reserves'][2]['reserveData']['currentVariableBorrowRate'])
    liquidation = {'maxDebtBaseHalfUp':max_base,'repaidRaw':repaid,'baseCollateralFloor':base_collateral,'grossCollateralFloor':gross,'bonusRaw':bonus,'protocolFeeCeil':fee,'liquidatorCollateralRaw':liquidator_collateral,'debtBurnScaledFloor':debt_burn_scaled,'netDebtBurnEvent':repaid-balance_increase,'postLiquidationRateRay':rate_after}
    for failure in data['failures']:
        assert failure['status']==0 and failure['logs']==[] and failure['before']==failure['after'] and failure['rollbackExact']
    result = {'status':'passed','accountChecks':checks,'interest':interest,'liquidation':liquidation,'rollbackTransactions':len(data['failures']),'roundingNote':'Python integer arithmetic; rational economic capacity before bps truncation is '+str(Fraction(20000*7500+10000*6500,10000))}
    (ROOT/'calculation.json').write_text(json.dumps(result,ensure_ascii=False,indent=2)+'\n')
    print('PASS: seven account stages, raw storage, curve, indexes, shares, treasury, liquidation and risk rollbacks')

if __name__ == '__main__': main()
