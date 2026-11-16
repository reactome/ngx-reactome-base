# Implementation Plan: No lint warnings

**Branch**: `001-lint-warnings-zero` | **Date**: 2026-11-16 | **Spec**: [spec.md](spec.md)

## Summary

Clear the 332 ESLint warnings held by `lint-baseline.json`, rule by rule and
file by file, in small pull requests that leave the published libraries
behaving as before. Each rule is promoted from `warn` to `error` in
`eslint.config.js` in the pull request that clears its last warning, and each
pull request lowers the baseline with `npm run check:lint -- --update`. The
model is reactome/WebsiteAngular's spec 025 (879 warnings to 0, finished
16 Nov 2026), whose `eslint.config.js` is the end state here too.

## Technical Context

- **Language**: TypeScript 5.9, Angular 21 (stays on 21). Two of the three
  libraries have warnings:
  - `ngx-reactome-cytoscape-style`: plain TypeScript over cytoscape 3.34
    (which ships its own types), cytoscape-layers and chroma-js.
  - `ngx-reactome-diagram`: an Angular library, a component and three
    services, which fetches a diagram's layout and graph JSON and turns them
    into cytoscape elements styled by the first library, imported from
    `dist/` through its public API.
  - `ngx-reactome-style` (SCSS) and the demo app (Angular's placeholder) have
    none.
- **Linting**: ESLint flat config (`eslint.config.js`). `scripts/check-lint.mjs`
  ratchets the warnings per rule against `lint-baseline.json` and keeps errors
  at zero; when a rule reaches zero it says so, as the cue to promote it.
- **Types to reach for, in order**:
  1. a library's own published types: cytoscape's (`EventObjectNode`,
     `EventObjectEdge`, `NodeSingular`, `ElementsDefinition`, `Css.Node`),
     cytoscape-layers' (`layers(cy)` rather than the untyped `cy.layers()`),
     chroma's, Angular's (`viewChild`, `input`, `inject`);
  2. the diagram library's own models (`model/diagram.model.ts`,
     `model/graph.model.ts`) for the diagram's and graph's JSON;
  3. narrow readers of the library's own for what the code reads from a
     cytoscape element's data (`node.data('width')` is `any` in cytoscape's
     types): text as text, a number as a number, a list as a list, anything
     else as absent;
  4. a single silenced line, with the reason beside it, only where a library
     makes a correct type impossible (spec FR-004).
- **Where WebsiteAngular already solved it** (read, copy where it fits, never
  import: spec FR-012). Its Pathway Browser grew out of the same code:
  `projects/pathway-browser/src/app/diagram/element-data.ts` (readers of
  element data, with their spec), `projects/pathway-browser/src/app/model/`
  (`diagram.model.ts`, `graph.model.ts`: the same JSON), and its API contract
  `projects/contract/` (types only; `reaction-layout.ts` is a reaction's
  layout, close to the diagram's). Its spec 025 tasks T010 (cytoscape event
  handlers and element data) and T013 (a URL state service) are the nearest
  precedents.
- **Testing**: the existing unit tests (`npm test`, Vitest through Angular's
  builder; the diagram's use the built style library, so `npm run build:libs`
  first). There are no end-to-end tests here and the demo app draws no diagram,
  so a change to how a diagram draws is observed in a consumer (constitution
  II): the library packed (`npm pack` in `dist/<lib>`) and installed in a local
  checkout of a consuming app. A bug found on the way gets its own commit and a
  test proved by mutation (constitution III).
- **Gates**: `npm run preflight` on every push (builds, Prettier, the lint and
  dead-code ratchets, unit tests, the demo build, packing); CI runs the same as
  "Build, lint and test", required on `main`.
- **Publishing**: a green `main` is pushed to the `dist/*` branches, which
  WebsiteAngular installs (the style libraries) and the curator tool uses (the
  diagram). Every merge is a release, so every pull request is held to "no
  behaviour change but a listed bug fix".

## Measured on 16 Nov 2026

`npx eslint . --format json` on `main` at f61b771, after `npm run build:libs`:
332 warnings, 0 errors, matching `lint-baseline.json`.

### Rule by library

| Rule                                         | cytoscape-style | diagram | Total   |
| -------------------------------------------- | --------------- | ------- | ------- |
| `@typescript-eslint/no-unsafe-assignment`    | 61              | 14      | 75      |
| `@typescript-eslint/no-non-null-assertion`   | 12              | 42      | 54      |
| `@typescript-eslint/no-unsafe-member-access` | 38              | 16      | 54      |
| `@typescript-eslint/no-unsafe-call`          | 40              | 11      | 51      |
| `@typescript-eslint/no-unsafe-return`        | 16              | 10      | 26      |
| `@typescript-eslint/ban-ts-comment`          | 21              | 1       | 22      |
| `@typescript-eslint/no-unsafe-argument`      | 12              | 7       | 19      |
| `@typescript-eslint/no-explicit-any`         | 2               | 7       | 9       |
| `@angular-eslint/prefer-inject`              | 0               | 8       | 8       |
| `@angular-eslint/prefer-signals`             | 0               | 6       | 6       |
| `@typescript-eslint/no-unused-expressions`   | 0               | 3       | 3       |
| `@angular-eslint/template/button-has-type`   | 0               | 1       | 1       |
| `@angular-eslint/prefer-output-emitter-ref`  | 0               | 1       | 1       |
| `@angular-eslint/no-input-rename`            | 0               | 1       | 1       |
| `no-useless-assignment`                      | 0               | 1       | 1       |
| `prefer-const`                               | 0               | 1       | 1       |
| **Total**                                    | **202**         | **130** | **332** |

