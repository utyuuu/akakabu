import React, { useState } from "react";
import { Navigate } from "react-router-dom";
import { SearchScreen } from "../components/searchScreen";
import { DividendScreen } from "../components/dividendScreen";
import { AssetsScreen } from "../components/assetsScreen";
import { SettingsScreen } from "../components/settingsScreen";
import { useAuth } from "../hooks/useAuth";

type TabType = "search" | "dividend" | "assets" | "settings";

const Home: React.FC = () => {
  const [activeTab, setActiveTab] = useState<TabType>("search");
  const { user, loading } = useAuth();

  // ローディング中
  if (loading) {
    return <div className="flex justify-center items-center h-screen">読み込み中...</div>;
  }

  // 未認証時はログイン画面にリダイレクト
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="w-full flex flex-wrap justify-between absolute top-10 left-0 px-4">
        <button
          onClick={() => setActiveTab("search")}
          className={`border text-center flex-1 min-w-0 px-2 py-3 text-sm sm:text-base ${
            activeTab === "search" ? "bg-green-100 text-black" : "bg-white"
          }`}
          aria-label="検索タブ"
          role="tab"
          aria-selected={activeTab === "search"}
        >
          🔍 検索
        </button>
        <button
          onClick={() => setActiveTab("dividend")}
          className={`border text-center flex-1 min-w-0 px-2 py-3 text-sm sm:text-base ${activeTab === "dividend" ? "bg-green-100 text-black" : "bg-white"}`}
          aria-label="配当情報タブ"
          role="tab"
          aria-selected={activeTab === "dividend"}
        >
          💰 配当情報(J-Qunatsプランによる)
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`border text-center flex-1 min-w-0 px-2 py-3 text-sm sm:text-base ${activeTab === "assets" ? "bg-green-100 text-black" : "bg-white"}`}
          aria-label="資産情報タブ"
          role="tab"
          aria-selected={activeTab === "assets"}
        >
          📊 資産情報
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`border text-center flex-1 min-w-0 px-2 py-3 text-sm sm:text-base ${activeTab === "settings" ? "bg-green-100 text-black" : "bg-white"}`}
          aria-label="設定タブ"
          role="tab"
          aria-selected={activeTab === "settings"}
        >
          ⚙ 設定
        </button>
      </div>
      <div className="pt-24 px-4">
        {activeTab === "search" && <SearchScreen />}
        {activeTab === "dividend" && <DividendScreen />}
        {activeTab === "assets" && <AssetsScreen />}
        {activeTab === "settings" && <SettingsScreen />}
      </div>
    </div>
  );
};

export default Home;
