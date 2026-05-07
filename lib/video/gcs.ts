import { createSign } from "node:crypto";

type SignedUrlMethod = "GET" | "PUT";

export type GcsConfig = {
  bucket: string;
  clientEmail: string;
  privateKey: string;
};

export function getGcsConfigFromEnv(): GcsConfig {
  return {
    bucket: requiredEnv("GCS_BUCKET_NAME"),
    clientEmail: requiredEnv("GCS_CLIENT_EMAIL"),
    privateKey: requiredEnv("GCS_PRIVATE_KEY").replace(/\\n/g, "\n"),
  };
}

export function createSignedGcsUrl({
  bucket,
  clientEmail,
  privateKey,
  storageKey,
  method,
  expires,
  contentType = "",
}: GcsConfig & {
  storageKey: string;
  method: SignedUrlMethod;
  expires: number;
  contentType?: string;
}) {
  const host = "storage.googleapis.com";
  const resource = `/${bucket}/${storageKey}`;
  const escapedResource = resource
    .split("/")
    .map((part) => encodeURIComponent(part))
    .join("/");
  const stringToSign = [
    method,
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

export async function downloadGcsObject({
  config,
  storageKey,
  expires = Math.floor(Date.now() / 1000) + 15 * 60,
}: {
  config: GcsConfig;
  storageKey: string;
  expires?: number;
}): Promise<Buffer> {
  const response = await fetch(
    createSignedGcsUrl({
      ...config,
      storageKey,
      method: "GET",
      expires,
    }),
  );

  if (!response.ok) {
    throw new Error(
      `Failed to download GCS object ${storageKey}: ${response.status}`,
    );
  }

  return Buffer.from(await response.arrayBuffer());
}

export async function uploadGcsObject({
  config,
  storageKey,
  contentType,
  body,
  expires = Math.floor(Date.now() / 1000) + 15 * 60,
}: {
  config: GcsConfig;
  storageKey: string;
  contentType: string;
  body: Buffer;
  expires?: number;
}): Promise<void> {
  const response = await fetch(
    createSignedGcsUrl({
      ...config,
      storageKey,
      method: "PUT",
      expires,
      contentType,
    }),
    {
      method: "PUT",
      headers: { "content-type": contentType },
      body: new Blob([new Uint8Array(body)], { type: contentType }),
    },
  );

  if (!response.ok) {
    throw new Error(
      `Failed to upload GCS object ${storageKey}: ${response.status}`,
    );
  }
}

function requiredEnv(name: string): string {
  const value = process.env[name];

  if (!value) {
    throw new Error(`${name} is required`);
  }

  return value;
}
