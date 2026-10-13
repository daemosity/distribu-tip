import { createDefaultPreset } from "ts-jest";

const tsJestCfg = createDefaultPreset();

/** @type {import("jest").Config} **/
export default {
    watchman: false,
    maxWorkers: 2,
    projects: [
        {
            displayName: "core",
            ...tsJestCfg,
            testMatch: ["<rootDir>/src/core/**/*.test.*"],
        },
        {
            displayName: "non-app",
            ...tsJestCfg,
            testMatch: [
                "<rootDir>/**/*.test.*",
                "!**/src/**/*.test.*",
                "!**/*.test.{android,ios,native}.*",
            ],
        },
        {
            displayName: "app-unspecified",
            preset: "jest-expo",
            testMatch: [
                "<rootDir>/src/**/*.test.*",
                "!**/src/core/**/*.test.*",
                "!**/src/**/*.test.{android,ios,native}.*",
            ],
        },
        {
            displayName: "app-ios",
            preset: "jest-expo/ios",
            testMatch: ["**/src/**/*.test.ios.*", "!**/src/core/**/*.*"],
        },
        {
            displayName: "app-android",
            preset: "jest-expo/android",
            testMatch: ["**/*.test.android.*", "!**/src/core/**/*.*"],
        },
    ],
};
