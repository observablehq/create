#!/usr/bin/env -S node --import=tsx/esm

process.argv.splice(2, 0, "create");

import("@observablehq/cli/bin/observable.js");
