import "server-only";

import { S3Client } from "@aws-sdk/client-s3";
import { PutObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";

/**
 * Cloudflare R2 client. R2 is S3-compatible — we use the AWS SDK with a
 * custom endpoint. Credentials come from .env.local (server-only).
 * Zero-egress fees make R2 the right call for slideshow media at scale.
 */

function client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;
  if (!accountId || !accessKeyId || !secretAccessKey) {
    throw new Error("R2 credentials missing in env");
  }
  return new S3Client({
    region: "auto",
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export function r2Bucket(): string {
  return process.env.R2_BUCKET ?? "clarra-media";
}

export function r2PublicUrl(key: string): string | null {
  const base = process.env.R2_PUBLIC_BASE_URL;
  if (!base) return null;
  return `${base.replace(/\/$/, "")}/${encodeURIComponent(key)}`;
}

/**
 * Generate a pre-signed PUT URL for a one-shot upload. Default TTL 5 min.
 * The client PUTs the file directly to this URL, bypassing our server.
 */
export async function createSignedUploadUrl({
  key,
  contentType,
  contentLength,
  expiresIn = 300,
}: {
  key: string;
  contentType: string;
  contentLength: number;
  expiresIn?: number;
}): Promise<string> {
  const cmd = new PutObjectCommand({
    Bucket: r2Bucket(),
    Key: key,
    ContentType: contentType,
    ContentLength: contentLength,
  });
  return await getSignedUrl(client(), cmd, { expiresIn });
}
