export default function ConversationsLoading() {
  return (
    <div className="flex flex-1 overflow-hidden w-full h-full animate-pulse">
      <section className="flex flex-col w-full md:w-[380px] bg-[#FDFDFD] border-r border-slate-100 shrink-0 h-full">
        <div className="h-14 bg-white border-b border-slate-100 shrink-0" />
        <div className="px-5 pt-4 pb-3 border-b border-slate-100/80 bg-white shrink-0 flex flex-col gap-4">
          <div className="h-9 bg-slate-100 rounded-xl" />
          <div className="h-9 bg-slate-100 rounded-xl" />
          <div className="flex gap-2">
            <div className="h-7 w-16 bg-slate-100 rounded-full" />
            <div className="h-7 w-20 bg-slate-100 rounded-full" />
            <div className="h-7 w-24 bg-slate-100 rounded-full" />
          </div>
        </div>
        <div className="flex-1 overflow-hidden flex flex-col divide-y divide-slate-100">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="flex items-center gap-3 px-5 py-4">
              <div className="w-10 h-10 rounded-full bg-slate-100 shrink-0" />
              <div className="flex-1 flex flex-col gap-2">
                <div className="h-3.5 w-32 bg-slate-100 rounded-lg" />
                <div className="h-3 w-48 bg-slate-100 rounded-lg" />
              </div>
            </div>
          ))}
        </div>
      </section>
      <div className="flex-1 hidden md:flex items-center justify-center bg-slate-50/50">
        <div className="w-16 h-16 rounded-full bg-slate-100" />
      </div>
    </div>
  );
}
