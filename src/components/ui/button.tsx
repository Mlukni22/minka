'use client';

import * as React from 'react';
import { cn } from '@/lib/utils';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'accent';
type ButtonSize = 'sm' | 'md' | 'lg';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  asChild?: boolean;
}

const variantClasses: Record<ButtonVariant, string> = {
  primary: 'bg-[#111111] text-white hover:bg-[#1f1f1f] focus-visible:outline-[#111111]',
  secondary:
    'bg-white text-[#111111] border border-[#0000001a] hover:bg-[#111111]/5 focus-visible:outline-[#111111]',
  ghost: 'bg-transparent text-[#111111] hover:bg-[#111111]/10 focus-visible:outline-[#111111]',
  accent:
    'bg-[#8C6BFF] text-white hover:bg-[#7a59ef] focus-visible:outline-[#8C6BFF]',
};

const sizeClasses: Record<ButtonSize, string> = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3 text-base',
  lg: 'px-7 py-3.5 text-lg',
};

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  (
    {
      className,
      variant = 'primary',
      size = 'md',
      type = 'button',
      disabled,
      children,
      asChild = false,
      ...rest
    },
    ref,
  ) => {
    const classes = cn(
      'inline-flex items-center justify-center rounded-full font-semibold tracking-tight transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 disabled:cursor-not-allowed disabled:opacity-50',
      sizeClasses[size],
      variantClasses[variant],
      className,
    );

    if (asChild && React.isValidElement(children)) {
      const child = children as React.ReactElement<any>;
      return React.cloneElement(child, {
        className: cn(classes, child.props?.className),
      } as any);
    }

    return (
      <button
        ref={ref}
        type={type}
        disabled={disabled}
        className={classes}
        {...rest}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';
