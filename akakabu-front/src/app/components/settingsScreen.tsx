import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { api } from "../utils/apiClient";
import { getErrorMessage, logError, validateUsername } from "../utils/errorHandler";
import { supabase } from "../utils/supabaseClient";


export const SettingsScreen = () => {
  const navigate = useNavigate();
  const [token, setToken] = useState("");
  const [plan, setPlan] = useState("free");
  const [message, setMessage] = useState("");
  const [user_name, setUsername] = useState("");
  const [nameMessage, setNameMessage] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChangingUsername, setIsChangingUsername] = useState(false);
  const [isDeletingAccount, setIsDeletingAccount] = useState(false);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
  const [deleteMessage, setDeleteMessage] = useState("");
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // 認証状態をチェック
  useEffect(() => {
    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      setIsAuthenticated(!!session);
    };
    checkAuth();
  }, []);

  // 未認証の場合はログイン画面にリダイレクト
  if (!isAuthenticated) {
    return (
      <div className="max-w-md mx-auto space-y-6">
        <div className="text-center py-8">
          <p className="text-gray-600 mb-4">ログインが必要です</p>
          <button
            onClick={() => navigate('/login')}
            className="bg-blue-500 hover:bg-blue-600 text-white font-semibold py-2 px-4 rounded"
          >
            ログイン画面に移動
          </button>
        </div>
      </div>
    );
  }

  // リフレッシュトークン登録
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    // 認証状態を確認
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      setMessage("ログインが必要です。ログイン画面に移動してください。");
      return;
    }

    console.log('User session:', {
      hasSession: !!session,
      hasAccessToken: !!session.access_token,
      userId: session.user?.id
    });

    // バリデーション
    if (!token.trim()) {
      setMessage("リフレッシュトークンを入力してください。");
      return;
    }

    if (!plan) {
      setMessage("プランを選択してください。");
      return;
    }

    console.log('Starting API call...');
    setIsSubmitting(true);
    setMessage("");

    try {
      console.log('Calling api.post with:', { refresh_token: token, plan });
      const result = await api.post('/api/jquants/register', { 
        refresh_token: token, 
        plan 
      }, { 
        timeout: 10000 // 10秒タイムアウト
      });
      
      console.log('API call successful:', result);
      setMessage("保存成功！");
      setToken(""); // 成功後にトークンをクリア
    } catch (error) {
      console.error('API Error:', error);
      const errorMessage = getErrorMessage(error);
      setMessage(`保存失敗: ${errorMessage}`);
      logError('J-Quants登録', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ユーザー名変更
  const handleChangeUsername = async () => {
    // バリデーション
    if (!user_name.trim()) {
      setNameMessage("ユーザー名を入力してください。");
      return;
    }

    const usernameValidation = validateUsername(user_name);
    if (!usernameValidation.isValid) {
      setNameMessage(usernameValidation.message);
      return;
    }

    setIsChangingUsername(true);
    setNameMessage("");

    try {
      await api.patch('/api/users', { 
        user_name: user_name.trim() 
      }, { 
        timeout: 10000
      });

      setNameMessage("ユーザー名を変更しました。");
      setUsername(""); // 成功後にフィールドをクリア
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setNameMessage(`変更に失敗しました: ${errorMessage}`);
      logError('ユーザー名変更', error);
    } finally {
      setIsChangingUsername(false);
    }
  };

  // 退会機能
  const handleDeleteAccount = async () => {
    setIsDeletingAccount(true);
    setDeleteMessage("");

    try {
      await api.delete('/api/users', { 
        timeout: 15000 // 退会処理は少し長めのタイムアウト
      });

      setDeleteMessage("退会しました。ご利用ありがとうございました。");
      // React Routerを使って遷移
      navigate("/");
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setDeleteMessage(`退会処理に失敗しました: ${errorMessage}`);
      logError('アカウント削除', error);
    } finally {
      setIsDeletingAccount(false);
    }
  };

  return (
    <div className="max-w-md mx-auto space-y-6">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label htmlFor="token" className="block text-sm font-medium text-gray-700 mb-1">
            リフレッシュトークン
          </label>
          <input
            id="token"
            type="text"
            placeholder="リフレッシュトークン"
            value={token}
            onChange={(e) => setToken(e.target.value)}
            required
            disabled={isSubmitting}
            className="w-full bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>
        <div>
          <label htmlFor="plan" className="block text-sm font-medium text-gray-700 mb-1">
            プラン
          </label>
          <select 
            id="plan"
            value={plan} 
            onChange={(e) => setPlan(e.target.value)}
            disabled={isSubmitting}
            className="w-full bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          >
            <option value="free">無料</option>
            <option value="pro_light">Proライト</option>
            <option value="pro_standard">Proスタンダード</option>
            <option value="pro_advanced">Proアドバンス</option>
          </select>
        </div>
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-white hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isSubmitting ? "保存中..." : "保存"}
        </button>
        {message && (
          <p className={`text-sm ${message.includes('成功') ? 'text-green-600' : 'text-red-600'}`}>
            {message}
          </p>
        )}
        <p className="text-sm text-gray-600">
          まだj-quantsに登録していない方は
          <a href="https://jpx-jquants.com/?lang=ja" target="_blank" rel="noopener noreferrer" className="text-blue-700 hover:underline ml-1">
            こちら
          </a>
        </p>
      </form>
      
      <div className="border-t pt-6">
        <h2 className="font-semibold text-lg mb-4">ユーザー名の変更</h2>
        <div className="space-y-3">
          <input
            type="text"
            placeholder="新しいユーザー名"
            value={user_name}
            onChange={(e) => setUsername(e.target.value)}
            disabled={isChangingUsername}
            className="w-full bg-white border rounded px-3 py-2 focus:outline-none focus:ring-2 focus:ring-green-500 disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
          <button
            type="button"
            onClick={handleChangeUsername}
            disabled={isChangingUsername}
            className="w-full bg-white hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
          >
            {isChangingUsername ? "変更中..." : "変更"}
          </button>
          {nameMessage && (
            <p className={`text-sm ${nameMessage.includes('変更しました') ? 'text-green-600' : 'text-red-600'}`}>
              {nameMessage}
            </p>
          )}
        </div>
      </div>
      
      <div className="border-t pt-6">
        <h2 className="font-semibold text-red-600 text-lg mb-4">アカウント退会</h2>
        {!showDeleteConfirm ? (
          <button
            type="button"
            onClick={() => setShowDeleteConfirm(true)}
            className="w-full bg-white hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded transition-colors"
          >
            退会する
          </button>
        ) : (
          <div className="space-y-3">
            <p className="text-sm text-red-600">本当に退会しますか？この操作は取り消せません。</p>
            <div className="flex gap-2">
              <button
                type="button"
                onClick={handleDeleteAccount}
                disabled={isDeletingAccount}
                className="flex-1 bg-red-500 hover:bg-red-600 text-white font-semibold py-2 px-4 border border-red-500 hover:border-transparent rounded transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
              >
                {isDeletingAccount ? "退会処理中..." : "退会する"}
              </button>
              <button
                type="button"
                onClick={() => setShowDeleteConfirm(false)}
                className="flex-1 bg-gray-500 hover:bg-gray-600 text-white font-semibold py-2 px-4 border border-gray-500 hover:border-transparent rounded transition-colors"
              >
                キャンセル
              </button>
            </div>
            {deleteMessage && (
              <p className={`text-sm ${deleteMessage.includes('退会しました') ? 'text-green-600' : 'text-red-600'}`}>
                {deleteMessage}
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
};