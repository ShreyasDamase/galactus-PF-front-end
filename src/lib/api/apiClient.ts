import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:7000';

export interface ApiResponse<T = any> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

export interface ApiError {
  success: false;
  message: string;
  error?: string;
  timestamp: string;
}

class ApiClient {
  private axiosInstance: AxiosInstance;

  constructor() {
    this.axiosInstance = axios.create({
      baseURL: API_BASE_URL,
      headers: {
        'Content-Type': 'application/json',
      },
      timeout: 10000, // 10s timeout
    });
  }

  private async handleRequest<T>(request: Promise<AxiosResponse<ApiResponse<T>>>): Promise<ApiResponse<T>> {
    try {
      const response = await request;
      return response.data;
    } catch (err: any) {
      console.error('API request failed:', err);

      // Handle Axios errors
      if (err.response) {
        // Server responded with a status outside 2xx
        const data = err.response.data as ApiError;
        throw new Error(data?.message || `HTTP error: ${err.response.status}`);
      } else if (err.request) {
        // Request made but no response
        throw new Error('No response from server');
      } else {
        // Other errors
        throw new Error(err.message);
      }
    }
  }

  async get<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.handleRequest(this.axiosInstance.get<ApiResponse<T>>(endpoint, config));
  }

  async post<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.handleRequest(this.axiosInstance.post<ApiResponse<T>>(endpoint, data, config));
  }

  async put<T = any>(endpoint: string, data?: any, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.handleRequest(this.axiosInstance.put<ApiResponse<T>>(endpoint, data, config));
  }

  async delete<T = any>(endpoint: string, config?: AxiosRequestConfig): Promise<ApiResponse<T>> {
    return this.handleRequest(this.axiosInstance.delete<ApiResponse<T>>(endpoint, config));
  }
}

export const apiClient = new ApiClient();
