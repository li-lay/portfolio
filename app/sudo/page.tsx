import type { Metadata } from "next";
import Link from "next/link";
import Pane from "@/components/UI/Pane";

export const metadata: Metadata = {
  title: "403: Permission denied",
};

export default function Sudo() {
  return (
    <div className="max-w-2xl pt-6 pb-8 md:pt-8">
      <Pane title="sudo">
        <div className="font-mono text-sm leading-relaxed md:text-base">
          <p className="break-words text-gray">[sudo] password for visitor:</p>
          <p className="mt-3 break-words text-fg1">
            Sorry, user visitor is not in the sudoers file.
          </p>
          <p className="text-fg1">This incident has been reported.</p>
          <Link
            href="/"
            className="mt-5 inline-block text-green underline-offset-4 transition-colors hover:text-yellow hover:underline focus-visible:text-yellow"
          >
            [ return to 1:home ]
          </Link>
        </div>
      </Pane>
    </div>
  );
}
