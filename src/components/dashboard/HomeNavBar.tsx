/** Mobile-only sticky top bar for the home page — shows the logo centered. */
export function HomeNavBar() {
  return (
    <div className="md:hidden sticky top-0 z-10 bg-white/90 backdrop-blur-md border-b border-slate-100/80 flex items-center justify-center h-16 shrink-0 px-5">
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/logo.svg" alt="Agenti" style={{ height: "28px", width: "auto" }} />
    </div>
  );
}
