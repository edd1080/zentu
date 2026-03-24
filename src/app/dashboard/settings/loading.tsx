export default function SettingsLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto animate-pulse">
      <div className="h-14 bg-white border-b border-slate-100 shrink-0" />
      <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-3">
        {[...Array(6)].map((_, i) => (
          <div key={i} className="flex items-center justify-between p-4 bg-white border border-slate-200/60 rounded-2xl">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-slate-100 shrink-0" />
              <div className="flex flex-col gap-2">
                <div className="h-3.5 w-28 bg-slate-100 rounded-lg" />
                <div className="h-3 w-40 bg-slate-100 rounded-lg" />
              </div>
            </div>
            <div className="w-5 h-5 bg-slate-100 rounded-lg" />
          </div>
        ))}
      </div>
    </div>
  );
}
