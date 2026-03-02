export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="h-8 w-56 bg-surface-tertiary rounded-lg" />
        <div className="h-10 w-40 bg-surface-tertiary rounded-lg" />
      </div>
      {/* Systems list */}
      <div className="space-y-3">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-20 bg-surface-tertiary rounded-xl" />
        ))}
      </div>
    </div>
  );
}
