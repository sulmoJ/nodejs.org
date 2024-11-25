---
title: Package Configuration
layout: learn
authors: JakobJingleheimer
---

# Package configuration

Configuration is always a chore, but an unfortunately necessary evil. And configuring a package for CommonJS (CJS) and ES Modules (ESM) can be a waking nightmare—not least because it has changed a dozen times in half as many years.

A frequent question is “how do I make this work!?” (often with angry tears); but yet more frequently we come across packages that are just misconfigured.

All the provided `package.json` configurations (not specifically marked “does not work”) work in Node.js 12.22.x (v12 latest, the oldest supported line) and 17.2.0 (current latest at the time)[^1], and for grins, with webpack 5.53.0 and 5.63.0 respectively. These are available: [nodejs/package-examples](https://github.com/nodejs/package-examples/blob/main/config).

For curious cats, [Preamble: How did we get here](#preamble-how-did-we-get-here) and [Down the rabbit-hole](#down-the-rabbithole) provide background and deeper explanations. If you're just looking for a solution, jump to [Pick your poison](#pick-your-poison) for the TLDR.

## General notes

[Syntax detection](https://nodejs.org/api/packages.html#syntax-detection) is _**not**_ a replacement for proper package configuration; syntax detection is not fool-proof and it has [significant performance cost](https://github.com/nodejs/node/pull/55238).

When using [`"exports"`](https://nodejs.org/api/packages.html#conditional-exports) in package.json, it is generally a good idea to include `"./package.json": "./package.json"` so that it can be imported ([`module.findPackageJSON`](https://nodejs.org/api/module.html#modulefindpackagejsonspecifier-base) is not affected by this limitation, but `import` may be more convenient).

`"exports"` can be advisable over [`"main"`](https://nodejs.org/api/packages.html#main) because it prevents external access to internal code (so you can be relatively sure users are not depending on things they shouldn't). If you don't need that, `"main"` is simpler and may be a better option for you.

The `"engines"` field provides both a human-friendly and a machine-friendly indication of with which version(s) of Node.js the package is compatible. Depending on the package manager used, an exception may be thrown causing the installation to fail when the consumer is using an incompatible version of Node.js (which can be very helpful to consumers). Including this field will save a lot of headache for consumers with an older version of Node.js who cannot use the package.

## Preamble: How did we get here

CommonJS (CJS) was created _long_ before ECMAScript Modules (ESM), back when JavaScript was still adolescent—CJS and jQuery were created just 3 years apart. CJS is not an official (TC39) standard and is supported by a limited few platforms (most notably, Node.js). ESM as a standard has been incoming for several years; it is currently supported by all major platforms (browsers, Deno, Node.js, etc), meaning it will run pretty much everywhere. As it became clear ESM would effectively succeed CJS (which is still very popular and widespread), many attempted to adopt early on, often before a particular aspect of the ESM specification was finalised. Because of this, those changed over time as better information became available (often informed by learnings/experiences of those eager beavers), going from best-guess to the aligning with the specification.

An additional complication is bundlers, which historically managed much of this territory. However, much of what we previously needed bundle(r)s to manage is now native functionality; yet bundlers are still (and likely always will be) necessary for some things. Unfortunately, functionality bundlers no-longer need to provide is deeply ingrained in older bundlers’ implementations, so they can at times be too helpful, and in some cases, anti-pattern (bundling a library is often not recommended by bundler authors themselves). The hows and whys of that are an article unto itself.

## Pick your poison

This article covers configuration of all possible combinations in modern Node.js (v12+). If you are trying to decide which options are ideal, it is better to avoid dual packages, so either:

- ESM source and distribution
- CJS source and distribution with good/specific `module.exports`

| You as a package author write     | Consumers of your package write their code in                    | Your options                                                                                |
| :-------------------------------- | :--------------------------------------------------------------- | :------------------------------------------------------------------------------------------ |
| CJS source code using `require()` | CJS: consumers `require()` your package                          | [CJS source and distribution](#cjs-source-and-distribution)                                 |
| CJS source code using `require()` | ESM: consumers `import` your package                             | [CJS source and only ESM distribution](#cjs-source-and-only-esm-distribution)               |
| CJS source code using `require()` | CJS & ESM: consumers either `require()` or `import` your package | [CJS source and both CJS & ESM distribution](#cjs-source-and-both-cjs-amp-esm-distribution) |
| ESM source code using `import`    | CJS: consumers `require()` your package                          | [ESM source with only CJS distribution](#esm-source-with-only-cjs-distribution)             |
| ESM source code using `import`    | ESM: consumers `import` your package                             | [ESM source and distribution](#esm-source-and-distribution)                                 |
| ESM: source code uses `import`    | CJS & ESM: consumers either `require()` or `import` your package | [ESM source and both CJS & ESM distribution](#esm-source-and-both-cjs-amp-esm-distribution) |

### CJS source and distribution

This the "Rum & Coke" of packages: pretty difficult to mess up. Essentially just declare the package’s exports via the [`"exports"`](https://nodejs.org/api/packages.html#conditional-exports) field/field-set.

**Working example**: [cjs-with-cjs-distro](https://github.com/JakobJingleheimer/nodejs-module-config-examples/tree/main/packages/cjs/cjs-distro)

```json
{
  "type": "commonjs", // current default, but may change
  "engines": { "node": ">=12.22.7" }, // optional, but kind
  "exports": {
    ".": "PATH/TO/DIST/CODE/ENTRYPOINT.js", // ex "./dist/index.js"
    "./package.json": "./package.json" // ensure this file is importable
  }
}
```

Note that `packageJson.exports["."] = filepath` is shorthand for `packageJson.exports["."].default = filepath`

### CJS source and only ESM distribution

The "Gin & Tonic" of packages: This takes a small bit of finesse but is also pretty straight-forward.

**Working example**: [cjs-with-esm-distro](https://github.com/JakobJingleheimer/nodejs-module-config-examples/tree/main/packages/cjs/esm-distro)

```json
{
  "type": "commonjs", // current default, but may change
  "engines": { "node": ">=12.22.7" }, // optional, but kind
  "exports": {
    ".": "PATH/TO/DIST/CODE/ENTRYPOINT.mjs", // ex "./dist/index.mjs"
    "./package.json": "./package.json" // ensure this file is importable
  }
}
```

The [`.mjs`](https://nodejs.org/api/esm.html#enabling) file extension is a trump-card: it will override **any** other configuration and the file will be treated as ESM. Using this file extension is necessary because `packageJson.exports.import` does **NOT** signify that the file is ESM (contrary to common, if not universal, misperception), only that it is the file to be used when the package is imported (ESM _can_ import CJS. See [Gotchas](#gotchas) below).

### CJS source and both CJS & ESM distribution

You have a few options:

#### Attach named exports directly onto `exports`

The "French 75" of packages: Classic but takes some sophistication and finesse.

Pros:

- Smaller package weight
- Easy and simple (probably least effort if you don't mind keeping to a minor syntax stipulation)
- Precludes the Dual-Package Hazard

Cons:

- Hacky-ish: Leverages non-explicitly documented behaviour in Node.js's algorithm (it _can_ but is very unlikely to change).
- Requires very specific syntax (either in source code and/or bundler gymnastics).

**Working example**: [cjs-with-dual-distro (properties)](https://github.com/JakobJingleheimer/nodejs-module-config-examples/tree/main/packages/cjs/dual/property-distro)

```json
{
  "type": "commonjs", // current default, but may change
  "engines": { "node": ">=12.22.7" }, // optional, but kind
  "exports": {
    ".": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.js", // ex "./dist/cjs/index.js"
    "./package.json": "./package.json" // ensure this file is importable
  }
}
```

Typically, you would see `module.exports` assigned to something (be it an object or a function) like this:

```js
const someObject = {
  foo() {},
  bar() {},
  qux() {},
};

module.exports = someObject;
```

Instead, do this:

```js
module.exports.foo = function foo() {};
module.exports.foo = function bar() {};
module.exports.foo = function qux() {};
```

#### Use a simple ESM wrapper

The "Piña Colada" of packages: Complicated setup and difficult to get the balance right.

Pros:

- Smaller package weight

Cons:

- Likely requires complicated bundler gymnastics (we could not find any existing option to automate this in Webpack).

**Working example**: [cjs-with-dual-distro (wrapper)](https://github.com/JakobJingleheimer/nodejs-module-config-examples/tree/main/packages/cjs/dual/wrapper-distro)

```json
{
  "type": "commonjs", // current default, but may change
  "engines": { "node": ">=12.22.7" }, // optional, but kind
  "exports": {
    ".": {
      "import": "PATH/TO/DIST/ESM-CODE/ENTRYPOINT.mjs", // ex "./dist/es/wrapper.mjs"
      "require": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.js", // ex "./dist/cjs/index.js"
      "default": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.js" // ex "./dist/cjs/index.js"
    },
    "./package.json": "./package.json" // ensure this file is importable
  }
}
```

In order to support named exports from the CJS bundle for an ESM consumer, this will need a bit of gymnastics from a bundler but is conceptually very simple.

In certain conditions, CJS exports an object (which gets aliased to ESM's `default`); that object, like any object, is destructure-able. You can leverage that to pluck all the members of the object out, and then re-export them so the ESM consumer is none the wiser.

```js
// ./dist/es/wrapper.mjs

import cjs from '../cjs/index.js';

const { a, b, c /* … */ } = cjs;

export { a, b, c /* … */ };
```

#### Two full distributions

The "Long Island Ice Tea" of packages: Chuck in a bunch of stuff and hope for the best. This is probably the most common and easiest of the CJS to CJS & ESM options, but you pay for it.

Pros:

- Simple bundler configuration

Cons:

- Larger package weight (basically double)

**Working example**: [cjs-with-dual-distro (double)](https://github.com/JakobJingleheimer/nodejs-module-config-examples/tree/main/packages/cjs/dual/double-distro)

```json
{
  "type": "commonjs", // current default, but may change
  "engines": { "node": ">=12.22.7" }, // optional, but kind
  "exports": {
    ".": {
      "import": "PATH/TO/DIST/ESM-CODE/ENTRYPOINT.mjs", // ex "./dist/es/index.mjs"
      "require": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.js", // ex "./dist/cjs/index.js"
      "default": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.js" // ex "./dist/cjs/index.js"
    },
    "./package.json": "./package.json" // ensure this file is importable
  }
}
```

### ESM source and distribution

The wine of packages: Simple, tried, and true.

This is almost exactly the same as the CJS-CJS configuration above with 1 small difference: the [`"type"`](https://nodejs.org/api/packages.html#type) field.

**Working example**: [esm-with-esm-distro](https://github.com/JakobJingleheimer/nodejs-module-config-examples/tree/main/packages/esm/esm-distro)

```json
{
  "type": "module",
  "engines": { "node": ">=12.22.7" }, // optional, but kind
  "exports": {
    ".": "PATH/TO/DIST/CODE/ENTRYPOINT.js", // ex "./dist/index.js"
    "./package.json": "./package.json" // ensure this file is importable
  }
}
```

Note that ESM is not “backwards” compatible with CJS: a CJS module cannot `require()` an ES Module; it is possible to use a dynamic import (`await import()`), but this is likely not what consumers expect (and, unlike ESM, CJS does not support [Top-Level Await](https://github.com/tc39/proposal-top-level-await/)).

### ESM source with only CJS distribution

We're not in Kansas anymore, Toto.

The configurations (there are 2 options) are nearly the same as [ESM source and both CJS & ESM distribution](#esm-source-and-both-cjs-amp-esm-distribution), just exclude `packageJson.exports.import`.

💡 Using `"type": "module"`[^2] paired with the `.cjs` file extension (for commonjs files) yields best results. For more information on why, see [Down the rabbit-hole](#down-the-rabbithole) and [Gotchas](#gotchas) below.

**Working example**: [esm-with-cjs-distro](https://github.com/JakobJingleheimer/nodejs-module-config-examples/tree/main/packages/esm/cjs-distro)

### ESM source and both CJS & ESM distribution

These are "mixologist" territory.

When source code is written in non-JavaScript (ex TypeScript), options can be limited due to needing to use file extension(s) specific to that language (ex `.ts`) and there is often no `.mjs` equivalent[^3].

Similar to [CJS source and both CJS & ESM distribution](#cjs-source-and-both-cjs-amp-esm-distribution), you have the same options.

There is also a 4th option of publishing only an ESM distribution and forcing consumers to use a dynamic import (`await import()`), but that is not quite the same and will likely lead to angry consumers, so it is not covered here.

#### Publish only a CJS distribution with property exports

The "Mojito" of packages: Tricky to make and needs good ingredients.

This option is almost identical to the [CJS source with CJS & ESM distribution's property exports](#attach-named-exports-directly-onto-raw-exports-endraw-) above. The only difference is in package.json: `"type": "module"`.

Only some build tools support generating this output. [Rollup](https://www.rollupjs.org/) produces compatible output out of the box when targetting commonjs. Webpack as of [v5.66.0+](https://github.com/webpack/webpack/releases/tag/v5.66.0) does with the new [`commonjs-static`](https://webpack.js.org/configuration/output/#type-commonjs-static) output type, (prior to this no commonjs options produces compatible output). It is not currently possible with [esbuild](https://esbuild.github.io/) (which produces a non-static `exports`).

The working example below was created prior to Webpack's recent release, so it uses Rollup (I'll get around to adding a Webpack option too).

**Working example**: [esm-with-cjs-distro](https://github.com/JakobJingleheimer/nodejs-module-config-examples/tree/main/packages/esm/dual/property-distro)

```json
{
  "type": "module",
  "engines": { "node": ">=12.22.7" }, // optional, but kind
  "exports": {
    ".": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.cjs", // ex "./dist/index.cjs"
    "./package.json": "./package.json" // ensure this file is importable
  }
}
```

💡 Using `"type": "module"`[^2] paired with the `.cjs` file extension (for commonjs files) yields best results. For more information on why, see [Down the rabbit-hole](#down-the-rabbithole) and [Gotchas](#gotchas) below.

#### Publish a CJS distribution with an ESM wrapper

The "Pornstar Martini" of packages: There's a lot going on here.

This is also almost identical to the [CJS source and dual distribution using an ESM wrapper](#use-a-simple-esm-wrapper), but with subtle differences `"type": "module"` and some `.cjs` file extenions in package.json.

**Working example**: [esm-with-dual-distro (wrapper)](https://github.com/JakobJingleheimer/nodejs-module-config-examples/tree/main/packages/esm/dual/wrapper-distro)

```json
{
  "type": "module",
  "engines": { "node": ">=12.22.7" }, // optional, but kind
  "exports": {
    ".": {
      "import": "PATH/TO/DIST/ESM-CODE/ENTRYPOINT.js", // ex "./dist/es/wrapper.js"
      "require": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.cjs", // ex "./dist/cjs/index.cjs"
      "default": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.cjs" // ex "./dist/cjs/index.cjs"
    },
    "./package.json": "./package.json" // ensure this file is importable
  }
}
```

💡 Using `"type": "module"`<sup>[2](#footnotes)</sup> paired with the `.cjs` file extension (for commonjs files) yields best results. For more information on why, see [Down the rabbit-hole](#down-the-rabbithole) and [Gotchas](#gotchas) below.

#### Publish both full CJS & ESM distributions

The "Tokyo Tea" of packages: Chuck in a bunch of stuff (with a surprise) and hope for the best. This is probably the most common and easiest of the ESM to CJS & ESM options, but you pay for it.

In terms of package configuration, there are a few options that differ mostly in personal preference.

##### Mark the whole package as ESM and specifically mark the CJS exports as CJS via the `.cjs` file extension

This option has the least burden on development/developer experience.

This also means that whatever build tooling must produce the distribution file with a `.cjs` file extension. This might necessitate chaining multiple build tools or adding a subsequent step to move/rename the file to have the `.cjs` file extension (ex `mv ./dist/index.js ./dist/index.cjs`)<sup>[3](#footnotes)</sup>. This can be worked around by adding a subsequent step to move/rename those outputted files (ex [Rollup](https://rollupjs.org/) or [a simple shell script](https://stackoverflow.com/q/21985492)).

Support for the `.cjs` file extension was added in 12.0.0, and using it will cause ESM to properly recognised a file as commonjs (`import { foo } from './foo.cjs` works). However, `require()` does not auto-resolve `.cjs` like it does for `.js`, so file extension cannot be omitted as is commonplace in commonjs: `require('./foo')` will fail, but `require('./foo.cjs')` works. Using it in your package's exports has no drawbacks: `packageJson.exports` (and `packageJson.main`) requires a file extension regardless, and consumers reference your package by the `"name"` field of your package.json (so they're blissfully unaware).

**Working example**: [esm-with-dual-distro](https://github.com/JakobJingleheimer/nodejs-module-config-examples/tree/main/packages/esm/dual/double-distro)

```json
{
  "type": "module",
  "engines": { "node": ">=12.22.7" }, // optional, but kind
  "exports": {
    ".": {
      "import": "PATH/TO/DIST/ESM-CODE/ENTRYPOINT.js", // ex "./dist/es/index.js"
      "require": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.cjs" // ex "./dist/index.cjs"
    },
    "./package.json": "./package.json" // ensure this file is importable
  }
}
```

💡 Using `"type": "module"`<sup>[2](#footnotes)</sup> paired with the `.cjs` file extension (for commonjs files) yields best results. For more information on why, see [Down the rabbit-hole](#down-the-rabbithole) and [Gotchas](#gotchas) below.

##### Use the `.mjs` (or equivalent) file extension for all source code files

The configuration for this is the same as [CJS source and both CJS & ESM distribution](#cjs-source-and-both-cjs-amp-esm-distribution).

**Non-JavaScript source code**: The non-JavaScript language’s own configuration needs to recognise/specify that the input files are ESM.

#### Node.js before 12.22.x

🛑 You should not do this: Versions of Node.js prior to 12.x are End of Life and are now vulnerable to serious security exploits.

If you're a security researcher needing to investigate Node.js prior to v12.22.x, feel free to contact me for help configuring.

## Down the rabbit-hole

Specifically in relation to Node.js, there are 4 problems to solve:

- Determining format of source code files (author running her/his own code)
- Determining format of distribution files (code consumers will receive)

- Publicising distribution code for when it is `require()`’d (consumer expects CJS)
- Publicising distribution code for when it is `import`’d (consumer probably wants ESM)

⚠️ The first 2 are **independent** of the last 2.

The method of loading does NOT determine the format the file is interpreted as:

- **package.json’s** **`exports.require`** **≠** **`CJS`**. `require()` does NOT and cannot blindly interpret the file as CJS; for instance, `require('foo.json')` correctly interprets the file as JSON, not CJS. The module containing the `require()` call of course must be CJS, but what it is loading is not necessarily also CJS.
- **package.json’s** **`exports.import`** **≠** **`ESM`**. `import` similarly does NOT and cannot blindly interpret the file as ESM; `import` can load CJS, JSON, and WASM, as well as ESM. The module containing the `import` statement of course must be ESM, but what it is loading is not necessarily also ESM.

So when you see configuration options citing or named with `require` or `import`, resist the urge to assume they are for _determining_ CJS vs ES Modules.

⚠️ Adding an `"exports"` field/field-set to a package’s configuration effectively [blocks deep pathing into the package](https://nodejs.org/api/packages.html#package-entry-points) for anything not explicitly listed in the exports’ subpathing. This means it can be a breaking change.

⚠️ Consider carefully whether to distribute both CJS and ESM: It creates the potential for the [Dual Package Hazard](https://nodejs.org/api/packages.html#dual-package-hazard) (especially if misconfigured and the consumer tries to get clever). This can lead to an extremely confusing bug in consuming projects, especially when your package is not perfectly configured. Consumers can even be blind-sided by an intermediary package that uses the "other" format of your package (eg consumer uses the ESM distribution, and some other package the consumer is also using itself uses the CJS distribution). If your package is in any way stateful, consuming both the CJS and ESM distributions will result in parallel states (which is almost surely unintentional).

## Gotchas

The `package.json`'s `"type"` field changes the `.js` file extension to mean either `commonjs` or ES `module` respectively. It is very common in dual/mixed packages (that contain both CJS and ESM) to use this field incorrectly.

```json
// ⚠️ THIS DOES NOT WORK
{
  "type": "module",
  "main": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.js",
  "exports": {
    ".": {
      "import": "PATH/TO/DIST/ESM-CODE/ENTRYPOINT.js",
      "require": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.js",
      "default": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.js"
    },
    "./package.json": "./package.json"
  }
}
```

This does not work because `"type": "module"` causes `packageJson.main`, `packageJson.exports["."].require`, and `packageJson.exports["."].default` to get interpreted as ESM (but they’re actually CJS).

Excluding `"type": "module"` produces the opposite problem:

```json
// ⚠️ THIS DOES NOT WORK
{
  "main": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.js",
  "exports": {
    ".": {
      "import": "PATH/TO/DIST/ESM-CODE/ENTRYPOINT.js",
      "require": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.js",
      "default": "PATH/TO/DIST/CJS-CODE/ENTRYPOINT.js"
    },
    "./package.json": "./package.json"
  }
}
```

This does not work because `packageJson.exports["."].import` will get interpreted as CJS (but it’s actually ESM).

## Footnotes

[^1]: There was a bug in Node.js v13.0–13.6 where `packageJson.exports["."]` had to be an array with verbose config options as the first item (as an object) and the “default” as the second item (as a string). See [nodejs/modules#446](https://github.com/nodejs/modules/issues/446).

[^2]: The `"type"` field in package.json changes what the `.js` file extension means, similar to to an [HTML script element’s type attribute](https://developer.mozilla.org/en-US/docs/Web/HTML/Element/script#attr-type).

[^3]: TypeScript has experimental support for the [package.json `"type"` field](https://www.typescriptlang.org/docs/handbook/esm-node.html#type-in-packagejson-and-new-extensions) and [`.cts` and `.mts` file extensions](https://www.typescriptlang.org/docs/handbook/esm-node.html#new-file-extensions).