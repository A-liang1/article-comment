import { useRef } from 'react';
import { CommentList } from './components/CommentList';
import { CommentForm } from './components/CommentForm';
import './App.css';

/**
 * 应用根组件
 */
function App() {
  const articleId = 1; // 当前文章ID
  const commentListRef = useRef<{ refresh: () => void }>(null);

  /**
   * 处理评论发表成功
   */
  const handleCommentSuccess = () => {
    // 刷新评论列表
    commentListRef.current?.refresh();
  };

  return (
    <div className="app">
      <header className="app-header">
        <h1>文章标题：如何学好前端</h1>
      </header>

      <main className="app-main">
        {/* 发表评论区域 */}
        <section className="comment-section">
          <h2>发表评论</h2>
          <CommentForm
            articleId={articleId}
            onSuccess={handleCommentSuccess}
          />
        </section>

        {/* 评论列表区域 */}
        <section className="comment-section">
          <h2>评论列表</h2>
          <CommentList
            ref={commentListRef}
            articleId={articleId}
          />
        </section>
      </main>
    </div>
  );
}

export default App;
