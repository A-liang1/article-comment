import { Comment, CreateCommentRequest } from './types';

// API 基础地址
const API_BASE_URL = 'http://localhost:3000';

/**
 * API 请求封装
 */
export const api = {
  /**
   * 获取指定文章的评论树
   * @param articleId 文章ID
   * @returns 评论树数组
   */
  async getComments(articleId: number): Promise<Comment[]> {
    const response = await fetch(
      `${API_BASE_URL}/comments?articleId=${articleId}`
    );
    if (!response.ok) {
      throw new Error('获取评论失败');
    }
    return response.json();
  },

  /**
   * 创建评论
   * @param data 创建评论数据
   * @returns 创建成功的评论
   */
  async createComment(data: CreateCommentRequest): Promise<Comment> {
    const response = await fetch(`${API_BASE_URL}/comments`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      throw new Error('创建评论失败');
    }
    return response.json();
  },

  /**
   * 删除评论
   * @param id 评论ID
   */
  async deleteComment(id: number): Promise<void> {
    const response = await fetch(`${API_BASE_URL}/comments/${id}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      throw new Error('删除评论失败');
    }
  },
};
