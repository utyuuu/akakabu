import { JQuantsClient } from "./jquantsClient.js";
import type { JQuantsUserConfig, StockInfo } from "./jquants.js";

export async function searchByKeyword(config: JQuantsUserConfig, keyword: string): Promise<StockInfo[]> {
  const client = new JQuantsClient(config);
  const allData = await client.getListedInfo();
  const normalizedKeyword = keyword.trim().toLowerCase();
  return allData.filter(item => (item.CompanyName || "").toLowerCase().includes(normalizedKeyword));
}

export async function searchAndSummarize(config: JQuantsUserConfig, keyword: string): Promise<StockInfo[]> {
  const client = new JQuantsClient(config);
  const allData = await client.getListedInfo();
  const normalizedKeyword = keyword.trim().toLowerCase();

  const matched = allData.filter(item => (item.CompanyName || "").toLowerCase().includes(normalizedKeyword));
  if (matched.length === 0) return [];

  const [prices, dividends] = await Promise.all([
    // 株価取得
    ['pro_light', 'pro_standard', 'pro_advanced'].includes(config.plan)
    ? client.getDailyStockPricesWithRetry()
    : Promise.resolve([]),
    // 配当取得
    config.plan === 'pro_advanced'
    ? client.getDividendYields()
    : Promise.resolve([]),
  ]);

  const normalizeCode = (code: string | number | undefined | null) => {
    if (code == null) throw new Error("Code is undefined or null");
    return code.toString().padStart(5, '0');
  };

  return matched.map(info => {
    const code = normalizeCode(info.Code); // 5桁に揃える
    const price = prices.find(p => normalizeCode(p.LocalCode) === code || normalizeCode(p.Code) === code);
    const dividend = dividends.find(d => normalizeCode(d.LocalCode) === code);

    const date = price?.Date;

    return {
      code,
      companyName: info.CompanyName,
      sector: info.Sector17CodeName,
      market: info.MarketCodeName,
      close: price?.Close,
      dividend: dividend?.Dividend,
      date:date,
    };
  });
}
