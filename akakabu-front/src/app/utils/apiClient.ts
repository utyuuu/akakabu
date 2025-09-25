import { supabase } from './supabaseClient';

// APIクライアントの設定
const DEFAULT_RETRIES = 1; // リトライ回数を3から1に削減
const RETRY_DELAY = 100; // 待機時間を1000msから100msに短縮

// リクエストオプションの型定義
interface RequestOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
  body?: any;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
  credentials?: RequestCredentials;
}

// APIレスポンスの型定義
interface ApiResponse<T = any> {
  data: T;
  status: number;
  statusText: string;
  ok: boolean;
}

// エラーレスポンスの型定義
export interface ErrorResponse {
  message?: string;
  error?: string;
  details?: string;
  success?: string;
}

// カスタムエラークラス
export class ApiError extends Error {
  public status: number;
  public statusText: string;
  public data?: any;

  constructor(message: string, status: number, statusText: string, data?: any) {
    super(message);
    this.name = 'ApiError';
    this.status = status;
    this.statusText = statusText;
    this.data = data;
  }
}

// シンプルなfetch（タイムアウトなし）
const simpleFetch = async (
  url: string, 
  options: RequestInit
): Promise<Response> => {
  try {
    const response = await fetch(url, options);
    return response;
  } catch (error) {
    if (error instanceof Error) {
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        throw new ApiError('ネットワークエラーが発生しました', 0, 'Network Error');
      }
    }
    throw error;
  }
};

// リトライ機能付きfetch（同期的な待機処理）
const fetchWithRetry = async (
  url: string,
  options: RequestInit,
  retries: number
): Promise<Response> => {
  let lastError: Error;

  for (let i = 0; i <= retries; i++) {
    try {
      return await simpleFetch(url, options);
    } catch (error) {
      lastError = error as Error;
      
      // 最後の試行でない場合は待機
      if (i < retries) {
        // 同期的な待機
        const start = Date.now();
        while (Date.now() - start < RETRY_DELAY) {
          // 空のループで待機（100msのみ）
        }
      }
    }
  }

  throw lastError!;
};

// メインのAPIクライアント関数
export const apiClient = async <T = any>(
  endpoint: string,
  options: RequestOptions = {}
): Promise<ApiResponse<T>> => {
  const {
    method = 'GET',
    body,
    headers = {},
    retries = DEFAULT_RETRIES,
  } = options;

  const apiBaseUrl = import.meta.env.VITE_API_URL;
  const url = `${apiBaseUrl}${endpoint}`;

  // Supabaseの認証トークンを取得
  const { data: { session }, error: sessionError } = await supabase.auth.getSession();
  const token = session?.access_token;

  // デバッグ用ログ
  console.log('API Client Debug:', {
    hasSession: !!session,
    hasToken: !!token,
    tokenType: token ? 'access_token' : 'none',
    endpoint,
    method
  });

  if (sessionError) {
    console.error('Session error:', sessionError);
  }

  // Authorizationヘッダーを必ず付与
  const headersWithAuth: Record<string, string> = {
    'Content-Type': 'application/json',
    ...headers,
  };
  
  if (token) {
    headersWithAuth['Authorization'] = `Bearer ${token}`;
    console.log('Authorization header set with access_token');
  } else {
    console.warn('No access token available - request will likely fail with 401');
  }

  const requestOptions: RequestInit = {
    method,
    headers: headersWithAuth,
    credentials: 'omit', // 認証はトークンのみ
  };

  if (body && method !== 'GET') {
    requestOptions.body = JSON.stringify(body);
  }

  try {
    const response = await fetchWithRetry(url, requestOptions, retries);
    
    // レスポンスのJSONを取得（エラーの場合も含む）
    let data: T;
    try {
      data = await response.json();
    } catch {
      // JSONでない場合（テキスト等）
      data = await response.text() as any;
    }

    if (!response.ok) {
      throw new ApiError(
        (data as ErrorResponse)?.message || `HTTP ${response.status}: ${response.statusText}`,
        response.status,
        response.statusText,
        data
      );
    }

    return {
      data,
      status: response.status,
      statusText: response.statusText,
      ok: response.ok,
    };
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // ネットワークエラー等
    if (error instanceof Error) {
      if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
        throw new ApiError('ネットワークエラーが発生しました', 0, 'Network Error');
      }
      if (error.message.includes('timeout')) {
        throw new ApiError('リクエストがタイムアウトしました', 408, 'Request Timeout');
      }
    }

    throw new ApiError('予期しないエラーが発生しました', 0, 'Unknown Error');
  }
};

// 便利なメソッド
export const api = {
  get: <T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    apiClient<T>(endpoint, { ...options, method: 'GET' }),

  post: <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'POST', body }),

  put: <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'PUT', body }),

  patch: <T = any>(endpoint: string, body?: any, options?: Omit<RequestOptions, 'method' | 'body'>) =>
    apiClient<T>(endpoint, { ...options, method: 'PATCH', body }),

  delete: <T = any>(endpoint: string, options?: Omit<RequestOptions, 'method'>) =>
    apiClient<T>(endpoint, { ...options, method: 'DELETE' }),
}; 