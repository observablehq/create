# @observablehq/create

> [!WARNING]
> The install instructions are speculative and not yet tested

This tool provides an easy way to setup an [Obserable project](https://cli.observablehq.com/).  To use:

with [npm](https://docs.npmjs.com/cli/v10/commands/npm-init):

```
$ npm init @observablehq
```

with [yarn](https://yarnpkg.com):

```
$ yarn create @observablehq [path/to/project-name]
```

## Development

To test, run build in the `observablehq-create` project directory:

```
$ npm install
$ npm run build
```

or

```
$ yarn
$ yarn build
```

Go to a temporary directory, such as `~/tmp/observablehq-create-test`, and run the following:

```
$ npm install path/to/create/repo
$ npx observablehq-create
```

or

```
$ yarn add path/to/create/repo
$ yarn observablehq-create
```
