import axios from 'axios';
import { JQuantsUserConfig, StockInfo } from './jquants.js';
import supabase from './../supabaseClient.js'; 
import { eachDayOfInterval, isWeekend, format, addDays, subDays } from 'date-fns';

export class JQuantsClient {
  constructor(private config: JQuantsUserConfig) {}

  private isProUser(): boolean {
    return ['pro_light', 'pro_standard', 'pro_advanced'].includes(this.config.plan);
  }
  
  private isAdvancedProUser(): boolean {
    return this.config.plan === 'pro_advanced';
  }

   // 一般的なAPI呼び出し用のメソッド
   private async callApi(path: string, params: object = {}) {
    return await this.tryWithRefresh(async () => {
      const res = await axios.get(`https://api.jquants.com/${path}`, {
        headers: { Authorization: `Bearer ${this.config.token}` },
        params,
      });
      return res.data || {};
    });
  }

  // トークン自動再取得ロジック（401時）
  private async tryWithRefresh<T>(fn: () => Promise<T>): Promise<T> {
    try {
      return await fn();
    } catch (err: any) {
      if (axios.isAxiosError(err) && err.response?.status === 401) {
        console.warn('Access token expired, trying to refresh...');
        const newToken = await this.refreshAccessToken();
        if (newToken) {
          this.config.token = newToken;
          return await fn(); // リトライ
        }
      }
      throw err;
    }
  }


   private async refreshAccessToken(): Promise<string | null> {
    try {
      const res = await axios.post('https://api.jquants.com/v1/token/auth_refresh', {
        refresh_token: this.config.refreshToken,
      });

      const newToken = res.data?.id_token;
      if (!newToken) return null;

      // supabaseに保存
      const { error } = await supabase
        .from('jquants_tokens')
        .update({ id_token: newToken})
        .eq('user_id', this.config.user_id); // userId を JQuantsUserConfig に含めておく必要あり

      if (error) {
        console.error('Failed to update token in Supabase:', error);
      } else {
        console.log('New token saved to Supabase.');
      }

      return newToken;
    } catch (err) {
      console.error('Token refresh failed:', err);
      return null;
    }
  }

  // 上場情報を取得
  async getListedInfo(): Promise<any[]> {
    const res = await this.callApi('v1/listed/info');
    return res.info ?? [];
  }

  // 株価取得
  async getDailyStockPrices(date: string): Promise<any[]> {
    return await this.callApi('v1/prices/daily_quotes', { date });
  }

  // 営業日を取得
  async getBusinessDays(): Promise<string[]> {
    const data = await this.callApi('v1/markets/calendar');
    return (data.calendar || [])
      .filter((day: any) => day.opening) // 開場日を抽出
      .map((day: any) => day.date)
      .sort();
  }

  // 営業日取得（有料版か無料版かで異なる）
  async getTargetDates(): Promise<string[]> {
    return this.isProUser() ? this.getBusinessDays() : this.getPastWeekdays();
  }

  // 株価取得のリトライ機能付きメソッド
  async getDailyStockPricesWithRetry(): Promise<any[]> {
    const targetDates = await this.getTargetDates();

    for (const date of targetDates) {
      try {
        const formattedDate = date.replace(/-/g, "");
        console.log(`Trying daily_quotes for: ${formattedDate}`);
        return await this.getDailyStockPrices(formattedDate);
      } catch (err: any) {
        if (axios.isAxiosError(err) && err.response?.status === 400) {
          console.warn(`400 error on ${date}, trying previous business day...`);
          continue;
        } else {
          throw err;
        }
      }
    }

    throw new Error('直近の営業日価格を表示できません');
  }

  // 配当利回りを取得
  async getDividendYields(): Promise<any[]> {
    return await this.callApi('v1/dividends/dividend_yield');
  }

  
  
  async getLatestAvailableStockPrices(): Promise<any[]> {
    return await this.getDailyStockPricesWithRetry();
  }

  async getPastWeekdays(): Promise<string[]> {
    const today = new Date();
    const from = subDays(today, 85);
    const to = subDays(today, 95); 
    const daysInRange = eachDayOfInterval({ start: from, end: to }).reverse();

    for (const d of daysInRange) {
      if (isWeekend(d)) continue;

      const dateStr = format(d, 'yyyy-MM-dd');
      try {
       const quotes = await this.getDailyStockPrices(dateStr);
       if (quotes.length > 0) {
          // データが取得できた日を基準にして11営業日を構成
          const candidateDates: string[] = [];
  
          // 過去5営業日
          let back = d;
          while (candidateDates.length < 5) {
            back = subDays(back, 1);
            if (!isWeekend(back)) {
              candidateDates.unshift(format(back, 'yyyy-MM-dd'));
            }
          }
  
          candidateDates.push(dateStr); // 基準日
  
          // 未来5営業日
          let forward = d;
          while (candidateDates.length < 11) {
            forward = addDays(forward, 1);
            if (!isWeekend(forward)) {
              candidateDates.push(format(forward, 'yyyy-MM-dd'));
            }
          }
  
          return candidateDates;
        }
      } catch (err: any) {
        console.warn(`データ取得エラー（${dateStr}）: ${err.response?.status ?? err}`);
      }
    }
  
    console.warn('有効な株価データが見つかりませんでした。');
    return [];
  }

  private async callApiWithPagination(path: string): Promise<any[]> {
    let allData: any[] = [];
    let paginationKey: string | null = null;

    do {
      const fullPath: string= paginationKey
        ? `${path}${path.includes('?') ? '&' : '?'}pagination_key=${paginationKey}`
        : path;

      const res = await axios.get(`https://api.jquants.com/${fullPath}`, {
        headers: { Authorization: `Bearer ${this.config.token}` },
      });

      const json = res.data;
      allData = allData.concat(json.info || json.listed_info || []);
      paginationKey = json.pagination_key || null;
    } while (paginationKey);

    return allData;
  }

  // 株情報取得
  async getStockInfo(code: string, date: string): Promise<StockInfo | null> {
    const [infoList, priceList, dividendList] = await Promise.all([
      this.getListedInfo(),
      date ? this.getDailyStockPrices(date) : this.getDailyStockPricesWithRetry(),
      this.config.plan === 'pro_advanced' ? this.getDividendYields() : Promise.resolve([]),
    ]);

    const info = infoList.find((item) => item.Code === code);
    if (!info) return null;

    const price = priceList.find((item) => item.LocalCode === code || item.Code === code);
    const dividend = dividendList.find((item) => item.LocalCode === code || item.Code === code);

    return {
      code,
      companyName: info.CompanyName,
      sector: info.Sector17CodeName,
      market: info.MarketCodeName,
      close: price?.Close,
      dividend: dividend?.Dividend,
    };
  }
}