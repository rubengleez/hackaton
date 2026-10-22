import { useMemo, useState } from 'react'
import {
  ArrowUpRight,
  BadgeCheck,
  Bookmark,
  Plus,
  Search as SearchIcon,
  SlidersHorizontal,
  Sparkles,
  Store,
  X,
} from 'lucide-react'
import { useStore } from '../store'
import type { Brand, Category, Creator, Filters, Occasion, Outfit, Style } from '../types'
import {
  formatCompact,
  formatPrice,
  outfitTotal,
  productsForOutfit,
} from '../utils'
import {
  Avatar,
  Chip,
  FollowButton,
  ScreenHeader,
  Sheet,
} from '../components/ui'

type SearchTab = 'outfits' | 'items' | 'people'

interface SearchProps {
  onOpenOutfit: (outfitId: string, highlightItemId?: string) => void
  onOpenItem: (productId: string) => void
  onOpenCreator: (creatorId: string) => void
  onOpenBrand: (brandId: string) => void
}

const categories: Array<Category | 'Todo'> = [
  'Todo',
  'Abrigo',
  'Top',
  'Pantalón',
  'Falda',
  'Vestido',
  'Zapatos',
  'Bolso',
  'Accesorio',
]

const styles: Style[] = ['Minimalista', 'Casual', 'Streetwear', 'Vintage', 'Boho', 'Clásico']
const occasions: Occasion[] = ['Universidad', 'Oficina', 'Cena', 'Festival', 'Finde']
const budgets = [100, 150, 200, 250]

const defaultFilters: Filters = {}

