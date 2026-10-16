import { describe, expect, it } from "@jest/globals";
import { renderRouter, screen } from "expo-router/testing-library";

describe("payoutScreen", () => {
    it("displays worker names and payouts in a way accessible to screen readers", async () => {
        await renderRouter("src/app", { initialUrl: "/" });

        expect(
            screen.getByRole("text", { name: "workOne, $50.00" }),
        ).toBeOnTheScreen();
        expect(
            screen.getByRole("text", { name: "workTwo, $50.00" }),
        ).toBeOnTheScreen();
    });
});
