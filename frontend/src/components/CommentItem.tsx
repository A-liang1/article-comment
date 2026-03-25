import { useState } from 'react';
import { CommentItemProps } from '../types';
import { CommentForm } from './CommentForm';

/**
 * 单条评论组件
 * 递归渲染评论及其子评论
 */
export function CommentItem({
  comment,
  articleId,
  onReply,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true);

  /**
   * 格式化时间显示
   */
  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  /**
   * 回复成功回调
   */
  const handleReplySuccess = () => {
    setIsReplying(false);
    onReply(comment.id);
  };

  return (
    <div
      className="comment-item"
      style={{ marginLeft: depth > 0 ? '40px' : '0' }}
    >
      {/* 评论内容卡片 */}
      <div className="comment-card">
        <div className="comment-header">
          <span className="comment-author">{comment.author}</span>
          <span className="comment-time">{formatTime(comment.createdAt)}</span>
        </div>

        <div className="comment-content">{comment.content}</div>

        <div className="comment-actions">
          <button
            className="btn-reply"
            onClick={() => setIsReplying(!isReplying)}
          >
            {isReplying ? '取消回复' : '回复'}
          </button>
          <button
            className="btn-delete"
            onClick={() => onDelete(comment.id)}
          >
            删除
          </button>
          {comment.children.length > 0 && (
            <button
              className="btn-toggle"
              onClick={() => setIsExpanded(!isExpanded)}
            >
              {isExpanded
                ? '收起回复'
                : `展开回复(${comment.children.length})`}
            </button>
          )}
        </div>

        {/* 回复表单 - 点击回复后显示两个输入框 */}
        {isReplying && (
          <div className="reply-form-wrapper">
            <CommentForm
              articleId={articleId}
              parentId={comment.id}
              placeholder={`回复 ${comment.author}...`}
              onSuccess={handleReplySuccess}
              onCancel={() => setIsReplying(false)}
            />
          </div>
        )}
      </div>

      {/* 递归渲染子评论 */}
      {isExpanded && comment.children.length > 0 && (
        <div className="comment-children">
          {comment.children.map((child) => (
            <CommentItem
              key={child.id}
              comment={child}
              articleId={articleId}
              onReply={onReply}
              onDelete={onDelete}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
}
