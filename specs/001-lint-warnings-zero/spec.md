# Feature Specification: No lint warnings

**Feature Branch**: `001-lint-warnings-zero` (pull requests branch off `main`)

**Created**: 2026-11-16

**Status**: Draft

**Input**: User description: "Take the libraries' ESLint warnings, ratcheted in
lint-baseline.json (332 on 16 Nov 2026), to zero, and promote each warned rule
to "error" as its count reaches zero, so that no new warning of that kind can
be added. Modelled on reactome/WebsiteAngular's spec 025, which did the same
there. Most no-unsafe-\* warnings come from values typed `any`; the fix is to
give those values real types, not to silence the rule. The published libraries
behave as before, except for bug fixes, each listed. Small pull requests, one
rule or one folder each."

## Why

On 16 November 2026 the linter reports 332 warnings, all in two of the three
libraries. A ratchet (`scripts/check-lint.mjs`) holds each rule's count so it
can only fall, but a warning still allowed is a problem still allowed. Most of
them (234) are values the code treats as "anything": the compiler checks
nothing about them, so a misspelt field, a field that has moved or a call on
something that isn't there passes every check and fails only in a consumer's
app. Another 54 are places where the code asserts that a value is present
instead of handling its absence. WebsiteAngular, which installs these libraries
and where they were developed, has finished the same work (its spec 025): every
rule warned here is an error there.

| Where                                         | Warnings | Files |
| --------------------------------------------- | -------- | ----- |
| `ngx-reactome-cytoscape-style` (the style)    | 202      | 4     |
| `ngx-reactome-diagram` (the diagram)          | 130      | 6     |
| `ngx-reactome-style`, the demo app, the specs | 0        | 0     |

| Kind of warning                                             | Count |
| ----------------------------------------------------------- | ----- |
| A value treated as "anything" (the five no-unsafe-\* rules) | 225   |
| Asserting a value is present (no-non-null-assertion)        | 54    |
| A type check silenced without a reason (ban-ts-comment)     | 22    |
| Angular's signal and inject() migrations (four rules)       | 16    |
| Declaring a value as "anything" (no-explicit-any)           | 9     |
| Four smaller rules, 1 to 3 each                             | 6     |

The rule-by-rule and file-by-file measurement is in [plan.md](plan.md).

## User Scenarios & Testing _(mandatory)_

The users of this work are the people who change these libraries and the
people whose apps install them: WebsiteAngular, and the curator tool. A
consumer sees no difference in behaviour, except where a bug is fixed and
listed, and is told in the pull request when a type it can see changes shape.

### User Story 1 - The small rules can no longer be broken (Priority: P1)

A developer leaves a useless assignment, adds a button without a type, or
injects through a constructor. Today that is a warning the ratchet tolerates as
long as the count doesn't rise; once this story is done, it is an error the
check refuses. Fourteen rules are warned with no violations at all, so for them
this is only a change of severity.

**Why this priority**: the fourteen clean rules and the small ones (23
warnings) are quick, and each one cleared is a rule that is enforced from then
on.

**Independent Test**: after this story, those rules show zero warnings and
each is at "error"; adding one violation of any of them fails the lint check.

**Acceptance Scenarios**:

1. **Given** a rule whose count has reached zero, **When** the lint check runs,
   **Then** it reports that rule at "error" and fails on any new violation.
2. **Given** a fix to one of these warnings, **When** the existing tests run,
   **Then** they all pass, and the libraries behave as before.

---

### User Story 2 - Values have real types (Priority: P2)

