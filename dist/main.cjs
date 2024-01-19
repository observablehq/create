#!/usr/bin/env node
'use strict';

const path = require('node:path');
const fs = require('node:fs');
const node_url = require('node:url');
const node_util = require('node:util');
const prompts = require('prompts');

var _documentCurrentScript = typeof document !== 'undefined' ? document.currentScript : null;
function _interopDefaultCompat (e) { return e && typeof e === 'object' && 'default' in e ? e.default : e; }

const path__default = /*#__PURE__*/_interopDefaultCompat(path);
const fs__default = /*#__PURE__*/_interopDefaultCompat(fs);
const prompts__default = /*#__PURE__*/_interopDefaultCompat(prompts);

async function init() {
  const args = node_util.parseArgs({ allowPositionals: true, strict: true });
  if (args.positionals.length > 1) {
    console.error("Too many positional arguments. Expected 0 or 1.");
    process.exit(1);
  }
  const {
    dir: projectDir,
    name: projectNameArg
  } = path__default.parse(args.positionals[0] ?? "");
  if (projectNameArg !== "") {
    const result = validateProjectName(projectDir, projectNameArg);
    if (result !== true) {
      console.error(
        `Invalid project "${path__default.join(projectDir, projectNameArg)}": ${result}`
      );
      process.exit(1);
    }
  }
  const results = await prompts__default([
    {
      type: "text",
      name: "projectName",
      message: "Project folder name:",
      initial: projectNameArg,
      validate: (name) => validateProjectName(projectDir, name)
    },
    {
      type: "text",
      name: "projectTitle",
      message: "Project title (visible on the pages):",
      initial: toTitleCase,
      validate: validateProjectTitle
    }
  ]);
  const root = path__default.join(projectDir, results.projectName);
  const pkgInfo = pkgFromUserAgent(process.env["npm_config_user_agent"]);
  const pkgManager = pkgInfo ? pkgInfo.name : "yarn";
  const templateDir = path__default.resolve(
    node_url.fileURLToPath((typeof document === 'undefined' ? require('u' + 'rl').pathToFileURL(__filename).href : (_documentCurrentScript && _documentCurrentScript.src || new URL('main.cjs', document.baseURI).href))),
    "../../template"
  );
  const devDirections = pkgManager === "yarn" ? ["yarn", "yarn dev"] : [`${pkgManager} install`, `${pkgManager} run dev`];
  const context = {
    projectDir,
    ...results,
    devInstructions: devDirections.map((l) => `$ ${l}`).join("\n")
  };
  console.log(`Setting up project in ${root}...`);
  recursiveCopyTemplate(templateDir, root, context);
  console.log(`All done! To get started, run:
`);
  if (root !== process.cwd()) {
    console.log(`  cd ${root.includes(" ") ? `"${root}"` : root}`);
  }
  for (const line of devDirections) {
    console.log(`  ${line}`);
  }
}
function validateProjectName(projectDir, projectName) {
  if (!fs__default.existsSync(path__default.normalize(projectDir))) {
    return `The parent directory of the project does not exist.`;
  }
  if (fs__default.existsSync(path__default.join(projectDir, projectName))) {
    return `Project already exists.`;
  }
  if (projectName.length === 0) {
    return "Project name must be at least 1 character long.";
  }
  if (!/^([^0-9\W][\w-]*)$/.test(projectName)) {
    return "Project name must contain only alphanumerics, dash or underscore with no leading digits.";
  }
  return true;
}
function validateProjectTitle(projectTitle) {
  if (projectTitle.length === 0) {
    return "Project title must be at least 1 character long.";
  }
  if (/[\x00-\x1F]/.test(projectTitle)) {
    return "Project title may not contain control characters.";
  }
  return true;
}
function toTitleCase(str) {
  return str.toLowerCase().replace(/_/g, " ").split(/\s+/).map((word) => word[0].toUpperCase() + word.slice(1)).join(" ");
}
function recursiveCopyTemplate(inputRoot, outputRoot, context, stepPath = ".") {
  let templatePath = path__default.join(inputRoot, stepPath);
  let outputPath = path__default.join(outputRoot, stepPath);
  let templateStat = fs__default.statSync(templatePath);
  if (templateStat.isDirectory()) {
    try {
      fs__default.mkdirSync(outputPath);
    } catch {
    }
    for (let entry of fs__default.readdirSync(templatePath)) {
      recursiveCopyTemplate(
        inputRoot,
        outputRoot,
        context,
        path__default.join(stepPath, entry)
      );
    }
  } else {
    if (templatePath.endsWith(".tmpl")) {
      outputPath = outputPath.replace(/\.tmpl$/, "");
      let contents = fs__default.readFileSync(templatePath, "utf8");
      contents = contents.replaceAll(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
        let val = context[key];
        if (val)
          return val;
        throw new Error(`no template variable ${key}`);
      });
      fs__default.writeFileSync(outputPath, contents);
    } else {
      fs__default.copyFileSync(templatePath, outputPath);
    }
  }
}
function pkgFromUserAgent(userAgent) {
  if (!userAgent)
    return null;
  const pkgSpec = userAgent.split(" ")[0];
  if (!pkgSpec)
    return null;
  const [name, version] = pkgSpec.split("/");
  if (!name || !version)
    return null;
  return { name, version };
}
init().catch((e) => console.error(e.message));
