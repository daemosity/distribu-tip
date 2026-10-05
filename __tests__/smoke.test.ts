import { test, expect } from "@jest/globals";

test("Smoketest", () => {
    expect(1).toBe(1);
});

test("deliberately failing test", () => {
    expect(1).toBe(2);
})
