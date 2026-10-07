import {
    CapExceededError,
    NegativeNumberError,
    NonIntegerInputError,
} from "./errors";

export type Cents = number & { __brand: "cents" };

export function parseToCents(input: number): Cents {
    if (!Number.isInteger(input)) throw new NonIntegerInputError();
    if (input < 0) throw new NegativeNumberError();
    if (input > 10_000_000) throw new CapExceededError();
    return Math.trunc(input) as Cents;
}
