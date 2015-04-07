# History

---

## 0.3.1

- don't flatten output path

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
