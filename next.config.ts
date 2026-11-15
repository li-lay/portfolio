import type { NextConfig } from "next";
import { execSync } from "node:child_process";

function buildTime(): string {
  try {
    const iso = execSync("git log -1 --format=%cI", {
      encoding: "utf8",
    }).trim();
    return iso || new Date().toISOString();
  } catch {
    return new Date().toISOString();
  }
}

const nextConfig: NextConfig = {
  env: {
    NEXT_PUBLIC_BUILD_TIME: buildTime(),
  },
};

export default nextConfig;
