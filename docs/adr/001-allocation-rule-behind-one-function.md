# ADR-001: The allocation rule sits behind one function

## Status

Accepted, 2026-10-06 (on merge). Originally decided 2026-09-26 in design doc rev 0.5.

## Context

The decision was first made on 2026-09-26 in the design doc (not public), rev 0.5 (Business rules review → "Decision (rev 0.5)", the paragraph "Keep the compliant path one module away"). This ADR records it in the repository, where code reviewers will see it.

Distribu-tip splits a weekly cash tip pool across employees by weighted hours and pays everyone in whole dollars. The rule that turns a pool into whole-dollar payouts is the riskiest logic in the app: it decides who gets every dollar, and a mistake there is a mistake in someone's pay.

The current rule rounds each share half up, subtracts dollars on overshoot, and carries sub-dollar cents and any unallocated dollars forward to the next week. Both carryover rules appear to conflict with Illinois law: under [820 ILCS 115/4.1](https://www.ilga.gov/documents/legislation/ilcs/documents/082001150K4.1.htm) tips belong to the employees who earned them, and carrying them forward moves one week's money to the next week's crew and can hold it past the 13-day payment deadline.

As this is a portfolio project that will not be released or used to pay real employees, I chose to keep the current rule. However, to ensure this repo doesn't accidentally get used for a real product, the README must disclose that the app is not legally viable as specified. To ease any decisions regarding moving this project towards a release, the architecture of the app should ensure a transition to a compliant version of the rule can be a contained change.

This is only possible if the rule lives in one place. Rounding is easy to scatter: a form rounds a preview, a repository adjusts carry-in before saving, a screen sums bills for the bank order. While each copy may seem small and reasonable on its own, it makes changing the rule hit every logical layer. The rejected alternative - letting each layer handle the part of the arithmetic it touches - is the default outcome if nothing is decided.

## Decision

I have decided to keep the allocation rule behind one function, `allocate(input): AllocationResult`, exported from `src/core/index.ts`, to be built within a future PR - this ADR just outlines its shape.

- **Only `src/core` computes money.** Splitting the pool, rounding, choosing who gets a leftover dollar, computing carry, and breaking amounts into bills all happen inside `src/core`. No screen, hook, repository or SQL query rounds, splits, adjusts or recomputes an amount. They pass plain input in, then store or display the result exactly as returned
- **Callers depend on `src/core`, not the other way around.** Code outside may import from `src/core`. `src/core` itself stays pure, with no React, React Native, database or environment access
- **The result is the contract.** `AllocationInput` and `AllocationResult` are changed additively wherever possible. An alternative distribution rule, for example, would add `houseTopupCents` and report a zero carry, rather than reshape existing fields

The test of this decision follows: replacing the rule with a compliant version should change the algorithm only inside `src/core`. Outside it, changes should be limited to storing and displaying new result fields (one migration and the pool screen), with no arithmetic added anywhere else.

## Consequences

### Easier

- Swapping this rule for another is one module plus additive changes, so the README's "contained change" claim is checkable
- All money logic is tested in milliseconds with plain objects and no device, database or UI, in the place the design doc's test table and fuzz tests target
- A reviewer has one rule to apply: any arithmetic on money outside `src/core` is a defect

### Harder

- **The interface must stay stable.** Once the screens and the database depend on `AllocationResult`, it is a published interface. Renaming or removing a field means changing every caller, so it has to be designed carefully now and evolved additively
- **An extra hop for simple things.** A screen that wants a total, or a preview that wants to show a rounded figure, must ask `src/core` for it instead of doing the sum inline. That means more functions and types in `src/core` than the UI strictly needs
- **Callers must gather all state first.** Because `allocate` is pure, the caller has to read the pending carry from the database and pass it in, then persist the carry-out in the same transaction. The carry chain therefore spans two layers even though only one computes it
- **Lint can only enforce part of this.** Import rules keep `src/core` pure, but nothing automatic stops someone writing `Math.round(cents / 100)` in a screen. That part depends on code review and on this ADR being read
- **The claim is unproven until we try replacing the rule** If replacing the rule touches more than this ADR predicts, write a new ADR that records why, and supersede or amend this one
