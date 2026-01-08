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

export const registerChatEvents = (io: any, socket: any) => {
  const userId: string = socket.user.id;
  socket.on(
    "chat:join",
    async ({ chatId }: JoinChatPayload) => {
      const member = await db.query.chatMembers.findFirst({
        where: and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, userId)
        ),
      });

      if (!member) return;

      socket.join(chatId);
    }
  );


  socket.on(
    "message:send",
    async ({ chatId, content }: SendMessagePayload) => {
      if (!content.trim()) return;

      const member = await db.query.chatMembers.findFirst({
        where: and(
          eq(chatMembers.chatId, chatId),
          eq(chatMembers.userId, userId)
        ),
      });

      if (!member) return;

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
};
