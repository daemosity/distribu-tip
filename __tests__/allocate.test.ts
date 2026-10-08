import { describe, test, expect } from "@jest/globals";

describe("allocate", () => {
    test.each([
        {
            allocationInput: {
                poolCents: 100_00,
                carryInCents: 0,
                workers: [
                    { id: "workOne", hoursCenti: 1_000, weightBp: 1 },
                    { id: "workTwo", hoursCenti: 1_000, weightBp: 1 },
                ],
            },
            allocationResult: {
                payouts: [
                    {
                        id: "workOne",
                        amountCents: 5_000,
                        bills: {
                            20: 2,
                            10: 1,
                            5: 0,
                            1: 0,
                        },
                    },
                    {
                        id: "workTwo",
                        amountCents: 5_000,
                        bills: {
                            20: 2,
                            10: 1,
                            5: 0,
                            1: 0,
                        },
                    },
                ],
                carryOutCents: 0,
            },
        },
    ])(
        "takes $allocationInput and returns #allocationResult",
        ({ allocationInput, allocationResult }) => {
            expect(allocate(allocationInput)).toStrictEqual(allocationResult);
        },
    );
});
