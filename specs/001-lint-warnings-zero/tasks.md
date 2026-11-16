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
      of each planted, the check fails. 332 → 332 (#27). Planted one per rule
      in a scratch file: each of the thirteen others was reported as an error and
      `check:lint` failed (on `main`'s configuration, each was a warning).
      Core `no-unused-vars`, planted in a `.ts` file and in a script, was not
      reported by itself on either configuration, being off for every file
      (only typescript-eslint's, already an error, caught the `.ts` one), as
      the plan said.
- [x] T002 [US1] The diagram library's small rules, then promote the four:
      `prefer-const` (1, `ngx-reactome-diagram/src/lib/services/roundness.ts`),
      `no-useless-assignment` (1) and `no-unused-expressions` (3, `updateStyle`'s
      ternaries) in `ngx-reactome-diagram/src/lib/diagram/diagram.component.ts`,
      `template/button-has-type` (1, the legend's handle, not in a form, in
      `diagram.component.html`). With them the `@ts-ignore` on the component's
      import of the style library (1 of `ban-ts-comment`'s 22), which suppresses
      nothing (measured). 332 → 325 (#28). `updateStyle`'s ternaries became
      `if`s and the select handler's ids one conditional, neither changing
      what runs; the handle's `type="button"` changes nothing outside a form.
      Seen failing: `main`'s three files, linted under the promoted rules,
      gave six errors (one per warning) and `check:lint` failed.
- [x] T003 [US1] `@angular-eslint/prefer-inject` (8): `DiagramComponent` (4),
      `DiagramService` (2), `DiagramStateService` (2), by Angular's
      `inject-migration`; then promote. The services' constructors take no
      arguments afterwards: a consumer constructing one with `new` (none known)
      would change, said in the pull request. Touches `diagram.service.ts`,
      which `dev_curator` has changed. 325 → 316 (#29): one more than
      planned, the configuration's `any` parameter, now read in the
      constructor straight from `inject` rather than kept in a private field.
      The public `dark` and `dialog` stay public. `dev_curator`'s changes to
      `diagram.service.ts` do not touch its constructor. Seen failing: `main`'s
      three files gave eight `prefer-inject` errors and `check:lint` failed.
- [ ] T004 [US1] The diagram component's inputs, queries and output, by
      Angular's migrations: `prefer-signals` (6: three `@ViewChild`, three
      `@Input`), `prefer-output-emitter-ref` (1, `reactomeEvents$`, through
      `outputFromObservable`), `no-input-rename` (1: `@Input('id') diagramId`
      becomes an input named `id`, so the binding `[id]` is unchanged); then
      promote the three. Template bindings stay as they are; the component's
      fields become signals, a change for any code reading them directly. Waits
      on the curator tool's owner (open question 1). 317 → 309.

## Phase 1b: Bugs from issue #14

The deep review of the diagram library (issue #14) found fifteen bugs and a
smaller list. The user decided on 16 Nov that they are fixed, curator-visible
behaviour changes included where they are the fix; anything beyond the listed
bug is recorded for a decision, not made. Each fix has a unit test seen failing
on the code before it, its failing output in the pull request, which says
"Part of #14"; the issue's boxes are ticked once it merges. Grouped by the
files they touch, one pull request each; they run before T009–T011 (see
"Dependencies"). Paths are under `projects/ngx-reactome-diagram/src/lib/`.

- [x] T017 [Bugs] The URL state, `services/diagram-state.service.ts`, with
      one handler in `diagram/diagram.component.ts`: **#5** a parameter
      removed from the address now resets its state to the default (not while
      the router is blocked, when the address is not the state's), and a write
      merges into the host's query string, removing only the state's own
      parameters and their aliases, and keeps the fragment; **#10** deselecting
      the selected element clears `select`, once the event is handled and
      nothing else is selected (clicking another element deselects first)
      (#TBD).
- [ ] T018 [Bugs] Selection in `diagram/diagram.component.ts`: **#1** data
      selectors quoted and escaped (`[acc="…"]`, `[reactomeId="…"]`; a number
      matched as a number); **#6** a click on an element with no graph data
      leaves `select` as it is; **#7** `stateToDiagram()` in `displayNetwork`
      inside `avoidSideEffect`; **#8** `filter(!_ignore)` before
      `distinctUntilChanged`; **#9** in compare mode a state selection fits the
      view, not the compare pane.
- [ ] T019 [Bugs] How flagging looks, `diagram/diagram.component.ts` (and
      the style library where the classes live): **#2** clearing a flag removes
      the lines' inline underlay and leaves the sub-pathway bands as they were;
      **#12** trivial molecules kept visible by `.trivial.always-visible`, not
      inline opacity; **#13** flagging a reaction type from the legend flags its
      lines too.
- [ ] T020 [Bugs] The component's lifecycle, `diagram/diagram.component.ts`
      and `.html`: **#3** `loadDiagram` drops a response superseded by a later
      request and reports a failed one; **#11** the cytoscape cores (main,
      compare, legend) and the `$dark` subscription torn down on destroy;
      **#14** the component marked for check after `comparing = true`
      (zoneless hosts); `legend2state` waits for a diagram before reading
      `cy`; `CdkDragHandle` imported so only the handle drags the legend.
- [ ] T021 [Bugs] `services/diagram.service.ts`: **#4** a graph node with
      one child keeps its own stId (a homomultimer is not its monomer);
      `getEdgeId`'s counter advances, each repeat taking the next number and
      the first two keeping today's ids (as WebsiteAngular's `uniqueEdgeId`;
      moved here from T014); a compartment's vertical radius from `prop.y`;
      `replacement` stores what its readers expect, not a raw Edge;
      `avoidOverlap`'s gravity keeps sub-pathway labels by their sub-pathways
      (before and after shown in the pull request); `DIAGRAM_CONFIG_TOKEN`
      documented in the library's README. `dev_curator` changes this file's
      element-building code: the pull request keeps its hunks small and lists
      them.
- [ ] T022 [Bugs] `services/dark.service.ts`, **#15**: a stored theme that is
      not valid JSON reads as light (`false`) instead of stopping the service
      (moved here from T005). Whether it stops toggling `body.dark` on the host
      page is decided by how the curator tool relies on it: if removing it would
      change the host's look, it is recorded as a decision, not made.
- [ ] T023 [Cleanup] Issue #14's "Cleanup" list, not part of the bug fixes:
      cores created inside NgZone (change detection every frame), vectorious
      geometry's cost in the transform, `<video>` without `preload="none"` and
      requesting `undefined.mov` without an accession, leftover PSICQUIC code
      forcing `@angular/forms` and `@angular/material` into the peer
      dependencies, dead code (`randomNetwork`, `roundness.ts`,
      `assets/data/*.txt`). To be split when taken up.

## Phase 2: Values typed "anything" (User Story 2, P2)

The five `no-unsafe-*` rules and `no-explicit-any`, with `ban-ts-comment`'s
lines in the style library.

- [ ] T005 [US2] The diagram's services (19):
      `ngx-reactome-diagram/src/lib/services/diagram-state.service.ts` (14: the
      state's `UrlParam<any>` becomes the union of its values),
      `diagram.service.ts` (4: `DIAGRAM_CONFIG_TOKEN` becomes an
      `InjectionToken<DiagramConfig>`, an exported type, said in the pull
      request), `dark.service.ts` (1: the stored theme, `JSON.parse`d, read as
      a boolean; what a value that is not one means is T022's fix). Touches `diagram.service.ts`, which
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
      (2). The edge-id counter is T021's fix, not this task's. Touches
      `diagram.service.ts`, which `dev_curator` has changed; if
      the 23 make too large a diff against it, split by method. 42 → 17.
- [ ] T015 [US3] `no-non-null-assertion` in the diagram component (17: the
      view children's elements (7) and the cytoscape instances (10), mostly in
      the compare view), then promote the rule. 17 → 0.

## Phase 4: Done

- [ ] T016 Confirm `lint-baseline.json` has no warned rules left and every rule
      warned on 16 Nov is an error; bring `eslint.config.js`'s comments up to
      date (its header still describes warned rules); list the silenced lines
      (SC-004) and the bugs found (SC-005) here.

## Dependencies

- T001–T003 first, done. T004 waits on the curator tool's owner and takes
  whichever of T017–T020 have merged into `diagram.component.ts` as they are.
- T017–T022 (issue #14) next, in order, before the typing tasks that touch the
  same code: T017 before T005 (both `diagram-state.service.ts`), T022 before
  T005 (`dark.service.ts`), T018–T020 before T011 (`diagram.component.ts`),
  T021 before T014 (`diagram.service.ts`), and all of them before T009–T011.
- T005–T008 then T009–T011, T012, T013–T015, T016, as numbered. T023 when
  taken up; it blocks nothing.

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
   sent (a behaviour change)? Decided (16 Nov): correct the type to what is
   sent.

## Bugs found on the way

Visible already from the warnings; each is confirmed or dropped by the task
named, and fixed only where it changes nothing a user sees.

- **A third connector with the same ends reuses the second's edge id**
  (`ngx-reactome-diagram/src/lib/services/diagram.service.ts`, `getEdgeId`).
  The count stored is the one before the increment (`count++`), so it never
  rises: every conflict after the first is named " (1)" again, and cytoscape
  refuses a second element with an id, so such a diagram would fail to draw.
  The same code in WebsiteAngular was found in its T017 and kept, none being
  known and drawing it being a change to what readers see. Decided (16 Nov):
  fixed, each repeat taking the next number and the first two keeping
  today's ids, with a test seen failing on the old code; in T021 (issue #14).
- **The exported event type says text where a number is sent**
  (`ngx-reactome-cytoscape-style/src/lib/model/reactome-event.model.ts`): see
  open question 2. Decided (16 Nov): the type follows what is sent
  (`reactomeId` a number, `element` a collection); in T009 and T010.
- **A stored theme that is not JSON stops the diagram's theme service**
  (`ngx-reactome-diagram/src/lib/services/dark.service.ts`): the stored value
  is `JSON.parse`d unguarded, so anything else in `is-dark` throws while the
  service is created. WebsiteAngular's own service now reads only `true` as
  dark (its T013). Decided (16 Nov): a stored value that is not valid JSON
  reads as light (`false`), with a test seen failing on the old code; in T022
  (issue #14, #15).

## Silenced lines

22 today (21 `@ts-expect-error`, 1 `@ts-ignore`), none with a reason; the
target is at most 5 (SC-004), each listed here with its reason.
