import React, { useState } from "react";
import axios from "axios";

const SettingsScreen = ({ userId }: { userId: string }) => {
  const [token, setToken] = useState("");
  const [plan, setPlan] = useState("free");
  const [message, setMessage] = useState("");
  const [user_name, setUsername] = useState("");
  const [nameMessage, setNameMessage] = useState("");

  const apiBaseUrl = import.meta.env.VITE_API_URL;

  // リフレッシュトークン登録
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await axios.post(
        `${apiBaseUrl}/api/jquants/register`,
        { refresh_token: token, plan },
        { withCredentials: true }
      );
      setMessage("保存成功！");
    } catch (err) {
      setMessage("保存失敗");
    }
  };

  // ユーザー名変更
  const handleChangeUsername = async () => {
    try {
      await axios.patch(
        `${apiBaseUrl}/api/user`,
        { user_name },
        { withCredentials: true }
      );
      setNameMessage("ユーザー名を変更しました。");
    } catch (err) {
      setNameMessage("変更に失敗しました。");
    }
  };

  // 退会機能
  const handleDeleteAccount = async () => {
    const confirmed = window.confirm(
      "本当に退会しますか？この操作は取り消せません。"
    );
    if (!confirmed) return;

    try {
      await axios.delete(`${apiBaseUrl}/api/user`, {
        withCredentials: true,
      });
      alert("退会しました。ご利用ありがとうございました。");
      // ログアウトやトップページへの遷移（例: window.location.href = "/"）
    } catch (err) {
      alert("退会処理に失敗しました。");
    }
  };

  return (
    <div>
      <form onSubmit={handleSubmit}>
        <input
          type="text"
          placeholder="リフレッシュトークン"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          required
          className="bg-white border rounded"
        />
        <select value={plan} onChange={(e) => setPlan(e.target.value)} className="bg-white">
          <option value="free">無料</option>
          <option value="pro_light">Proライト</option>
          <option value="pro_standard">Proスタンダード</option>
          <option value="pro_advanced">Proアドバンス</option>
        </select>
        <button
          type="submit"
          className=" bg-white hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
          保存
        </button>
        <p>{message}</p>
        <p>
          まだj-quantsに登録していない方は
          <a href="https://jpx-jquants.com/?lang=ja" className="text-blue-700">
            こちら
          </a>
        </p>
      </form>
      <div className="mt-6">
        <h2 className="font-semibold">ユーザー名の変更</h2>
        <input
          type="text"
          placeholder="新しいユーザー名"
          value={user_name}
          onChange={(e) => setUsername(e.target.value)}
          className="bg-white"
        />
        <button
          type="button"
          onClick={handleChangeUsername}
          className="ml-2 bg-white hover:bg-green-500 text-green-700 font-semibold hover:text-white py-2 px-4 border border-green-500 hover:border-transparent rounded"
        >
          変更
        </button>
        <p>{nameMessage}</p>
      </div>
      <div className="mt-6">
        <h2 className="font-semibold text-red-600">アカウント退会</h2>
        <button
          type="button"
          onClick={handleDeleteAccount}
          className="bg-white hover:bg-red-500 text-red-700 font-semibold hover:text-white py-2 px-4 border border-red-500 hover:border-transparent rounded"
        >
          退会する
        </button>
      </div>
    </div>
  );
};

export default SettingsScreen;
