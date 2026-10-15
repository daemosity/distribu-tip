import { describe, expect, it } from "@jest/globals";
import { renderRouter, screen } from "expo-router/testing-library";

describe("router smoke test", () => {
    it("renders a real route", async () => {
        await renderRouter("src/app", { initialUrl: "/" });

        expect(
            screen.getByRole("text", { name: "workOne, $50.00" }),
        ).toBeOnTheScreen();
        expect(
            screen.getByRole("text", { name: "workTwo, $50.00" }),
        ).toBeOnTheScreen();
    });
});
