import React, { useState, useEffect } from "react";
import axios from "axios";

type Stock = {
  stock_code: string;
  company_name: string;
  close_price: number;
  fiscal_year: string;
};
const apiBaseUrl = import.meta.env.VITE_API_URL;

const SearchScreen = () => {
  const [keywords, setKeywords] = useState<string>("");
  const [stocks, setStocks] = useState<Stock[]>([]);
  const [Item, setItem] = useState<Stock | null>(null);

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
      console.log(response.data);
    } catch (error) {
      console.error("axios error:", error);
    }
  };

  // const filteredStocks = stocks.filter((stocks) => {
  //   return stocks.code?.includes(keywords) || stocks.name?.includes(keywords);
  // });

  // useEffect(() => {
  //   handleSearch();
  // }, [keywords]);

  const handleAddFavorit = async () => {
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
    <div>
      <div className="w-full flex absolute top-30 left-115">
        <input
          type="text"
          name="keywords"
          value={keywords}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className="bg-white w-1/3"
        />
        <button
          onClick={handleSearch}
          className=" bg-white hover:bg-blue-500 text-blue-700 font-semibold hover:text-white py-2 px-4 border border-blue-500 hover:border-transparent rounded"
        >
          検索
        </button>
      </div>
      <div>
        {/* 検索 */}
        {Item && (
          <div>
            {Item.stock_code} - {Item.company_name} - {Item.close_price}
          </div>
        )}
        <ul>
          {stocks.map((stocks) => (
            <li
              key={stocks.stock_code}
              onClick={() => setItem(stocks)}
              className="cursor-pointer px-4 py-2 hover:bg-blue-100 border-b"
            >
              {stocks.stock_code} - {stocks.company_name}
            </li>
          ))}
        </ul>
      </div>
      <div>
        {/* 詳細表示 */}
        {Item && (
          <div style={{ borderTop: "1px solid #ccc", paddingTop: "1rem" }}>
            <h3>詳細情報</h3>
            <ul>
              {Object.entries(Item).map(([key, value]) => (
                <li key={key}>
                  <strong>{key}:</strong>{" "}
                  {typeof value === "object" && value !== null
                    ? JSON.stringify(value)
                    : String(value)}
                </li>
              ))}
            </ul>
            <button onClick={handleAddFavorit}>⭐️</button>
          </div>
        )}
      </div>
    </div>
  );
};

export default SearchScreen;
