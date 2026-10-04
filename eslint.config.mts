import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import type { Config, Rules, Settings } from "eslint-plugin-boundaries/config";
import { createConfig, recommended } from "eslint-plugin-boundaries/config";

const boundariesConfig = createConfig({
    settings: {
        ...recommended.settings,
        "boundaries/elements": [{ type: "coreFiles", pattern: "src/core" }],
    } satisfies Settings,
    rules: {
        ...recommended.rules,
        "boundaries/dependencies": [
            "error",
            {
                default: "disallow",
                checkAllOrigins: true,
                checkUnknownLocals: true,
                message:
                    "'{{from.element.path}}' must stay pure so money math is testable in milliseconds. Pass data in as plain objects instead. Violating imports: '{{dependency.source}}'",
                policies: [
                    {
                        from: { element: { type: "coreFiles" } },
                        allow: { to: { element: { type: "coreFiles" } } },
                    },
                ],
            },
        ],
    } satisfies Rules,
} satisfies Config);

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
        extends: [boundariesConfig],
        settings: {
            "import/resolver": {
                typescript: {
                    alwaysTryTypes: true,
                },
            },
        },
        rules: {
            "no-undef": "error",
        },
    },
]);
