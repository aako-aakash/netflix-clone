import { useEffect, useState } from "react";
import { Search, Menu, X, ChevronDown } from "lucide-react";
import { Link, useLocation } from "react-router-dom";
import { useProfile } from "../hooks/useProfile";

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false);
  const [open, setOpen] = useState(false);
  const [profileMenuOpen, setProfileMenuOpen] = useState(false);
  const { pathname } = useLocation();
  const { activeProfile, clearProfile } = useProfile();

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20);
    onScroll();
    window.addEventListener("scroll", onScroll);
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  useEffect(() => {
    setOpen(false);
    setProfileMenuOpen(false);
  }, [pathname]);

  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setOpen(false);
        setProfileMenuOpen(false);
      }
    };

    document.addEventListener("keydown", onKeyDown);

    if (open) document.body.style.overflow = "hidden";
    else document.body.style.overflow = "";

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.body.style.overflow = "";
    };
  }, [open]);

  const linkClass = (to: string) =>
    [
      "block rounded-md px-3 py-2 text-sm transition-colors",
      pathname === to
        ? "bg-white/10 text-white"
        : "text-white/80 hover:text-white hover:bg-white/5",
    ].join(" ");

  return (
    <header
      className={[
        "fixed top-0 left-0 right-0 z-50 transition-colors",
        scrolled
          ? "bg-black/90 backdrop-blur border-b border-white/10"
          : "bg-gradient-to-b from-black/80 to-transparent",
      ].join(" ")}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
        <div className="flex items-center gap-4">
          <button
            className="md:hidden inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:bg-white/10"
            onClick={() => setOpen(true)}
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>

          <Link to="/" className="text-red-600 font-extrabold text-xl tracking-tight">
            NETFLIX
          </Link>

          <nav className="hidden md:flex items-center gap-4 text-sm text-white/80">
            <Link className={pathname === "/" ? "text-white" : "hover:text-white"} to="/">
              Home
            </Link>
            <span className="opacity-60">TV Shows</span>
            <span className="opacity-60">Movies</span>
            <span className="opacity-60">New & Popular</span>
            <Link
              className={pathname === "/my-list" ? "text-white" : "hover:text-white"}
              to="/my-list"
            >
              My List
            </Link>
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/search"
            className="inline-flex items-center gap-2 rounded-md border border-white/15 bg-white/5 px-3 py-1.5 text-sm text-white/90 hover:bg-white/10"
          >
            <Search size={16} />
            <span className="hidden sm:inline">Search</span>
          </Link>

          {activeProfile && (
            <div className="relative">
              <button
                onClick={() => setProfileMenuOpen((v) => !v)}
                className="inline-flex items-center gap-2 rounded-md border border-white/10 bg-white/5 px-2 py-1.5 hover:bg-white/10"
              >
                <img
                  src={activeProfile.avatar}
                  alt={activeProfile.name}
                  className="h-8 w-8 rounded object-cover"
                />
                <span className="hidden sm:inline text-sm text-white/90">
                  {activeProfile.name}
                </span>
                <ChevronDown size={16} className="text-white/70" />
              </button>

              {profileMenuOpen && (
                <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl border border-white/10 bg-zinc-950 shadow-2xl">
                  <div className="border-b border-white/10 px-4 py-3">
                    <div className="text-sm font-medium text-white">
                      {activeProfile.name}
                    </div>
                    <div className="text-xs text-white/45">
                      Active profile
                    </div>
                  </div>

                  <button
                    onClick={clearProfile}
                    className="w-full px-4 py-3 text-left text-sm text-white/80 hover:bg-white/5 hover:text-white"
                  >
                    Switch Profile
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div
        className={[
          "fixed inset-0 z-[60] bg-black/60 transition-opacity md:hidden",
          open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
        ].join(" ")}
        onClick={() => setOpen(false)}
        aria-hidden={!open}
      />

      <aside
        className={[
          "fixed top-0 left-0 z-[70] h-full w-[82%] max-w-[320px] md:hidden",
          "bg-zinc-950 border-r border-white/10 shadow-2xl",
          "transition-transform duration-200 ease-out",
          open ? "translate-x-0" : "-translate-x-full",
        ].join(" ")}
        role="dialog"
        aria-modal="true"
        aria-label="Mobile navigation"
      >
        <div className="flex items-center justify-between px-4 py-4 border-b border-white/10">
          <div className="text-red-600 font-extrabold text-lg tracking-tight">NETFLIX</div>
          <button
            className="inline-flex items-center justify-center rounded-md p-2 text-white/90 hover:bg-white/10"
            onClick={() => setOpen(false)}
            aria-label="Close menu"
          >
            <X size={20} />
          </button>
        </div>

        {activeProfile && (
          <div className="flex items-center gap-3 border-b border-white/10 px-4 py-4">
            <img
              src={activeProfile.avatar}
              alt={activeProfile.name}
              className="h-10 w-10 rounded object-cover"
            />
            <div>
              <div className="text-sm font-medium text-white">{activeProfile.name}</div>
              <button
                onClick={clearProfile}
                className="text-xs text-white/50 hover:text-white"
              >
                Switch Profile
              </button>
            </div>
          </div>
        )}

        <div className="px-3 py-3">
          <Link to="/" className={linkClass("/")}>
            Home
          </Link>

          <div className="mt-2 text-xs uppercase tracking-wide text-white/40 px-3">
            Browse
          </div>

          <button className="w-full text-left rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5">
            TV Shows
          </button>
          <button className="w-full text-left rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5">
            Movies
          </button>
          <button className="w-full text-left rounded-md px-3 py-2 text-sm text-white/70 hover:bg-white/5">
            New & Popular
          </button>

          <Link to="/my-list" className={linkClass("/my-list")}>
            My List
          </Link>

          <div className="mt-4 border-t border-white/10 pt-4">
            <Link to="/search" className={linkClass("/search")}>
              <span className="inline-flex items-center gap-2">
                <Search size={16} /> Search
              </span>
            </Link>
          </div>
        </div>
      </aside>
    </header>
  );
}