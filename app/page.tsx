import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 text-center sm:px-6">
      <header className="flex w-full items-center justify-center py-4">
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
      </header>

      <section className="flex flex-1 items-center justify-center py-8">
        <p className="text-base font-semibold italic tracking-tight sm:text-xl">
          We’ve got your back,{" "}
          <span className="text-highlight">you’ve got the bench.</span>
        </p>
      </section>
    </main>
  );
}
