import { H1, P, type H1Props, type PProps } from '@/components/typography';

import { cn } from '@/utils/cn';
import { cva, type VariantProps } from 'class-variance-authority';

export function LayoutHeaderDescription({ children, className, ...props }: PProps) {
  return (
    <P
      className={cn('max-w-[750px] text-sm text-muted-foreground sm:text-xl', className)}
      {...props}
    >
      {children}
    </P>
  );
}

export function LayoutHeaderHeading({ children, className, ...props }: H1Props) {
  return (
    <H1
      className={cn('text-xl font-semibold capitalize tracking-tighter md:text-xl ', className)}
      {...props}
    >
      {children}
    </H1>
  );
}

const headerVariants = cva('p-4 py-8 md:px-8', {
  variants: {
    type: {
      default: '',
      sticky:
        'sticky top-[var(--mantine-header-height)] z-10 border-b border-b-slate-200/80 bg-white',
    },
  },
  defaultVariants: {
    type: 'default',
  },
});

export function LayoutHeader({
  className,
  children,
  type,
  ...props
}: React.HTMLAttributes<HTMLElement> & VariantProps<typeof headerVariants>) {
  return (
    <header className={cn(headerVariants({ type, className }))} {...props}>
      {children}
    </header>
  );
}

export function LayoutMain({ className, children, ...props }: React.HTMLAttributes<HTMLElement>) {
  return (
    <section className={cn('p-4 md:p-8', className)} {...props}>
      {children}
    </section>
  );
}

export function Layout({
  children,
  ...props
}: React.HTMLAttributes<HTMLElement> & {
  children: React.ReactNode;
}) {
  return <article {...props}>{children}</article>;
}

export {
  LayoutHeaderDescription as Description,
  LayoutHeader as Header,
  LayoutHeaderHeading as Heading,
  LayoutMain as Main,
  Layout as Root,
};
