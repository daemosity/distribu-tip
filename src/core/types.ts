import { CENTS_INT_CAP, HOURS_INT_CAP } from "./constants";
import {
    CapExceededError,
    NegativeNumberError,
    NonIntegerInputError,
} from "./errors";

export type Cents = number & { __brand: "cents" };

export function validateCents(input: number): Cents {
    if (!Number.isInteger(input)) throw new NonIntegerInputError();
    if (input < 0 || Object.is(input, -0)) throw new NegativeNumberError();
    if (input > CENTS_INT_CAP) throw new CapExceededError();
    return input as Cents;
}

export type Hours = number & { __brand: "hours" };

export function validateHoursCenti(input: number): Hours {
    if (!Number.isInteger(input)) throw new NonIntegerInputError();
    if (input < 0 || Object.is(input, -0)) throw new NegativeNumberError();
    if (input > HOURS_INT_CAP) throw new CapExceededError();
    return input as Hours;
}
