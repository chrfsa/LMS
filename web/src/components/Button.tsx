import { ButtonHTMLAttributes } from 'react';
import clsx from 'clsx';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary';
}

export function Button({ variant = 'primary', className, children, ...props }: ButtonProps) {
  return (
    <button
      className={clsx(
        'px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed',
        {
          'bg-vibeen-accent text-vibeen-dark hover:bg-vibeen-accent/90 active:scale-95':
            variant === 'primary',
          'bg-vibeen-card text-gray-300 border border-gray-700 hover:border-gray-600 active:scale-95':
            variant === 'secondary',
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
