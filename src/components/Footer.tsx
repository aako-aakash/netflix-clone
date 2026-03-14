import { Github, Linkedin } from "lucide-react";

export default function Footer() {
  return (
    <footer className="mt-16 border-t border-white/10 bg-black/60">
      <div className="mx-auto max-w-6xl px-4 py-10 text-white/55">

        <div className="grid gap-8 md:grid-cols-3">

          {/* Project */}
          <div>
            <div className="text-sm font-semibold tracking-wide text-white/80">
              NETFLIX CLONE
            </div>

            <p className="mt-3 text-sm leading-relaxed">
              A Netflix-inspired streaming UI built with React, TypeScript,
              Tailwind, and TMDB API. Created for learning modern frontend
              architecture and API integration.
            </p>
          </div>

          {/* Pages */}
          <div>
            <div className="text-sm font-semibold tracking-wide text-white/80">
              PROJECT
            </div>

            <ul className="mt-3 space-y-2 text-sm">
              <li>Home</li>
              <li>Search</li>
              <li>My List</li>
              <li>Movie Details</li>
              <li>Watch Page</li>
            </ul>
          </div>

          {/* Credits */}
          <div>
            <div className="mt-3 space-y-3 text-sm">

              <p className="text-white/85 font-medium">
                BUILT BY <strong>AAKASH</strong>
              </p>

              <div className="flex items-center gap-4">

                <a
                  href="https://github.com/aako-aakash"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Github size={20} />
                </a>

                <a
                  href="https://www.linkedin.com/in/akash-kumar-saw-bb1630258"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-white transition"
                >
                  <Linkedin size={20} />
                </a>

              </div>

              <p className="text-xs text-white/40">
                This product uses the TMDB API but is not endorsed or certified by TMDB.
              </p>

            </div>
          </div>

        </div>

        <div className="mt-8 flex flex-col gap-2 border-t border-white/10 pt-4 text-xs text-white/40 md:flex-row md:items-center md:justify-between">
          <span>© 2026 Netflix Clone UI</span>
          <span>Designed and developed by AAKASH</span>
        </div>

      </div>
    </footer>
  );
}