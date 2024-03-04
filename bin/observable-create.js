#!/usr/bin/env node

process.argv.splice(2, 0, "create");

await import("@observablehq/framework/dist/bin/observable.js");
