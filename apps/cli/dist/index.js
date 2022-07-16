"use strict";
var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __copyProps = (to, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to, key) && key !== except)
        __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to;
};
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target, mod));

// src/index.ts
var import_chalk2 = __toESM(require("chalk"));
var import_crypto = require("crypto");
var import_promises = __toESM(require("fs/promises"));
var import_os = require("os");

// src/lib/executeCommand.ts
var import_chalk = __toESM(require("chalk"));
var import_child_process = require("child_process");
async function executeCommand(command, ...args) {
  return new Promise((resolve, reject) => {
    const clone = (0, import_child_process.spawn)(command, args);
    clone.on("error", (error) => {
      console.error(import_chalk.default.red(error));
    });
    clone.stdout.on("data", (data) => {
      console.info(data.toString());
    });
    clone.stderr.on("data", (data) => {
      console.error(data.toString());
    });
    clone.on("close", (code) => {
      if (code === 0) {
        return resolve(0);
      }
      return reject(code);
    });
  });
}

// src/lib/fetchRepository.ts
var import_cross_fetch = __toESM(require("cross-fetch"));
async function fetchRepository(owner, repository) {
  const response = await (0, import_cross_fetch.default)(`https://api.github.com/repos/${owner}/${repository}`);
  const data = await response.json();
  if (!response.ok) {
    throw new Error(data.message || "Unknown error occurred");
  }
  return data;
}

// src/index.ts
var CLONE_DIRECTORY = `${(0, import_os.tmpdir)()}/sourcerer-${(0, import_crypto.randomUUID)().toUpperCase()}`;
async function cleanup() {
  await import_promises.default.rm(CLONE_DIRECTORY, { recursive: true });
}
async function runESLintCheck() {
  await executeCommand("pnpm", "eslint", "./src", "--quiet", "-c", "configs/strict-eslintrc.json");
}
async function main() {
  try {
    await runESLintCheck();
  } catch (error) {
    console.error(`There were ESLint errors`);
  }
  return;
  console.log(import_chalk2.default.blue`Fetching repository details...`);
  const { html_url } = await fetchRepository("szilarddoro", "svg-to-svgicon");
  await executeCommand("git", "clone", html_url, CLONE_DIRECTORY);
  console.info(import_chalk2.default.blue`Performing analysis...`);
  await cleanup();
  console.info(import_chalk2.default.blue`Analysis finished.`);
}
main();
