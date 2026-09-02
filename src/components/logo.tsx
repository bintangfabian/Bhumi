import Image from "next/image";
import logo from "../../public/Bhumi-logo.jpg";

export function Logo({
  size = 32,
  showWord = true,
  wordClassName = "",
}: {
  size?: number;
  showWord?: boolean;
  wordClassName?: string;
}) {
  return (
    <span className="flex items-center gap-2.5">
      <Image
        src={logo}
        alt="Bhumi"
        width={size}
        height={size}
        priority
        className="rounded-xs"
      />
      {showWord && (
        <span
          className={`font-display text-[19px] font-extrabold tracking-[-0.03em] text-ink ${wordClassName}`}
        >
          Bhumi
        </span>
      )}
    </span>
  );
}
