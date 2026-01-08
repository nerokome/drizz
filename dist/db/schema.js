"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.schema = exports.messages = exports.chatMembers = exports.chats = exports.users = void 0;
const pg_core_1 = require("drizzle-orm/pg-core");
exports.users = (0, pg_core_1.pgTable)("users", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    username: (0, pg_core_1.varchar)("username", { length: 255 }).notNull(),
    email: (0, pg_core_1.varchar)("email", { length: 255 }).notNull(),
    password: (0, pg_core_1.varchar)("password", { length: 255 }).notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.chats = (0, pg_core_1.pgTable)("chats", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    isGroup: (0, pg_core_1.boolean)("is_group").notNull().default(false),
    name: (0, pg_core_1.varchar)("name", { length: 255 }),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
});
exports.chatMembers = (0, pg_core_1.pgTable)("chat_members", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    userId: (0, pg_core_1.uuid)("user_id").notNull(),
    chatId: (0, pg_core_1.uuid)("chat_id").notNull(),
    joinedAt: (0, pg_core_1.timestamp)("joined_at").defaultNow(),
}, (table) => ({
    uniqueUserChat: (0, pg_core_1.unique)("user_chat_unique").on(table.userId, table.chatId),
}));
exports.messages = (0, pg_core_1.pgTable)("messages", {
    id: (0, pg_core_1.uuid)("id").defaultRandom().primaryKey(),
    chatId: (0, pg_core_1.uuid)("chat_id").notNull(),
    senderId: (0, pg_core_1.uuid)("sender_id").notNull(),
    content: (0, pg_core_1.text)("content").notNull(),
    createdAt: (0, pg_core_1.timestamp)("created_at").defaultNow(),
    editedAt: (0, pg_core_1.timestamp)("edited_at"),
}, (table) => ({
    chatCreatedIndex: (0, pg_core_1.index)("chat_created_idx").on(table.chatId, table.createdAt),
}));
exports.schema = {
    users: exports.users,
    chats: exports.chats,
    chatMembers: exports.chatMembers,
    messages: exports.messages,
};
