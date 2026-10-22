import { useMemo, useState } from 'react'
import {
  Bookmark,
  ExternalLink,
  Globe2,
  Heart,
  Lock,
  Pencil,
  Share2,
  ShoppingBag,
  Sparkles,
  Trash2,
} from 'lucide-react'
import { useStore } from '../store'
import type { Outfit } from '../types'
import {
  copyText,
  formatPrice,
  outfitTotal,
  productsForOutfit,
} from '../utils'
import { EmptyState, ScreenHeader } from '../components/ui'

interface SavedProps {
  onOpenOutfit: (outfitId: string) => void
  onOpenItem: (productId: string) => void
  onEditWishlist: (productId: string) => void
  onExplore: () => void
}

export function Saved({ onOpenOutfit, onOpenItem, onEditWishlist, onExplore }: SavedProps) {
  const {
    state,
    outfits,
    products,
    creators,
    setWishlistPublic,
    removeWishlist,
    toggleSaved,
    notify,
  } = useStore()
  const [tab, setTab] = useState<'inspiration' | 'wishlist'>('inspiration')

  const savedOutfits = useMemo(
    () =>
      state.saved
        .map((id) => outfits.find((outfit) => outfit.id === id))
        .filter((outfit): outfit is Outfit => Boolean(outfit)),
    [state.saved, outfits],
  )

  const wishlist = useMemo(
    () =>
      state.wishlist.flatMap((entry) => {
        const product = products.find((item) => item.id === entry.productId)
        return product ? [{ entry, product }] : []
      }),
    [state.wishlist, products],
  )

  const shareList = async () => {
    const url = `https://tapp.app/lista/${state.profile.handle}`
    const copied = await copyText(url)
    notify(
      copied
        ? state.wishlistPublic
          ? 'Enlace público copiado'
          : 'Enlace copiado · solo tú puedes verla'
        : 'No se pudo copiar el enlace',
    )
  }

  return (
    <div className="screen screen--light saved-screen">
      <ScreenHeader
        eyebrow="Inspiración y compras, separadas"
        title="wishlist"
        action={
          <button type="button" className="header-icon-button" onClick={shareList} aria-label="Compartir lista">
            <Share2 size={19} />
          </button>
        }
      />

      <div className="privacy-card">
        <span className="privacy-icon">
          {state.wishlistPublic ? <Globe2 size={20} /> : <Lock size={19} />}
        </span>
        <div>
          <strong>{state.wishlistPublic ? 'Lista pública' : 'Lista privada'}</strong>
          <p>
            {state.wishlistPublic
              ? 'Cualquiera con el enlace puede ver tu wishlist.'
              : 'Solo tú puedes ver los looks y prendas guardados.'}
          </p>
        </div>
        <button
          type="button"
          className="privacy-toggle"
          onClick={() => {
            setWishlistPublic(!state.wishlistPublic)
            notify(state.wishlistPublic ? 'Lista convertida en privada' : 'Lista convertida en pública')
          }}
        >
          {state.wishlistPublic ? 'Hacer privada' : 'Hacer pública'}
        </button>
      </div>

      <div className="saved-tabs" role="tablist" aria-label="Guardados">
        <button
          type="button"
          className={tab === 'inspiration' ? 'is-active' : ''}
          onClick={() => setTab('inspiration')}
          role="tab"
          aria-selected={tab === 'inspiration'}
        >
          <Bookmark size={16} />
          Inspiración <span>{savedOutfits.length}</span>
        </button>
        <button
          type="button"
          className={tab === 'wishlist' ? 'is-active' : ''}
          onClick={() => setTab('wishlist')}
          role="tab"
          aria-selected={tab === 'wishlist'}
        >
          <Heart size={16} />
          Lo quiero <span>{wishlist.length}</span>
        </button>
      </div>

      {tab === 'inspiration' && (
        <div className="saved-content">
          {savedOutfits.length === 0 ? (
            <EmptyState
              icon={<Bookmark size={26} />}
              title="Aún no has guardado inspiración"
              text="Guarda un look completo desde el feed. No es lo mismo que querer una prenda concreta."
              action="Explorar looks"
              onAction={onExplore}
            />
          ) : (
            <>
              <div className="section-note">
                <Sparkles size={15} />
                <p>
                  <strong>Guardar inspiración</strong> significa «me gusta este
                  estilo». Para una prenda concreta, usa <strong>Lo quiero</strong>.
                </p>
              </div>
              <div className="saved-outfit-grid">
                {savedOutfits.map((outfit) => {
                  const creator = creators.find((item) => item.id === outfit.creatorId)
                  const items = productsForOutfit(outfit, products)
                  return (
                    <article className="saved-outfit-card" key={outfit.id}>
                      <button
                        type="button"
                        className="saved-outfit-image"
                        onClick={() => onOpenOutfit(outfit.id)}
                      >
                        <img
                          src={outfit.image}
                          alt={outfit.title}
                          style={{ objectPosition: outfit.imagePos }}
                        />
                        <span>{outfit.occasion}</span>
                      </button>
                      <button
                        type="button"
                        className="saved-remove"
                        aria-label="Quitar de inspiración"
                        onClick={() => {
                          toggleSaved(outfit.id)
                          notify('Look quitado de Inspiración')
                        }}
                      >
                        <Trash2 size={14} />
                      </button>
                      <div className="saved-outfit-copy">
                        <strong>{outfit.title}</strong>
                        <em>@{creator?.handle}</em>
                        <div>
                          <span>{items.length} prendas</span>
                          <span>{formatPrice(outfitTotal(outfit, products))}</span>
                        </div>
                      </div>
                    </article>
                  )
                })}
              </div>
            </>
          )}
        </div>
      )}

      {tab === 'wishlist' && (
        <div className="saved-content">
          {wishlist.length === 0 ? (
            <EmptyState
              icon={<Heart size={26} />}
              title="Tu wishlist está vacía"
              text="Añade una prenda con talla, color y una nota. Eso sí es «lo quiero»."
              action="Ver prendas"
              onAction={() => onOpenItem('zapatillas-blancas')}
            />
          ) : (
            <div className="wishlist-list">
              {wishlist.map(({ entry, product }) => (
                <article className="wishlist-card" key={product.id}>
                  <button
                    type="button"
                    className="wishlist-image"
                    onClick={() => onOpenItem(product.id)}
                  >
                    <img
                      src={product.image}
                      alt={product.name}
                      style={{ objectPosition: product.imagePos }}
                    />
                  </button>
                  <div className="wishlist-copy">
                    <span className="product-brand">{product.brand}</span>
                    <strong>{product.name}</strong>
                    <div className="wishlist-meta">
                      {entry.size && <span>Talla {entry.size}</span>}
                      {entry.color && <span>{entry.color}</span>}
                      <span>{formatPrice(product.price)}</span>
                    </div>
                    {entry.note && <p>“{entry.note}”</p>}
                    <div className="wishlist-actions">
                      <a
                        href={product.link}
                        target="_blank"
                        rel="noreferrer"
                        className="text-link"
                      >
                        Ir a la tienda <ExternalLink size={13} />
                      </a>
                      <button
                        type="button"
                        onClick={() => onEditWishlist(product.id)}
                        className="text-link"
                      >
                        <Pencil size={13} /> Editar
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          removeWishlist(product.id)
                          notify('Prenda quitada de Lo quiero')
                        }}
                        className="text-link text-link--danger"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
              <div className="wishlist-footer-note">
                <ShoppingBag size={17} />
                <p>
                  «Lo quiero» guarda la prenda exacta. Si solo te gusta el look,
                  guárdalo en Inspiración.
                </p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
