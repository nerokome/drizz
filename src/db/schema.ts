import {
  pgTable,
  uuid,
  varchar,
  boolean,
  timestamp,
  text,
  index,
  unique,
} from "drizzle-orm/pg-core";


export const users = pgTable("users", {
  id: uuid("id").defaultRandom().primaryKey(),
  username: varchar("username", { length: 255 }).notNull(),
  email: varchar("email", { length: 255 }).notNull(),
  password: varchar("password", { length: 255 }).notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});


export const chats = pgTable("chats", {
  id: uuid("id").defaultRandom().primaryKey(),
  isGroup: boolean("is_group").notNull().default(false),

 
  name: varchar("name", { length: 255 }),

  
  lastMessageAt: timestamp("last_message_at"),
  lastMessagePreview: varchar("last_message_preview", { length: 255 }),

  createdAt: timestamp("created_at").defaultNow(),
});


export const chatMembers = pgTable(
  "chat_members",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    userId: uuid("user_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    chatId: uuid("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),

    joinedAt: timestamp("joined_at").defaultNow(),

    // simple read tracking (enough for now)
    lastReadAt: timestamp("last_read_at"),
  },
  (table) => ({
    uniqueUserChat: unique("user_chat_unique").on(
      table.userId,
      table.chatId
    ),
  })
);


export const messages = pgTable(
  "messages",
  {
    id: uuid("id").defaultRandom().primaryKey(),

    chatId: uuid("chat_id")
      .notNull()
      .references(() => chats.id, { onDelete: "cascade" }),

    senderId: uuid("sender_id")
      .notNull()
      .references(() => users.id, { onDelete: "cascade" }),

    content: text("content").notNull(),

    createdAt: timestamp("created_at").defaultNow(),
    editedAt: timestamp("edited_at"),
  },
  (table) => ({
    chatCreatedIndex: index("chat_created_idx").on(
      table.chatId,
      table.createdAt
    ),
  })
);


export const schema = {
  users,
  chats,
  chatMembers,
  messages,
};
