import { useEffect, useRef, useState } from 'react'
import {
  ArrowUpRight,
  Bookmark,
  Check,
  CheckCircle2,
  Copy,
  ExternalLink,
  Heart,
  Link2,
  Lock,
  MessageCircle,
  Palette,
  Ruler,
  Share2,
  Sparkles,
  StickyNote,
  Store,
  Trash2,
  X,
} from 'lucide-react'
import { alternativesForItem, buildBudgetLook, cheapestTotal } from '../budget'
import { useStore } from '../store'
import type {
  Category,
  Product,
  ProfileSettings,
  Style,
} from '../types'
import {
  copyText,
  formatCompact,
  formatPrice,
  outfitTotal,
  productsForOutfit,
} from '../utils'
import { Avatar, Chip, FollowButton, Sheet } from './ui'

export function OutfitSheet({
  outfitId,
  highlightItemId,
  onClose,
  onOpenBudget,
  onOpenItem,
  onOpenWishlist,
  onOpenShare,
  onOpenCreator,
}: {
  outfitId: string
  highlightItemId?: string
  onClose: () => void
  onOpenBudget: (outfitId: string) => void
  onOpenItem: (productId: string) => void
  onOpenWishlist: (productId: string) => void
  onOpenShare: (outfitId: string) => void
  onOpenCreator: (creatorId: string) => void
}) {
  const {
    outfitById,
    creators,
    products,
    state,
    toggleSaved,
    notify,
    isFollowing,
    toggleFollow,
  } = useStore()
  const outfit = outfitById(outfitId)
  if (!outfit) return null
  const creator = creators.find((item) => item.id === outfit.creatorId) ?? creators[0]
  const items = productsForOutfit(outfit, products)
  const total = outfitTotal(outfit, products)
  const lowest = cheapestTotal(outfit, products)
  const saved = state.saved.includes(outfit.id)
  const following = isFollowing(creator.id)

  return (
    <Sheet
      title={outfit.title}
      subtitle={`@${creator.handle} · ${outfit.occasion}`}
      onClose={onClose}
      className="outfit-sheet"
    >
      <div className="outfit-summary">
        <img src={outfit.image} alt={outfit.title} style={{ objectPosition: outfit.imagePos }} />
        <div>
          <p>{outfit.description}</p>
          <div className="outfit-summary-total">
            <span>Look completo</span>
            <strong>{formatPrice(total)}</strong>
          </div>
          <div className="outfit-summary-actions">
            <button
              type="button"
              className={`mini-button ${saved ? 'is-saved' : ''}`}
              onClick={() => {
                toggleSaved(outfit.id)
                notify(saved ? 'Quitado de Inspiración' : 'Look guardado en Inspiración')
              }}
            >
              <Bookmark size={14} fill={saved ? 'currentColor' : 'none'} />
              {saved ? 'Guardado' : 'Guardar look'}
            </button>
            <button type="button" className="mini-button" onClick={() => onOpenShare(outfit.id)}>
              <Share2 size={14} /> Compartir
            </button>
          </div>
        </div>
      </div>

      <div className="outfit-creator-row">
        <button type="button" onClick={() => onOpenCreator(creator.id)}>
          <Avatar creator={creator} size={36} />
          <span>
            <strong>{creator.name}</strong>
            <em>@{creator.handle}</em>
          </span>
        </button>
        {creator.id !== 'me' && (
          <FollowButton
            following={following}
            compact
            onClick={() => {
              toggleFollow(creator.id)
              notify(following ? `Dejaste de seguir a ${creator.name}` : `Ahora sigues a ${creator.name}`)
            }}
          />
        )}
      </div>

      <div className="sheet-section-heading">
        <span>Las prendas</span>
        <em>{items.length} piezas</em>
      </div>

      <div className="outfit-item-list">
        {items.map((item) => (
          <div
            className={`outfit-item ${highlightItemId === item.id ? 'is-highlighted' : ''}`}
            key={item.id}
          >
            <button
              type="button"
              className="outfit-item-main"
              onClick={() => onOpenItem(item.id)}
            >
              <img src={item.image} alt="" style={{ objectPosition: item.imagePos }} />
              <span>
                <em>{item.brand}</em>
                <strong>{item.name}</strong>
                <small>{formatPrice(item.price)}</small>
              </span>
            </button>
            {highlightItemId === item.id && (
              <span className="search-match-badge">
                <Sparkles size={11} /> Lo que buscabas
              </span>
            )}
            <a
              href={item.link}
              target="_blank"
              rel="noreferrer"
              className="outfit-item-link"
              aria-label={`Ir a la tienda para ${item.name}`}
            >
              <ExternalLink size={15} />
            </a>
            <button
              type="button"
              className="outfit-item-want"
              aria-label={`Añadir ${item.name} a Lo quiero`}
              onClick={() => onOpenWishlist(item.id)}
            >
              <Heart size={15} />
            </button>
          </div>
        ))}
      </div>

      <div className="budget-banner">
        <span className="budget-banner-icon">
          <Sparkles size={18} />
        </span>
        <div>
          <strong>Este look, a tu presupuesto</strong>
          <p>Puedes recrearlo desde {formatPrice(lowest)}. Cambia solo lo que haga falta.</p>
        </div>
        <button type="button" onClick={() => onOpenBudget(outfit.id)}>
          Probar
        </button>
      </div>

      <p className="sheet-note">
        Guarda el look completo en Inspiración o una prenda concreta en Lo quiero.
        Son dos acciones distintas.
      </p>
    </Sheet>
  )
}

