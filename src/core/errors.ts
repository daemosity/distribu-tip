export enum CoreErrorType {
    CAP_EXCEEDED = "CAP_EXCEEDED",
    NO_WORKERS = "NO_WORKERS",
    INVARIANT_FAILED = "INVARIANT_FAILED",
    NEGATIVE_NUMBER = "NEGATIVE_NUMBER",
    NONINTEGER_INPUT = "NONINTEGER_INPUT",
    BELOW_WEIGHT_RANGE = "BELOW_WEIGHT_RANGE",
}

export class CoreError extends Error {
    public readonly code: CoreErrorType;

    constructor(coreError: CoreErrorType, msg?: string) {
        super(msg);
        this.code = coreError;
        this.name = `${coreError
            .split("_")
            .map((word) => word[0] + word.toLowerCase().slice(1))
            .join("")}Error`;
    }
}

export class NegativeNumberError extends CoreError {
    constructor(msg?: string) {
        super(CoreErrorType.NEGATIVE_NUMBER, msg);
    }
}

export class NonIntegerInputError extends CoreError {
    constructor(msg?: string) {
        super(CoreErrorType.NONINTEGER_INPUT, msg);
    }
}

export class CapExceededError extends CoreError {
    constructor(msg?: string) {
        super(CoreErrorType.CAP_EXCEEDED, msg);
    }
}

export class BelowWeightRangeError extends CoreError {
    constructor(msg?: string) {
        super(CoreErrorType.BELOW_WEIGHT_RANGE, msg);
    }
}
