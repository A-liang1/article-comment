# 无限层级评论系统 - 技术方案

## 1. 系统概述

### 1.1 项目背景
实现一个支持无限层级嵌套的评论系统，类似于 Reddit、知乎的评论区，用户可以对文章评论，也可以对评论进行回复，形成树状结构。

### 1.2 技术栈
- **后端**: NestJS + TypeScript + SQLite + TypeORM
- **前端**: React 18 + TypeScript + Vite
- **UI 组件**: 原生 CSS
- **通信**: REST API + Fetch

### 1.3 个人总结

> 将扁平化的评论 -> 树状结构（数组转树算法）-> 前端拿到数据进行递归渲染

---

## 2. 系统架构图

```
┌─────────────────────────────────────────────────────────────────────────┐
│                              前端层 (React)                               │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     React 应用                                   │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │    │
│  │  │  App.tsx     │  │  CommentList │  │   CommentItem        │  │    │
│  │  │              │  │  组件        │  │   组件(递归)         │  │    │
│  │  │ • 状态管理   │  │              │  │                      │  │    │
│  │  │ • API调用    │  │ • 加载评论   │  │ • 展示单条评论       │  │    │
│  │  │ • 数据传递   │  │ • 传递数据   │  │ • 递归渲染子评论     │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │    │
│  │                                                                  │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │    │
│  │  │ CommentForm  │  │  api.ts      │  │   types.ts           │  │    │
│  │  │ 组件         │  │              │  │                      │  │    │
│  │  │              │  │ • 封装请求   │  │ • TypeScript类型     │  │    │
│  │  │ • 发表评论   │  │ • 错误处理   │  │ • 接口定义           │  │    │
│  │  │ • 回复评论   │  │              │  │                      │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
                                    │
                                    ▼ Fetch API
┌─────────────────────────────────────────────────────────────────────────┐
│                              后端层 (NestJS)                              │
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     API 网关层                                   │    │
│  │                   NestJS HTTP Server                             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
                                    │
                                    ▼
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     业务逻辑层                                   │    │
│  │                     Comment Module                               │    │
│  │  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐  │    │
│  │  │  Controller  │  │   Service    │  │      DTO/Entity      │  │    │
│  │  │              │  │              │  │                      │  │    │
│  │  │ • POST       │  │ • create()   │  │ • Comment            │  │    │
│  │  │ • GET        │  │ • findTree() │  │ • CreateCommentDto   │  │    │
│  │  │ • DELETE     │  │ • remove()   │  │                      │  │    │
│  │  └──────────────┘  └──────────────┘  └──────────────────────┘  │    │
│  └─────────────────────────────────────────────────────────────────┘    │
                                    │
                                    ▼
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     数据访问层                                   │    │
│  │                   TypeORM Repository                             │    │
│  └─────────────────────────────────────────────────────────────────┘    │
                                    │
                                    ▼
│  ┌─────────────────────────────────────────────────────────────────┐    │
│  │                     数据存储层                                   │    │
│  │                        SQLite                                    │    │
│  └─────────────────────────────────────────────────────────────────┘    │
└─────────────────────────────────────────────────────────────────────────┘
```

---

## 3. 数据模型设计

### 3.1 数据库表结构

```
┌─────────────────────────────────────────────────────────────────────────┐
│                            comments 表                                   │
├──────────────┬──────────────┬───────────────────────────────────────────┤
│    字段名     │    类型      │                  说明                      │
├──────────────┼──────────────┼───────────────────────────────────────────┤
│     id       │   INTEGER    │  主键，自增，唯一标识                       │
│   content    │     TEXT     │  评论内容，非空                            │
│   author     │   VARCHAR    │  评论作者，非空                            │
│  article_id  │   INTEGER    │  所属文章ID，用于区分不同文章的评论          │
│  parent_id   │   INTEGER    │  父评论ID，自关联外键，NULL表示顶级评论      │
│  created_at  │  DATETIME    │  创建时间，自动填充                         │
│  updated_at  │  DATETIME    │  更新时间，自动填充                         │
├──────────────┴──────────────┴───────────────────────────────────────────┤
│  外键约束: parent_id REFERENCES comments(id) ON DELETE CASCADE          │
│  索引: (article_id), (parent_id)                                        │
└─────────────────────────────────────────────────────────────────────────┘
```

