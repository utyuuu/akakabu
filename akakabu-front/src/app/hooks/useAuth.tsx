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
    
    // 認証状態の変更を監視
    const { data: { subscription } } = AuthService.onAuthStateChange((user) => {
      setAuthState({
        user,
        loading: false,
        error: null
      });
    });

    return () => subscription.unsubscribe();
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
        setAuthState({
          user: null,
          loading: false,
          error: result.message || null
        });
      }
    } catch (error) {
      setAuthState({
        user: null,
        loading: false,
        error: '認証状態の確認に失敗しました'
      });
    }
  };

  const login = async (email: string, password: string): Promise<{ success: boolean; message: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.signIn(email, password);
      
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
      setAuthState(prev => ({ ...prev, loading: false, error: 'ログインに失敗しました' }));
      return { success: false, message: 'ログインに失敗しました' };
    }
  };

  const signup = async (email: string, password: string, user_name: string): Promise<{ success: boolean; message: string }> => {
    try {
      setAuthState(prev => ({ ...prev, loading: true, error: null }));
      
      const result = await AuthService.signUp(email, password, user_name);
      
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
