import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase, Favorite } from "../utils/supabaseClient";

// 資産情報の型定義
interface AssetInfo {
  stock_code: string;
  company_name: string;
  shares_hold: number;
  close_price: number;
  total_value: number; // 保有株式数 × 株価
  percentage: number; // 総資産に対する割合
}

export const AssetsScreen = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [assetInfos, setAssetInfos] = useState<AssetInfo[]>([]);
  const [totalAssets, setTotalAssets] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  useEffect(() => {
    if (!user) return;
    
    const fetchAssets = async () => {
      setLoading(true);
      setError("");

      try {
        const { data, error: fetchError } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id);

        if (fetchError) {
          console.error("Favorites fetch error:", fetchError);
          setError("お気に入り株式の取得に失敗しました");
          return;
        }

        if (!data || data.length === 0) {
          setFavorites([]);
          setAssetInfos([]);
          setTotalAssets(0);
          return;
        }

        setFavorites(data);

        // 資産情報を計算
        const assets: AssetInfo[] = data
          .filter(fav => fav.close_price && fav.shares_hold) // 株価と保有株式数があるもののみ
          .map(fav => {
            const totalValue = (fav.close_price || 0) * fav.shares_hold;
            return {
              stock_code: fav.stock_code,
              company_name: fav.company_name,
              shares_hold: fav.shares_hold,
              close_price: fav.close_price || 0,
              total_value: totalValue,
              percentage: 0 // 後で計算
            };
          });

        // 総資産を計算
        const total = assets.reduce((sum, asset) => sum + asset.total_value, 0);
        setTotalAssets(total);

        // 各資産の割合を計算
        const assetsWithPercentage = assets.map(asset => ({
          ...asset,
          percentage: total > 0 ? (asset.total_value / total) * 100 : 0
        }));

        setAssetInfos(assetsWithPercentage);

      } catch (error) {
        console.error("Assets fetch error:", error);
        setError("資産情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchAssets();
  }, [user]);

  // 保有株式数の更新処理
  const handleSharesUpdate = async (favoriteId: string, newShares: number) => {
    if (newShares <= 0) {
      alert("保有株式数は1株以上で入力してください。");
      return;
    }

    try {
      const { error } = await supabase
        .from("favorites")
        .update({ shares_hold: newShares })
        .eq("id", favoriteId);

      if (error) {
        console.error("Shares update error:", error);
        alert("保有株式数の更新に失敗しました。");
        return;
      }

      // 画面を再読み込み
      window.location.reload();
    } catch (error) {
      console.error("Shares update error:", error);
      alert("保有株式数の更新に失敗しました。");
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-4">

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">資産情報を取得中...</p>
        </div>
      )}

      {/* 資産情報の表示エリア */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">保有株式</h2>
        
        {/* サマリー情報 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">保有銘柄数:</span>
              <span className="ml-2 font-semibold">{favorites.length} 銘柄</span>
            </div>
            <div>
              <span className="text-gray-600">総資産:</span>
              <span className="ml-2 font-semibold text-green-600">¥{totalAssets.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">総保有株式数:</span>
              <span className="ml-2 font-semibold text-blue-600">
                {favorites.reduce((sum, fav) => sum + fav.shares_hold, 0).toLocaleString()} 株
              </span>
            </div>
            <div>
              <span className="text-gray-600">平均株価:</span>
              <span className="ml-2 font-semibold">
                ¥{favorites.length > 0 
                  ? (favorites.reduce((sum, fav) => sum + (fav.close_price || 0), 0) / favorites.length).toLocaleString()
                  : "0"}
              </span>
            </div>
          </div>
        </div>

        {assetInfos.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>お気に入りに追加した株式がありません</p>
            <p className="text-sm mt-2">株式を検索して「お気に入り」に追加すると、資産情報が表示されます</p>
          </div>
        ) : (
          <div className="space-y-4">
            {assetInfos.map(asset => (
              <div key={asset.stock_code} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-lg">{asset.company_name}</h3>
                    <p className="text-gray-600 text-sm">{asset.stock_code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">保有株式数</p>
                    <p className="font-semibold">{asset.shares_hold.toLocaleString()} 株</p>
                  </div>
                </div>

                {/* 資産詳細情報 */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">株価:</span>
                    <span className="ml-2 font-semibold">¥{asset.close_price.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">保有資産:</span>
                    <span className="ml-2 font-semibold text-green-600">¥{asset.total_value.toLocaleString()}</span>
                  </div>
                  <div>
                    <span className="text-gray-600">資産割合:</span>
                    <span className="ml-2 font-semibold text-blue-600">{asset.percentage.toFixed(1)}%</span>
                  </div>
                  <div>
                    <span className="text-gray-600">1株当たり:</span>
                    <span className="ml-2 font-semibold">¥{asset.close_price.toLocaleString()}</span>
                  </div>
                </div>

                {/* 保有株式数更新ボタン */}
                <div className="mt-3 pt-3 border-t">
                  <button
                    onClick={() => {
                      const newShares = prompt(
                        `${asset.company_name}の保有株式数を入力してください:`,
                        asset.shares_hold.toString()
                      );
                      if (newShares && !isNaN(Number(newShares))) {
                        const favorite = favorites.find(fav => fav.stock_code === asset.stock_code);
                        if (favorite) {
                          handleSharesUpdate(favorite.id, Number(newShares));
                        }
                      }
                    }}
                    className="text-xs text-blue-600 hover:text-blue-800 underline"
                  >
                    保有株式数を更新
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};