### 3.2 TypeScript 类型定义

```typescript
// types.ts

// 后端返回的评论数据
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

// 创建评论请求参数
export interface CreateCommentRequest {
  content: string;
  author: string;
  articleId: number;
  parentId?: number | null;
}

// 组件 Props 类型
export interface CommentItemProps {
  comment: Comment;
  articleId: number;
  onReply: (parentId: number) => void;
  onDelete: (id: number) => void;
  depth?: number;  // 当前层级深度，用于缩进
}

export interface CommentFormProps {
  articleId: number;
  parentId?: number | null;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}

export interface CommentListProps {
  articleId: number;
}
```

---

## 4. API 接口设计

### 4.1 后端接口

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /comments | 创建评论（可回复） |
| GET | /comments?articleId={id} | 获取某文章的所有评论（树形） |
| DELETE | /comments/:id | 删除评论（级联删除子评论） |

### 4.2 前端 API 封装

```typescript
// api.ts
const API_BASE_URL = 'http://localhost:3000';

export const api = {
  // 获取评论树
  async getComments(articleId: number): Promise<Comment[]> {
    const response = await fetch(`${API_BASE_URL}/comments?articleId=${articleId}`);
    if (!response.ok) throw new Error('获取评论失败');
    return response.json();
  },

  // 创建评论
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(data),
    });
    if (!response.ok) throw new Error('创建评论失败');
    return response.json();
  },

  // 删除评论
  async deleteComment(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) throw new Error('删除评论失败');
  },
};
```

---

## 5. React 组件设计

### 5.1 组件结构

```
src/
├── components/
│   ├── CommentList.tsx      # 评论列表容器组件
│   ├── CommentItem.tsx      # 单条评论组件（递归渲染）
│   ├── CommentForm.tsx      # 评论表单组件
│   └── CommentActions.tsx   # 评论操作按钮（回复/删除）
├── api.ts                   # API 请求封装
├── types.ts                 # TypeScript 类型定义
├── App.tsx                  # 根组件
├── main.tsx                 # 应用入口
└── App.css                  # 样式文件
```

### 5.2 组件详细设计

#### App.tsx - 根组件

```tsx
import { useState } from 'react';
import { CommentList } from './components/CommentList';
import { CommentForm } from './components/CommentForm';

function App() {
  const [articleId] = useState(1); // 当前文章ID

  return (
    <div className="app">
      <header className="app-header">
        <h1>文章标题：如何学习编程</h1>
      </header>
      
      <main className="app-main">
        {/* 发表评论表单 */}
        <section className="comment-section">
          <h2>发表评论</h2>
          <CommentForm articleId={articleId} />
        </section>

        {/* 评论列表 */}
        <section className="comment-section">
          <h2>评论列表</h2>
          <CommentList articleId={articleId} />
        </section>
      </main>
    </div>
  );
}
```

#### CommentList.tsx - 评论列表

```tsx
import { useState, useEffect, useCallback } from 'react';
import { Comment } from '../types';
import { api } from '../api';
import { CommentItem } from './CommentItem';

export function CommentList({ articleId }: { articleId: number }) {
  const [comments, setComments] = useState<Comment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // 加载评论数据
  const loadComments = useCallback(async () => {
    try {
      setLoading(true);
      const data = await api.getComments(articleId);
      setComments(data);
      setError(null);
    } catch (err) {
      setError('加载评论失败，请稍后重试');
    } finally {
      setLoading(false);
    }
  }, [articleId]);

  useEffect(() => {
    loadComments();
  }, [loadComments]);

  // 删除评论后刷新列表
  const handleDelete = async (id: number) => {
    if (!confirm('确定要删除这条评论吗？')) return;
    try {
      await api.deleteComment(id);
      await loadComments(); // 刷新列表
    } catch (err) {
      alert('删除失败');
    }
  };

  if (loading) return <div className="loading">加载中...</div>;
  if (error) return <div className="error">{error}</div>;
  if (comments.length === 0) return <div className="empty">暂无评论，来发表第一条评论吧！</div>;

  return (
    <div className="comment-list">
      {comments.map(comment => (
        <CommentItem
          key={comment.id}
          comment={comment}
          articleId={articleId}
          onReply={() => loadComments()}
          onDelete={handleDelete}
          depth={0}
        />
      ))}
    </div>
  );
}
```

