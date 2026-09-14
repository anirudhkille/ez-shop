import { execFileSync } from "node:child_process";
import path from "node:path";

const eslintEntry = (pkg) =>
  path.join(pkg, "node_modules", "eslint", "bin", "eslint.js");
const prettierEntry = (pkg) =>
  path.join(pkg, "node_modules", "prettier", "bin", "prettier.cjs");

const task = (pkg, steps) => {
  const dir = path.resolve(pkg);
  return {
    title: `${pkg}: ${steps.map((s) => s.name).join(" + ")}`,
    task: (files) => {
      const rel = files.map((f) => path.relative(dir, f));
      for (const step of steps) {
        execFileSync(process.execPath, [step.entry(dir), ...step.args, ...rel], {
          cwd: dir,
          stdio: "inherit",
        });
      }
    },
  };
};

const lintAndFormat = (pkg) => [
  { name: "eslint --fix", entry: eslintEntry, args: ["--fix"] },
  { name: "prettier --write", entry: prettierEntry, args: ["--write"] },
];

const formatOnly = (pkg) => [
  { name: "prettier --write", entry: prettierEntry, args: ["--write"] },
];

const lintOnly = (pkg) => [
  { name: "eslint --fix", entry: eslintEntry, args: ["--fix"] },
];

export default {
  "client/**/*.{ts,tsx}": task("client", lintAndFormat("client")),
  "client/**/*.{css,json,md}": task("client", formatOnly("client")),
  "server/**/*.ts": task("server", lintAndFormat("server")),
  "server/**/*.{json,md}": task("server", formatOnly("server")),
  "admin/**/*.{ts,tsx}": task("admin", lintOnly("admin")),
};
