import { Server, Socket } from "socket.io";
import { db } from "../db";
import { messages, chatMembers } from "../db/schema";
import { and, eq } from "drizzle-orm";

interface JoinChatPayload {
  chatId: string;
}

interface SendMessagePayload {
  chatId: string;
  content: string;
}

interface SocketUser {
  id: string;
  email: string;
}

export const registerChatEvents = (io: Server, socket: Socket) => {
  const user = socket.data.user as SocketUser;
  const userId = user.id;

  // JOIN CHAT
  socket.on("chat:join", async ({ chatId }: JoinChatPayload) => {
    if (!chatId) {
      socket.emit("chat:error", {
        code: "INVALID_CHAT_ID",
        message: "Chat ID required",
      });
      return;
    }

    try {
      const member = await db.query.chatMembers.findFirst({
        where: and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, userId)
        ),
      });

      if (!member) {
        socket.emit("chat:error", {
          code: "FORBIDDEN",
          message: "Not a member of this chat",
        });
        return;
      }

      socket.join(chatId);
      socket.emit("chat:joined", { chatId });
    } catch (err) {
      socket.emit("chat:error", {
        code: "SERVER_ERROR",
        message: "Failed to join chat",
      });
    }
  });

  // SEND MESSAGE
  socket.on(
    "message:send",
    async ({ chatId, content }: SendMessagePayload) => {
      if (!chatId || !content?.trim()) {
        socket.emit("chat:error", {
          code: "INVALID_MESSAGE",
          message: "Message content required",
        });
        return;
      }

      // 🔒 verify membership again (never trust socket memory)
      const member = await db.query.chatMembers.findFirst({
        where: and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, userId)
        ),
      });

      if (!member) {
        socket.emit("chat:error", {
          code: "FORBIDDEN",
          message: "Not allowed in this chat",
        });
        return;
      }

      try {
        const [msg] = await db
          .insert(messages)
          .values({
            chatId,
            senderId: userId,
            content,
          })
          .returning();

        io.to(chatId).emit("message:new", msg);
      } catch (err) {
        socket.emit("chat:error", {
          code: "SERVER_ERROR",
          message: "Failed to send message",
        });
      }
    }
  );

  socket.on("disconnect", () => {
    // optional cleanup / logging
  });
};
