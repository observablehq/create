#!/usr/bin/env node

import path from "node:path";
import fs from "node:fs";
import { fileURLToPath } from "node:url";
import { parseArgs } from "node:util";
import prompts, { type PromptObject } from "prompts";

async function init() {
  const args = parseArgs({ allowPositionals: true, strict: true });
  if (args.positionals.length > 1) {
    console.error("Too many positional arguments. Expected 0 or 1.");
    process.exit(1);
  }

  const projectNameArg = args.positionals[0];
  if (projectNameArg !== undefined) {
    const result = validateProjectName(projectNameArg);
    if (result !== true) {
      console.error(`Invalid project name "${projectNameArg}": ${result}".`);
      process.exit(1);
    }
  }

  const results = await prompts<"projectName" | "projectTitle">([
    {
      type: "text",
      name: "projectName",
      message: "Project name:",
      initial: projectNameArg,
      validate: validateProjectName,
    } satisfies PromptObject<"projectName">,
    {
      type: "text",
      name: "projectTitle",
      message: "Formatted project title:",
      initial: toTitleCase,
      validate: validateProjectTitle,
    } satisfies PromptObject<"projectTitle">,
  ]);

  const root = results.projectName;
  const pkgInfo = pkgFromUserAgent(process.env["npm_config_user_agent"]);
  const pkgManager = pkgInfo ? pkgInfo.name : "npm";

  const templateDir = path.resolve(
    fileURLToPath(import.meta.url),
    "../../template"
  );

  const devDirections =
    pkgManager === "yarn"
      ? ["yarn", "yarn dev"]
      : [`${pkgManager} install`, `${pkgManager} run dev`];

  const context = {
    projectName: root,
    projectTitle: results.projectTitle,
    devInstructions: devDirections.map((l) => `$ ${l}`).join("\n"),
  };

  console.log(`Setting up project in ${root}...`);
  recursiveCopyTemplate(templateDir, root, context);

  console.log(`All done! To get started, run:\n`);
  if (root !== process.cwd()) {
    console.log(`  cd ${root.includes(" ") ? `"${root}"` : root}`);
  }
  for (const line of devDirections) {
    console.log(`  ${line}`);
  }
}

function validateProjectName(projectName: string): string | boolean {
  if (fs.existsSync(projectName)) {
    return `Project directory already exists`;
  }

  if (projectName.length === 0) {
    return "Project name must be at least 1 character long.";
  }

  if (!/^([^0-9\W]\w*)$/.test(projectName)) {
    return "Project name must contain only alphanumerics or underscore with no leading digits.";
  }

  return true;
}

function validateProjectTitle(projectTitle: string): string | boolean {
  if (projectTitle.length === 0) {
    return "Project title must be at least 1 character long.";
  }

  if (/[\x00-\x1F]/.test(projectTitle)) {
    return "Project title may not contain control characters.";
  }

  return true;
}

function toTitleCase(str) {
  return str.toLowerCase()
    .replace(/_/g, ' ')
    .split(/\s+/)
    .map((word) => word[0].toUpperCase() + word.slice(1))
    .join(' ');
}

function recursiveCopyTemplate(
  inputRoot: string,
  outputRoot: string,
  context: Record<string, string>,
  stepPath: string = "."
) {
  let templatePath = path.join(inputRoot, stepPath);
  let outputPath = path.join(outputRoot, stepPath);

  let templateStat = fs.statSync(templatePath);
  if (templateStat.isDirectory()) {
    try {
      fs.mkdirSync(outputPath);
    } catch {
      // that's ok
    }
    for (let entry of fs.readdirSync(templatePath)) {
      recursiveCopyTemplate(
        inputRoot,
        outputRoot,
        context,
        path.join(stepPath, entry)
      );
    }
  } else {
    if (templatePath.endsWith(".tmpl")) {
      outputPath = outputPath.replace(/\.tmpl$/, "");
      let contents = fs.readFileSync(templatePath, "utf8");
      contents = contents.replaceAll(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
        let val = context[key];
        if (val) return val;
        throw new Error(`no template variable ${key}`);
      });
      fs.writeFileSync(outputPath, contents);
    } else {
      fs.copyFileSync(templatePath, outputPath);
    }
  }
}

function pkgFromUserAgent(userAgent: string | undefined): null | {
  name: string;
  version: string | undefined;
} {
  if (!userAgent) return null;
  const pkgSpec = userAgent.split(" ")[0]!; // userAgent is non-empty, so this is always defined
  if (!pkgSpec) return null;
  const [name, version] = pkgSpec.split("/");
  if (!name || !version) return null;
  return { name, version };
}

init().catch((e) => console.error(e.message));
