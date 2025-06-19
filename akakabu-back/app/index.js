import app from '../src/index.js'; // Express アプリを読み込む（←既存のファイル）

export default async function handler(req, res) {
  app(req, res); // Express アプリを Vercel のリクエストに対応させる
}