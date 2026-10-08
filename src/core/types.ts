import {
    CENTS_INT_CAP,
    HOURS_CENTI_INT_CAP,
    WEIGHT_BP_BOTTOM_INT,
    WEIGHT_BP_TOP_INT,
} from "./constants";
import {
    BelowWeightRangeError,
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

export type HoursCenti = number & { __brand: "hoursCenti" };

export function validateHoursCenti(input: number): HoursCenti {
    if (!Number.isInteger(input)) throw new NonIntegerInputError();
    if (input < 0 || Object.is(input, -0)) throw new NegativeNumberError();
    if (input > HOURS_CENTI_INT_CAP) throw new CapExceededError();
    return input as HoursCenti;
}

export type WeightBp = number & { __brand: "weightBp" };

export function validateWeightBp(input: number): WeightBp {
    if (!Number.isInteger(input)) throw new NonIntegerInputError();
    if (input < 0 || Object.is(input, -0)) throw new NegativeNumberError();
    if (input > WEIGHT_BP_TOP_INT) throw new CapExceededError();
    if (input < WEIGHT_BP_BOTTOM_INT) throw new BelowWeightRangeError();
    return input as WeightBp;
}
