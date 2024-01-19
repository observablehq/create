# @observablehq/create

> [!WARNING]
> The install instructions are speculative and not yet tested

This tool provides an easy way to setup an [Obserable project](https://cli.observablehq.com/).  To use:

with [npm](https://docs.npmjs.com/cli/v10/commands/npm-init):

```
$ npm init @observablehq [path/to/project-name]
```

with [yarn](https://yarnpkg.com):

```
$ yarn create @observablehq [path/to/project-name]
```

## Development

To test, run build in the `observablehq-create` project directory:

```
$ yarn
$ yarn build
```

Go to a temporary directory, such as `~/tmp/observablehq-create-test`, and run the following:

```
$ yarn add path/to/create/repo
$ yarn observablehq-create
```

or

```
$ npm install path/to/create/repo
$ npx observablehq-create
```

