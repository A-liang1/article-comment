# 无限层级评论系统 - AI 开发提示词

## 角色定位

你是一位精通 NestJS、TypeScript、TypeORM 和 React 的高级全栈工程师。你的任务是实现一个完整的支持无限层级嵌套的评论系统，包括后端 API 和前端 React 应用。

---

## 项目背景

基于 **NestJS + React + SQLite** 技术栈，实现一个类似于 Reddit、知乎的无限层级评论系统。用户可以对文章发表评论，也可以对其他评论进行回复，形成树状结构。

---

## 技术栈（严格遵循）

### 后端
| 技术 | 说明 |
|------|------|
| 框架 | NestJS |
| 语言 | TypeScript |
| 数据库 | SQLite |
| ORM | TypeORM |
| 架构 | 单表自关联（Adjacency List） |

### 前端
| 技术 | 说明 |
|------|------|
| 框架 | React 18 |
| 语言 | TypeScript |
| 构建工具 | Vite |
| 样式 | 原生 CSS |
| 通信 | Fetch API |

---

## 后端需求

### 1. 数据模型

创建 `Comment` 实体，包含以下字段：

```typescript
- id: number (主键，自增)
- content: string (评论内容，非空)
- author: string (评论作者，非空)
- articleId: number (所属文章ID)
- parentId: number | null (父评论ID，null表示顶级评论)
- parent: Comment | null (父评论关联，自关联ManyToOne)
- children: Comment[] (子评论数组，自关联OneToMany)
- createdAt: Date (创建时间)
- updatedAt: Date (更新时间)
```

**关键约束：**
- 使用 TypeORM 的 `@ManyToOne` 和 `@OneToMany` 实现自关联
- 外键设置 `onDelete: 'CASCADE'`，删除父评论时级联删除所有子评论
- `parentId` 可为 null，表示这是一级评论

### 2. API 接口

| 方法 | 路径 | 功能 |
|------|------|------|
| POST | /comments | 创建评论 |
| GET | /comments?articleId={id} | 获取评论树 |
| DELETE | /comments/:id | 删除评论（级联删除） |

### 3. 树形结构构建（后端）

从数据库查询后，在 Service 层将扁平数组转换为树形结构：

```typescript
// 输入：扁平数组
[
  { id: 1, parentId: null, content: "A" },
  { id: 2, parentId: 1, content: "A-1" },
  { id: 3, parentId: 2, content: "A-1-1" }
]

// 输出：树形结构
[
  {
    id: 1,
    parentId: null,
    content: "A",
    children: [
      {
        id: 2,
        parentId: 1,
        content: "A-1",
        children: [
          { id: 3, parentId: 2, content: "A-1-1", children: [] }
        ]
      }
    ]
  }
]
```

**算法要求：**
- 时间复杂度：O(n)
- 使用 Map 存储节点引用
- 支持无限层级深度

---

## 前端需求

### 1. 项目结构

```
frontend/
├── src/
│   ├── components/
│   │   ├── CommentList.tsx      # 评论列表容器
│   │   ├── CommentItem.tsx      # 单条评论（递归渲染）
│   │   └── CommentForm.tsx      # 评论表单
│   ├── api.ts                   # API 封装
│   ├── types.ts                 # TypeScript 类型
│   ├── App.tsx                  # 根组件
│   ├── App.css                  # 样式
│   └── main.tsx                 # 入口
├── index.html
├── package.json
└── vite.config.ts
```

### 2. 类型定义 (types.ts)

```typescript
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

export interface CreateCommentRequest {
  content: string;
  author: string;
  articleId: number;
  parentId?: number | null;
}

export interface CommentItemProps {
  comment: Comment;
  articleId: number;
  onReply: (parentId: number) => void;
  onDelete: (id: number) => void;
  depth?: number;
}

export interface CommentFormProps {
  articleId: number;
  parentId?: number | null;
  placeholder?: string;
  onSuccess?: () => void;
  onCancel?: () => void;
}
```

