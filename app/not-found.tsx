import type { Metadata } from "next";
import Link from "next/link";
import Pane from "@/components/UI/Pane";
import NotFoundPath from "@/components/UI/NotFoundPath";

export const metadata: Metadata = {
  title: "404: command not found",
};

const routes = ["/", "/about", "/projects", "/contact", "/log"];

export default function NotFound() {
  return (
    <div className="flex flex-col gap-4 pt-6 pb-8 md:pt-8">
      <Pane title="not-found">
        <div className="font-mono text-sm leading-relaxed md:text-base">
          <p className="break-words text-fg1">
            <NotFoundPath />
          </p>
          <p className="mt-4 text-gray">Did you mean:</p>
          <ul className="mt-1 flex flex-col gap-1">
            {routes.map((href) => (
              <li key={href}>
                <Link
                  href={href}
                  className="text-green underline-offset-4 transition-colors hover:text-yellow hover:underline focus-visible:text-yellow"
                >
                  {href}
                </Link>
              </li>
            ))}
          </ul>
          <p className="mt-4 text-gray">
            {"$ "}
            <span className="caret" aria-hidden="true" />
          </p>
        </div>
      </Pane>
    </div>
  );
}
