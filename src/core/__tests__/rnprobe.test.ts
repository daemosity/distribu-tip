import { describe, expect, it } from "@jest/globals";
import { Platform } from "react-native";

describe("probe", () => {
    it("imports react-native", () => {
        expect(Platform.OS).toBeDefined();
    });
});