export function BudgetSheet({
  outfitId,
  onClose,
  onOpenItem,
  onOpenOutfit,
}: {
  outfitId: string
  onClose: () => void
  onOpenItem: (productId: string) => void
  onOpenOutfit: (outfitId: string) => void
}) {
  const { outfitById, products, state, toggleSaved, notify } = useStore()
  const outfit = outfitById(outfitId)
  const estimate = outfit ? outfitTotal(outfit, products) : 0
  const [budget, setBudget] = useState(() =>
    Math.max(60, Math.round((estimate * 0.55) / 10) * 10),
  )
  if (!outfit) return null
  const total = outfitTotal(outfit, products)
  const max = Math.max(120, Math.ceil(total / 20) * 20)
  const result = buildBudgetLook(outfit, products, budget)
  const saved = state.saved.includes(outfit.id)
  const quickBudgets = [0.4, 0.55, 0.7, 0.85]
    .map((ratio) => Math.round((total * ratio) / 10) * 10)
    .filter((value, index, values) => value <= max && values.indexOf(value) === index)
  const swaps = result.swaps

  return (
    <Sheet
      title="Mi presupuesto"
      subtitle="Mismo estilo. Otras piezas. Tu precio."
      onClose={onClose}
      className="budget-sheet"
    >
      <div className="budget-hero">
        <img src={outfit.image} alt="" style={{ objectPosition: outfit.imagePos }} />
        <div>
          <span>Look original</span>
          <strong>{outfit.title}</strong>
          <em>{formatPrice(total)}</em>
        </div>
      </div>

      <div className="budget-control">
        <div className="budget-label">
          <span>¿Cuánto quieres gastar?</span>
          <strong>{formatPrice(budget)}</strong>
        </div>
        <input
          type="range"
          min={60}
          max={max}
          step={10}
          value={budget}
          onChange={(event) => setBudget(Number(event.target.value))}
          aria-label="Presupuesto total"
        />
        <div className="budget-quick">
          {quickBudgets.map((value) => (
            <Chip
              key={value}
              active={budget === value}
              onClick={() => setBudget(value)}
              tone="ghost"
            >
              {value} €
            </Chip>
          ))}
          <Chip active={budget >= total} onClick={() => setBudget(total)} tone="ghost">
            Sin límite
          </Chip>
        </div>
      </div>

      <div className={`budget-result ${!result.feasible ? 'is-over' : ''}`}>
        <span className="budget-result-icon">
          {result.feasible ? <CheckCircle2 size={21} /> : <Sparkles size={21} />}
        </span>
        <div>
          {result.feasible ? (
            <>
              <strong>
                Look recreado por {formatPrice(result.total)}
              </strong>
              <p>
                Ahorras {formatPrice(result.savings)} · {result.changedCount}{' '}
                {result.changedCount === 1 ? 'prenda adaptada' : 'prendas adaptadas'}
              </p>
            </>
          ) : (
            <>
              <strong>La combinación más ajustada: {formatPrice(result.total)}</strong>
              <p>
                Te pasas {formatPrice(result.overBy)}. Prueba a subir el
                presupuesto o quitar una pieza.
              </p>
            </>
          )}
        </div>
      </div>

      <div className="budget-list">
        {swaps.map(({ original, chosen, changed }) => (
          <button
            type="button"
            className={`budget-row ${changed ? 'is-changed' : ''}`}
            key={original.id}
            onClick={() => onOpenItem(chosen.id)}
          >
            <img src={chosen.image} alt="" style={{ objectPosition: chosen.imagePos }} />
            <span>
              <em>{chosen.brand}</em>
              <strong>{chosen.name}</strong>
              <small>
                {changed ? (
                  <>
                    <s>{formatPrice(original.price)}</s>
                    <b>{formatPrice(chosen.price)}</b>
                  </>
                ) : (
                  <>Se queda · {formatPrice(chosen.price)}</>
                )}
              </small>
            </span>
            <span className={`budget-state ${changed ? 'is-new' : ''}`}>
              {changed ? 'Cambiada' : 'Original'}
            </span>
          </button>
        ))}
      </div>

      <div className="budget-note">
        <Store size={15} />
        <p>
          Buscamos alternativas dentro de un catálogo pequeño: misma categoría,
          estilo y color siempre que sea posible. No inventamos enlaces.
        </p>
      </div>

      <div className="budget-footer">
        <div className="budget-total-row">
          <span>Total adaptado</span>
          <strong>{formatPrice(result.total)}</strong>
        </div>
        <div className="sheet-action-row">
          <button
            type="button"
            className="button button--outline"
            onClick={() => onOpenOutfit(outfit.id)}
          >
            Ver prendas
          </button>
          <button
            type="button"
            className={`button button--dark ${saved ? 'is-saved' : ''}`}
            onClick={() => {
              if (!saved) toggleSaved(outfit.id)
              notify(saved ? 'Ya está en Inspiración' : 'Look adaptado guardado en Inspiración')
              onClose()
            }}
          >
            {saved ? (
              <>
                <Check size={15} /> Guardado
              </>
            ) : (
              <>
                <Bookmark size={15} /> Guardar inspiración
              </>
            )}
          </button>
        </div>
      </div>
    </Sheet>
  )
}

