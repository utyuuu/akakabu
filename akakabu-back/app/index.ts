import app from '../src/index.js'; // Express アプリを読み込む（←既存のファイル）
import { Request, Response } from 'express';

export default async function handler(req: Request, res: Response) {
  app(req, res); // Express アプリを Vercel のリクエストに対応させる
}