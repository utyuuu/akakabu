export type JQuantsUserConfig = {
  token: string;
  refreshToken: string;
  plan: "free" | "pro_light" | "pro_standard" | "pro_advanced";
  user_id: string;
};

export type StockInfo = {
  code: string;
  companyName: string;
  sector: string;
  market: string;
  close?: number;
  dividend?: number; //有料版のみ
};