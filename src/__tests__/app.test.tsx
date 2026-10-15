import { describe, expect, it } from "@jest/globals";
import { render, screen } from "@testing-library/react-native";
import { Text } from "react-native";

describe("Dummy test", () => {
    it("verifies Text component renders", async () => {
        await render(<Text>Hello</Text>);
        expect(screen.getByText("Hello")).toBeOnTheScreen();
    });
});
