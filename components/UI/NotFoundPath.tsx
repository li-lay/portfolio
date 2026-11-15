"use client";

import { useEffect, useState } from "react";

// Renders on the server with a generic path, then swaps in the real one on
// mount: the prerendered not-found shell is shared by every unknown URL, so
// reading location during SSR would leak Next's internal "/_not-found" route.
export default function NotFoundPath() {
  const [path, setPath] = useState("~");

  useEffect(() => {
    setPath(window.location.pathname || "/");
  }, []);

  return <>{`bash: ${path}: No such file or directory`}</>;
}
