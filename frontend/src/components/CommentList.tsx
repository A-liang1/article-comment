import { useState, useEffect, useCallback, forwardRef, useImperativeHandle } from 'react';
import { Comment, CommentListProps } from '../types';
import { api } from '../api';
import { CommentItem } from './CommentItem';

/**
 * 评论列表组件
 * 加载并展示指定文章的所有评论
 */
export const CommentList = forwardRef<{ refresh: () => void }, CommentListProps>(
  function CommentList({ articleId }, ref) {
    const [comments, setComments] = useState<Comment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    /**
     * 加载评论数据
     */
    const loadComments = useCallback(async () => {
      try {
        setLoading(true);
        const data = await api.getComments(articleId);
        console.log(data);
        setComments(data);
        setError(null);
      } catch (err) {
        setError('加载评论失败，请稍后重试');
      } finally {
        setLoading(false);
      }
    }, [articleId]);

    // 组件挂载时加载评论
    useEffect(() => {
      loadComments();
    }, [loadComments]);

    // 暴露刷新方法给父组件
    useImperativeHandle(ref, () => ({
      refresh: loadComments,
    }));

    /**
     * 处理删除评论
     */
    const handleDelete = async (id: number) => {
      if (!confirm('确定要删除这条评论吗？')) return;
      try {
        await api.deleteComment(id);
        await loadComments(); // 刷新列表
      } catch (err) {
        alert('删除失败');
      }
    };

    /**
     * 处理回复评论
     */
    const handleReply = () => {
      loadComments(); // 刷新列表
    };

    // 加载中状态
    if (loading) {
      return <div className="loading">加载中...</div>;
    }

    // 错误状态
    if (error) {
      return <div className="error">{error}</div>;
    }

    // 空列表状态
    if (comments.length === 0) {
      return (
        <div className="empty">暂无评论，来发表第一条评论吧！</div>
      );
    }

    return (
      <div className="comment-list">
        {comments.map((comment) => (
          <CommentItem
            key={comment.id}
            comment={comment}
            articleId={articleId}
            onReply={handleReply}
            onDelete={handleDelete}
            depth={0}
          />
        ))}
      </div>
    );
  }
);
