import cuid from "cuid";
import { relations, sql } from "drizzle-orm";
import { index, pgEnum, pgTableCreator, primaryKey } from "drizzle-orm/pg-core";
import { type AdapterAccount } from "next-auth/adapters";

import type { FlashcardAiResult } from "~/types/flashcards.types";
import type { QuizAiResult } from "~/types/quiz.types";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = pgTableCreator((name) => `lezano_${name}`);

// -------------------------------------------- //
//            USER RELATED TABLES               //
// -------------------------------------------- //
// 👇 Add your user-related tables here (auth/session/user...)

export const users = createTable("user", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID()),
  name: d.varchar({ length: 255 }),
  email: d.varchar({ length: 255 }),
  emailVerified: d
    .timestamp({
      mode: "date",
      withTimezone: true,
    })
    .default(sql`CURRENT_TIMESTAMP`),
  image: d.varchar({ length: 255 }),
}));

export const usersRelations = relations(users, ({ many }) => ({
  accounts: many(accounts),
}));

export const accounts = createTable(
  "account",
  (d) => ({
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    type: d.varchar({ length: 255 }).$type<AdapterAccount["type"]>().notNull(),
    provider: d.varchar({ length: 255 }).notNull(),
    providerAccountId: d.varchar({ length: 255 }).notNull(),
    refresh_token: d.text(),
    access_token: d.text(),
    expires_at: d.integer(),
    refresh_token_expires_in: d.text(),
    token_type: d.varchar({ length: 255 }),
    scope: d.varchar({ length: 255 }),
    id_token: d.text(),
    session_state: d.varchar({ length: 255 }),
  }),
  (t) => [
    primaryKey({ columns: [t.provider, t.providerAccountId] }),
    index("account_user_id_idx").on(t.userId),
  ],
);

export const accountsRelations = relations(accounts, ({ one }) => ({
  user: one(users, { fields: [accounts.userId], references: [users.id] }),
}));

export const sessions = createTable(
  "session",
  (d) => ({
    sessionToken: d.varchar({ length: 255 }).notNull().primaryKey(),
    userId: d
      .varchar({ length: 255 })
      .notNull()
      .references(() => users.id),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [index("t_user_id_idx").on(t.userId)],
);

export const sessionsRelations = relations(sessions, ({ one }) => ({
  user: one(users, { fields: [sessions.userId], references: [users.id] }),
}));

export const verificationTokens = createTable(
  "verification_token",
  (d) => ({
    identifier: d.varchar({ length: 255 }).notNull(),
    token: d.varchar({ length: 255 }).notNull(),
    expires: d.timestamp({ mode: "date", withTimezone: true }).notNull(),
  }),
  (t) => [primaryKey({ columns: [t.identifier, t.token] })],
);

// -------------------------------------------- //
// 👇 Status, Enum, ...
const aiDataStatus = ["created", "pending", "complete", "failed"] as const;
export type AiDataStatus = (typeof aiDataStatus)[number];
export const aiDataStatusEnum = pgEnum("ai_data_status_enum", aiDataStatus);

// -------------------------------------------- //
//                  FLASHCARDS                  //
// -------------------------------------------- //
// 👇 Add your flashcards-related tables here

export const flashcardsModel = createTable("flashcards", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  status: aiDataStatusEnum().default("created"),
  userId: d.varchar({ length: 255 }),
  phrase: d.varchar({ length: 255 }).notNull(),
  data: d.json().$type<FlashcardAiResult>(),
  createdAt: d
    .timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}));

export const flashcardsRelations = relations(flashcardsModel, ({ one }) => ({
  user: one(users, {
    fields: [flashcardsModel.userId],
    references: [users.id],
  }),
}));

// -------------------------------------------- //
//                     QUIZ                     //
// -------------------------------------------- //
export const quizModel = createTable("quiz", (d) => ({
  id: d
    .varchar({ length: 255 })
    .notNull()
    .primaryKey()
    .$defaultFn(() => cuid()),
  userId: d.varchar({ length: 255 }),
  phrase: d.varchar({ length: 255 }).notNull(),
  status: aiDataStatusEnum().default("created"),
  data: d.json().$type<QuizAiResult>(),
  createdAt: d
    .timestamp({ mode: "date", withTimezone: true })
    .notNull()
    .default(sql`CURRENT_TIMESTAMP`),
}));

export const quizRelations = relations(quizModel, ({ one }) => ({
  user: one(users, { fields: [quizModel.userId], references: [users.id] }),
}));
