'use client';

import { useState } from 'react';
import { ChevronDown, HelpCircle } from 'lucide-react';
import { SectionHeading } from '@/components/SectionHeading';
import { cn } from '@/lib/utils';

const FAQS = [
  {
    question: 'Como funciona o atendimento por ordem de chegada? Costuma demorar?',
    answer:
      'Nosso atendimento é direto e sem burocracia: você chega, aguarda confortavelmente no sofá com TV e bebida gelada, e senta na cadeira do barbeiro disponível. Funcionamos sem fechar ao meio-dia para você aproveitar inclusive o horário de almoço.',
  },
  {
    question: 'Por que os planos do Clube da Barba são válidos somente de segunda a quarta-feira?',
    answer:
      'Essa regra é planejada para garantir máxima comodidade aos assinantes. Nos dias de menor movimento, você corta o cabelo ou alinha a barba sem filas, com atendimento exclusivo e atencioso, além de conseguirmos praticar uma mensalidade muito mais barata (com até 50% de economia).',
  },
  {
    question: 'Como funciona a cobrança do Clube da Barba? Tem fidelidade ou multa?',
    answer:
      'Zero burocracia. O pacote tem validade de 30 dias corridos a contar da data de pagamento. Você pode pagar via Pix ou Cartão de crédito. Não há contrato de fidelidade nem pegadinhas: você renova mês a mês conforme sua conveniência.',
  },
  {
    question: 'Onde fica a Beck Barbearia e tem estacionamento?',
    answer:
      'Estamos localizados na Avenida Barriga Verde, 300, no Centro de Balneário Arroio do Silva/SC. A região conta com facilidade para estacionar veículos em frente e nas vias adjacentes com total segurança.',
  },
  {
    question: 'Posso fazer cabelo e barba no mesmo atendimento?',
    answer:
      'Sim! Tanto no serviço avulso (Combo Corte + Barba por R$ 60,00 com toalha quente e navalha) quanto no plano mensal "Cortes + Barba Ilimitados" (R$ 149,90/mês), você sai com o visual 100% renovado na mesma sessão.',
  },
];

export const FaqSection = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (index: number) => {
    setOpenIndex((prev) => (prev === index ? null : index));
  };

  return (
    <section
      id="duvidas"
      data-testid="faq-section"
      className="relative scroll-mt-20 border-t border-white/5 bg-brand-black py-24 lg:py-32"
    >
      <div className="container relative max-w-4xl">
        <SectionHeading
          eyebrow="Tire Suas Dúvidas"
          title={
            <>
              Perguntas{' '}
              <span className="bg-gold-gradient bg-clip-text text-transparent">frequentes</span>
            </>
          }
          description="Tudo o que você precisa saber sobre o nosso atendimento por ordem de chegada e o Clube da Barba."
        />

        <div className="mt-14 space-y-4">
          {FAQS.map((faq, index) => {
            const isOpen = openIndex === index;

            return (
              <div
                key={index}
                className={cn(
                  'overflow-hidden rounded-xl border bg-brand-graphite/70 backdrop-blur-sm transition-all duration-300',
                  isOpen
                    ? 'border-brand-gold/60 shadow-gold'
                    : 'border-white/10 hover:border-white/20',
                )}
              >
                <button
                  type="button"
                  onClick={() => toggle(index)}
                  aria-expanded={isOpen}
                  className="flex w-full cursor-pointer items-center justify-between gap-4 p-5 text-left transition-colors sm:p-6"
                >
                  <span className="flex items-center gap-3.5 font-display text-sm font-semibold uppercase tracking-wide text-brand-cream sm:text-base">
                    <HelpCircle className="h-4 w-4 shrink-0 text-brand-gold" />
                    {faq.question}
                  </span>
                  <ChevronDown
                    className={cn(
                      'h-5 w-5 shrink-0 text-brand-gold transition-transform duration-300',
                      isOpen ? 'rotate-180' : 'rotate-0',
                    )}
                  />
                </button>

                <div
                  className={cn(
                    'grid transition-all duration-300 ease-in-out',
                    isOpen ? 'grid-rows-[1fr] opacity-100' : 'grid-rows-[0fr] opacity-0',
                  )}
                >
                  <div className="overflow-hidden">
                    <p className="border-t border-white/5 px-5 pb-6 pt-4 text-sm leading-relaxed text-brand-cream/70 sm:px-6">
                      {faq.answer}
                    </p>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FaqSection;
