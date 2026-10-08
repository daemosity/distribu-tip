import { Cents, validateCents, validateHoursCenti } from "../src/core/types";
import { CoreErrorType } from "../src/core/errors";
import {
    CENTS_INT_CAP,
    HOURS_INT_CAP,
    WEIGHT_BOTTOM_INT,
    WEIGHT_TOP_INT,
} from "../src/core/constants";
import { describe, test, expect } from "@jest/globals";

describe("validateCents", () => {
    test.each([
        { input: -1, code: CoreErrorType.NEGATIVE_NUMBER },
        { input: 0.45, code: CoreErrorType.NONINTEGER_INPUT },
        { input: Number.NaN, code: CoreErrorType.NONINTEGER_INPUT },
        { input: CENTS_INT_CAP + 1, code: CoreErrorType.CAP_EXCEEDED },
        { input: Infinity, code: CoreErrorType.NONINTEGER_INPUT },
        { input: -Infinity, code: CoreErrorType.NONINTEGER_INPUT },
        { input: -0, code: CoreErrorType.NEGATIVE_NUMBER },
    ])("rejects $input with $code error", ({ input, code }) => {
        try {
            validateCents(input);
        } catch (error) {
            expect(error).toMatchObject({ code: code });
        }

        expect.assertions(1);
    });

    test("rejects non-number with NONINTEGER_INPUT", () => {
        try {
            // @ts-expect-error necessary to test invalid type input to prove it is handled correctly
            validateCents("a");
        } catch (error) {
            expect(error).toMatchObject({
                code: CoreErrorType.NONINTEGER_INPUT,
            });
        }

        expect.assertions(1);
    });

    test.each([0, CENTS_INT_CAP])(
        "does not throw when provided valid input",
        (a) => {
            expect(() => validateCents(a)).not.toThrow();
        },
    );
});

describe("Cents brand", () => {
    test("ensures raw number assignment fails typecheck", () => {
        // @ts-expect-error pins invariant that `Cents` cannot be assigned raw numbers
        // If an accidental change occurs, this typecheck will fail
        const cents: Cents = 145;
        expect(cents + cents).toEqual(290);
    });
});

describe("validateHoursCenti", () => {
    test.each([
        { input: -1, code: CoreErrorType.NEGATIVE_NUMBER },
        { input: 0.45, code: CoreErrorType.NONINTEGER_INPUT },
        { input: Number.NaN, code: CoreErrorType.NONINTEGER_INPUT },
        { input: HOURS_INT_CAP + 1, code: CoreErrorType.CAP_EXCEEDED },
        { input: Infinity, code: CoreErrorType.NONINTEGER_INPUT },
        { input: -Infinity, code: CoreErrorType.NONINTEGER_INPUT },
        { input: -0, code: CoreErrorType.NEGATIVE_NUMBER },
    ])("rejects $input with $code error", ({ input, code }) => {
        try {
            validateHoursCenti(input);
        } catch (error) {
            expect(error).toMatchObject({ code: code });
        }

        expect.assertions(1);
    });

    test.each([0, HOURS_INT_CAP])(
        "does not throw when provided valid input",
        (a) => {
            expect(() => validateHoursCenti(a)).not.toThrow();
        },
    );
});

describe("validateWeight", () => {
    test.each([
        { input: -1, code: CoreErrorType.NEGATIVE_NUMBER },
        { input: 0.45, code: CoreErrorType.NONINTEGER_INPUT },
        { input: Number.NaN, code: CoreErrorType.NONINTEGER_INPUT },
        { input: WEIGHT_TOP_INT + 1, code: CoreErrorType.CAP_EXCEEDED },
        {
            input: WEIGHT_BOTTOM_INT - 1,
            code: CoreErrorType.BELOW_WEIGHT_RANGE,
        },
        { input: Infinity, code: CoreErrorType.NONINTEGER_INPUT },
        { input: -Infinity, code: CoreErrorType.NONINTEGER_INPUT },
        { input: -0, code: CoreErrorType.NEGATIVE_NUMBER },
    ])("rejects $input with $code error", ({ input, code }) => {
        try {
            validateWeight(input);
        } catch (error) {
            expect(error).toMatchObject({ code: code });
        }

        expect.assertions(1);
    });

    test.each([WEIGHT_BOTTOM_INT, WEIGHT_TOP_INT])(
        "does not throw when provided valid input",
        (a) => {
            expect(() => validateHoursCenti(a)).not.toThrow();
        },
    );
});
