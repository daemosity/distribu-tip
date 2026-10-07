import { parseToCents } from "../src/core/types";
import {
    CapExceededError,
    NegativeNumberError,
    NonIntegerInputError,
} from "../src/core/errors";
import { describe, test, expect } from "@jest/globals";

describe("parseToCents", () => {
    test.each([
        [-1, NegativeNumberError],
        ["a", NonIntegerInputError],
        [0.45, NonIntegerInputError],
        [Number.NaN, NonIntegerInputError],
        [10_000_001, CapExceededError],
        [Infinity, NonIntegerInputError],
    ])("rejects %s with %s", (a, expected) => {
        // @ts-expect-error necessary to test invalid input to prove it is handled correctly
        expect(() => parseToCents(a)).toThrow(expected);
    });

    test.each([0, 10_000_000])(
        "does not throw when provided valid input",
        (a) => {
            expect(() => parseToCents(a)).not.toThrow();
        },
    );
});
