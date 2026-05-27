"use client";

import "./globals.css";

export default function GlobalError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <html lang="en" className="dark">
      <body>
        <main className="app-shell grid min-h-screen place-items-center px-4 text-foreground">
          <section className="app-panel-strong w-full max-w-lg rounded-lg border p-6 shadow-2xl">
            <div className="text-sm font-medium text-muted-foreground">Voxa system</div>
            <h1 className="mt-3 text-2xl font-semibold text-foreground">The app shell failed to load.</h1>
            <p className="mt-3 text-sm leading-6 text-muted-foreground">
              This fallback keeps the page recoverable when Next.js cannot render the normal layout.
            </p>
            <button
              onClick={reset}
              className="mt-5 rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
            >
              Retry
            </button>
          </section>
        </main>
      </body>
    </html>
  );
}
