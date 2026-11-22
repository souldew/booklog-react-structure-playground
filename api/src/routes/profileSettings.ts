import { createRoute } from "@hono/zod-openapi";

import { getDb } from "../../db/client.ts";
import { createApp } from "../lib/createApp.ts";
import { ProfileSettingsSchema, ProfileSettingsUpdateSchema } from "../schemas.ts";

// ユーザーは 1 人だけなので、プロフィールはパスに id を持たない単一リソース (docs/backend.md §3)。
// 行は id = 1 に固定されていて必ずあるので 404 も無い。
const tags = ["profile-settings"];

const getProfileSettings = createRoute({
  method: "get",
  path: "/settings/profile",
  tags,
  operationId: "getProfileSettings",
  responses: {
    200: {
      description: "プロフィール",
      content: { "application/json": { schema: ProfileSettingsSchema } },
    },
  },
});

const updateProfileSettings = createRoute({
  method: "put",
  path: "/settings/profile",
  tags,
  operationId: "updateProfileSettings",
  request: {
    body: {
      required: true,
      content: { "application/json": { schema: ProfileSettingsUpdateSchema } },
    },
  },
  responses: {
    200: {
      description: "更新後のプロフィール",
      content: { "application/json": { schema: ProfileSettingsSchema } },
    },
  },
});

function selectProfileSettings() {
  return getDb().prepare("SELECT display_name, bio FROM profile_settings WHERE id = 1").get();
}

export const profileSettings = createApp()
  .openapi(getProfileSettings, (c) => {
    return c.json(ProfileSettingsSchema.parse(selectProfileSettings()), 200);
  })
  .openapi(updateProfileSettings, (c) => {
    const { display_name, bio } = c.req.valid("json");
    getDb()
      .prepare("UPDATE profile_settings SET display_name = ?, bio = ? WHERE id = 1")
      .run(display_name, bio);

    return c.json(ProfileSettingsSchema.parse(selectProfileSettings()), 200);
  });
