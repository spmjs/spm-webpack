# spm-webpack

[![NPM version](https://img.shields.io/npm/v/spm-webpack.svg?style=flat)](https://npmjs.org/package/spm-webpack)
[![Build Status](https://img.shields.io/travis/spmjs/spm-webpack.svg?style=flat)](https://travis-ci.org/spmjs/spm-webpack)
[![Coverage Status](https://img.shields.io/coveralls/spmjs/spm-webpack.svg?style=flat)](https://coveralls.io/r/spmjs/spm-webpack)
[![NPM downloads](http://img.shields.io/npm/dm/spm-webpack.svg?style=flat)](https://npmjs.org/package/spm-webpack)

SPM project bundler based on webpack.

---

## Install

```bash
$ npm install spm-webpack -g
```

## Usage

## Added
add spm.build.publicPath args pass to webpack's output.publicPath
[webpack-configuration](https://github.com/webpack/docs/wiki/configuration#outputpublicpath)
```javascript
{
  "spm": {
    "output": [
      "main.js"
    ],
    "build": {
      "publicPath": "http://xxx.com/assets/"
    }
  }
}
```

```bash
$ spm-webpack [option] [file]
```

## LISENCE

Copyright (c) 2015-2114 chencheng. Licensed under the MIT license.
