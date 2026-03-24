export default function TrainLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-[#F8F9FA] overflow-y-auto animate-pulse">
      <div className="h-14 bg-white border-b border-slate-100 shrink-0" />
      <div className="w-full max-w-2xl mx-auto px-4 py-6 flex flex-col gap-6">
        <div className="flex flex-col gap-3">
          <div className="h-4 w-40 bg-slate-100 rounded-lg" />
          <div className="h-32 bg-white border border-slate-200/60 rounded-2xl" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-4 w-36 bg-slate-100 rounded-lg" />
          <div className="h-20 bg-white border border-slate-200/60 rounded-2xl" />
        </div>
        <div className="flex flex-col gap-3">
          <div className="h-4 w-48 bg-slate-100 rounded-lg" />
          <div className="grid grid-cols-2 gap-3">
            <div className="h-28 bg-white border border-slate-200/60 rounded-2xl" />
            <div className="h-28 bg-white border border-slate-200/60 rounded-2xl" />
            <div className="h-28 bg-white border border-slate-200/60 rounded-2xl" />
            <div className="h-28 bg-white border border-slate-200/60 rounded-2xl" />
          </div>
        </div>
      </div>
    </div>
  );
}
