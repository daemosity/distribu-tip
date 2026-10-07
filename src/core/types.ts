import { NegativeNumberError } from "./errors";

export type Cents = number & { __brand: "cents" };

export function parseToCents(a: number) {
    throw new NegativeNumberError(`${a}`);
}
