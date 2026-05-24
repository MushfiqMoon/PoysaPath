import Image from "next/image";
import Link from "next/link";

type LogoProps = {
  size?: number;
  showWordmark?: boolean;
  href?: string;
  className?: string;
};

export function Logo({
  size = 40,
  showWordmark = false,
  href,
  className = "",
}: LogoProps) {
  const src = size <= 64 ? "/icon.png" : "/logo.png";

  const image = (
    <Image
      src={src}
      alt="PoysaPath"
      width={size}
      height={size}
      sizes={`${size}px`}
      className="rounded-full ring-1 ring-border/60"
      priority={size >= 64}
    />
  );

  const content = (
    <span
      className={[
        "inline-flex items-center gap-2.5",
        href ? "transition-opacity hover:opacity-90 active:opacity-80" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {image}
      {showWordmark && (
        <span
          className="text-lg font-bold tracking-tight text-text"
          style={{ letterSpacing: "-0.02em" }}
        >
          PoysaPath
        </span>
      )}
    </span>
  );

  if (href) {
    return <Link href={href}>{content}</Link>;
  }

  return content;
}