export function ItemSheet({
  productId,
  focusBudget,
  onClose,
  onOpenWishlist,
  onOpenItem,
}: {
  productId: string
  focusBudget?: boolean
  onClose: () => void
  onOpenWishlist: (productId: string) => void
  onOpenItem: (productId: string) => void
}) {
  const { productById, products, state } = useStore()
  const product = productById(productId)
  const alternativesRef = useRef<HTMLDivElement>(null)
  const maxDefault = Math.max(
    20,
    Math.min(80, Math.floor(((product?.price ?? 80) * 0.7) / 10) * 10),
  )
  const [maxPrice, setMaxPrice] = useState(maxDefault)

  useEffect(() => {
    if (!focusBudget) return
    const timer = window.setTimeout(() => {
      alternativesRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' })
    }, 380)
    return () => window.clearTimeout(timer)
  }, [focusBudget, productId])

  if (!product) return null
  const entry = state.wishlist.find((item) => item.productId === product.id)
  const alternatives = alternativesForItem(product, products, maxPrice)
  const chips = [20, 30, 40, 60, 80].filter((value) => value < product.price)

  return (
    <Sheet
      title="prenda"
      subtitle={product.category}
      onClose={onClose}
      className="item-sheet"
    >
      <div className="item-hero">
        <img src={product.image} alt={product.name} style={{ objectPosition: product.imagePos }} />
        <span className="item-hero-badge">{product.style}</span>
      </div>

      <div className="item-heading">
        <div>
          <span className="product-brand">{product.brand}</span>
          <h2>{product.name}</h2>
        </div>
        <strong>{product.price > 0 ? formatPrice(product.price) : '—'}</strong>
      </div>

      <div className="item-tags">
        <span>{product.category}</span>
        <span>{product.color}</span>
        <span>{product.tier === 'premium' ? 'Selección' : product.tier === 'budget' ? 'Buen precio' : 'Esencial'}</span>
      </div>

      <div className="item-actions">
        <a href={product.link} target="_blank" rel="noreferrer" className="button button--dark">
          <ExternalLink size={15} /> Ir a la tienda
        </a>
        <button
          type="button"
          className={`button button--outline ${entry ? 'is-saved' : ''}`}
          onClick={() => onOpenWishlist(product.id)}
        >
          <Heart size={15} fill={entry ? 'currentColor' : 'none'} />
          {entry ? 'En tu lista' : 'Lo quiero'}
        </button>
      </div>

      {entry && (
        <div className="item-in-list">
          <CheckCircle2 size={16} />
          <span>
            En Lo quiero{entry.size ? ` · Talla ${entry.size}` : ''}
            {entry.color ? ` · ${entry.color}` : ''}
            {entry.note ? ` · “${entry.note}”` : ''}
          </span>
          <button type="button" onClick={() => onOpenWishlist(product.id)}>
            Editar
          </button>
        </div>
      )}

      <div className="alternatives" ref={alternativesRef}>
        <div className="alternatives-heading">
          <div>
            <span className="eyebrow">Alternativas</span>
            <h3>Esta prenda, por menos de {formatPrice(maxPrice)}</h3>
          </div>
          <Sparkles size={18} />
        </div>
        <div className="filter-chips alternatives-chips">
          {chips.map((value) => (
            <Chip key={value} active={maxPrice === value} onClick={() => setMaxPrice(value)} tone="ghost">
              {value} €
            </Chip>
          ))}
        </div>
        {alternatives.length === 0 ? (
          <div className="alternatives-empty">
            <p>
              No hay una alternativa por debajo de {formatPrice(maxPrice)} en el
              catálogo. Prueba con otro presupuesto.
            </p>
          </div>
        ) : (
          <div className="alternative-list">
            {alternatives.map((alternative) => (
              <button
                type="button"
                className="alternative-row"
                key={alternative.id}
                onClick={() => onOpenItem(alternative.id)}
              >
                <img src={alternative.image} alt="" style={{ objectPosition: alternative.imagePos }} />
                <span>
                  <em>{alternative.brand}</em>
                  <strong>{alternative.name}</strong>
                  <small>{formatPrice(alternative.price)}</small>
                </span>
                <span className="alternative-save">
                  -{Math.round((1 - alternative.price / product.price) * 100)}%
                </span>
              </button>
            ))}
          </div>
        )}
        <p className="sheet-note">
          Prototipo: buscamos en un catálogo propio con enlaces reales. No
          rastreamos todas las tiendas ni generamos URLs.
        </p>
      </div>
    </Sheet>
  )
}

