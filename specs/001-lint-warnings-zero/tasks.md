# Tasks: No lint warnings

**Input**: [spec.md](spec.md), [plan.md](plan.md)

Each task is one pull request, branched off `main`. The pull request that
completes a task ticks it here and adds its number, in that pull request.
Counts are as measured on 16 Nov 2026 (332 warnings); each pull request
reports what it measured, since typing one file can clear warnings in another.
Paths are under `projects/` unless they start with a file at the root.

## Phase 1: The small rules (User Story 1, P1)

- [x] T001 [US1] Promote to `error` the fourteen rules warned with no
      violations, in `eslint.config.js` alone: `@typescript-eslint/no-empty-object-type`,
      `no-namespace`, `no-require-imports`, `no-wrapper-object-types`,
      `no-extra-non-null-assertion`, `prefer-as-const`; `no-useless-escape`,
      `no-empty-pattern`, `no-unused-vars`; `@angular-eslint/prefer-standalone`,
      `no-output-native`, `no-output-rename`, `use-lifecycle-interface`;
      `@angular-eslint/template/prefer-control-flow`. Seen failing: a violation
      of each planted, the check fails. 332 → 332 (#TBD). Planted one per rule
      in a scratch file: each of the thirteen others was reported as an error and
      `check:lint` failed (on `main`'s configuration, each was a warning).
      Core `no-unused-vars`, planted in a `.ts` file and in a script, was not
      reported by itself on either configuration, being off for every file
      (only typescript-eslint's, already an error, caught the `.ts` one), as
      the plan said.
- [ ] T002 [US1] The diagram library's small rules, then promote the four:
      `prefer-const` (1, `ngx-reactome-diagram/src/lib/services/roundness.ts`),
      `no-useless-assignment` (1) and `no-unused-expressions` (3, `updateStyle`'s
      ternaries) in `ngx-reactome-diagram/src/lib/diagram/diagram.component.ts`,
      `template/button-has-type` (1, the legend's handle, not in a form, in
      `diagram.component.html`). With them the `@ts-ignore` on the component's
      import of the style library (1 of `ban-ts-comment`'s 22), which suppresses
      nothing (measured). 332 → 325.
- [ ] T003 [US1] `@angular-eslint/prefer-inject` (8): `DiagramComponent` (4),
      `DiagramService` (2), `DiagramStateService` (2), by Angular's
      `inject-migration`; then promote. The services' constructors take no
      arguments afterwards: a consumer constructing one with `new` (none known)
      would change, said in the pull request. Touches `diagram.service.ts`,
      which `dev_curator` has changed. 325 → 317.
- [ ] T004 [US1] The diagram component's inputs, queries and output, by
      Angular's migrations: `prefer-signals` (6: three `@ViewChild`, three
      `@Input`), `prefer-output-emitter-ref` (1, `reactomeEvents$`, through
      `outputFromObservable`), `no-input-rename` (1: `@Input('id') diagramId`
      becomes an input named `id`, so the binding `[id]` is unchanged); then
      promote the three. Template bindings stay as they are; the component's
      fields become signals, a change for any code reading them directly. Waits
      on the curator tool's owner (open question 1). 317 → 309.

## Phase 2: Values typed "anything" (User Story 2, P2)

The five `no-unsafe-*` rules and `no-explicit-any`, with `ban-ts-comment`'s
lines in the style library.

- [ ] T005 [US2] The diagram's services (19):
      `ngx-reactome-diagram/src/lib/services/diagram-state.service.ts` (14: the
      state's `UrlParam<any>` becomes the union of its values),
      `diagram.service.ts` (4: `DIAGRAM_CONFIG_TOKEN` becomes an
      `InjectionToken<DiagramConfig>`, an exported type, said in the pull
      request), `dark.service.ts` (1: the stored theme, `JSON.parse`d, read as
      a boolean; a stored value that is not one is decided, not changed: see
      "Bugs found on the way"). Touches `diagram.service.ts`, which
      `dev_curator` has changed. 309 → 290.
- [ ] T006 [US2] The style library's property helpers:
      `ngx-reactome-cytoscape-style/src/lib/properties-utils.ts` (3:
      `Property<any>`, and `propertyMapper`'s result typed as its mapper's), and
      the `style.ts` warnings that clears (its `this.pm(...)` returns; about 13,
      measured in the pull request).
- [ ] T007 [US2] Element data in the style library: readers for what
      `ele.data(name)` holds (text, number, list; anything else absent), with a
      spec, used by the rest of `style.ts` and by
      `ngx-reactome-cytoscape-style/src/lib/drawer/image-builder.ts` (4). T006
      and T007 together: 41. 290 → 249.
- [ ] T008 [US2] `ban-ts-comment` in the style library (21), then promote:
      the eleven gaps in cytoscape's style types through one local widened
      `Css` type handed to cytoscape at one point (not a module augmentation,
      which would ship to consumers); the image builder's `Aggregated` and
      `aggregate` typed so the eight `background-*` functions and its own line
      need none; `cy.layers()` as `layers(cy)`. At most one silenced line, with
      its reason. Observed in a consumer: a diagram draws as before. 249 → 228.
- [ ] T009 [US2] `ngx-reactome-cytoscape-style/src/lib/interactivity.ts`,
      `initHover` (59): handlers on node selectors take `EventObjectNode`, on
      edge selectors `EventObjectEdge`; ids read through T007's readers. Brings
      `ReactomeEventTarget`'s declared types against what is sent (open
      question 2). 228 → 169.
- [ ] T010 [US2] `interactivity.ts`, `initSelect` (42), `initClick` (20) and
      the rest (7: the structure video's and molecule's layers, the zoom
      curve). 169 → 100.
- [ ] T011 [US2] `ngx-reactome-diagram/src/lib/diagram/diagram.component.ts`
      (46): `displayNetwork` takes the `cytoscape.ElementsDefinition` that
      `getDiagram` returns; the compare view's `add` and `remove` handlers an
      event on one element; `replacedBy`, which the code treats as an id, a
      number or an object with a `reactomeId`, read as what the diagram service
      writes (measured on the fixtures); the select subscription's ids as the
      readers give them. 100 → 54.
- [ ] T012 [US2] Promote `no-explicit-any` and the five `no-unsafe-*` rules
      to `error` (their counts are zero). Seen failing: an `any` planted in a
      service. 54 warnings left, all `no-non-null-assertion`.

## Phase 3: Asserted values (User Story 3, P3)

- [ ] T013 [US3] `no-non-null-assertion` in the style library (12):
      `interactivity.ts` (9: the graph's container (3), the video layer, a
      video's sources, the zoom curve's ends (4)),
      `drawer/image-builder.ts` (2), `style.ts` (1). 54 → 42.
- [ ] T014 [US3] `no-non-null-assertion` in the diagram's services (25):
      `diagram.service.ts` (23: map look-ups while building elements; a part of
      the diagram that is not there stops the drawing with an error naming it,
      as it stopped it with a `TypeError` before), `diagram-state.service.ts`
      (2). Touches `diagram.service.ts`, which `dev_curator` has changed; if
      the 23 make too large a diff against it, split by method. 42 → 17.
- [ ] T015 [US3] `no-non-null-assertion` in the diagram component (17: the
      view children's elements (7) and the cytoscape instances (10), mostly in
      the compare view), then promote the rule. 17 → 0.

## Phase 4: Done

- [ ] T016 Confirm `lint-baseline.json` has no warned rules left and every rule
      warned on 16 Nov is an error; bring `eslint.config.js`'s comments up to
      date (its header still describes warned rules); list the silenced lines
      (SC-004) and the bugs found (SC-005) here.

## Open questions for the user

1. **The diagram component's signal migration (T004).** Template bindings are
   unchanged, but `diagramId`, `usedbId`, the view children and
   `reactomeEvents$` change from plain fields to signals and an output ref. Is
   there code in the curator tool that reads or sets them directly, rather than
   binding them in a template? Ask the curator tool's owner before T004.
2. **`ReactomeEventTarget`'s types (T009).** It declares `reactomeId: string`
   and `element: NodeSingular`; the handlers send a number and, on an edge's
   hover, a collection. Correct the exported type to what is sent (a change
   WebsiteAngular may need to follow), or keep the type and convert what is
   sent (a behaviour change)?

## Bugs found on the way

Visible already from the warnings; each is confirmed or dropped by the task
named, and fixed only where it changes nothing a user sees.

- **A third connector with the same ends reuses the second's edge id**
  (`ngx-reactome-diagram/src/lib/services/diagram.service.ts`, `getEdgeId`).
  The count stored is the one before the increment (`count++`), so it never
  rises: every conflict after the first is named " (1)" again, and cytoscape
  refuses a second element with an id, so such a diagram would fail to draw.
  The same code in WebsiteAngular was found in its T017 and kept, none being
  known and drawing it being a change to what readers see. To decide; seen in
  T014.
- **The exported event type says text where a number is sent**
  (`ngx-reactome-cytoscape-style/src/lib/model/reactome-event.model.ts`): see
  open question 2. Seen in T009.
- **A stored theme that is not JSON stops the diagram's theme service**
  (`ngx-reactome-diagram/src/lib/services/dark.service.ts`): the stored value
  is `JSON.parse`d unguarded, so anything else in `is-dark` throws while the
  service is created. WebsiteAngular's own service now reads only `true` as
  dark (its T013). To decide in T005: reading anything but `true` or `false` as
  "not set" changes nothing the library itself writes.

## Silenced lines

22 today (21 `@ts-expect-error`, 1 `@ts-ignore`), none with a reason; the
target is at most 5 (SC-004), each listed here with its reason.
