export type Category =
  | 'Abrigo'
  | 'Top'
  | 'Pantalón'
  | 'Falda'
  | 'Vestido'
  | 'Zapatos'
  | 'Bolso'
  | 'Accesorio'

export type Style = 'Minimalista' | 'Streetwear' | 'Vintage' | 'Boho' | 'Clásico'

export type Occasion = 'Universidad' | 'Oficina' | 'Cena' | 'Festival' | 'Finde'

export type Tier = 'premium' | 'mid' | 'budget'

export interface Product {
  id: string
  name: string
  brand: string
  category: Category
  color: string
  style: Style
  price: number
  image: string
  imagePos?: string
  link: string
  tier: Tier
  family?: string
}

export interface Creator {
  id: string
  name: string
  handle: string
  avatar: string
  bio: string
  styles: Style[]
  followers: number
  following: number
  location: string
  verified?: boolean
}

export interface OutfitTag {
  x: number
  y: number
  itemId: string
}

export interface Outfit {
  id: string
  creatorId: string
  image: string
  imagePos?: string
  imageAspect?: string
  title: string
  description: string
  occasion: Occasion
  style: Style
  itemIds: string[]
  likes: number
  createdAt: string
  tags?: OutfitTag[]
}

export interface WishlistEntry {
  productId: string
  size?: string
  color?: string
  note?: string
  createdAt: string
}

export interface Message {
  id: string
  from: 'me' | 'them'
  text?: string
  outfitId?: string
  time: string
}

export interface Conversation {
  id: string
  creatorId: string
  messages: Message[]
  unread: number
}

export interface Brand {
  id: string
  name: string
  handle: string
  color: string
  logo: string
  bio: string
  followers: number
  drop: {
    title: string
    subtitle: string
    date: string
    image: string
    itemIds: string[]
  }
}

export interface ProfileSettings {
  name: string
  handle: string
  bio: string
  styles: Style[]
}

export interface Filters {
  category?: Category
  style?: Style
  occasion?: Occasion
  maxBudget?: number
}

export type Sheet =
  | { type: 'outfit'; outfitId: string; highlightItemId?: string }
  | { type: 'budget'; outfitId: string }
  | { type: 'item'; productId: string; focusBudget?: boolean }
  | { type: 'wishlist'; productId: string }
  | { type: 'share'; outfitId: string }
  | { type: 'creator'; creatorId: string }
  | { type: 'brand'; brandId: string }
  | { type: 'edit-profile' }
  | { type: 'followers'; kind: 'followers' | 'following' }