export function WishlistEditSheet({
  productId,
  onClose,
}: {
  productId: string
  onClose: () => void
}) {
  const {
    productById,
    state,
    addWishlist,
    updateWishlist,
    removeWishlist,
    notify,
  } = useStore()
  const product = productById(productId)
  const existing = state.wishlist.find((item) => item.productId === productId)
  const [size, setSize] = useState(existing?.size ?? '')
  const [color, setColor] = useState(existing?.color ?? product?.color ?? '')
  const [note, setNote] = useState(existing?.note ?? '')
  if (!product) return null

  return (
    <Sheet
      title={existing ? 'Editar Lo quiero' : 'Lo quiero'}
      subtitle="La prenda exacta, no solo la inspiración."
      onClose={onClose}
      className="wishlist-edit-sheet"
    >
      <div className="wishlist-product">
        <img src={product.image} alt="" style={{ objectPosition: product.imagePos }} />
        <div>
          <span className="product-brand">{product.brand}</span>
          <strong>{product.name}</strong>
          <em>{formatPrice(product.price)}</em>
        </div>
      </div>

      <div className="wishlist-form">
        <label className="field">
          <span>
            <Ruler size={14} /> Talla
          </span>
          <input
            value={size}
            onChange={(event) => setSize(event.target.value)}
            placeholder="M, 38, 42…"
          />
        </label>
        <label className="field">
          <span>
            <Palette size={14} /> Color preferido
          </span>
          <input
            value={color}
            onChange={(event) => setColor(event.target.value)}
            placeholder="Negro, camel…"
          />
        </label>
        <label className="field">
          <span>
            <StickyNote size={14} /> Nota
          </span>
          <textarea
            value={note}
            onChange={(event) => setNote(event.target.value)}
            rows={3}
            maxLength={120}
            placeholder="Ej. En negro, talla M. Si baja de precio."
          />
        </label>
      </div>

      <div className="wishlist-privacy-note">
        <Lock size={14} />
        <p>
          Se guarda en <strong>Lo quiero</strong>, separado de tus looks de
          Inspiración. La visibilidad se controla desde Guardados.
        </p>
      </div>

      <div className="sheet-action-row">
        {existing && (
          <button
            type="button"
            className="button button--danger"
            onClick={() => {
              removeWishlist(product.id)
              notify('Prenda quitada de Lo quiero')
              onClose()
            }}
          >
            <Trash2 size={15} /> Quitar
          </button>
        )}
        <button
          type="button"
          className="button button--dark button--grow"
          onClick={() => {
            if (existing) {
              updateWishlist(product.id, { size, color, note })
            } else {
              addWishlist({ productId: product.id, size, color, note })
            }
            notify(existing ? 'Lo quiero actualizado' : 'Prenda añadida a Lo quiero')
            onClose()
          }}
        >
          <Heart size={15} fill="currentColor" /> {existing ? 'Guardar cambios' : 'Añadir a Lo quiero'}
        </button>
      </div>
    </Sheet>
  )
}

