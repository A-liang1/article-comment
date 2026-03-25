import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

/**
 * 应用入口
 */
async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // 启用 CORS，允许前端跨域访问
  app.enableCors({
    origin: 'http://localhost:5173', // Vite 默认端口
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
    credentials: true,
  });

  const port = 3000;
  await app.listen(port);

  console.log(`=================================`);
  console.log(`🚀 评论系统后端服务已启动`);
  console.log(`📡 监听端口: ${port}`);
  console.log(`🔗 API 地址: http://localhost:${port}/comments`);
  console.log(`=================================`);
}

bootstrap();
