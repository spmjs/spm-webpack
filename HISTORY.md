# History

---

## 0.3.5

- fix: error when pass entry file

## 0.3.4

- fix: main file entry don't work if have `./` prefix
- feat: support custom loader
- feat: optmize error output

## 0.3.3

- feat: turn off sourcemap for uglify by default
- refactor: get args with spm-argv

## 0.3.2

- feat(build): support require json file

## 0.3.1

- fix: jsx2-loader version

## 0.3.0

- don't flatten output path
- feat(css): fix css path before build complete, Fix #5
- deps: jsx-loader to jsx2-loader, Don't transform js file if no @jsx progma
- deps: upgrade babel-loader to 0.5
- fix: babel opts Unknown Option

## 0.2.1

- support define plugin

## 0.2.0

- support watch mode
- flatten output path
- copy font files
- resolve node-modules with node-resolve
- get pkg using fs.readFile instead of require

## 0.1.4

- deps: upgrade spmcss-loader to 0.9.2
  - parse `@import 'b'` as relative, parse `@import '~b'` as module
- fix: main file path error
- chore: exports webpack
- chore: get pkg using fs.readFile (pkg maybe modified when using require)

## 0.1.3

- fix: generate files with name and version

## 0.1.2

- deps: css-loader -> spmcss-loader
  - delete progid contained filter
  - parse `@import 'b'` as module
- add `output` helper for handlebars
- improve performance

## 0.1.1

- keep output filepath (no flatten)
- add clean param, for deleting dest directory before build
- exports getWebpackOpts, for spm-webpack-server
- transform jsx with harmony 
- deps: upgrade spm-client to 0.4

## 0.1.0

First version.
