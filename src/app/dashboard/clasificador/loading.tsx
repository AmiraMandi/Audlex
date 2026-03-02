export default function Loading() {
  return (
    <div className="space-y-6 animate-pulse">
      {/* Header */}
      <div className="h-8 w-48 bg-surface-tertiary rounded-lg" />
      {/* Description */}
      <div className="h-4 w-96 bg-surface-tertiary rounded" />
      {/* Progress bar skeleton */}
      <div className="h-3 w-full bg-surface-tertiary rounded-full" />
      {/* Question card */}
      <div className="h-48 bg-surface-tertiary rounded-xl" />
      {/* Options */}
      <div className="space-y-3">
        {[1, 2, 3].map((i) => (
          <div key={i} className="h-14 bg-surface-tertiary rounded-lg" />
        ))}
      </div>
      {/* Navigation buttons */}
      <div className="flex justify-between pt-4">
        <div className="h-10 w-28 bg-surface-tertiary rounded-lg" />
        <div className="h-10 w-28 bg-surface-tertiary rounded-lg" />
      </div>
    </div>
  );
}
