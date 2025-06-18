import app from '../src/index.js'; // Express アプリを読み込む（←既存のファイル）
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  app(req, res); // Express アプリを Vercel のリクエストに対応させる
}