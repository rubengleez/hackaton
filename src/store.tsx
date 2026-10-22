import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import {
  brands as baseBrands,
  creators as baseCreators,
  initialConversations,
  outfits as baseOutfits,
  products as baseProducts,
} from './data'
import type {
  Conversation,
  Creator,
  Message,
  Outfit,
  Product,
  ProfileSettings,
  WishlistEntry,
} from './types'
import { uid } from './utils'

const STORAGE_KEY = 'tapp-demo-v1'

interface DemoState {
  likes: string[]
  saved: string[]
  following: string[]
  wishlist: WishlistEntry[]
  published: Outfit[]
  customProducts: Product[]
  wishlistPublic: boolean
  profile: ProfileSettings
  conversations: Conversation[]
}

const seedState: DemoState = {
  likes: ['o-tee'],
  saved: ['o-hoodie', 'o-tee'],
  following: ['lucia', 'elena', 'marcos', 'diego'],
  wishlist: [
    {
      productId: 'zapatillas-blancas',
      size: '38',
      color: 'Blanco',
      note: 'Para el finde, con todo.',
      createdAt: '2026-10-16',
    },
    {
      productId: 'abrigo-camel',
      size: 'M',
      color: 'Camel',
      note: 'Si baja de precio o hay drop.',
      createdAt: '2026-10-14',
    },
  ],
  published: [],
  customProducts: [],
  wishlistPublic: false,
  profile: {
    name: 'Sofía Martín',
    handle: 'sofia.martin',
    bio: 'Compro poco, combino mucho. Madrid.',
    styles: ['Minimalista', 'Streetwear', 'Vintage'],
  },
  conversations: initialConversations,
}

const cloneSeed = (): DemoState => JSON.parse(JSON.stringify(seedState)) as DemoState

const loadState = (): DemoState => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return cloneSeed()
    const parsed = JSON.parse(raw) as Partial<DemoState>
    return { ...cloneSeed(), ...parsed }
  } catch {
    return cloneSeed()
  }
}

interface Toast {
  id: number
  message: string
}

interface StoreValue {
  state: DemoState
  outfits: Outfit[]
  products: Product[]
  creators: Creator[]
  brands: typeof baseBrands
  me: Creator
  toast: Toast | null
  notify: (message: string) => void
  isLiked: (outfitId: string) => boolean
  isSaved: (outfitId: string) => boolean
  isFollowing: (creatorId: string) => boolean
  toggleLike: (outfitId: string) => void
  toggleSaved: (outfitId: string) => void
  toggleFollow: (creatorId: string) => void
  addWishlist: (entry: Omit<WishlistEntry, 'createdAt'>) => void
  updateWishlist: (productId: string, patch: Partial<WishlistEntry>) => void
  removeWishlist: (productId: string) => void
  publishOutfit: (outfit: Outfit, newProducts?: Product[]) => void
  sendMessage: (conversationId: string, text: string) => void
  sendOutfitTo: (creatorId: string, outfitId: string) => string
  markRead: (conversationId: string) => void
  setWishlistPublic: (isPublic: boolean) => void
  updateProfile: (profile: ProfileSettings) => void
  resetDemo: () => void
  productById: (id: string) => Product | undefined
  outfitById: (id: string) => Outfit | undefined
}

const StoreContext = createContext<StoreValue | null>(null)

