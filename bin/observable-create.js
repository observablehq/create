#!/usr/bin/env node

process.argv.splice(2, 0, "create");

await import("tsx/esm");
await import("@observablehq/framework/bin/observable.ts");
