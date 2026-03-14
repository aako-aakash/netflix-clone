import { useState } from "react";
import Footer from "../components/Footer";
import Navbar from "../components/Navbar";
import ResultsGrid from "../components/ResultsGrid";
import TitleModal from "../components/TitleModal";
import { useMyList } from "../hooks/useMyList";
import type { MockTitle } from "../data/mock";

export default function MyList() {
  const myList = useMyList();
  const [selected, setSelected] = useState<MockTitle | null>(null);

  return (
    <div className="min-h-screen bg-black text-white">
      <Navbar />

      <main className="pt-20 mx-auto max-w-6xl px-4 pb-16">
        <div className="flex items-end justify-between gap-4 flex-wrap">
          <div>
            <h1 className="text-2xl font-semibold">My List</h1>
            <p className="mt-1 text-white/60 text-sm">
              Saved movies (persisted in localStorage).
            </p>
          </div>

          {myList.list.length > 0 && (
            <button
              onClick={myList.clear}
              className="text-sm text-white/70 hover:text-white underline underline-offset-4"
            >
              Clear all
            </button>
          )}
        </div>

        <div className="mt-8">
          {myList.list.length === 0 ? (
            <div className="rounded-lg border border-white/10 bg-white/5 p-4 text-white/70">
              Your list is empty.
              <div className="mt-1 text-sm text-white/50">
                Open any movie → Add to My List.
              </div>
            </div>
          ) : (
            <ResultsGrid items={myList.list} onPick={setSelected} />
          )}
        </div>
      </main>

      <Footer />
      
      {selected && (
        <TitleModal
          item={selected}
          onClose={() => setSelected(null)}
          isInList={myList.isInList(selected.id)}
          onToggleList={myList.toggle}
        />
      )}
    </div>
  );
}