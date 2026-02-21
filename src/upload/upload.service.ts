import { Injectable, ServiceUnavailableException } from "@nestjs/common";
import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { randomBytes } from "crypto";
import { Readable } from "stream";

const BUCKET = process.env.CLOUDFLARE_R2_BUCKET_NAME;
const PUBLIC_URL = process.env.CLOUDFLARE_R2_PUBLIC_URL?.replace(/\/$/, ""); // base URL for public access
const ACCOUNT_ID = process.env.CLOUDFLARE_R2_ACCOUNT_ID;
const ACCESS_KEY_ID = process.env.CLOUDFLARE_R2_ACCESS_KEY_ID;
const SECRET_ACCESS_KEY = process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY;

function getS3Client(): S3Client | null {
  if (!ACCOUNT_ID || !ACCESS_KEY_ID || !SECRET_ACCESS_KEY || !BUCKET)
    return null;
  return new S3Client({
    region: "auto",
    endpoint: `https://${ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: ACCESS_KEY_ID,
      secretAccessKey: SECRET_ACCESS_KEY,
    },
  });
}

function getExtension(mimetype: string): string {
  const map: Record<string, string> = {
    "image/jpeg": "jpg",
    "image/png": "png",
    "image/gif": "gif",
    "image/webp": "webp",
  };
  return map[mimetype] ?? "jpg";
}

@Injectable()
export class UploadService {
  private client: S3Client | null = getS3Client();

  /** Upload a file to Cloudflare R2 and return the public URL. Throws if R2 is not configured. */
  async uploadFile(
    buffer: Buffer,
    mimetype: string,
    userId: string
  ): Promise<{ url: string }> {
    if (!this.client || !BUCKET) {
      throw new ServiceUnavailableException(
        "Image upload is not configured. Set CLOUDFLARE_R2_* environment variables."
      );
    }
    if (!PUBLIC_URL) {
      throw new ServiceUnavailableException(
        "CLOUDFLARE_R2_PUBLIC_URL is required for image upload."
      );
    }
    const ext = getExtension(mimetype);
    const key = `microsite/${userId}/${Date.now()}-${randomBytes(8).toString(
      "hex"
    )}.${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      })
    );

    const url = `${PUBLIC_URL}/${key}`;
    return { url };
  }

  /** Upload a guest photo (QR flow) to R2. Key prefix: guest-photos/:userId/ */
  async uploadGuestPhoto(
    buffer: Buffer,
    mimetype: string,
    userId: string
  ): Promise<{ url: string }> {
    if (!this.client || !BUCKET) {
      throw new ServiceUnavailableException(
        "Image upload is not configured. Set CLOUDFLARE_R2_* environment variables."
      );
    }
    if (!PUBLIC_URL) {
      throw new ServiceUnavailableException(
        "CLOUDFLARE_R2_PUBLIC_URL is required for image upload."
      );
    }
    const ext = getExtension(mimetype);
    const key = `guest-photos/${userId}/${Date.now()}-${randomBytes(8).toString(
      "hex"
    )}.${ext}`;

    await this.client.send(
      new PutObjectCommand({
        Bucket: BUCKET,
        Key: key,
        Body: buffer,
        ContentType: mimetype,
      })
    );

    const url = `${PUBLIC_URL}/${key}`;
    return { url };
  }

  /** Get object from R2 as a Node Readable stream (e.g. for download). */
  async getObjectStream(key: string): Promise<{
    body: Readable;
    contentType?: string;
  }> {
    if (!this.client || !BUCKET) {
      throw new ServiceUnavailableException(
        "Image download is not configured. Set CLOUDFLARE_R2_* environment variables."
      );
    }
    const response = await this.client.send(
      new GetObjectCommand({ Bucket: BUCKET, Key: key })
    );
    const body = response.Body;
    if (!body) {
      throw new ServiceUnavailableException("Empty response from storage.");
    }
    const nodeStream =
      "transformToWebStream" in body
        ? Readable.fromWeb((body as any).transformToWebStream())
        : (body as Readable);
    return {
      body: nodeStream,
      contentType: response.ContentType ?? "application/octet-stream",
    };
  }
}
