import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { CommentModule } from './comment/comment.module';
import { Comment } from './comment/entities/comment.entity';

/**
 * 应用根模块
 */
@Module({
  imports: [
    // 配置 TypeORM 和 SQLite
    TypeOrmModule.forRoot({
      type: 'sqlite',
      database: 'database.sqlite',
      entities: [Comment],
      synchronize: true, // 开发环境使用，自动同步数据库结构
    }),
    // 评论模块
    CommentModule,
  ],
})
export class AppModule {}
