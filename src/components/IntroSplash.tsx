import { useEffect, useState } from "react";

export default function IntroSplash({
  onDone,
}: {
  onDone: () => void;
}) {
  const [hide, setHide] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setHide(true), 2200);
    const t2 = setTimeout(() => onDone(), 2800);

    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, [onDone]);

  return (
    <div
      className={[
        "fixed inset-0 z-[200] flex items-center justify-center bg-black transition-opacity duration-500",
        hide ? "opacity-0" : "opacity-100",
      ].join(" ")}
    >
      <div className="relative flex flex-col items-center">
        <div className="intro-netflix-logo text-red-600 font-extrabold tracking-tight">
          NETFLIX
        </div>
        <div className="mt-4 h-[2px] w-32 overflow-hidden rounded bg-white/10">
          <div className="intro-loader h-full bg-red-600" />
        </div>
      </div>
    </div>
  );
}