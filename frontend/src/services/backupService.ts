import api from '../api/axios';

export const backupService = {
  exportBackup: async (): Promise<void> => {
    const response = await api.get('/backup/export', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pos_backup_${new Date().toISOString().split('T')[0]}.json`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  importBackup: async (jsonPayload: Record<string, any>): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/backup/import', jsonPayload);
    return response.data;
  },
};
