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

  exportCsvBackup: async (): Promise<void> => {
    const response = await api.get('/backup/export/csv', { responseType: 'blob' });
    const url = window.URL.createObjectURL(new Blob([response.data], { type: 'text/csv;charset=utf-8;' }));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `pos_reportes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    link.remove();
  },

  importBackup: async (jsonPayload: Record<string, any>): Promise<{ success: boolean; message: string }> => {
    const response = await api.post<{ success: boolean; message: string }>('/backup/import', jsonPayload);
    return response.data;
  },
};
