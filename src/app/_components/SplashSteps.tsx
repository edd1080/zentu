import { Icon } from "@/components/ui/Icon";

export function Step1() {
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="h-[55%] w-full bg-[#F4F6F9] relative overflow-hidden flex flex-col items-center justify-end px-4">
        <div className="blur-[80px] bg-blue-400/20 w-[60%] h-[60%] rounded-full absolute top-[-10%] left-[-10%]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[60%] h-[60%] bg-[#3DC185]/20 rounded-full blur-[80px]" />
        <div className="relative w-full max-w-[280px] bg-white rounded-t-3xl border border-b-0 border-slate-200 shadow-xl flex flex-col overflow-hidden translate-y-4">
          <div className="flex gap-2 shrink-0 bg-slate-50 border-b border-slate-100 px-4 py-3 items-center">
            <div className="w-8 h-8 rounded-full bg-slate-200 flex items-center justify-center">
              <Icon name="solar:user-rounded-linear" size={15} className="text-slate-500" />
            </div>
            <p className="text-xs font-semibold text-slate-800">Cliente Web</p>
          </div>
          <div className="p-4 flex flex-col gap-3">
            <div className="self-start bg-slate-100 text-slate-700 rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm max-w-[90%]">
              Hola, ¿tienen disponibilidad para mañana en la tarde?
            </div>
            <div className="self-end bg-[#3DC185] text-white rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm max-w-[90%] shadow-sm mt-1">
              ¡Hola! Sí, tenemos un espacio a las 4:30 PM. ¿Te lo reservo a tu nombre?
            </div>
          </div>
        </div>
        <div className="absolute top-[15%] right-[10%] px-4 py-2 bg-white rounded-2xl shadow-lg border border-slate-50 flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#3DC185]" />
          <span className="text-xs font-semibold text-slate-700">Responde en 1s</span>
        </div>
      </div>
      <div className="flex flex-col -mt-6 z-20 text-center bg-white flex-1 rounded-t-3xl pt-14 px-8 pb-4 items-center">
        <h2 className="text-3xl font-medium text-slate-900 tracking-tight mb-4">Respuestas 24/7</h2>
        <p className="text-sm text-slate-500 leading-relaxed px-2">
          Tu agente de IA responde inmediatamente a los clientes de tu negocio en WhatsApp, sin pausas ni descansos.
        </p>
      </div>
    </div>
  );
}

export function Step2() {
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="h-[55%] w-full bg-[#F4F6F9] relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute top-[-20%] right-[-10%] w-[70%] h-[70%] bg-indigo-400/15 rounded-full blur-[80px]" />
        <div className="absolute bottom-[-10%] left-[-10%] w-[50%] h-[50%] bg-[#3DC185]/15 rounded-full blur-[80px]" />
        <div className="relative w-full max-w-[280px] bg-white rounded-[2rem] border border-slate-200 shadow-xl p-4 flex flex-col gap-4 rotate-1">
          <div className="flex items-start gap-2">
            <div className="w-8 h-8 rounded-full bg-slate-100 shrink-0 flex items-center justify-center">
              <Icon name="solar:user-linear" size={15} className="text-slate-500" />
            </div>
            <div className="bg-slate-50 border border-slate-100 rounded-2xl rounded-tl-sm px-3 py-2.5 text-sm text-slate-700">
              ¿Qué incluye la limpieza profunda?
            </div>
          </div>
          <div className="relative bg-indigo-50/60 border border-indigo-100 rounded-2xl p-4 overflow-hidden">
            <div className="flex items-center gap-1.5 mb-2.5">
              <Icon name="solar:magic-stick-3-linear" size={15} className="text-indigo-500" />
              <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Sugerencia IA</span>
            </div>
            <p className="text-sm text-slate-700 mb-4">Incluye destartraje, profilaxis, pulido y flúor. ¿Deseas agendar?</p>
            <div className="w-full bg-indigo-600 text-white rounded-xl h-10 text-sm font-semibold flex items-center justify-center gap-2">
              Aprobar y Enviar <Icon name="solar:plain-linear" size={14} />
            </div>
          </div>
        </div>
      </div>
      <div className="h-[45%] bg-white px-8 pt-10 pb-4 flex flex-col items-center text-center rounded-t-3xl -mt-6 relative z-20">
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-4">Aprende de tu negocio</h2>
        <p className="text-sm text-slate-500 leading-relaxed px-2">
          Sube tus documentos y PDFs. Zentu sabrá exactamente qué y cómo responder a tus clientes automáticamente.
        </p>
      </div>
    </div>
  );
}

export function Step3() {
  return (
    <div className="absolute inset-0 flex flex-col bg-white">
      <div className="h-[55%] w-full bg-[#F4F6F9] relative overflow-hidden flex items-center justify-center px-4">
        <div className="absolute top-[10%] left-[10%] w-[60%] h-[60%] bg-[#3DC185]/20 rounded-full blur-[80px]" />
        <div className="relative w-full max-w-[280px] bg-white rounded-[2rem] border border-slate-200 shadow-xl p-5 flex flex-col items-center text-center -rotate-1">
          <div className="w-16 h-16 rounded-full bg-emerald-50 text-emerald-500 flex items-center justify-center mb-4 ring-8 ring-emerald-50/50">
            <Icon name="solar:calendar-mark-linear" size={30} />
          </div>
          <h3 className="text-lg font-semibold text-slate-900 tracking-tight mb-1.5">¡Nueva cita agendada!</h3>
          <p className="text-sm text-slate-500 mb-5">María Fernanda reservó sola a través del chat de WhatsApp.</p>
          <div className="w-full bg-slate-50 rounded-2xl p-3.5 flex flex-col gap-2.5 border border-slate-100">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Tiempo invertido</span>
              <span className="text-xs font-semibold text-[#3DC185]">0 minutos</span>
            </div>
            <div className="w-full h-px bg-slate-200/60" />
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-500">Intervención manual</span>
              <span className="text-xs font-semibold text-slate-900">0%</span>
            </div>
          </div>
        </div>
      </div>
      <div className="h-[45%] bg-white px-8 pt-10 pb-4 flex flex-col items-center text-center rounded-t-3xl -mt-6 relative z-20">
        <h2 className="text-3xl font-semibold text-slate-900 tracking-tight mb-4">Multiplica tus ventas</h2>
        <p className="text-sm text-slate-500 leading-relaxed px-2">
          No pierdas más clientes por demorar en responder. Convierte más prospectos de manera automática.
        </p>
      </div>
    </div>
  );
}
