// Example model schema from the Drizzle docs
// https://orm.drizzle.team/docs/sql-schema-declaration

import { sql } from "drizzle-orm";
import {
  boolean,
  index,
  int,
  mysqlTable,
  mysqlTableCreator,
  text,
  timestamp,
  varchar,
} from "drizzle-orm/mysql-core";

/**
 * This is an example of how to use the multi-project schema feature of Drizzle ORM. Use the same
 * database instance for multiple projects.
 *
 * @see https://orm.drizzle.team/docs/goodies#multi-project-schema
 */
export const createTable = mysqlTableCreator(
  (name) => `scy-next-project_${name}`
);

export const posts = createTable(
  "post",
  (d) => ({
    id: d.bigint({ mode: "number" }).primaryKey().autoincrement(),
    name: d.varchar({ length: 256 }),
    createdAt: d
      .timestamp()
      .default(sql`CURRENT_TIMESTAMP`)
      .notNull(),
    updatedAt: d.timestamp().onUpdateNow(),
  }),
  (t) => [index("name_idx").on(t.name)]
);

export const licenseKeys = mysqlTable("license_keys", {
  id: varchar("id", { length: 36 }).primaryKey(),
  key: varchar("key", { length: 32 }).notNull().unique(),
  type: varchar("type", { length: 20 }).notNull(), // 卡密类型：monthly, yearly, lifetime
  status: varchar("status", { length: 20 }).notNull().default("unused"), // unused, used, expired
  createdAt: timestamp("created_at").defaultNow(),
  usedAt: timestamp("used_at"),
  expiresAt: timestamp("expires_at"),
  usedBy: varchar("used_by", { length: 36 }), // 关联到客户端ID
  batchId: varchar("batch_id", { length: 36 }), // 批次ID，用于分组管理
  notes: text("notes"), // 备注信息
});

export const licenseBatches = mysqlTable("license_batches", {
  id: varchar("id", { length: 36 }).primaryKey(),
  name: varchar("name", { length: 100 }).notNull(),
  type: varchar("type", { length: 20 }).notNull(),
  count: int("count").notNull(),
  duration: int("duration").notNull(), // 有效期（天）
  createdAt: timestamp("created_at").defaultNow(),
  createdBy: varchar("created_by", { length: 36 }).notNull(),
  notes: text("notes"),
});
