# NgxReactomeBase

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 17.3.6.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The application will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `npm run build` to build the libraries and the demo app, in the order they depend on each other (`npm run build:libs` for the libraries alone). The build artifacts are stored in `dist/`.

## Using the libraries before they are on npm

Each push to `main` that passes its tests publishes the built libraries to
branches of this repository, one per library, with the package at the branch
root. Install one from there:

```json
"ngx-reactome-cytoscape-style": "github:reactome/ngx-reactome-base#dist/ngx-reactome-cytoscape-style",
"ngx-reactome-style": "github:reactome/ngx-reactome-base#dist/ngx-reactome-style",
"ngx-reactome-diagram": "github:reactome/ngx-reactome-base#dist/ngx-reactome-diagram"
```

The lockfile pins the commit; `npm update <name>` moves to the latest build.

## Running unit tests

Run `npm test` to run every project's unit tests with [Vitest](https://vitest.dev) through Angular's unit-test builder, or `ng test <project>` for one. The diagram's tests use the built style library, so run `npm run build:libs` first.

## Checks before merging

`main` only takes pull requests, and only once the "Build, lint and test" check
has passed. It runs the same checks as reactome/WebsiteAngular: the library and
demo builds, Prettier (`npm run format:check`), lint and unreachable code held
to their baselines (`npm run check:lint`, `npm run check:dead`), and the unit
tests.

`npm install` sets up git hooks that run them for you. On commit, Prettier and
lint run on the staged files. On push, `npm run preflight` runs the whole set
the way CI does. `git push --no-verify` skips that.

## Specs

New work is specified with [Spec Kit](https://github.com/github/spec-kit), as in
WebsiteAngular: `/speckit-specify`, `/speckit-plan`, `/speckit-tasks` and
`/speckit-implement` in Claude Code. The project's principles are in
`.specify/memory/constitution.md`.

## Further help

To get more help on the Angular CLI use `ng help` or go check out the [Angular CLI Overview and Command Reference](https://angular.io/cli) page.
