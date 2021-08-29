# eslint-config-fatfisz

This is an ESLint config I'm using for my projects.

## Installation

```shell
yarn add -E eslint-config-fatfisz
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
yarn add -ED @typescript-eslint/eslint-plugin
yarn add -ED @typescript-eslint/parser
yarn add -ED typescript
```

and for React install those:

```shell
yarn add -ED eslint-plugin-react
yarn add -ED eslint-plugin-react-hooks
```

## License

Copyright (c) 2021 Rafał Ruciński. Licensed under the MIT license.
