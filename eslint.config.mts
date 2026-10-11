import eslintReact from "@eslint-react/eslint-plugin";
import js from "@eslint/js";
import type { Config, Rules, Settings } from "eslint-plugin-boundaries/config";
import { createConfig, recommended } from "eslint-plugin-boundaries/config";
import eslintExpo from "eslint-plugin-expo";
import reactHooks from "eslint-plugin-react-hooks";
import { defineConfig } from "eslint/config";
import globals from "globals";
import tseslint from "typescript-eslint";

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
                message:
                    "'{{from.element.path}}' has violated the boundary rules. Violating imports: '{{dependency.source}}'",
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
            parser: tseslint.parser,
        },
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        extends: [js.configs.recommended, tseslint.configs.recommended],
        rules: {
            "@typescript-eslint/no-unused-vars": [
                "error",
                { argsIgnorePattern: "^_" },
            ],
        },
    },
    {
        basePath: "src",
        files: ["**/*.{ts,js,tsx,jsx}"],
        ignores: ["core/**/*"],
        plugins: {
            expo: eslintExpo,
        },
        extends: [
            reactHooks.configs.flat.recommended,
            eslintReact.configs["disable-conflict-eslint-plugin-react-hooks"],
            eslintReact.configs["recommended-typescript"],
            eslintReact.configs["disable-dom"],
            eslintReact.configs["disable-rsc"],
        ],
        rules: {
            "expo/use-dom-exports": "error",
            "expo/no-env-var-destructuring": "error",
            "expo/no-dynamic-env-var": "error",
        },
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
    },
    {
        basePath: "src/core",
        files: ["**/*.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
        rules: {
            "no-undef": "error",
        },
    },
    {
        files: ["**/__test__/**"],
        languageOptions: {
            globals: globals.jest,
        },
    },
]);
