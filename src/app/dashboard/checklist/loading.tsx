export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-8 w-44 bg-surface-tertiary rounded-lg" />
      {/* Progress */}
      <div className="h-3 w-full bg-surface-tertiary rounded-full" />
      {/* Checklist items */}
      <div className="space-y-3">
        {[1, 2, 3, 4, 5, 6].map((i) => (
          <div key={i} className="h-16 bg-surface-tertiary rounded-xl" />
        ))}
      </div>
    </div>
  );
}
