import { Injectable, InternalServerErrorException } from "@nestjs/common";
import * as crypto from "node:crypto";
import { UploadSignatureDto } from "./dto/upload-signature.dto";

@Injectable()
export class UploadsService {
  createSignature(): UploadSignatureDto {
    const cloudName = process.env.CLOUDINARY_CLOUD_NAME;
    const apiKey = process.env.CLOUDINARY_API_KEY;
    const apiSecret = process.env.CLOUDINARY_API_SECRET;

    if (!cloudName || !apiKey || !apiSecret) {
      throw new InternalServerErrorException("Cloudinary is not configured");
    }

    const folder = "padelhive/venues";
    const timestamp = Math.round(Date.now() / 1000);
    
    // alphabetical order: folder before timestamp
    const paramsToSign = `folder=${folder}&timestamp=${timestamp}`;
    const signature = crypto.createHash("sha1").update(paramsToSign + apiSecret).digest("hex");

    return {
      timestamp,
      signature,
      apiKey,
      cloudName,
      folder,
    };
  }
}
