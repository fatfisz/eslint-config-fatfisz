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
So if you're using TypeScript, install the follwing packages too:

```shell
yarn add -E @typescript-eslint/eslint-plugin
yarn add -E @typescript-eslint/parser
yarn add -E typescript
```

and for React install those:

```shell
yarn add -E eslint-plugin-react
yarn add -E eslint-plugin-react-hooks
```

## License

Copyright (c) 2020 Rafał Ruciński. Licensed under the MIT license.
