import { Fragment, useContext, useEffect, useRef, useState } from 'react'
import cl from './chat-frame.module.scss'
import { useUnit } from 'effector-react'
import { Button, DropdownMenu, TextArea, TextDivider } from '@/shared/UI'
import SendImg from '@/assets/icons/chat/send.svg?react'
import AttachImg from '@/assets/icons/chat/attach.svg?react'
import ImageImg from '@/assets/icons/chat/image.svg?react'
import FileImg from '@/assets/icons/chat/file.svg?react'
import clsx from 'clsx'
import { $popup, $selectedChat, attachChanged } from '@/widgets/chat/model/chat-frame'
import { $opponent } from '@/widgets/chat/model/chat'
import { SocketContext } from '@/app/providers/socket-provider'
import { formattedDate, getCookie, groupMessagesByDay } from '@/shared/utils'
import { ChatDeletePopup } from '@/widgets/chat/UI/chat-frame/chat-delete-popup/chat-delete-popup'
import { ChatClearPopup } from '@/widgets/chat/UI/chat-frame/chat-clear-poup/chat-clear-popup'
import { ChatMediaPopup } from '@/widgets/chat/UI/chat-frame/chat-media-popup/chat-media-popup'
import { ChatFrameHeader } from '@/widgets/chat/UI/chat-frame/chat-frame-header/chat-frame-header'
import { Popup } from '@/shared/UI/popup/popup'
import { useClickAway } from '@/shared/hooks/useClickAway'
import { useWindowWidth } from '@/shared/hooks/useWindowWidth'
import { DropdownMenuItem } from '@/shared/UI/dropdown-menu/dropdown-menu.props'
import { ChatMessage } from '@/entities'

const initialAttachItems: DropdownMenuItem[] = [
  {
    id: 1,
    content: 'Фото или видео',
    onClick: () => attachChanged('media'),
    icon: ImageImg,
  },
  {
    id: 2,
    content: 'Файл',
    onClick: () => attachChanged('file'),
    icon: FileImg,
  },
]

const ChatFrame = ({ onlineUsers }: { onlineUsers: string[] }) => {
  const popup = useUnit($popup)
  const opponent = useUnit($opponent)
  const selectedChat = useUnit($selectedChat)
  // attach
  // const attach = useUnit($attach)
  const attachRef = useRef<HTMLDivElement | null>(null)
  const [isAttachPopup, setIsAttachPopup] = useState(false)
  const socket = useContext(SocketContext)
  // message
  const messagesCnt = useRef<HTMLDivElement | null>(null)
  const groupedMessages = groupMessagesByDay(selectedChat?.messages || [])
  const [message, setMessage] = useState('')
  const [prevMessage, setPrevMessage] = useState(message)
  const [textAreaHeight, setTextAreaHeight] = useState(50)
  const width = useWindowWidth()

  const handleSendMessage = async () => {
    if (!message.trim().length) return
    setMessage('')
    setTextAreaHeight(50)

    socket?.emit('create-message', {
      token: getCookie('token'),
      chatId: selectedChat?.id,
      message: message,
    })
  }

  const handleKeyDown = async (event: any) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault()
      await handleSendMessage()
    } else if (event.key === 'Enter' && event.shiftKey) {
      setTextAreaHeight(textAreaHeight + 14)
    }
  }

  useEffect(() => {
    if (!message) setTextAreaHeight(50)
    if (message.length > 145) setTextAreaHeight(textAreaHeight + 14 * (message.length / 70))
    if (prevMessage.length > message.length) {
      prevMessage.split(message)[1] === '\n' ? setTextAreaHeight(textAreaHeight - 14) : ''
      setPrevMessage(message)
    }
  }, [message])

  useEffect(() => {
    const chatBody = messagesCnt.current

    if (chatBody) {
      chatBody.scrollTop = chatBody.scrollHeight
    }
  }, [selectedChat])

  useClickAway(attachRef, () => setIsAttachPopup(false))

  return (
    <div className={cl.chatFrame}>
      {opponent ? (
        <>
          {popup === 'delete' && <ChatDeletePopup />}
          {popup === 'clear' && <ChatClearPopup />}
          {popup === 'media' && <ChatMediaPopup />}
          <ChatFrameHeader onlineUsers={onlineUsers} />
          <div className={clsx(cl.chatFrameBody, 'scroll')} ref={messagesCnt}>
            {groupedMessages.map((group, i) => (
              <Fragment key={i}>
                <TextDivider text={formattedDate(group.day)} />
                <div className={cl.chatFrameBodyMessages}>
                  {group?.messages.map((msg) => <ChatMessage message={msg} key={msg.messageId} />)}
                </div>
              </Fragment>
            ))}
          </div>
          <div className={cl.chatFrameControl}>
            <Button onClick={() => setIsAttachPopup((prev) => !prev)}>
              <AttachImg />
            </Button>
            <TextArea
              extraClass={cl.chatFrameControlInput}
              placeholder={width <= 500 ? 'Написать...' : 'Написать сообщение...'}
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              style={{ height: `${textAreaHeight}px`, maxHeight: '100px' }}
              onKeyDown={handleKeyDown}
            />
            {message && (
              <Button onClick={handleSendMessage}>
                <SendImg />
              </Button>
            )}
            {isAttachPopup && (
              <Popup
                onClick={() => setIsAttachPopup(false)}
                ref={attachRef}
                extraClass={cl.chatFrameAttachPopup}
              >
                <DropdownMenu items={initialAttachItems} />
              </Popup>
            )}
          </div>
        </>
      ) : (
        <div className={cl.chatFrameSelect}>
          <div>
            <SendImg />
          </div>
          <p>Выберите, кому хотите написать</p>
        </div>
      )}
    </div>
  )
}

export { ChatFrame }
