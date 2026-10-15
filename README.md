# Distribu-tip

![Continuous Integration Workflow Status Badge](https://github.com/daemosity/distribu-tip/actions/workflows/ci.yml/badge.svg)

DISCLOSURE: This app is not legally viable as specified. See [Architectural Decisions](#architectural-decisions).

**Distribu-tip** splits a weekly cash tip pool across the employees who worked that week, proportionally to hours, and reports how many $20, $10, $5 and $1 bills are needed to pay everyone with the fewest bills per person.

The app is a calculator and a record, not a payment system. Counting the tips, getting change from the bank, and handing out envelopes all happen outside it.

## Prerequisites

- Node: 26
    - see ./.nvmrc for confirmation
- Expo `57.0.27`
- Emulators/Simulators to test on. Some options:
    - [Android emulator](https://docs.expo.dev/workflow/android-studio-emulator/)
    - [iOS simulator](https://docs.expo.dev/workflow/ios-simulator/)
    - [Expo Go](https://expo.dev/go), a limited sandbox for trying out app development with Expo

## Development Setup

Install dependencies and the `husky` + `lint-staged` pre-commit hooks:

```bash
npm ci
```

### Running the app on an Android phone from WSL 2

Steps 1–5 are one-time. Then see [Every session](#every-session).

Requires:

- Windows 11 22H2+
- Android 11+ phone with [Expo Go](https://expo.dev/go)
- PC and phone on the same Wi-Fi (if guest/campus Wi-Fi: use the [tunnel fallback](#fallback---tunnel))

#### 1. Keep the repo in the Linux filesystem

Clone under `~/` (e.g. `~/.../distribu-tip`), not `/mnt/c/`.

#### 2. Turn on mirrored networking

In `%UserProfile%\.wslconfig`:

```ini
[wsl2]
networkingMode=mirrored
```

Restart WSL (PowerShell):

```powershell
wsl --shutdown
```

Check: `ip addr` in Ubuntu lists your Wi-Fi IP.

#### 3. Open Metro's port in the Hyper-V firewall

Admin PowerShell:

```powershell
New-NetFirewallHyperVRule -Name "Metro" -DisplayName "Metro bundler (Expo)" -Direction Inbound -VMCreatorId '{40E0AC32-46A5-438A-A0B2-2B479E8F2E90}' -Protocol TCP -LocalPorts 8081
```

Check: `Get-NetFirewallHyperVRule -Name "Metro"`. Remove: `Remove-NetFirewallHyperVRule -Name "Metro"`.

#### 4. Install Android platform-tools (`adb`) in WSL

```bash
sudo apt install -y unzip
curl -LO https://dl.google.com/android/repository/platform-tools-latest-linux.zip
unzip platform-tools-latest-linux.zip -d ~/android-sdk
rm platform-tools-latest-linux.zip
echo 'export ANDROID_HOME="$HOME/android-sdk"' >> ~/.bashrc
echo 'export PATH="$ANDROID_HOME/platform-tools:$PATH"' >> ~/.bashrc
source ~/.bashrc
adb version
```

#### 5. Pair the phone over Wi-Fi

1. Phone: **Settings → About phone** → tap **Build number** 7 times.
2. **Developer options → Wireless debugging** → on → **Pair device with pairing code**.
3. Pair with the IP:port from the pairing dialog, then enter the code:

    ```bash
    adb pair <ip>:<pairing-port>
    ```

4. Check:

    ```bash
    adb devices
    ```

    Not listed? Use the IP:port from the main **Wireless debugging** screen:

    ```bash
    adb connect <ip>:<port>
    ```

After a reboot or Wi-Fi change: turn Wireless debugging back on, re-run `adb connect` with the new port. No re-pairing.

#### Every session

```bash
npx expo start
```

Scan the QR code in Expo Go, or press `a`. The URL should be `exp://<Wi-Fi IP>:8081`; if not, recheck step 2.

#### Fallback: `--tunnel`

Use only if LAN fails (slower, public URL):

```bash
npm i -g @expo/ngrok
npx expo start --tunnel
```

## Running Tests

```bash
npm test # Run the full test suite
npm run test:app -- --selectProjects core # run core tests only
npm run test:tooling # run tests of tooling only
npm run test:app -- --selectProjects app-ios # run ios tests only
npm run test:app -- --selectProjects app-android # run android tests only
npm run typecheck # check for type errors
```

**Note:** Tests currently only pass with the above commands.

- `jest` now tests by project type - `core`, `tooling`, `app-ios`, and `app-android`. `core` and `tooling` are set to use ts-jest, while all app related tests now use `jest-expo`'s babel presets.

- `npx jest` by itself fails because running `__tests__/core-boundary.test.ts` requires `NODE_OPTIONS=--experimental-vm-modules` to run. However, running jest with a global `NODE_OPTIONS=--experimental-vm-modules` causes tests using expo's `renderRouter` to fail with the following output when working with actual routes:

```text
Test suite failed to run: Must use import to load ES Module: …/standard-navigation/lib/src/index.js
```

Since the kids won't get along, I've separated them into two different npm scripts:

- `npm run test:tooling`, which runs the tooling project with its much needed node environment
- `npm run test:app`, which runs all app related projects via `npx jest --ignoreProjects tooling` -- essentially ignoring the project that won't get along with the others.
- `npm test` still gets to run the full test suite running `test:tooling` first, then `test:app` afterward, so it gets to stay happy, too.
- **When to revisit:**
    - When Jest ESM support stops being experimental
    - When ESLint loads TS configs without a dynamic import
    - When the boundary test moves to a child process

### Note on ts-jest

This repo was started with `ts-jest` - with it, we GAIN direct access to the TypeScript compiler, allowing the library to read the tsconfig and report type errors in tests, tightening the testing cycle. In comparison, `babel-jest` allows Jest to run against `.ts` files, but it strips the types without checking them.

The trade-off in choosing `ts-jest` is that it runs slower than `babel-jest`, and it is also currently locked to TypeScript 6 (see [ts-jest section](#ts-jests-unique-dependency-configuration)), which means it doesn't have access to TypeScript 7's improvements.

Note: As this application uses `Expo`, `ts-jest` is now used for core and tooling, while the app code runs on Babel via `jest-expo`. This loses the paired "test-and-typecheck" benefits for app code, but `npm run typecheck` is required to pass before any PR merge -- it uses `tsc` from TypeScript 7, and can also be run locally before every commit.

#### ts-jest's unique dependency configuration

This package has two TypeScript versions installed side by side, a necessity for running ts-jest v29 alongside TypeScript 7.

`ts-jest` notes that [Typescript 7.0 doesn't ship with the Javascript Compiler API `ts-jest` needs for its tooling](https://kulshekhar.github.io/ts-jest/docs/next/guides/typescript-7). This is also why both Expo 57 and 58 don't bundle with TypeScript 7 - they're waiting on a public API as well. Taking up `ts-jest`'s suggestion to install TypeScript 7 under an alias, this project includes it under `@typescript/native`, and calls its `tsc` directly in its package's `npm run typecheck` script.

This allows TS7's blazingly fast typecheck during development and CI while still providing TypeScript 6 so this repo's other libraries can still operate with TypeScript support.

## Architectural Decisions

Disclaimer:

The rules that currently govern how tips are distributed appear to conflict with Illinois law. This repo seeks to make sure they are isolated behind a single function so that a fix is contained. See [ADR-001](docs/adr/001-allocation-rule-behind-one-function.md#context).

For decisions that helped shape this repo, see [`docs/adr/README.md`](docs/adr/README.md)
