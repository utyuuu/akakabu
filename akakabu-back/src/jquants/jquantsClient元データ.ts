import dotenv from "dotenv";
import axios from 'axios';

dotenv.config();

type JQuantsUserConfig = {
  token: string;
  plan: "free" | "paid";
};

type StockInfo = {
  code: string;
  companyName: string;
  sector: string;
  market: string;
  close?: number;
  dividend?: number; // 有料プランのみ
};

export class JQuantsClient {
  constructor(private config: JQuantsUserConfig) {}

  // 銘柄検索（全プラン共通）
  async searchByKeyword(keyword: string) {
    const allData = await this.getListedInfo();
      console.log("取得した銘柄数:", allData.length);
      console.log("先頭のデータ例:", allData.slice(0, 5));
    const normalizedKeyword = keyword.trim().toLowerCase();
    return allData.filter((item: any) => {
      const name = (item.CompanyName || "").toLowerCase();
      return name.includes(normalizedKeyword);
    });
  }

 // 株価・銘柄・配当情報を統合して返す
 async getStockSummary(code: string, date: string): Promise<StockInfo | null> {
  const [infoList, priceList, dividendList] = await Promise.all([
    this.getListedInfo(),
    this.getDailyStockPrices(date, date),
    this.config.plan === "paid" ? this.getDividendYields() : Promise.resolve([]),
  ]);

  const info = infoList.find(item => item.Code === code);
  if (!info) return null;

  const price = priceList.find(item => item.Code === code);
  const dividend = dividendList.find(item => item.Code === code);

  return {
    code,
    companyName: info.CompanyName,
    sector: info.Sector17CodeName,
    market: info.MarketCodeName,
    close: price?.Close,
    dividend: dividend?.Dividend,
  };
}

// キーワード検索＋要約情報取得（株価・配当など）を一括で行う
async searchAndSummarize(keyword: string, date: string): Promise<StockInfo[]> {
  const allInfo = await this.getListedInfo();

  const normalizedKeyword = keyword.trim().toLowerCase();
  const matched = allInfo.filter((item: any) => {
    const name = (item.CompanyName || "").toLowerCase();
    return name.includes(normalizedKeyword);
  });

  if (matched.length === 0) return [];

  const codes = matched.map((item: any) => item.Code);

  const [priceList, dividendList] = await Promise.all([
    this.getDailyStockPrices(date, date),
    this.config.plan === "paid" ? this.getDividendYields() : Promise.resolve([]),
  ]);

  return matched.map((info: any) => {
    const code = info.Code;
    const price = priceList.find((p) => p.Code === code);
    const dividend = dividendList.find((d) => d.Code === code);

    return {
      code,
      companyName: info.CompanyName,
      sector: info.Sector17CodeName,
      market: info.MarketCodeName,
      close: price?.Close,
      dividend: dividend?.Dividend,
    };
  });
}

// 銘柄一覧取得
async getListedInfo(): Promise<any[]> {
  return await this.callApiWithPagination('v1/listed/info');
}

// 株価（日次）取得
async getDailyStockPrices(from: string, to: string): Promise<any[]> {
  const path = `v1/prices/daily_quotes?date=${from}`;
  const res = await axios.get(`https://api.jquants.com/${path}`, {
    headers: {
      Authorization: `Bearer ${this.config.token}`,
    },
  });
  return res.data.daily_quotes || [];
}

// 配当データ取得（有料プランのみ）
async getDividendYields(): Promise<any[]> {
  const path = `v1/dividends/dividend_yield`;
  const res = await axios.get(`https://api.jquants.com/${path}`, {
    headers: {
      Authorization: `Bearer ${this.config.token}`,
    },
  });
  return res.data.dividends || [];
}

// ページネーション対応の共通API呼び出し
private async callApiWithPagination(path: string): Promise<any[]> {
  let allData: any[] = [];
  let paginationKey: string | null = null;

  do {
    const fullPath: string = paginationKey
      ? `${path}${path.includes('?') ? '&' : '?'}pagination_key=${paginationKey}`
      : path;

    try {
      const res = await axios.get(`https://api.jquants.com/${fullPath}`, {
        headers: {
          Authorization: `Bearer ${this.config.token}`,
        },
      });

      const json = res.data;
      allData = allData.concat(json.info || json.listed_info || []);
      paginationKey = json.pagination_key || null;
    } catch (error: any) {
      const status = error.response?.status;
      const message = error.response?.data || error.message;
      throw new Error(`APIエラー: ${status} - ${JSON.stringify(message)}`);
    }
  } while (paginationKey);

  return allData;
}
}