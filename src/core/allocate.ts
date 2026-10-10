import { BillCounts } from "./bills";
import { Cents, HoursCenti, validateCents, WeightBp } from "./types";

export type Worker = {
    id: string;
    hoursCenti: HoursCenti;
    weightBp: WeightBp;
};

export type WorkerPayout = {
    id: string;
    amountCents: Cents;
    bills: BillCounts;
};

export type AllocationInput = {
    poolCents: Cents; // integer, 0–10,000,000 with carry-in
    carryInCents: Cents; // integer, ≥ 0
    workers: Worker[];
};

export type AllocationResult = {
    payouts: WorkerPayout[];
    bankOrder: BillCounts;
    carryOutCents: Cents;
};

export function allocate(_allocationInput: AllocationInput): AllocationResult {
    // This function currently outputs a constant for the walking skeleton,
    // and will be fleshed out by tests in a future milestone (M6)

    return {
        payouts: [
            {
                id: "workOne",
                amountCents: validateCents(5_000),
                bills: {
                    20: 2,
                    10: 1,
                    5: 0,
                    1: 0,
                },
            },
            {
                id: "workTwo",
                amountCents: validateCents(5_000),
                bills: {
                    20: 2,
                    10: 1,
                    5: 0,
                    1: 0,
                },
            },
        ],
        carryOutCents: validateCents(0),
        bankOrder: {
            20: 4,
            10: 2,
            5: 0,
            1: 0,
        },
    };
}
