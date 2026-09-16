'use client';

import { useEffect } from 'react';
import { X } from 'lucide-react';
import { BrandButton } from '@/components/BrandButton';

interface SubscriberManualModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function SubscriberManualModal({
  isOpen,
  onClose,
}: SubscriberManualModalProps) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6">
      {/* Backdrop 100% Sólido */}
      <div
        className="fixed inset-0 bg-black/90 backdrop-blur-md transition-opacity"
        onClick={onClose}
      />

      {/* Container do Modal Amplo 4-Grid */}
      <div className="relative w-full max-w-4xl max-h-[92vh] overflow-y-auto bg-[#141414] border border-white/15 rounded-lg shadow-2xl p-6 sm:p-8 text-brand-cream z-10 custom-scrollbar">
        {/* Cabeçalho */}
        <div className="flex items-center justify-between border-b border-white/10 pb-4 mb-6">
          <div>
            <p className="text-[10px] font-mono tracking-widest text-brand-gold uppercase">
              Beck Barbearia • Clube da Barba
            </p>
            <h2 className="font-display text-xl font-bold text-brand-cream uppercase tracking-wide">
              Manual de Uso do Assinante
            </h2>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 rounded text-white/50 hover:text-brand-cream hover:bg-white/5 transition"
            aria-label="Fechar"
          >
            <X size={18} />
          </button>
        </div>

        {/* Introdução Sóbria */}
        <div className="mb-6 p-4 rounded bg-black/60 border border-white/10">
          <p className="text-xs text-brand-cream/80 leading-relaxed">
            Bem-vindo ao clube oficial da Beck Barbearia. Este regulamento estabelece as diretrizes para garantir uma experiência de excelência, pontualidade britânica e comodidade a todos os nossos membros.
          </p>
        </div>

        {/* 4 BLOCOS EM GRID HORIZONTAL */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {/* Bloco 1: Agendamentos */}
          <div className="p-4 rounded bg-black/40 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] font-bold text-brand-gold uppercase tracking-wider block mb-2">
                01 • Agendamentos
              </span>
              <h3 className="font-display text-sm font-bold text-brand-cream mb-2 uppercase">
                Acesso & Horários
              </h3>
              <p className="text-xs text-brand-cream/70 leading-relaxed">
                Agende diretamente pelo portal informando seu telefone cadastrado. Selecione seu barbeiro preferido e o horário de sua conveniência sem intermediários.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-white/5 text-[11px] font-mono text-brand-cream/50">
              Disponibilidade em tempo real
            </div>
          </div>

          {/* Bloco 2: Pontualidade */}
          <div className="p-4 rounded bg-black/40 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] font-bold text-brand-gold uppercase tracking-wider block mb-2">
                02 • Pontualidade
              </span>
              <h3 className="font-display text-sm font-bold text-brand-cream mb-2 uppercase">
                Tolerância & Prazos
              </h3>
              <p className="text-xs text-brand-cream/70 leading-relaxed">
                Pedimos a gentileza de chegar 5 minutos antes. A tolerância para atrasos é de até 10 minutos. Cancelamentos ou trocas devem ser feitos com no mínimo 2 horas de antecedência.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-white/5 text-[11px] font-mono text-brand-cream/50">
              Respeito ao tempo do membro
            </div>
          </div>

          {/* Bloco 3: Benefícios Exclusivos */}
          <div className="p-4 rounded bg-black/40 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] font-bold text-brand-gold uppercase tracking-wider block mb-2">
                03 • Benefícios
              </span>
              <h3 className="font-display text-sm font-bold text-brand-cream mb-2 uppercase">
                Lounge & Loja
              </h3>
              <p className="text-xs text-brand-cream/70 leading-relaxed">
                Assinantes ativos contam com 15% de desconto imediato em pomadas, óleos e balms da barbearia, além de bebidas de cortesia à vontade em nosso lounge executivo.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-white/5 text-[11px] font-mono text-brand-gold">
              Desconto de 15% em produtos
            </div>
          </div>

          {/* Bloco 4: Manutenção do Plano */}
          <div className="p-4 rounded bg-black/40 border border-white/10 flex flex-col justify-between">
            <div>
              <span className="font-mono text-[10px] font-bold text-brand-gold uppercase tracking-wider block mb-2">
                04 • Renovação
              </span>
              <h3 className="font-display text-sm font-bold text-brand-cream mb-2 uppercase">
                Ciclos & Suporte
              </h3>
              <p className="text-xs text-brand-cream/70 leading-relaxed">
                A mensalidade é renovada automaticamente a cada 30 dias. Alterações de cartão ou pausas temporárias por viagens podem ser solicitadas diretamente com o suporte.
              </p>
            </div>
            <div className="pt-3 mt-3 border-t border-white/5 text-[11px] font-mono text-brand-cream/50">
              Sem fidelidade abusiva
            </div>
          </div>
        </div>

        {/* Rodapé com Fechar */}
        <div className="flex items-center justify-between pt-4 border-t border-white/10">
          <p className="text-[11px] text-brand-cream/50">
            Dúvidas adicionais? Fale com a gerência pelo WhatsApp oficial da barbearia.
          </p>
          <BrandButton onClick={onClose} className="px-6 py-2 text-xs">
            Compreendi as Diretrizes
          </BrandButton>
        </div>
      </div>
    </div>
  );
}
