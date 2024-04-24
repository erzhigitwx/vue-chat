import { Server, Socket } from "socket.io";
import { socketMiddlewareRouting } from "../middleware/socket-middleware-routing";
import socketMiddleware from "../middleware/middleware";
import { UserData } from "../../types/user";
import { userSocketRoomPrefix } from "../../constants";
import { chatsController } from "../../controllers/chats.controller";
import { findRefById } from "../../models/firebase";
import { chatsCollection } from "../../config";
import { addDoc, collection } from "firebase/firestore";
import { getChatById, uuid } from "../../utils";
import { Message } from "../../types/chat";

interface ChatMemberBody {
  userData: UserData;
  chatId: string;
}

function messageController(io: Server, socket: Socket) {
  socket.use(
    socketMiddlewareRouting(socketMiddleware.verifyToken, [
      "create-message",
      "create-call",
    ]),
  );

  socket.use(
    socketMiddlewareRouting(socketMiddleware.verifyChatMember, [
      "create-message",
      "create-call",
    ]),
  );

  //   socket.use(middleware.validateMessage) it had better pass a message validate

  socket.on(
    "create-message",
    async (body: ChatMemberBody & { message: string }) => {
      const { userData, chatId, message } = body;

      const chatRef = await findRefById(chatsCollection, "id", chatId);
      const messagesCollection = collection(chatRef.ref, "messages");
      const messageFormatted = {
        senderId: userData.uid,
        createdAt: Date.now(),
        messageId: uuid(),
        type: "text",
        content: message,
      };
      const newMessage = await addDoc(
        messagesCollection,
        messageFormatted as Message,
      );
      const chatRow = await getChatById(chatId);

      if (!chatRow) return;

      if (newMessage) {
        io.to(userSocketRoomPrefix + chatRow.creatorId).emit(
          "incoming-message",
          {
            chatId: chatId,
            message: messageFormatted,
          },
        );
        io.to(userSocketRoomPrefix + chatRow.opponentId).emit(
          "incoming-message",
          {
            chatId: chatId,
            message: messageFormatted,
          },
        );
      } else {
        return;
      }
    },
  );
}

export default messageController;
