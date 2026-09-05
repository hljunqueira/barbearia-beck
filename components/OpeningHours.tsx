import { CalendarDays, Clock, MapPin, Timer, Users } from 'lucide-react';
import { SITE, fullAddress, mapsLink } from '@/lib/site';
import { OpenStatusBadge } from '@/components/OpenStatusBadge';
import { cn } from '@/lib/utils';

const NOTE_ICONS = [Timer, Users, Clock] as const;

interface OpeningHoursProps {
  className?: string;
}

/** Quadro de horários moderno e executivo (status em tempo real, slots e endereço). */
export const OpeningHours = ({ className }: OpeningHoursProps) => (
  <div
    data-testid="opening-hours"
    className={cn(
      'relative overflow-hidden rounded-2xl border border-brand-gold/30 bg-brand-graphite/80 p-6 shadow-card backdrop-blur-md sm:p-8 lg:p-10',
      className,
    )}
  >
    {/* Efeito sutil de luz e grão */}
    <div className="pointer-events-none absolute inset-0 bg-grain opacity-[0.05] mix-blend-overlay" />
    <div className="pointer-events-none absolute inset-x-0 top-0 h-px bg-gold-line" />

    {/* Topo: Título da Seção de Horários e Status Aberto/Fechado */}
    <div className="relative flex flex-col justify-between gap-4 border-b border-white/10 pb-6 sm:flex-row sm:items-center">
      <div>
        <span className="font-display text-xs font-bold uppercase tracking-[0.25em] text-brand-gold">
          Funcionamento
        </span>
        <h3 className="mt-1 font-display text-xl font-black uppercase tracking-wide text-brand-cream sm:text-2xl">
          Horários de Atendimento
        </h3>
      </div>
      <OpenStatusBadge />
    </div>

    {/* Slots dos Dias da Semana */}
    <div className="relative mt-6 grid gap-4 sm:grid-cols-3">
      {SITE.hours
        .filter((slot) => slot.open)
        .map((slot) => (
          <div
            key={slot.days}
            className="group relative overflow-hidden rounded-xl border border-white/10 bg-brand-black/70 p-5 text-center transition-all duration-300 hover:border-brand-gold/50 hover:shadow-gold"
          >
            <CalendarDays className="mx-auto h-5 w-5 text-brand-gold transition-transform duration-300 group-hover:scale-110" />
            <p className="mt-3 font-display text-[11px] font-bold uppercase tracking-[0.2em] text-brand-cream/70">
              {slot.days}
            </p>
            <p className="mt-2 font-display text-2xl font-black text-brand-gold">{slot.time}</p>
          </div>
        ))}
    </div>

    {/* Notas de Atendimento */}
    <ul className="relative mt-6 grid gap-3 sm:grid-cols-3">
      {SITE.serviceNotes.map((note, index) => {
        const Icon = NOTE_ICONS[index] ?? Clock;

        return (
          <li
            key={note}
            className="flex items-center gap-3 rounded-lg border border-white/5 bg-brand-black/40 px-4 py-3 text-xs font-medium text-brand-cream/80"
          >
            <Icon className="h-4 w-4 shrink-0 text-brand-gold" />
            <span>{note}</span>
          </li>
        );
      })}
    </ul>

    {/* Banner Inferior: Slogan + Endereço */}
    <div className="relative mt-6 flex flex-col items-center justify-between gap-6 rounded-xl border border-brand-gold/30 bg-gold-gradient p-6 text-brand-black sm:flex-row sm:px-8">
      <div>
        <p className="font-display text-2xl font-black uppercase tracking-wide text-brand-black sm:text-3xl">
          {SITE.slogans.walkIn}
        </p>
        <p className="text-xs font-bold uppercase tracking-[0.25em] text-brand-black/80">
          Atendimento por ordem de chegada — sem hora marcada
        </p>
      </div>

      <a
        href={mapsLink()}
        target="_blank"
        rel="noreferrer"
        className="group flex shrink-0 items-center gap-2 rounded-lg bg-brand-black px-5 py-3 font-display text-xs font-bold uppercase tracking-wider text-brand-gold transition-all duration-300 hover:bg-brand-black/90 hover:shadow-card hover:scale-105"
      >
        <MapPin className="h-4 w-4 text-brand-gold" />
        <span>Ver no Google Maps</span>
      </a>
    </div>

    <div className="relative mt-4 text-center sm:text-left">
      <a
        href={mapsLink()}
        target="_blank"
        rel="noreferrer"
        className="group inline-flex items-center gap-2 text-xs text-brand-cream/60 transition-colors hover:text-brand-gold"
      >
        <MapPin className="h-3.5 w-3.5 text-brand-gold/70" />
        <span>{fullAddress()}</span>
      </a>
    </div>
  </div>
);

export default OpeningHours;
