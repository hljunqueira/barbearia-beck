'use client';

import { useEffect, useState } from 'react';
import { Clock } from 'lucide-react';
import { cn } from '@/lib/utils';

interface OpenStatusBadgeProps {
  compact?: boolean;
  className?: string;
}

interface StatusState {
  isOpen: boolean;
  text: string;
}

function computeStatus(): StatusState {
  // Obter hora em horário de Brasília / SC (UTC-3)
  const now = new Date();
  const day = now.getDay(); // 0 = Dom, 1 = Seg, 2 = Ter, ..., 6 = Sab
  const hour = now.getHours();
  const minute = now.getMinutes();
  const timeInMinutes = hour * 60 + minute;

  // Horários em minutos
  const h8 = 8 * 60;
  const h14 = 14 * 60;
  const h18 = 18 * 60;
  const h19 = 19 * 60;

  // Domingo: Fechado
  if (day === 0) {
    return { isOpen: false, text: 'Fechado agora • Abre seg às 14h' };
  }

  // Segunda: 14h às 19h
  if (day === 1) {
    if (timeInMinutes < h14) {
      return { isOpen: false, text: 'Fechado agora • Abre hoje às 14h' };
    }
    if (timeInMinutes >= h14 && timeInMinutes < h19) {
      return { isOpen: true, text: 'Aberto agora até às 19h' };
    }
    return { isOpen: false, text: 'Fechado agora • Abre amanhã às 08h' };
  }

  // Terça a Sexta: 08h às 19h
  if (day >= 2 && day <= 5) {
    if (timeInMinutes < h8) {
      return { isOpen: false, text: 'Fechado agora • Abre hoje às 08h' };
    }
    if (timeInMinutes >= h8 && timeInMinutes < h19) {
      return { isOpen: true, text: 'Aberto agora até às 19h' };
    }
    const nextDay = day === 5 ? 'amanhã às 08h' : 'amanhã às 08h';
    return { isOpen: false, text: `Fechado agora • Abre ${nextDay}` };
  }

  // Sábado: 08h às 18h
  if (day === 6) {
    if (timeInMinutes < h8) {
      return { isOpen: false, text: 'Fechado agora • Abre hoje às 08h' };
    }
    if (timeInMinutes >= h8 && timeInMinutes < h18) {
      return { isOpen: true, text: 'Aberto agora até às 18h' };
    }
    return { isOpen: false, text: 'Fechado agora • Abre seg às 14h' };
  }

  return { isOpen: false, text: 'Ordem de chegada' };
}

export const OpenStatusBadge = ({ compact = false, className }: OpenStatusBadgeProps) => {
  const [status, setStatus] = useState<StatusState>({
    isOpen: true,
    text: 'Aberto agora até às 19h',
  });

  useEffect(() => {
    setStatus(computeStatus());
    const timer = setInterval(() => {
      setStatus(computeStatus());
    }, 60000); // recalcula a cada 1 minuto

    return () => clearInterval(timer);
  }, []);

  if (compact) {
    return (
      <div
        className={cn(
          'inline-flex items-center gap-2 rounded-full border px-2.5 py-1 text-[11px] font-medium tracking-wide transition-colors',
          status.isOpen
            ? 'border-emerald-500/40 bg-emerald-950/40 text-emerald-300'
            : 'border-amber-500/40 bg-amber-950/40 text-amber-300',
          className,
        )}
      >
        <span className="relative flex h-2 w-2">
          {status.isOpen && (
            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
          )}
          <span
            className={cn(
              'relative inline-flex h-2 w-2 rounded-full',
              status.isOpen ? 'bg-emerald-400' : 'bg-amber-400',
            )}
          />
        </span>
        <span>{status.text}</span>
      </div>
    );
  }

  return (
    <div
      className={cn(
        'flex items-center gap-3 rounded-lg border p-4 shadow-sm backdrop-blur-sm',
        status.isOpen
          ? 'border-emerald-500/40 bg-emerald-950/30 text-emerald-200'
          : 'border-amber-500/40 bg-amber-950/30 text-amber-200',
        className,
      )}
    >
      <div className="relative flex h-3 w-3 shrink-0">
        {status.isOpen && (
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-emerald-400 opacity-75" />
        )}
        <span
          className={cn(
            'relative inline-flex h-3 w-3 rounded-full',
            status.isOpen ? 'bg-emerald-400' : 'bg-amber-400',
          )}
        />
      </div>

      <div className="flex flex-1 items-center justify-between gap-2">
        <div>
          <p className="font-display text-xs font-bold uppercase tracking-wider">
            {status.isOpen ? 'Barbearia Aberta' : 'Barbearia Fechada'}
          </p>
          <p className="text-xs text-brand-cream/70">{status.text}</p>
        </div>
        <Clock className="h-4 w-4 shrink-0 text-brand-gold/70" />
      </div>
    </div>
  );
};

export default OpenStatusBadge;
