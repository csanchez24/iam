import { cn } from '@/utils/cn';

export type H1Props = React.HTMLAttributes<HTMLHeadingElement>;

export const H1 = ({ className, children, ...props }: H1Props) => {
  return (
    <h1
      className={cn('scroll-m-20 text-3xl font-extrabold tracking-tight md:text-5xl', className)}
      {...props}
    >
      {children}
    </h1>
  );
};

export type H2Props = React.HTMLAttributes<HTMLHeadingElement>;

export const H2 = ({ className, children, ...props }: H2Props) => {
  return (
    <h2
      className={cn(
        'scroll-m-20 text-3xl font-semibold tracking-tight transition-colors',
        className
      )}
      {...props}
    >
      {children}
    </h2>
  );
};

export type H3Props = React.HTMLAttributes<HTMLHeadingElement>;

export const H3 = ({ className, children, ...props }: H3Props) => {
  return (
    <h3 className={cn('scroll-m-20 text-2xl font-semibold tracking-tight', className)} {...props}>
      {children}
    </h3>
  );
};

export type H4Props = React.HTMLAttributes<HTMLHeadingElement>;

export const H4 = ({ className, children, ...props }: H4Props) => {
  <h4 className={cn('scroll-m-20 text-xl font-semibold tracking-tight', className)} {...props}>
    {children}
  </h4>;
};

export type PProps = React.HTMLAttributes<HTMLParagraphElement>;

export const P = ({ className, children, ...props }: PProps) => {
  return (
    <p className={cn('leading-7', className)} {...props}>
      {children}
    </p>
  );
};
