// Empty file to ensure proper rewrite
import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set("trust proxy", 1);

  app.enableCors({
    origin: true,
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type", "Accept"],
    credentials: true,
  });

  app.setGlobalPrefix("api");
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

void bootstrap();
