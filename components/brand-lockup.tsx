import Image from "next/image";
import Link from "next/link";

/** The BB icon plus "BackBencher Hub" wordmark, linking home. */
export function BrandLockup({ size = "md" }: { size?: "sm" | "md" }) {
  const small = size === "sm";
  return (
    <Link href="/" className="flex items-center gap-2.5">
      <Image
        src="/icon-192.png"
        alt="BBHub icon"
        width={48}
        height={48}
        priority
        className={small ? "size-8" : "size-11 sm:size-12"}
      />
      <span
        className={`font-pixel font-bold leading-none ${
          small ? "text-lg sm:text-xl" : "text-[clamp(1.5rem,7vw,2.25rem)]"
        }`}
      >
        <span className="text-brand">B</span>ack
        <span className="text-brand">B</span>encher Hub
      </span>
    </Link>
  );
}