export function ShareSheet({
  outfitId,
  onClose,
  onSent,
}: {
  outfitId: string
  onClose: () => void
  onSent: (conversationId: string) => void
}) {
  const { outfitById, creators, sendOutfitTo, notify } = useStore()
  const outfit = outfitById(outfitId)
  if (!outfit) return null
  const people = creators.filter((creator) => creator.id !== 'me').slice(0, 4)

  const copyLink = async () => {
    const copied = await copyText(`https://tapp.app/look/${outfit.id}`)
    notify(copied ? 'Enlace del look copiado' : 'No se pudo copiar el enlace')
    if (copied) onClose()
  }

  return (
    <Sheet title="Compartir look" subtitle="Un enlace abre el look completo." onClose={onClose}>
      <div className="share-preview">
        <img src={outfit.image} alt="" style={{ objectPosition: outfit.imagePos }} />
        <div>
          <span className="eyebrow">tapp · look compartido</span>
          <strong>{outfit.title}</strong>
          <em>tapp.app/look/{outfit.id}</em>
        </div>
      </div>

      <div className="share-options">
        <button type="button" className="share-option" onClick={copyLink}>
          <span><Copy size={19} /></span>
          <div>
            <strong>Copiar enlace</strong>
            <em>Funciona fuera de la app</em>
          </div>
          <ArrowUpRight size={16} />
        </button>
        <button
          type="button"
          className="share-option"
          onClick={async () => {
            const copied = await copyText(`https://tapp.app/look/${outfit.id}`)
            notify(copied ? 'enlace copiado' : 'no se pudo copiar')
          }}
        >
          <span><Share2 size={19} /></span>
          <div>
            <strong>compartir en <span className="proper-name">Instagram</span></strong>
            <em>Copia el enlace para stories</em>
          </div>
          <ArrowUpRight size={16} />
        </button>
      </div>

      <div className="share-people-title">
        <span>
          <MessageCircle size={14} /> Enviar por mensaje
        </span>
        <em>Solo conversaciones individuales</em>
      </div>

      <div className="share-people">
        {people.map((creator) => (
          <button
            type="button"
            key={creator.id}
            className="share-person"
            onClick={() => {
              const conversationId = sendOutfitTo(creator.id, outfit.id)
              notify(`Look enviado a ${creator.name.split(' ')[0]}`)
              onClose()
              onSent(conversationId)
            }}
          >
            <Avatar creator={creator} size={49} />
            <span>{creator.name.split(' ')[0]}</span>
          </button>
        ))}
      </div>

      <div className="sheet-note">
        <Link2 size={13} /> En el prototipo, el enlace es simulado; la tarjeta del
        look sí se envía dentro de la demo.
      </div>
    </Sheet>
  )
}

