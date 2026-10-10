import js from "@eslint/js";
import globals from "globals";
import tseslint from "typescript-eslint";
import { defineConfig } from "eslint/config";
import type { Config, Rules, Settings } from "eslint-plugin-boundaries/config";
import { createConfig, recommended } from "eslint-plugin-boundaries/config";

const boundariesConfig = createConfig({
    settings: {
        ...recommended.settings,
        "boundaries/elements": [
            { type: "coreFolders", pattern: "src/core", partialMatch: false },
            { type: "appFolders", pattern: "src" },
        ],
    } satisfies Settings,
    rules: {
        ...recommended.rules,
        "boundaries/dependencies": [
            "error",
            {
                default: "disallow",
                checkAllOrigins: true,
                checkUnknownLocals: true,
                policies: [
                    {
                        from: { element: { type: "coreFolders" } },
                        allow: { to: { element: { type: "coreFolders" } } },
                        message:
                            "'{{from.element.path}}' must stay pure so money math is testable in milliseconds. Pass data in as plain objects instead. Violating imports: '{{dependency.source}}'",
                    },
                    {
                        from: {
                            element: {
                                type: "coreFolders",
                                fileInternalPath: "__tests__/*",
                            },
                        },
                        allow: { dependency: { source: "@jest/globals" } },
                    },
                    {
                        from: { element: { type: "appFolders" } },
                        allow: { to: { element: { type: "appFolders" } } },
                        message:
                            "'{{from.element.path}}' may only import from 'core/index'. Violating imports: '{{dependency.source}}'",
                    },
                    {
                        from: { element: { type: "appFolders" } },
                        allow: {
                            to: {
                                element: {
                                    type: "coreFolders",
                                    fileInternalPath: "index.ts",
                                },
                            },
                        },
                    },
                    {
                        from: { element: { type: "appFolders" } },
                        allow: {
                            to: { module: { origin: ["core", "external"] } },
                        },
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
        basePath: "src",
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
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
        },
    },
]);
