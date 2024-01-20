#!/usr/bin/env -S node --no-warnings=ExperimentalWarning

process.argv.splice(2, 0, "create");

await import("tsx/esm");
await import("@observablehq/cli/bin/observable.ts");
