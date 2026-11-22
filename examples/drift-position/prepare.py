#!/usr/bin/env python3
"""Add observations to upstream tests; never change production Rust code."""
import argparse
import hashlib
import json
import subprocess
from pathlib import Path

COMMIT = 'd686955cdc0d02ca4647c8fc71dac1dc4ed9c269'
p = argparse.ArgumentParser()
p.add_argument('source', type=Path)
args = p.parse_args()
root = args.source.resolve()
assert subprocess.check_output(['git', '-C', str(root), 'rev-parse', 'HEAD']).decode().strip() == COMMIT


def instrument(file, name, before='', after='', call=''):
    path = root/file
    text = path.read_text()
    start = text.index('fn '+name+'(')
    start = text.index('{', start)+1
    depth, end = 1, start
    while depth:
        if text[end] == '{': depth += 1
        if text[end] == '}': depth -= 1
        end += 1
    body = text[start:end-1]
    if call:
        at = body.index(call)
        body = body[:at]+before+body[at:]
    else:
        body = before+body
    path.write_text(text[:start]+body+after+text[end-1:])


orders = 'programs/drift/src/controller/orders/tests.rs'
liq = 'programs/drift/src/controller/liquidation/tests.rs'
fixture = 'programs/drift/src/test_utils.rs'
for f in [orders, liq, fixture]:
    # Idempotent regeneration from the fixed object, in the isolated laboratory only.
    (root/f).write_bytes(subprocess.check_output(['git', '-C', str(root), 'show', COMMIT+':'+f]))

# Anchor account data has an 8-byte discriminator. Newer native u128 alignment
# may be 16, so align the payload without changing bytes, layout or production code.
fixture_path = root/fixture
fixture_text = fixture_path.read_text()
old = "pub fn get_anchor_account_bytes<T: ZeroCopy + Owner>(account: &mut T) -> BytesMut {\n    let mut bytes = BytesMut::new();"
new = """pub fn get_anchor_account_bytes<T: ZeroCopy + Owner>(account: &mut T) -> BytesMut {
    let alignment = std::mem::align_of::<T>();
    let mut bytes = BytesMut::with_capacity(8 + std::mem::size_of::<T>() + alignment);
    let offset = (alignment - (bytes.as_ptr() as usize + 8) % alignment) % alignment;
    bytes.resize(offset, 0);
    let _prefix = bytes.split_to(offset);
    assert_eq!((bytes.as_ptr() as usize + 8) % alignment, 0);"""
assert old in fixture_text
fixture_path.write_text(fixture_text.replace(old, new))

snapshot = r'''
        println!("WIKI {{\"stage\":\"match\",\"base\":{},\"quote\":{},\"entry\":{},\"breakEven\":{},\"fee\":{},\"makerBase\":{},\"makerQuote\":{},\"rebate\":{},\"marketFee\":{}}}",
            taker.perp_positions[0].base_asset_amount, taker.perp_positions[0].quote_asset_amount,
            taker.perp_positions[0].quote_entry_amount, taker.perp_positions[0].quote_break_even_amount,
            taker_stats.fees.total_fee_paid, maker.perp_positions[0].base_asset_amount,
            maker.perp_positions[0].quote_asset_amount, maker_stats.fees.total_fee_rebate, market.amm.total_fee);
        market.amm.cumulative_funding_rate_long = 10_000_000;
        crate::controller::funding::settle_funding_payment(&mut taker, &taker_key, &mut market, 3600).unwrap();
        assert_eq!(taker.perp_positions[0].quote_asset_amount, -100_060_000);
        assert_eq!(taker.perp_positions[0].quote_entry_amount, -100_000_000);
        assert_eq!(taker.perp_positions[0].last_cumulative_funding_rate, 10_000_000);
        println!("WIKI {{\"stage\":\"funding\",\"quote\":{},\"entry\":{},\"breakEven\":{},\"lastFunding\":{},\"cumulativePayment\":{},\"netUnsettledFundingPnl\":{}}}",
            taker.perp_positions[0].quote_asset_amount, taker.perp_positions[0].quote_entry_amount,
            taker.perp_positions[0].quote_break_even_amount, taker.perp_positions[0].last_cumulative_funding_rate,
            taker.cumulative_perp_funding, market.amm.net_unsettled_funding_pnl);
        // Same cumulative value must not charge twice.
        crate::controller::funding::settle_funding_payment(&mut taker, &taker_key, &mut market, 3601).unwrap();
        assert_eq!(taker.perp_positions[0].quote_asset_amount, -100_060_000);
        println!("WIKI {{\"stage\":\"funding-repeat\",\"quote\":{}}}", taker.perp_positions[0].quote_asset_amount);
        // Per-position risk calculation: quote collateral 20 is added independently in Python.
        for price in [100_000_000_i64, 90_000_000, 84_000_000] {
            for kind in [crate::math::margin::MarginRequirementType::Initial,
                         crate::math::margin::MarginRequirementType::Fill,
                         crate::math::margin::MarginRequirementType::Maintenance] {
                let oracle = crate::state::oracle::OraclePriceData { price, ..Default::default() };
                let (requirement, pnl, liability, value) = crate::math::margin::calculate_perp_position_value_and_pnl(
                    &taker.perp_positions[0], &market, &oracle,
                    &crate::state::oracle::StrictOraclePrice::test(1_000_000), kind, 0, false).unwrap();
                println!("WIKI {{\"stage\":\"risk\",\"price\":{},\"kind\":\"{:?}\",\"requirement\":{},\"pnl\":{},\"liability\":{},\"value\":{}}}", price, kind, requirement, pnl, liability, value);
            }
        }
'''
instrument(orders, 'long_taker_order_fulfilled_start_of_auction', after=snapshot)