export function CreatorSheet({
  creatorId,
  onClose,
  onOpenOutfit,
}: {
  creatorId: string
  onClose: () => void
  onOpenOutfit: (outfitId: string) => void
}) {
  const {
    creators,
    outfits,
    products,
    isFollowing,
    toggleFollow,
    notify,
  } = useStore()
  const creator = creators.find((item) => item.id === creatorId)
  if (!creator) return null
  const creatorOutfits = outfits.filter((outfit) => outfit.creatorId === creator.id)
  const following = isFollowing(creator.id)
  const cover = creatorOutfits[0]?.image ?? 'images/outfits/look-tee.jpg'

  return (
    <Sheet full onClose={onClose} className="creator-sheet" hideHandle>
      <div className="creator-sheet-cover">
        <img src={cover} alt="" />
        <div className="creator-sheet-shade" />
        <button type="button" className="creator-sheet-close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
      </div>
      <div className="creator-sheet-body">
        <div className="creator-sheet-avatar">
          <Avatar creator={creator} size={76} />
        </div>
        <div className="creator-sheet-heading">
          <div>
            <h2>
              {creator.name}
              {creator.verified && <span className="verified">✓</span>}
            </h2>
            <span>@{creator.handle} · {creator.location}</span>
          </div>
          {creator.id !== 'me' && (
            <FollowButton
              following={following}
              onClick={() => {
                toggleFollow(creator.id)
                notify(following ? `Dejaste de seguir a ${creator.name}` : `Ahora sigues a ${creator.name}`)
              }}
            />
          )}
        </div>
        <p className="creator-sheet-bio">{creator.bio}</p>
        <div className="profile-tags">
          {creator.styles.map((style) => (
            <span key={style}>{style}</span>
          ))}
        </div>
        <div className="creator-sheet-stats">
          <span><strong>{creatorOutfits.length}</strong> looks</span>
          <span><strong>{formatCompact(creator.followers)}</strong> seguidores</span>
          <span><strong>{formatCompact(creator.following)}</strong> seguidos</span>
        </div>
        <div className="creator-sheet-grid">
          {creatorOutfits.map((outfit) => (
            <button type="button" key={outfit.id} onClick={() => onOpenOutfit(outfit.id)}>
              <img src={outfit.image} alt={outfit.title} style={{ objectPosition: outfit.imagePos }} />
              <span>{outfit.title}</span>
              <em>{formatPrice(outfitTotal(outfit, products))}</em>
            </button>
          ))}
        </div>
        {creatorOutfits.length === 0 && (
          <p className="sheet-note">Todavía no hay looks publicados.</p>
        )}
      </div>
    </Sheet>
  )
}

export function BrandSheet({
  brandId,
  onClose,
  onOpenItem,
  onOpenOutfit,
}: {
  brandId: string
  onClose: () => void
  onOpenItem: (productId: string) => void
  onOpenOutfit: (outfitId: string) => void
}) {
  const {
    brands,
    products,
    outfits,
    isFollowing,
    toggleFollow,
    notify,
  } = useStore()
  const brand = brands.find((item) => item.id === brandId)
  if (!brand) return null
  const following = isFollowing(brand.id)
  const dropItems = brand.drop.itemIds
    .map((id) => products.find((product) => product.id === id))
    .filter((product): product is Product => Boolean(product))
  const community = outfits.filter((outfit) =>
    outfit.itemIds.some((id) => brand.drop.itemIds.includes(id)),
  )

  return (
    <Sheet full onClose={onClose} className="brand-sheet" hideHandle>
      <div className="brand-cover">
        <img src={brand.drop.image} alt="" />
        <div className="brand-cover-shade" />
        <button type="button" className="creator-sheet-close" onClick={onClose} aria-label="Cerrar">
          <X size={18} />
        </button>
        <span className="brand-logo brand-logo--large" style={{ background: brand.color }}>
          {brand.logo}
        </span>
      </div>
      <div className="brand-body">
        <div className="brand-heading">
          <div>
            <h2>{brand.name}</h2>
            <span>@{brand.handle} · Marca</span>
          </div>
          <FollowButton
            following={following}
            onClick={() => {
              toggleFollow(brand.id)
              notify(following ? `Dejaste de seguir ${brand.name}` : `Ahora sigues a ${brand.name}`)
            }}
          />
        </div>
        <p className="creator-sheet-bio">{brand.bio}</p>
        <div className="creator-sheet-stats">
          <span><strong>{formatCompact(brand.followers)}</strong> seguidores</span>
          <span><strong>{dropItems.length}</strong> piezas en el drop</span>
        </div>

        <div className="drop-card">
          <div>
            <span className="eyebrow">Próximo drop · {brand.drop.date}</span>
            <h3>{brand.drop.title}</h3>
            <p>{brand.drop.subtitle}</p>
          </div>
          <span className="drop-badge">Drop</span>
        </div>

        <div className="sheet-section-heading">
          <span>Prendas del drop</span>
          <em>{dropItems.length}</em>
        </div>
        <div className="brand-product-scroll">
          {dropItems.map((product) => (
            <button type="button" key={product.id} onClick={() => onOpenItem(product.id)}>
              <img src={product.image} alt="" style={{ objectPosition: product.imagePos }} />
              <span>{product.name}</span>
              <em>{formatPrice(product.price)}</em>
            </button>
          ))}
        </div>

        <div className="sheet-section-heading">
          <span>Así lo lleva la comunidad</span>
          <em>{community.length} looks</em>
        </div>
        <div className="community-grid">
          {community.map((outfit) => (
            <button type="button" key={outfit.id} onClick={() => onOpenOutfit(outfit.id)}>
              <img src={outfit.image} alt={outfit.title} style={{ objectPosition: outfit.imagePos }} />
              <span>{outfit.title}</span>
            </button>
          ))}
        </div>
      </div>
    </Sheet>
  )
}

