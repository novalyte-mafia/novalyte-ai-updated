import Link from "next/link";
import { NotFoundEvent } from "@/components/site/not-found-event";

export default function NotFound() {
  return (
    <>
      <NotFoundEvent />
      <main className="mx-auto flex min-h-[70vh] max-w-2xl flex-col items-center justify-center px-6 text-center">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-teal-700">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight text-slate-950 sm:text-4xl">
          We couldn&apos;t find that page
        </h1>
        <p className="mt-4 text-base leading-7 text-slate-600">
          The page may have moved, may not be published, or may require a
          different link.
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          <Link
            href="/"
            className="rounded-md bg-teal-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-teal-800"
          >
            Return home
          </Link>
          <Link
            href="/directory"
            className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Search the directory
          </Link>
          <Link
            href="/journal"
            className="rounded-md border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-800 hover:bg-slate-50"
          >
            Read the Journal
          </Link>
        </div>
      </main>
    </>
  );
}
