export default function LoginLoading() {
  return (
    <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="bg-white rounded-2xl shadow-xl border border-slate-200 p-8 space-y-6">
          <div className="text-center space-y-3">
            <div className="w-16 h-16 bg-slate-200 rounded-xl mx-auto animate-pulse" />
            <div className="h-8 w-32 bg-slate-200 rounded mx-auto animate-pulse" />
            <div className="h-4 w-48 bg-slate-100 rounded mx-auto animate-pulse" />
          </div>
          <div className="space-y-4">
            <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-12 bg-slate-100 rounded-xl animate-pulse" />
            <div className="h-12 bg-emerald-100 rounded-xl animate-pulse" />
          </div>
        </div>
      </div>
    </div>
  );
}
