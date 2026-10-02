import fs from "node:fs";
import path from "node:path";
import { ESLint, Linter } from "eslint";
import {beforeAll, afterAll, describe, it, expect} from '@jest/globals';

// Contract tested: code in src/core may import only files and folders inside
// src/core, and may not use environment globals (window, document, process...).
//
// The test is deliberately agnostic about HOW the project enforces this.
// It lints snippets as if they lived in src/core/probe.ts and checks only:
//   - forbidden snippets produce an ESLint error on the offending line
//     (from any rule, plugin or core), and
//   - allowed snippets produce no errors at all.
// Probe code is otherwise clean (imports are used, files are valid TS), so an
// error on the offending line can only come from the construct under test.
 
// Repo root (this file lives in <root>/__tests__/).
const ROOT = path.resolve(__dirname, "../");
 
const PROBE_PATH = "src/core/probe.ts";
 
// Resolution-based rules (e.g. eslint-plugin-boundaries, import-x) classify an
// import by resolving it to a real file, and skip imports of files that don't
// exist. So the import targets must exist on disk. They are created here only
// when missing, and only what this test created is removed afterwards.
const FIXTURES: Record<string, string> = {
    "src/app/thing.ts": "export default 1;\n",
    "src/core/money.ts": "export const x = 1;\n",
    "src/core/sub/util.ts": "export const x = 1;\n",
    "src/core/probe.ts": "export {};\n",
};
 
const createdFiles: string[] = [];
const createdDirs: string[] = [];
 
function createFixtures() {
    for (const [relPath, contents] of Object.entries(FIXTURES)) {
        const absPath = path.join(ROOT, relPath);
        if (fs.existsSync(absPath)) continue;
        // Returns the first directory it had to create, if any.
        const createdDir = fs.mkdirSync(path.dirname(absPath), {
            recursive: true,
        });
        if (createdDir) createdDirs.push(createdDir);
        fs.writeFileSync(absPath, contents);
        createdFiles.push(absPath);
    }
}
 
function removeFixtures() {
    for (const file of createdFiles) fs.rmSync(file, { force: true });
    for (const dir of createdDirs) {
        fs.rmSync(dir, { recursive: true, force: true });
    }
}
 
const originalCwd = process.cwd();
let eslint: ESLint;
 
beforeAll(() => {
    createFixtures();
    // Some plugins resolve their root from process.cwd() rather than ESLint's
    // cwd option (eslint-plugin-boundaries does), so run from the repo root.
    process.chdir(ROOT);
    // Loads the project's own eslint.config.* from ROOT.
    eslint = new ESLint({ cwd: ROOT });
});
 
afterAll(() => {
    process.chdir(originalCwd);
    removeFixtures();
});
 
function summarize(messages: Linter.LintMessage[]) {
    return messages.map(
        (m) =>
            `${m.line}:${m.column} ${m.ruleId ?? "(no rule)"}: ${m.message}`,
    );
}
 
async function lintProbe(code: string) {
    const results = await eslint.lintText(code, {
        filePath: path.join(ROOT, PROBE_PATH),
    });
    const result = results[0];
    if (!result) {
        throw new Error(`ESLint returned no result for ${PROBE_PATH}`);
    }
    const errors = result.messages.filter((m) => m.severity === 2);
    return { all: result.messages, errors };
}
 
// Forbidden probes put the offending construct on line 1, so the assertion can
// require the error to be reported there. Parse errors don't count.
const OFFENDING_LINE = 1;
 
async function expectErrorOnOffendingLine(code: string) {
    const { all, errors } = await lintProbe(code);
    const hits = errors.filter((m) => !m.fatal && m.line === OFFENDING_LINE);
    if (hits.length === 0) {
        // Jest's expect() has no custom-message argument, so throw with every
        // message ESLint produced to make a failure diagnosable.
        throw new Error(
            `Expected an ESLint error on line ${OFFENDING_LINE} but got none. All messages:\n${
                summarize(all).join("\n") || "(none)"
            }`,
        );
    }
    expect(hits.length).toBeGreaterThan(0);
}
 
type Probe = [name: string, code: string];
 
// Every import probe uses its import (export const y = ...) so
// no-unused-vars can't muddy the result.
const forbiddenImports: Probe[] = [
    [
        "relative escape out of core",
        `import x from "../app/thing";\nexport const y = x;\n`,
    ],
    [
        "path-alias escape (@/app/...)",
        `import x from "@/app/thing";\nexport const y = x;\n`,
    ],
    [
        "re-export from outside core",
        `export * from "../app/thing";\n`,
    ],
    [
        "package (react)",
        `import React from "react";\nexport const y = React;\n`,
    ],
    [
        "package not otherwise listed (date-fns)",
        `import { format } from "date-fns";\nexport const y = format;\n`,
    ],
    [
        "node builtin (node:fs)",
        `import fs from "node:fs";\nexport const y = fs;\n`,
    ],
    [
        "node builtin without prefix (fs)",
        `import fs from "fs";\nexport const y = fs;\n`,
    ],
];
 
const forbiddenGlobals: Probe[] = [
    ["window", `export const y = window.location;\n`],
    ["document", `export const y = document.title;\n`],
    ["localStorage", `export const y = localStorage.getItem("k");\n`],
    ["fetch", `export const y = fetch("/x");\n`],
    ["process", `export const y = process.env.NODE_ENV;\n`],
];
 
const allowed: Probe[] = [
    [
        "sibling file inside core (./money)",
        `import { x } from "./money";\nexport const y = x;\n`,
    ],
    [
        "nested folder inside core (./sub/util)",
        `import { x } from "./sub/util";\nexport const y = x;\n`,
    ],
    [
        "path alias into core (@/core/money)",
        `import { x } from "@/core/money";\nexport const y = x;\n`,
    ],
    [
        "ECMAScript built-ins (Math)",
        `export const y = Math.max(1, 2);\n`,
    ],
];
 
describe(`core boundary (${PROBE_PATH})`, () => {
    describe("imports from outside src/core", () => {
        it.each(forbiddenImports)(
            "reports an error for: %s",
            async (_name, code) => {
                await expectErrorOnOffendingLine(code);
            },
        );
    });
 
    describe("environment globals", () => {
        it.each(forbiddenGlobals)(
            "reports an error for: %s",
            async (_name, code) => {
                await expectErrorOnOffendingLine(code);
            },
        );
    });
 
    describe("allowed code", () => {
        it.each(allowed)("reports no errors for: %s", async (_name, code) => {
            const { errors } = await lintProbe(code);
            // On failure, Jest prints the offending rules and messages.
            expect(summarize(errors)).toEqual([]);
        });
    });
});