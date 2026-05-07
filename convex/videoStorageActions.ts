"use node";

import { createSign } from "node:crypto";
import { v } from "convex/values";
import { action } from "./_generated/server";
import { requireUserId } from "./auth";
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

    const bucket = requiredEnv("GCS_BUCKET_NAME");
    const clientEmail = requiredEnv("GCS_CLIENT_EMAIL");
    const privateKey = requiredEnv("GCS_PRIVATE_KEY").replace(/\\n/g, "\n");
    const storageKey = buildOwnerVideoStorageKey(ownerId, args.hash);
    const uploadUrl = createSignedPutUrl({
      bucket,
      clientEmail,
      privateKey,
      storageKey,
      contentType: args.contentType || "video/mp4",
      expires: Math.floor(Date.now() / 1000) + uploadTtlSeconds,
    });

    return { uploadUrl, storageKey };
  },
});

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}

function createSignedPutUrl({
  bucket,
  clientEmail,
  privateKey,
  storageKey,
  contentType,
  expires,
}: {
  bucket: string;
  clientEmail: string;
  privateKey: string;
  storageKey: string;
  contentType: string;
  expires: number;
}) {
  const host = "storage.googleapis.com";
  const resource = `/${bucket}/${storageKey}`;
  const escapedResource = resource
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const stringToSign = [
    "PUT",
    "",
    contentType,
    expires.toString(),
    resource,
  ].join("\n");
  const signer = createSign("RSA-SHA256");

  signer.update(stringToSign);
  signer.end();

  const signature = encodeURIComponent(signer.sign(privateKey, "base64"));

  return `https://${host}${escapedResource}?GoogleAccessId=${encodeURIComponent(
    clientEmail,
  )}&Expires=${expires}&Signature=${signature}`;
}
