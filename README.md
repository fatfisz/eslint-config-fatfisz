# eslint-config-fatfisz ![ci](https://github.com/fatfisz/eslint-config-fatfisz/actions/workflows/ci.yml/badge.svg)

This is an ESLint config I'm using for my projects.

## Installation

There are some peer dependencies that need to be installed together because of how ESLint resolves packages:

```shell
yarn add -E eslint-config-fatfisz eslint-config-prettier eslint-plugin-import eslint-plugin-prettier prettier
```

Then in `.eslintrc.js` put:

```js
'use strict';

module.exports = {
  root: true,
  extends: 'fatfisz',

  ... // Tweak it as you like, add overrides and such
};
```

## Optional dependencies

Take into consideration that this config has some optional dependencies and some rules won't unlock unless you have them installed.
So if you're using TypeScript, install the following packages too:

```shell
yarn add -ED @typescript-eslint/eslint-plugin @typescript-eslint/parser typescript
```

and for React install those:

```shell
yarn add -ED eslint-plugin-react eslint-plugin-react-hooks
```

## License

Copyright (c) 2021 Rafał Ruciński. Licensed under the MIT license.
