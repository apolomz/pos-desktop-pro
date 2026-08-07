import api from '../api/axios';

export interface BusinessConfig {
  id?: number;
  name: string;
  nit: string;
  address: string;
  phone: string;
  email: string;
  taxPercentage: number;
  logoUrl?: string;
}

export const configService = {
  getConfig: async (): Promise<BusinessConfig> => {
    try {
      const response = await api.get<BusinessConfig>('/config');
      return response.data;
    } catch (error) {
      console.warn('Backend /config not reachable, returning default fallback', error);
      return {
        name: 'POS Desktop Store',
        nit: '900.000.000-1',
        address: 'Calle Principal # 10 - 20',
        phone: '300 000 0000',
        email: 'contacto@negocio.com',
        taxPercentage: 19,
      };
    }
  },

  updateConfig: async (config: BusinessConfig): Promise<BusinessConfig> => {
    const response = await api.put<BusinessConfig>('/config', config);
    return response.data;
  },

  uploadLogo: async (file: File): Promise<string> => {
    const formData = new FormData();
    formData.append('file', file);
    const response = await api.post<{ logoUrl: string }>('/config/logo', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return response.data.logoUrl;
  },
};