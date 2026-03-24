export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="fixed inset-0 bg-[#FCFDFD] flex flex-col md:justify-center items-center md:p-5 overflow-y-auto overflow-x-hidden">
      <div className="absolute inset-0 z-0 pointer-events-none overflow-hidden flex justify-center items-center">
        <div className="absolute w-[600px] h-[600px] bg-gradient-to-br from-[#3DC185]/5 to-yellow-100/10 rounded-full blur-3xl opacity-80 translate-x-1/4 translate-y-1/4" />
        <div className="absolute w-[500px] h-[500px] bg-gradient-to-tr from-transparent to-[#3DC185]/5 rounded-full blur-3xl opacity-60 -translate-x-1/4 -translate-y-1/4" />
      </div>
      <div className="relative z-10 w-full h-full md:h-auto md:max-w-[440px] bg-transparent md:bg-white md:rounded-[2.5rem] md:shadow-[0_8px_40px_rgba(0,0,0,0.04)] md:border border-slate-200/60 px-6 sm:px-10 py-10 md:py-12 flex flex-col">
        {children}
      </div>
    </div>
  );
}
