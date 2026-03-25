/**
 * 评论数据类型
 */
export interface Comment {
  id: number;
  content: string;
  author: string;
  articleId: number;
  parentId: number | null;
  createdAt: string;
  updatedAt: string;
  children: Comment[];
}

/**
 * 创建评论请求参数
 */
export interface CreateCommentRequest {
  content: string;
  author: string;
  articleId: number;
  parentId?: number | null;
}

/**
 * CommentItem 组件 Props
 */
export interface CommentItemProps {
  comment: Comment;
  articleId: number;
  onReply: (parentId: number) => void;
  onDelete: (id: number) => void;
  depth?: number;
}

/**
 * CommentForm 组件 Props
 */
export interface CommentFormProps {
  articleId: number;
  parentId?: number | null;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

/**
 * CommentList 组件 Props
 */
export interface CommentListProps {
  articleId: number;
}
