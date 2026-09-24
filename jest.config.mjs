import { createDefaultPreset } from "ts-jest";

const tsJestCfg = createDefaultPreset();

/** @type {import("jest").Config} **/
export default {
  testEnvironment: "node",
  ...tsJestCfg,
};
