import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./../hooks/useAuth";

const Signup = () => {
  const [email, setEmail] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [password1, setPassword1] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [success, setSuccess] = useState<string>("");
  const [isSigningUp, setIsSigningUp] = useState(false);

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") handleRegister();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    switch (name) {
      case "email":
        setEmail(value);
        break;
      case "user":
        setUser(value);
        break;
      case "password1":
        setPassword1(value);
        break;
      case "password2":
        setPassword2(value);
        break;
      default:
        break;
    }
    // エラーメッセージをクリア
    if (error) setError("");
    if (success) setSuccess("");
  };

  const { user: authUser, loading } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!loading && authUser) {
      navigate("/");
    }
  }, [loading, authUser, navigate]);

  const { signup } = useAuth();

  const handleRegister = async () => {
    // バリデーション
    if (!email.trim() || !user.trim() || !password1 || !password2) {
      setError("すべての項目を入力してください。");
      return;
    }

    // メールアドレスの正規表現
    const emailRegex = /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email.trim())) {
      setError("メールアドレスの形式が正しくありません。");
      return;
    }

    if (password1.length < 8) {
      setError("パスワードは8文字以上で入力してください。");
      return;
    }

    if (password1 !== password2) {
      setError("パスワードが一致しません。");
      return;
    }

    setIsSigningUp(true);
    setError("");
    setSuccess("");

    // デバッグログ
    console.log('[Signup.tsx] Calling signup with:', {
      email: email.trim(),
      emailLength: email.trim().length,
      password: '***' + password1.slice(-2),
      passwordLength: password1.length,
      userName: user.trim(),
      userNameLength: user.trim().length
    });

    try {
      const result = await signup(email.trim(), password1, user.trim());

      if (result.success) {
        setSuccess("登録成功！メールを確認してください。");
        navigate("/login");
      } else {
        setError(result.message);
      }
    } catch (error) {
      setError("登録に失敗しました");
    } finally {
      setIsSigningUp(false);
    }
  };

  return (
    <div className="bg-white w-full max-w-lg mx-auto px-10">
      <h2 className="text-center text-gray-700 text-2xl font-bold mb-6">サインアップ</h2>
      
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
            disabled={isSigningUp}
            placeholder="メールアドレスを入力してください"
            className="w-full border-b py-2 px-4 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="user" className="block text-sm font-medium text-gray-700 mb-1">
            ユーザー名
          </label>
          <input
            id="user"
            type="text"
            name="user"
            value={user}
            onChange={handleChange}
            disabled={isSigningUp}
            placeholder="ユーザー名を入力してください"
            className="w-full border-b py-2 px-4 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="password1" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード
          </label>
          <input
            id="password1"
            type="password"
            name="password1"
            value={password1}
            onChange={handleChange}
            disabled={isSigningUp}
            placeholder="パスワードを入力してください（8文字以上）"
            className="w-full border-b py-2 px-4 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <div>
          <label htmlFor="password2" className="block text-sm font-medium text-gray-700 mb-1">
            パスワード（確認用）
          </label>
          <input
            id="password2"
            type="password"
            name="password2"
            value={password2}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={isSigningUp}
            placeholder="もう一度パスワードを入力してください"
            className="w-full border-b py-2 px-4 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none disabled:bg-gray-100 disabled:cursor-not-allowed"
          />
        </div>

        <button
          onClick={handleRegister}
          disabled={isSigningUp}
          className="w-full bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded transition-colors disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed"
        >
          {isSigningUp ? "登録中..." : "登録"}
        </button>

        {error && (
          <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="p-3 bg-green-100 border border-green-400 text-green-700 rounded text-sm">
            {success}
          </div>
        )}

        <div className="text-center">
          <p className="text-sm text-gray-600">
            既にアカウントをお持ちですか？
            <button
              onClick={() => navigate("/login")}
              className="text-blue-600 hover:underline ml-1"
            >
              ログイン
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Signup;
