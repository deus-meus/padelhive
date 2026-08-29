import { t, Static } from "elysia";

export const UploadSignatureSchema = t.Object({
  timestamp: t.Number(),
  signature: t.String(),
  apiKey: t.String(),
  cloudName: t.String(),
  folder: t.String(),
});

export type UploadSignatureResponse = Static<typeof UploadSignatureSchema>;
