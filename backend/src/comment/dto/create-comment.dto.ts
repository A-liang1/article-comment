import { IsString, IsNotEmpty, IsNumber, IsOptional } from 'class-validator';

/**
 * 创建评论 DTO
 */
export class CreateCommentDto {
  @IsString()
  @IsNotEmpty({ message: '评论内容不能为空' })
  content: string;

  @IsString()
  @IsNotEmpty({ message: '作者不能为空' })
  author: string;

  @IsNumber()
  articleId: number;

  @IsOptional()
  @IsNumber()
  parentId?: number | null;
}
