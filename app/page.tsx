import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 text-center sm:px-6">
      <nav className="flex w-full items-center py-3">
        <Link href="/" aria-label="BBHub home">
          <Image
            src="/icon-48.png"
            alt="BBHub"
            width={32}
            height={32}
            className="size-8"
          />
        </Link>
      </nav>

      <section className="flex flex-1 flex-col items-center justify-center gap-5 py-8">
        <span className="inline-flex items-center gap-2 rounded-full border border-border px-3 py-1 font-mono text-xs uppercase tracking-widest text-muted">
          <span className="pulse-dot size-1.5 rounded-full bg-brand" />
          Coming soon
        </span>

        <h1 className="flex items-center gap-3">
          <Image
            src="/icon-192.png"
            alt="BBHub icon"
            width={48}
            height={48}
            priority
            className="size-10 sm:size-12"
          />
          <span className="font-pixel text-2xl font-bold leading-none sm:text-4xl">
            <span className="text-brand">B</span>ack
            <span className="text-brand">B</span>encher Hub
          </span>
        </h1>

        <p className="text-base font-semibold tracking-tight sm:text-xl">
          We’ve got your back,{" "}
          <span className="text-highlight">you’ve got the bench.</span>
        </p>
      </section>

      <footer className="w-full border-t border-border py-4 text-sm text-muted">
        © BBHub
      </footer>
    </main>
  );
}
