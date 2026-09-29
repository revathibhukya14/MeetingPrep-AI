import type { ButtonHTMLAttributes, ReactNode } from 'react'
import { Link } from 'react-router-dom'

type ButtonVariant = 'primary' | 'secondary' | 'ghost'

interface CommonProps {
  children: ReactNode
  className?: string
  variant?: ButtonVariant
}

const styles: Record<ButtonVariant, string> = {
  primary:
    'bg-accent text-white hover:bg-accent-hover shadow-[0_1px_2px_rgba(20,23,28,0.12)]',
  secondary:
    'bg-white text-ink border border-line hover:border-line-strong hover:bg-sidebar',
  ghost: 'bg-transparent text-ink-soft hover:bg-accent-soft hover:text-accent',
}

const base =
  'inline-flex items-center justify-center gap-2 rounded-xl px-3.5 py-2 text-sm font-medium transition-colors duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/30 disabled:opacity-50'

export function Button({
  children,
  className = '',
  variant = 'primary',
  ...props
}: CommonProps & ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <button className={`${base} ${styles[variant]} ${className}`} {...props}>
      {children}
    </button>
  )
}

export function ButtonLink({
  children,
  className = '',
  variant = 'primary',
  to,
}: CommonProps & { to: string }) {
  return (
    <Link to={to} className={`${base} ${styles[variant]} ${className}`}>
      {children}
    </Link>
  )
}
