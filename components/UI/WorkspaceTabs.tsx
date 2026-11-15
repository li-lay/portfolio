"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

const tabs = [
  { n: 1, path: "/", label: "home" },
  { n: 2, path: "/about", label: "about" },
  { n: 3, path: "/projects", label: "projects" },
  { n: 4, path: "/contact", label: "contact" },
];

export default function WorkspaceTabs() {
  const pathname = usePathname();

  return (
    <nav aria-label="Workspace" className="flex h-full min-w-0">
      {tabs.map((tab) => {
        const active =
          pathname === tab.path ||
          (tab.path !== "/" && pathname.startsWith(tab.path));

        return (
          <Link
            key={tab.path}
            href={tab.path}
            aria-current={active ? "page" : undefined}
            aria-label={tab.label}
            className={`flex h-full items-center px-2 font-mono text-sm sm:px-3 ${
              active
                ? "bg-yellow text-bg0"
                : "text-fg1 hover:bg-bg2 focus-visible:bg-bg2"
            }`}
          >
            <span className="sm:hidden">
              {active && (
                <span aria-hidden="true" className="mr-0.5">
                  ▸
                </span>
              )}
              {tab.n}
            </span>
            <span className="hidden sm:inline">
              {active && (
                <span aria-hidden="true" className="mr-1">
                  ▸
                </span>
              )}
              {tab.n}:{tab.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
