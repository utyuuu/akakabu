import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase, Favorite } from "../utils/supabaseClient";

export const AssetsScreen = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [total, setTotal] = useState<number>(0);

  useEffect(() => {
    if (!user) return;
    const fetchFavorites = async () => {
      const { data } = await supabase
        .from("favorites")
        .select("*")
        .eq("user_id", user.id);
      if (data) {
        setFavorites(data);
        setTotal(data.reduce((sum, fav) => sum + (fav.close_price || 0), 0));
      }
    };
    fetchFavorites();
  }, [user]);

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* ユーザー情報表示 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">資産情報</h1>
        <div className="text-sm text-blue-700">
          <strong>ユーザー:</strong> {user?.user_name} さん
        </div>
      </div>

      {/* 資産情報の表示エリア */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">保有株式</h2>
        <div className="mb-4">
          <span className="mr-6">お気に入り株数: <strong>{favorites.length}</strong> 件</span>
          <span>総資産: <strong>¥{total.toLocaleString()}</strong></span>
        </div>
        {favorites.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>お気に入りに追加した株式がありません</p>
          </div>
        ) : (
          <ul className="divide-y">
            {favorites.map(fav => (
              <li key={fav.id} className="py-3 flex justify-between items-center">
                <div>
                  <span className="font-semibold">{fav.company_name}</span> <span className="text-gray-500">({fav.stock_code})</span>
                </div>
                <div>
                  <span>¥{fav.close_price?.toLocaleString() || "N/A"}</span>
                  {total > 0 && fav.close_price ? (
                    <span className="ml-3 text-sm text-blue-700">({((fav.close_price / total) * 100).toFixed(1)}%)</span>
                  ) : null}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};
