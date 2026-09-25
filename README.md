# Distribu-tip

![Continuous Integration Workflow Status Badge](https://github.com/daemosity/distribu-tip/actions/workflows/ci.yml/badge.svg)

**Distribu-tip** splits a weekly cash tip pool across the employees who worked that week, proportionally to hours, and reports how many $20, $10, $5 and $1 bills are needed to pay everyone with the fewest bills per person.

The app is a calculator and a record, not a payment system. Counting the tips, getting change from the bank, and handing out envelopes all happen outside it.

## Prerequisites

- Node >= 22.13.0
- TypeScript >= 5.3

## Setup

```bash
npm ci
```

## Running Tests

```bash
npm test # Run the test suite
npm run typecheck # check for type errors
```

### Note on ts-jest

This repo was started with `ts-jest` - with it, we GAIN direct access to the TypeScript compiler, allowing the library to read the tsconfig and report type errors in tests, tightening the testing cycle. In comparison, `babel-jest` allows Jest to run against `.ts` files, but it strips the types without checking them.

The trade-off in choosing `ts-jest` is that it runs slower than `babel-jest`, and it is also currently locked to TypeScript 6 (see [ts-jest section](#ts-jests-unique-dependency-configuration)), which means it doesn't have access to TypeScript 7's improvements.

Note: As this application will eventually use `Expo`, `ts-jest` will need to be swapped out for `jest-expo`, which runs on Babel - and losing the paired "test-and-typecheck" benefits. However, in the early stages of this project, when we're working on pure domain logic, using `ts-jest` seems worth the later migration.

#### ts-jest's unique dependency configuration

This package has two TypeScript versions installed side by side, a necessity for running ts-jest v29 alongside TypeScript 7.

[From ts-jest's documentation](https://kulshekhar.github.io/ts-jest/docs/next/guides/typescript-7):

> TypeScript 7.0 ships a native tsc, but it does not ship the JavaScript compiler API that ts-jest needs for transforms, language-service diagnostics, source maps, hoisting, and custom AST transformers. Microsoft provides @typescript/typescript6 for tools that still need that API and recommends installing it alongside TypeScript 7 with npm aliases.

They suggest the following workaround:

```bash
npm install --save-dev '@typescript/native@npm:typescript@^7.0.2' 'typescript@npm:@typescript/typescript6@^6.0.2'
```

Using this set-up, they say:

> - `npx tsc` runs the native TypeScript 7 compiler for project type-checking and builds.
> - `npx tsc6` runs the TypeScript 6 compatibility compiler when you need to compare results.
> - `ts-jest` imports `typescript`, so it receives the supported TypeScript 6 JavaScript API.
