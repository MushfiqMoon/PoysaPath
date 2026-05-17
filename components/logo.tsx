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
  const image = (
    <Image
      src="/logo.png"
      alt="PoysaPath"
      width={size}
      height={size}
      className="rounded-full"
      priority
    />
  );

  const content = (
    <span
      className={[
        "inline-flex items-center gap-2.5",
        href ? "transition-opacity hover:opacity-90" : "",
        className,
      ]
        .filter(Boolean)
        .join(" ")}
    >
      {image}
      {showWordmark && (
        <span className="text-lg font-semibold tracking-tight text-text">
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
