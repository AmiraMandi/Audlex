export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header skeleton */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-48 bg-surface-tertiary rounded-lg" />
        <div className="h-10 w-32 bg-surface-tertiary rounded-lg" />
      </div>
      {/* Stats cards skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-28 bg-surface-tertiary rounded-xl" />
        ))}
      </div>
      {/* Charts skeleton */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="h-64 bg-surface-tertiary rounded-xl" />
        <div className="h-64 bg-surface-tertiary rounded-xl" />
      </div>
      {/* Activity skeleton */}
      <div className="h-48 bg-surface-tertiary rounded-xl" />
    </div>
  );
}
