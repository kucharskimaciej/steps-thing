export const VIDEO_HASH_CHUNK_SIZE = 512 * 1024;

const samplingRatio = Math.E / Math.PI;

export function sampledChunkIndexes(fileSize: number): number[] {
  if (fileSize <= 0) {
    return [];
  }

  const totalChunks = Math.ceil(fileSize / VIDEO_HASH_CHUNK_SIZE);
  const samplingInterval = Math.max(
    Math.round(samplingRatio * Math.sqrt(totalChunks)),
    1,
  );
  const indexes: number[] = [];

  for (let chunkIndex = 0; chunkIndex < totalChunks; chunkIndex += 1) {
    if (chunkIndex % samplingInterval === 0) {
      indexes.push(chunkIndex);
    }
  }

  return indexes;
}

export async function hashVideoFile(file: File): Promise<string> {
  const chunks = await Promise.all(
    sampledChunkIndexes(file.size).map(async (chunkIndex) => {
      const start = chunkIndex * VIDEO_HASH_CHUNK_SIZE;
      const end = Math.min(start + VIDEO_HASH_CHUNK_SIZE, file.size);

      return new Uint8Array(await file.slice(start, end).arrayBuffer());
    }),
  );
  const sampledSize = chunks.reduce((sum, chunk) => sum + chunk.byteLength, 0);
  const sampledBytes = new Uint8Array(sampledSize);
  let offset = 0;

  for (const chunk of chunks) {
    sampledBytes.set(chunk, offset);
    offset += chunk.byteLength;
  }

  const digest = await crypto.subtle.digest("SHA-256", sampledBytes);

  return [...new Uint8Array(digest)]
    .map((byte) => byte.toString(16).padStart(2, "0"))
    .join("");
}
