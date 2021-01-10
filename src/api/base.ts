import axios, { AxiosInstance, AxiosRequestConfig, AxiosResponse } from 'axios';

export const DEFAULT_API_TIMEOUT = 30000;

export class BaseAPI {
  private instance: AxiosInstance;
  constructor(
    baseURL: string,
    timeout: number,
  ) {
    this.instance = axios.create({
      baseURL: baseURL,
      timeout: timeout || DEFAULT_API_TIMEOUT,
    });
  }

  public addRequestInterceptors(
    onFulfilled: (config: AxiosRequestConfig) => any,
    onRejected: (error: any) => any,
  ) {
    this.instance.interceptors.request.use(function (config: AxiosRequestConfig): any {
      if (typeof onFulfilled === 'function') {
        return onFulfilled(config);
      }
      return config;
    }, function (error: any): any {
      if (typeof onRejected === 'function') {
        return onRejected(error);
      }
      return Promise.reject(error);
    });
  }

  public addResponseInterceptors(
    onFulfilled: (response: AxiosResponse) => any,
    onRejected: (error: any) => any,
  ) {
    this.instance.interceptors.response.use(function (response: AxiosResponse): any {
      if (typeof onFulfilled === 'function') {
        return onFulfilled(response);
      }
      return response;
    }, function (error: any): any {
      if (typeof onRejected === 'function') {
        return onRejected(error);
      }
      return Promise.reject(error);
    });
  }

  public get<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.instance.get(url, config);
  }

  public post<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    return this.instance.post(url, data, config);
  }

  public delete<T = any, R = AxiosResponse<T>>(url: string, config?: AxiosRequestConfig): Promise<R> {
    return this.instance.delete(url, config);
  }

  public put<T = any, R = AxiosResponse<T>>(url: string, data?: any, config?: AxiosRequestConfig): Promise<R> {
    return this.instance.put(url, data, config);
  }
}