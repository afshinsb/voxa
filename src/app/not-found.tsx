import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="app-shell grid min-h-screen place-items-center px-4 text-foreground">
      <section className="app-panel-strong w-full max-w-lg rounded-lg border p-6 shadow-2xl">
        <div className="text-sm font-medium text-muted-foreground">404</div>
        <h1 className="mt-3 text-2xl font-semibold text-foreground">That route does not exist.</h1>
        <p className="mt-3 text-sm leading-6 text-muted-foreground">
          Return to the studio and continue generating speech.
        </p>
        <Button asChild className="mt-5">
          <Link href="/">Back to studio</Link>
        </Button>
      </section>
    </main>
  );
}
