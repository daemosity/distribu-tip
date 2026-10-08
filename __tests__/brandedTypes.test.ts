import {
    Cents,
    HoursCenti,
    validateCents,
    validateHoursCenti,
    validateWeightBp,
    WeightBp,
} from "../src/core/types";
import { CoreError, CoreErrorType } from "../src/core/errors";
import {
    CENTS_INT_CAP,
    HOURS_CENTI_INT_CAP,
    WEIGHT_BP_BOTTOM_INT,
    WEIGHT_BP_TOP_INT,
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
        expect(() => validateCents(input)).toThrow(
            expect.objectContaining({ code: code }),
        );
        expect(() => validateCents(input)).toThrow(CoreError);
    });

    test("rejects non-number with NONINTEGER_INPUT", () => {
        // @ts-expect-error necessary to test invalid type input to prove it is handled correctly
        expect(() => validateCents("a")).toThrow(
            expect.objectContaining({ code: CoreErrorType.NONINTEGER_INPUT }),
        );
        // @ts-expect-error necessary to test invalid 'a'
        expect(() => validateCents("a")).toThrow(CoreError);
    });

    test.each([0, CENTS_INT_CAP])(
        "does not throw when provided valid input",
        (a) => {
            expect(() => validateCents(a)).not.toThrow();

            const cents = validateCents(a);
            expect(cents + cents).toEqual(a + a);
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
        { input: HOURS_CENTI_INT_CAP + 1, code: CoreErrorType.CAP_EXCEEDED },
        { input: Infinity, code: CoreErrorType.NONINTEGER_INPUT },
        { input: -Infinity, code: CoreErrorType.NONINTEGER_INPUT },
        { input: -0, code: CoreErrorType.NEGATIVE_NUMBER },
    ])("rejects $input with $code error", ({ input, code }) => {
        expect(() => validateHoursCenti(input)).toThrow(
            expect.objectContaining({ code: code }),
        );
        expect(() => validateHoursCenti(input)).toThrow(CoreError);
    });

    test.each([0, HOURS_CENTI_INT_CAP])(
        "does not throw when provided valid input",
        (a) => {
            expect(() => validateHoursCenti(a)).not.toThrow();

            const hoursCenti = validateHoursCenti(a);
            expect(hoursCenti + hoursCenti).toEqual(a + a);
        },
    );
});

describe("HoursCenti brand", () => {
    test("ensures raw number assignment fails typecheck", () => {
        // @ts-expect-error pins invariant that `HoursCenti` cannot be assigned raw numbers
        // If an accidental change occurs, this typecheck will fail
        const hoursCenti: HoursCenti = 145;
        expect(hoursCenti + hoursCenti).toEqual(290);
    });
});

describe("validateWeightBp", () => {
    test.each([
        { input: -1, code: CoreErrorType.NEGATIVE_NUMBER },
        { input: 0.45, code: CoreErrorType.NONINTEGER_INPUT },
        { input: Number.NaN, code: CoreErrorType.NONINTEGER_INPUT },
        { input: WEIGHT_BP_TOP_INT + 1, code: CoreErrorType.CAP_EXCEEDED },
        {
            input: WEIGHT_BP_BOTTOM_INT - 1,
            code: CoreErrorType.BELOW_WEIGHT_BP_RANGE,
        },
        { input: Infinity, code: CoreErrorType.NONINTEGER_INPUT },
        { input: -Infinity, code: CoreErrorType.NONINTEGER_INPUT },
        { input: -0, code: CoreErrorType.NEGATIVE_NUMBER },
    ])("rejects $input with $code error", ({ input, code }) => {
        expect(() => validateWeightBp(input)).toThrow(
            expect.objectContaining({ code: code }),
        );
        expect(() => validateWeightBp(input)).toThrow(CoreError);
    });

    test.each([WEIGHT_BP_BOTTOM_INT, WEIGHT_BP_TOP_INT])(
        "does not throw when provided valid input",
        (a) => {
            expect(() => validateWeightBp(a)).not.toThrow();

            const weightBp = validateWeightBp(a);
            expect(weightBp + weightBp).toEqual(a + a);
        },
    );
});

describe("WeightBp brand", () => {
    test("ensures raw number assignment fails typecheck", () => {
        // @ts-expect-error pins invariant that `WeightBp` cannot be assigned raw numbers
        // If an accidental change occurs, this typecheck will fail
        const weightBp: WeightBp = 100;
        expect(weightBp + weightBp).toEqual(200);
    });
});
