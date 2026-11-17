// @ts-check
/**
 * Lint configuration, the same as reactome/WebsiteAngular's, where these
 * libraries were developed.
 *
 *   error  - rules that catch bugs, or that the code is already clean of. A
 *            violation fails the build.
 *   warn   - the rest: style, and rules with too many existing violations to
 *            fix at once (mostly `any` flowing through the code). They are
 *            counted against lint-baseline.json by scripts/check-lint.mjs,
 *            which fails when a count goes up, so they only shrink.
 *
 * The Angular migrations WebsiteAngular has completed -- inject(), signal
 * inputs and queries, output() -- are warnings here until this code makes them.
 */
const eslint = require('@eslint/js');
const tseslint = require('typescript-eslint');
const angular = require('angular-eslint');

module.exports = tseslint.config(
  {
    // Generated, vendored, or build output: nothing to say about it.
    ignores: [
      '**/dist/**',
      '**/node_modules/**',
      '**/.angular/**',
      '**/out-tsc/**',
      '**/coverage/**',
      '**/*.d.ts',
    ],
  },
  {
    files: ['**/*.ts'],
    languageOptions: {
      parserOptions: {
        // projectService rather than a fixed `project` list: this is a
        // multi-project workspace, and pointing at tsconfig.app.json alone left
        // 178 files -- every library, every spec -- unparseable and therefore
        // unlinted.
        projectService: true,
        tsconfigRootDir: __dirname,
      },
    },
    extends: [
      eslint.configs.recommended,
      ...tseslint.configs.recommended,
      ...angular.configs.tsRecommended,
    ],
    processor: angular.processInlineTemplates,
    // Severity here means one thing: whether the codebase is already clean of
    // it. Rules with no existing violations stay errors, so a new one fails the
    // build immediately. Rules that already have violations are warnings,
    // counted against a baseline by scripts/check-lint.mjs so they can only go
    // down. Fix a rule's last violation and it should be promoted to error.
    rules: {
      // Already clean -- left as errors by the recommended sets.
      'no-empty': ['error', { allowEmptyCatch: true }],

      // Now clean, so promoted to error: a promise nobody handles swallows its
      // own failure, which is how a broken request renders an empty page with a
      // clean console. All 58 were dealt with, so a new one is a regression.
      '@typescript-eslint/no-floating-promises': 'error',
      '@typescript-eslint/no-misused-promises': 'error',
      // TypeScript's noUnusedLocals/noUnusedParameters cover the app and the
      // libraries; this covers what no tsconfig does (specs, e2e, scripts).
      '@typescript-eslint/no-unused-vars': [
        'error',
        { argsIgnorePattern: '^_', varsIgnorePattern: '^_', caughtErrors: 'none' },
      ],
      // Published libraries print to their consumers' consoles. Debug logging
      // on every diagram load and state change was removed; warnings and
      // errors (and failed assertions on the data) are what a library should
      // say there.
      'no-console': ['error', { allow: ['warn', 'error', 'assert'] }],
      // A value asserted present rather than checked: each was narrowed, or
      // made to fail with a message naming what was missing (spec 001
      // T013-T015), so a new one is a new mistake.
      '@typescript-eslint/no-non-null-assertion': 'error',
      // `any` declared, or flowing through the code: diagram data or an event
      // read as any, then passed, returned or dereferenced as if its shape were
      // known. All were typed (spec 001 T005-T011), so a new one is a new
      // mistake.
      '@typescript-eslint/no-explicit-any': 'error',
      '@typescript-eslint/no-unsafe-assignment': 'error',
      '@typescript-eslint/no-unsafe-member-access': 'error',
      '@typescript-eslint/no-unsafe-call': 'error',
      '@typescript-eslint/no-unsafe-return': 'error',
      '@typescript-eslint/no-unsafe-argument': 'error',
      // Migrated in full with ng generate @angular/core:inject-migration (spec
      // 001 T003), so any new constructor injection is a step backwards.
      '@angular-eslint/prefer-inject': 'error',
      // Migrated in full (signal inputs, outputs and queries, by Angular's own
      // migrations, and every signal field readonly), so a decorator input or
      // a reassignable signal field is new.
      '@angular-eslint/prefer-signals': 'warn',
      '@angular-eslint/prefer-output-emitter-ref': 'warn',
      // Every deprecated API the code called has been replaced, so any use of
      // one is new. Deprecated is how Angular, and the libraries, say what the
      // next major version removes.
      '@typescript-eslint/no-deprecated': 'error',
      // A thrown string has no stack, and Angular does not wait for an async
      // lifecycle hook, so its errors escape. The code has neither.
      '@typescript-eslint/only-throw-error': 'error',
      '@typescript-eslint/prefer-promise-reject-errors': 'error',
      '@typescript-eslint/await-thenable': 'error',
      // `a && a.b` guards one thing and says it twice; the rule rewrites only
      // where the result cannot change, and each of the rest was checked by hand.
      '@typescript-eslint/prefer-optional-chain': 'error',
      // An object in a template literal becomes "[object Object]", an array
      // "a,b" -- which is how a two-species filter put "9606,10090" into the
      // PDF report's address and got a 404.
      '@typescript-eslint/restrict-template-expressions': 'error',
      // A switch over a union with no default that misses a member. A default
      // branch counts as handling the rest: that is its job.
      '@typescript-eslint/switch-exhaustiveness-check': [
        'error',
        { considerDefaultExhaustiveForUnions: true },
      ],
      '@angular-eslint/no-async-lifecycle-method': 'error',
      '@angular-eslint/no-input-rename': 'warn',
      // All twelve removed, so a new empty hook is a new mistake.
      '@angular-eslint/no-empty-lifecycle-method': 'error',
      // All 22 silenced type checks removed (spec 001 T002, T008): cytoscape's
      // style gaps are one widened type handed over in getStyleSheet, so a new
      // @ts-expect-error or @ts-ignore is a new hole in the type check.
      '@typescript-eslint/ban-ts-comment': 'error',
      // Clean, and warned only because they were never promoted: the ratchet
      // held them at zero, but a new one showed in an editor and in the
      // pre-commit lint as a warning, which is read as allowed. Errors now
      // (spec 001 T001). Core no-unused-vars is switched off for every file
      // further down in favour of typescript-eslint's, so its severity reaches
      // nothing; it matches WebsiteAngular's.
      '@typescript-eslint/no-empty-object-type': 'error',
      '@typescript-eslint/no-namespace': 'error',
      '@typescript-eslint/no-require-imports': 'error',
      'no-useless-escape': 'error',
      '@angular-eslint/prefer-standalone': 'error',
      '@angular-eslint/no-output-native': 'error',
      '@angular-eslint/use-lifecycle-interface': 'error',
      '@typescript-eslint/no-wrapper-object-types': 'error',
      '@typescript-eslint/no-extra-non-null-assertion': 'error',
      '@typescript-eslint/prefer-as-const': 'error',
      '@angular-eslint/no-output-rename': 'error',
      'no-unused-vars': 'error',
      'no-empty-pattern': 'error',
      // The last ones went in spec 001 T002: a ternary used as a statement for
      // its side effect (the diagram's updateStyle), a value assigned and then
      // overwritten unread, a let never reassigned.
      '@typescript-eslint/no-unused-expressions': 'error',
      'no-useless-assignment': 'error',
      'prefer-const': 'error',
    },
  },
  {
    files: ['**/*.html'],
    extends: [...angular.configs.templateRecommended],
    rules: {
      // All nine were same-type comparisons, so `===` was a no-op change; a new
      // `==` is a new chance of coercion.
      '@angular-eslint/template/eqeqeq': 'error',
      // Catches `!(value | async)`, which is truthy while the observable is
      // still pending. The four there were meant exactly that, and now say so:
      // `(value | async) !== true`. (The rule's own `=== false` would not be the
      // same -- it is false while pending.)
      '@angular-eslint/template/no-negated-async': 'error',
      // Clean (no *ngIf, *ngFor or *ngSwitch left), so an error (spec 001 T001).
      '@angular-eslint/template/prefer-control-flow': 'error',
      // A <button> with no type submits the form it is in. The one here (the
      // legend's handle) is in none, so saying `type="button"` changed nothing;
      // a new one has to say what it does (spec 001 T002).
      '@angular-eslint/template/button-has-type': 'error',
    },
  },
  {
    // Specs are type-checked with the configs that load Vitest's globals.
    // The project service picks the nearest tsconfig.json, which does not, so
    // expect() and vi were `any` and every new test added warnings.
    files: ['**/*.spec.ts'],
    languageOptions: {
      parserOptions: {
        projectService: false,
        project: ['./tsconfig.spec.json', './projects/*/tsconfig.spec.json'],
        tsconfigRootDir: __dirname,
      },
    },
  },
  {
    // Specs and tooling scripts: looser, and not held to the app's rules about
    // awaiting promises.
    files: ['**/*.spec.ts', 'scripts/**/*.{js,mjs}'],
    rules: {
      '@typescript-eslint/no-floating-promises': 'off',
      '@typescript-eslint/no-misused-promises': 'off',
      'no-undef': 'off',
      // Core no-unused-vars does not understand TypeScript -- it counted type
      // positions and parameter properties as unused and produced 526 spurious
      // warnings, a third of the entire baseline. typescript-eslint's version
      // handles those, and is already on.
      'no-unused-vars': 'off',
    },
  },
  {
    // Same reason, everywhere: keep only the TypeScript-aware rule.
    files: ['**/*.ts'],
    rules: { 'no-unused-vars': 'off' },
  }
);
