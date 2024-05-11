export type MessageType = "file" | "media" | "voice" | "text";

export interface Message {
  senderId: string;
  messageId: string;
  type: MessageType;
  reactions: Array<string>;
  clearedFor: Array<string>;
  createdAt: number;
  isForwarded: boolean;
  reply: string; // message id
  content: any;
  status: "send" | "check";
}

export interface Chat {
  id: string;
  creatorId: string;
  opponentId: string;
  unread: number;
  messages: Message[];
  deletedFor: Array<string>;
  isPinned: boolean;
  bio?: string;
  theme?: string;
}