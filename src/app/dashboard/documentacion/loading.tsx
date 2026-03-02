export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-52 bg-surface-tertiary rounded-lg" />
        <div className="h-10 w-36 bg-surface-tertiary rounded-lg" />
      </div>
      {/* Document cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-36 bg-surface-tertiary rounded-xl" />
        ))}
      </div>
    </div>
  );
}
