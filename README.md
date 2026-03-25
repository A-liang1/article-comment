# 无限层级评论系统

一个基于 NestJS + React + SQLite 的全栈评论系统，支持无限层级嵌套的评论回复功能，类似于 Reddit、知乎的评论区。

## 技术栈

### 后端
- **框架**: NestJS
- **语言**: TypeScript
- **数据库**: SQLite
- **ORM**: TypeORM

### 前端
- **框架**: React 18
- **语言**: TypeScript
- **构建工具**: Vite
- **通信**: Fetch API

## 项目结构

```
article-comment/
├── backend/                    # NestJS 后端
│   ├── src/
│   │   ├── comment/
│   │   │   ├── dto/create-comment.dto.ts      # 数据传输对象
│   │   │   ├── entities/comment.entity.ts     # 数据库实体
│   │   │   ├── comment.controller.ts          # API 控制器
│   │   │   ├── comment.service.ts             # 业务逻辑
│   │   │   └── comment.module.ts              # 模块定义
│   │   ├── app.module.ts                      # 根模块
│   │   └── main.ts                            # 应用入口
│   ├── package.json
│   └── tsconfig.json
│
├── frontend/                   # React + Vite 前端
│   ├── src/
│   │   ├── components/
│   │   │   ├── CommentForm.tsx                # 评论表单
│   │   │   ├── CommentItem.tsx                # 单条评论（递归）
│   │   │   └── CommentList.tsx                # 评论列表
│   │   ├── api.ts                             # API 封装
│   │   ├── types.ts                           # TypeScript 类型
│   │   ├── App.tsx                            # 根组件
│   │   ├── App.css                            # 样式
│   │   └── main.tsx                           # 入口文件
│   ├── index.html
│   ├── package.json
│   └── vite.config.ts
│
├── DESIGN.md                   # 技术方案文档
└── system-prompt.md            # AI 开发提示词
```

## 功能特性

- ✅ **发表顶级评论** - 对文章直接发表评论
- ✅ **回复评论** - 对任意评论进行回复
- ✅ **无限层级嵌套** - 支持任意深度的评论层级
- ✅ **删除评论** - 级联删除所有子评论
- ✅ **展开/收起** - 可折叠/展开子评论
- ✅ **递归渲染** - React 递归组件渲染评论树
- ✅ **响应式设计** - 适配桌面端和移动端

## 快速开始

### 环境要求
- Node.js >= 16
- npm 或 yarn

### 1. 克隆项目

```bash
cd article-comment
```

### 2. 启动后端服务

```bash
cd backend
npm install
npm run dev
```

后端服务将启动在 http://localhost:3000

### 3. 启动前端服务

打开新的终端窗口：

```bash
cd frontend
npm install
npm run dev
```

前端应用将启动在 http://localhost:5173

### 4. 访问应用

在浏览器中打开 http://localhost:5173 即可使用评论系统。

## API 接口文档

| 方法 | 路径 | 功能 | 参数 |
|------|------|------|------|
| POST | /comments | 创建评论 | {content, author, articleId, parentId?} |
| GET | /comments?articleId={id} | 获取评论树 | articleId: 文章ID |
| DELETE | /comments/:id | 删除评论 | id: 评论ID |

### 创建评论示例

```bash
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "写得很好！",
    "author": "user1",
    "articleId": 1,
    "parentId": null
  }'
```

### 回复评论示例

```bash
curl -X POST http://localhost:3000/comments \
  -H "Content-Type: application/json" \
  -d '{
    "content": "同意楼上",
    "author": "user2",
    "articleId": 1,
    "parentId": 1
  }'
```

## 数据模型

### Comment 实体

| 字段 | 类型 | 说明 |
|------|------|------|
| id | number | 主键，自增 |
| content | string | 评论内容 |
| author | string | 评论作者 |
| articleId | number | 所属文章ID |
| parentId | number \| null | 父评论ID，null表示顶级评论 |
| children | Comment[] | 子评论数组 |
| createdAt | Date | 创建时间 |
| updatedAt | Date | 更新时间 |

## 核心算法

### 树形结构构建（O(n) 复杂度）

```typescript
private buildCommentTree(comments: Comment[]): Comment[] {
  const commentMap = new Map<number, Comment>();
  const roots: Comment[] = [];

  // 第一遍：创建节点映射
  for (const comment of comments) {
    const commentNode = { ...comment, children: [] };
    commentMap.set(comment.id, commentNode);
  }

  // 第二遍：建立父子关系
  for (const comment of comments) {
    const node = commentMap.get(comment.id)!;
    if (comment.parentId === null) {
      roots.push(node);
    } else {
      const parent = commentMap.get(comment.parentId);
      if (parent) {
        parent.children.push(node);
      }
    }
  }

  return roots;
}
```

## 开发文档

- [DESIGN.md](./DESIGN.md) - 详细的技术方案文档
- [system-prompt.md](./system-prompt.md) - AI 开发提示词
