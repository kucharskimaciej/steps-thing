import { describe, expect, it, vi } from "vitest";
import { createUploadUrl } from "@/convex/videoStorageActions";
import { createSignedGcsUrl, getGcsConfigFromEnv } from "@/lib/video/gcs";

vi.mock("@/lib/video/gcs", () => ({
  createSignedGcsUrl: vi.fn(() => "https://storage.test/upload"),
  getGcsConfigFromEnv: vi.fn(() => ({
    bucket: "bucket",
    clientEmail: "client@example.com",
    privateKey: "private-key",
  })),
}));

type ConvexAction = {
  _handler: (ctx: unknown, args: unknown) => Promise<unknown>;
};

function runAction(
  fn: unknown,
  ctx: unknown,
  args: Record<string, unknown> = {},
) {
  return (fn as ConvexAction)._handler(ctx, args);
}

function authCtx(ownerId: string) {
  return {
    auth: {
      getUserIdentity: async () => ({
        subject: ownerId,
        tokenIdentifier: `issuer|${ownerId}`,
        issuer: "issuer",
      }),
    },
  };
}

describe("video storage actions", () => {
  it("requires auth before issuing signed upload urls", async () => {
    await expect(
      runAction(
        createUploadUrl,
        { auth: { getUserIdentity: async () => null } },
        { hash: "hash-a", contentType: "video/mp4" },
      ),
    ).rejects.toThrow("Authentication required");
    expect(createSignedGcsUrl).not.toHaveBeenCalled();
  });

  it("issues short-lived PUT urls for owner-scoped object keys", async () => {
    vi.spyOn(Date, "now").mockReturnValue(1_700_000_000_000);

    await expect(
      runAction(createUploadUrl, authCtx("user/a"), {
        hash: "hash/a",
        contentType: "video/mp4",
      }),
    ).resolves.toEqual({
      uploadUrl: "https://storage.test/upload",
      storageKey: "videos/user%2Fa/hash%2Fa",
    });
    expect(getGcsConfigFromEnv).toHaveBeenCalledOnce();
    expect(createSignedGcsUrl).toHaveBeenCalledWith(
      expect.objectContaining({
        method: "PUT",
        storageKey: "videos/user%2Fa/hash%2Fa",
        contentType: "video/mp4",
        expires: 1_700_000_900,
      }),
    );
  });

  it("rejects non-video upload content types", async () => {
    await expect(
      runAction(createUploadUrl, authCtx("user-a"), {
        hash: "hash-a",
        contentType: "text/plain",
      }),
    ).rejects.toThrow("Video upload content type must be video/*");
  });
});
