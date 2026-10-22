import { useState, type ReactNode } from 'react'
import {
  ArrowLeft,
  Check,
  ChevronDown,
  Footprints,
  Sparkles,
  Star,
  Store,
  UserRound,
} from 'lucide-react'
import { useStore } from '../store'
import type { AccountType, Session, SessionSizes, Style } from '../types'
import { cn } from '../utils'
import { Chip } from '../components/ui'

type AuthStep =
  | 'splash'
  | 'login'
  | 'account'
  | 'details'
  | 'styles'
  | 'sizes'
  | 'welcome'

interface AuthProps {
  onComplete: (session: Session) => void
}

interface AuthTopProps {
  step?: number
  onBack: () => void
}

const accountTypes: {
  id: AccountType
  label: string
  text: string
  icon: typeof UserRound
}[] = [
  {
    id: 'personal',
    label: 'personal',
    text: 'inspírate y comparte tu estilo.',
    icon: UserRound,
  },
  {
    id: 'marca',
    label: 'marca',
    text: 'da a conocer tus productos.',
    icon: Store,
  },
  {
    id: 'influencer',
    label: 'influencer',
    text: 'conecta y colabora con marcas.',
    icon: Star,
  },
]

const styleOptions: { value: Style; image: string; pos?: string }[] = [
  { value: 'Minimalista', image: '/images/outfits/look-blanco.jpg' },
  { value: 'Casual', image: '/images/outfits/look-tee.jpg' },
  { value: 'Streetwear', image: '/images/outfits/look-hoodie.jpg' },
  { value: 'Vintage', image: '/images/outfits/look-rugby.jpg' },
  { value: 'Boho', image: '/images/outfits/look-festival.jpg' },
  { value: 'Clásico', image: '/images/outfits/look-cena.jpg' },
]

const defaultSizes: SessionSizes = { pants: 'M', top: 'M', shoes: '38' }

const pantSizes = ['XS', 'S', 'M', 'L', 'XL']
const shoeSizes = ['36', '37', '38', '39', '40', '41', '42', '43', '44', '45']

