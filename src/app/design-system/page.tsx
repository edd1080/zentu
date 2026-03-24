import { ColorsSection } from "./sections/ColorsSection";
import { TypographySection } from "./sections/TypographySection";
import { ButtonsSection } from "./sections/ButtonsSection";
import { InputsSection } from "./sections/InputsSection";
import { CardsSection } from "./sections/CardsSection";
import { NavSection } from "./sections/NavSection";
import { ComponentsSection } from "./sections/ComponentsSection";

export default function DesignSystemPage() {
  return (
    <>
      <div className="mb-12">
        <h1 className="text-3xl font-semibold text-slate-900 tracking-tight mb-2">Design System</h1>
        <p className="text-sm text-slate-500">
          Fuente de verdad visual para el rediseño de AGENTI.
          Color primario universal: <code className="text-[#3DC185] font-mono font-semibold">#3DC185</code>.
          Botones e inputs: <code className="font-mono text-slate-700">rounded-xl h-12</code>.
          Fuente: <code className="font-mono text-slate-700">DM Sans</code>.
        </p>
      </div>

      <ColorsSection />
      <TypographySection />
      <ButtonsSection />
      <InputsSection />
      <CardsSection />
      <NavSection />
      <ComponentsSection />
    </>
  );
}
