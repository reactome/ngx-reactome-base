#!/usr/bin/env bash
#
# Run what CI runs, the way CI runs it, before pushing.
#
# The same gate as reactome/WebsiteAngular's preflight, where these libraries
# were developed, less what only the website has (the end-to-end suite and the
# render service). `main` only takes a pull request whose "Build, lint and test"
# check is green, so a failure here is a failure there -- found before the push
# rather than after the email.
#
# It runs on the Node in `.nvmrc`, selecting it itself -- see
# `scripts/select-node.sh`, and note that you do not need to `nvm use` first. The
# lockfile check is the step that makes this matter: npm 11 records optional
# platform packages that npm 10 leaves out, so on an older Node it reports a
# desync CI will not see and misses one CI would.
#
#   npm run preflight          # everything
#   npm run preflight -- fast  # skip the demo app build and the pack
#
# It is wired to pre-push. `git push --no-verify` skips it when you need it to.
set -uo pipefail

cd "$(dirname "$0")/.."

. scripts/select-node.sh || exit 1

mode=${1:-full}
failed=()

# The demo app builds into a scratch directory, removed however this ends: a
# hook is not an interactive shell, so Ctrl-C does not reach cleanup otherwise.
scratch=()
cleanup() {
  [ ${#scratch[@]} -gt 0 ] && rm -rf -- "${scratch[@]}"
}
trap cleanup EXIT
trap 'exit 130' INT
trap 'exit 143' TERM

step() {
  local name=$1; shift
  printf '  %-34s ' "$name"
  if output=$("$@" 2>&1); then
    echo "ok"
  else
    echo "FAILED"
    failed+=("$name")
    printf '%s\n' "$output" | tail -12 | sed 's/^/      /'
  fi
}

pack() {
  local lib
  for lib in ngx-reactome-cytoscape-style ngx-reactome-style ngx-reactome-diagram; do
    (cd "dist/$lib" && npm pack --dry-run) || return 1
  done
}

echo
echo "Preflight"

# `npm ci` is the only thing that compares the lockfile against package.json; a
# desynced lock is invisible to `npm ls` and fatal in CI.
step "lockfile in sync (npm ci)" npm ci --dry-run --no-audit --no-fund
# ...and that it did not quietly re-resolve the tree, which the step above
# cannot see: a wholesale regeneration satisfies package.json perfectly.
step "lockfile drift" npm run check:lockfile
step "format" npm run format:check
# Lint, dead code, the tests and the demo app all resolve the libraries from
# dist/, so without this they check whatever was built there last -- which may
# not be this tree -- while CI builds them fresh. The library build is also the
# type check: ng-packagr compiles with strictTemplates.
step "libraries" npm run build:libs
step "lint" npm run check:lint
step "dead code" npm run check:dead
step "unit tests" npm test

if [ "$mode" != "fast" ]; then
  if app_build=$(mktemp -d) && [ -n "$app_build" ]; then
    scratch+=("$app_build")
    step "demo app build" npx ng build ngx-reactome-base --output-path "$app_build"
  else
    printf '  %-34s FAILED\n' "demo app build"
    echo "      could not make a directory to build into"
    failed+=("demo app build")
  fi
  step "pack the libraries" pack
fi

echo
if [ ${#failed[@]} -eq 0 ]; then
  echo "  All clear. CI should agree."
  echo
  exit 0
fi
echo "  ${#failed[@]} failed: ${failed[*]}"
echo "  Fix these rather than pushing and reading the email."
echo
exit 1
