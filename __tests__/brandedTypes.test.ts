import { validateCents } from "../src/core/types";
import { CoreErrorType } from "../src/core/errors";
import { INT_CAP } from "../src/core/constants";
import { describe, test, expect } from "@jest/globals";

describe("validateCents", () => {
    test.each([
        { input: -1, code: CoreErrorType.NEGATIVE_NUMBER },
        { input: 0.45, code: CoreErrorType.NONINTEGER_INPUT },
        { input: Number.NaN, code: CoreErrorType.NONINTEGER_INPUT },
        { input: INT_CAP + 1, code: CoreErrorType.CAP_EXCEEDED },
        { input: Infinity, code: CoreErrorType.NONINTEGER_INPUT },
        { input: -0, code: CoreErrorType.NEGATIVE_NUMBER },
    ])("rejects $input with $code error", ({ input, code }) => {
        try {
            validateCents(input);
        } catch (error) {
            expect(error).toMatchObject({ code: code });
        }
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
    });

    test.each([0, INT_CAP])("does not throw when provided valid input", (a) => {
        expect(() => validateCents(a)).not.toThrow();
    });
});
