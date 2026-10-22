import { useRef, useState } from 'react'
import {
  ArrowUpRight,
  Bookmark,
  Heart,
  Search as SearchIcon,
  Send,
  Sparkles,
  X,
} from 'lucide-react'
import { useStore } from '../store'
import type { Outfit, Product } from '../types'
import { formatPrice } from '../utils'
import { Avatar } from '../components/ui'

interface FeedProps {
  onOpenOutfit: (outfitId: string, highlightItemId?: string) => void
  onOpenItem: (productId: string, focusBudget?: boolean) => void
  onOpenWishlist: (productId: string) => void
  onShare: (outfitId: string) => void
  onSearch: () => void
  onCreator: (creatorId: string) => void
  onProfile: () => void
  feedIndex: number
  setFeedIndex: (index: number) => void
}

interface ActiveSpot {
  outfitId: string
  itemId: string
}

type FeedMode = 'forYou' | 'following'

const curated = ['o-rugby', 'o-hoodie', 'o-tee', 'o-shelf', 'o-leather', 'o-seated']

export function Feed({
  onOpenOutfit,
  onOpenItem,
  onOpenWishlist,
  onShare,
  onSearch,
  onCreator,
  onProfile,
  feedIndex,
  setFeedIndex,
}: FeedProps) {
  const {
    state,
    outfits,
    creators,
    products,
    me,
    isLiked,
    isSaved,
    isFollowing,
    toggleLike,
    toggleSaved,
    toggleFollow,
    notify,
  } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const [mode, setMode] = useState<FeedMode>('forYou')
  const [activeSpot, setActiveSpot] = useState<ActiveSpot | null>(null)
  const [selectedSize, setSelectedSize] = useState('')

  const forYou = [
    ...state.published,
    ...curated
      .map((id) => outfits.find((outfit) => outfit.id === id))
      .filter((outfit): outfit is Outfit => Boolean(outfit)),
  ].slice(0, 8)

  const following = outfits.filter((outfit) =>
    state.following.includes(outfit.creatorId),
  )

  const feed = mode === 'forYou' ? forYou : following

  const currentOutfit =
    feed.length > 0 ? feed[Math.min(feedIndex, feed.length - 1)] : undefined
  const currentCreator = currentOutfit
    ? creators.find((creator) => creator.id === currentOutfit.creatorId) ?? me
    : undefined
  const currentFollowing = currentCreator
    ? isFollowing(currentCreator.id)
    : false

  const activeOutfit = activeSpot
    ? feed.find((outfit) => outfit.id === activeSpot.outfitId)
    : undefined
  const activeItem = activeSpot
    ? products.find((product) => product.id === activeSpot.itemId)
    : undefined
  const activeInWishlist = activeItem
    ? state.wishlist.some((entry) => entry.productId === activeItem.id)
    : false
  const activeSizes = activeItem ? sizesFor(activeItem) : []

  function sizesFor(product: Product) {
    return product.category === 'Zapatos'
      ? ['36', '37', '38', '39', '40']
      : ['xs', 's', 'm', 'l']
  }

  const switchMode = (next: FeedMode) => {
    if (next === mode) return
    setMode(next)
    setActiveSpot(null)
    setFeedIndex(0)
    const element = scrollRef.current
    if (element) element.scrollTop = 0
  }

  const onScroll = () => {
    const element = scrollRef.current
    if (!element) return
    if (activeSpot) setActiveSpot(null)
    const index = Math.round(element.scrollTop / element.clientHeight)
    if (index !== feedIndex) setFeedIndex(Math.min(index, Math.max(0, feed.length - 1)))
  }

  const handleSave = (outfit: Outfit) => {
    const wasSaved = isSaved(outfit.id)
    toggleSaved(outfit.id)
    notify(wasSaved ? 'Quitado de Inspiración' : 'Look guardado en Inspiración')
  }

  const spotsFor = (outfit: Outfit) => {
    if (outfit.tags && outfit.tags.length > 0) return outfit.tags
    return outfit.itemIds.map((itemId, index) => {
      const count = Math.max(1, outfit.itemIds.length - 1)
      return {
        itemId,
        x: index % 2 === 0 ? 43 : 58,
        y: 31 + (index * 38) / count,
      }
    })
  }

  return (
    <div className="screen screen--feed">
      <header className="feed-topbar">
        <div className="feed-brandline">
          <div className="wordmark">
            <span>tapp</span>
            <i>.</i>
          </div>

          <div className="feed-top-actions">
            <button
              type="button"
              className="feed-top-button"
              aria-label="buscar"
              onClick={onSearch}
            >
              <SearchIcon size={18} />
            </button>
            <button
              type="button"
              className="feed-avatar-button"
              aria-label="tu perfil"
              onClick={onProfile}
            >
              <Avatar creator={me} size={31} />
            </button>
          </div>
        </div>

        <div className="feed-mode" role="tablist" aria-label="feed">
          <button
            type="button"
            className={mode === 'forYou' ? 'is-active' : ''}
            onClick={() => switchMode('forYou')}
            role="tab"
            aria-selected={mode === 'forYou'}
          >
            main
          </button>
          <button
            type="button"
            className={mode === 'following' ? 'is-active' : ''}
            onClick={() => switchMode('following')}
            role="tab"
            aria-selected={mode === 'following'}
          >
            following
          </button>
        </div>

        {currentOutfit && currentCreator && (
          <div className="feed-creatorbar">
            <button
              type="button"
              className="creator-line"
              onClick={() => onCreator(currentCreator.id)}
            >
              <Avatar creator={currentCreator} size={29} />
              <strong>
                {currentCreator.name}
                {currentCreator.verified && <i className="verified">✓</i>}
              </strong>
            </button>
            {currentCreator.id !== 'me' && (
              <button
                type="button"
                className={`follow-mini ${currentFollowing ? 'is-following' : ''}`}
                onClick={() => {
                  toggleFollow(currentCreator.id)
                  notify(
                    currentFollowing
                      ? `dejaste de seguir a ${currentCreator.name}`
                      : `ahora sigues a ${currentCreator.name}`,
                  )
                }}
                aria-label={
                  currentFollowing
                    ? `dejar de seguir a ${currentCreator.name}`
                    : `seguir a ${currentCreator.name}`
                }
              >
                {currentFollowing ? 'siguiendo' : 'seguir'}
              </button>
            )}
          </div>
        )}
      </header>

      {feed.length === 0 ? (
        <div className="feed-empty">
          <p>Sigue a alguien para ver sus looks aquí.</p>
          <button type="button" onClick={() => switchMode('forYou')}>
            Descubrir looks
          </button>
        </div>
      ) : (
        <div className="feed-scroll" ref={scrollRef} onScroll={onScroll}>
          {feed.map((outfit) => {
            const creator =
              creators.find((item) => item.id === outfit.creatorId) ?? me
            const saved = isSaved(outfit.id)
            const liked = isLiked(outfit.id)
            const spots = spotsFor(outfit)

            return (
              <section className="feed-slide" key={outfit.id}>
                <img
                  className="feed-image"
                  src={outfit.image}
                  alt={`Look de ${creator.name}`}
                  style={{ objectPosition: outfit.imagePos }}
                />


                <div className="tapp-spots">
                  {spots.map((spot) => {
                    const item = products.find(
                      (product) => product.id === spot.itemId,
                    )
                    if (!item) return null
                    const active =
                      activeSpot?.outfitId === outfit.id &&
                      activeSpot.itemId === spot.itemId
                    return (
                      <button
                        type="button"
                        className={`tapp-spot ${active ? 'is-active' : ''}`}
                        style={{ left: `${spot.x}%`, top: `${spot.y}%` }}
                        key={spot.itemId}
                        aria-label={`Tappear ${item.name}, ${formatPrice(item.price)}`}
                        onClick={() => {
                          setSelectedSize(sizesFor(item)[0])
                          setActiveSpot({
                            outfitId: outfit.id,
                            itemId: spot.itemId,
                          })
                        }}
                      >
                        <span />
                      </button>
                    )
                  })}
                </div>

                <div className="feed-rail">
                  <button
                    type="button"
                    className={`rail-button ${liked ? 'is-liked' : ''}`}
                    onClick={() => toggleLike(outfit.id)}
                    aria-label={liked ? 'Quitar me gusta' : 'Me gusta'}
                  >
                    <Heart size={21} fill={liked ? 'currentColor' : 'none'} />
                  </button>
                  <button
                    type="button"
                    className={`rail-button ${saved ? 'is-saved' : ''}`}
                    onClick={() => handleSave(outfit)}
                    aria-label={saved ? 'Quitar de guardados' : 'Guardar look'}
                  >
                    <Bookmark
                      size={20}
                      fill={saved ? 'currentColor' : 'none'}
                    />
                  </button>
                  <button
                    type="button"
                    className="rail-button"
                    onClick={() => onShare(outfit.id)}
                    aria-label="Compartir look"
                  >
                    <Send size={19} />
                  </button>
                </div>

              </section>
            )
          })}
        </div>
      )}

      {activeSpot && activeOutfit && activeItem && (
        <>
          <button
            type="button"
            className="spot-scrim"
            aria-label="Cerrar prenda"
            onClick={() => setActiveSpot(null)}
          />
          <section
            className="tapp-island"
            aria-label={`${activeItem.name}, ${activeItem.brand}`}
          >
            <button
              type="button"
              className="island-close"
              onClick={() => setActiveSpot(null)}
              aria-label="cerrar"
            >
              <X size={16} />
            </button>

            <div className="island-hero">
              <img
                src={activeItem.image}
                alt={activeItem.name}
                style={{ objectPosition: activeItem.imagePos }}
              />
            </div>

            <div className="island-body">
              <span className="island-brand">{activeItem.brand}</span>
              <strong className="island-name">{activeItem.name}</strong>
              <div className="island-price-row">
                <em>{formatPrice(activeItem.price)}</em>
                <small>
                  {activeItem.category} · {activeItem.color}
                </small>
              </div>

              <div className="island-sizes" aria-label="tallas">
                {activeSizes.map((size) => (
                  <button
                    type="button"
                    className={selectedSize === size ? 'is-active' : ''}
                    key={size}
                    onClick={() => setSelectedSize(size)}
                  >
                    {size}
                  </button>
                ))}
                <span className="island-stock">
                  <i /> en stock
                </span>
              </div>

              <a
                className="island-store-cta"
                href={activeItem.link}
                target="_blank"
                rel="noreferrer"
              >
                ir a la tienda <ArrowUpRight size={14} />
              </a>

              <div className="island-secondary">
                <button
                  type="button"
                  className="island-budget"
                  onClick={() => {
                    setActiveSpot(null)
                    onOpenItem(activeItem.id, true)
                  }}
                >
                  <Sparkles size={14} />
                  ajustar a presupuesto
                </button>
                <button
                  type="button"
                  className={`island-wish ${activeInWishlist ? 'is-saved' : ''}`}
                  onClick={() => {
                    setActiveSpot(null)
                    onOpenWishlist(activeItem.id)
                  }}
                >
                  <Heart
                    size={14}
                    fill={activeInWishlist ? 'currentColor' : 'none'}
                  />
                  {activeInWishlist ? 'en tu lista' : 'lo quiero'}
                </button>
              </div>

              <button
                type="button"
                className="island-look"
                onClick={() => {
                  setActiveSpot(null)
                  onOpenOutfit(activeOutfit.id)
                }}
              >
                ver el look completo
                <ArrowUpRight size={13} />
              </button>
            </div>
          </section>
        </>
      )}
    </div>
  )
}
