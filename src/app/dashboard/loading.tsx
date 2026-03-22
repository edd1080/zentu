export default function DashboardLoading() {
  return (
    <div className="flex flex-col h-full w-full bg-(--surface-background) overflow-y-auto animate-pulse">
      <div className="h-20 bg-white border-b border-(--surface-border) shrink-0" />
      <div className="w-full max-w-3xl mx-auto px-4 py-6 flex flex-col gap-8">
        <div className="flex flex-col gap-2">
          <div className="h-8 w-52 bg-(--surface-muted) rounded-xl" />
          <div className="h-4 w-72 bg-(--surface-muted) rounded-lg" />
        </div>
        <div className="h-24 bg-(--surface-muted) rounded-2xl" />
        <div className="h-64 bg-(--surface-muted) rounded-2xl" />
      </div>
    </div>
  );
}
