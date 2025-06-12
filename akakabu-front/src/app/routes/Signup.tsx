import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const Signup = () => {
  const [email, setEmail] = useState<string>("");
  const [user, setUser] = useState<string>("");
  const [password1, setPassword1] = useState<string>("");
  const [password2, setPassword2] = useState<string>("");
  const [error, setError] = useState<string>("");

  const apiBaseUrl = import.meta.env.VITE_API_URL;

  // メールアドレスの正規表現
  const emailRegex =
    /^[a-zA-Z0-9_.+-]+@([a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*\.)+[a-zA-Z]{2,}$/;

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") return handleRegister();
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
  };

  const navigate = useNavigate();
  const handleRegister = async () => {
    setError("");
    // メールアドレスが正しい形式かチェック
    if (!emailRegex.test(email)) {
      setError("メールアドレスの形式が正しくありません");
      return;
    }
    // ユーザー名が空でないかチェック
    if (user === "") {
      setError("ユーザー名を入力してください");
      return;
    }
    // パスワードが一致するかチェック
    if (password1.trim() === "" || password2.trim() === "") {
      setError("パスワードを入力してください");
      return;
    }
    if (password1.trim() !== password2.trim()) {
      setError("パスワードが一致していません");
      return;
    }

    const pyload = {
      email: email,
      user_name: user,
      password: password1,
    };

    const response = await fetch(`${apiBaseUrl}/api/signup`, {
      method: "POST",
      credentials: "include",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(pyload),
    });

    const result = await response.json();

    if (!response.ok) {
      setError(result.message || "登録に失敗しました");
      return;
    }

    // 登録成功
    navigate("/");
  };

  return (
    <div className="bg-white w-full max-w-lg mx-auto px-10">
      <h2 className="text-center text-gray-700">サインイン</h2>
      <p className="text-center text-gray-700">メールアドレス</p>
      <input
        type="text"
        name="email"
        value={email}
        onChange={handleChange}
        placeholder="メールアドレスを入力してください"
        className="text-center mx-auto w-full border-b py-1 px-4 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none"
      />

      <p className="text-center text-gray-700">ユーザー名</p>
      <input
        type="text"
        name="user"
        value={user}
        onChange={handleChange}
        placeholder="ユーザー名を入力してください"
        className="text-center placeholder-opacity-50 mx-auto w-full border-b py-1 px-4 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none"
      />

      <p className="text-center text-gray-700">パスワード</p>
      <input
        type="password"
        name="password1"
        value={password1}
        onChange={handleChange}
        placeholder="パスワードを入力してください"
        className="text-center placeholder-opacity-50 mx-auto w-full border-b py-1 px-4 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none"
      />

      <p className="text-center text-gray-700">パスワード(確認用)</p>
      <input
        type="password"
        name="password2"
        value={password2}
        onChange={handleChange}
        onKeyDown={handleKeyDown}
        placeholder="もう一度パスワードを入力してください"
        className="text-center placeholder-opacity-50 mx-auto w-full border-b py-1 placeholder-gray-500 focus:border-b-2 focus:border-blue-500 focus:outline-none"
      />

      <button
        onClick={handleRegister}
        className="block mx-auto bg-transparent hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
      >
        登録
      </button>
      {error && <p className="text-center text-red-500">{error}</p>}
      <p>
        既に登録がお済みの方は{" "}
       <span
         onClick={() => navigate("/Login")}
          className="terxt-center text-blue-700 cursor-pointer underline"
       >
          こちら
       </span>
      </p>
    </div>
  );
};

export default Signup;
