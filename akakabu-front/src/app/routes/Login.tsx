import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import useAuth from "./../hooks/useAuth";

const Login = () => {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [error, setError] = useState<string>("");

  const apiBaseUrl = import.meta.env.VITE_API_URL;

  // メールアドレスの正規表現
  const emailRegex =
    /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") await handleRegister();
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
  };

  const { user, load } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (!load && user) {
      navigate("/");
    }
  }, [load, user, navigate]);

  const handleRegister = async () => {
    // メールアドレスが正しい形式かチェック
    if (!emailRegex.test(email)) {
      setError("メールアドレスの形式が正しくありません");
      return;
    }
    if (password === "") {
      setError("パスワードを入力してください");
      return;
    }

    try {
      const response = await fetch(`${apiBaseUrl}/api/login`, {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        setError(errorData?.message || "ログインに失敗しました");
        return;
      }
      const data = await response.json();
      console.log("ログイン成功:", data);
      navigate("/");
    } catch (err) {
      console.error("ログイン時のエラー:", err);
      setError("ネットワークエラーが発生しました");
    }
  };

  return (
    <div className="px-30 bg-white">
      <h2 className="text-center">ログイン</h2>
      <p className="text-center text-gray-700">メールアドレス</p>
      <input
        type="text"
        name="email"
        value={email}
        onChange={handleChange}
        placeholder="メールアドレスを入力してください"
        className="placeholder-opacity-50 mx-auto w-full border-b py-1 px-4 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none"
      />
      <p className="text-center text-gray-700">パスワード</p>
      <input
        type="password"
        name="password"
        value={password}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="パスワードを入力してください"
        className="placeholder-opacity-50 mx-auto w-full border-b py-1 px-4 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none"
      />
      <button
        onClick={handleRegister}
        className="block mx-auto bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
      >
        ログイン
      </button>
      {error && <p className="text-center text-red-500">{error}</p>}
      <p>
        まだ登録がお済みでない方は{" "}
        <a href="http://localhost:3001/signin" className="text-blue-700">
          こちら
        </a>
      </p>
    </div>
  );
};

export default Login;
