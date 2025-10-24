import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [isLoggingIn, setIsLoggingIn] = useState(false);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") await handleLogin();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "email":
        setEmail(value);
        break;
      case "password":
        setPassword(value);
        break;
      default:
        break;
    }
    // エラーメッセージをクリア
    if (error) setError("");
  };

  const { user, loading, login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log('[Login.tsx] useEffect triggered:', {
      loading,
      hasUser: !!user,
      userId: user?.id
    });
    
    if (!loading && user) {
      console.log('[Login.tsx] User authenticated, navigating to home');
      navigate("/");
    }
  }, [loading, user, navigate]);

  const handleLogin = async () => {
    // バリデーション
    if (!email.trim()) {
      setError("メールアドレスを入力してください。");
      return;
    }

    // メールアドレスの正規表現
    const emailRegex = /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) {
      setError("メールアドレスの形式が正しくありません。");
      return;
    }

    if (!password.trim()) {
      setError("パスワードを入力してください。");
      return;
    }

    if (password.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }

    setIsLoggingIn(true);
    setError("");

    // デバッグログ
    console.log('[Login.tsx] Calling login with:', {
      email: email.trim(),
      emailLength: email.trim().length,
      password: '***' + password.slice(-2),
      passwordLength: password.length
    });

    try {
      const result = await login(email.trim(), password);
      
      console.log('[Login.tsx] login result:', {
        success: result.success,
        message: result.message
      });

      if (result.success) {
        console.log('[Login.tsx] Login success, navigating to home');
        // useEffectに依存せず、直接navigateを呼ぶ
        setTimeout(() => {
          console.log('[Login.tsx] Executing navigate after timeout');
          navigate("/");
        }, 100);
      } else {
        console.log('[Login.tsx] Login failed:', result.message);
        setError(result.message);
      }
    } catch (error) {
      setError("ログインに失敗しました");
    } finally {
      setIsLoggingIn(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-lg mx-auto px-10">
      <h2 className="text-center text-2xl font-bold mb-6">ログイン</h2>
      
      <div className="space-y-4">
        <div>
          <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
            メールアドレス
          </label>
          <input
            id="email"
            type="email"
            name="email"
            value={email}
            onChange={handleChange}
            disabled={isLoggingIn}
            placeholder="メールアドレスを入力してください"
            className="w-full border-b py-2 px-4 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            id="password"
            type="password"
            name="password"
            value={password}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isLoggingIn}
            placeholder="パスワードを入力してください"
            className="w-full border-b py-2 px-4 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleLogin}
          disabled={isLoggingIn}
          className="w-full bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {isLoggingIn ? "ログイン中..." : "ログイン"}
        </button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        <p className="text-center text-sm text-gray-600">
          まだ登録がお済みでない方は{" "}
          <span
            onClick={() => navigate("/Signup")}
            className="text-blue-700 cursor-pointer underline hover:text-blue-800"
          >
            こちら
          </span>
        </p>
      </div>
    </div>
  );
};

export default Login;
