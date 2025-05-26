import React, { useState } from "react";
import SearchScreen from "../components/searchScreen";
import DividendScreen from "../components/dividendScreen";
import AssetsScreen from "../components/assetsScreen";
import SettingsScreen from "../components/settingsScreen";

const Home = () => {
  const [activeTab, setActiveTab] = useState("search");
  return (
    <div>
      <div className="w-full flex justify-between absolute top-10 left-0">
        <button
          onClick={() => setActiveTab("search")}
          className={`border text-center w-1/4 ${
            activeTab === "search" ? "bg-green-100 text-black" : "bg-white"
          }`}
        >
          🔍 検索
        </button>
        <button
          onClick={() => setActiveTab("dividend")}
          className={`border text-center w-1/4 ${activeTab === "dividend" ? "bg-green-100 text-black" : "bg-white"}`}
        >
          💰 配当情報(J-Qunatsプランによる)
        </button>
        <button
          onClick={() => setActiveTab("assets")}
          className={`border text-center w-1/4 ${activeTab === "assets" ? "bg-green-100 text-black" : "bg-white"}`}
        >
          📊 資産情報
        </button>
        <button
          onClick={() => setActiveTab("settings")}
          className={`border text-center w-1/4 ${activeTab === "settings" ? "bg-green-100 text-blag" : "bg-white"}`}
        >
          ⚙ 設定
        </button>
      </div>
      <div>
        {activeTab === "search" && <SearchScreen />}
        {activeTab === "dividend" && <DividendScreen />}
        {activeTab === "assets" && <AssetsScreen />}
        {activeTab === "settings" && <SettingsScreen userId={""} />}
      </div>
    </div>
  );
};

export default Home;
