import { createDefaultPreset } from "ts-jest";

const tsJestCfg = createDefaultPreset();

/** @type {import("jest").Config} **/
export default {
    testEnvironment: "node",
    testTimeout: 30_000,
    ...tsJestCfg,
};
