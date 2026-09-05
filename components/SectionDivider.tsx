import { cn } from '@/lib/utils';

export type DividerMotif = 'clipper' | 'brush' | 'razor' | 'scissors';

interface SectionDividerProps {
  motif?: DividerMotif;
  subtitle?: string;
  className?: string;
  withGlow?: boolean;
}

/**
 * Ilustrações SVG vetoriais detalhadas em padrão ouro clássico:
 * - Máquina de corte profissional (clipper) com lâmina de aço e corpo texturizado
 * - Pincel de barba clássico com cerdas macias e cabo torneado
 * - Navalha de barbear tradicional aberta
 */
const ICONS = {
  clipper: (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-9 w-9 text-brand-gold"
      aria-label="Máquina de corte"
    >
      {/* Lâmina com dentes de precisão */}
      <rect x="22" y="6" width="20" height="5" rx="1" fill="currentColor" opacity="0.9" />
      <path
        d="M23 6V4M26 6V4M29 6V4M32 6V4M35 6V4M38 6V4M41 6V4"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
      />
      {/* Cabeça metálica da máquina */}
      <path
        d="M20 11L22 17H42L44 11H20Z"
        fill="currentColor"
        opacity="0.8"
      />
      <line x1="24" y1="14" x2="40" y2="14" stroke="#0A0A0A" strokeWidth="1.2" />
      {/* Corpo ergonômico */}
      <path
        d="M22 17C22 17 20 28 21 39C21.8 47 25 56 27 58H37C39 56 42.2 47 43 39C44 28 42 17 42 17H22Z"
        fill="#181818"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Detalhes de textura e ranhuras antiderrapantes */}
      <line x1="26" y1="23" x2="38" y2="23" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="25" y1="27" x2="39" y2="27" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="25" y1="31" x2="39" y2="31" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <line x1="26" y1="35" x2="38" y2="35" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      {/* Botão de força / acionamento */}
      <rect x="30" y="41" width="4" height="8" rx="1" fill="currentColor" />
      {/* Alça / Cabo na base */}
      <path d="M29 58V61C29 61.5 30 62 32 62C34 62 35 61.5 35 61V58" stroke="currentColor" strokeWidth="1.5" />
    </svg>
  ),

  brush: (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-9 w-9 text-brand-gold"
      aria-label="Pincel de barba"
    >
      {/* Cerdas em leque volumosas */}
      <path
        d="M17 12C17 12 21 4 32 4C43 4 47 12 47 12C47 12 50 20 46 29C42 37 39 38 39 38H25C25 38 22 37 18 29C14 20 17 12 17 12Z"
        fill="currentColor"
        opacity="0.25"
      />
      {/* Cerdas detalhadas internas */}
      <path
        d="M20 28C22 18 25 7 32 6C39 7 42 18 44 28M24 29C27 20 30 10 32 10C34 10 37 20 40 29M28 29C30 22 31 15 32 15C33 15 34 22 36 29"
        stroke="currentColor"
        strokeWidth="1.2"
        strokeLinecap="round"
        opacity="0.8"
      />
      {/* Anel metálico (virola) */}
      <rect x="23" y="37" width="18" height="4" rx="1" fill="currentColor" />
      <line x1="23" y1="39" x2="41" y2="39" stroke="#0A0A0A" strokeWidth="0.8" />
      {/* Cabo clássico torneado em resina / madeira nobre */}
      <path
        d="M25 41C25 41 23 45 22 49C21 53 23 57 26 59C28 60 30 60.5 32 60.5C34 60.5 36 60 38 59C41 57 43 53 42 49C41 45 39 41 39 41H25Z"
        fill="#181818"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Friso dourado no cabo */}
      <path d="M24 51C26 53 38 53 40 51" stroke="currentColor" strokeWidth="1" opacity="0.6" />
      <circle cx="32" cy="55" r="1.5" fill="currentColor" opacity="0.8" />
    </svg>
  ),

  razor: (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-9 w-9 text-brand-gold"
      aria-label="Navalha clássica"
    >
      {/* Lâmina aberta em ângulo */}
      <path
        d="M32 30L55 10C55 10 57 8 59 10C61 12 59 14 59 14L37 34L32 30Z"
        fill="currentColor"
        opacity="0.85"
      />
      <path d="M37 30L57 12" stroke="#0A0A0A" strokeWidth="1" strokeLinecap="round" />
      {/* Fio de corte da navalha */}
      <line x1="33" y1="33" x2="57" y2="12" stroke="#FFFFFF" strokeWidth="1" opacity="0.8" />
      {/* Pino de articulação (pivot pin) */}
      <circle cx="32" cy="32" r="3.5" fill="#181818" stroke="currentColor" strokeWidth="1.5" />
      <circle cx="32" cy="32" r="1.5" fill="currentColor" />
      {/* Cabo / Tala tradicional curvada */}
      <path
        d="M32 32C32 32 28 42 20 48C12 54 5 57 5 57C5 57 7 59 10 58C18 55 27 49 33 37L32 32Z"
        fill="#181818"
        stroke="currentColor"
        strokeWidth="1.5"
      />
      {/* Ranhura interna da tala onde a lâmina se acomoda */}
      <path d="M26 42C21 47 14 52 9 55" stroke="currentColor" strokeWidth="0.8" opacity="0.5" />
    </svg>
  ),

  scissors: (
    <svg
      viewBox="0 0 64 64"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="h-9 w-9 text-brand-gold"
      aria-label="Tesoura de barbeiro"
    >
      {/* Lâminas cruzadas */}
      <path d="M16 12L42 42M48 12L22 42" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
      <circle cx="32" cy="27" r="2.5" fill="#181818" stroke="currentColor" strokeWidth="1.5" />
      {/* Anéis para os dedos */}
      <circle cx="18" cy="48" r="6" stroke="currentColor" strokeWidth="2" />
      <circle cx="46" cy="48" r="6" stroke="currentColor" strokeWidth="2" />
      {/* Apoio de dedo (tang) */}
      <path d="M52 48C54 46 56 42 56 39" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
    </svg>
  ),
};

export const SectionDivider = ({
  motif = 'clipper',
  subtitle,
  className,
  withGlow = true,
}: SectionDividerProps) => {
  return (
    <div
      aria-hidden="true"
      className={cn('relative my-6 flex w-full flex-col items-center justify-center py-6', className)}
    >
      {/* Linhas decorativas laterais em gradiente dourado */}
      <div className="flex w-full items-center justify-center gap-4 px-4 sm:gap-8">
        <span className="h-px flex-1 bg-gradient-to-r from-transparent via-brand-gold/50 to-brand-gold" />

        {/* Emblema central estilizado */}
        <div className="relative flex flex-col items-center">
          {withGlow && (
            <div className="pointer-events-none absolute -inset-3 rounded-full bg-brand-gold/15 blur-md" />
          )}

          <div className="relative flex h-16 w-16 items-center justify-center rounded-full border border-brand-gold/60 bg-gradient-to-b from-brand-graphite to-brand-black p-3 shadow-gold transition-transform duration-500 hover:scale-110">
            {ICONS[motif]}
          </div>

          {subtitle && (
            <span className="mt-3 text-center font-display text-[10px] font-semibold uppercase tracking-[0.35em] text-brand-gold/80">
              {subtitle}
            </span>
          )}
        </div>

        <span className="h-px flex-1 bg-gradient-to-l from-transparent via-brand-gold/50 to-brand-gold" />
      </div>
    </div>
  );
};

export default SectionDivider;
