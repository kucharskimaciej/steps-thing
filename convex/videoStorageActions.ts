"use node";

import { v } from "convex/values";
import { action } from "./_generated/server";
import { requireUserId } from "./auth";
import { createSignedGcsUrl, getGcsConfigFromEnv } from "../lib/video/gcs";
import { buildOwnerVideoStorageKey } from "../lib/video/storage-key";

const uploadTtlSeconds = 15 * 60;

export const createUploadUrl = action({
  args: {
    hash: v.string(),
    contentType: v.string(),
  },
  handler: async (ctx, args) => {
    const ownerId = await requireUserId(ctx);

    if (!args.hash) {
      throw new Error("Video hash is required");
    }

    if (args.contentType && !args.contentType.startsWith("video/")) {
      throw new Error("Video upload content type must be video/*");
    }

    const config = getGcsConfigFromEnv();
    const storageKey = buildOwnerVideoStorageKey(ownerId, args.hash);
    const uploadUrl = createSignedGcsUrl({
      ...config,
      storageKey,
      method: "PUT",
      contentType: args.contentType || "video/mp4",
      expires: Math.floor(Date.now() / 1000) + uploadTtlSeconds,
    });

    return { uploadUrl, storageKey };
  },
});
