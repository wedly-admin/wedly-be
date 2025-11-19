import { NestFactory } from "@nestjs/core";
import { AppModule } from "./app.module";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import * as swaggerUi from "swagger-ui-express";
import { buildOpenAPIDocument } from "./openapi/openapi";
import { TransformIdInterceptor } from "./common/interceptors/transform-id.interceptor";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.use(helmet());
  app.use(cookieParser());

  // Configure CORS for frontend
  app.enableCors({
    origin: process.env.CLIENT_ORIGIN || "http://localhost:3000",
    credentials: true,
  });

  // Apply global interceptor to transform 'id' to '_id'
  app.useGlobalInterceptors(new TransformIdInterceptor());

  const openapi = buildOpenAPIDocument();
  app.use("/docs", swaggerUi.serve, swaggerUi.setup(openapi));
  app.getHttpAdapter().get("/openapi.json", (req, res) => res.json(openapi));

  const port = process.env.PORT || 4000;
  await app.listen(port);
  console.log(`🚀 Wedly API running at http://localhost:${port}`);
  console.log(`📜 Swagger docs at http://localhost:${port}/docs`);
  console.log(`📄 OpenAPI spec at http://localhost:${port}/openapi.json`);
}
bootstrap();
