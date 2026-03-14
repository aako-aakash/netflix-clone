import { X, Clapperboard } from "lucide-react";
import { useEffect, useRef } from "react";

export default function TrailerPlayer({
  open,
  title,
  trailerUrl,
  onClose,
}: {
  open: boolean;
  title: string;
  trailerUrl: string;
  onClose: () => void;
}) {
  const closeRef = useRef(onClose);
  closeRef.current = onClose;

  useEffect(() => {
    if (!open) return;

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeRef.current();
    };

    document.addEventListener("keydown", onKeyDown);
    document.body.style.overflow = "hidden";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/85 p-4"
      onClick={() => closeRef.current()}
    >
      <div
        className="relative w-full max-w-6xl overflow-hidden rounded-2xl border border-white/10 bg-black shadow-2xl"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={() => closeRef.current()}
          className="absolute right-3 top-3 z-20 rounded-full bg-black/60 p-2 text-white hover:bg-black/80"
          aria-label="Close trailer"
        >
          <X size={18} />
        </button>

        <div className="flex items-center gap-2 border-b border-white/10 bg-zinc-950 px-5 py-4">
          <Clapperboard size={18} className="text-white/80" />
          <div className="text-sm font-medium text-white/85">
            Playing trailer: {title}
          </div>
        </div>

        {trailerUrl ? (
          <div className="aspect-video w-full bg-black">
            <iframe
              src={trailerUrl}
              title={`${title} trailer`}
              className="h-full w-full"
              allow="autoplay; encrypted-media; picture-in-picture"
              allowFullScreen
            />
          </div>
        ) : (
          <div className="flex aspect-video w-full items-center justify-center bg-zinc-950 text-white/60">
            Trailer not available for this title.
          </div>
        )}
      </div>
    </div>
  );
}