# ADR-002: Compose the ESLint config and call TypeScript 7 by path

## Status

Proposed, 2026-10-11. Originally recommended in the M3-1 spike ([`docs/spikes/expo-toolchain.md`](../spikes/expo-toolchain.md), Recommendation items 3 and 4, revised 2026-10-11) and built on the `scaffold-expo-app` branch for [M3-2 (#24)](https://github.com/daemosity/distribu-tip/issues/24).

## Context

M3-2 scaffolds the Expo app, and I've decided to accept the framework's defaults unless one no longer works or a change in the design doc requires something different. Two defaults that ship with the Expo SDK 57 template are in the former category: the lint setup, and the way it runs TypeScript.

### Lint

The default is `eslint-config-expo`, run through `expo lint`. It does not work on ESLint 10:

- Two plugins it bundles stop at ESLint 9: `eslint-plugin-react` 7.37.5 (`^9.7`) and `eslint-plugin-import` 2.32.0 (`^9`). The spike's probe file crashed on the first file (`react/display-name`: `contextOrFilename.getFilename is not a function`, an API ESLint 10 removed). If I pin `settings.react.version`, it runs, but adds three false `Resolve error` reports (spike, Q6).
- `eslint-config-expo@58.0.4`, the SDK 58 release on npm's `next` tag, bundles the same two plugins, so the upcoming SDK upgrade doesn't fix this.
- Expo knows. In [expo/expo#46717](https://github.com/expo/expo/issues/46717), a maintainer's advice is to stay on ESLint 9 until `eslint-plugin-react` supports ESLint 10. No timeline is given.

The alternatives I considered:

1. **Downgrade to ESLint 9.** This is the advice Expo provides, but ESLint 9 reached end of life on 2026-08-06. The repo has been on ESLint 10 since M1-2, and the `src/core` boundary rules (`eslint-plugin-boundaries`, see [ADR-001](001-allocation-rule-behind-one-function.md)) run on it today. Going back means I'd be pinning a tool that no longer gets security fixes to keep a config that doesn't check anything the boundary rules depend on.
2. **Run `eslint-config-expo` on ESLint 10 with the version pin.** It runs, but receiving false error reports would likely get me to start ignoring the real ones, too.
3. **Switch linters** (Biome, oxlint). Rejected in M1-2: the boundary plugin is ESLint's.
4. **Compose the equivalent from plugins that support ESLint 10.** All plugins I chose declare ESLint 10 support today: `typescript-eslint`, `eslint-plugin-react-hooks`, `@eslint-react/eslint-plugin` (fills the role `eslint-plugin-react` plays in Expo's config) and `eslint-plugin-expo`.

### TypeScript

The repo installs two TypeScript packages side by side:

- `typescript` is an npm alias for `@typescript/typescript6`. Tools that need TypeScript's JavaScript API load it: `ts-jest` (`typescript <7`) and `typescript-eslint` (`<6.1.0`). TypeScript 7 doesn't ship that API yet, and an [Expo maintainer recommends this setup](https://github.com/expo/expo/issues/47627#issuecomment-4927062552) until it does.
- `@typescript/native` is an alias for `typescript@7`, the compiler CI uses as the type gate.

Both packages declare a `tsc` command, and only one can be linked into `node_modules/.bin`. During the spike, which one won seemed to depend on install order (spike, Q7; I didn't isolate the exact rule). So a plain `tsc` in `npm run typecheck`, CI's type gate, might usually run TypeScript 7, but not reliably. The README's ts-jest section quotes ts-jest's docs saying `npx tsc` runs TypeScript 7. On this repo, that's only true when npm happens to link it that way.

## Decision

I will lint with a config I compose myself on ESLint 10, and I will call TypeScript 7 by its path. Both are workarounds, and each has an exit condition below.

### Lint

- **No `eslint-config-expo` and no `expo lint`.** `npm run lint` stays `eslint .`, and `eslint.config.mts` is the only lint config.
- **Each config object has one job:**
    - _Shared:_ `@eslint/js` and `typescript-eslint` recommended for every JS and TS file, including `jsx` and `tsx`.
    - _App only:_ `basePath: "src"` with `ignores: ["core/**/*"]`, so React rules never reach `src/core`. It adds `eslint-plugin-react-hooks` (flat `recommended`), `@eslint-react` `recommended-typescript` with its `disable-dom` and `disable-rsc` presets (React Native has neither a DOM nor Server Components), and the three rules `eslint-config-expo` turns on: `expo/use-dom-exports`, `expo/no-env-var-destructuring` and `expo/no-dynamic-env-var`.
    - _Boundaries:_ keep the M1-2 rules, unchanged.
    - _Core:_ `no-undef` stays on for `src/core`, which has no runtime globals to rely on.
- **Rules re: hooks are not duplicated across plugins.** `@eslint-react`'s `disable-conflict-eslint-plugin-react-hooks` preset turns off 12 `react-hooks` rules. `@eslint-react` then turns them on for itself:
    - nine come from `recommended-typescript`, including `rules-of-hooks`, `exhaustive-deps` and `set-state-in-effect`
    - `recommended-typescript` doesn't turn on the other three (`globals`, `immutability` and `refs`), so I turned on `@eslint-react`'s versions by name. A probe component that changed a module variable, mutated a prop and read `ref.current` during render showed no errors until I did.
    - `react-hooks` contributes only four React Compiler rules the preset doesn't list: `preserve-manual-memoization`, `incompatible-library`, `config` and `gating`.
- **I've turned on Expo rules by name that no other preset turns on:**
    - `@eslint-react/no-missing-component-display-name` replaces `react/display-name`.
    - I put `eqeqeq` (`"smart"`) in the shared object so it can cover the money code in `src/core`.
    - Unreachable code is reported by the compiler instead of by `no-unreachable`, which `typescript-eslint` turns off because TypeScript can check it. TypeScript only reports it as an error with `"allowUnreachableCode": false` in `tsconfig.json`, so I set that.
- Every other rule `eslint-config-expo` turns on is either covered or doesn't apply. I compared the rules it turns on for a `.tsx` file (under ESLint 9) with the rules this config turns on:
    - _Covered by TypeScript:_ `import/no-unresolved`, `import/namespace` and `import/export`, plus `react/jsx-no-undef`, `jsx-no-duplicate-props`, `no-string-refs` and `require-render-return`. The core boundary still retains its import watchdog via `eslint-import-resolver-typescript`.
    - _Covered by `@eslint-react` under another name:_ `react/jsx-key` (`no-missing-key`) and `react/no-children-prop` (`jsx-no-children-prop`).
    - _Not applicable in React Native:_ DOM rules like `react/no-unknown-property`, `no-find-dom-node`, `no-render-return-value` and `no-danger-with-children`.
    - _Style rules I'm leaving out:_ `@typescript-eslint/array-type`, `consistent-type-assertions` and `import/first`.
- **I repeat that comparison at every SDK upgrade**. Each gap found is ported, recorded as covered, or recorded as not applicable.
- **I give `eslint-plugin-expo` a type declaration** in `types/eslint-plugin-expo.d.ts`. Version 1.1.0 ships no types and there is no `@types` package. I typed it as `ESLint.Plugin`, not `any`, so mistakes can still fail typecheck.

### TypeScript

- **I keep both TypeScript packages.**
- **`npm run typecheck` calls `node node_modules/@typescript/native/bin/tsc` for both passes** (`tsconfig.json` and `tsconfig.core.json`) so scripts and CI can never call a bare `tsc`.

### Exit conditions

| Workaround                                          | Undo it when                                                                                                                                                                                               | Checked                                                                 |
| --------------------------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ----------------------------------------------------------------------- |
| Composed lint config                                | An `eslint-config-expo` release on npm's `latest` tag runs on ESLint 10 with no peer conflicts, no crash and no false reports, using the spike's Q6 probe (setup finds all nine problems and nothing else) | At every SDK upgrade                                                    |
| `types/eslint-plugin-expo.d.ts`                     | `eslint-plugin-expo` ships its own types or the composed config goes                                                                                                                                       | At every SDK upgrade; if the composed config goes                       |
| Two TypeScript packages and the path in `typecheck` | Both `ts-jest` and `typescript-eslint` accept TypeScript 7 in their peer ranges. This lets me drop the TS 6 alias, and revert the `typecheck` script back to a plain `tsc`                                 | At every SDK upgrade, and when either tool releases a new major version |

Switching back gets a new ADR that supersedes this one.

## Consequences

### Easier

- **Lint runs on a supported ESLint**, and every lint dependency declares support for the version it runs on. I don't need to hold anything back with a pin.
- **The scoping can be checked so I don't have to blindly trust it.** `npx eslint --print-config` on `src/core/index.ts` shows the boundary rule and zero React or hooks rules. On an app file it just shows the three Expo rules -- no DOM or RSC rules.
- **A hook called inside an `if` is only reported once**, from `@eslint-react/rules-of-hooks` instead of twice (from two plugins).
- **`typecheck` is pinned to a specific version wherever it's run.** It runs TypeScript 7.0.2 even when `node_modules/.bin/tsc` points at the other package.

### Harder

- **I have to pay attention the lint config now.** Expo's lint changes don't come with an SDK upgrade. Whenever I upgrade, I need to compare `eslint-config-expo`'s `flat/` files with this config, or I'll miss if the two drift apart.
- **The rule names don't mirror what Expo's docs use.** Answers online say `react/...`; this repo says `@eslint-react/...`. Mapping one to the other means reading both plugins' docs and extra cognitive overhead.
- **Hooks ownership depends on another package's preset, and that has already gone wrong.** Which rules are on comes from two lists in other packages: what `disable-conflict-eslint-plugin-react-hooks` turns off, and what `recommended-typescript` turns on. The first version of this config silently lost three React Compiler rules in the gap between them. While the three rules turned on by name close that gap for now, a new release of either plugin could open another, and right now my lint probe only catches a duplicated `rules-of-hooks`.
- **Rules turned on by name don't update themselves.** If `@eslint-react` renames or replaces one of them, I won't know until the comparison catches the change.
- **The hand-written declaration can go stale.** If `eslint-plugin-expo` changes its export shape, the declaration still compiles, and the mistake shows up as a lint crash, not a type error.
- **Two compilers can disagree.** The type gate runs TypeScript 7, while `ts-jest` and `typescript-eslint`'s type-aware rules run TypeScript 6. A difference between them would show up as a test or lint result that doesn't match `typecheck`.
- **The typecheck script depends on the alias name.** Renaming `@typescript/native` in `package.json` silently breaks `typecheck`.

### How I'll know this was wrong

- The M3-2 lint probe stops failing, or reports twice, after a dependency update.
- A review finds a mistake `eslint-config-expo` would have caught and this config didn't.
- The comparison at an SDK upgrade keeps finding new gaps. That would mean maintaining this config costs me more than this ADR assumed.
- `typecheck` passes while the editor, `ts-jest` or a type-aware lint rule reports a type error, or the reverse.
