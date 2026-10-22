import { useMemo, useRef, useState } from 'react'
import {
  ArrowLeft,
  Camera,
  Check,
  ChevronRight,
  ImagePlus,
  Link2,
  Plus,
  Sparkles,
  Tag,
  Upload,
  X,
} from 'lucide-react'
import { useStore } from '../store'
import type {
  Category,
  Occasion,
  Outfit,
  OutfitTag,
  Product,
  Style,
} from '../types'
import {
  fileToDataUrl,
  formatPrice,
  uid,
} from '../utils'
import { Chip, Sheet } from '../components/ui'

interface PublishProps {
  onBack: () => void
  onPublished: () => void
}

const demoPhotos = [
  { src: 'images/outfits/look-rugby.jpg', label: 'rayas' },
  { src: 'images/outfits/look-hoodie.jpg', label: 'gris' },
  { src: 'images/outfits/look-tee.jpg', label: 'gráfica' },
  { src: 'images/outfits/look-shelf.jpg', label: 'shelf' },
  { src: 'images/outfits/look-leather.jpg', label: 'piel' },
  { src: 'images/outfits/look-seated.jpg', label: 'sombra' },
]

const styles: Style[] = ['Minimalista', 'Casual', 'Streetwear', 'Vintage', 'Boho', 'Clásico']
const occasions: Occasion[] = ['Universidad', 'Oficina', 'Cena', 'Festival', 'Finde']
const categories: Category[] = [
  'Abrigo',
  'Top',
  'Pantalón',
  'Falda',
  'Vestido',
  'Zapatos',
  'Bolso',
  'Accesorio',
]

const fallbackImage: Record<Category, string> = {
  Abrigo: 'images/items/abrigo-camel.jpg',
  Top: 'images/items/top-blanco.jpg',
  Pantalón: 'images/items/jeans-rectos.jpg',
  Falda: 'images/items/falda-negra.jpg',
  Vestido: 'images/items/vestido-lila.jpg',
  Zapatos: 'images/items/zapatillas-blancas.jpg',
  Bolso: 'images/items/bolso-mini.jpg',
  Accesorio: 'images/items/gafas-negras.jpg',
}

