import { allocate } from "./allocate";
import { billsFor } from "./bills";
import {
    CoreError,
    CoreErrorType,
    NegativeNumberError,
    NonIntegerInputError,
    CapExceededError,
    BelowWeightBpRangeError,
} from "./errors";
import { validateCents, validateHoursCenti, validateWeightBp } from "./types";
import type { Cents, HoursCenti, WeightBp } from "./types";
import type { BillCounts } from "./bills";
import type {
    AllocationInput,
    AllocationResult,
    Worker,
    WorkerPayout,
} from "./allocate";

export {
    allocate,
    billsFor,
    validateCents,
    validateHoursCenti,
    validateWeightBp,
    CoreError,
    CoreErrorType,
    NegativeNumberError,
    NonIntegerInputError,
    CapExceededError,
    BelowWeightBpRangeError,
};

export type {
    Cents,
    HoursCenti,
    WeightBp,
    BillCounts,
    AllocationInput,
    AllocationResult,
    Worker,
    WorkerPayout,
};
