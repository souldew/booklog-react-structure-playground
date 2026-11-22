import { createRoute } from "@hono/zod-openapi";

import { getDb } from "../../db/client.ts";
import { createApp } from "../lib/createApp.ts";
import { NotificationSettingsSchema, NotificationSettingsUpdateSchema } from "../schemas.ts";

// /settings/notifications は複数形だが、通知のコレクションではなく設定の区分 (docs/screens.md §2)。
// プロフィールと同じく id を持たない単一リソースで、行は必ずあるので 404 も無い。
const tags = ["notification-settings"];

const getNotificationSettings = createRoute({
  method: "get",
  path: "/settings/notifications",
  tags,
  operationId: "getNotificationSettings",
  responses: {
    200: {
      description: "通知の設定。通知の種類ごとに受け取るかどうか",
      content: { "application/json": { schema: NotificationSettingsSchema } },
    },
  },
});

const updateNotificationSettings = createRoute({
  method: "put",
  path: "/settings/notifications",
  tags,
  operationId: "updateNotificationSettings",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: NotificationSettingsUpdateSchema } },
    },
  },
  responses: {
    200: {
      description: "更新後の通知の設定",
      content: { "application/json": { schema: NotificationSettingsSchema } },
    },
  },
});

type NotificationSettingsRow = {
  reading_reminder: number;
  weekly_summary: number;
  note_digest: number;
};

// SQLite は真偽値を 0 / 1 で持つので、API の表現 (boolean) に直す。
function selectNotificationSettings() {
  const row = getDb()
    .prepare(
      "SELECT reading_reminder, weekly_summary, note_digest FROM notification_settings WHERE id = 1",
    )
    .get() as NotificationSettingsRow;

  return NotificationSettingsSchema.parse({
    reading_reminder: row.reading_reminder === 1,
    weekly_summary: row.weekly_summary === 1,
    note_digest: row.note_digest === 1,
  });
}

export const notificationSettings = createApp()
  .openapi(getNotificationSettings, (c) => {
    return c.json(selectNotificationSettings(), 200);
  })
  .openapi(updateNotificationSettings, (c) => {
    const { reading_reminder, weekly_summary, note_digest } = c.req.valid("json");
    getDb()
      .prepare(
        `UPDATE notification_settings
         SET reading_reminder = ?, weekly_summary = ?, note_digest = ?
         WHERE id = 1`,
      )
      .run(Number(reading_reminder), Number(weekly_summary), Number(note_digest));

    return c.json(selectNotificationSettings(), 200);
  });
