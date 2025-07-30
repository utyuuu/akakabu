import React from "react";
import { useAuth } from "../hooks/useAuth";

export const DividendScreen = () => {
  const { user } = useAuth();

  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* 配当情報の表示エリア */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">配当情報</h2>
        <div className="text-center py-8 text-gray-500">
          <p>配当情報の表示機能は準備中です</p>
          <p className="text-sm mt-2">お気に入りに追加した株式の配当情報がここに表示されます</p>
        </div>
      </div>
    </div>
  );
};
