import { describe, test, expect } from "@jest/globals";
import { validateCents, validateHoursCenti, validateWeightBp } from "../types";
import { allocate } from "../allocate";
import type {
    AllocationInput,
    AllocationResult,
    Worker,
    WorkerPayout,
} from "../allocate";
import type { BillCounts } from "../bills";

function createWorkerInputFixture(
    id: string,
    hours: number,
    weight: number,
): Worker {
    return {
        id,
        hoursCenti: validateHoursCenti(Math.round(hours * 100)),
        weightBp: validateWeightBp(Math.round(weight * 10_000)),
    };
}

function createWorkerResultFixture(
    id: string,
    totalResultDollars: number,
    billAllocation: BillCounts,
): WorkerPayout {
    const amountCents = validateCents(Math.round(totalResultDollars * 100));
    return {
        id,
        amountCents,
        bills: billAllocation,
    };
}

function createAllocationInputFixture(
    tipPoolDollars: number,
    carryInDollars: number,
    workers: Worker[],
): AllocationInput {
    return {
        poolCents: validateCents(Math.round(tipPoolDollars * 100)),
        carryInCents: validateCents(Math.round(carryInDollars * 100)),
        workers,
    };
}

function createAllocationResultFixture(
    carryOutDollars: number,
    workerPayouts: WorkerPayout[],
): AllocationResult {
    const bankOrder = {
        20: 0,
        10: 0,
        5: 0,
        1: 0,
    };

    for (const { bills } of workerPayouts) {
        bankOrder[20] += bills[20];
        bankOrder[10] += bills[10];
        bankOrder[5] += bills[5];
        bankOrder[1] += bills[1];
    }

    return {
        payouts: workerPayouts,
        bankOrder: bankOrder,
        carryOutCents: validateCents(Math.round(carryOutDollars * 100)),
    };
}

describe("allocate", () => {
    test.each([
        {
            allocationInput: createAllocationInputFixture(100, 0, [
                createWorkerInputFixture("workOne", 10, 1),
                createWorkerInputFixture("workTwo", 10, 1),
            ]),
            allocationResult: createAllocationResultFixture(0, [
                createWorkerResultFixture("workOne", 50, {
                    20: 2,
                    10: 1,
                    5: 0,
                    1: 0,
                }),
                createWorkerResultFixture("workTwo", 50, {
                    20: 2,
                    10: 1,
                    5: 0,
                    1: 0,
                }),
            ]),
        },
    ])(
        "takes $allocationInput and returns $allocationResult",
        ({ allocationInput, allocationResult }) => {
            expect(allocate(allocationInput)).toStrictEqual(allocationResult);
        },
    );
});
