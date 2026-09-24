const { createDefaultPreset } = require("ts-jest");

const tsJestCfg = createDefaultPreset();

/** @type {import("jest").Config} **/
module.exports = {
  testEnvironment: "node",
  ...tsJestCfg,
};