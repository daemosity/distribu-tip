import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import boundaries, { Config } from "eslint-plugin-boundaries";

export default defineConfig([
    {
        plugins: { js, "@typescript-eslint": tseslint.plugin },
        languageOptions: {
            globals: globals.jest,
            parser: tseslint.parser,
        },
        files: ["**/*.{js,mjs,cjs,ts,mts,cts}"],
        extends: [js.configs.recommended, tseslint.configs.recommended],
    },
    {
        basePath: "src/core",
        plugins: {
            boundaries,
        },
        settings: {
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                },
            },
            "boundaries/elements": [{ type: "coreFiles", pattern: "src/core" }],
        },
        rules: {
            "no-undef": "error",
            ...boundaries.configs.recommended.rules,
            "boundaries/dependencies": [
                "error",
                {
                    default: "disallow",
                    checkAllOrigins: true,
                    checkUnknownLocals: true,
                    message:
                        "'{{from.element.path}}' must stay pure so money math is testable in milliseconds. Pass data in as plain objects instead. Violating imports: {{to.module.source}}",
                    policies: [
                        {
                            from: { element: { type: "coreFiles" } },
                            allow: { to: { element: { type: "coreFiles" } } },
                        },
                    ],
                },
            ],
        },
    } satisfies Config,
]);
