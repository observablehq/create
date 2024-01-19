#!/usr/bin/env -S node --import=tsx/esm

process.argv.push("create");

import("@observablehq/cli/bin/observable.js");
