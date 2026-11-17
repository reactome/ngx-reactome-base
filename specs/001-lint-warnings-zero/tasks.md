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
      (#30).
- [x] T018 [Bugs] Selection in `diagram/diagram.component.ts`: **#1** a value
      from the address no longer written into a selector: matched in code by
      `withData` (`diagram/with-data.ts`), since cytoscape does not unescape a
      quoted value either, so no quoting is safe for every value; a database id
      given as text compared as a number, as before; **#6** a click on an
      element with no graph data leaves `select` as it is; **#7**
      `stateToDiagram()` in `displayNetwork` inside `avoidSideEffect`; **#8**
      `filter(!_ignore)` before `distinctUntilChanged`; **#9** in compare mode a
      state selection fits the view, not the compare pane (#31). The library's
      other built selectors take values from the diagram's own data, not the
      address: they are named in T010 and T011.
- [x] T019 [Bugs] How flagging looks, `diagram/diagram.component.ts` (and
      the style library where the classes live): **#2** clearing a flag removes
      the lines' inline underlay and leaves the sub-pathway bands as they were;
      **#12** trivial molecules kept visible by `.trivial.always-visible`, not
      inline opacity; **#13** flagging a reaction type from the legend flags its
      lines too (#32). The bands were hidden on clearing because the zoom
      handler ran inside `cy.batch()`, reading their colour before the restyle
      (seen by moving the call back in: the test fails). Only the component
      changed; the style library already had the rules.
- [x] T020 [Bugs] The component's lifecycle, `diagram/diagram.component.ts`:
      **#3** `loadDiagram` cancels the request a later one (or an emptied id)
      replaces, and a failed load is reported with `console.error`, the diagram
      shown staying (the component has no error output: see "Bugs found on the
      way"); **#11** the cores (main, compare, legend), the `$dark`
      subscription and a load in flight torn down on destroy, and a compare
      pane left by a diagram replaced with one that has none destroyed and no
      longer flagged or selected (cytoscape already destroyed a main core
      replaced in its container); **#14** confirmed in a zoneless test (the
      pane stayed `display: none`), and fixed with `markForCheck()` after
      `comparing` is set; `legend2state` ignores the legend until a diagram is
      drawn, as it did before apart from the error, and `diagram2legend` the
      diagram until the legend is made; `CdkDragHandle` imported, so only the
      handle drags the legend (#33).
- [x] T021 [Bugs] `services/diagram.service.ts`: **#4** a graph node with
      one child keeps its own stId (a homomultimer is not its monomer);
      `getEdgeId`'s counter advances, each repeat taking the next number and
      the first two keeping today's ids (as WebsiteAngular's `uniqueEdgeId`;
      moved here from T014); a compartment's vertical radius from `prop.y`;
      `replacement` stores what its readers expect, not a raw Edge;
      `avoidOverlap`'s gravity keeps sub-pathway labels by their sub-pathways
      (before and after shown in the pull request); `DIAGRAM_CONFIG_TOKEN`
      documented in the library's README. `dev_curator` changes this file's
      element-building code: the pull request keeps its hunks small and lists
      them. Done (#34): an entity's `graph` is its own graph node (TP53
      Tetramer selects as R-HSA-3209194, not TP53's R-HSA-69488), and its
      `acc` is still its only child's accession, so flagging P04637 flags the
      tetramer as before (see "Bugs found on the way"); `uniqueEdgeId` in
      `services/edge-id.ts`; the bottom edge from `prop.y` changes the outer
      corner radius of three of the fixtures' eight compartments, by 2px; a
      reaction's `replacement` is its faded counterpart's id, as an entity's
      is, where it was the raw Edge, which the compare pane could not find;
      `avoidOverlap` runs without gravity, so a label that overlaps none stays
      at its sub-pathway (two of Cell Cycle Checkpoints' three had moved over
      1000px, as the tests draw it) and overlapping labels are still pushed
      apart. 316 → 315: the counter's non-null assertion went with it.
- [x] T022 [Bugs] `services/dark.service.ts`, **#15**: a stored theme that is
      not valid JSON reads as light (`false`) instead of stopping the service
      (moved here from T005). Whether it stops toggling `body.dark` on the host
      page is decided by how the curator tool relies on it: if removing it would
      change the host's look, it is recorded as a decision, not made. Done
      (#35): only a stored `true` reads as dark, as WebsiteAngular's own
      service (its T013); a value that is not JSON, or JSON that is not a
      boolean (`1`, `"true"`, `null`), reads as light, where the first stopped
      the service and the others were kept as they were. The `body.dark` toggle
      is unchanged and recorded for the user (see "Bugs found on the way").
      315 → 314: the parse's unsafe assignment went with it.
- [ ] T023 [Cleanup] Issue #14's "Cleanup" list, not part of the bug fixes:
      cores created inside NgZone (change detection every frame), vectorious
      geometry's cost in the transform, `<video>` without `preload="none"` and
      requesting `undefined.mov` without an accession, leftover PSICQUIC code
      forcing `@angular/forms` and `@angular/material` into the peer
      dependencies, `lodash` a peer dependency the diagram no longer imports
      (since T005), dead code (`randomNetwork`, `roundness.ts`,
      `assets/data/*.txt`). To be split when taken up.
- [x] T024 [Bugs] Two of T020's findings, decided on 16 Nov (see "Bugs found
      on the way"), `diagram/diagram.component.ts`: a diagram that fails to
      load is told to the host by a new output, `loadFailed`
      (`DiagramLoadFailure`, `{ diagramId, status }`, exported; documented in
      the library's README), the `console.error` and the diagram shown kept;
      a legend click before the diagram has loaded sets the flag in the state,
      drawn when the diagram arrives (`displayNetwork` applies the state since
      T018), where it was dropped; only a hover still needs the diagram.
      Purely additive: no other input or output changes. Done (#36). Lint
      314, unchanged; dead code 17, unchanged.
- [x] T025 [Bugs] A stId drawn only inside complexes, decided on 16 Nov (see
      "Bugs found on the way", the homomultimer), `services/diagram.service.ts`
      and `diagram/diagram.component.ts`: each drawn complex's or set's graph
      node carries its `leaves` (the entities at the bottom of its children),
      and `getElements` takes an `R-` token with no element of its own to the
      drawn nodes whose leaves include it (`withLeaf`, `diagram/with-data.ts`),
      as WebsiteAngular's diagram does (`leafIdToParentIds`). So selecting or
      flagging TP53, R-HSA-69488, finds TP53 Tetramer (R-HSA-3209194) and the
      MDM2 complex containing that (R-HSA-6804885) on Cell Cycle Checkpoints;
      a stId drawn on its own selects only itself, as before, even when it is
      also within a drawn complex (p-T68-CHEK2, R-HSA-113825). Accessions are
      unchanged (`?flag=P04637` already found the tetramer). Done (#38). Lint
      314, unchanged; dead code 17, unchanged.

## Phase 2: Values typed "anything" (User Story 2, P2)

The five `no-unsafe-*` rules and `no-explicit-any`, with `ban-ts-comment`'s
lines in the style library.

- [x] T005 [US2] The diagram's services (19):
      `ngx-reactome-diagram/src/lib/services/diagram-state.service.ts` (14: the
      state's `UrlParam<any>` becomes the union of its values),
      `diagram.service.ts` (4: `DIAGRAM_CONFIG_TOKEN` becomes an
      `InjectionToken<DiagramConfig>`, an exported type, said in the pull
      request), ~~`dark.service.ts` (1: the stored theme, `JSON.parse`d, read as
      a boolean; what a value that is not one means is T022's fix)~~ (done in
      T022). Touches `diagram.service.ts`, which `dev_curator` has changed.
      309 → 290, less the one T022 cleared. 314 → 295 (#39): the 17 left
      here, and two non-null assertions on the address's values that the
      typed read no longer needs. Each parameter's type is what it holds:
      `path` is read as a list with numbers, as `flag` is, and
      `flagInteractors` from the address is its text (`"true"`), so they are
      `(string | number)[]` and `boolean | string`, not the `string[]` and
      `boolean` declared; nothing reads either. The read, the defaults and
      the subscribers' observables are tables per parameter, so the compiler
      checks each; two new tests, passing on `main`'s code, hold what is read
      and what is written. `DiagramConfig` (`{ diagramUrl?: string }`) is
      exported beside the token and named in the README. The diagram no longer
      imports lodash, which stays among its peer dependencies (T023). Seen
      failing: `main`'s two files, linted beside them with this
      configuration, gave the 19 warnings and `check:lint` failed.
- [x] T006 [US2] The style library's property helpers:
      `ngx-reactome-cytoscape-style/src/lib/properties-utils.ts` (3:
      `Property<any>`, and `propertyMapper`'s result typed as its mapper's), and
      the `style.ts` warnings that clears (its `this.pm(...)` returns; about 13,
      measured in the pull request). 295 → 262 (#40): 3 in
      `properties-utils.ts` and 30 in `style.ts` (18 assignments, 11 returns,
      1 call). `propertyMapper(properties)(group, key, mapper)` could not be
      typed without an unchecked cast (the value of `Properties[G][K]` is not
      inferable inside it), so it became `mapProperty(property, mapper)`,
      whose result is the mapper's, and `style.ts` passes the property
      (`this.pm(this.properties.global.thickness, …)`); neither is exported
      from the library. `PropertiesType`'s index, `Property<any>`, is
      `Property<unknown>`, reachable through `Style.properties` and
      `UserProperties`: WebsiteAngular reads only named properties and passes
      no `UserProperties`, so nothing there changes. Found on the way, and
      fixed in its own commit with a test seen failing: the stylesheet called
      the not-found colour, a string, as a function (see "Bugs found on the
      way"). Seen failing: `main`'s two files, linted beside them with this
      configuration, gave the 33 warnings and `check:lint` failed.
- [x] T007 [US2] Element data in the style library: readers for what
      `ele.data(name)` holds (text, number, list; anything else absent), with a
      spec, used by the rest of `style.ts` and by
      `ngx-reactome-cytoscape-style/src/lib/drawer/image-builder.ts` (4). T006
      and T007 together: 41. 290 → 249. 262 → 253 (#41): 4 in the image
      builder (`exp`, `width`, `height` and the gradient's argument), 4 in
      `style.ts` (`interactivityOf`'s `cy.scratch`, read as an `Interactivity`
      or nothing; the molecule's corner radius (2); the label colour), and
      the gradient's `exp[0]!`, which the honest type of a node's values no
      longer needs. `element-data.ts` (`textData`, `numberData`, `listData`,
      as WebsiteAngular's, and `expressionData` for a node's analysis values)
      is internal: nothing exported changes. A node's values are numbers,
      none, or `[value, shares]` pairs whose value may be none (a pathway's
      not-found entities, `[undefined, n]`), not the `[number, number]`
      declared. What no writer stores now reads differently: a size written as
      text or missing (a drawn node is not drawn, where its SVG had NaN and
      `undefined` in it; a molecule's corner radius is not applied, where it
      was NaN), `exp` that is not a list (no values), an entry of it that is
      not a value (none). Found on the way, and fixed in its own commit with a
      test seen failing: the label colour threw for a name that is not a
      global colour (see "Bugs found on the way"). Seen failing: `main`'s two
      files, linted beside them with this configuration, gave the 9 warnings
      and `check:lint` failed.
- [x] T008 [US2] `ban-ts-comment` in the style library (21), then promote:
      the eleven gaps in cytoscape's style types through one local widened
      `Css` type handed to cytoscape at one point (not a module augmentation,
      which would ship to consumers); the image builder's `Aggregated` and
      `aggregate` typed so the eight `background-*` functions and its own line
      need none; `cy.layers()` as `layers(cy)`. At most one silenced line, with
      its reason. Observed in a consumer: a diagram draws as before. 249 → 228.
      253 → 230 (#42): the 21 `ban-ts-comment`, and `cy.layers()`'s
      `no-unsafe-call` and `no-unsafe-assignment`; `ban-ts-comment` promoted.
      The widened type (`NodeCss`, `EdgeCss` and `Rule` in `style.ts`,
      internal) has two more gaps than the eleven, each hidden behind the
      first error in its rule: `target-arrow-width`, beside each
      `source-arrow-width`, and `segment-radius` (cytoscape's other name for
      `segment-radii`). Its hand-over is `getStyleSheet`'s
      `rules as cytoscape.StylesheetCSS[]`, the one unchecked assertion (see
      "Silenced lines"); `getStyleSheet` still returns cytoscape's type. A
      layer is now one value of each background property (`Layer`), and
      `aggregate` builds every property's list by name, so the eight
      functions return cytoscape's list types; their fallbacks (`|| '100%'`
      and the like) went, a list being never falsy. `layers(cy)` is the
      function the plugin registers as `cy.layers`. Seen unchanged: for the
      three fixture diagrams, the stylesheet, `cy.style().json()` and every
      element's computed `ele.style()` (565 properties), plain, hovered,
      flagged and selected, and with analysis values, were byte-identical on
      `main` and on this branch; the library's `.d.ts` is identical too.
      Seen failing: `main`'s three files, linted beside them with this
      configuration, gave 21 `ban-ts-comment` errors and `check:lint` failed.
- [x] T009 [US2] `ngx-reactome-cytoscape-style/src/lib/interactivity.ts`,
      `initHover` (59): handlers on node selectors take `EventObjectNode`, on
      edge selectors `EventObjectEdge`; ids read through T007's readers. Brings
      `ReactomeEventTarget`'s declared types against what is sent (open
      question 2). 228 → 169. (#TBD) Measured 230 → 171: `no-unsafe-*` only
      (argument 4, assignment 17, call 18, member access 18, return 2); no
      rule reaches zero. `ReactomeEventTarget` (exported) now declares
      `reactomeId: number | undefined` (the diagrams store numbers; the
      legend's elements have none) and `element: cytoscape.NodeCollection`
      (a reaction's line sends `connectedNodes('.reaction')`); the diagram
      component's two reads and three specs follow it. In `initHover` only,
      T010's `#${…}` selectors became `getElementById` (a modification's
      `nodeId`, an interactor line's id). Seen unchanged: on the three fixture
      diagrams plus hand-made interactor lines, hovering and leaving every
      element (938) emitted the same 1,720 events (type, detail type,
      `reactomeId`, element ids, `cy`) and left the same classes and computed
      styles on `main`'s build and this branch's, except the one intended
      difference: an interactor line whose id is not a valid selector
      (`CHEBI:15377-…`, `X (1)-…`) is now highlighted, where `main` warned
      "The selector … is invalid" and highlighted nothing. Seen failing:
      `main`'s `interactivity.ts` linted beside it gave 59 more warnings and
      `check:lint` failed. WebsiteAngular, type-checked (`check:types`)
      against this build, fails on one line, `diagram.component.ts`'s
      `legend2state` (`element.id()`, not declared on a collection), and
      passes with `element[0]?.id()`, which is what `id()` reads at run time.
- [ ] T010 [US2] `interactivity.ts`, `initSelect` (42), `initClick` (20) and the
      rest (7: the structure video's and molecule's layers, the zoom curve). 169
      → 100. The `#${…}` selectors built from element data, here and in
      `initHover` (`nodeId`, an interactor edge's `id`), become
      `getElementById`: an id with a space or bracket in it, such as a repeated
      edge's " (1)", is an invalid selector, and `cy.edges()` given one finds
      nothing (measured), so such an element is never highlighted (found in
      T018).
- [ ] T011 [US2] `ngx-reactome-diagram/src/lib/diagram/diagram.component.ts`
      (46): `displayNetwork` takes the `cytoscape.ElementsDefinition` that
      `getDiagram` returns; the compare view's `add` and `remove` handlers an
      event on one element; `replacedBy`, which the code treats as an id, a
      number or an object with a `reactomeId`, read as what the diagram service
      writes (measured on the fixtures); the select subscription's ids as the
      readers give them. 100 → 54. `[reactionId=${replacedBy}]` goes through
      `withData` once `replacedBy` is typed (found in T018). Since T021 the
      service writes no object there (a reaction's `replacement` was a raw
      Edge), so the object branch is no longer reached.
- [ ] T012 [US2] Promote `no-explicit-any` and the five `no-unsafe-*` rules
      to `error` (their counts are zero). Seen failing: an `any` planted in a
      service. 54 warnings left, all `no-non-null-assertion`.

## Phase 3: Asserted values (User Story 3, P3)

- [ ] T013 [US3] `no-non-null-assertion` in the style library (12):
      `interactivity.ts` (9: the graph's container (3), the video layer, a
      video's sources, the zoom curve's ends (4)),
      `drawer/image-builder.ts` (2), `style.ts` (1). 54 → 42.
- [ ] T014 [US3] `no-non-null-assertion` in the diagram's services (24):
      `diagram.service.ts` (22: map look-ups while building elements; a part of
      the diagram that is not there stops the drawing with an error naming it,
      as it stopped it with a `TypeError` before), `diagram-state.service.ts`
      (2). The edge-id counter's assertion went with T021's fix, so this
      phase's counts are one lower than written. Touches
      `diagram.service.ts`, which `dev_curator` has changed; if
      the 22 make too large a diff against it, split by method. 42 → 17.
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
  whichever of T017–T020 and T024 have merged into `diagram.component.ts` as
  they are (T024's `loadFailed` is already an `output()`).
- T017–T022 (issue #14) next, in order, before the typing tasks that touch the
  same code: T017 before T005 (both `diagram-state.service.ts`), T022 before
  T005 (`dark.service.ts`), T018–T020 and T024 before T011
  (`diagram.component.ts`), T021 and T025 before T014 (`diagram.service.ts`),
  T025 before T011, and all of them before T009–T011.
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
   sent. Done in T009 (#TBD).

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
  Fixed in T021 (#34): a third connector with the same ends is now " (2)".
- **The exported event type says text where a number is sent**
  (`ngx-reactome-cytoscape-style/src/lib/model/reactome-event.model.ts`): see
  open question 2. Decided (16 Nov): the type follows what is sent
  (`reactomeId` a number, `element` a collection); in T009 and T010. The
  type corrected in T009 (#TBD); what `initSelect` and `initClick` send is
  read through the readers in T010.
- **Hovering an interactor whose id is not a valid CSS selector throws**
  (`interactivity.ts`, `initStructureVideo`'s handler, for `node.Protein`):
  it finds the node's video with `` querySelector(`#video-${id}`) ``, and jsdom
  threw "Invalid selector" for a hand-made interactor node of class
  `Protein` with an accession containing a colon. WebsiteAngular names an
  interactor's node `interactor-<accession>`. Found in T009, not yet
  measured in a browser or on a real interactor; for T010 to confirm or drop.
- **A stored theme that is not JSON stops the diagram's theme service**
  (`ngx-reactome-diagram/src/lib/services/dark.service.ts`): the stored value
  is `JSON.parse`d unguarded, so anything else in `is-dark` throws while the
  service is created. WebsiteAngular's own service now reads only `true` as
  dark (its T013). Decided (16 Nov): a stored value that is not valid JSON
  reads as light (`false`), with a test seen failing on the old code; in T022
  (issue #14, #15). Fixed in T022 (#35): only a stored `true` is dark.
- **The diagram's dark-mode switch themes the host's whole page**
  (`ngx-reactome-diagram/src/lib/services/dark.service.ts`, `isDark`'s
  setter): it adds or removes `dark` on the host page's `<body>`, and writes
  the host's `is-dark` key in local storage. The diagram itself does not need
  either: its own colours follow `[class.dark]` on its container
  (`diagram.component.html`), and its cores restyle on `$dark`. What reads
  `body.dark`: in these libraries, `ngx-reactome-style`'s `theme` mixin, whose
  default dark selector is `body.dark` (a host that includes it, as
  WebsiteAngular does, turns its whole page's Material theme dark), and
  `ngx-reactome-cytoscape-style`'s `configure-diagrams` mixin, whose `.dark`
  rules (molecule images inverted) match under any `.dark` ancestor, the body
  included. In the curator tool (`reactome/curator-tool-frontend`, its main
  branch, 16 Nov): nothing. It uses neither mixin, has no `.dark` selector,
  and sets its own light Material theme; it sets `diagram.dark.isDark = false`
  on each load and has a `toggleDarkMode` action that flips it, so today that
  action also puts `dark` on its body, which none of its styles read.
  WebsiteAngular does not use this library's diagram (it has its own
  `DarkService`, which also sets `body.dark`, on purpose, for its page). So
  stopping the toggle, or moving it to the diagram's container, would change
  nothing the curator tool's sources style, but would change the page of any
  host that includes `ngx-reactome-style`'s theme with its default selector.
  Kept as it is in T022. Decided (16 Nov): keep it as it is. Nothing known is
  harmed, and removing it could surprise a host that uses `ngx-reactome-style`'s
  theme mixin with its default selector.
- **A flag or selection by a number never matches an accession made of
  digits** (`ngx-reactome-diagram/src/lib/diagram/diagram.component.ts`,
  `getElements`): the state reads `?flag=30616` as the number 30616, and an
  element's `acc` is the graph's identifier, text (`"30616"` for a ChEBI
  molecule), so the two never compare equal, before T018 and after. To
  decide: matching a number against an accession's text would make such
  flags start working, a change beyond issue #14's bug 1. Found in T018.
- **A diagram that fails to load reaches the host only on the console**
  (`ngx-reactome-diagram/src/lib/diagram/diagram.component.ts`,
  `loadDiagram`). Before T020 the failure was unhandled, an uncaught error;
  the component has no output or state for problems, so T020 reports it with
  `console.error` and keeps the diagram shown. Found in T020. Decided (16
  Nov) and done (#36, T024): a new output, `loadFailed`, emits
  `{ diagramId, status }` (the HTTP status, 0 for a network error or one that
  is not HTTP's); the `console.error` and the diagram shown stay.
- **A legend click before the diagram has loaded does nothing**
  (`diagram.component.ts`, `legend2state`). It threw before T020, and now is
  ignored, which is what a user saw before. Found in T020. Decided (16 Nov)
  and done (#36, T024): it sets the flag in the state, as a click after the
  load does, and the diagram draws it when it arrives; a hover before then
  still marks nothing.
- **A homomultimer still carries its monomer's accession**
  (`ngx-reactome-diagram/src/lib/services/diagram.service.ts`, the entity
  nodes' `acc`). T021 gave it its own stId (bug 4), but kept `acc` as its only
  child's (TP53 Tetramer's is P04637), so `?flag=P04637` flags the tetramer,
  as before. Its own graph node has no accession, so taking it from there
  would stop that. The monomer's stId, though, no longer finds the tetramer
  (`?select=R-HSA-69488` selects only TP53 where it is drawn on its own),
  being bug 4 itself. Found in T021. Decided (16 Nov): yes, selecting a
  monomer's stId highlights the complexes containing it, as WebsiteAngular's
  diagram does. Done in T025 (#38): `?select=R-HSA-69488` selects TP53
  Tetramer and the MDM2 complex containing it.
- **A reaction's counterpart in the compare pane is found without its lines**
  (`diagram.component.ts`, `compareBackgroundSync`). Since T021 a reaction's
  `replacement` is its faded counterpart's id, so hovering or selecting it
  marks that reaction in the other pane, where it marked nothing. A
  connector's `replacement` is a number, which also brings the reaction's
  lines (`[reactionId=…]`); a reaction's id as text does not. Found in T021.
  Decided (16 Nov): leave it as it is unless curators ask.

- **An interactor without expression values had a stylesheet colour that
  threw** (`ngx-reactome-cytoscape-style/src/lib/style.ts`, the rule
  `node.InteractorOccurrences[?exp]`): its fallback called the not-found
  colour, a string, as a function. The selector keeps such an interactor from
  reaching it, so no user saw it. Found in T006 and fixed there (#40), with a
  test seen failing on the old code.
- **A label colour that names no global colour threw**
  (`ngx-reactome-cytoscape-style/src/lib/style.ts`, the rule
  `[?labelColor]`): the name was looked up among the global properties and
  what was found passed to `extract`, which threw on nothing, when cytoscape
  styled the element. Now only a global colour is applied; for any other
  value the label keeps the colour of the rules before it. Nothing in these
  libraries or in WebsiteAngular sets `labelColor`, so no diagram drawn
  today changes. Found in T007 and fixed there (#41), with a test seen
  failing on the old code.

## Silenced lines

22 today (21 `@ts-expect-error`, 1 `@ts-ignore`), none with a reason; the
target is at most 5 (SC-004), each listed here with its reason.

- **None silenced since T008 (#42)**: every `@ts-expect-error` and
  `@ts-ignore` is gone, and `ban-ts-comment` is an error.
- **One unchecked type assertion**, `ngx-reactome-cytoscape-style/src/lib/style.ts`,
  `getStyleSheet`: `rules as cytoscape.StylesheetCSS[]`. cytoscape's style
  types (3.34) leave out values cytoscape takes and the stylesheet gives
  (`data(...)` on a label's margins and offset, one smoothing string for every
  layer, a numeric `corner-radius`, the arrows' widths, `segment-radius`,
  `edge-distances: 'endpoints'`), so the rules are written against cytoscape's
  types widened by those alone and handed over here, once. Augmenting
  cytoscape's module instead would ship in the library's typings.
