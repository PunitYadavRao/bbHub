import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 text-center sm:px-6">
      <header className="flex w-full flex-col items-center justify-center gap-2 py-4">
        <Link href="/" className="flex items-center gap-3">
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
        </Link>
        <p className="text-sm font-semibold italic tracking-tight sm:text-base">
          We’ve got your back ,{" "}
          <span className="text-brand">you’ve got the bench.</span>
        </p>
      </header>

      <section className="flex flex-1 flex-col items-center justify-center gap-3 py-8">
        <span className="font-mono text-xs uppercase tracking-widest text-muted sm:text-sm">
          Owned by
        </span>
        <h2 className="text-5xl font-extrabold leading-none tracking-[-0.05em] sm:text-8xl lg:text-9xl">
          Punit Yadav Rao
        </h2>
      </section>
    </main>
  );
}
