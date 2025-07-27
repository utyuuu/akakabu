import { ApiError, ErrorResponse } from "./apiClient";

// エラーメッセージを取得するヘルパー関数
export const getErrorMessage = (error: unknown): string => {
  if (error instanceof ApiError) {
    // HTTPステータスコードに基づくエラーメッセージ
    switch (error.status) {
      case 400:
        return (error.data as ErrorResponse)?.message || "リクエストが不正です。入力内容を確認してください。";
      case 401:
        return "認証が必要です。再度ログインしてください。";
      case 403:
        return "アクセスが拒否されました。権限を確認してください。";
      case 404:
        return "リソースが見つかりません。";
      case 409:
        return "既に登録されているデータです。";
      case 422:
        return (error.data as ErrorResponse)?.message || "入力データが不正です。";
      case 429:
        return "リクエストが多すぎます。しばらく待ってから再試行してください。";
      case 500:
        return "サーバーエラーが発生しました。しばらく待ってから再試行してください。";
      case 502:
      case 503:
      case 504:
        return "サービスが一時的に利用できません。しばらく待ってから再試行してください。";
      case 408:
        return "リクエストがタイムアウトしました。しばらく待ってから再試行してください。";
      case 0:
        return "ネットワークエラーが発生しました。インターネット接続を確認してください。";
      default:
        return (error.data as ErrorResponse)?.message || "予期しないエラーが発生しました。";
    }
  }
  
  // その他のエラー
  if (error instanceof Error) {
    if (error.message.includes('Network Error') || error.message.includes('Failed to fetch')) {
      return "ネットワークエラーが発生しました。インターネット接続を確認してください。";
    }
    if (error.message.includes('timeout')) {
      return "リクエストがタイムアウトしました。しばらく待ってから再試行してください。";
    }
    return error.message;
  }
  
  return "予期しないエラーが発生しました。";
};

// エラーログ出力（開発環境のみ）
export const logError = (context: string, error: unknown): void => {
  if (import.meta.env.DEV) {
    console.error(`${context}エラー:`, error);
  }
};

// バリデーション関数
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;
  return emailRegex.test(email);
};

export const validatePassword = (password: string): { isValid: boolean; message: string } => {
  if (password.length < 8) {
    return { isValid: false, message: "パスワードは8文字以上で入力してください。" };
  }
  if (password.length > 128) {
    return { isValid: false, message: "パスワードは128文字以下で入力してください。" };
  }
  return { isValid: true, message: "" };
};

export const validateUsername = (username: string): { isValid: boolean; message: string } => {
  if (username.length < 2) {
    return { isValid: false, message: "ユーザー名は2文字以上で入力してください。" };
  }
  if (username.length > 50) {
    return { isValid: false, message: "ユーザー名は50文字以下で入力してください。" };
  }
  return { isValid: true, message: "" };
}; 