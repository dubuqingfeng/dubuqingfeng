"""Independent integer/rational checks of recorded SwapMath outputs (no EVM)."""
import json
from pathlib import Path
from fractions import Fraction
from decimal import Decimal, getcontext

getcontext().prec = 65
p = Path(__file__).parent
r = json.loads((p / 'result.json').read_text())
Q = 1 << 96
ceil = lambda x: -(-x.numerator // x.denominator)
floor = lambda x: x.numerator // x.denominator
rows = []
for c in r['cases']:
    if 'steps' not in c:
        continue
    direction = c['input']['zeroForOne']
    for s in c['steps']:
        a,b,L = (int(s[k]) for k in ['startX96','nextX96','liquidity'])
        lo,hi = sorted([a,b])
        delta0 = Fraction(L*Q*(hi-lo),hi*lo)
        delta1 = Fraction(L*(hi-lo),Q)
        calculated_in = ceil(delta0 if direction else delta1)
        calculated_out = floor(delta1 if direction else delta0)
        if int(c['input']['amountSpecified']) < 0:
            calculated_out = min(calculated_out,-int(s['remaining']))
        assert calculated_in == int(s['amountIn'])
        assert calculated_out == int(s['amountOut'])
        if int(c['input']['amountSpecified']) > 0 and b != int(s['targetX96']):
            assert int(s['fee']) == int(s['remaining'])-calculated_in
        else:
            assert int(s['fee']) == ceil(Fraction(calculated_in*3000,997000))
    sqrt = int(c['after']['sqrtPriceX96'])
    price = (Decimal(sqrt)/Decimal(Q))**2
    tick_estimate = price.ln()/Decimal('1.0001').ln()
    # Cases end inside an interval, or at an uninitialized limit tick.
    assert int(tick_estimate // 1) - (1 if tick_estimate < 0 else 0) == int(c['after']['tick'])
    rows.append({'case':c['name'],'priceToken1PerToken0':str(price),'continuousTick':str(tick_estimate)})
print(json.dumps({'independentAmountAndFeeChecks':'passed','prices':rows},indent=2))
