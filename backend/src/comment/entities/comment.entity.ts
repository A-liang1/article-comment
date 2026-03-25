import {
  Entity,
  PrimaryGeneratedColumn,
  Column,
  CreateDateColumn,
  UpdateDateColumn,
  ManyToOne,
  OneToMany,
  JoinColumn,
} from 'typeorm';

/**
 * 评论实体 - 支持无限层级嵌套
 * 使用自关联（Adjacency List）模式实现树形结构
 */
@Entity('comments')
export class Comment {
  @PrimaryGeneratedColumn()
  id: number;

  @Column({ type: 'text' })
  content: string;

  @Column()
  author: string;

  @Column({ name: 'article_id' })
  articleId: number;

  @Column({ name: 'parent_id', nullable: true })
  parentId: number | null;

  /**
   * 父评论 - 自关联多对一
   * onDelete: 'CASCADE' 表示删除父评论时级联删除所有子评论
   */
  @ManyToOne(() => Comment, (comment) => comment.children, {
    onDelete: 'CASCADE',
    nullable: true,
  })
  @JoinColumn({ name: 'parent_id' })
  parent: Comment | null;

  /**
   * 子评论列表 - 自关联一对多
   */
  @OneToMany(() => Comment, (comment) => comment.parent)
  children: Comment[];

  @CreateDateColumn({ name: 'created_at' })
  createdAt: Date;

  @UpdateDateColumn({ name: 'updated_at' })
  updatedAt: Date;
}
