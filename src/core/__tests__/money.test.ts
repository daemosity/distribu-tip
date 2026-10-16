import { describe, expect, it } from "@jest/globals";
import { formatCents } from "../money";
import { validateCents } from "../types";

describe("formatCents", () => {
    it.each([
        [0, "$0.00"],
        [5, "$0.05"],
        [100, "$1.00"],
        [12_345, "$123.45"],
    ])("transforms %d --> %s", (centNum, dollarString) => {
        expect(formatCents(validateCents(centNum))).toEqual(dollarString);
    });
});
