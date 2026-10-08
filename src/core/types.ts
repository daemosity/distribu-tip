import {
    CENTS_INT_CAP,
    HOURS_CENTI_INT_CAP,
    WEIGHT_BP_BOTTOM_INT,
    WEIGHT_BP_TOP_INT,
} from "./constants";
import {
    BelowWeightBpRangeError,
    CapExceededError,
    NegativeNumberError,
    NonIntegerInputError,
} from "./errors";

export type Cents = number & { __brand: "cents" };

function validatePositiveInteger(input: number) {
    if (!Number.isInteger(input))
        throw new NonIntegerInputError(`${input} is not an integer`);
    if (input < 0 || Object.is(input, -0))
        throw new NegativeNumberError(
            `${Object.is(input, -0) ? "-0" : String(input)} must be a positive integer`,
        );
}

export function validateCents(input: number): Cents {
    validatePositiveInteger(input);
    if (input > CENTS_INT_CAP)
        throw new CapExceededError(
            `${input} exceeds CENTS_INT_CAP (${CENTS_INT_CAP})`,
        );
    return input as Cents;
}

export type HoursCenti = number & { __brand: "hoursCenti" };

export function validateHoursCenti(input: number): HoursCenti {
    validatePositiveInteger(input);
    if (input > HOURS_CENTI_INT_CAP)
        throw new CapExceededError(
            `${input} exceeds HOURS_CENTI_INT_CAP (${HOURS_CENTI_INT_CAP})`,
        );
    return input as HoursCenti;
}

export type WeightBp = number & { __brand: "weightBp" };

export function validateWeightBp(input: number): WeightBp {
    validatePositiveInteger(input);
    if (input > WEIGHT_BP_TOP_INT)
        throw new CapExceededError(
            `${input} exceeds WEIGHT_BP_TOP_INT (${WEIGHT_BP_TOP_INT})`,
        );
    if (input < WEIGHT_BP_BOTTOM_INT)
        throw new BelowWeightBpRangeError(
            `${input} is less than WEIGHT_BP_BOTTOM_INT (${WEIGHT_BP_BOTTOM_INT})`,
        );
    return input as WeightBp;
}
