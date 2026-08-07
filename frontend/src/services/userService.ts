import api from '../api/axios';

export interface UserResponse {
  id: number;
  fullName: string;
  username: string;
  role: string;
  isActive?: boolean;
}

export interface UserRequest {
  fullName: string;
  username: string;
  password?: string;
  roleId: number;
}

export const userService = {
  getAll: async (): Promise<UserResponse[]> => {
    const response = await api.get<UserResponse[]>('/users');
    return response.data;
  },

  create: async (req: UserRequest): Promise<UserResponse> => {
    const response = await api.post<UserResponse>('/users', req);
    return response.data;
  },

  update: async (id: number, req: UserRequest): Promise<UserResponse> => {
    const response = await api.put<UserResponse>(`/users/${id}`, req);
    return response.data;
  },

  toggleStatus: async (id: number): Promise<UserResponse> => {
    const response = await api.patch<UserResponse>(`/users/${id}/status`);
    return response.data;
  },

  delete: async (id: number): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};
