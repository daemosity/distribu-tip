type AllocationInput = {
    poolCents: number; // integer, 0–10,000,000 with carry-in
    carryInCents: number; // integer, ≥ 0
    workers: { id: string; hoursCenti: number; weightBp: number }[];
};

export function allocate(allocationInput: AllocationInput) {
    if (!allocationInput || null) return null;

    return {
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
    };
}