A developer reads a field from a cytoscape element's data, an event's target or
the diagram's JSON. Today, in many places, the value is typed as "anything", so
a misspelt or moved field compiles and fails only in a consumer's app. After
this story, those values carry real types (cytoscape's own, the diagram's
models in `projects/ngx-reactome-diagram/src/lib/model`, or narrow readers of
the library's own), and the compiler refuses a field that isn't there.

**Why this priority**: this is most of the warnings (234 unsafe uses and
declarations, and 21 of the 22 silenced type checks) and the most real
protection.

**Independent Test**: for each file or folder cleared, the five no-unsafe-\*
rules and no-explicit-any show zero warnings there, and the tests pass
unchanged.

**Acceptance Scenarios**:

1. **Given** a file cleared of "anything" values, **When** a developer reads a
   field that the type doesn't have, **Then** the build fails.
2. **Given** a type change that reveals the code was reading a field that
   doesn't exist or has a different shape, **When** it is found, **Then** the
   bug is fixed in its own commit, with a test that fails without the fix, and
   called out in the pull request; or, where fixing it changes what users see,
   it is recorded below for a decision and left as it is.

---

### User Story 3 - Absent values are handled, not asserted away (Priority: P3)

A developer reads a value that may be absent. Today, in 54 places, the code
asserts it is present; if it isn't, the failure appears somewhere else, later.
After this story, each place either handles the absence or proves the value
can't be absent.

**Why this priority**: important but less urgent than the "anything" values;
40 of the 54 are in two files of the diagram library, and each needs reading in
context.

**Independent Test**: no-non-null-assertion shows zero warnings and is at
"error"; the tests pass unchanged.

**Acceptance Scenarios**:

1. **Given** a value that can be absent, **When** it is absent, **Then** the
   code does what it did before in the cases that can happen, and a case that
   used to fail obscurely now fails clearly, naming what was missing, or is
   handled.

---

### Edge Cases

- **A library gives no usable type.** Cytoscape's own types leave out some
  style properties and values these libraries use (measured: see plan.md).
  Where no correct type of the library's own can be written, a line may be
  silenced, with a written reason naming the library and the limitation. Each
  such line is listed below and in its pull request.
- **A type reveals a real bug.** The bug is fixed separately from the typing,
  with a test proved by mutation (constitution III), and named in the pull
  request; it is not folded silently into a "lint" change.
- **A fix would change what users see.** It is recorded under "Bugs found on
  the way" for the user to decide, and the code keeps its behaviour.
- **A public type changes shape.** Typing may show that a type the libraries
  export (`public-api.ts`) says something other than what is written: for
  example an event's id declared as text where a number is sent. Changing an
  exported type is a change to its consumers' apps (constitution IV): the pull
  request says so, and where a consumer's code would stop compiling, the change
  waits for a decision.
- **The curator tool's branch.** `dev_curator` belongs to the curator tool's
  owner and is never touched by this work. Every typing pull request widens its
  eventual merge with `main`, so pull requests stay small and name the files
  they touch; those touching a file `dev_curator` has changed say so.
- **Fixtures.** The recorded diagram files under `**/fixtures/*.json` are not
  hand-edited to satisfy the linter (they are not linted).

## Requirements _(mandatory)_

### Functional Requirements

- **FR-001**: The lint warning count MUST reach zero across the repository.
- **FR-002**: Each warned rule MUST be promoted to "error" in the pull request
  that clears its last warning, so that it can't come back. The fourteen rules
  warned with no violations today are promoted in the first pull request.
- **FR-003**: A value typed "anything" MUST be given a real type: a library's
  own published type where one exists (cytoscape's, cytoscape-layers', chroma's,
  Angular's), the diagram's model where the value is the diagram's or graph's
  JSON, or a type of the code's own otherwise. Silencing the rule is not a fix.
- **FR-004**: A line may silence a rule only where a third-party library makes
  a correct type impossible, and only with a written reason on that line.
- **FR-005**: The published libraries' behaviour MUST NOT change, except for a
  bug fix, each one listed below with its pull request. A change to what users
  see is a decision for the user: recorded here, not made.
- **FR-006**: No test is changed to make it pass; the existing unit tests pass
  unchanged. A real bug found on the way MUST be fixed in its own commit, with a
  test that fails without the fix.
- **FR-007**: Each pull request MUST lower the ratchet's per-rule counts to what
  it leaves (`npm run check:lint -- --update`), so that the gains are locked in.
- **FR-008**: Each pull request MUST be small enough to review in one sitting:
  one rule, or one rule in one file or folder, or a few small rules together. It
  names the files it touches.
- **FR-009**: Each pull request branches off `main`, is reviewed, and merges
  only with the "Build, lint and test" check green on an up-to-date branch,
  under the branch protection as it stands: never merged with `--admin`, never
  pushed with `--no-verify`.
- **FR-010**: The `dev_curator` branch MUST NOT be touched.
- **FR-011**: The work stays on Angular 21; no dependency is upgraded for it.
- **FR-012**: This repository MUST NOT depend on WebsiteAngular. Types there
  (its API contract, its Pathway Browser's diagram models, its readers of
  cytoscape element data) may be read as a reference and copied where they fit,
  never imported.

### Key Entities

- **A warned rule**: a lint rule at "warn", with a recorded count that can only
  fall; at zero it becomes an error.
- **An exception**: a single silenced line, with its reason, where a library
  makes a type impossible.
- **A published library**: what CI pushes to a `dist/*` branch after `main`
  passes its tests, and what WebsiteAngular installs. A merge to `main` is a
  release to it.

## Success Criteria _(mandatory)_

### Measurable Outcomes

- **SC-001**: The lint warnings fall from 332 to 0.
- **SC-002**: All 30 rules warned today (16 with warnings, 14 without) are
  errors, so a new violation of any of them fails the check.
- **SC-003**: No test is changed to make it pass, and every test that passed
  before still passes.
- **SC-004**: Silenced lines are few and each one is justified: no more than 5
  across the repository, each with its reason. (Today there are 22
  `@ts-expect-error` and `@ts-ignore` lines, none with a reason.)
- **SC-005**: Every bug found on the way is listed, with the pull request that
  fixed it or the decision it waits for.
- **SC-006**: Every change to an exported type or to the diagram component's
  inputs and outputs is named in its pull request.

## Assumptions

- The rules and their settings stay as they are today; this work clears what
  they report, it doesn't loosen them or add new ones. (WebsiteAngular has two
  rules this configuration lacks, `no-unnecessary-condition` and
  `template/prefer-ngsrc`; adding them is a separate decision.)
- The diagram's and graph's JSON already have types in the diagram library
  (`model/diagram.model.ts`, `model/graph.model.ts`); where one is missing or
  wrong, the type follows what the files contain, measured on the fixtures.
- The demo app (`src/`) is Angular's placeholder and draws no diagram, so a
  change to how a diagram draws is observed in a consumer (constitution II): a
  local checkout of a consuming app with the packed library installed.
- Order: the small rules first (User Story 1), then the "anything" values file
  by file (User Story 2), then the asserted values (User Story 3).
