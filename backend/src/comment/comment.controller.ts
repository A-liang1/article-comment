import {
  Controller,
  Get,
  Post,
  Delete,
  Body,
  Param,
  Query,
  ParseIntPipe,
  ValidationPipe,
} from '@nestjs/common';
import { CommentService } from './comment.service';
import { CreateCommentDto } from './dto/create-comment.dto';
import { Comment } from './entities/comment.entity';

/**
 * 评论控制器
 * 处理评论相关的 HTTP 请求
 */
@Controller('comments')
export class CommentController {
  constructor(private readonly commentService: CommentService) {}

  /**
   * 创建评论
   * POST /comments
   */
  @Post()
  async create(
    @Body(new ValidationPipe()) createCommentDto: CreateCommentDto,
  ): Promise<Comment> {
    return this.commentService.create(createCommentDto);
  }

  /**
   * 获取指定文章的评论树
   * GET /comments?articleId=1
   */
  @Get()
  async findAll(
    @Query('articleId', ParseIntPipe) articleId: number,
  ): Promise<Comment[]> {
    return this.commentService.findTreeByArticle(articleId);
  }

  /**
   * 获取单条评论详情
   * GET /comments/:id
   */
  @Get(':id')
  async findOne(@Param('id', ParseIntPipe) id: number): Promise<Comment> {
    return this.commentService.findOne(id);
  }

  /**
   * 删除评论
   * DELETE /comments/:id
   */
  @Delete(':id')
  async remove(@Param('id', ParseIntPipe) id: number): Promise<{ message: string }> {
    await this.commentService.remove(id);
    return { message: '评论删除成功' };
  }
}
