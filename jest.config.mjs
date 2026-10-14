import { createDefaultPreset } from "ts-jest";

const tsJestCoreCfg = createDefaultPreset({
    tsconfig: "tsconfig.core.json",
});

const tsJestToolingConfig = createDefaultPreset({
    tsconfig: "tsconfig.json",
});

/** @type {import("jest").Config} **/
export default {
    testTimeout: 30_000,
    watchman: false, // agent sandboxes can't start watchman; no benefit at this repo size
    maxWorkers: "50%",
    projects: [
        {
            displayName: "core",
            ...tsJestCoreCfg,
            testEnvironment: "node",
            testMatch: ["<rootDir>/src/core/**/*.test.*"],
        },
        {
            displayName: "tooling",
            ...tsJestToolingConfig,
            testEnvironment: "node",
            testMatch: [
                "<rootDir>/**/*.test.*",
                "!**/src/**/*.test.*",
                "!**/*.test.{android,ios,native}.*",
            ],
        },
        {
            displayName: "app-ios",
            preset: "jest-expo/ios",
            testMatch: [
                "**/src/**/*.test.*",
                "!**/src/core/**/*.*",
                "!**/*.test.android.*",
            ],
        },
        {
            displayName: "app-android",
            preset: "jest-expo/android",
            testMatch: [
                "**/src/**/*.test.*",
                "!**/src/core/**/*.*",
                "!**/*.test.ios.*",
            ],
        },
    ],
};
