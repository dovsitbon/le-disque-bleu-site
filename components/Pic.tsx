import Image from "next/image";
import { altOf, type Dict } from "@/lib/i18n";
import { has, img } from "@/lib/media";
import { Disc } from "@/components/Logo";

/**
 * Photo de public/media, recadrée dans son cadre. Si le fichier n'existe pas encore (photo à prendre sur place,
 * voir assets/A-PHOTOGRAPHIER.md), un disque au trait tient la place : aucune fausse photo.
 */
export function Pic({ src, d, sizes, className = "", priority = false, position = "center" }: { src: string; d: Dict; sizes: string; className?: string; priority?: boolean; position?: string }) {
  if (!has(src))
    return (
      <div className={`flex items-center justify-center bg-blue-soft text-blue ${className}`} data-photo-slot={src} aria-hidden="true">
        <Disc className="h-2/5 max-h-32 w-auto opacity-70" glass={false} />
      </div>
    );
  const i = img(src);
  return (
    <div className={`zoom ${className}`}>
      <Image src={i.src} alt={altOf(d, i.src)} width={i.width} height={i.height} sizes={sizes} quality={80} priority={priority} fetchPriority={priority ? "high" : undefined} className="h-full w-full object-cover" style={{ objectPosition: position }} />
    </div>
  );
}
