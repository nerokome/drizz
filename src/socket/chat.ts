import { db } from "../db";
import { messages, chatMembers } from "../db/schema";
import { and, eq } from "drizzle-orm";
import { Server, Socket } from "socket.io";

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
  const user = (socket as any).user as SocketUser;
  const userId = user.id;

  // Join chat room
  socket.on("chat:join", async ({ chatId }: JoinChatPayload) => {
    if (!chatId) {
      socket.emit("error", {
        code: "INVALID_CHAT_ID",
        message: "Chat ID is required",
      });
      return;
    }

    const member = await db.query.chatMembers.findFirst({
      where: and(
        eq(chatMembers.chatId, chatId),
        eq(chatMembers.userId, userId)
      ),
    });

    if (!member) {
      socket.emit("error", {
        code: "FORBIDDEN",
        message: "You are not a member of this chat",
      });
      return;
    }

    socket.join(chatId);
  });

  // Send message
  socket.on(
    "message:send",
    async ({ chatId, content }: SendMessagePayload) => {
      if (!chatId || !content || content.trim().length === 0) {
        socket.emit("error", {
          code: "INVALID_MESSAGE",
          message: "Message content is invalid",
        });
        return;
      }

      if (content.length > 2000) {
        socket.emit("error", {
          code: "MESSAGE_TOO_LONG",
          message: "Message exceeds allowed length",
        });
        return;
      }

      const member = await db.query.chatMembers.findFirst({
        where: and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, userId)
        ),
      });

      if (!member) {
        socket.emit("error", {
          code: "FORBIDDEN",
          message: "You are not allowed to send messages here",
        });
        return;
      }

      const [msg] = await db
        .insert(messages)
        .values({
          chatId,
          senderId: userId,
          content,
        })
        .returning();

      io.to(chatId).emit("message:new", msg);
    }
  );

  socket.on("disconnect", () => {
    // placeholder for presence / cleanup later
  });
};
