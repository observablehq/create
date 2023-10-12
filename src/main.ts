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

  const targetDir = args.positionals[0];

  let results = await prompts<"projectName">([
    ...(targetDir
      ? []
      : [
          {
            type: "text",
            name: "projectName",
            message: "Project name:",
            validate: (projectName) =>
              projectName.length > 0 && !projectName.includes("/"),
          } satisfies PromptObject<"projectName">,
        ]),
  ]);

  let root = targetDir ?? results.projectName;

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

  let context = {
    projectName: root,
    devInstructions: devDirections.map((l) => `$ ${l}`).join("\n"),
  };

  function walkStep(stepPath: string) {
    let templatePath = path.join(templateDir, stepPath);
    let outputPath = path.join(root, stepPath);

    let templateStat = fs.statSync(templatePath);
    if (templateStat.isDirectory()) {
      try {
        fs.mkdirSync(outputPath);
      } catch {
        // that's ok
      }
      for (let entry of fs.readdirSync(templatePath)) {
        walkStep(path.join(stepPath, entry));
      }
    } else {
      if (templatePath.endsWith(".tmpl")) {
        outputPath = outputPath.replace(/\.tmpl$/, "");
        let contents = fs.readFileSync(templatePath, "utf8");
        contents = contents.replaceAll(/\{\{\s*(\w+)\s*\}\}/g, (_, key) => {
          if (key in context) return context[key as keyof typeof context];
          throw new Error(`no template variable ${key}`);
        });
        fs.writeFileSync(outputPath, contents);
      } else {
        fs.copyFileSync(templatePath, outputPath);
      }
    }
  }

  console.log(`Setting up project in ${root}...`);
  walkStep(".");

  console.log(`All done! To get started, run:\n`);
  if (root !== process.cwd()) {
    console.log(`  cd ${root.includes(" ") ? `"${root}"` : root}`);
  }
  for (const line of devDirections) {
    console.log(`  ${line}`);
  }
}

function pkgFromUserAgent(userAgent: string | undefined): null | {
  name: string;
  version: string | undefined;
} {
  if (!userAgent) return null;
  const pkgSpec = userAgent.split(" ")[0]; // userAgent is non-empty, so this is always defined
  if (!pkgSpec) return null;
  const [name, version] = pkgSpec.split("/");
  if (!name || !version) return null;
  return { name, version };
}

init().catch((e) => console.error(e.message));