export function Auth({ onComplete }: AuthProps) {
  const { state, notify } = useStore()
  const [step, setStep] = useState<AuthStep>('splash')
  const [accountType, setAccountType] = useState<AccountType>('personal')
  const [details, setDetails] = useState({
    name: '',
    handle: '',
    email: '',
    password: '',
  })
  const [login, setLogin] = useState({ email: '', password: '' })
  const [styles, setStyles] = useState<Style[]>([])
  const [sizes, setSizes] = useState<SessionSizes>(defaultSizes)
  const [error, setError] = useState('')

  const go = (next: AuthStep) => {
    setError('')
    setStep(next)
  }

  const toggleStyle = (value: Style) => {
    setStyles((prev) =>
      prev.includes(value) ? prev.filter((style) => style !== value) : [...prev, value],
    )
  }

  const firstName = details.name.trim().split(' ')[0] || 'bienvenida'

  const enterAsGuest = () => {
    notify('explorando la demo')
    onComplete({
      name: state.profile.name,
      handle: state.profile.handle,
      accountType: 'personal',
      styles: state.profile.styles,
      sizes: defaultSizes,
      guest: true,
      createdAt: new Date().toISOString(),
    })
  }

  const submitLogin = () => {
    if (!login.email.trim() || !login.password.trim()) {
      setError('escribe tu email y tu contraseña para entrar.')
      return
    }
    notify('sesión iniciada')
    onComplete({
      name: state.profile.name,
      handle: state.profile.handle,
      accountType: 'personal',
      styles: state.profile.styles,
      sizes: defaultSizes,
      createdAt: new Date().toISOString(),
    })
  }

  const submitDetails = () => {
    if (!details.name.trim()) {
      setError('dinos cómo te llamas.')
      return
    }
    if (!details.handle.trim() || details.handle.trim().length < 2) {
      setError('elige un nombre de usuario de al menos 2 caracteres.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(details.email.trim())) {
      setError('revisa tu email.')
      return
    }
    if (details.password.length < 4) {
      setError('la contraseña necesita al menos 4 caracteres.')
      return
    }
    go('styles')
  }

  const submitStyles = () => {
    if (styles.length < 3) {
      setError('elige al menos 3 estilos para personalizar tu feed.')
      return
    }
    go('sizes')
  }

  const finish = () => {
    notify('cuenta creada')
    onComplete({
      name: details.name.trim(),
      handle: details.handle.trim(),
      accountType,
      styles,
      sizes,
      createdAt: new Date().toISOString(),
    })
  }

  if (step === 'splash') {
    return (
      <div className="auth-screen auth-splash">
        <div className="auth-splash-center">
          <div className="auth-logo">
            tapp<i>.</i>
          </div>
        </div>

        <div className="auth-actions">
          <button
            type="button"
            className="button button--dark"
            onClick={() => go('account')}
          >
            crear cuenta
          </button>
          <button
            type="button"
            className="button button--soft"
            onClick={() => go('login')}
          >
            iniciar sesión
          </button>
          <button type="button" className="auth-skip" onClick={enterAsGuest}>
            explorar sin cuenta
          </button>
        </div>
      </div>
    )
  }

  if (step === 'login') {
    return (
      <div className="auth-screen">
        <AuthTop onBack={() => go('splash')} />

        <div className="auth-body">
          <div className="auth-step-body">
            <span className="eyebrow">de nuevo por aquí</span>
            <h1 className="auth-heading">inicia sesión</h1>
            <p className="auth-sub">
              tu feed, tus looks y tu wishlist te están esperando.
            </p>

            <div className="auth-form">
              <label className="auth-field">
                <span>email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={login.email}
                  onChange={(event) => {
                    setError('')
                    setLogin((prev) => ({ ...prev, email: event.target.value }))
                  }}
                />
              </label>
              <label className="auth-field">
                <span>contraseña</span>
                <input
                  type="password"
                  autoComplete="current-password"
                  placeholder="tu contraseña"
                  value={login.password}
                  onChange={(event) => {
                    setError('')
                    setLogin((prev) => ({ ...prev, password: event.target.value }))
                  }}
                />
              </label>
            </div>

            {error && <p className="auth-error">{error}</p>}

            <p className="auth-hint">
              <Sparkles size={12} />
              demo: cualquier email y contraseña te dejan entrar.
            </p>

            <p className="auth-switch">
              ¿aún no tienes cuenta?{' '}
              <button type="button" onClick={() => go('account')}>
                crear cuenta
              </button>
            </p>
          </div>
        </div>

        <AuthFooter>
          <button type="button" className="button button--dark" onClick={submitLogin}>
            entrar
          </button>
        </AuthFooter>
      </div>
    )
  }

  if (step === 'account') {
    return (
      <div className="auth-screen">
        <AuthTop onBack={() => go('splash')} />

        <div className="auth-body">
          <div className="auth-step-body">
            <span className="eyebrow">primer paso</span>
            <h1 className="auth-heading">¿qué tipo de cuenta eres?</h1>

            <div className="auth-options">
              {accountTypes.map(({ id, label, text, icon: Icon }) => (
                <button
                  type="button"
                  key={id}
                  className={cn('account-option', accountType === id && 'is-active')}
                  onClick={() => setAccountType(id)}
                  aria-pressed={accountType === id}
                >
                  <span className="account-icon">
                    <Icon size={20} strokeWidth={1.7} />
                  </span>
                  <span className="account-copy">
                    <strong>{label}</strong>
                    <span>{text}</span>
                  </span>
                  <span className="account-radio" />
                </button>
              ))}
            </div>
          </div>
        </div>

        <AuthFooter>
          <button
            type="button"
            className="button button--dark"
            onClick={() => go('details')}
          >
            continuar
          </button>
        </AuthFooter>
      </div>
    )
  }

  if (step === 'details') {
    return (
      <div className="auth-screen">
        <AuthTop step={1} onBack={() => go('account')} />

        <div className="auth-body">
          <div className="auth-step-body">
            <span className="eyebrow">tus datos</span>
            <h1 className="auth-heading">crea tu cuenta</h1>
            <p className="auth-sub">
              así te reconocerán en la comunidad. podrás cambiarlo después.
            </p>

            <div className="auth-form">
              <label className="auth-field">
                <span>nombre</span>
                <input
                  type="text"
                  autoComplete="name"
                  placeholder="tu nombre"
                  value={details.name}
                  onChange={(event) => {
                    setError('')
                    setDetails((prev) => ({ ...prev, name: event.target.value }))
                  }}
                />
              </label>

              <label className="auth-field">
                <span>usuario</span>
                <div className="auth-input-prefix">
                  <em>@</em>
                  <input
                    type="text"
                    autoComplete="username"
                    placeholder="tunombre"
                    value={details.handle}
                    maxLength={24}
                    onChange={(event) => {
                      setError('')
                      setDetails((prev) => ({
                        ...prev,
                        handle: event.target.value
                          .replace(/[^a-zA-Z0-9._]/g, '')
                          .toLowerCase(),
                      }))
                    }}
                  />
                </div>
              </label>

              <label className="auth-field">
                <span>email</span>
                <input
                  type="email"
                  autoComplete="email"
                  placeholder="tu@email.com"
                  value={details.email}
                  onChange={(event) => {
                    setError('')
                    setDetails((prev) => ({ ...prev, email: event.target.value }))
                  }}
                />
              </label>

              <label className="auth-field">
                <span>contraseña</span>
                <input
                  type="password"
                  autoComplete="new-password"
                  placeholder="mínimo 4 caracteres"
                  value={details.password}
                  onChange={(event) => {
                    setError('')
                    setDetails((prev) => ({ ...prev, password: event.target.value }))
                  }}
                />
              </label>
            </div>

            {error && <p className="auth-error">{error}</p>}
          </div>
        </div>

        <AuthFooter note="al continuar aceptas las normas de la comunidad.">
          <button
            type="button"
            className="button button--dark"
            onClick={submitDetails}
          >
            continuar
          </button>
        </AuthFooter>
      </div>
    )
  }

  if (step === 'styles') {
    return (
      <div className="auth-screen">
        <AuthTop step={2} onBack={() => go('details')} />

        <div className="auth-body">
          <div className="auth-step-body">
            <span className="eyebrow">tu estilo</span>
            <h1 className="auth-heading">¿qué estilos te gustan más?</h1>
            <p className="auth-sub">selecciona al menos 3.</p>

            <div className="auth-style-grid">
              {styleOptions.map((style) => {
                const active = styles.includes(style.value)
                return (
                  <button
                    type="button"
                    key={style.value}
                    className={cn('auth-style-card', active && 'is-active')}
                    onClick={() => toggleStyle(style.value)}
                    aria-pressed={active}
                  >
                    <img
                      src={style.image}
                      alt=""
                      style={{ objectPosition: style.pos }}
                    />
                    <span>{style.value}</span>
                    <span className="auth-style-check">
                      <Check size={12} strokeWidth={3} />
                    </span>
                  </button>
                )
              })}
            </div>

            <p className="auth-selection">
              {styles.length} de 6 elegidos
              <i>{styles.length < 3 ? ` · faltan ${3 - styles.length}` : ' · listo'}</i>
            </p>

            {error && <p className="auth-error">{error}</p>}
          </div>
        </div>

        <AuthFooter>
          <button
            type="button"
            className="button button--dark"
            onClick={submitStyles}
            disabled={styles.length < 3}
          >
            continuar
          </button>
        </AuthFooter>
      </div>
    )
  }

  if (step === 'sizes') {
    return (
      <div className="auth-screen">
        <AuthTop step={3} onBack={() => go('styles')} />

        <div className="auth-body">
          <div className="auth-step-body">
            <span className="eyebrow">tus medidas</span>
            <h1 className="auth-heading">¿cuáles son tus tallas?</h1>
            <p className="auth-sub">
              así podemos mostrarte solo lo que te va bien.
            </p>

            <div className="auth-size-list">
              <SizeRow
                icon={<PantsIcon />}
                label="pantalón"
                text="denim, sastrería y más"
                value={sizes.pants}
                options={pantSizes}
                onChange={(value) => setSizes((prev) => ({ ...prev, pants: value }))}
              />
              <SizeRow
                icon={<TopIcon />}
                label="camiseta"
                text="tops, jerséis y chaquetas"
                value={sizes.top}
                options={pantSizes}
                onChange={(value) => setSizes((prev) => ({ ...prev, top: value }))}
              />
              <SizeRow
                icon={<Footprints size={21} strokeWidth={1.5} />}
                label="calzado"
                text="zapatillas, botas y sandalias"
                value={sizes.shoes}
                options={shoeSizes}
                onChange={(value) => setSizes((prev) => ({ ...prev, shoes: value }))}
              />
            </div>

            <p className="auth-size-note">
              podrás ajustarlas cuando quieras desde tu perfil.
            </p>
          </div>
        </div>

        <AuthFooter>
          <button
            type="button"
            className="button button--dark"
            onClick={() => go('welcome')}
          >
            continuar
          </button>
        </AuthFooter>
      </div>
    )
  }

  return (
    <div className="auth-screen">
      <AuthTop step={4} onBack={() => go('sizes')} />

      <div className="auth-body auth-body--welcome">
        <div className="auth-step-body auth-welcome">
          <span className="auth-welcome-icon">
            <Check size={26} strokeWidth={2.6} />
          </span>
          <span className="eyebrow">
            cuenta{' '}
            {accountTypes.find((type) => type.id === accountType)?.label ?? 'personal'}
          </span>
          <h1 className="auth-welcome-title">
            bienvenida, <span className="proper-name">{firstName}</span>.
          </h1>
          <p>
            tu cuenta está lista y tu feed ya habla tu idioma. empieza por los
            looks que más te inspiren.
          </p>

          <div className="auth-welcome-chips">
            {styles.map((style) => (
              <Chip key={style}>{style}</Chip>
            ))}
          </div>

          <div className="auth-welcome-meta">
            pantalón {sizes.pants} · camiseta {sizes.top} · calzado {sizes.shoes}
          </div>
        </div>
      </div>

      <AuthFooter>
        <button type="button" className="button button--dark" onClick={finish}>
          entrar en tapp
        </button>
      </AuthFooter>
    </div>
  )
}

function AuthTop({ step, onBack }: AuthTopProps) {
  return (
    <header className="auth-top">
      <button type="button" className="auth-back" onClick={onBack} aria-label="volver">
        <ArrowLeft size={18} strokeWidth={1.8} />
      </button>

      {step ? (
        <>
          <div className="auth-progress" aria-hidden="true">
            {[1, 2, 3, 4].map((value) => (
              <span key={value} className={value <= step ? 'is-on' : undefined} />
            ))}
          </div>
          <span className="auth-step">{step}/4</span>
        </>
      ) : (
        <span className="auth-top-spacer" />
      )}
    </header>
  )
}

function AuthFooter({
  children,
  note,
}: {
  children: ReactNode
  note?: string
}) {
  return (
    <footer className="auth-footer">
      {children}
      {note && <p className="auth-footer-note">{note}</p>}
    </footer>
  )
}

function SizeRow({
  icon,
  label,
  text,
  value,
  options,
  onChange,
}: {
  icon: ReactNode
  label: string
  text: string
  value: string
  options: string[]
  onChange: (value: string) => void
}) {
  return (
    <div className="auth-size-row">
      <span className="auth-size-icon">{icon}</span>
      <span className="auth-size-copy">
        <strong>{label}</strong>
        <small>{text}</small>
      </span>
      <span className="auth-select">
        <select
          aria-label={`talla de ${label}`}
          value={value}
          onChange={(event) => onChange(event.target.value)}
        >
          {options.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        <ChevronDown size={13} strokeWidth={2} />
      </span>
    </div>
  )
}

function PantsIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M8 3h8l1.1 17h-3.4L12 11.5 10.3 20H6.9L8 3Z" />
      <path d="M8.3 7.4h7.4" />
    </svg>
  )
}

function TopIcon() {
  return (
    <svg
      width="21"
      height="21"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d="M9 3.5 5.5 5.6 4 9.2l3 1.2V20h10V10.4l3-1.2-1.5-3.6L15 3.5a3 3 0 0 1-6 0Z" />
    </svg>
  )
}

