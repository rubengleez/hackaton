import { useState } from 'react'
import { useStore } from './store'
import type { Session, Sheet } from './types'
import { Auth } from './screens/Auth'
import { Feed } from './screens/Feed'
import { Search } from './screens/Search'
import { Saved } from './screens/Saved'
import { Publish } from './screens/Publish'
import { Profile } from './screens/Profile'
import { Messages } from './screens/Messages'
import {
  BudgetSheet,
  BrandSheet,
  CreatorSheet,
  EditProfileSheet,
  FollowersSheet,
  ItemSheet,
  OutfitSheet,
  ShareSheet,
  WishlistEditSheet,
} from './components/Sheets'
import { BottomNav, Toast } from './components/ui'

type Screen = 'feed' | 'search' | 'saved' | 'profile' | 'publish' | 'messages' | 'chat'

const SESSION_KEY = 'tapp-session-v1'

const loadSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(SESSION_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Session
    return parsed?.name ? parsed : null
  } catch {
    return null
  }
}

export default function App() {
  const { toast, updateProfile } = useStore()
  const [session, setSession] = useState<Session | null>(loadSession)
  const [screen, setScreen] = useState<Screen>('feed')
  const [feedIndex, setFeedIndex] = useState(0)
  const [sheets, setSheets] = useState<Sheet[]>([])
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null)

  const pushSheet = (sheet: Sheet) => setSheets((prev) => [...prev, sheet])
  const closeSheet = () => setSheets((prev) => prev.slice(0, -1))
  const closeAllSheets = () => setSheets([])
  const activeSheet = sheets[sheets.length - 1]

  const openOutfit = (outfitId: string, highlightItemId?: string) =>
    pushSheet({ type: 'outfit', outfitId, highlightItemId })
  const openBudget = (outfitId: string) => pushSheet({ type: 'budget', outfitId })
  const openItem = (productId: string, focusBudget = false) =>
    pushSheet({ type: 'item', productId, focusBudget })
  const openWishlist = (productId: string) => pushSheet({ type: 'wishlist', productId })
  const openShare = (outfitId: string) => pushSheet({ type: 'share', outfitId })
  const openCreator = (creatorId: string) => pushSheet({ type: 'creator', creatorId })
  const openBrand = (brandId: string) => pushSheet({ type: 'brand', brandId })

  const goTab = (tab: 'feed' | 'search' | 'saved' | 'profile' | 'messages') => {
    setScreen(tab)
    closeAllSheets()
  }

  const completeAuth = (next: Session) => {
    try {
      localStorage.setItem(SESSION_KEY, JSON.stringify(next))
    } catch {
      // La sesión también vive en memoria durante esta visita.
    }
    if (!next.guest) {
      updateProfile({
        name: next.name,
        handle: next.handle,
        bio: 'estrenando perfil en tapp.',
        styles: next.styles,
      })
    }
    setSession(next)
    setScreen('feed')
    setFeedIndex(0)
    closeAllSheets()
  }

  const logout = () => {
    try {
      localStorage.removeItem(SESSION_KEY)
    } catch {
      // Sin sesión guardada no hay nada que borrar.
    }
    setSession(null)
    setScreen('feed')
    closeAllSheets()
  }

  const sheetNode = (() => {
    if (!activeSheet) return null
    switch (activeSheet.type) {
      case 'outfit':
        return (
          <OutfitSheet
            outfitId={activeSheet.outfitId}
            highlightItemId={activeSheet.highlightItemId}
            onClose={closeSheet}
            onOpenBudget={openBudget}
            onOpenItem={openItem}
            onOpenWishlist={openWishlist}
            onOpenShare={openShare}
            onOpenCreator={openCreator}
          />
        )
      case 'budget':
        return (
          <BudgetSheet
            outfitId={activeSheet.outfitId}
            onClose={closeSheet}
            onOpenItem={openItem}
            onOpenOutfit={(outfitId) => {
              closeSheet()
              openOutfit(outfitId)
            }}
          />
        )
      case 'item':
        return (
          <ItemSheet
            productId={activeSheet.productId}
            focusBudget={activeSheet.focusBudget}
            onClose={closeSheet}
            onOpenWishlist={openWishlist}
            onOpenItem={openItem}
          />
        )
      case 'wishlist':
        return <WishlistEditSheet productId={activeSheet.productId} onClose={closeSheet} />
      case 'share':
        return (
          <ShareSheet
            outfitId={activeSheet.outfitId}
            onClose={closeSheet}
            onSent={(conversationId) => {
              closeAllSheets()
              setActiveConversationId(conversationId)
              setScreen('chat')
            }}
          />
        )
      case 'creator':
        return (
          <CreatorSheet
            creatorId={activeSheet.creatorId}
            onClose={closeSheet}
            onOpenOutfit={openOutfit}
          />
        )
      case 'brand':
        return (
          <BrandSheet
            brandId={activeSheet.brandId}
            onClose={closeSheet}
            onOpenItem={openItem}
            onOpenOutfit={openOutfit}
          />
        )
      case 'edit-profile':
        return <EditProfileSheet onClose={closeSheet} />
      case 'followers':
        return <FollowersSheet kind={activeSheet.kind} onClose={closeSheet} />
      default:
        return null
    }
  })()

  return (
    <div className="stage">
      <aside className="stage-copy" aria-hidden="true">
        <span className="stage-kicker">TAPP · PROTOTIPO MÓVIL</span>
        <h1>
          tapp<em>.</em>
        </h1>
        <p>
          Inspiración, adaptación y compra en un solo recorrido. Probado para
          una pantalla de 390 px.
        </p>
        <div className="stage-steps">
          <span>01 · Inspírate</span>
          <span>02 · Adáptalo</span>
          <span>03 · Guárdalo</span>
        </div>
      </aside>

      <div className="phone">
        <div className="app">
          <div className="device-status" aria-hidden="true">
            <span className="status-time">9:41</span>
            <span className="dynamic-island">
              <i />
            </span>
            <span className="status-battery">
              <i />
            </span>
          </div>

          {!session ? (
            <div className="view">
              <Auth onComplete={completeAuth} />
            </div>
          ) : (
            <>
              <div className="view" key={screen}>
                {screen === 'feed' && (
                  <Feed
                    feedIndex={feedIndex}
                    setFeedIndex={setFeedIndex}
                    onOpenOutfit={openOutfit}
                    onOpenItem={openItem}
                    onOpenWishlist={openWishlist}
                    onShare={openShare}
                    onSearch={() => goTab('search')}
                    onCreator={openCreator}
                    onProfile={() => goTab('profile')}
                  />
                )}

                {screen === 'search' && (
                  <Search
                    onOpenOutfit={openOutfit}
                    onOpenItem={openItem}
                    onOpenCreator={openCreator}
                    onOpenBrand={openBrand}
                  />
                )}

                {screen === 'saved' && (
                  <Saved
                    onOpenOutfit={openOutfit}
                    onOpenItem={openItem}
                    onEditWishlist={openWishlist}
                    onExplore={() => goTab('search')}
                  />
                )}

                {screen === 'profile' && (
                  <Profile
                    onOpenOutfit={openOutfit}
                    onEditProfile={() => pushSheet({ type: 'edit-profile' })}
                    onOpenFollowers={(kind) => pushSheet({ type: 'followers', kind })}
                    onLogout={logout}
                  />
                )}

                {screen === 'publish' && (
                  <Publish
                    onBack={() => goTab('feed')}
                    onPublished={() => {
                      setFeedIndex(0)
                      goTab('feed')
                    }}
                  />
                )}

                {(screen === 'messages' || screen === 'chat') && (
                  <Messages
                    activeConversationId={screen === 'chat' ? activeConversationId : null}
                    onOpenConversation={(id) => {
                      setActiveConversationId(id)
                      setScreen('chat')
                    }}
                    onBack={() => {
                      if (screen === 'chat') {
                        setActiveConversationId(null)
                        setScreen('messages')
                      } else {
                        setScreen('feed')
                      }
                    }}
                    onOpenOutfit={openOutfit}
                  />
                )}
              </div>

              {['feed', 'search', 'saved', 'profile', 'messages'].includes(screen) && (
                <BottomNav
                  current={screen as 'feed' | 'search' | 'saved' | 'profile' | 'messages'}
                  onChange={goTab}
                  onCreate={() => {
                    closeAllSheets()
                    setScreen('publish')
                  }}
                />
              )}

              {sheetNode}
            </>
          )}

          {toast && <Toast key={toast.id} message={toast.message} />}
        </div>
      </div>

      <aside className="stage-side" aria-hidden="true">
        <span>Feed</span>
        <span>Presupuesto</span>
        <span>Wishlist</span>
        <span>Perfil</span>
      </aside>
    </div>
  )
}
