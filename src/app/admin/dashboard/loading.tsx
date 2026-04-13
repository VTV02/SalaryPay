export default function DashboardLoading() {
  return (
    <div className="min-h-screen bg-slate-50">
      {/* Header skeleton */}
      <div className="bg-white border-b border-slate-200 px-6 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-slate-200 animate-pulse" />
          <div>
            <div className="h-5 w-24 bg-slate-200 rounded animate-pulse" />
            <div className="h-3 w-40 bg-slate-100 rounded animate-pulse mt-1" />
          </div>
        </div>
        <div className="h-8 w-20 bg-slate-200 rounded-lg animate-pulse" />
      </div>

      {/* Tab skeleton */}
      <div className="bg-white border-b border-slate-200 px-6 py-2 flex gap-4">
        {[1, 2, 3, 4].map(i => (
          <div key={i} className="h-8 w-28 bg-slate-100 rounded animate-pulse" />
        ))}
      </div>

      {/* Content skeleton */}
      <div className="max-w-5xl mx-auto p-8 space-y-6">
        <div className="bg-white rounded-2xl border border-slate-200 p-8 space-y-6">
          <div className="h-6 w-48 bg-slate-200 rounded animate-pulse" />
          <div className="space-y-4">
            {[1, 2, 3].map(i => (
              <div key={i} className="flex gap-4">
                <div className="h-10 flex-1 bg-slate-100 rounded-lg animate-pulse" />
                <div className="h-10 flex-1 bg-slate-100 rounded-lg animate-pulse" />
              </div>
            ))}
          </div>
          <div className="h-12 w-48 bg-emerald-100 rounded-xl animate-pulse" />
        </div>
      </div>
    </div>
  );
}
