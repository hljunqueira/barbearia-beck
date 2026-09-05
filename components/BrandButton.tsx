import Link from 'next/link';
import type { ComponentPropsWithoutRef, ReactNode } from 'react';
import { cva, type VariantProps } from 'class-variance-authority';
import { cn } from '@/lib/utils';

/**
 * Botão do design system Beck.
 * Renderiza <Link> quando recebe `href`, senão <button>.
 */
const brandButtonVariants = cva(
  [
    'group relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-sm',
    'font-display text-xs font-semibold uppercase tracking-[0.2em]',
    'transition-all duration-300 focus-visible:outline-none focus-visible:ring-2',
    'focus-visible:ring-brand-gold focus-visible:ring-offset-2 focus-visible:ring-offset-brand-black',
    'disabled:pointer-events-none disabled:opacity-50',
  ].join(' '),
  {
    variants: {
      variant: {
        gold: 'bg-gold-gradient text-brand-black shadow-gold hover:-translate-y-0.5 hover:shadow-gold-lg',
        outline:
          'border border-brand-gold/60 text-brand-gold hover:border-brand-gold hover:bg-brand-gold hover:text-brand-black',
        ghost: 'text-brand-cream/80 hover:text-brand-gold',
        dark: 'border border-white/10 bg-brand-graphite text-brand-cream hover:border-brand-gold/60 hover:text-brand-gold',
      },
      size: {
        sm: 'h-10 px-5 text-[11px]',
        md: 'h-12 px-7',
        lg: 'h-14 px-9 text-sm',
        full: 'h-12 w-full px-6',
      },
    },
    defaultVariants: {
      variant: 'gold',
      size: 'md',
    },
  },
);

type BaseProps = VariantProps<typeof brandButtonVariants> & {
  className?: string;
  children: ReactNode;
};

type LinkButtonProps = BaseProps &
  Omit<ComponentPropsWithoutRef<typeof Link>, 'className' | 'children'> & {
    href: string;
  };

type NativeButtonProps = BaseProps &
  Omit<ComponentPropsWithoutRef<'button'>, 'className' | 'children'> & {
    href?: undefined;
  };

export type BrandButtonProps = LinkButtonProps | NativeButtonProps;

const Shine = () => (
  <span
    aria-hidden
    className="pointer-events-none absolute inset-y-0 left-0 w-1/3 -translate-x-[150%] bg-white/30 blur-md group-hover:animate-shine"
  />
);

export const BrandButton = ({ variant, size, className, children, ...rest }: BrandButtonProps) => {
  const classes = cn(brandButtonVariants({ variant, size }), className);

  if (typeof rest.href === 'string') {
    const { href, ...linkProps } = rest as Omit<LinkButtonProps, keyof BaseProps>;

    return (
      <Link href={href} className={classes} {...linkProps}>
        {variant !== 'ghost' && <Shine />}
        <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
      </Link>
    );
  }

  const buttonProps = rest as Omit<NativeButtonProps, keyof BaseProps>;

  return (
    <button type="button" className={classes} {...buttonProps}>
      {variant !== 'ghost' && <Shine />}
      <span className="relative z-10 inline-flex items-center gap-2">{children}</span>
    </button>
  );
};

export default BrandButton;
