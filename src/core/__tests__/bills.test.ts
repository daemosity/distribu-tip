import { describe, test, expect } from "@jest/globals";
import { billsFor } from "../bills";
import { validateCents } from "../types";

describe("billsFor", () => {
    test.each([
        { input: validateCents(0), expectation: { 20: 0, 10: 0, 5: 0, 1: 0 } },
    ])(
        "when provided $input, outputs 20: $expectation.20, 10: $expectation.10, 5: $expectation.5, 1: $expectation.1",
        ({ input, expectation }) => {
            const result = billsFor(input);

            expect(result).toStrictEqual(expectation);
        },
    );
});
