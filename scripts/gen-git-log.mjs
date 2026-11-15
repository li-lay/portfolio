// Generates lib/git-log.generated.json from the real repository history.
// Runs before `dev` and `build` (package.json predev/prebuild). Any failure —
// no .git, a shallow CI checkout, a missing git binary — writes an empty array
// and exits 0 so the build never breaks.

import { execSync } from "node:child_process";
import { writeFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const MAX_ENTRIES = 30;
const FIELD = "\x1f";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const target = join(root, "lib", "git-log.generated.json");

/** @type {{ hash: string, date: string, subject: string }[]} */
let entries = [];

try {
  const raw = execSync(
    `git log --max-count=${MAX_ENTRIES} --format=%h%x1f%aI%x1f%s`,
    {
      cwd: root,
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
    },
  );

  entries = raw
    .split("\n")
    .filter((line) => line.trim().length > 0)
    .map((line) => {
      const [hash = "", date = "", ...subject] = line.split(FIELD);
      return { hash, date, subject: subject.join(FIELD) };
    })
    .filter((entry) => entry.hash && entry.date)
    .slice(0, MAX_ENTRIES);
} catch {
  entries = [];
}

try {
  writeFileSync(target, `${JSON.stringify(entries, null, 2)}\n`);
  process.stdout.write(
    `git-log: ${entries.length} entr${entries.length === 1 ? "y" : "ies"} → lib/git-log.generated.json\n`,
  );
} catch (error) {
  // A read-only checkout must not break the build either; the route falls back
  // to "<no history available>" only if an older/empty file is present.
  process.stdout.write(`git-log: could not write ${target}: ${String(error)}\n`);
}
process.exitCode = 0;