`ngx-reactome-style`, the demo app (`src/`) and every spec file: 0.

### By file

| Warnings | File (under `projects/`)                                         | Mostly                                              |
| -------- | ---------------------------------------------------------------- | --------------------------------------------------- |
| 138      | `ngx-reactome-cytoscape-style/src/lib/interactivity.ts`          | unsafe (128): `e.target` in event handlers; 9 `!`   |
| 80       | `ngx-reactome-diagram/src/lib/diagram/diagram.component.ts`      | unsafe/any (46), `!` (17), migrations (12), 5 small |
| 54       | `ngx-reactome-cytoscape-style/src/lib/style.ts`                  | `@ts-expect-error` (19), unsafe (34)                |
| 29       | `ngx-reactome-diagram/src/lib/services/diagram.service.ts`       | `!` (23), the config token's `any` (4), inject (2)  |
| 18       | `ngx-reactome-diagram/src/lib/services/diagram-state.service.ts` | `UrlParam<any>` (14), inject (2), `!` (2)           |
| 7        | `ngx-reactome-cytoscape-style/src/lib/drawer/image-builder.ts`   | element data (4), `!` (2), one `@ts-expect-error`   |
| 3        | `ngx-reactome-cytoscape-style/src/lib/properties-utils.ts`       | `Property<any>`, the mapper's `any` result          |
| 1        | `ngx-reactome-diagram/src/lib/diagram/diagram.component.html`    | a `<button>` with no type                           |
| 1        | `ngx-reactome-diagram/src/lib/services/dark.service.ts`          | `JSON.parse` of the stored theme                    |
| 1        | `ngx-reactome-diagram/src/lib/services/roundness.ts`             | `let` never reassigned                              |

In `interactivity.ts`, the unsafe warnings fall by method: `initHover` 59,
`initSelect` 42, `initClick` 20, the rest (structures, zoom) 7.

### Rules warned with no violations

Fourteen rules are at `warn` in `eslint.config.js` and have nothing to warn
about; they are promoted in the first task, a change of severity alone:
`@typescript-eslint/no-empty-object-type`, `no-namespace`,
`no-require-imports`, `no-wrapper-object-types`, `no-extra-non-null-assertion`,
`prefer-as-const`; `no-useless-escape`, `no-empty-pattern`, `no-unused-vars`;
`@angular-eslint/prefer-standalone`, `no-output-native`, `no-output-rename`,
`use-lifecycle-interface`; `@angular-eslint/template/prefer-control-flow`.
(`no-unused-vars` is switched off for every `.ts` file further down the
configuration, in favour of typescript-eslint's, so its severity reaches no
file; it is promoted as WebsiteAngular did, so the two configurations agree.)

### The silenced type checks

`ban-ts-comment` counts the 22 `@ts-expect-error` and `@ts-ignore` lines, none
with a reason. Removed one at a time and the libraries type-checked
(`tsc -p projects/<lib>/tsconfig.lib.json --noEmit`), they suppress:

- **Nothing**: the `@ts-ignore` on the diagram component's import of the style
  library (`diagram.component.ts`, line 13). It goes.
- **Gaps in cytoscape's style types** (11 in `style.ts`): a compartment's
  `text-margin-x` and `-y` and an edge's `source-text-offset` given as
  `data(...)`, which cytoscape's types allow only for some properties;
  `background-image-smoothing` given one value per layer as one string;
  `corner-radius` given as a number or a function of the node (3);
  `source-arrow-width`, which the types leave out (3); `edge-distances:
  'endpoints'`, a value the types leave out.
- **The image builder's own types** (9): the eight `background-*` properties in
  `style.ts`, whose functions return the builder's `Aggregated` arrays with
  `undefined` in them, and `aggregate`'s keys in `image-builder.ts`, read as
  `Set<K>` from `Object.keys`. Both are this library's types, so typing them
  is the fix.
- **cytoscape-layers on `Core`** (1, `interactivity.ts`): `cy.layers()` is the
  plugin's method, not declared on cytoscape's `Core`; `layers(cy)`, its typed
  entry point, is what `initStructureVideo` already uses.

For the cytoscape gaps the plan is one local type, a `Css.Node`/`Css.Edge`
widened by exactly the properties and values above, which the style sheet is
written against and handed to cytoscape once, at the one point where it is
built. Not a `declare module 'cytoscape'` augmentation: that would ship in the
library's typings and widen cytoscape's types in every consumer's app. If the
one hand-over cannot be typed, it is the one silenced line, with its reason.

