import { useEffect, useRef, useState } from 'react'
import {
  ArrowLeft,
  BadgeCheck,
  MoreHorizontal,
  Send,
} from 'lucide-react'
import { useStore } from '../store'
import { formatPrice, outfitTotal } from '../utils'
import { Avatar } from '../components/ui'

interface MessagesProps {
  activeConversationId: string | null
  onOpenConversation: (id: string) => void
  onBack: () => void
  onOpenOutfit: (outfitId: string) => void
}

export function Messages({
  activeConversationId,
  onOpenConversation,
  onBack,
  onOpenOutfit,
}: MessagesProps) {
  const {
    state,
    creators,
    outfits,
    products,
    sendMessage,
    markRead,
  } = useStore()
  const [draft, setDraft] = useState('')
  const scrollRef = useRef<HTMLDivElement>(null)

  const active = state.conversations.find(
    (conversation) => conversation.id === activeConversationId,
  )
  const activeCreator = active
    ? creators.find((creator) => creator.id === active.creatorId)
    : undefined
  const activeId = active?.id
  const activeMessageCount = active?.messages.length ?? 0

  useEffect(() => {
    if (!activeId) return
    markRead(activeId)
    const timer = window.setTimeout(() => {
      const element = scrollRef.current
      if (element) element.scrollTop = element.scrollHeight
    }, 40)
    return () => window.clearTimeout(timer)
  }, [activeId, activeMessageCount, markRead])

  if (active && activeCreator) {
    const send = () => {
      if (!draft.trim()) return
      sendMessage(active.id, draft.trim())
      setDraft('')
      window.setTimeout(() => {
        const element = scrollRef.current
        if (element) element.scrollTop = element.scrollHeight
      }, 40)
    }

    return (
      <div className="screen screen--light chat-screen">
        <header className="chat-header">
          <button type="button" className="header-icon-button" onClick={onBack} aria-label="Volver">
            <ArrowLeft size={20} />
          </button>
          <div className="chat-person">
            <Avatar creator={activeCreator} size={36} />
            <span>
              <strong>
                {activeCreator.name}
                {activeCreator.verified && <BadgeCheck size={13} />}
              </strong>
              <em><i className="online-dot" /> en línea</em>
            </span>
          </div>
          <button type="button" className="header-icon-button" aria-label="Más opciones">
            <MoreHorizontal size={20} />
          </button>
        </header>

        <div className="chat-scroll" ref={scrollRef}>
          <div className="chat-date">Hoy</div>
          {active.messages.map((message) => {
            const outfit = message.outfitId
              ? outfits.find((item) => item.id === message.outfitId)
              : undefined
            return (
              <div
                className={`message-row ${message.from === 'me' ? 'is-mine' : ''}`}
                key={message.id}
              >
                {message.from === 'them' && <Avatar creator={activeCreator} size={26} />}
                <div className="message-bubble">
                  {message.text && <p>{message.text}</p>}
                  {outfit && (
                    <button
                      type="button"
                      className="message-outfit"
                      onClick={() => onOpenOutfit(outfit.id)}
                    >
                      <img src={outfit.image} alt={outfit.title} style={{ objectPosition: outfit.imagePos }} />
                      <span>
                        <em>Look compartido</em>
                        <strong>{outfit.title}</strong>
                        <small>{formatPrice(outfitTotal(outfit, products))}</small>
                      </span>
                      <span className="message-outfit-cta">Ver</span>
                    </button>
                  )}
                  <time>{message.time}</time>
                </div>
              </div>
            )
          })}
        </div>

        <footer className="chat-composer">
          <input
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === 'Enter') send()
            }}
            placeholder={`Mensaje para ${activeCreator.name.split(' ')[0]}…`}
            aria-label="Escribir mensaje"
          />
          <button type="button" onClick={send} aria-label="Enviar mensaje" disabled={!draft.trim()}>
            <Send size={18} />
          </button>
        </footer>
      </div>
    )
  }

  return (
    <div className="screen screen--light inbox-screen">
      <header className="inbox-header">
        <button type="button" className="header-icon-button" onClick={onBack} aria-label="Volver">
          <ArrowLeft size={20} />
        </button>
        <div>
          <span className="eyebrow">Compartir para decidir</span>
          <h1>Mensajes</h1>
        </div>
        <span className="inbox-spacer" />
      </header>

      <div className="inbox-note">
        <p>Envía looks y decide con alguien. Sin grupos, sin ruido.</p>
      </div>

      <div className="conversation-list">
        {state.conversations.map((conversation) => {
          const creator = creators.find((item) => item.id === conversation.creatorId)
          if (!creator) return null
          const last = conversation.messages[conversation.messages.length - 1]
          const outfit = last?.outfitId
            ? outfits.find((item) => item.id === last.outfitId)
            : undefined
          return (
            <button
              type="button"
              className="conversation-row"
              key={conversation.id}
              onClick={() => onOpenConversation(conversation.id)}
            >
              <span className="conversation-avatar">
                <Avatar creator={creator} size={50} />
                {conversation.unread > 0 && <span className="unread-dot" />}
              </span>
              <span className="conversation-copy">
                <span>
                  <strong>
                    {creator.name}
                    {creator.verified && <BadgeCheck size={13} />}
                  </strong>
                  <time>{last?.time ?? ''}</time>
                </span>
                <em>
                  {outfit
                    ? `Compartió un look · ${outfit.title}`
                    : last?.text ?? 'Empieza la conversación'}
                </em>
              </span>
              {outfit && (
                <img
                  className="conversation-thumb"
                  src={outfit.image}
                  alt=""
                  style={{ objectPosition: outfit.imagePos }}
                />
              )}
              {conversation.unread > 0 && (
                <span className="unread-count">{conversation.unread}</span>
              )}
            </button>
          )
        })}
      </div>

      <div className="inbox-footer">
        <p>Compartir un outfit por enlace también funciona sin chat.</p>
      </div>
    </div>
  )
}