before = r'''
        let wiki_before_taker = taker;
        let wiki_before_maker = *makers_and_referrers.get_ref_mut(&maker_key).unwrap();
        println!("WIKI {{\"stage\":\"failure-before\",\"takerBase\":{},\"takerQuote\":{},\"makerBase\":{},\"makerQuote\":{}}}",
            taker.perp_positions[0].base_asset_amount, taker.perp_positions[0].quote_asset_amount,
            wiki_before_maker.perp_positions[0].base_asset_amount, wiki_before_maker.perp_positions[0].quote_asset_amount);
'''
after = r'''
        let wiki_after_maker = makers_and_referrers.get_ref_mut(&maker_key).unwrap();
        println!("WIKI {{\"stage\":\"failure-after\",\"error\":\"{:?}\",\"takerBase\":{},\"takerQuote\":{},\"makerBase\":{},\"makerQuote\":{},\"takerUnchanged\":{},\"makerUnchanged\":{}}}",
            result.unwrap_err(), taker.perp_positions[0].base_asset_amount, taker.perp_positions[0].quote_asset_amount,
            wiki_after_maker.perp_positions[0].base_asset_amount, wiki_after_maker.perp_positions[0].quote_asset_amount,
            taker == wiki_before_taker, *wiki_after_maker == wiki_before_maker);
'''
instrument(orders, 'maker_insufficient_collateral', before=before, after=after, call='let result = fulfill_perp_order(')
instrument(orders, 'fulfill_with_amm_and_maker', after=r'''
        println!("WIKI {{\"stage\":\"hybrid\",\"base\":{},\"quote\":{},\"entry\":{},\"fee\":{},\"makerBase\":{},\"ammBase\":{},\"rebate\":{},\"fillerReward\":{}}}",
            taker_position.base_asset_amount, taker_position.quote_asset_amount, taker_position.quote_entry_amount,
            taker_stats.fees.total_fee_paid, maker_position.base_asset_amount, market_after.amm.base_asset_amount_with_amm,
            maker_stats.fees.total_fee_rebate, filler.perp_positions[0].quote_asset_amount);
''')
instrument(orders, 'maker_order_canceled_for_breaching_oracle_price_band', after=r'''
        println!("WIKI {{\"stage\":\"oracle-band\",\"fillBase\":{},\"makerOrderAvailable\":{},\"makerBase\":{}}}",
            base_asset_amount, maker.orders[0].is_available(), maker.perp_positions[0].base_asset_amount);
''')
instrument(liq, 'successful_liquidation_long_perp', after=r'''
        println!("WIKI {{\"stage\":\"liquidation\",\"userBase\":{},\"userQuote\":{},\"openOrders\":{},\"liquidatorBase\":{},\"liquidatorQuote\":{},\"insuranceFee\":{}}}",
            user.perp_positions[0].base_asset_amount, user.perp_positions[0].quote_asset_amount, user.perp_positions[0].open_orders,
            liquidator.perp_positions[0].base_asset_amount, liquidator.perp_positions[0].quote_asset_amount,
            market_after.amm.total_liquidation_fee);
''')
patch = subprocess.check_output(['git', '-C', str(root), 'diff', '--', orders, liq, fixture])
(Path(__file__).parent/'observations.patch').write_bytes(patch)
files = sorted((root/'programs').rglob('*.rs')) + sorted(root.glob('**/Cargo.toml')) + [root/'Cargo.lock']
hashes = {str(f.relative_to(root)): hashlib.sha256(f.read_bytes()).hexdigest() for f in files if '.git' not in f.parts and 'target' not in f.parts}
(Path(__file__).parent/'source-hashes.json').write_text(json.dumps(hashes, indent=2)+'\n')
print('Prepared observation-only test patch; production Rust is unchanged.')