export function Publish({ onBack, onPublished }: PublishProps) {
  const { products, publishOutfit, notify } = useStore()
  const fileInput = useRef<HTMLInputElement>(null)
  const [photo, setPhoto] = useState('')
  const [title, setTitle] = useState('')
  const [description, setDescription] = useState('')
  const [style, setStyle] = useState<Style | null>(null)
  const [occasion, setOccasion] = useState<Occasion | null>(null)
  const [items, setItems] = useState<Product[]>([])
  const [customItems, setCustomItems] = useState<Product[]>([])
  const [tags, setTags] = useState<OutfitTag[]>([])
  const [taggingId, setTaggingId] = useState<string | null>(null)
  const [pickerOpen, setPickerOpen] = useState(false)
  const [errors, setErrors] = useState<string[]>([])
  const [uploading, setUploading] = useState(false)

  const catalog = useMemo(() => [...products, ...customItems], [products, customItems])

  const chooseFile = async (file: File | undefined) => {
    if (!file) return
    setUploading(true)
    try {
      const dataUrl = await fileToDataUrl(file)
      setPhoto(dataUrl)
      setTags([])
    } catch {
      notify('No se pudo cargar la foto')
    } finally {
      setUploading(false)
    }
  }

  const onPhotoClick = (event: React.MouseEvent<HTMLDivElement>) => {
    if (!taggingId) return
    const rect = event.currentTarget.getBoundingClientRect()
    const x = ((event.clientX - rect.left) / rect.width) * 100
    const y = ((event.clientY - rect.top) / rect.height) * 100
    setTags((prev) => [
      ...prev.filter((tag) => tag.itemId !== taggingId),
      { x, y, itemId: taggingId },
    ])
    setTaggingId(null)
    notify('Etiqueta colocada')
  }

  const publish = () => {
    const missing: string[] = []
    if (!photo) missing.push('Añade una foto.')
    if (!title.trim()) missing.push('Escribe un título.')
    if (!description.trim()) missing.push('Añade una descripción breve.')
    if (items.length === 0) missing.push('Añade al menos una prenda.')
    if (!style) missing.push('Elige un estilo.')
    if (!occasion) missing.push('Elige una ocasión.')
    setErrors(missing)
    if (missing.length > 0) {
      notify('Faltan datos para publicar')
      return
    }

    const newProducts = items.filter(
      (item) => !products.some((product) => product.id === item.id),
    )
    const outfit: Outfit = {
      id: uid('look'),
      creatorId: 'me',
      image: photo,
      title: title.trim(),
      description: description.trim(),
      occasion: occasion as Occasion,
      style: style as Style,
      itemIds: items.map((item) => item.id),
      likes: 0,
      createdAt: new Date().toISOString(),
      tags,
    }
    publishOutfit(outfit, newProducts)
    notify('Tu look ya está publicado')
    onPublished()
  }

  return (
    <div className="screen screen--light publish-screen">
      <header className="publish-header">
        <button type="button" className="header-icon-button" onClick={onBack} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <div>
          <span className="eyebrow">Nuevo look</span>
          <h1>Publicar</h1>
        </div>
        <span className="publish-draft">
          <Check size={13} /> Borrador
        </span>
      </header>

      <div className="publish-scroll">
        {errors.length > 0 && (
          <div className="publish-errors">
            <strong>Revisa estos puntos</strong>
            <ul>
              {errors.map((error) => (
                <li key={error}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        <section className="publish-card">
          <div className="publish-card-heading">
            <span className="step-number">01</span>
            <div>
              <h2>La foto</h2>
              <p>Vertical, con aire. Es lo primero que se ve.</p>
            </div>
          </div>

          {photo ? (
            <div className="publish-photo-wrap">
              <div
                className={`publish-photo ${taggingId ? 'is-tagging' : ''}`}
                onClick={onPhotoClick}
                role="button"
                tabIndex={0}
                onKeyDown={(event) => {
                  if (event.key === 'Enter') onPhotoClick(event as unknown as React.MouseEvent<HTMLDivElement>)
                }}
              >
                <img src={photo} alt="Look que vas a publicar" />
                {tags.map((tag, index) => {
                  const item = catalog.find((product) => product.id === tag.itemId)
                  return (
                    <span
                      className="publish-tag"
                      key={`${tag.itemId}-${index}`}
                      style={{ left: `${tag.x}%`, top: `${tag.y}%` }}
                      onClick={(event) => {
                        event.stopPropagation()
                        setTags((prev) =>
                          prev.filter(
                            (existing) =>
                              !(existing.itemId === tag.itemId && existing.x === tag.x),
                          ),
                        )
                      }}
                      title={`Quitar etiqueta de ${item?.name ?? 'prenda'}`}
                    >
                      {index + 1}
                    </span>
                  )
                })}
                {taggingId && (
                  <span className="tagging-hint">
                    <Tag size={14} /> Toca la foto para etiquetar
                  </span>
                )}
                <button
                  type="button"
                  className="photo-change"
                  onClick={(event) => {
                    event.stopPropagation()
                    fileInput.current?.click()
                  }}
                >
                  <Camera size={15} /> Cambiar
                </button>
              </div>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => void chooseFile(event.target.files?.[0])}
              />
              {items.length > 0 && (
                <div className="tag-picker">
                  <span>
                    <Tag size={13} /> Etiquetar prenda
                  </span>
                  <div>
                    {items.map((item, index) => (
                      <button
                        type="button"
                        key={item.id}
                        className={taggingId === item.id ? 'is-active' : ''}
                        onClick={() => setTaggingId(taggingId === item.id ? null : item.id)}
                      >
                        {index + 1}. {item.name}
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="upload-area">
              <button
                type="button"
                className="upload-main"
                onClick={() => fileInput.current?.click()}
                disabled={uploading}
              >
                <span className="upload-icon">
                  <ImagePlus size={25} />
                </span>
                <strong>{uploading ? 'Procesando foto…' : 'Subir una foto'}</strong>
                <span>JPG o PNG · vertical mejor</span>
              </button>
              <input
                ref={fileInput}
                type="file"
                accept="image/*"
                hidden
                onChange={(event) => void chooseFile(event.target.files?.[0])}
              />
              <div className="demo-photos">
                <span>o usa una foto de demo</span>
                <div>
                  {demoPhotos.map((photoOption) => (
                    <button
                      type="button"
                      key={photoOption.src}
                      onClick={() => {
                        setPhoto(photoOption.src)
                        setTags([])
                      }}
                      aria-label={`Usar foto ${photoOption.label}`}
                    >
                      <img src={photoOption.src} alt="" />
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </section>

        <section className="publish-card">
          <div className="publish-card-heading">
            <span className="step-number">02</span>
            <div>
              <h2>Cuéntalo</h2>
              <p>Una frase basta. Dónde te lo pondrías o por qué funciona.</p>
            </div>
          </div>
          <label className="field">
            <span>Título</span>
            <input
              value={title}
              maxLength={60}
              onChange={(event) => setTitle(event.target.value)}
              placeholder="Ej. Cena en terrazas"
            />
            <em>{title.length}/60</em>
          </label>
          <label className="field">
            <span>Descripción</span>
            <textarea
              value={description}
              maxLength={180}
              rows={3}
              onChange={(event) => setDescription(event.target.value)}
              placeholder="Camel, negro y un toque de marfil…"
            />
            <em>{description.length}/180</em>
          </label>
        </section>

        <section className="publish-card">
          <div className="publish-card-heading">
            <span className="step-number">03</span>
            <div>
              <h2>Las prendas</h2>
              <p>Marca, precio y enlace. Lo justo para poder comprarlo.</p>
            </div>
          </div>

          {items.length > 0 && (
            <div className="publish-items">
              {items.map((item, index) => (
                <div className="publish-item" key={`${item.id}-${index}`}>
                  <span className="publish-item-number">{index + 1}</span>
                  <img
                    src={item.image}
                    alt=""
                    style={{ objectPosition: item.imagePos }}
                  />
                  <div>
                    <span>{item.brand}</span>
                    <strong>{item.name}</strong>
                    <em>{item.price > 0 ? formatPrice(item.price) : 'Precio sin indicar'}</em>
                  </div>
                  <button
                    type="button"
                    onClick={() => {
                      setItems((prev) => prev.filter((existing) => existing.id !== item.id))
                      setTags((prev) => prev.filter((tag) => tag.itemId !== item.id))
                    }}
                    aria-label={`Quitar ${item.name}`}
                  >
                    <X size={16} />
                  </button>
                </div>
              ))}
            </div>
          )}

          <button type="button" className="add-item-button" onClick={() => setPickerOpen(true)}>
            <Plus size={18} />
            Añadir prenda
            <ChevronRight size={17} />
          </button>
          <p className="form-hint">
            <Link2 size={13} /> Pega siempre el enlace de la tienda. La IA puede
            buscar coincidencias, pero no inventar una URL.
          </p>
        </section>

        <section className="publish-card">
          <div className="publish-card-heading">
            <span className="step-number">04</span>
            <div>
              <h2>El contexto</h2>
              <p>Así encontramos tu look cuando alguien busca algo concreto.</p>
            </div>
          </div>
          <div className="field-block">
            <span>Estilo</span>
            <div className="filter-chips">
              {styles.map((option) => (
                <Chip key={option} active={style === option} onClick={() => setStyle(option)}>
                  {option}
                </Chip>
              ))}
            </div>
          </div>
          <div className="field-block">
            <span>Ocasión</span>
            <div className="filter-chips">
              {occasions.map((option) => (
                <Chip key={option} active={occasion === option} onClick={() => setOccasion(option)}>
                  {option}
                </Chip>
              ))}
            </div>
          </div>
        </section>

        <div className="publish-tip">
          <Sparkles size={16} />
          <p>
            Tu look entrará en el feed con las prendas ya etiquetadas. Podrás
            editarlo o borrarlo desde tu perfil.
          </p>
        </div>
      </div>

      <footer className="publish-footer">
        <button type="button" className="button button--dark button--wide" onClick={publish}>
          Publicar look
        </button>
      </footer>

      {pickerOpen && (
        <ItemPicker
          catalog={catalog}
          onClose={() => setPickerOpen(false)}
          onPick={(product) => {
            if (!items.some((item) => item.id === product.id)) {
              setItems((prev) => [...prev, product])
            }
            setPickerOpen(false)
          }}
          onManual={(product) => {
            setCustomItems((prev) => [...prev, product])
            setItems((prev) => [...prev, product])
            setPickerOpen(false)
          }}
          style={style}
          color="—"
        />
      )}
    </div>
  )
}

function ItemPicker({
  catalog,
  onClose,
  onPick,
  onManual,
  style,
}: {
  catalog: Product[]
  onClose: () => void
  onPick: (product: Product) => void
  onManual: (product: Product) => void
  style: Style | null
  color: string
}) {
  const [mode, setMode] = useState<'catalog' | 'manual'>('catalog')
  const [query, setQuery] = useState('')
  const [manualError, setManualError] = useState('')
  const [name, setName] = useState('')
  const [brand, setBrand] = useState('')
  const [category, setCategory] = useState<Category>('Top')
  const [price, setPrice] = useState('')
  const [storeLink, setStoreLink] = useState('')

  const filtered = useMemo(() => {
    const normalized = query.trim().toLowerCase()
    if (!normalized) return catalog.slice(0, 30)
    return catalog.filter((product) =>
      `${product.name} ${product.brand} ${product.category}`
        .toLowerCase()
        .includes(normalized),
    )
  }, [catalog, query])

  const addManual = () => {
    if (!name.trim() || !brand.trim()) {
      setManualError('Añade nombre y marca.')
      return
    }
    if (!storeLink.trim() || !/^https?:\/\//i.test(storeLink.trim())) {
      setManualError('Añade un enlace válido que empiece por http.')
      return
    }
    onManual({
      id: uid('custom'),
      name: name.trim(),
      brand: brand.trim(),
      category,
      color: '—',
      style: style ?? 'Minimalista',
      price: price ? Number.parseFloat(price.replace(',', '.')) || 0 : 0,
      image: fallbackImage[category],
      imagePos: 'center 45%',
      link: storeLink.trim(),
      tier: 'mid',
    })
  }

  return (
    <Sheet
      title="Añadir prenda"
      subtitle="Del catálogo o pegando el enlace de la tienda."
      onClose={onClose}
      className="picker-sheet"
    >
      <div className="picker-tabs">
        <button
          type="button"
          className={mode === 'catalog' ? 'is-active' : ''}
          onClick={() => setMode('catalog')}
        >
          Catálogo
        </button>
        <button
          type="button"
          className={mode === 'manual' ? 'is-active' : ''}
          onClick={() => setMode('manual')}
        >
          Añadir manualmente
        </button>
      </div>

      {mode === 'catalog' ? (
        <>
          <div className="search-field search-field--compact">
            <ImagePlus size={17} />
            <input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Busca marca o prenda"
              aria-label="Buscar en el catálogo"
            />
          </div>
          <div className="picker-list">
            {filtered.map((product) => (
              <button
                type="button"
                className="picker-row"
                key={product.id}
                onClick={() => onPick(product)}
              >
                <img src={product.image} alt="" style={{ objectPosition: product.imagePos }} />
                <span>
                  <em>{product.brand}</em>
                  <strong>{product.name}</strong>
                  <small>{product.price > 0 ? formatPrice(product.price) : 'Precio sin indicar'}</small>
                </span>
                <Plus size={18} />
              </button>
            ))}
          </div>
        </>
      ) : (
        <div className="manual-form">
          <div className="manual-note">
            <Upload size={17} />
            <p>
              Para el prototipo, el creador pega el enlace. Más adelante, la IA
              puede proponer coincidencias del catálogo y el creador confirma.
            </p>
          </div>
          <label className="field">
            <span>Nombre de la prenda</span>
            <input value={name} onChange={(event) => setName(event.target.value)} placeholder="Ej. Blazer oversize" />
          </label>
          <div className="field-row">
            <label className="field">
              <span>Marca</span>
              <input value={brand} onChange={(event) => setBrand(event.target.value)} placeholder="Zara" />
            </label>
            <label className="field">
              <span>Precio (opcional)</span>
              <input
                value={price}
                onChange={(event) => setPrice(event.target.value)}
                inputMode="decimal"
                placeholder="49,95"
              />
            </label>
          </div>
          <label className="field">
            <span>Categoría</span>
            <select value={category} onChange={(event) => setCategory(event.target.value as Category)}>
              {categories.map((option) => (
                <option key={option} value={option}>
                  {option}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Enlace a la tienda</span>
            <input
              value={storeLink}
              onChange={(event) => setStoreLink(event.target.value)}
              placeholder="https://…"
              type="url"
            />
          </label>
          {manualError && <p className="form-error">{manualError}</p>}
          <button type="button" className="button button--dark button--wide" onClick={addManual}>
            Añadir al look
          </button>
        </div>
      )}
    </Sheet>
  )
}
