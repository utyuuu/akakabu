import React, { useState } from "react";
import { api } from "../utils/apiClient";
import { getErrorMessage, logError } from "../utils/errorHandler";
import { useAuth } from "../hooks/useAuth";

type Stock = {
  code: string;
  companyName: string;
  close_price: number;
  fiscal_year: string;
  date: string
};

export const SearchScreen = () => {
  const { user } = useAuth();
  const [keywords, setKeywords] = useState<string>("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [isSearching, setIsSearching] = useState(false);
  const [isAddingFavorite, setIsAddingFavorite] = useState(false);
  const [error, setError] = useState<string>("");
  const [favoriteMessage, setFavoriteMessage] = useState<string>("");

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") await handleSearch();
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "keywords") {
      setKeywords(value);
      // エラーメッセージをクリア
      if (error) setError("");
    }
  };

  const handleSearch = async () => {
    // バリデーション
    if (!keywords.trim()) {
      setError("検索キーワードを入力してください。");
      return;
    }

    if (keywords.trim().length < 2) {
      setError("検索キーワードは2文字以上で入力してください。");
      return;
    }

    setIsSearching(true);
    setError("");
    setStocks([]);
    setSelectedCode(null);

    try {
      const response = await api.post<Stock[]>('/api/jquants/search', { 
        keywords: keywords.trim() 
      }, { 
        timeout: 15000 // 15秒タイムアウト
      });

      const data = response.data;
      setStocks(data);
      
      if (data.length > 0) {
        setSelectedCode(data[0].code); // 最初の1件を自動表示
    } else {
        setError("検索結果が見つかりませんでした。");
    }
    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setError(`検索エラー: ${errorMessage}`);
      logError('株式検索', error);
    } finally {
      setIsSearching(false);
    }
  };

  const handleAddFavorit = async (stock: Stock) => {
    setIsAddingFavorite(true);
    setFavoriteMessage("");

    try {
      await api.post('/api/favorit', { 
        stock_code: stock.code,
        company_name: stock.companyName,
        close_price: stock.close_price,
        fiscal_year: parseInt(stock.fiscal_year)
      }, { 
        timeout: 10000
      });

      setFavoriteMessage("お気に入りに追加しました！");

    } catch (error) {
      const errorMessage = getErrorMessage(error);
      setFavoriteMessage(`お気に入り追加エラー: ${errorMessage}`);
      logError('お気に入り追加', error);
    } finally {
      setIsAddingFavorite(false);
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-4">
      {/* ユーザー情報表示 */}
      <div className="w-full max-w-xl mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
        <div className="text-sm text-blue-800">
          <strong>ユーザー:</strong> {user?.user_name} さん
        </div>
      </div>

      <div className="w-full max-w-xl flex gap-2 mb-4">
        <input
          type="text"
          name="keywords"
          value={keywords}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          disabled={isSearching}
          placeholder="企業名や銘柄コードを入力"
          className="bg-white flex-1 px-3 py-2 border rounded disabled:bg-gray-100 disabled:cursor-not-allowed focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
        <button
          onClick={handleSearch}
          disabled={isSearching}
          className="bg-white hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded disabled:bg-gray-300 disabled:text-gray-500 disabled:cursor-not-allowed transition-colors"
        >
          {isSearching ? "検索中..." : "検索"}
        </button>
      </div>

      {/* エラーメッセージ */}
      {error && (
        <div className="w-full max-w-xl mb-4 p-3 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {/* お気に入りメッセージ */}
      {favoriteMessage && (
        <div className={`w-full max-w-xl mb-4 p-3 border rounded ${
          favoriteMessage.includes('追加しました') 
            ? 'bg-green-100 border-green-400 text-green-700' 
            : 'bg-red-100 border-red-400 text-red-700'
        }`}>
          {favoriteMessage}
          <button
            onClick={() => setFavoriteMessage("")}
            className="ml-2 text-sm underline hover:no-underline"
          >
            閉じる
          </button>
        </div>
      )}

      {/* 検索結果 */}
      <div className="w-full max-w-xl">
        {stocks.length > 0 && (
          <ul className="bg-white border rounded w-full shadow-sm">
        {stocks.map((stock) => (
          <React.Fragment key={stock.code}>
            <li
              onClick={() => setSelectedCode(stock.code)}
                  className="cursor-pointer px-4 py-2 hover:bg-blue-100 border-b transition-colors"
            >
                  <div className="flex justify-between items-center">
                    <span className="font-medium">{stock.code}</span>
                    <span className="text-gray-600">{stock.companyName}</span>
                  </div>
            </li>
            {selectedCode === stock.code && (
                  <div className="bg-gray-50 px-4 py-3 border-b">
                    <h4 className="font-bold mb-2 text-gray-800">詳細情報</h4>
                    <div className="grid grid-cols-2 gap-2 text-sm">
                      <div><strong>銘柄コード:</strong> {stock.code}</div>
                      <div><strong>企業名:</strong> {stock.companyName}</div>
                      <div><strong>終値:</strong> ¥{stock.close_price?.toLocaleString() || 'N/A'}</div>
                      <div><strong>決算期:</strong> {stock.fiscal_year || 'N/A'}</div>
                      <div><strong>日付:</strong> {stock.date || 'N/A'}</div>
                    </div>
                <button
                  onClick={() => handleAddFavorit(stock)}
                      disabled={isAddingFavorite}
                      className="text-yellow-500 text-xl mt-3 hover:scale-110 transition disabled:opacity-50 disabled:cursor-not-allowed"
                      title="お気に入りに追加"
                >
                      {isAddingFavorite ? "追加中..." : "⭐️ お気に入りに追加"}
                </button>
              </div>
            )}
          </React.Fragment>
        ))}
        </ul>
        )}
      </div>
    </div>
  );
};
