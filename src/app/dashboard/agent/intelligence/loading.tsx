export default function IntelligenceLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto animate-pulse">
      <div className="h-14 bg-white border-b border-slate-100 shrink-0" />
      <div className="w-full max-w-3xl mx-auto p-4 space-y-8">
        <div className="flex gap-2">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="h-7 w-24 bg-white border border-slate-200/60 rounded-full" />
          ))}
        </div>
        <div className="grid grid-cols-2 gap-3">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-24 bg-white border border-slate-200/60 rounded-2xl" />
          ))}
          <div className="col-span-2 h-20 bg-white border border-slate-200/60 rounded-2xl" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
          <div className="h-32 bg-white border border-slate-200/60 rounded-2xl" />
        </div>
      </div>
    </div>
  );
}