export function Search({
  onOpenOutfit,
  onOpenItem,
  onOpenCreator,
  onOpenBrand,
}: SearchProps) {
  const {
    outfits,
    products,
    creators,
    brands,
    isSaved,
    toggleSaved,
    isFollowing,
    toggleFollow,
    notify,
  } = useStore()
  const [tab, setTab] = useState<SearchTab>('outfits')
  const [query, setQuery] = useState('')
  const [filters, setFilters] = useState<Filters>(defaultFilters)
  const [filterOpen, setFilterOpen] = useState(false)

  const normalizedQuery = query.trim().toLowerCase()
  const activeFilterCount =
    Number(Boolean(filters.category)) +
    Number(Boolean(filters.style)) +
    Number(Boolean(filters.occasion)) +
    Number(Boolean(filters.maxBudget))

  const filteredOutfits = useMemo(() => {
    return outfits.filter((outfit) => {
      const creator = creators.find((item) => item.id === outfit.creatorId)
      const items = productsForOutfit(outfit, products)
      const haystack = [
        outfit.title,
        outfit.description,
        outfit.occasion,
        outfit.style,
        creator?.name,
        creator?.handle,
        ...items.flatMap((item) => [item.name, item.brand, item.category, item.style]),
      ]
        .join(' ')
        .toLowerCase()

      if (normalizedQuery && !haystack.includes(normalizedQuery)) return false
      if (filters.category && !items.some((item) => item.category === filters.category)) {
        return false
      }
      if (filters.style && outfit.style !== filters.style) return false
      if (filters.occasion && outfit.occasion !== filters.occasion) return false
      if (
        filters.maxBudget &&
        outfitTotal(outfit, products) > filters.maxBudget
      ) {
        return false
      }
      return true
    })
  }, [filters, normalizedQuery, outfits, creators, products])

  const filteredProducts = useMemo(() => {
    return products.filter((product) => {
      const haystack = [
        product.name,
        product.brand,
        product.category,
        product.style,
        product.color,
      ]
        .join(' ')
        .toLowerCase()
      if (normalizedQuery && !haystack.includes(normalizedQuery)) return false
      if (filters.category && product.category !== filters.category) return false
      if (filters.style && product.style !== filters.style) return false
      if (filters.maxBudget && product.price > filters.maxBudget) return false
      return true
    })
  }, [filters, normalizedQuery, products])

  const filteredCreators = useMemo(() => {
    return creators.filter((creator) => {
      if (creator.id === 'me') return false
      const haystack = [creator.name, creator.handle, creator.bio, ...creator.styles]
        .join(' ')
        .toLowerCase()
      if (normalizedQuery && !haystack.includes(normalizedQuery)) return false
      if (filters.style && !creator.styles.includes(filters.style)) return false
      return true
    })
  }, [creators, filters.style, normalizedQuery])

  const filteredBrands = useMemo(() => {
    return brands.filter((brand) => {
      const haystack = [brand.name, brand.handle, brand.bio, brand.drop.title]
        .join(' ')
        .toLowerCase()
      return !normalizedQuery || haystack.includes(normalizedQuery)
    })
  }, [brands, normalizedQuery])

  const highlightFor = (outfit: Outfit) => {
    if (!normalizedQuery) return undefined
    return productsForOutfit(outfit, products).find((item) => {
      const haystack = `${item.name} ${item.brand} ${item.category} ${item.style}}`.toLowerCase()
      return haystack.includes(normalizedQuery)
    })?.id
  }

  const clearAll = () => {
    setFilters(defaultFilters)
    setQuery('')
  }

  return (
    <div className="screen screen--light search-screen">
      <ScreenHeader
        eyebrow="Inspiración → adaptación → compra"
        title="Explorar"
        action={
          <button
            type="button"
            className="header-icon-button"
            aria-label="Filtros"
            onClick={() => setFilterOpen(true)}
          >
            <SlidersHorizontal size={20} />
            {activeFilterCount > 0 && <span className="filter-count">{activeFilterCount}</span>}
          </button>
        }
      >
        <div className="search-field">
          <SearchIcon size={19} />
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Busca looks, prendas, personas…"
            aria-label="Buscar"
          />
          {query && (
            <button
              type="button"
              className="search-clear"
              onClick={() => setQuery('')}
              aria-label="Borrar búsqueda"
            >
              <X size={15} />
            </button>
          )}
        </div>
      </ScreenHeader>

      <div className="search-tabs" role="tablist" aria-label="Tipo de búsqueda">
        <button
          type="button"
          className={tab === 'outfits' ? 'is-active' : ''}
          onClick={() => setTab('outfits')}
          role="tab"
          aria-selected={tab === 'outfits'}
        >
          Outfits <span>{filteredOutfits.length}</span>
        </button>
        <button
          type="button"
          className={tab === 'items' ? 'is-active' : ''}
          onClick={() => setTab('items')}
          role="tab"
          aria-selected={tab === 'items'}
        >
          Prendas <span>{filteredProducts.length}</span>
        </button>
        <button
          type="button"
          className={tab === 'people' ? 'is-active' : ''}
          onClick={() => setTab('people')}
          role="tab"
          aria-selected={tab === 'people'}
        >
          Personas y marcas
        </button>
      </div>

      <div className="quick-categories">
        {categories.map((category) => (
          <Chip
            key={category}
            active={
              category === 'Todo'
                ? !filters.category
                : filters.category === category
            }
            onClick={() =>
              setFilters((prev) => ({
                ...prev,
                category: category === 'Todo' ? undefined : category,
              }))
            }
            tone="ghost"
          >
            {category}
          </Chip>
        ))}
      </div>

      {activeFilterCount > 0 && (
        <div className="active-filters">
          {filters.category && (
            <button type="button" onClick={() => setFilters((prev) => ({ ...prev, category: undefined }))}>
              {filters.category} <X size={12} />
            </button>
          )}
          {filters.occasion && (
            <button type="button" onClick={() => setFilters((prev) => ({ ...prev, occasion: undefined }))}>
              {filters.occasion} <X size={12} />
            </button>
          )}
          {filters.style && (
            <button type="button" onClick={() => setFilters((prev) => ({ ...prev, style: undefined }))}>
              {filters.style} <X size={12} />
            </button>
          )}
          {filters.maxBudget && (
            <button type="button" onClick={() => setFilters((prev) => ({ ...prev, maxBudget: undefined }))}>
              Hasta {filters.maxBudget} € <X size={12} />
            </button>
          )}
          <button type="button" className="clear-filters" onClick={clearAll}>
            Limpiar
          </button>
        </div>
      )}

      <div className="search-results">
        {tab === 'outfits' && (
          <>
            {!normalizedQuery && activeFilterCount === 0 && (
              <div className="discovery-note">
                <Sparkles size={16} />
                <p>
                  Busca <strong>«zapatillas»</strong> y abre el look: la prenda
                  que buscas aparecerá destacada.
                </p>
              </div>
            )}
            {filteredOutfits.length === 0 ? (
              <div className="search-empty">
                <h3>Sin resultados</h3>
                <p>Prueba con otra ocasión, estilo o presupuesto.</p>
                <button type="button" className="button button--dark" onClick={clearAll}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="outfit-grid">
                {filteredOutfits.map((outfit) => (
                  <OutfitCard
                    key={outfit.id}
                    outfit={outfit}
                    creator={creators.find((item) => item.id === outfit.creatorId) ?? creators[0]}
                    total={outfitTotal(outfit, products)}
                    saved={isSaved(outfit.id)}
                    onSave={() => {
                      const wasSaved = isSaved(outfit.id)
                      toggleSaved(outfit.id)
                      notify(wasSaved ? 'Quitado de Inspiración' : 'Look guardado')
                    }}
                    onOpen={() => onOpenOutfit(outfit.id, highlightFor(outfit))}
                    highlight={highlightFor(outfit)}
                  />
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'items' && (
          <>
            {filteredProducts.length === 0 ? (
              <div className="search-empty">
                <h3>Sin prendas con esos filtros</h3>
                <p>Baja el presupuesto o cambia la categoría.</p>
                <button type="button" className="button button--dark" onClick={clearAll}>
                  Limpiar filtros
                </button>
              </div>
            ) : (
              <div className="product-grid">
                {filteredProducts.map((product) => (
                  <button
                    type="button"
                    className="product-card"
                    key={product.id}
                    onClick={() => onOpenItem(product.id)}
                  >
                    <span className="product-image">
                      <img
                        src={product.image}
                        alt={product.name}
                        style={{ objectPosition: product.imagePos }}
                      />
                      <span className="product-add">
                        <Plus size={14} />
                      </span>
                    </span>
                    <span className="product-brand">{product.brand}</span>
                    <strong>{product.name}</strong>
                    <span className="product-price">{formatPrice(product.price)}</span>
                  </button>
                ))}
              </div>
            )}
          </>
        )}

        {tab === 'people' && (
          <div className="people-results">
            {filteredBrands.length === 0 && filteredCreators.length === 0 ? (
              <div className="search-empty">
                <h3>Nadie con ese nombre</h3>
                <p>Prueba otra búsqueda o vuelve a ver todas las personas y marcas.</p>
                <button type="button" className="button button--dark" onClick={clearAll}>
                  Ver todos
                </button>
              </div>
            ) : (
              <>
                {!normalizedQuery && (
                  <button
                    type="button"
                    className="drop-banner"
                    onClick={() => onOpenBrand('nova')}
                  >
                    <span className="drop-banner-image">
                      <img src="/images/outfits/look-leather.jpg" alt="Drop Piel y perlas de NOVA" />
                    </span>
                    <span className="drop-banner-copy">
                      <span className="eyebrow">Drop · 12 nov</span>
                      <strong>After Hours</strong>
                      <em>NOVA · 24 piezas</em>
                    </span>
                    <ArrowUpRight size={20} />
                  </button>
                )}

                {filteredBrands.length > 0 && (
                  <>
                    <div className="people-section-title">
                      <span>Marcas</span>
                      <em>Drops y colecciones</em>
                    </div>
                    {filteredBrands.map((brand) => (
                      <BrandRow
                        key={brand.id}
                        brand={brand}
                        following={isFollowing(brand.id)}
                        onFollow={() => {
                          toggleFollow(brand.id)
                          notify(isFollowing(brand.id) ? `Dejaste de seguir ${brand.name}` : `Ahora sigues a ${brand.name}`)
                        }}
                        onOpen={() => onOpenBrand(brand.id)}
                      />
                    ))}
                  </>
                )}

                {filteredCreators.length > 0 && (
                  <>
                    <div className="people-section-title">
                      <span>Personas</span>
                      <em>Estilo real, cuerpos reales</em>
                    </div>
                    {filteredCreators.map((creator) => (
                      <CreatorRow
                        key={creator.id}
                        creator={creator}
                        following={isFollowing(creator.id)}
                        onFollow={() => {
                          toggleFollow(creator.id)
                          notify(isFollowing(creator.id) ? `Dejaste de seguir a ${creator.name}` : `Ahora sigues a ${creator.name}`)
                        }}
                        onOpen={() => onOpenCreator(creator.id)}
                      />
                    ))}
                  </>
                )}
              </>
            )}
          </div>
        )}
      </div>

      {filterOpen && (
        <FilterSheet
          current={filters}
          onClose={() => setFilterOpen(false)}
          onApply={(next) => {
            setFilters(next)
            setFilterOpen(false)
          }}
        />
      )}
    </div>
  )
}

function OutfitCard({
  outfit,
  creator,
  total,
  saved,
  onSave,
  onOpen,
  highlight,
}: {
  outfit: Outfit
  creator: Creator
  total: number
  saved: boolean
  onSave: () => void
  onOpen: () => void
  highlight?: string
}) {
  return (
    <article className="outfit-card">
      <button type="button" className="outfit-card-image" onClick={onOpen}>
        <img
          src={outfit.image}
          alt={`${outfit.title}, look de ${creator.name}`}
          style={{ objectPosition: outfit.imagePos }}
        />
        <span className="outfit-card-tag">{outfit.occasion}</span>
        <span className="outfit-card-creator">
          <Avatar creator={creator} size={22} />
          {creator.name.split(' ')[0]}
        </span>
      </button>
      <button
        type="button"
        className={`outfit-card-save ${saved ? 'is-saved' : ''}`}
        onClick={onSave}
        aria-label={saved ? 'Quitar de guardados' : 'Guardar look'}
      >
        <Bookmark size={16} fill={saved ? 'currentColor' : 'none'} />
      </button>
      <div className="outfit-card-copy">
        <strong>{outfit.title}</strong>
        <span>{formatPrice(total)}</span>
      </div>
      {highlight && <span className="outfit-card-highlight">Incluye lo que buscas</span>}
    </article>
  )
}

function CreatorRow({
  creator,
  following,
  onFollow,
  onOpen,
}: {
  creator: Creator
  following: boolean
  onFollow: () => void
  onOpen: () => void
}) {
  return (
    <div className="person-row">
      <button type="button" className="person-main" onClick={onOpen}>
        <Avatar creator={creator} size={48} />
        <span>
          <strong>
            {creator.name}
            {creator.verified && <BadgeCheck size={14} className="inline-verified" />}
          </strong>
          <em>@{creator.handle} · {creator.location}</em>
          <small>{formatCompact(creator.followers)} seguidores · {creator.styles.join(' / ')}</small>
        </span>
      </button>
      <FollowButton following={following} onClick={onFollow} compact />
    </div>
  )
}

function BrandRow({
  brand,
  following,
  onFollow,
  onOpen,
}: {
  brand: Brand
  following: boolean
  onFollow: () => void
  onOpen: () => void
}) {
  return (
    <div className="person-row brand-row">
      <button type="button" className="person-main" onClick={onOpen}>
        <span className="brand-logo" style={{ background: brand.color }}>
          {brand.logo}
        </span>
        <span>
          <strong>
            {brand.name}
            <span className="brand-badge">Marca</span>
          </strong>
          <em>@{brand.handle} · Drop {brand.drop.date}</em>
          <small>{formatCompact(brand.followers)} seguidores · {brand.drop.title}</small>
        </span>
      </button>
      <FollowButton following={following} onClick={onFollow} compact />
    </div>
  )
}

function FilterSheet({
  current,
  onClose,
  onApply,
}: {
  current: Filters
  onClose: () => void
  onApply: (filters: Filters) => void
}) {
  const [draft, setDraft] = useState<Filters>(current)

  const toggle = <K extends keyof Filters>(key: K, value: Filters[K]) => {
    setDraft((prev) => ({
      ...prev,
      [key]: prev[key] === value ? undefined : value,
    }))
  }

  return (
    <Sheet
      title="Filtros"
      subtitle="Solo lo que te sirve, sin ruido."
      onClose={onClose}
      className="filter-sheet"
    >
      <div className="filter-section">
        <div className="filter-title">
          <span>Categoría</span>
          {draft.category && (
            <button type="button" onClick={() => setDraft((prev) => ({ ...prev, category: undefined }))}>
              Quitar
            </button>
          )}
        </div>
        <div className="filter-chips">
          {categories.slice(1).map((category) => (
            <Chip
              key={category}
              active={draft.category === category}
              onClick={() => toggle('category', category as Category)}
            >
              {category}
            </Chip>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-title">
          <span>Estilo</span>
          {draft.style && (
            <button type="button" onClick={() => setDraft((prev) => ({ ...prev, style: undefined }))}>
              Quitar
            </button>
          )}
        </div>
        <div className="filter-chips">
          {styles.map((style) => (
            <Chip
              key={style}
              active={draft.style === style}
              onClick={() => toggle('style', style)}
            >
              {style}
            </Chip>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-title">
          <span>Ocasión</span>
          {draft.occasion && (
            <button type="button" onClick={() => setDraft((prev) => ({ ...prev, occasion: undefined }))}>
              Quitar
            </button>
          )}
        </div>
        <div className="filter-chips">
          {occasions.map((occasion) => (
            <Chip
              key={occasion}
              active={draft.occasion === occasion}
              onClick={() => toggle('occasion', occasion)}
            >
              {occasion}
            </Chip>
          ))}
        </div>
      </div>

      <div className="filter-section">
        <div className="filter-title">
          <span>Presupuesto máximo</span>
          {draft.maxBudget && (
            <button type="button" onClick={() => setDraft((prev) => ({ ...prev, maxBudget: undefined }))}>
              Quitar
            </button>
          )}
        </div>
        <div className="filter-chips">
          {budgets.map((budget) => (
            <Chip
              key={budget}
              active={draft.maxBudget === budget}
              onClick={() => toggle('maxBudget', budget)}
            >
              Hasta {budget} €
            </Chip>
          ))}
        </div>
        <p className="filter-hint">
          <Store size={14} /> El precio es el del look completo, no el de una sola prenda.
        </p>
      </div>

      <div className="filter-actions">
        <button
          type="button"
          className="button button--ghost"
          onClick={() => setDraft({})}
        >
          Limpiar
        </button>
        <button
          type="button"
          className="button button--dark"
          onClick={() => onApply(draft)}
        >
          Ver resultados
        </button>
      </div>
    </Sheet>
  )
}
