import { useState } from "react";
import { Package } from "lucide-react";

const GRADIENTS = [
  "from-[#ff5500]/40 via-[#ff8c00]/20 to-[#1a1d22]",
  "from-violet-600/40 via-purple-500/20 to-[#1a1d22]",
  "from-cyan-600/40 via-blue-500/20 to-[#1a1d22]",
  "from-emerald-600/40 via-teal-500/20 to-[#1a1d22]",
  "from-rose-600/40 via-pink-500/20 to-[#1a1d22]",
  "from-amber-600/40 via-orange-500/20 to-[#1a1d22]",
];

function hashString(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = (hash << 5) - hash + str.charCodeAt(i);
    hash |= 0;
  }
  return Math.abs(hash);
}

type ProductImageProps = {
  src?: string | null;
  alt: string;
  className?: string;
  fileType?: string | null;
};

export default function ProductImage({
  src,
  alt,
  className = "",
  fileType,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false);
  const gradient = GRADIENTS[hashString(alt) % GRADIENTS.length];
  const showPlaceholder = !src || failed;

  if (showPlaceholder) {
    return (
      <div
        className={`relative w-full h-full bg-gradient-to-br ${gradient} flex items-center justify-center overflow-hidden ${className}`}
      >
        <div className="absolute inset-0 opacity-30 bg-[radial-gradient(circle_at_30%_20%,rgba(255,85,0,0.4),transparent_50%)]" />
        <div className="relative flex flex-col items-center gap-2 text-white/50">
          <Package className="w-10 h-10 opacity-60" strokeWidth={1.5} />
          {fileType && (
            <span className="text-xs font-medium uppercase tracking-wider">
              {fileType}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={className}
      loading="lazy"
      decoding="async"
      onError={() => setFailed(true)}
    />
  );
}
