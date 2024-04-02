export interface UserData {
  uid: string
  login: string
  email: string
  createdAt: string
  lastLoginAt: string
  nickname?: string
  password?: string
  method: 'default' | 'google' | 'github'
}

export interface UserDataFull {
  user: UserData
  method: 'email' | 'google' | 'github'
  theme: 'dark' | 'light'
  avatar?: string
}

export interface Response {
  success: boolean
  data: any
}

export type MessageType = 'file' | 'media' | 'voice' | 'text'

export interface Message {
  senderId: string
  messageId: string
  type: MessageType
  reactions: Array<string>
  deletedFor: Array<string>
  createdAt: number
  isForwarded: boolean
  reply: string // message id
  content: any
}

export interface Chat {
  id: string
  creatorId: string
  opponentId: string
  messages: Message[]
  deletedFor: Array<string>
  bio?: string
  theme?: string
}
