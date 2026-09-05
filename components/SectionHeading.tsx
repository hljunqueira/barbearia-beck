import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface SectionHeadingProps {
  eyebrow: string;
  title: ReactNode;
  description?: string;
  align?: 'center' | 'left';
  className?: string;
}

const Ornament = () => (
  <span aria-hidden className="inline-flex items-center gap-2 text-brand-gold">
    <span className="h-px w-8 bg-brand-gold/60" />
    <span className="text-[10px]">&#10022;</span>
    <span className="h-px w-8 bg-brand-gold/60" />
  </span>
);

export const SectionHeading = ({
  eyebrow,
  title,
  description,
  align = 'center',
  className,
}: SectionHeadingProps) => {
  const centered = align === 'center';

  return (
    <div
      className={cn(
        'flex max-w-3xl flex-col gap-5',
        centered ? 'mx-auto items-center text-center' : 'items-start text-left',
        className,
      )}
    >
      <p className="flex items-center gap-4 font-display text-[11px] font-semibold uppercase tracking-[0.35em] text-brand-gold">
        {centered && <span className="h-px w-8 bg-brand-gold/60" />}
        {eyebrow}
        {centered && <span className="h-px w-8 bg-brand-gold/60" />}
      </p>
      <h2 className="font-display text-3xl font-bold uppercase leading-tight tracking-wide text-brand-cream sm:text-4xl lg:text-5xl">
        {title}
      </h2>
      <Ornament />
      {description && (
        <p className="max-w-2xl text-base leading-relaxed text-brand-cream/65 sm:text-lg">
          {description}
        </p>
      )}
    </div>
  );
};

export default SectionHeading;
