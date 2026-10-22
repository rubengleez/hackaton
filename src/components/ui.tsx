import { useEffect, type ReactNode } from 'react'
import {
  Bookmark,
  Check,
  Home,
  MessageCircle,
  Plus,
  User,
  X,
} from 'lucide-react'
import type { Creator } from '../types'
import { cn } from '../utils'

export function Avatar({
  creator,
  size = 40,
  className,
}: {
  creator: Creator
  size?: number
  className?: string
}) {
  return (
    <span
      className={cn('avatar', className)}
      style={{ width: size, height: size, flexBasis: size }}
      aria-hidden="true"
    >
      <img src={creator.avatar} alt="" />
    </span>
  )
}

export function IconButton({
  label,
  children,
  onClick,
  variant = 'glass',
  className,
  active,
}: {
  label: string
  children: ReactNode
  onClick?: () => void
  variant?: 'glass' | 'light' | 'dark' | 'plain'
  className?: string
  active?: boolean
}) {
  return (
    <button
      type="button"
      className={cn('icon-button', `icon-button--${variant}`, active && 'is-active', className)}
      aria-label={label}
      onClick={onClick}
    >
      {children}
    </button>
  )
}

export function Chip({
  children,
  active,
  onClick,
  tone = 'default',
  className,
}: {
  children: ReactNode
  active?: boolean
  onClick?: () => void
  tone?: 'default' | 'dark' | 'accent' | 'ghost'
  className?: string
}) {
  const Component = onClick ? 'button' : 'span'
  return (
    <Component
      type={onClick ? 'button' : undefined}
      className={cn('chip', `chip--${tone}`, active && 'is-active', className)}
      onClick={onClick}
    >
      {children}
    </Component>
  )
}

export function FollowButton({
  following,
  onClick,
  compact,
}: {
  following: boolean
  onClick: () => void
  compact?: boolean
}) {
  return (
    <button
      type="button"
      className={cn('follow-button', following && 'is-following', compact && 'is-compact')}
      onClick={onClick}
    >
      {following ? 'siguiendo' : 'seguir'}
    </button>
  )
}

export function Sheet({
  title,
  subtitle,
  onClose,
  children,
  className,
  full,
  hideHandle,
}: {
  title?: string
  subtitle?: string
  onClose: () => void
  children: ReactNode
  className?: string
  full?: boolean
  hideHandle?: boolean
}) {
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKeyDown)
    return () => window.removeEventListener('keydown', onKeyDown)
  }, [onClose])

  return (
    <div className="sheet-layer">
      <button
        type="button"
        className="sheet-backdrop"
        aria-label="Cerrar panel"
        onClick={onClose}
      />
      <section
        className={cn('sheet-panel', full && 'sheet-panel--full', className)}
        role="dialog"
        aria-modal="true"
        aria-label={title ?? 'Panel'}
      >
        {!hideHandle && <div className="sheet-grabber" />}
        {(title || subtitle) && (
          <header className="sheet-header">
            <div>
              {title && <h2>{title}</h2>}
              {subtitle && <p>{subtitle}</p>}
            </div>
            <button type="button" className="sheet-close" onClick={onClose} aria-label="Cerrar">
              <X size={19} />
            </button>
          </header>
        )}
        <div className="sheet-body">{children}</div>
      </section>
    </div>
  )
}

export function Toast({ message }: { message: string }) {
  return (
    <div className="toast" role="status" aria-live="polite">
      <span className="toast-icon">
        <Check size={14} strokeWidth={3} />
      </span>
      {message}
    </div>
  )
}

export function EmptyState({
  icon,
  title,
  text,
  action,
  onAction,
}: {
  icon: ReactNode
  title: string
  text: string
  action?: string
  onAction?: () => void
}) {
  return (
    <div className="empty-state">
      <div className="empty-icon">{icon}</div>
      <h3>{title}</h3>
      <p>{text}</p>
      {action && (
        <button type="button" className="button button--dark" onClick={onAction}>
          {action}
        </button>
      )}
    </div>
  )
}

export type Tab = 'feed' | 'search' | 'saved' | 'profile' | 'messages'

export function BottomNav({
  current,
  onChange,
  onCreate,
}: {
  current: Tab
  onChange: (tab: Tab) => void
  onCreate: () => void
}) {
  const items = [
    { id: 'feed' as const, icon: Home, label: 'main' },
    { id: 'messages' as const, icon: MessageCircle, label: 'mensajes' },
    { id: 'saved' as const, icon: Bookmark, label: 'wishlist' },
    { id: 'profile' as const, icon: User, label: 'perfil' },
  ]

  return (
    <nav className="bottom-nav" aria-label="navegación principal">
      {items.slice(0, 2).map((item) => (
        <NavItem
          key={item.id}
          {...item}
          active={current === item.id}
          onClick={() => onChange(item.id)}
        />
      ))}
      <button
        type="button"
        className="nav-create"
        onClick={onCreate}
        aria-label="publicar look"
      >
        <Plus size={24} strokeWidth={2.4} />
      </button>
      {items.slice(2).map((item) => (
        <NavItem
          key={item.id}
          {...item}
          active={current === item.id}
          onClick={() => onChange(item.id)}
        />
      ))}
    </nav>
  )
}

function NavItem({
  icon: Icon,
  label,
  active,
  onClick,
}: {
  icon: typeof Home
  label: string
  active: boolean
  onClick: () => void
}) {
  return (
    <button
      type="button"
      className={cn('nav-item', active && 'is-active')}
      onClick={onClick}
      aria-label={label}
    >
      <Icon size={20} strokeWidth={active ? 2.4 : 1.8} />
    </button>
  )
}

export function ScreenHeader({
  eyebrow,
  title,
  action,
  children,
}: {
  eyebrow?: string
  title: string
  action?: ReactNode
  children?: ReactNode
}) {
  return (
    <header className="screen-header">
      <div className="screen-header-row">
        <div>
          {eyebrow && <span className="eyebrow">{eyebrow}</span>}
          <h1>{title}</h1>
        </div>
        {action}
      </div>
      {children}
    </header>
  )
}
