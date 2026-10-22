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
    toggleLike,
    toggleSaved,
    addWishlist,
    notify,
  } = useStore()
  const scrollRef = useRef<HTMLDivElement>(null)
  const screenRef = useRef<HTMLDivElement>(null)
  const dragStart = useRef<number | null>(null)
  const [mode, setMode] = useState<FeedMode>('forYou')
  const [activeSpot, setActiveSpot] = useState<ActiveSpot | null>(null)
  const [selectedSize, setSelectedSize] = useState('')
  const [dragX, setDragX] = useState(0)
  const [saving, setSaving] = useState(false)
  const [flying, setFlying] = useState<{
    left: number
    top: number
    width: number
    height: number
    dx: number
    dy: number
    go: boolean
  } | null>(null)

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
    notify(wasSaved ? 'quitado de inspiración' : 'look guardado en inspiración')
  }

  const saveToWishlist = () => {
    if (!activeItem || saving) return
    const screenRect = screenRef.current?.getBoundingClientRect()
    const imageEl = document.querySelector<HTMLImageElement>('.island-hero img')
    const navEl = document.querySelector<HTMLElement>('[data-nav="wishlist"]')

    if (screenRect && imageEl && navEl) {
      const imageRect = imageEl.getBoundingClientRect()
      const navRect = navEl.getBoundingClientRect()
      setFlying({
        left: imageRect.left - screenRect.left,
        top: imageRect.top - screenRect.top,
        width: imageRect.width,
        height: imageRect.height,
        dx: navRect.left + navRect.width / 2 - (imageRect.left + imageRect.width / 2),
        dy: navRect.top + navRect.height / 2 - (imageRect.top + imageRect.height / 2),
        go: false,
      })
      navEl.classList.add('is-receiving')
      window.setTimeout(() => navEl.classList.remove('is-receiving'), 900)
      requestAnimationFrame(() => {
        requestAnimationFrame(() =>
          setFlying((current) => (current ? { ...current, go: true } : current)),
        )
      })
    }

    setSaving(true)
    setDragX(0)
    window.setTimeout(() => {
      addWishlist({
        productId: activeItem.id,
        size: selectedSize || activeSizes[0],
        color: activeItem.color,
        note: '',
      })
      notify('añadido a wishlist')
      setActiveSpot(null)
      setSaving(false)
      setFlying(null)
    }, 900)
  }

  const startDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    dragStart.current = event.clientX
    setDragX(0)
    event.currentTarget.setPointerCapture(event.pointerId)
  }

  const moveDrag = (event: React.PointerEvent<HTMLDivElement>) => {
    if (dragStart.current === null) return
    const distance = Math.max(0, event.clientX - dragStart.current)
    setDragX(Math.min(150, distance))
  }

  const endDrag = () => {
    if (dragStart.current === null) return
    dragStart.current = null
    if (dragX >= 82) saveToWishlist()
    else setDragX(0)
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
    <div className="screen screen--feed" ref={screenRef}>
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
              <Avatar creator={me} size={27} />
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
                    className="rail-avatar"
                    onClick={() => onCreator(creator.id)}
                    aria-label={`perfil de ${creator.name}`}
                  >
                    <Avatar creator={creator} size={34} />
                  </button>

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
            className={`tapp-island ${saving ? 'is-saving' : ''}`}
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

            <div
              className={`island-hero ${dragX > 0 ? 'is-dragging' : ''} ${dragX >= 82 ? 'is-ready' : ''}`}
              style={{ transform: `translateX(${dragX}px) rotate(${dragX * 0.025}deg)` }}
              onPointerDown={startDrag}
              onPointerMove={moveDrag}
              onPointerUp={endDrag}
              onPointerCancel={() => {
                dragStart.current = null
                setDragX(0)
              }}
              aria-label="haz scroll a la derecha para guardar en wishlist"
            >
              <img
                src={activeItem.image}
                alt={activeItem.name}
                style={{ objectPosition: activeItem.imagePos }}
              />
              {dragX > 0 && (
                <span className="island-swipe-target">
                  <Heart size={13} /> wishlist
                </span>
              )}
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

              <p className="island-swipe-hint">
                haz scroll a la derecha para guardar en wishlist
                <span>→</span>
              </p>

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

          {flying && (
            <img
              className="flying-wish"
              src={activeItem.image}
              alt=""
              aria-hidden="true"
              style={{
                left: flying.left,
                top: flying.top,
                width: flying.width,
                height: flying.height,
                transform: flying.go
                  ? `translate(${flying.dx}px, ${flying.dy}px) scale(0.12)`
                  : 'translate(0, 0) scale(1)',
                opacity: flying.go ? 0.15 : 1,
              }}
            />
          )}
        </>
      )}
    </div>
  )
}
