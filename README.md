# Distribu-tip

![Continuous Integration Workflow Status Badge](https://github.com/daemosity/distribu-tip/actions/workflows/ci.yml/badge.svg)

DISCLOSURE: This app is not legally viable as specified. See [Architectural Decisions](#architectural-decisions).

**Distribu-tip** splits a weekly cash tip pool across the employees who worked that week, proportionally to hours, and reports how many $20, $10, $5 and $1 bills are needed to pay everyone with the fewest bills per person.

The app is a calculator and a record, not a payment system. Counting the tips, getting change from the bank, and handing out envelopes all happen outside it.

## Prerequisites

- Node: 26
    - see ./.nvmrc for confirmation
- Expo v57
- Emulators/Simulators to test on. Some options:
    - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
    - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
    - [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Development Setup

To install the library versions we're working with, as well as `husky` + `lint-staged` pre-commit hooks, which will lint and format files before they are captured in a commit:

```bash
npm ci
```

If using WSL2, here's the development setup:

- Repo on Ubuntu Linux LTS
- Mirrored WSL2 networking
- Set Metro firewall to allow communication between wifi and phone
- Pair Android phone by enabling developer tools, turning on wifi debugging, and pairing within WSL2 via adb pair
    - If this doesn't work, fall back to `npx expo start --tunnel`, which is slower but should still work

## Running Tests

```bash
npm test # Run the test suite
npm run typecheck # check for type errors
```

**Note:** Tests currently only pass with `npm test`

- `npx jest` fails because loading `eslint.config.mts` needs `NODE_OPTIONS=--experimental-vm-modules`.

### Note on ts-jest

This repo was started with `ts-jest` - with it, we GAIN direct access to the TypeScript compiler, allowing the library to read the tsconfig and report type errors in tests, tightening the testing cycle. In comparison, `babel-jest` allows Jest to run against `.ts` files, but it strips the types without checking them.

The trade-off in choosing `ts-jest` is that it runs slower than `babel-jest`, and it is also currently locked to TypeScript 6 (see [ts-jest section](#ts-jests-unique-dependency-configuration)), which means it doesn't have access to TypeScript 7's improvements.

Note: As this application will eventually use `Expo`, `ts-jest` will need to be swapped out for `jest-expo`, which runs on Babel - and losing the paired "test-and-typecheck" benefits. However, in the early stages of this project, when we're working on pure domain logic, using `ts-jest` seems worth the later migration.

#### ts-jest's unique dependency configuration

This package has two TypeScript versions installed side by side, a necessity for running ts-jest v29 alongside TypeScript 7.

`ts-jest` notes that [Typescript 7.0 doesn't ship with the Javascript Compiler API `ts-jest` needs for its tooling](https://kulshekhar.github.io/ts-jest/docs/next/guides/typescript-7). This is also why both Expo 57 and 58 don't bundle with TypeScript 7 - they're waiting on a public API as well. Taking up `ts-jest`'s suggestion to install Typsecript 7 under an alias, this project includes it under `@typescript/native`, and calls its `tsc` directly in its package's `npm run typecheck` script.

This allows TS7's blazingly fast typecheck during development and CI while still providing TypeScript 6 so this repo's other librarys can still operate with TypeScript support.

## Architectural Decisions

Disclaimer:

The rules that currently govern how tips are distributed appear to conflict with Illinois law. This repo seeks to make sure they are isolated behind a single function so that a fix is contained. See [ADR-001](docs/adr/001-allocation-rule-behind-one-function.md#context).

For decisions that helped shape this repo, see [`docs/adr/README.md`](docs/adr/README.md)
