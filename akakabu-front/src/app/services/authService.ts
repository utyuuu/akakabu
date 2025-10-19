import { supabase, User } from '../utils/supabaseClient';

export class AuthService {
  // Supabaseエラーメッセージを日本語化
  private static translateAuthError(errorMessage: string): string {
    const errorMap: Record<string, string> = {
      'Password should be at least 6 characters': 'パスワードは6文字以上で入力してください',
      'User already registered': 'このメールアドレスは既に登録されています',
      'Invalid email': 'メールアドレスの形式が正しくありません',
      'Email not confirmed': 'メールアドレスが確認されていません',
      'Invalid login credentials': 'メールアドレスまたはパスワードが正しくありません',
    };

    for (const [key, value] of Object.entries(errorMap)) {
      if (errorMessage.includes(key)) {
        return value;
      }
    }
    return errorMessage;
  }

  // サインアップ
  static async signUp(email: string, password: string, user_name: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // デバッグログ
      console.log('[authService.ts] signUp called with:', {
        email,
        emailLength: email.length,
        password: '***' + password.slice(-2),
        passwordLength: password.length,
        user_name,
        userNameLength: user_name.length
      });

      console.log('[authService.ts] About to call supabase.auth.signUp');
      
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

      console.log('[authService.ts] signUp completed, result:', {
        hasUser: !!authData?.user,
        userId: authData?.user?.id,
        hasError: !!authError
      });

      if (authError) {
        console.error('[authService.ts] Supabase signup auth error:', authError);
        const translatedMessage = this.translateAuthError(authError.message);
        return {
          success: false,
          message: translatedMessage || 'サインアップに失敗しました'
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'ユーザーの作成に失敗しました'
        };
      }

      console.log('[authService.ts] Inserting user data into database for id:', authData.user.id);
      
      const {error: userInsertError} = await supabase
        .from('users')
        .insert({
          id: authData.user.id,
          user_name: user_name,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        });

      if (userInsertError) {
        console.error('[authService.ts] User insert error:', userInsertError);
        return {
          success: false,
          message: 'ユーザーの作成に失敗しました'
        };
      } else {
        console.log('User inserted successfully');
      }


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
      console.error('[authService.ts] Signup error caught:', error);
      console.error('[authService.ts] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        message: `サインアップエラー: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // ログイン
  static async signIn(email: string, password: string): Promise<{ success: boolean; message: string; user?: User }> {
    try {
      // デバッグログ
      console.log('[authService.ts] signIn called with:', {
        email,
        emailLength: email.length,
        password: '***' + password.slice(-2),
        passwordLength: password.length
      });

      console.log('[authService.ts] About to call supabase.auth.signInWithPassword');
      
      const signInPromise = supabase.auth.signInWithPassword({
        email,
        password
      });
      
      console.log('[authService.ts] signInWithPassword promise created:', signInPromise);
      
      const { data: authData, error: authError } = await signInPromise;
      
      console.log("[authService.ts] signIn completed, authData:", {
        hasUser: !!authData?.user,
        userId: authData?.user?.id
      });
      console.log("[authService.ts] signIn error:", authError);

      if (authError) {
        console.error('Supabase signin auth error', authError);
        const translatedMessage = this.translateAuthError(authError.message);
        return {
          success: false,
          message: translatedMessage || 'ログインに失敗しました'
        };
      }

      if (!authData.user) {
        return {
          success: false,
          message: 'ユーザーが見つかりません'
        };
      }

      // ユーザー情報を取得
      console.log('[authService.ts] Fetching user data from database for id:', authData.user.id);
      
      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('*')
        .eq('id', authData.user.id)
        .single();

      console.log('[authService.ts] User data fetch result:', {
        hasUserData: !!userData,
        hasError: !!userError
      });

      if (userError) {
        console.error('[authService.ts] User data fetch error:', userError);
        
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
      console.error('[authService.ts] Signin error caught:', error);
      console.error('[authService.ts] Error details:', {
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined
      });
      return {
        success: false,
        message: `ログインエラー: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }

  // ログアウト
  static async signOut(): Promise<{ success: boolean; message: string }> {
    try {
      const { error } = await supabase.auth.signOut();

      if (error) {
        console.error('Signout error', error);
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
      console.error('Signout error', error);
      return {
        success: false,
        message: `ログアウトエラー: ${error instanceof Error ? error.message : 'Unknown error'}`
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
        console.error('Current user fetch error', userError);
        
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
      console.error('Get current user error', error);
      return {
        success: false,
        message: `ユーザー取得エラー: ${error instanceof Error ? error.message : 'Unknown error'}`
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
        console.error('Update user error', error);
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
      console.error('Update user error', error);
      return {
        success: false,
        message: `ユーザー更新エラー: ${error instanceof Error ? error.message : 'Unknown error'}`
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
        console.error('Delete user error', deleteError);
        return {
          success: false,
          message: 'ユーザーデータの削除に失敗しました'
        };
      }

      // Supabase認証からも削除
      const { error: authDeleteError } = await supabase.auth.admin.deleteUser(userId);

      if (authDeleteError) {
        console.error('Delete auth user error', authDeleteError);
        // 認証削除に失敗しても、データは削除されているので成功とする
        console.warn('Auth user deletion failed, but user data was deleted');
      }

      return {
        success: true,
        message: 'アカウントを削除しました'
      };

    } catch (error) {
      console.error('Delete user error', error);
      return {
        success: false,
        message: `アカウント削除エラー: ${error instanceof Error ? error.message : 'Unknown error'}`
      };
    }
  }
} 