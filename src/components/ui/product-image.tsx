import Image from "next/image";
import { cn } from "@/lib/utils";

interface ProductImageProps {
  src?: string;
  alt: string;
  className?: string;
  sizes?: string;
  priority?: boolean;
}

/** Square image frame; shows a flat grey block when there is no image yet. */
export function ProductImage({
  src,
  alt,
  className,
  sizes = "(min-width: 1024px) 320px, 50vw",
  priority,
}: ProductImageProps) {
  return (
    <div className={cn("relative aspect-square bg-surface", className)}>
      {src && (
        <Image
          src={src}
          alt={alt}
          fill
          sizes={sizes}
          priority={priority}
          className="object-contain"
        />
      )}
    </div>
  );
}
