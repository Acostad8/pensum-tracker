export default function DashboardSkeleton() {
  return (
    <div className="min-h-screen bg-slate-50 dark:bg-slate-950">
      <header className="border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-slate-900">
        <div className="mx-auto flex max-w-7xl items-center justify-between gap-3 px-6 py-4">
          <div className="flex items-center gap-3">
            <SkeletonBox className="h-10 w-10 rounded-lg" />
            <div className="space-y-2">
              <SkeletonBox className="h-4 w-48" />
              <SkeletonBox className="h-3 w-72" />
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-7xl px-6 py-8">
        <div className="space-y-6">
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="card space-y-3 p-5">
                <SkeletonBox className="h-3 w-24" />
                <SkeletonBox className="h-8 w-20" />
                <SkeletonBox className="h-3 w-32" />
              </div>
            ))}
          </div>

          <div className="card space-y-3 p-6">
            <SkeletonBox className="h-4 w-48" />
            <SkeletonBox className="h-3 w-full rounded-full" />
            <div className="flex justify-between">
              <SkeletonBox className="h-3 w-24" />
              <SkeletonBox className="h-3 w-24" />
            </div>
          </div>

          <div className="flex gap-3 overflow-hidden">
            {Array.from({ length: 6 }).map((_, i) => (
              <div
                key={i}
                className="flex w-64 flex-shrink-0 flex-col rounded-xl bg-white shadow-sm ring-1 ring-slate-200 dark:bg-slate-900 dark:ring-slate-800"
              >
                <SkeletonBox className="h-12 rounded-t-xl" />
                <div className="space-y-2 p-2">
                  {Array.from({ length: 5 }).map((__, j) => (
                    <SkeletonBox key={j} className="h-16 rounded-lg" />
                  ))}
                </div>
              </div>
            ))}
          </div>

          <p className="text-center text-sm text-slate-500 dark:text-slate-400">
            Analizando tus PDFs...
          </p>
        </div>
      </main>
    </div>
  );
}

function SkeletonBox({ className = "" }) {
  return (
    <div
      className={`animate-pulse bg-slate-200 dark:bg-slate-800 ${className}`}
    />
  );
}