#### CommentItem.tsx - 递归评论项

```tsx
import { useState } from 'react';
import { CommentItemProps } from '../types';
import { CommentForm } from './CommentForm';

export function CommentItem({
  comment,
  articleId,
  onReply,
  onDelete,
  depth = 0,
}: CommentItemProps) {
  const [isReplying, setIsReplying] = useState(false);
  const [isExpanded, setIsExpanded] = useState(true); // 子评论展开/收起

  // 格式化时间
  const formatTime = (time: string) => {
    return new Date(time).toLocaleString('zh-CN');
  };

  // 回复成功回调
  const handleReplySuccess = () => {
    setIsReplying(false);
    onReply(comment.id); // 触发刷新
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
              {isExpanded ? '收起回复' : `展开回复(${comment.children.length})`}
            </button>
          )}
        </div>

        {/* 回复表单 */}
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
          {comment.children.map(child => (
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
```

#### CommentForm.tsx - 评论表单

```tsx
import { useState } from 'react';
import { CommentFormProps } from '../types';
import { api } from '../api';

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // 表单验证
    if (!content.trim() || !author.trim()) {
      alert('请填写完整信息');
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
      if (!parentId) setAuthor(''); // 顶级评论清空作者，回复保留

      onSuccess?.();
    } catch (err) {
      alert('提交失败，请重试');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form className="comment-form" onSubmit={handleSubmit}>
      {/* 作者输入 - 仅在顶级评论或作者为空时显示 */}
      {!parentId && (
        <div className="form-group">
          <input
            type="text"
            placeholder="你的昵称"
            value={author}
            onChange={e => setAuthor(e.target.value)}
            disabled={submitting}
          />
        </div>
      )}

      <div className="form-group">
        <textarea
          placeholder={placeholder}
          value={content}
          onChange={e => setContent(e.target.value)}
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
          {submitting ? '提交中...' : '发表评论'}
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
```

---

## 6. CSS 样式设计

### 6.1 核心样式

```css
/* App.css */

/* 基础样式 */
* {
  margin: 0;
  padding: 0;
  box-sizing: border-box;
}

body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  background-color: #f5f5f5;
  color: #333;
  line-height: 1.6;
}

.app {
  max-width: 800px;
  margin: 0 auto;
  padding: 20px;
}

.app-header {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.app-header h1 {
  font-size: 24px;
  color: #1a1a1a;
}

.comment-section {
  background: #fff;
  padding: 20px;
  border-radius: 8px;
  margin-bottom: 20px;
  box-shadow: 0 2px 4px rgba(0,0,0,0.1);
}

.comment-section h2 {
  font-size: 18px;
  margin-bottom: 16px;
  color: #333;
}

/* 评论列表 */
.comment-list {
  display: flex;
  flex-direction: column;
  gap: 16px;
}

/* 评论项 */
.comment-item {
  position: relative;
}

/* 层级引导线 */
.comment-item::before {
  content: '';
  position: absolute;
  left: -20px;
  top: 0;
  bottom: 0;
  width: 2px;
  background: #e0e0e0;
}

.comment-card {
  background: #fafafa;
  border: 1px solid #e8e8e8;
  border-radius: 8px;
  padding: 16px;
}

.comment-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  margin-bottom: 8px;
}

.comment-author {
  font-weight: 600;
  color: #1890ff;
}

.comment-time {
  font-size: 12px;
  color: #999;
}

.comment-content {
  margin-bottom: 12px;
  line-height: 1.8;
  color: #333;
}

/* 操作按钮 */
.comment-actions {
  display: flex;
  gap: 12px;
}

.comment-actions button {
  padding: 4px 12px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 13px;
  transition: all 0.2s;
}

.btn-reply {
  background: #e6f7ff;
  color: #1890ff;
}

.btn-reply:hover {
  background: #bae7ff;
}

.btn-delete {
  background: #fff1f0;
  color: #ff4d4f;
}

.btn-delete:hover {
  background: #ffccc7;
}

.btn-toggle {
  background: #f6ffed;
  color: #52c41a;
}

.btn-toggle:hover {
  background: #d9f7be;
}

/* 回复表单 */
.reply-form-wrapper {
  margin-top: 12px;
  padding-top: 12px;
  border-top: 1px dashed #ddd;
}

/* 评论表单 */
.comment-form {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.form-group input,
.form-group textarea {
  width: 100%;
  padding: 10px 12px;
  border: 1px solid #d9d9d9;
  border-radius: 4px;
  font-size: 14px;
  transition: border-color 0.2s;
}

.form-group input:focus,
.form-group textarea:focus {
  outline: none;
  border-color: #1890ff;
}

.form-group textarea {
  resize: vertical;
  min-height: 80px;
}

.form-actions {
  display: flex;
  gap: 12px;
}

.btn-submit,
.btn-cancel {
  padding: 8px 20px;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  transition: all 0.2s;
}

.btn-submit {
  background: #1890ff;
  color: #fff;
}

.btn-submit:hover:not(:disabled) {
  background: #40a9ff;
}

.btn-submit:disabled {
  background: #bae7ff;
  cursor: not-allowed;
}

.btn-cancel {
  background: #f5f5f5;
  color: #666;
}

.btn-cancel:hover {
  background: #e8e8e8;
}

/* 状态提示 */
.loading,
.error,
.empty {
  text-align: center;
  padding: 40px;
  color: #999;
}

.error {
  color: #ff4d4f;
}

.empty {
  color: #999;
  font-style: italic;
}

/* 子评论容器 */
.comment-children {
  margin-top: 12px;
}
```

