import { INT_CAP } from "./constants";
import {
    CapExceededError,
    NegativeNumberError,
    NonIntegerInputError,
} from "./errors";

export type Cents = number & { __brand: "cents" };

export function validateCents(input: number): Cents {
    if (!Number.isInteger(input)) throw new NonIntegerInputError();
    if (input < 0 || Object.is(input, -0)) throw new NegativeNumberError();
    if (input > INT_CAP) throw new CapExceededError();
    return input as Cents;
}
