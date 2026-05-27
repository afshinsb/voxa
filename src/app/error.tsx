"use client";

import { useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <main className="app-shell grid min-h-screen place-items-center px-4 text-foreground">
      <section className="app-panel-strong w-full max-w-lg rounded-lg border p-6 shadow-2xl">
        <div className="text-sm font-medium text-muted-foreground">Voxa runtime</div>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">Something interrupted the studio.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          The app caught a client rendering error. Try again from here instead of falling into a refresh loop.
        </p>
        <div className="mt-5 flex gap-3">
          <Button onClick={reset}>Retry</Button>
          <Button variant="outline" onClick={() => window.location.reload()}>
            Reload
          </Button>
        </div>
      </section>
    </main>
  );
}
