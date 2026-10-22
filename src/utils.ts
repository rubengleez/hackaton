import type { Outfit, Product } from './types'

export const cn = (...parts: Array<string | false | null | undefined>) =>
  parts.filter(Boolean).join(' ')

export const formatPrice = (value: number) =>
  new Intl.NumberFormat('es-ES', {
    style: 'currency',
    currency: 'EUR',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(value)

export const formatCompact = (value: number) =>
  new Intl.NumberFormat('es-ES', {
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value)

export const outfitTotal = (outfit: Outfit, products: Product[]) =>
  outfit.itemIds.reduce((sum, id) => {
    const product = products.find((item) => item.id === id)
    return sum + (product?.price ?? 0)
  }, 0)

export const productsForOutfit = (outfit: Outfit, products: Product[]) =>
  outfit.itemIds
    .map((id) => products.find((item) => item.id === id))
    .filter((item): item is Product => Boolean(item))

export const initials = (name: string) =>
  name
    .split(' ')
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()

export const uid = (prefix: string) =>
  `${prefix}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 7)}`

export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    document.body.removeChild(area)
    return ok
  }
}

export function fileToDataUrl(file: File, maxSize = 1400): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = () => reject(new Error('No se pudo leer la imagen'))
    reader.onload = () => {
      const image = new Image()
      image.onerror = () => reject(new Error('No se pudo cargar la imagen'))
      image.onload = () => {
        const ratio = Math.min(1, maxSize / Math.max(image.width, image.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(image.width * ratio)
        canvas.height = Math.round(image.height * ratio)
        const context = canvas.getContext('2d')
        if (!context) {
          reject(new Error('No se pudo procesar la imagen'))
          return
        }
        context.drawImage(image, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', 0.82))
      }
      image.src = String(reader.result)
    }
    reader.readAsDataURL(file)
  })
}
