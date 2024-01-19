process.argv.splice(2, 0, "create");

await import("tsx/esm");
await import("@observablehq/cli/bin/observable.ts");
