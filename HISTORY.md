# History

---

## 1.0.3

- feat: add atool monitor

## 1.0.2

- optimize: add webpack.optimize.DedupePlugin

## 1.0.1

- bugfix: babel loader not found in npm3

## 1.0.0

- feat: change spmjsio to npm


## 0.8.2

- fix: bugfix of custom loader

## 0.8.1

- fix: fix path in windows os.
- feat: brand new define
- feat: use babel-loader for jsx, remove jsx-loader and jsx2-loader
- deps: remove gnode, upgrade spm-argv

## 0.8.0

- feat: build dist name with chunkhash.
- deps: update deps css-loader@0.19.0 extract-text-webpack-plugin@0.8.2 该版本对引用 css 有严格顺序要求详见[链接](https://github.com/webpack/extract-text-webpack-plugin/issues/80)


## 0.7.4

- fix: woff2 不被 loader 加载
- feat: support build sourcemap `spm build --sourcemap`

## 0.7.3

- fix: library 和 libraryTarget 不工作

## 0.7.2

- feat: js, jsx, coffee 的 loader 不解析 spm_modules 下的文件
- fix: 修复 spm 模块解析器的 bug
- chore: 不显示 _webpackcssentry_ 前缀的文件生成

## 0.7.0

- deps: 升级 webpack 到 1.10
- feat: 支持 html 的压缩，通过在 package.json 里配置 htmlMinify 开启
- fix: windows 下构建 css 出错的问题
- fix: watch 模式下，修改 html 可能导致 crash 的问题  

## 0.6.1

- fix: don't exit if get error in watch mode

## 0.6.0

- feat: support progress plugin
- feat: html support compiler.outputFileSystem
- feat: html support watch

## 0.5.9

- feat: use multiple entry, so entry file can be required by other files
- fix: copy file don't work with pathmap

## 0.5.8

- deps: add atpl-loader

## 0.5.7

- feat: support pathmap for entry files

## 0.5.6

- fix: no error print if have child error

## 0.5.5

- deps: use css-loader@0.14 instead of spm-loader@0.9

## 0.5.4

- fix: node modules resolve, such as util and events
- fix: css is not minified while having local url in background property

## 0.5.3

- fix: css output files don't resolve custom loader properly

## 0.5.2

- deps: unique babel-core's version

## 0.5.1

- feat: support less file in output

## 0.5.0

- feat: support css output
- feat: support multiple entry
- feat: exports installDeps

## 0.4.0

- fix: output path error when have name and version
- refactor: extract installDeps from getWebpackOpts
- feat: support noInstall: true

## 0.3.12

- fix: fixCSSpathPlugin bug which is mentioned in [spmjs/spm#1320](https://github.com/spmjs/spm/issues/1320), Close [spmjs/spm#1320](https://github.com/spmjs/spm/issues/1320)

## 0.3.11

- feat(build): add webpack.optimize.OccurenceOrderPlugin to reserve deps order
- fix: vendor or common is enabled, Close [spmjs/spm#1315](https://github.com/spmjs/spm/issues/1315) and [spmjs/spm#1313](https://github.com/spmjs/spm/issues/1313)
- fix: watch bug, Close [spmjs/spm#1293](https://github.com/spmjs/spm/issues/1293)

## 0.3.10

- chore: improve error output
- fix: image url path problem in css file, [spmjs/spm#1293](https://github.com/spmjs/spm/issues/1293)

## 0.3.9

- feat: support custom loader for less

## 0.3.8

- fix: don't validate html for tpl files
- fix: custom loader resove error if loader is local

## 0.3.7

- fix: winPath error when parse module
- fix: custom loader for css don't work

## 0.3.6

- feat: support base64

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