---

## 7. 项目结构

```
article-comment/
├── backend/                          # 后端 (NestJS)
│   ├── src/
│   │   ├── comment/
│   │   │   ├── comment.controller.ts
│   │   │   ├── comment.service.ts
│   │   │   ├── comment.module.ts
│   │   │   ├── dto/
│   │   │   │   └── create-comment.dto.ts
│   │   │   └── entities/
│   │   │       └── comment.entity.ts
│   │   ├── app.module.ts
│   │   └── main.ts
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                         # 前端 (React + Vite)
│   ├── src/
│   │   ├── components/
│   │   │   ├── CommentList.tsx
│   │   │   ├── CommentItem.tsx
│   │   │   ├── CommentForm.tsx
│   │   │   └── CommentActions.tsx
│   │   ├── api.ts
│   │   ├── types.ts
│   │   ├── App.tsx
│   │   ├── App.css
│   │   └── main.tsx
│   ├── index.html
│   ├── package.json
│   ├── tsconfig.json
│   └── vite.config.ts
│
├── DESIGN.md                         # 本文档
└── README.md
```

---

## 8. 前后端交互流程

### 8.1 页面加载流程

```
┌─────────┐     1. 页面加载      ┌─────────────┐
│  用户   │ ──────────────────> │  React App  │
└─────────┘                     └─────────────┘
                                        │
                                        ▼ 2. useEffect
                                 ┌─────────────┐
                                 │  调用 API   │
                                 │ getComments │
                                 └─────────────┘
                                        │
                                        ▼ 3. Fetch
                                 ┌─────────────┐
                                 │   NestJS    │
                                 │   后端API   │
                                 └─────────────┘
                                        │
                                        ▼ 4. 返回JSON
                                 ┌─────────────┐
                                 │  CommentList│
                                 │  setState   │
                                 └─────────────┘
                                        │
                                        ▼ 5. 递归渲染
                                 ┌─────────────┐
│  用户   │ <────────────────── │  显示评论树  │
└─────────┘     6. 看到结果      └─────────────┘
```

### 8.2 发表评论流程

```
┌─────────┐     1. 填写表单      ┌─────────────┐
│  用户   │ ──────────────────> │ CommentForm │
└─────────┘                     └─────────────┘
                                        │
                                        ▼ 2. 提交
                                 ┌─────────────┐
                                 │  调用 API   │
                                 │createComment│
                                 └─────────────┘
                                        │
                                        ▼ 3. POST
                                 ┌─────────────┐
                                 │   NestJS    │
                                 │  创建评论   │
                                 └─────────────┘
                                        │
                                        ▼ 4. 返回成功
                                 ┌─────────────┐
                                 │  onSuccess  │
                                 │ 回调刷新列表 │
                                 └─────────────┘
                                        │
                                        ▼ 5. 重新加载
                                 ┌─────────────┐
│  用户   │ <────────────────── │  显示新评论  │
└─────────┘     6. 看到新评论     └─────────────┘
```
