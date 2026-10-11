# Spike: Expo SDK and toolchain compatibility (M3-1)

| Field         | Value                                                                                                                                                                                          |
| ------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| Issue         | [M3-1](https://github.com/daemosity/distribu-tip/issues/23)                                                                                                                                    |
| Status        | Complete. Findings dated 2026-10-10, recommendation revised 2026-10-11 (see [Revisions](#revisions)); they expire, see [Revisit when](#revisit-when)                                           |
| Timebox       | 0.5 focus day, additional 1.21 focus days for ramp-up                                                                                                                                          |
| Actual        | 0.72, ramp-up: 1 additional focus day. Spike itself ran over due to unanticipated issues with ESLint peer dependencies and narrowing down how SDK 58's release timing would affect the project |
| Informs       | M3-2 (scaffold), M3-3 (Jest projects), M5-1 (EAS Node version)                                                                                                                                 |
| Spike folders | `../distributip-spike`, scratch ESLint folders. Thrown away; nothing here ships                                                                                                                |

## Bottom line

- **SDK:** scaffold M3-2 now on **SDK 57.0.27**, the newest stable. M3-2 can't wait for SDK 58, which is still in beta. **Upgrade to 58 between M3-2 and M3-3**, once npm's `latest` tag points to it.
- **Jest:** M3-2 doesn't add `jest-expo`, so the repo stays on Jest 30. M3-3 then adds `jest-expo@58`, which also uses Jest 30, so the Jest 29 downgrade never happens. If SDK 58 isn't `latest` when M3-2 merges, fall back: M3-3 on 57 with Jest 29, and upgrade at the end of M3.
- **ESLint:** don't use `eslint-config-expo`. Under ESLint 10 it crashes, and ESLint 9 is end of life. Compose the equivalent from plugins that support ESLint 10. This departs from M3-2's stated deliverable and needs an ADR.
- **TypeScript:** keep the two-version setup Expo itself ships (TS 6 for tools, TS 7 for the type gate), and make the typecheck script call TS 7 by path, because which `tsc` gets linked depends on install order.
- **Node:** keep Node 26. Expo supports it, and it becomes LTS on 2026-10-28. M5-1 pins the same version in `eas.json`.
- **Scaffolding:** generate the template in a temporary folder, then merge it in two commits: template-only files untouched first, then the six collisions resolved by hand.

## Questions and answers

| #   | Question                                                              | Answer                                                                                                                                                              | Confidence                                           |
| --- | --------------------------------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------------------------- |
| 1   | Which SDK?                                                            | 57.0.27 for M3-2 (newest stable); 58 is on `next` and close to release. Upgrade to 58 before M3-3                                                                   | High; re-checked 2026-10-11                          |
| 2   | Does `create-expo-app` coexist with this repo's config?               | Not in place: it refuses a non-empty folder. Six collisions to merge by hand (table below)                                                                          | High                                                 |
| 3   | Can Jest 29 run both ts-jest and jest-expo?                           | Yes. ts-jest 29.4.14 accepts Jest 29 or 30. But jest-expo 57 needs Jest 29, and 58 moves to Jest 30, so adding jest-expo after the SDK 58 upgrade avoids the change | High                                                 |
| 4   | Does `expo-doctor` pass with the TypeScript aliasing?                 | Yes. With the repo's exact devDependencies, the only failure is the Jest major version                                                                              | High                                                 |
| 5   | Does Expo or EAS need a Node LTS?                                     | No. Expo tooling supports 22.13+, 24.3+ and 26+. EAS defaults to an LTS image, so pin Node explicitly                                                               | High                                                 |
| 6   | _Found during the spike:_ does Expo's ESLint config run on ESLint 10? | No. It crashes; a workaround gets it running but adds false errors                                                                                                  | High on SDK 57's config; 58's ships the same plugins |
| 7   | _Found during the spike:_ which TypeScript does `tsc` run?            | Whichever package npm linked last. Usually 7.0.2, not reliably                                                                                                      | Medium: cause not fully isolated                     |

## Method

Every experiment ran outside the repo, so nothing in `distributip` was at risk:

1. Read release status from the registry (`npm view <pkg> dist-tags`, `dependencies`, `peerDependencies`) and from primary changelogs, not blog posts.
2. Generated the default template with `npx create-expo-app@latest distributip-spike --template default@sdk-57` and compared it with the repo (`diff -rq`, `diff -y` on `package.json`).
3. Pasted the repo's `devDependencies` into the spike's `package.json` exactly as written, ran plain `npm install` (not `npx expo install`, which picks its own versions), then `npx expo-doctor` and `npm ls`.
4. For ESLint, stated a prediction first, then linted one probe file containing a known violation for each plugin, under ESLint 10, under ESLint 9 as a control, and under a composed alternative. Commands are in [Reproduce](#reproduce).

Environment: Q1–Q5 and Q7 ran on my machine (Node 26)

## Findings

### Q1: SDK choice

`npm view expo dist-tags` on 2026-10-10: `latest` is **57.0.27** and `next` is **58.0.7**. Unchanged when re-checked on 2026-10-11; `react-native`'s `latest` was still 0.87.1.

- The SDK 58 beta was announced on 2026-09-15 with a planned three-to-four-week beta. It runs on a React Native 0.88 release candidate, and Expo says SDK 58 follows shortly after React Native 0.88 ships.
- React Native 0.88 is scheduled for **2026-10-12**.
- After SDK 58 is stable, the App Store and Google Play builds of Expo Go update to 58 and stop supporting SDK 57. This matters less than it looks: M3-2's acceptance check runs on a simulator or emulator, where Expo CLI installs a matching Expo Go, and M5 uses development builds, which don't use Expo Go. The cost of being on 57 is only that the store's Expo Go on a physical phone stops running the app for informal testing until the upgrade.

M3-2 has to start on 2026-10-11, so waiting for 58 isn't an option, and adopting the beta would break the "newest stable, never a preview" rule. 57.0.27 is the answer for M3-2. The cheapest moment to upgrade is right after M3-2, while the app is still only a scaffold and before M3-3 adds `jest-expo`, the one dependency whose major version differs between 57 and 58.

### Q2: Template coexistence

`npx create-expo-app .` in the repo root refused: _"The directory distributip has files that might be overwritten … Try using a new directory name, or moving these files."_ Nothing changed.

Comparing a generated SDK 57 template with the repo:

| Path                                                               | In both? | Plan for M3-2                                                                                                                                                                                                                                                         |
| ------------------------------------------------------------------ | -------- | --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `package.json`                                                     | Yes      | Merge by hand: take Expo's `main`, dependencies and `start`/`ios`/`android` scripts; keep the repo's scripts and devDependencies. Don't take `"lint": "expo lint"` (see Q6), or the template's `jest` and `jest-expo` (they arrive in M3-3, after the SDK 58 upgrade) |
| `package-lock.json`                                                | Yes      | Never merge by hand. Regenerate with `npm install` after `package.json` is final                                                                                                                                                                                      |
| `tsconfig.json`                                                    | Yes      | Extend `expo/tsconfig.base`, keep the repo's strict flags. `tsconfig.core.json` stays unchanged                                                                                                                                                                       |
| `.gitignore`                                                       | Yes      | Union of both                                                                                                                                                                                                                                                         |
| `README.md`                                                        | Yes      | Keep the repo's; add the SDK version and simulator prerequisites                                                                                                                                                                                                      |
| `.claude/`                                                         | Folder   | Template adds `settings.json` (Expo's agent skills). Generate with `--no-agents-md` to skip it and `AGENTS.md`                                                                                                                                                        |
| `app.json`, `assets/`                                              | Template | Take; set name, slug and portrait-only orientation                                                                                                                                                                                                                    |
| `src/app/`                                                         | Template | Take; it matches the design doc's `src/app/` routes                                                                                                                                                                                                                   |
| `src/components/`, `src/constants/`, `src/hooks/`                  | Template | Demo code. Run `scripts/reset-project.js` in the temp folder first, then copy only what remains                                                                                                                                                                       |
| `src/global.css`, `react-native-web`, `react-dom`                  | Template | Web support. Drop unless web is in scope                                                                                                                                                                                                                              |
| Demo packages (`@expo/ui`, `expo-glass-effect`, `expo-symbols`, …) | Template | Drop any the remaining screens don't import                                                                                                                                                                                                                           |
| `LICENSE`                                                          | Template | Don't copy. Choosing a license is a separate decision                                                                                                                                                                                                                 |
| `.vscode/`                                                         | Template | Optional                                                                                                                                                                                                                                                              |

### Q3: Jest

- `npx expo install jest-expo jest` on SDK 57 selects `jest@~29.7.0`; the repo has `jest@^30.5.2` and `@jest/globals@^30.5.2`.
- `jest-expo@57.0.5` depends on Jest 29 packages (`babel-jest`, `@jest/globals`, `jest-snapshot` at `^29.2.1`).
- With the repo's devDependencies installed, `npm ls` shows **two Jest installs**: `jest@30.5.2` at the top and `jest@29.7.0` nested under `jest-expo`.
- `jest-expo@58.0.9` (`next`) depends on `babel-jest` and `jest-snapshot` `^30.0.0` and has `jest@^30.0.0` as a peer.
- `ts-jest@29.4.14` (`latest`) accepts `jest ^29 || ^30`, so it needs no change on either path.

### Q4: expo-doctor and the TypeScript aliasing

| Run                                                  | Result                                                  |
| ---------------------------------------------------- | ------------------------------------------------------- |
| Template's own devDependencies                       | 21/21 checks passed                                     |
| Repo's devDependencies, installed with `npm install` | 20/21: only `jest` (expected `~29.7.0`, found `30.5.2`) |

The aliasing (`"typescript": "npm:@typescript/typescript6@^6.0.2"` alongside `"@typescript/native": "npm:typescript@^7.0.2"`) raises nothing. I'm not using `expo.install.exclude` to silence the Jest failure: `jest-expo@57` is built for Jest 29, so the warning is real.

An earlier attempt used `npx expo install --dev …`. That silently left out `jest` and `typescript`, because the template already had SDK-compatible versions, so it didn't test the repo's setup.

### Q5: Node

- `expo@57.0.27` declares no Node engine requirement.
- The SDK 58 beta notes say Expo tooling needs Node 22.13+ on 22, 24.3+ on 24, or 26 and later; odd-numbered versions aren't supported.
- Node 26 enters Active LTS on 2026-10-28.
- EAS builds default to an LTS image, so the risk is a mismatch between local and cloud builds, not a lack of support.

### Q6: ESLint 10 and `eslint-config-expo` (found during the spike)

`npm ls` reported `ELSPROBLEMS … invalid: eslint@10.12.0`. `eslint-config-expo` declares `eslint >=8.10`, but two plugins it bundles stop at ESLint 9:

| Plugin bundled by `eslint-config-expo` | ESLint peer range     | Supports 10? |
| -------------------------------------- | --------------------- | ------------ |
| `eslint-plugin-import` 2.32.0          | `… \|\| ^8 \|\| ^9`   | No           |
| `eslint-plugin-react` 7.37.5           | `… \|\| ^8 \|\| ^9.7` | No           |
| `eslint-plugin-react-hooks` 7.1.1      | up to `^10.0.0`       | Yes          |
| `eslint-plugin-expo` 1.1.0             | `>=8.10`              | Yes          |

`eslint-config-expo@58.0.4` bundles the same two plugins, so SDK 58 doesn't fix this. ESLint 9 reached end of life on 2026-08-06.

**Prediction before running:** the plugins would run on ESLint 10 and only the peer warnings would remain.

**Result:** prediction refuted. The probe file should produce nine problems from eight rules, one or more per plugin.

| Setup                                                | Outcome                                                                                                                             |
| ---------------------------------------------------- | ----------------------------------------------------------------------------------------------------------------------------------- |
| A. ESLint 10 + `eslint-config-expo@57` as documented | Crash on the first file: `react/display-name`: `contextOrFilename.getFilename is not a function` (an API ESLint 10 removed)         |
| B. Same, with `settings.react.version` pinned        | All nine found, plus three spurious `Resolve error: typescript with invalid interface loaded as resolver` (two errors, one warning) |
| C. Control: ESLint 9.39.5 + `eslint-config-expo@57`  | All nine found, no spurious results                                                                                                 |
| D. ESLint 10 + composed config (below)               | No peer conflicts, no crash. Seven of nine found; the two misses are listed below                                                   |

Composed config D: `typescript-eslint` recommended, `eslint-plugin-react-hooks` recommended, `@eslint-react/eslint-plugin` `recommended-typescript`, `eslint-plugin-import-x` recommended and typescript with `eslint-import-resolver-typescript` 4.x, and the three `eslint-plugin-expo` rules Expo's config enables.

What D did differently:

- **Missed `react/jsx-no-undef`.** TypeScript reports an undefined component as a compile error, so the typecheck covers it.
- **Missed `react/display-name`** on an anonymous `React.memo`. Small gap; check whether `@eslint-react` has an equivalent rule.
- **Reported rules-of-hooks twice** (from `react-hooks` and `@eslint-react`). Configuration: keep one source.
- **Added `import-x/default` on `import React from "react"`.** Likely because the scratch folder had no `tsconfig.json`; recheck with the real one before deciding.

Not checked: whether Expo has an open issue about ESLint 10 (GitHub search wasn't available from my sandbox). Check `expo/expo` issues before writing the ADR.

### Q7: which `tsc` runs (found during the spike)

Both TypeScript packages declare a `tsc` command, and only one can be linked into `node_modules/.bin`. In my runs it pointed at 7.0.2 whenever `@typescript/native` was installed last, and sometimes switched to 6.0.3 after reinstalling the TS 6 alias; I didn't isolate the exact rule, and stopped there because the fix doesn't depend on it. In a clean sandbox:

| Command                                                  | Version |
| -------------------------------------------------------- | ------- |
| `node node_modules/@typescript/native/bin/tsc --version` | 7.0.2   |
| `node -e 'console.log(require("typescript").version)'`   | 6.0.3   |

So today `npm run typecheck` (CI's type gate) usually runs TS 7, while ts-jest and typescript-eslint load TS 6. Those tools need TypeScript's JavaScript API, which TS 7 doesn't have yet (`ts-jest` requires `typescript <7`; `typescript-eslint` requires `<6.1.0`). Expo's template ships the same two-version setup, and an Expo maintainer recommends it until TS 7 has a public API.

## Recommendation

**For M3-2 (scaffold):**

1. **SDK 57.0.27, without `jest-expo`.** Run `npm view expo dist-tags` once at the start to confirm `latest` is still 57; if 58 has become `latest` overnight, scaffold on 58 instead and skip the upgrade below. Keep the repo's Jest 30; core tests keep running on ts-jest as today. If `expo-doctor` still flags `jest` without `jest-expo` installed (not tested in this spike), explain the warning in the PR, as M3-2's acceptance criteria allow.
2. **Generate, then merge.** Generate with `--template default@sdk-57 --no-agents-md` in a temporary folder and run `reset-project` there. Commit one: template-only files copied untouched. Commit two: the six collisions resolved per the Q2 table. This keeps the "scaffold commit untouched" promise even though some files can't be copied as-is.
3. **ESLint: compose, don't adopt `eslint-config-expo`.** Start from config D, minus anything TypeScript already covers. `import-x` is optional, since TypeScript reports unresolved modules and missing exports. Record the departure from M3-2's deliverable in the M3-2 ADR, with an exit condition: switch back when `eslint-config-expo` supports ESLint 10.
4. **TypeScript.** Keep both versions. Change `typecheck` to call TS 7 by path (`node node_modules/@typescript/native/bin/tsc -p …`). Cover it in the same ADR, with an exit condition: drop TS 6 when ts-jest and typescript-eslint support TS 7.

**Between M3-2 and M3-3: upgrade to SDK 58** once it's `latest`, following Expo's upgrade walkthrough (`npx expo install expo@^58 --fix`, then `npx expo-doctor`). Re-run Q2, Q4 and Q6 against 58 as part of it, about 30 minutes. The design doc allows SDK upgrades only between milestones, and this one is inside M3, so it's a deliberate exception, recorded in the upgrade PR: the rule protects features in progress, and at this point there are none, only a scaffold.

**For M3-3 (Jest projects):** depends on the upgrade. Add `jest-expo@58` on Jest 30, with no version changes. **Fallback** if SDK 58 isn't `latest` when M3-2 merges: don't wait. Do M3-3 on 57, downgrading `jest` and `@jest/globals` to 29 (ts-jest unchanged), and upgrade to 58 at the end of M3, reversing the downgrade as part of it.

**For M5-1:** set `node` in `eas.json` to match `.nvmrc`.

**Cost of this recommendation:** one SDK upgrade on a near-empty app (the fallback adds a Jest downgrade and its reversal); about two extra dependencies and an ADR for ESLint; one script change for TypeScript.

## Not established

- Whether SDK 58's own template, `expo-doctor` checks and lint defaults differ from 57's. Re-run Q2, Q4 and Q6 as part of the SDK 58 upgrade.
- Whether `expo-doctor` on SDK 57 flags the `jest` version when `jest-expo` isn't installed. Find out in M3-2.
- The exact rule npm uses when two packages provide the same command. Made irrelevant by the explicit path.
- Whether Expo plans ESLint 10 support, and when.
- Install-script approvals: npm flagged `unrs-resolver` and `@parcel/watcher` as not covered by `allowScripts`. Decide in M3-2 and check that CI behaves the same.
- `npm audit` reports 69 vulnerabilities after installing the template. Not triaged here; most are expected to be development tooling. Triage in M3-2 with `npm audit --omit=dev`, and don't run `npm audit fix --force`, which makes breaking changes.

## Revisit when

- `expo`'s `latest` tag moves to 58: upgrade before M3-3, re-running Q2, Q4 and Q6.
- M3-2 merges while 58 is still not `latest`: take the M3-3 fallback.
- `eslint-config-expo` releases with ESLint 10 support: reconsider Q6 the M3-2 ADR.
- ts-jest and typescript-eslint support TS 7: reconsider Q7.

## Reproduce

```bash
# Q1
npm view expo dist-tags

# Q2: from the folder that contains the repo
npx create-expo-app@latest distributip-spike --template default@sdk-57
diff -rq distributip-spike distributip --exclude=node_modules --exclude=.git

# Q3
npm view jest-expo@latest dependencies peerDependencies
npm view jest-expo@next dependencies peerDependencies
npm view ts-jest@latest peerDependencies

# Q4: paste the repo's devDependencies into distributip-spike/package.json first
cd distributip-spike && npm install && npx expo-doctor && npm ls typescript eslint jest

# Q6: in an empty folder with eslint@^10 and eslint-config-expo@~57 installed
cat > eslint.config.mjs <<'EOF'
import expoConfig from "eslint-config-expo/flat.js";
export default [...expoConfig];
EOF
npx eslint src   # src/probe.tsx: one known violation per plugin

# Q7
ls -l node_modules/.bin/tsc
node node_modules/@typescript/native/bin/tsc --version
node -e 'console.log(require("typescript").version)'
```

## Revisions

| Date       | Change                                                                                                                                                                                                                             |
| ---------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 2026-10-10 | First version. Recommended waiting for SDK 58 until 2026-10-24                                                                                                                                                                     |
| 2026-10-11 | New constraint: M3-2 must start 2026-10-11. Scaffold on 57 without `jest-expo`, upgrade to 58 between M3-2 and M3-3, with a fallback. Downgraded the Expo Go point in Q1: it doesn't affect simulator checks or development builds |

## Sources

Registry facts checked 2026-10-10 with `npm view`, and `expo` and `react-native` dist-tags re-checked 2026-10-11: `expo`, `jest-expo` (`latest`, `next`), `ts-jest`, `typescript`, `typescript-eslint`, `eslint`, `eslint-config-expo` (57.0.2, 58.0.4), `eslint-plugin-import`, `eslint-plugin-react`, `eslint-plugin-react-hooks`, `eslint-plugin-expo`, `eslint-plugin-import-x`, `@eslint-react/eslint-plugin`.

- [create-expo-app (Expo docs)](https://docs.expo.dev/more/create-expo/)
- [Expo SDK 58 beta](https://expo.dev/changelog/sdk-58-beta)
- [React Native releases overview](https://reactnative.dev/releases/overview)
- [ESLint version support](https://eslint.org/version-support)
- [Expo maintainer on TypeScript 7 (expo/expo#47627)](https://github.com/expo/expo/issues/47627#issuecomment-4927062552)
- [Node.js release schedule](https://nodejs.org/en/about/previous-releases)
