import { useMemo, useState } from 'react'
import {
  Heart,
  Pencil,
  RotateCcw,
  Share2,
  Shirt,
} from 'lucide-react'
import { useStore } from '../store'
import {
  copyText,
  formatCompact,
  formatPrice,
  outfitTotal,
} from '../utils'
import { EmptyState } from '../components/ui'

interface ProfileProps {
  onOpenOutfit: (outfitId: string) => void
  onEditProfile: () => void
  onOpenFollowers: (kind: 'followers' | 'following') => void
  onLogout: () => void
}

export function Profile({
  onOpenOutfit,
  onEditProfile,
  onOpenFollowers,
  onLogout,
}: ProfileProps) {
  const {
    state,
    me,
    outfits,
    products,
    resetDemo,
    notify,
  } = useStore()
  const [tab, setTab] = useState<'outfits' | 'favoritos'>('outfits')

  const myOutfits = useMemo(
    () => outfits.filter((outfit) => outfit.creatorId === 'me'),
    [outfits],
  )
  const savedOutfits = useMemo(
    () =>
      state.saved
        .map((id) => outfits.find((outfit) => outfit.id === id))
        .filter(Boolean),
    [state.saved, outfits],
  )

  const shareProfile = async () => {
    const copied = await copyText(`https://tapp.app/p/${me.handle}`)
    notify(copied ? 'Enlace del perfil copiado' : 'No se pudo copiar el enlace')
  }

  return (
    <div className="screen screen--light profile-screen">
      <div className="profile-cover">
        <img src="images/outfits/look-tee.jpg" alt="" />
        <div className="profile-cover-shade" />
        <button type="button" className="profile-cover-action" onClick={shareProfile} aria-label="Compartir perfil">
          <Share2 size={19} />
        </button>
      </div>

      <div className="profile-scroll">
        <div className="profile-avatar-wrap">
          <img src="images/avatars/sofia-profile.jpg" alt={`Foto de ${me.name}`} />
          <span className="profile-style-dot" />
        </div>

        <div className="profile-intro">
          <h1>{me.name}</h1>
          <span>@{me.handle} · {me.location}</span>
          <p>{me.bio}</p>
          <div className="profile-tags">
            {me.styles.map((style) => (
              <span key={style}>{style}</span>
            ))}
          </div>
        </div>

        <div className="profile-stats">
          <button type="button" onClick={() => setTab('outfits')}>
            <strong>{myOutfits.length}</strong>
            <span>outfits</span>
          </button>
          <button type="button" onClick={() => onOpenFollowers('followers')}>
            <strong>{formatCompact(me.followers)}</strong>
            <span>seguidores</span>
          </button>
          <button type="button" onClick={() => onOpenFollowers('following')}>
            <strong>{formatCompact(me.following)}</strong>
            <span>seguidos</span>
          </button>
        </div>

        <div className="profile-actions">
          <button type="button" className="button button--outline" onClick={onEditProfile}>
            <Pencil size={15} /> Editar perfil
          </button>
          <button type="button" className="button button--dark" onClick={shareProfile}>
            <Share2 size={15} /> Compartir
          </button>
        </div>

        <div className="profile-demo-note">
          <span>
            <RotateCcw size={14} />
            Demo con datos guardados en este navegador
          </span>
          <div className="profile-demo-actions">
            <button
              type="button"
              onClick={() => {
                resetDemo()
                notify('Demo reiniciada')
              }}
            >
              Reiniciar
            </button>
            <button type="button" onClick={onLogout}>
              Salir
            </button>
          </div>
        </div>

        <div className="profile-tabs" role="tablist" aria-label="Contenido del perfil">
          <button
            type="button"
            className={tab === 'outfits' ? 'is-active' : ''}
            onClick={() => setTab('outfits')}
            role="tab"
            aria-selected={tab === 'outfits'}
          >
            <Shirt size={16} /> Outfits
          </button>
          <button
            type="button"
            className={tab === 'favoritos' ? 'is-active' : ''}
            onClick={() => setTab('favoritos')}
            role="tab"
            aria-selected={tab === 'favoritos'}
          >
            <Heart size={16} /> Favoritos
          </button>
        </div>

        {tab === 'outfits' && (
          <div className="profile-content">
            {myOutfits.length === 0 ? (
              <EmptyState
                icon={<Shirt size={26} />}
                title="Tu primer outfit te espera"
                text="Publica una foto, añade las prendas y compártela con la comunidad."
              />
            ) : (
              <div className="profile-look-grid">
                {myOutfits.map((outfit) => (
                  <button
                    type="button"
                    key={outfit.id}
                    className="profile-look"
                    onClick={() => onOpenOutfit(outfit.id)}
                  >
                    <img
                      src={outfit.image}
                      alt={outfit.title}
                      style={{ objectPosition: outfit.imagePos }}
                    />
                    <span className="profile-look-overlay">
                      <strong>{outfit.title}</strong>
                      <em>{formatPrice(outfitTotal(outfit, products))}</em>
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>
        )}

        {tab === 'favoritos' && (
          <div className="profile-content">
            {savedOutfits.length === 0 ? (
              <EmptyState
                icon={<Heart size={26} />}
                title="Nada guardado todavía"
                text="Los outfits que marques como favoritos aparecerán aquí."
              />
            ) : (
              <div className="profile-saved-grid">
                {savedOutfits.map((outfit) =>
                  outfit ? (
                    <button
                      type="button"
                      key={outfit.id}
                      onClick={() => onOpenOutfit(outfit.id)}
                    >
                      <img
                        src={outfit.image}
                        alt={outfit.title}
                        style={{ objectPosition: outfit.imagePos }}
                      />
                      <span>{outfit.title}</span>
                    </button>
                  ) : null,
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}
