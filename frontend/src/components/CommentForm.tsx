import { useState } from 'react';
import { CommentFormProps } from '../types';
import { api } from '../api';

/**
 * 评论表单组件
 * 用于发表顶级评论或回复评论
 */
export function CommentForm({
  articleId,
  parentId = null,
  placeholder = '写下你的评论...',
  onSuccess,
  onCancel,
}: CommentFormProps) {
  const [content, setContent] = useState('');
  const [author, setAuthor] = useState('');
  const [submitting, setSubmitting] = useState(false);

  /**
   * 处理表单提交
   */
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!author?.trim()) {
      alert('请填写昵称');
      return;
    }
    if (!content.trim()) {
      alert('请填写评论内容');
      return;
    }

    try {
      setSubmitting(true);
      await api.createComment({
        content: content.trim(),
        author: author.trim(),
        articleId,
        parentId,
      });

      // 重置表单
      setContent('');
      setAuthor('');

      // 触发成功回调
      onSuccess?.();
    } catch (err) {
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      {/* 作者输入 - 始终显示 */}
      <div className="form-group">
        <input
          type="text"
          placeholder="你的昵称"
          value={author}
          onChange={(e) => setAuthor(e.target.value)}
          disabled={submitting}
        />
      </div>

      <div className="form-group">
        <textarea
          placeholder={placeholder}
          value={content}
          onChange={(e) => setContent(e.target.value)}
          rows={3}
          disabled={submitting}
        />
      </div>

      <div className="form-actions">
        <button
          type="submit"
          disabled={submitting}
          className="btn-submit"
        >
          {submitting ? '提交中...' : parentId ? '回复' : '发表评论'}
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="btn-cancel"
          >
            取消
          </button>
        )}
      </div>
    </form>
  );
}
