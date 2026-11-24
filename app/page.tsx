import Link from "next/link";
import Image from "next/image";

export default function Home() {
  return (
    <main className="flex flex-1 flex-col items-center px-4 text-center sm:px-6">
      <header className="flex w-full flex-col items-center justify-center gap-3 py-5">
        <Link href="/" className="flex items-center gap-3">
          <Image
            src="/icon-192.png"
            alt="BBHub icon"
            width={48}
            height={48}
            priority
            className="size-11 sm:size-12"
          />
          <span className="font-pixel text-[clamp(1.5rem,7vw,2.25rem)] font-bold leading-none">
            <span className="text-brand">B</span>ack
            <span className="text-brand">B</span>encher Hub
          </span>
        </Link>
        <p className="max-w-xs text-balance text-sm font-semibold italic tracking-tight sm:max-w-none sm:text-base">
          We’ve got your back ,{" "}
          <span className="text-brand">you’ve got the bench.</span>
        </p>
      </header>
    </main>
  );
}
