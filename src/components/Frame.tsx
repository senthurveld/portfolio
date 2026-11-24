import { ImageIcon } from "lucide-react";
import type { Shot } from "@/content/shots";
import { cn } from "@/lib/logic";

type Art = { media: string; shot: Shot; sizes: string };
type Props = { shot?: Shot; sizes?: string; art?: Art; alt: string; className?: string; label?: string; eager?: boolean };

export function Frame({ shot, sizes, art, alt, className, label, eager }: Props) {
  const base = shot ?? art?.shot;
  return (
    <div className={cn("relative overflow-hidden rounded-2xl border border-[var(--home-line)] bg-[var(--home-card)]", className)}>
      {base ? (
        <Picture
          shot={base}
          sizes={sizes}
          art={art}
          alt={alt}
          eager={eager}
          className="transition-transform duration-[850ms] ease-[var(--ease-house)] group-hover:scale-105"
        />
      ) : (
        <div role="img" aria-label={`${alt} (screenshot coming soon)`} className="grid size-full min-h-24 place-items-center bg-[linear-gradient(to_right,var(--home-faint)_1px,transparent_1px),linear-gradient(to_bottom,var(--home-faint)_1px,transparent_1px)] bg-[size:28px_28px]">
          <span className="flex flex-col items-center gap-2 text-[var(--home-dim)]">
            <ImageIcon className="size-5" strokeWidth={1.5} />
            {label && <span className="kicker text-[0.62rem]">{label}</span>}
          </span>
        </div>
      )}
    </div>
  );
}

type PictureProps = { shot: Shot; sizes?: string; art?: Art; alt: string; eager?: boolean; className?: string };

// AVIF first, WebP fallback. Lazy images prepend `auto` so supporting browsers size from layout;
// others skip it and use the hint. The blurred LQIP paints under the image until it decodes.
export function Picture({ shot, sizes, art, alt, eager, className }: PictureProps) {
  const hint = (s?: string) => (eager ? s : s ? `auto, ${s}` : "auto");
  return (
    <picture className="block size-full">
      {art && <source media={art.media} type="image/avif" srcSet={art.shot.avif} sizes={hint(art.sizes)} width={art.shot.w} height={art.shot.h} />}
      {art && <source media={art.media} srcSet={art.shot.srcSet} sizes={hint(art.sizes)} width={art.shot.w} height={art.shot.h} />}
      <source type="image/avif" srcSet={shot.avif} sizes={hint(sizes)} />
      <img
        src={shot.src}
        srcSet={shot.srcSet}
        sizes={hint(sizes)}
        width={shot.w}
        height={shot.h}
        alt={alt}
        loading={eager ? "eager" : "lazy"}
        fetchPriority={eager ? "high" : undefined}
        decoding={eager ? undefined : "async"}
        style={{ backgroundImage: `url(${shot.lqip})` }}
        className={cn("size-full bg-cover bg-center object-cover", className)}
      />
    </picture>
  );
}
