// Still here on purpose (#58). eslint-plugin-expo >=1.2.1 ships its own types,
// but they type `rules` with typescript-eslint's RuleModule, which ESLint 10's
// Plugin type rejects: https://github.com/typescript-eslint/typescript-eslint/issues/11543
//
// To check whether this file can go: delete it and run `npm run typecheck`.
// If that passes, confirm the shipped types are the ones in use by adding this
// to eslint.config.mts. It should fail and list the plugin's real rule names:
//   const probe: keyof NonNullable<typeof eslintExpo.rules> = "not-a-rule";
// Remove the probe afterwards (it can join the others upstate).

declare module "eslint-plugin-expo" {
    import type { ESLint } from "eslint";
    const plugin: ESLint.Plugin;
    export default plugin;
}