### What the `any` values are

- **Element data**: cytoscape types `ele.data(name)` as `any`. Read through
  narrow readers (as WebsiteAngular's `element-data.ts`); what the diagram
  service writes into element data is its model, so the readers can be checked
  against the fixtures' elements (`diagram.service.elements.spec.ts`).
- **Event targets**: cytoscape's `EventObject.target` is `any`; handlers bound
  to node or edge selectors take `EventObjectNode` or `EventObjectEdge`.
- **The diagram component's input**: `displayNetwork(elements: any)` is given
  what `DiagramService.getDiagram` returns, a `cytoscape.ElementsDefinition`.
- **The configuration token**: `InjectionToken<any>` becomes a
  `DiagramConfig` with an optional `diagramUrl`, which is all the service
  reads. The token is exported, so this is a type its consumers see (said in
  the pull request).
- **The URL state**: `State`'s index signature is `UrlParam<any>`; the state's
  values are text, a number, a list of them, a boolean or `null`, which is the
  type.
- **The property mapper**: `propertyMapper`'s mapper returns `any`, so every
  `this.pm(...)` in `style.ts` returns `any`; its result type becomes the
  mapper's.

### Exported types typing may contradict

`ReactomeEventTarget` (exported by the style library, read by WebsiteAngular)
declares `reactomeId: string` and `element: NodeSingular`. The handlers fill
`reactomeId` from element data, which the diagram service writes as a number
(`diagram.model.ts`: `reactomeId: number`), and on an edge's hover give
`element` the edge's connected reaction nodes, a collection. Typing the
handlers will make this visible; the type follows what is written (measure it),
and since changing an exported type can stop a consumer compiling, the change
is named in its pull request and, where it would, waits for a decision
(spec, edge cases).

## Constitution Check

- **I. Verify the instrument**: every count here was measured after
  `npm run build:libs`, as CI does; the diagram's lint reads the style library
  from `dist/`, so each pull request rebuilds before measuring.
- **II. Measure in the thing**: a change to how a diagram draws or to what an
  event carries is observed in a consumer before it merges.
- **III. Prove a test fails before believing it passes**: a typing change that
  alters behaviour is a bug fix and gets a test shown failing without it. A
  pure typing change is shown safe by the build plus the unchanged tests.
- **IV. A library speaks in its consumers' app**: each pull request says when
  an export, an input or an emitted value changes shape (spec SC-006).
- **V. Comments carry the failure, not the mechanism**: each silenced line says
  which library limitation makes it necessary.
- **Quality gates**: the lint and dead-code ratchets may only go down; this
  work only lowers them.

No violations.

## How the work is split

Order follows the spec: small rules first, then "anything" values file by file
(the services and the style library's helpers before the large files that read
them), then non-null assertions. One task is one pull request.

| Task | What                                                                    | Warnings       |
| ---- | ----------------------------------------------------------------------- | -------------- |
| T001 | Promote the 14 rules with no violations                                 | 0              |
| T002 | The diagram's small rules and the needless `@ts-ignore`; promote 4      | 7              |
| T003 | `prefer-inject` in the diagram library; promote                         | 8              |
| T004 | The diagram component's signal inputs, queries and output; promote 3    | 8              |
| T005 | The diagram's services: URL state, configuration token, theme           | 19             |
| T006 | The style library's property helpers and what flows from them           | 41 (with T007) |
| T007 | Element data in `style.ts` and the image builder                        | (with T006)    |
| T008 | The silenced type checks in the style library; promote `ban-ts-comment` | 21             |
| T009 | `interactivity.ts`: `initHover`                                         | 59             |
| T010 | `interactivity.ts`: `initSelect`, `initClick` and the rest              | 69             |
| T011 | `diagram.component.ts`                                                  | 46             |
| T012 | Promote `no-explicit-any` and the five `no-unsafe-*` rules              | 0              |
| T013 | `no-non-null-assertion` in the style library                            | 12             |
| T014 | `no-non-null-assertion` in the diagram's services                       | 25             |
| T015 | `no-non-null-assertion` in the diagram component; promote               | 17             |
| T016 | Done: confirm, list silenced lines and bugs                             | 0              |

The counts are as measured on 16 Nov; a typing change in one file can clear
warnings in another (typing `propertyMapper` clears `style.ts`'s), so each pull
request reports what it measured, and the ratchet keeps any new warning out
meanwhile.

## Working practice

- One task per pull request, from a fresh branch off `origin/main`, with
  `main` merged in before each push; never pushed with `--no-verify`.
- Each pull request lists the rules and counts it lowers, the files it touches
  (and whether `dev_curator` has changed any of them: today it has changed
  `diagram.service.ts`), any silenced line with its reason, any exported type,
  input or output that changes shape, and any bug found, separately.
- Reviewed adversarially before it merges (constitution, development
  workflow), and merged only green under branch protection, never with
  `--admin`.
- `dev_curator` is the curator tool's owner's and is never touched.
