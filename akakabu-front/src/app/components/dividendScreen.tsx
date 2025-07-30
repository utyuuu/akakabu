import React, { useEffect, useState } from "react";
import { useAuth } from "../hooks/useAuth";
import { supabase, Favorite } from "../utils/supabaseClient";

// 配当情報の型定義
interface Dividend {
  stock_code: string;
  company_name: string;
  fiscal_year: number;
  dividend_type?: string;
  dividend_per_share?: number;
  source: string;
}

// 保有株式の配当情報の型定義
interface StockDividend {
  stock_code: string;
  company_name: string;
  shares_held: number; // 保有株式数
  close_price?: number;
  dividend_info: Dividend[];
  total_dividend: number; // 総配当額
  dividend_yield?: number; // 配当利回り
}

export const DividendScreen = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState<Favorite[]>([]);
  const [stockDividends, setStockDividends] = useState<StockDividend[]>([]);
  const [totalDividend, setTotalDividend] = useState<number>(0);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string>("");

  // お気に入り株式と配当情報を取得
  useEffect(() => {
    if (!user) return;
    
    const fetchDividendData = async () => {
      setLoading(true);
      setError("");

      try {
        // 1. お気に入り株式を取得
        const { data: favoritesData, error: favoritesError } = await supabase
          .from("favorites")
          .select("*")
          .eq("user_id", user.id);

        if (favoritesError) {
          console.error("Favorites fetch error:", favoritesError);
          setError("お気に入り株式の取得に失敗しました");
          return;
        }

        if (!favoritesData || favoritesData.length === 0) {
          setFavorites([]);
          setStockDividends([]);
          setTotalDividend(0);
          return;
        }

        setFavorites(favoritesData);

        // 2. 各株式の配当情報を取得
        const stockCodes = favoritesData.map(fav => fav.stock_code);
        const { data: dividendData, error: dividendError } = await supabase
          .from("dividend")
          .select("*")
          .in("stock_code", stockCodes);

        if (dividendError) {
          console.error("Dividend fetch error:", dividendError);
          setError("配当情報の取得に失敗しました");
          return;
        }

        // 3. 株式ごとに配当情報を整理
        const stockDividendMap = new Map<string, StockDividend>();

        favoritesData.forEach(favorite => {
          const dividends = dividendData?.filter(d => d.stock_code === favorite.stock_code) || [];
          
          // 保有株式数（仮の値、実際の保有数は別途管理が必要）
          const sharesHeld = 100; // 仮の保有株式数
          
          // 総配当額を計算
          const totalDividend = dividends.reduce((sum, div) => {
            return sum + ((div.dividend_per_share || 0) * sharesHeld);
          }, 0);

          // 配当利回りを計算
          const dividendYield = favorite.close_price && favorite.close_price > 0 
            ? (totalDividend / (favorite.close_price * sharesHeld)) * 100 
            : undefined;

          stockDividendMap.set(favorite.stock_code, {
            stock_code: favorite.stock_code,
            company_name: favorite.company_name,
            shares_held: sharesHeld,
            close_price: favorite.close_price,
            dividend_info: dividends,
            total_dividend: totalDividend,
            dividend_yield: dividendYield
          });
        });

        const stockDividendsArray = Array.from(stockDividendMap.values());
        setStockDividends(stockDividendsArray);

        // 4. 総配当額を計算
        const total = stockDividendsArray.reduce((sum, stock) => sum + stock.total_dividend, 0);
        setTotalDividend(total);

      } catch (error) {
        console.error("Dividend data fetch error:", error);
        setError("配当情報の取得に失敗しました");
      } finally {
        setLoading(false);
      }
    };

    fetchDividendData();
  }, [user]);

  // 保有株式数の入力処理（将来的な機能）
  const handleSharesUpdate = async (stockCode: string, shares: number) => {
    // TODO: 保有株式数を更新する処理
    console.log(`Updating shares for ${stockCode}: ${shares}`);
  };

  return (
    <div className="max-w-4xl mx-auto p-4">
      {/* ユーザー情報表示 */}
      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h1 className="text-2xl font-bold text-blue-800 mb-2">配当情報</h1>
        <div className="text-sm text-blue-700">
          <strong>ユーザー:</strong> {user?.user_name} さん
        </div>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* ローディング表示 */}
      {loading && (
        <div className="text-center py-8">
          <p className="text-gray-500">配当情報を取得中...</p>
        </div>
      )}

      {/* 配当情報の表示エリア */}
      <div className="bg-white border rounded-lg p-6 shadow-sm">
        <h2 className="text-xl font-semibold mb-4 text-gray-800">保有株式の配当情報</h2>
        
        {/* サマリー情報 */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-600">保有株式数:</span>
              <span className="ml-2 font-semibold">{favorites.length} 銘柄</span>
            </div>
            <div>
              <span className="text-gray-600">総配当額:</span>
              <span className="ml-2 font-semibold text-green-600">¥{totalDividend.toLocaleString()}</span>
            </div>
            <div>
              <span className="text-gray-600">平均配当利回り:</span>
              <span className="ml-2 font-semibold text-blue-600">
                {stockDividends.length > 0 
                  ? (stockDividends.reduce((sum, stock) => sum + (stock.dividend_yield || 0), 0) / stockDividends.length).toFixed(2)
                  : "0.00"}%
              </span>
            </div>
            <div>
              <span className="text-gray-600">配当情報あり:</span>
              <span className="ml-2 font-semibold">
                {stockDividends.filter(stock => stock.dividend_info.length > 0).length} 銘柄
              </span>
            </div>
          </div>
        </div>

        {stockDividends.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            <p>お気に入りに追加した株式がありません</p>
            <p className="text-sm mt-2">株式を検索して「お気に入り」に追加すると、配当情報が表示されます</p>
          </div>
        ) : (
          <div className="space-y-4">
            {stockDividends.map(stock => (
              <div key={stock.stock_code} className="border rounded-lg p-4">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <h3 className="font-semibold text-lg">{stock.company_name}</h3>
                    <p className="text-gray-600 text-sm">{stock.stock_code}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-sm text-gray-600">保有株式数</p>
                    <p className="font-semibold">{stock.shares_held.toLocaleString()} 株</p>
                  </div>
                </div>

                {/* 配当情報 */}
                {stock.dividend_info.length > 0 ? (
                  <div className="space-y-2">
                    <div className="flex justify-between items-center text-sm">
                      <span className="text-gray-600">配当情報:</span>
                      <div className="text-right">
                        <span className="text-green-600 font-semibold">
                          ¥{stock.total_dividend.toLocaleString()}
                        </span>
                        {stock.dividend_yield && (
                          <span className="ml-2 text-blue-600">
                            ({stock.dividend_yield.toFixed(2)}%)
                          </span>
                        )}
                      </div>
                    </div>
                    
                    <div className="bg-gray-50 rounded p-3">
                      <div className="grid grid-cols-3 gap-2 text-xs">
                        <div className="font-medium">決算期</div>
                        <div className="font-medium">配当種別</div>
                        <div className="font-medium">1株当たり配当</div>
                        {stock.dividend_info.map((dividend, index) => (
                          <React.Fragment key={index}>
                            <div>{dividend.fiscal_year}</div>
                            <div>{dividend.dividend_type || "通常配当"}</div>
                            <div>¥{dividend.dividend_per_share?.toLocaleString() || "N/A"}</div>
                          </React.Fragment>
                        ))}
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-4 text-gray-500">
                    <p className="text-sm">配当情報がありません</p>
                  </div>
                )}

                {/* 保有株式数更新ボタン（将来的な機能） */}
                <div className="mt-3 pt-3 border-t">
                  <button
                    onClick={() => handleSharesUpdate(stock.stock_code, stock.shares_held)}
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
