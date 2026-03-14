import type { MockTitle } from "../data/mock";
import PosterCard from "./PosterCard";

export default function ResultsGrid({
  items,
  onPick,
  isInList,
  onToggleList,
}: {
  items: MockTitle[];
  onPick: (item: MockTitle) => void;
  isInList?: (id: number) => boolean;
  onToggleList?: (item: MockTitle) => void;
}) {
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
      {items.map((item) => (
        <div key={item.id} className="flex justify-center">
          <PosterCard
            item={item}
            onClick={onPick}
            isInList={isInList ? isInList(item.id) : false}
            onToggleList={onToggleList}
          />
        </div>
      ))}
    </div>
  );
}