export function StoreProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<DemoState>(loadState)
  const [toast, setToast] = useState<Toast | null>(null)
  const timer = useRef<number | null>(null)

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
    } catch {
      // A published photo can exceed the quota. The demo still works in memory.
    }
  }, [state])

  const notify = useCallback((message: string) => {
    if (timer.current) window.clearTimeout(timer.current)
    setToast({ id: Date.now(), message })
    timer.current = window.setTimeout(() => setToast(null), 2800)
  }, [])

  useEffect(
    () => () => {
      if (timer.current) window.clearTimeout(timer.current)
    },
    [],
  )

  const products = useMemo(
    () => [...baseProducts, ...state.customProducts],
    [state.customProducts],
  )

  const outfits = useMemo(
    () => [...state.published, ...baseOutfits],
    [state.published],
  )

  const me = useMemo<Creator>(
    () => ({
      ...baseCreators[0],
      name: state.profile.name,
      handle: state.profile.handle,
      bio: state.profile.bio,
      styles: state.profile.styles,
      following: 318 + state.following.filter((id) => !['lucia', 'elena'].includes(id)).length,
    }),
    [state.profile, state.following],
  )

  const creators = useMemo(
    () => [me, ...baseCreators.filter((creator) => creator.id !== 'me')],
    [me],
  )

  const isLiked = useCallback(
    (outfitId: string) => state.likes.includes(outfitId),
    [state.likes],
  )
  const isSaved = useCallback(
    (outfitId: string) => state.saved.includes(outfitId),
    [state.saved],
  )
  const isFollowing = useCallback(
    (creatorId: string) => state.following.includes(creatorId),
    [state.following],
  )

  const toggleLike = useCallback((outfitId: string) => {
    setState((prev) => ({
      ...prev,
      likes: prev.likes.includes(outfitId)
        ? prev.likes.filter((id) => id !== outfitId)
        : [...prev.likes, outfitId],
    }))
  }, [])

  const toggleSaved = useCallback((outfitId: string) => {
    setState((prev) => ({
      ...prev,
      saved: prev.saved.includes(outfitId)
        ? prev.saved.filter((id) => id !== outfitId)
        : [...prev.saved, outfitId],
    }))
  }, [])

  const toggleFollow = useCallback((creatorId: string) => {
    setState((prev) => ({
      ...prev,
      following: prev.following.includes(creatorId)
        ? prev.following.filter((id) => id !== creatorId)
        : [...prev.following, creatorId],
    }))
  }, [])

  const addWishlist = useCallback((entry: Omit<WishlistEntry, 'createdAt'>) => {
    setState((prev) => {
      const exists = prev.wishlist.some((item) => item.productId === entry.productId)
      return {
        ...prev,
        wishlist: exists
          ? prev.wishlist.map((item) =>
              item.productId === entry.productId
                ? { ...item, ...entry }
                : item,
            )
          : [...prev.wishlist, { ...entry, createdAt: new Date().toISOString() }],
      }
    })
  }, [])

  const updateWishlist = useCallback(
    (productId: string, patch: Partial<WishlistEntry>) => {
      setState((prev) => ({
        ...prev,
        wishlist: prev.wishlist.map((item) =>
          item.productId === productId ? { ...item, ...patch } : item,
        ),
      }))
    },
    [],
  )

  const removeWishlist = useCallback((productId: string) => {
    setState((prev) => ({
      ...prev,
      wishlist: prev.wishlist.filter((item) => item.productId !== productId),
    }))
  }, [])

  const publishOutfit = useCallback((outfit: Outfit, newProducts: Product[] = []) => {
    setState((prev) => ({
      ...prev,
      published: [outfit, ...prev.published],
      customProducts: [...prev.customProducts, ...newProducts],
    }))
  }, [])

  const sendMessage = useCallback((conversationId: string, text: string) => {
    const message: Message = {
      id: uid('m'),
      from: 'me',
      text,
      time: new Intl.DateTimeFormat('es-ES', {
        hour: '2-digit',
        minute: '2-digit',
      }).format(new Date()),
    }
    setState((prev) => ({
      ...prev,
      conversations: prev.conversations.map((conversation) =>
        conversation.id === conversationId
          ? { ...conversation, messages: [...conversation.messages, message] }
          : conversation,
      ),
    }))
  }, [])

  const sendOutfitTo = useCallback(
    (creatorId: string, outfitId: string) => {
      const existing = state.conversations.find(
        (conversation) => conversation.creatorId === creatorId,
      )
      const conversationId = existing?.id ?? uid('c')
      const message: Message = {
        id: uid('m'),
        from: 'me',
        outfitId,
        text: 'Mira este look 👀',
        time: new Intl.DateTimeFormat('es-ES', {
          hour: '2-digit',
          minute: '2-digit',
        }).format(new Date()),
      }
      setState((prev) => {
        if (existing) {
          return {
            ...prev,
            conversations: prev.conversations.map((conversation) =>
              conversation.id === existing.id
                ? {
                    ...conversation,
                    messages: [...conversation.messages, message],
                    unread: 0,
                  }
                : conversation,
            ),
          }
        }
        return {
          ...prev,
          conversations: [
            {
              id: conversationId,
              creatorId,
              unread: 0,
              messages: [message],
            },
            ...prev.conversations,
          ],
        }
      })
      return conversationId
    },
    [state.conversations],
  )

  const markRead = useCallback((conversationId: string) => {
    setState((prev) => {
      const conversation = prev.conversations.find((item) => item.id === conversationId)
      if (!conversation || conversation.unread === 0) return prev
      return {
        ...prev,
        conversations: prev.conversations.map((item) =>
          item.id === conversationId ? { ...item, unread: 0 } : item,
        ),
      }
    })
  }, [])

  const setWishlistPublic = useCallback((isPublic: boolean) => {
    setState((prev) => ({ ...prev, wishlistPublic: isPublic }))
  }, [])

  const updateProfile = useCallback((profile: ProfileSettings) => {
    setState((prev) => ({ ...prev, profile }))
  }, [])

  const resetDemo = useCallback(() => {
    localStorage.removeItem(STORAGE_KEY)
    setState(cloneSeed())
  }, [])

  const productById = useCallback(
    (id: string) => products.find((product) => product.id === id),
    [products],
  )

  const outfitById = useCallback(
    (id: string) => outfits.find((outfit) => outfit.id === id),
    [outfits],
  )

  const value: StoreValue = {
    state,
    outfits,
    products,
    creators,
    brands: baseBrands,
    me,
    toast,
    notify,
    isLiked,
    isSaved,
    isFollowing,
    toggleLike,
    toggleSaved,
    toggleFollow,
    addWishlist,
    updateWishlist,
    removeWishlist,
    publishOutfit,
    sendMessage,
    sendOutfitTo,
    markRead,
    setWishlistPublic,
    updateProfile,
    resetDemo,
    productById,
    outfitById,
  }

  return <StoreContext.Provider value={value}>{children}</StoreContext.Provider>
}

export function useStore() {
  const context = useContext(StoreContext)
  if (!context) throw new Error('useStore must be used inside StoreProvider')
  return context
}
