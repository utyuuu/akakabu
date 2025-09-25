import { supabase, User } from '../utils/supabaseClient';
import { getErrorMessage, logError } from '../utils/errorHandler';

export class AuthService {
  // サインアップ
  static async signUp(email: string, password: string, user_name: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // Supabaseでサインアップ
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            user_name: user_name
          }
        }
      });

      if (authError) {
        logError('Supabase signup auth error', authError);
        return {
          success: false,
          message: authError.message || 'サインアップに失敗しました'
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'ユーザーの作成に失敗しました'
        };
      }

      // ユーザー情報はトリガーで自動作成されるため、ここでは何もしない
      // 必要に応じて追加のプロフィール情報を更新

      return {
        success: true,
        message: 'メール確認が必要です',
        user: {
          id: authData.user.id,
          user_name: user_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        }
      };

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('Signup error', error);
      return {
        success: false,
        message: `サインアップエラー: ${errorMessage}`
      };
    }
  }

  // ログイン
  static async signIn(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (authError) {
        logError('Supabase signin auth error', authError);
        return {
          success: false,
          message: authError.message || 'ログインに失敗しました'
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'ユーザーが見つかりません'
        };
      }

      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      if (userError) {
        logError('User data fetch error', userError);
        return {
          success: false,
          message: 'ユーザー情報の取得に失敗しました'
        };
      }

      return {
        success: true,
        message: 'ログイン成功',
        user: userData as User
      };

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('Signin error', error);
      return {
        success: false,
        message: `ログインエラー: ${errorMessage}`
      };
    }
  }

  // ログアウト
  static async signOut(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        logError('Signout error', error);
        return {
          success: false,
          message: 'ログアウトに失敗しました'
        };
      }

      return {
        success: true,
        message: 'ログアウトしました'
      };

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('Signout error', error);
      return {
        success: false,
        message: `ログアウトエラー: ${errorMessage}`
      };
    }
  }

  // 現在のユーザーを取得
  static async getCurrentUser(): Promise<{ success: boolean; user?: User; message?: string }> {
    try {
      const { data: { user }, error } = await supabase.auth.getUser();

      if (error || !user) {
        return {
          success: false,
          message: 'ユーザーが見つかりません'
        };
      }

      // ユーザー情報を取得
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', user.id)
        .single();

      if (userError) {
        logError('Current user fetch error', userError);
        
        // フォールバック: usersテーブルにデータがない場合は手動で作成
        if (userError.code === 'PGRST116') {
          console.log('Users table data not found, creating fallback user data');
          
          const fallbackUser: User = {
            id: user.id,
            user_name: user.user_metadata?.user_name || 'User',
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          };
          
          return {
            success: true,
            user: fallbackUser
          };
        }
        
        return {
          success: false,
          message: 'ユーザー情報の取得に失敗しました'
        };
      }

      return {
        success: true,
        user: userData as User
      };

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('Get current user error', error);
      return {
        success: false,
        message: `ユーザー取得エラー: ${errorMessage}`
      };
    }
  }

  // セッション状態を監視
  static onAuthStateChange(callback: (user: User | null) => void) {
    return supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        // ユーザー情報を取得
        const { data: userData } = await supabase
          .from('users')
          .select('*')
          .eq('id', session.user.id)
          .single();

        callback(userData as User);
      } else if (event === 'SIGNED_OUT') {
        callback(null);
      }
    });
  }

  // ユーザー情報更新
  static async updateUser(userId: string, updates: Partial<User>): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      const { data, error } = await supabase
        .from('users')
        .update({
          ...updates,
          updated_at: new Date().toISOString()
        })
        .eq('id', userId)
        .select()
        .single();

      if (error) {
        logError('Update user error', error);
        return {
          success: false,
          message: 'ユーザー情報の更新に失敗しました'
        };
      }

      return {
        success: true,
        message: 'ユーザー情報を更新しました',
        user: data as User
      };

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('Update user error', error);
      return {
        success: false,
        message: `ユーザー更新エラー: ${errorMessage}`
      };
    }
  }

  // アカウント削除
  static async deleteUser(userId: string): Promise<{ success: boolean; message: string }> {
    try {
      // ユーザーデータを削除
      const { error: deleteError } = await supabase
        .from('users')
        .delete()
        .eq('id', userId);

      if (deleteError) {
        logError('Delete user error', deleteError);
        return {
          success: false,
          message: 'ユーザーデータの削除に失敗しました'
        };
      }

      // Supabase認証からも削除
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

      if (authDeleteError) {
        logError('Delete auth user error', authDeleteError);
        // 認証削除に失敗しても、データは削除されているので成功とする
        console.warn('Auth user deletion failed, but user data was deleted');
      }

      return {
        success: true,
        message: 'アカウントを削除しました'
      };

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      logError('Delete user error', error);
      return {
        success: false,
        message: `アカウント削除エラー: ${errorMessage}`
      };
    }
  }
} 