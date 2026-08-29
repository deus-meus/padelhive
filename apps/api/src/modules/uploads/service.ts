import * as crypto from "node:crypto";
import { HttpException } from "../../common/errors";
import type { UploadSignatureResponse } from "./model";

export class UploadsService {
  createSignature(): UploadSignatureResponse {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new HttpException(500, "Cloudinary is not configured");
    }

    const folder = "padelhive/venues";
    const timestamp = Math.round(Date.now() / 1000);

    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto
      .createHash("sha1")
      .update(paramsToSign + apiSecret)
      .digest("hex");

    return {
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder,
    };
  }
}

export const uploadsService = new UploadsService();
