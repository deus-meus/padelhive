import { Controller, Post } from "@nestjs/common";
import { ApiBearerAuth, ApiOperation, ApiTags } from "@nestjs/swagger";
import { UploadsService } from "./uploads.service";
import { UploadSignatureDto } from "./dto/upload-signature.dto";
import { Roles } from "../auth/decorators/roles.decorator";
import { UserRole } from "@prisma/client";

@ApiTags("Uploads")
@Controller("uploads")
export class UploadsController {
  constructor(private readonly uploadsService: UploadsService) {}

  @Post("signature")
  @Roles(UserRole.VENUE_OWNER, UserRole.VENUE_ADMIN, UserRole.SUPER_ADMIN)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Get Cloudinary upload signature" })
  createSignature(): UploadSignatureDto {
    return this.uploadsService.createSignature();
  }
}