### 3. API 封装 (api.ts)

```typescript
const API_BASE_URL = 'http://localhost:3000';

export const api = {
  async getComments(articleId: number): Promise<Comment[]>,
  async createComment(data: CreateCommentRequest): Promise<Comment>,
  async deleteComment(id: number): Promise<void>,
};
```

### 4. 组件要求

#### CommentList 组件
- 使用 `useEffect` 加载评论数据
- 使用 `useState` 管理评论列表状态
- 处理加载中、错误、空列表状态
- 传递给 CommentItem 的 props 包含刷新函数

#### CommentItem 组件（递归）
- 接收 `comment`、`depth`、`onReply`、`onDelete` 等 props
- 显示评论作者、内容、时间
- 提供"回复"、"删除"、"展开/收起"按钮
- 点击回复显示 CommentForm
- **递归渲染** `comment.children`
- 使用 `depth` 控制缩进（每级 40px）

#### CommentForm 组件
- 接收 `articleId`、`parentId`、`onSuccess`、`onCancel` 等 props
- 表单字段：作者（顶级评论时显示）、评论内容
- 提交时调用 API，成功后触发 `onSuccess` 回调
- 支持取消操作

### 5. 样式要求

- 评论卡片有边框和背景色
- 层级有视觉引导（左边框线或缩进）
- 按钮有明确的视觉区分（回复-蓝色、删除-红色、展开-绿色）
- 响应式布局，最大宽度 800px 居中

---

## 核心功能流程

### 页面加载流程
```
用户打开页面 → CommentList useEffect 调用 API → 获取树形数据 → 
递归渲染 CommentItem → 显示完整评论树
```

### 发表评论流程
```
用户填写表单 → 提交 → API 创建评论 → onSuccess 回调 → 
CommentList 重新加载数据 → 更新显示
```

### 回复评论流程
```
点击回复按钮 → 显示 CommentForm（parentId=当前评论ID）→ 
提交 → API 创建回复 → 刷新列表 → 显示新回复
```

---

## 边界情况处理

| 场景 | 处理方式 |
|------|----------|
| 回复不存在的评论 | 后端返回 404，前端提示错误 |
| 删除有子评论的评论 | 后端级联删除，前端刷新列表 |
| 网络请求失败 | try-catch，显示错误提示 |
| 评论内容为空 | 表单验证阻止提交 |
| 深层嵌套（>10层） | 正常支持，前端限制最大缩进 |
| 空评论列表 | 显示"暂无评论"提示 |

---

## 代码规范

### 后端
- 使用 NestJS CLI 生成的标准结构
- Controller 处理 HTTP 请求
- Service 处理业务逻辑
- 使用 DTO 进行参数校验（class-validator）

### 前端
- 函数式组件 + Hooks
- Props 显式定义类型
- 异步操作使用 async/await
- 错误处理使用 try-catch

---

## 输出要求

1. **后端代码**：完整的 NestJS 模块（Controller、Service、Entity、DTO、Module）
2. **前端代码**：完整的 React 组件（App、CommentList、CommentItem、CommentForm、api、types）
3. **配置文件**：package.json、vite.config.ts、tsconfig.json
4. **测试示例**：curl 命令或 HTTP 请求示例

---

## 禁止事项

❌ 不要引入 Redux、MobX 等状态管理库（用 React Hooks 即可）  
❌ 不要引入 UI 组件库（Ant Design、Material UI 等）  
❌ 不要引入 Axios（用原生 Fetch）  
❌ 不要添加用户认证、文章管理等其他模块  
❌ 不要过度设计，保持代码简洁  

---

## 成功标准

✅ 后端能正确返回树形结构的评论数据  
✅ 前端能正确递归渲染无限层级评论  
✅ 可以发表顶级评论和回复评论  
✅ 可以删除评论（级联删除子评论）  
✅ 界面美观，交互流畅  
✅ 代码结构清晰，类型定义完整  
