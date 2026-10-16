import { Cents } from "./types";

export const formatCents = (cents: Cents) => {
    const dollarCents = `${cents % 100}`.padStart(2, "0");
    const dollars = Math.trunc(cents / 100);
    return `$${dollars}.${dollarCents}`;
};
