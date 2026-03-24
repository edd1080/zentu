export default function HistoryLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto animate-pulse">
      <div className="h-14 bg-white border-b border-slate-100 shrink-0" />
      <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-3">
        {[...Array(8)].map((_, i) => (
          <div key={i} className="flex flex-col gap-2 p-4 bg-white border border-slate-200/60 rounded-2xl">
            <div className="flex items-center justify-between">
              <div className="h-3.5 w-24 bg-slate-100 rounded-lg" />
              <div className="h-3 w-16 bg-slate-100 rounded-lg" />
            </div>
            <div className="h-3 w-full bg-slate-100 rounded-lg" />
            <div className="h-3 w-3/4 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
