import React, { useState } from "react";
import axios from "axios";

type Stock = {
  code: string;
  companyName: string;
  close_price: number;
  fiscal_year: string;
  date: string
};
const apiBaseUrl = import.meta.env.VITE_API_URL;

const SearchScreen = () => {
  const [keywords, setKeywords] = useState<string>("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [Item, setItem] = useState<Stock | null>(null);
  const [selectedCode, setSelectedCode] = useState<string | null>(null);

  const handleKeyDown = async (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") await handleSearch();
  };
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    if (name === "keywords") {
      setKeywords(value);
    }
  };

  const handleSearch = async () => {
    try {
      const response = await axios.post(
        `${apiBaseUrl}/api/jquants/search`,
        { keywords },
        { withCredentials: true }
      );
      setStocks(response.data);
    if (response.data.length > 0) {
     setItem(response.data[0]); // ← 最初の1件を自動表示
    } else {
      setItem(null);
    }
    } catch (error) {
      if (axios.isAxiosError(error) && error.response)
        alert("リフレッシュトークンの期限が切れています。リフレッシュトークンを再度登録してください");
      console.error("axios error:", error);
    }
  };


  const handleAddFavorit = async (stock: Stock) => {
    try {
      const res = await axios.post(
        `${apiBaseUrl}/api/favorit`,
        { Item },
        { withCredentials: true }
      );
      console.log(res.data);
    } catch (error) {
      console.error("axios error:", error);
    }
  };

  return (
    <div className="flex flex-col items-center w-full p-4">
      <div className="w-full max-w-xl flex gap-2 mb-4">
        <input
          type="text"
          name="keywords"
          value={keywords}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="bg-white flex-1 px-3 py-2 border rounded"
        />
        <button
          onClick={handleSearch}
          className=" bg-white hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
          検索
        </button>
      </div>
      <div>
        <ul className="bg-white border rounded w-full">
        {stocks.map((stock) => (
          <React.Fragment key={stock.code}>
            <li
              onClick={() => setSelectedCode(stock.code)}
              className="cursor-pointer px-4 py-2 hover:bg-blue-100 border-b"
            >
              {stock.code} - {stock.companyName}
            </li>
            {selectedCode === stock.code && (
              <div className="bg-white px-4 py-3 border-b">
                <h4 className="font-bold mb-2">詳細情報</h4>
                <ul className="text-sm">
                  {Object.entries(stock).map(([key, value]) => (
                    <li key={key}>
                      <strong>{key}:</strong>{" "}
                      {typeof value === "object" && value !== null
                        ? JSON.stringify(value)
                        : String(value)}
                    </li>
                  ))}
                </ul>
                <button
                  onClick={() => handleAddFavorit(stock)}
                  className="text-yellow-500 text-xl mt-2 hover:scale-110 transition"
                >
                  ⭐️ お気に入りに追加
                </button>
              </div>
            )}
          </React.Fragment>
        ))}
      </ul>
      </div>
    </div>
  );
};

export default SearchScreen;
