import { useState, useEffect } from 'react';
import { AuthService } from '../services/authService';
import { User } from '../utils/supabaseClient';

interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export const useAuth = () => {
  const [authState, setAuthState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null
  });

  // 初期化時にユーザー情報を取得
  useEffect(() => {
    checkAuthStatus();
    
    // タイムアウト機能（5秒で強制的にloadingをfalseにする）
    const timeout = setTimeout(() => {
      setAuthState(prev => ({ ...prev, loading: false }));
    }, 5000);
    
    // 認証状態の変更を監視 - 一時的に無効化してデッドロックをテスト
    console.log('[useAuth.tsx] onAuthStateChange listener DISABLED for testing');
    // const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
    //   console.log('[useAuth.tsx] onAuthStateChange fired with user:', !!user);
    //   setAuthState({
    //     user,
    //     loading: false,
    //     error: null
    //   });
    // });

    return () => {
      console.log('[useAuth.tsx] Cleaning up useEffect');
      clearTimeout(timeout);
      // subscription.unsubscribe();
    };
  }, []);

  const checkAuthStatus = async () => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.getCurrentUser();
      
      if (result.success && result.user) {
        setAuthState({
          user: result.user,
          loading: false,
          error: null
        });
      } else {
        // ユーザーが見つからない場合は認証なしとして扱う
        setAuthState({
          user: null,
          loading: false,
          error: null // エラーをnullにして、認証なし状態にする
        });
      }
    } catch (error) {
      // エラーが発生しても認証なし状態にする
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      // デバッグログ
      console.log('[useAuth.tsx] login called with:', {
        email,
        emailLength: email.length,
        password: '***' + password.slice(-2),
        passwordLength: password.length
      });

      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.signIn(email, password);
      
      console.log('[useAuth.tsx] AuthService.signIn result:', {
        success: result.success,
        message: result.message,
        hasUser: !!result.user
      });
      
      if (result.success && result.user) {
        console.log('[useAuth.tsx] About to update auth state with user:', result.user.id);
        setAuthState({
          user: result.user,
          loading: false,
          error: null
        });
        console.log("[useAuth.tsx] Auth state updated successfully");
        
        // state更新を確認するため、少し待ってから戻り値を返す
        await new Promise(resolve => setTimeout(resolve, 50));
        
        return { success: true, message: result.message };
        
      } else {
        console.log('[useAuth.tsx] signIn failed, updating state');
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, message: result.message };
      }
    } catch (error) {
      console.error('[useAuth.tsx] login error:', error);
      setAuthState(prev => ({ ...prev, loading: false, error: 'ログインに失敗しました' }));
      return { success: false, message: 'ログインに失敗しました' };
    }
  };

  const signup = async (email: string, password: string, user_name: string): Promise<{ success: boolean; message: string }> => {
    try {
      // デバッグログ
      console.log('[useAuth.tsx] signup called with:', {
        email,
        emailLength: email.length,
        password: '***' + password.slice(-2),
        passwordLength: password.length,
        user_name,
        userNameLength: user_name.length
      });

      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.signUp(email, password, user_name);
      
      console.log('[useAuth.tsx] AuthService.signUp result:', {
        success: result.success,
        message: result.message,
        hasUser: !!result.user
      });
      
      if (result.success && result.user) {
        setAuthState({
          user: result.user,
          loading: false,
          error: null
        });
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
      }
      
      return { success: result.success, message: result.message };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'サインアップに失敗しました' }));
      return { success: false, message: 'サインアップに失敗しました' };
    }
  };

  const logout = async (): Promise<{ success: boolean; message: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.signOut();
      
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
      
      return { success: true, message: result.message };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'ログアウトに失敗しました' }));
      return { success: false, message: 'ログアウトに失敗しました' };
    }
  };

  const updateUser = async (updates: Partial<User>): Promise<{ success: boolean; message: string }> => {
    if (!authState.user) {
      return { success: false, message: 'ユーザーがログインしていません' };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.updateUser(authState.user.id, updates);
      
      if (result.success && result.user) {
        setAuthState({
          user: result.user,
          loading: false,
          error: null
        });
        return { success: true, message: result.message };
      } else {
        setAuthState(prev => ({ ...prev, loading: false }));
        return { success: false, message: result.message };
      }
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'ユーザー情報の更新に失敗しました' }));
      return { success: false, message: 'ユーザー情報の更新に失敗しました' };
    }
  };

  const deleteUser = async (): Promise<{ success: boolean; message: string }> => {
    if (!authState.user) {
      return { success: false, message: 'ユーザーがログインしていません' };
    }

    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.deleteUser(authState.user.id);
      
      setAuthState({
        user: null,
        loading: false,
        error: null
      });
      
      return { success: true, message: result.message };
    } catch (error) {
      setAuthState(prev => ({ ...prev, loading: false, error: 'アカウントの削除に失敗しました' }));
      return { success: false, message: 'アカウントの削除に失敗しました' };
    }
  };

  return {
    user: authState.user,
    loading: authState.loading,
    error: authState.error,
    login,
    signup,
    logout,
    updateUser,
    deleteUser,
    checkAuthStatus
  };
};
