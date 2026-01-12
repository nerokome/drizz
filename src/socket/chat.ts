import { Server, Socket } from "socket.io";
import { db } from "../db";
import { messages, chatMembers } from "../db/schema";
import { and, eq } from "drizzle-orm";

interface JoinChatPayload { chatId: string; }
interface SendMessagePayload { chatId: string; content: string; }
interface SocketUser { id: string; email: string; }

export const registerChatEvents = (io: Server, socket: Socket) => {
  const user = socket.user as SocketUser;
  const userId = user.id;

  // Join chat room
  socket.on("chat:join", async ({ chatId }: JoinChatPayload) => {
    if (!chatId) {
      socket.emit("chat:error", { code: "INVALID_CHAT_ID", message: "Chat ID required" });
      return;
    }

    const member = await db.query.chatMembers.findFirst({
      where: and(eq(chatMembers.chatId, chatId), eq(chatMembers.userId, userId)),
    });

    if (!member) {
      socket.emit("chat:error", { code: "FORBIDDEN", message: "Not a member" });
      return;
    }

    socket.join(chatId);
    socket.joinedChats?.add(chatId);
    socket.emit("chat:joined", { chatId });
  });

  // Send message
  socket.on("message:send", async ({ chatId, content }: SendMessagePayload) => {
    if (!chatId || !content || content.trim().length === 0) {
      socket.emit("chat:error", { code: "INVALID_MESSAGE", message: "Message required" });
      return;
    }

    if (!socket.joinedChats?.has(chatId)) {
      socket.emit("chat:error", { code: "FORBIDDEN", message: "Not allowed in this chat" });
      return;
    }

    const [msg] = await db.insert(messages).values({ chatId, senderId: userId, content }).returning();

    io.to(chatId).emit("message:new", msg);
  });

  
  socket.on("disconnect", () => {

  });
};
