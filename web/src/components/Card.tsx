import { HTMLAttributes } from 'react';
import clsx from 'clsx';

interface CardProps extends HTMLAttributes<HTMLDivElement> {}

export function Card({ className, children, ...props }: CardProps) {
  return (
    <div
      className={clsx(
        'bg-vibeen-card border border-gray-800 rounded-xl p-6 shadow-lg',
        className
      )}
      {...props}
    >
      {children}
    </div>
  );
}
