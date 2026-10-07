type CoreErrorType =
    | "CAP_EXCEEDED"
    | "NO_WORKERS"
    | "INVARIANT_FAILED"
    | "NEGATIVE_NUMBER"
    | "NONINTEGER INPUT";

class CoreError extends Error {
    #code: CoreErrorType;

    constructor(coreError: CoreErrorType, msg?: string) {
        super(msg);
        this.#code = coreError;
    }

    get code() {
        return this.#code;
    }
}

export class NegativeNumberError extends CoreError {
    constructor(msg?: string) {
        super("NEGATIVE_NUMBER", msg);
    }
}
