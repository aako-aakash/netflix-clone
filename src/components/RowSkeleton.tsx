import Skeleton from "./Skeleton";

export default function RowSkeleton({ title }: { title: string }) {
  return (
    <section className="mt-6">
      <div className="mx-auto max-w-6xl px-4">
        <div className="mb-3">
          <Skeleton className="h-5 w-40" />
        </div>

        <div className="hide-scrollbar flex gap-3 overflow-x-auto py-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <Skeleton key={i} className="h-[270px] w-[180px] shrink-0" />
          ))}
        </div>
      </div>
    </section>
  );
}