# ngx-reactome-base Constitution

These libraries were developed inside reactome/WebsiteAngular and moved here, so
this constitution keeps that project's principles. They are not aspirations:
each one is here because breaking it cost something specific, and the cost is
named so the rule can be argued with rather than merely obeyed. The principles
that only concern the website (stable ids in URLs, the CMS, the curator
documents) stay there.

## Core Principles

### I. Verify the instrument before trusting the measurement

A green check, a passing selector or a count proves nothing until you know what
it points at. In WebsiteAngular a link crawl reporting "186 broken links" was its
own request burst tripping rate limiting (403, not 404), and an element count
read 0 for a page that had rendered correctly. Here, the libraries resolve one
another from `dist/`: a spec or a lint run against a stale build checks what was
built last, not the tree in front of you. That is why CI and preflight build the
libraries before anything else runs.

So: name what a measurement is actually reading. When a number is surprising,
suspect the instrument first.

### II. Measure in the thing, not in your head

Reasoning about behaviour is how you form a hypothesis, never how you confirm
one. In WebsiteAngular, mapping a legacy fragment passed a typecheck and 19 unit
tests, then failed in a browser twice, for two reasons neither of which was
visible from the source.

So: a change to how a diagram draws, or to state a consumer reads, is not done
until it has been observed working, in the demo app or in a consumer.

### III. Prove a test fails before believing it passes

A test written after a fix, and never seen red, describes the fix rather than
guarding it.

So: when a change is a bug fix, show the new test failing against the old
behaviour. When that is impractical, say so in the commit rather than implying
coverage you have not demonstrated.

### IV. A library speaks in its consumers' app

What a library prints, it prints on someone else's console. Debug logging on
every diagram load and state change was removed when these libraries moved
here, and `no-console` is an error in `eslint.config.js`: warnings, errors and
failed assertions are what a library should say there.

The same goes for the public API. WebsiteAngular installs these libraries from
the `dist/*` branches, pinned by its lockfile, and a change to what
`public-api.ts` exports is a change to that app. So: say in the pull request
when an export, an input or an emitted value changes shape.

### V. Comments carry the failure, not the mechanism

Code says what it does. A comment earns its place by recording what went wrong
without it, because that is the part the next reader cannot recover. A comment
that merely narrates the line beneath it is noise, and a comment with an
unverified number in it is worse than none.

So: explain the why and the failure. Any figure in a comment must be one you
measured, and measurable again.

## Quality Gates

Every change passes, locally and in CI:

- `npm run build:libs` — the libraries, in dependency order; ng-packagr compiles
  with `strictTemplates`, so this is also the type check
- `npm run format:check` — Prettier
- `npm run check:lint` — warnings ratcheted against `lint-baseline.json`, never
  upward
- `npm run check:dead` — unreachable code ratcheted against
  `dead-code-baseline.json`
- `npm test` — every project's unit tests
- the demo app builds, and each library packs

`scripts/preflight.sh` runs the lot and is wired into the pre-push hook.
Formatting and lint on staged files run on pre-commit.

Two ratchets, two baselines: a change may lower them and must never raise them.

## Development Workflow

- **`main` is protected.** No direct pushes, administrators included. Every
  change is a pull request with the "Build, lint and test" check green and on an
  up-to-date branch, and with its review conversations resolved. Reviews are not
  required, so the checks are the review.
- **A green `main` is published.** After the tests pass on `main`, each library's
  build is pushed to its `dist/*` branch, which is what consumers install. A
  merge to `main` is a release to them.
- **Keep the job name.** Branch protection requires the check by its name,
  "Build, lint and test". Renaming the job leaves every pull request waiting on a
  check that never reports.
- **Never run concurrent git operations** in this repo. In WebsiteAngular a
  backgrounded commit plus a checkout in the same tree lost the commit to a
  lint-staged git error; the same hooks run here.

## Governance

This constitution supersedes convention, including this codebase's own existing
patterns: where a touched file follows a legacy approach and current framework
practice differs, prefer current practice and say why.

Amendments are made by pull request, and must state which principle changed and
what it cost to learn. A principle with no cost behind it does not belong here.

Complexity must be justified in the PR that introduces it. Scope stays as asked:
finish the whole request, and raise anything beyond it rather than quietly
building it.

**Version**: 1.0.0 | **Ratified**: 2026-10-07 | **Last Amended**: 2026-10-07
