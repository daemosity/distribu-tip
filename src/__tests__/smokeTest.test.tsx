import { describe, expect, it } from "@jest/globals";
import { renderRouter, screen } from "expo-router/testing-library";

describe("router smoke test", () => {
    it("renders a real route", async () => {
        await renderRouter("src/app", { initialUrl: "/" });

        expect(screen.getByText(/Go to Roster/i)).toBeOnTheScreen();
    });
});
