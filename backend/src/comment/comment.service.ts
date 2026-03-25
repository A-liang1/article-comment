import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Comment } from './entities/comment.entity';
import { CreateCommentDto } from './dto/create-comment.dto';

/**
 * 评论服务层
 * 处理评论的 CRUD 操作和树形结构构建
 */
@Injectable()
export class CommentService {
  constructor(
    @InjectRepository(Comment)
    private commentRepository: Repository<Comment>,
  ) {}

  /**
   * 创建评论
   * @param createCommentDto 创建评论的数据
   * @returns 创建成功的评论
   */
  async create(createCommentDto: CreateCommentDto): Promise<Comment> {
    const { content, author, articleId, parentId } = createCommentDto;

    // 如果指定了父评论ID，验证父评论是否存在
    if (parentId !== null && parentId !== undefined) {
      const parentComment = await this.commentRepository.findOne({
        where: { id: parentId },
      });
      if (!parentComment) {
        throw new NotFoundException('父评论不存在');
      }
    }

    // 创建评论实体
    const comment = this.commentRepository.create({
      content,
      author,
      articleId,
      parentId: parentId || null,
    });

    return this.commentRepository.save(comment);
  }

  /**
   * 获取指定文章的所有评论，并构建为树形结构
   * @param articleId 文章ID
   * @returns 树形结构的评论数组
   */
  async findTreeByArticle(articleId: number): Promise<Comment[]> {
    // 查询该文章的所有评论
    const comments = await this.commentRepository.find({
      where: { articleId },
      order: { createdAt: 'ASC' },
    });

    // 构建树形结构
    return this.buildCommentTree(comments);
  }

  /**
   * 获取单条评论详情
   * @param id 评论ID
   * @returns 评论详情
   */
  async findOne(id: number): Promise<Comment> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    return comment;
  }

  /**
   * 删除评论（级联删除子评论由数据库外键处理）
   * @param id 评论ID
   */
  async remove(id: number): Promise<void> {
    const comment = await this.commentRepository.findOne({
      where: { id },
    });

    if (!comment) {
      throw new NotFoundException('评论不存在');
    }

    await this.commentRepository.remove(comment);
  }

  /**
   * 将扁平的评论数组构建为树形结构
   * 时间复杂度: O(n)
   * 空间复杂度: O(n)
   * 
   * @param comments 扁平的评论数组
   * @returns 树形结构的评论数组
   */
  private buildCommentTree(comments: Comment[]): Comment[] {
    // 创建节点映射表，用于快速查找
    const commentMap = new Map<number, Comment>();
    const roots: Comment[] = [];

    // 第一遍遍历：创建节点映射，并初始化 children 数组
    for (const comment of comments) {
      // 创建新对象，避免修改原始数据
      const commentNode = { ...comment, children: [] };
      commentMap.set(comment.id, commentNode);
    }

    // 第二遍遍历：建立父子关系
    for (const comment of comments) {
      const node = commentMap.get(comment.id)!;

      if (comment.parentId === null) {
        // 顶级评论，加入根节点数组
        roots.push(node);
      } else {
        // 子评论，找到父节点并添加到其 children 数组
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.children.push(node);
        }
      }
    }
    
    return roots;
  }
}
