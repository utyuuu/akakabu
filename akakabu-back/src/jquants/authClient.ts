import { JQuantsClient } from './jquantsClient.js';
import { JQuantsUserConfig, StockInfo } from './jquants.js';

export class AuthenticatedClient {
  private client: JQuantsClient;

  constructor(private config: JQuantsUserConfig) {
    this.client = new JQuantsClient(config);
  }

  async getStockSummary(code: string, date: string): Promise<StockInfo | null> {
    try {
      return await this.client.getStockInfo(code, date);
    } catch (e) {
      console.error("getStockSummary error:", e);
      return null;
    }
  }
}