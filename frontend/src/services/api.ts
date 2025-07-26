import axios, { AxiosInstance, AxiosResponse } from 'axios';
import { ApiResponse, InventoryItem, ScanResult, User, InventoryMovement } from '@/types';

class ApiService {
  private api: AxiosInstance;

  constructor() {
    this.api = axios.create({
      baseURL: import.meta.env.VITE_API_URL || '/api',
      timeout: 10000,
      headers: {
        'Content-Type': 'application/json',
      },
    });

    // Request interceptor untuk menambahkan token
    this.api.interceptors.request.use(
      (config) => {
        const token = localStorage.getItem('token');
        if (token) {
          config.headers.Authorization = `Bearer ${token}`;
        }
        return config;
      },
      (error) => Promise.reject(error)
    );

    // Response interceptor untuk handling error
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          window.location.href = '/login';
        }
        return Promise.reject(error);
      }
    );
  }

  // Auth endpoints
  async login(username: string, password: string): Promise<ApiResponse<{ user: User; token: string }>> {
    const response: AxiosResponse<ApiResponse<{ user: User; token: string }>> = await this.api.post('/auth/login', {
      username,
      password,
    });
    return response.data;
  }

  async logout(): Promise<void> {
    await this.api.post('/auth/logout');
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

  // Barcode/QR Code endpoints
  async scanCode(code: string, movementType?: 'in' | 'out'): Promise<ScanResult> {
    const response: AxiosResponse<ScanResult> = await this.api.post('/barcode/scan', {
      code,
      movement_type: movementType,
    });
    return response.data;
  }

  async getItemByCode(code: string): Promise<ApiResponse<InventoryItem>> {
    const response: AxiosResponse<ApiResponse<InventoryItem>> = await this.api.get(`/barcode/item/${code}`);
    return response.data;
  }

  async generateQRCode(itemId: number): Promise<ApiResponse<{ qr_code: string; file_path: string }>> {
    const response: AxiosResponse<ApiResponse<{ qr_code: string; file_path: string }>> = await this.api.post(
      `/barcode/generate/qr/${itemId}`
    );
    return response.data;
  }

  async generateBarcode(itemId: number): Promise<ApiResponse<{ barcode: string; file_path: string }>> {
    const response: AxiosResponse<ApiResponse<{ barcode: string; file_path: string }>> = await this.api.post(
      `/barcode/generate/barcode/${itemId}`
    );
    return response.data;
  }

  async generateSticker(itemId: number, options?: any): Promise<ApiResponse<{ file_path: string }>> {
    const response: AxiosResponse<ApiResponse<{ file_path: string }>> = await this.api.post(
      `/barcode/sticker/${itemId}`,
      options
    );
    return response.data;
  }

  async createFromBarcode(data: {
    barcode: string;
    name: string;
    category_id: number;
    cost_price: number;
    selling_price: number;
    quantity: number;
    minimum_stock: number;
    supplier_id?: number;
    location?: string;
  }): Promise<ApiResponse<InventoryItem>> {
    const response: AxiosResponse<ApiResponse<InventoryItem>> = await this.api.post('/barcode/create-from-barcode', data);
    return response.data;
  }

  async bulkImportFromBarcodes(data: {
    barcodes: string[];
    default_category_id?: number;
    default_supplier_id?: number;
  }): Promise<ApiResponse<{ created: InventoryItem[]; errors: any[] }>> {
    const response: AxiosResponse<ApiResponse<{ created: InventoryItem[]; errors: any[] }>> = await this.api.post(
      '/barcode/bulk-import',
      data
    );
    return response.data;
  }

  // Inventory endpoints
  async getInventoryItems(params?: {
    page?: number;
    limit?: number;
    search?: string;
    category?: number;
  }): Promise<ApiResponse<{ items: InventoryItem[]; total: number; page: number; limit: number }>> {
    const response: AxiosResponse<ApiResponse<{ items: InventoryItem[]; total: number; page: number; limit: number }>> =
      await this.api.get('/inventory', { params });
    return response.data;
  }

  async getInventoryItem(id: number): Promise<ApiResponse<InventoryItem>> {
    const response: AxiosResponse<ApiResponse<InventoryItem>> = await this.api.get(`/inventory/${id}`);
    return response.data;
  }

  async createInventoryItem(data: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    const response: AxiosResponse<ApiResponse<InventoryItem>> = await this.api.post('/inventory', data);
    return response.data;
  }

  async updateInventoryItem(id: number, data: Partial<InventoryItem>): Promise<ApiResponse<InventoryItem>> {
    const response: AxiosResponse<ApiResponse<InventoryItem>> = await this.api.put(`/inventory/${id}`, data);
    return response.data;
  }

  async deleteInventoryItem(id: number): Promise<ApiResponse> {
    const response: AxiosResponse<ApiResponse> = await this.api.delete(`/inventory/${id}`);
    return response.data;
  }

  // Movement endpoints
  async getMovements(params?: {
    page?: number;
    limit?: number;
    item_id?: number;
    movement_type?: 'in' | 'out' | 'adjustment';
  }): Promise<ApiResponse<{ movements: InventoryMovement[]; total: number; page: number; limit: number }>> {
    const response: AxiosResponse<
      ApiResponse<{ movements: InventoryMovement[]; total: number; page: number; limit: number }>
    > = await this.api.get('/inventory/movements', { params });
    return response.data;
  }

  async createMovement(data: {
    item_id: number;
    movement_type: 'in' | 'out' | 'adjustment';
    quantity: number;
    reference_number?: string;
    notes?: string;
  }): Promise<ApiResponse<InventoryMovement>> {
    const response: AxiosResponse<ApiResponse<InventoryMovement>> = await this.api.post('/inventory/movements', data);
    return response.data;
  }

  // File download
  async downloadFile(filename: string): Promise<Blob> {
    const response = await this.api.get(`/barcode/download/${filename}`, {
      responseType: 'blob',
    });
    return response.data;
  }
}

export const apiService = new ApiService();
export default apiService;
