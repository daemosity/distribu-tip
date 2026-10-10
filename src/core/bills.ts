import { Cents } from "./types";

const BILL_COUNT_DENOMINATIONS = [20, 10, 5, 1] as const;

export type BillCounts = Record<
    (typeof BILL_COUNT_DENOMINATIONS)[number],
    number
>;

function createBillCountObject(): BillCounts {
    return Object.fromEntries(
        BILL_COUNT_DENOMINATIONS.map((denom) => [denom, 0]),
    ) as BillCounts;
}

export function billsFor(centAmount: Cents): BillCounts {
    const billCount: BillCounts = createBillCountObject();

    let amountDollars = Math.round(centAmount / 100);
    for (const d of BILL_COUNT_DENOMINATIONS) {
        billCount[d] = Math.floor(amountDollars / d);
        amountDollars = amountDollars % d;
    }

    return billCount;
}
