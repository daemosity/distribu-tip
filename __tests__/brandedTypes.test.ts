import { parseToCents } from "../src/core/types";
import { NegativeNumberError } from "../src/core/errors";
import { describe, test, expect } from "@jest/globals";

describe("Cents", () => {
    test("Cents constructor rejects -1 with NEGATIVE_NUMBER error", () => {
        expect(() => parseToCents(-1)).toThrow(NegativeNumberError);
    });
});