export function EditProfileSheet({ onClose }: { onClose: () => void }) {
  const { me, updateProfile, notify } = useStore()
  const [name, setName] = useState(me.name)
  const [handle, setHandle] = useState(me.handle)
  const [bio, setBio] = useState(me.bio)
  const [styles, setStyles] = useState<Style[]>(me.styles)
  const [error, setError] = useState('')
  const allStyles: Style[] = ['Minimalista', 'Casual', 'Streetwear', 'Vintage', 'Boho', 'Clásico']

  const toggleStyle = (style: Style) => {
    setStyles((prev) =>
      prev.includes(style)
        ? prev.filter((item) => item !== style)
        : prev.length >= 3
          ? prev
          : [...prev, style],
    )
  }

  const save = () => {
    if (!name.trim() || !handle.trim()) {
      setError('Nombre y usuario son obligatorios.')
      return
    }
    const nextHandle = handle.replace(/^@/, '').replace(/\s+/g, '').toLowerCase()
    const profile: ProfileSettings = {
      name: name.trim(),
      handle: nextHandle,
      bio: bio.trim(),
      styles,
    }
    updateProfile(profile)
    notify('Perfil actualizado')
    onClose()
  }

  return (
    <Sheet title="Editar perfil" subtitle="Tres etiquetas de estilo bastan." onClose={onClose}>
      <label className="field">
        <span>Nombre</span>
        <input value={name} onChange={(event) => setName(event.target.value)} />
      </label>
      <label className="field">
        <span>Usuario</span>
        <input value={handle} onChange={(event) => setHandle(event.target.value)} />
      </label>
      <label className="field">
        <span>Bio</span>
        <textarea value={bio} onChange={(event) => setBio(event.target.value)} rows={3} maxLength={120} />
      </label>
      <div className="field-block">
        <span>Estilos · máximo 3</span>
        <div className="filter-chips">
          {allStyles.map((style) => (
            <Chip key={style} active={styles.includes(style)} onClick={() => toggleStyle(style)}>
              {style}
            </Chip>
          ))}
        </div>
      </div>
      {error && <p className="form-error">{error}</p>}
      <button type="button" className="button button--dark button--wide" onClick={save}>
        Guardar perfil
      </button>
    </Sheet>
  )
}

export function FollowersSheet({
  kind,
  onClose,
}: {
  kind: 'followers' | 'following'
  onClose: () => void
}) {
  const { creators, isFollowing, toggleFollow, notify } = useStore()
  const people = creators.filter((creator) => creator.id !== 'me')

  return (
    <Sheet
      title={kind === 'followers' ? 'seguidores' : 'siguiendo'}
      subtitle={kind === 'followers' ? 'Quien te sigue' : 'A quién sigues'}
      onClose={onClose}
    >
      <div className="follow-list">
        {people.map((creator) => {
          const following = isFollowing(creator.id)
          return (
            <div className="person-row" key={creator.id}>
              <div className="person-main">
                <Avatar creator={creator} size={44} />
                <span>
                  <strong>{creator.name}</strong>
                  <em>@{creator.handle}</em>
                  <small>{creator.styles.join(' / ')}</small>
                </span>
              </div>
              <FollowButton
                following={following}
                onClick={() => {
                  toggleFollow(creator.id)
                  notify(following ? `Dejaste de seguir a ${creator.name}` : `Ahora sigues a ${creator.name}`)
                }}
                compact
              />
            </div>
          )
        })}
      </div>
    </Sheet>
  )
}

export function CategoryIcon({ category }: { category: Category }) {
  return <span className="category-icon">{category.slice(0, 1)}</span>
}
