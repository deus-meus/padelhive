import { NestFactory } from "@nestjs/core";
import { NestExpressApplication } from "@nestjs/platform-express";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  app.set("trust proxy", 1);
  const allowedOrigins = [process.env.FRONTEND_ORIGIN, "http://localhost:3000", "http://127.0.0.1:3000"].filter(Boolean) as string[];

  app.enableCors({
    origin: allowedOrigins,
    methods: ["GET", "POST", "PATCH", "OPTIONS"],
    allowedHeaders: ["Authorization", "Content-Type"],
    credentials: true,
  });
  app.setGlobalPrefix("api");
  await app.listen(process.env.PORT ? Number(process.env.PORT) : 3001);
}

void bootstrap();
