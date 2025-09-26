import { Router, Request, Response } from "express";
import supabase from "./../supabaseClient.js";
import axios from 'axios';
import { authenticateSupabaseUser } from "../middleware/supabaseAuth.js";

export const JRegisterRouter = Router();

// POST /api/jquants/register
JRegisterRouter.post("/register", authenticateSupabaseUser, async (req: Request, res: Response) => {
  console.log('=== J-Quants Register Endpoint Called ===');
  console.log('User:', req.user?.id);
  console.log('Request body:', req.body);
  
  const user = req.user;
  if (!user) {
    return res.status(401).json({ message: "認証されていません" });
  }

  const { refresh_token, plan } = req.body;

  if (!refresh_token || !plan) {
    console.log('Missing required fields');
    return res.status(400).json({ message: "リフレッシュトークンとプランは必須です" });
  }

  try {
    console.log('Calling J-Quants API...');
    const response = await axios.post(`https://api.jquants.com/v1/token/auth_refresh?refreshtoken=${encodeURIComponent(refresh_token)}`);
    const id_token = response.data.idToken;
    console.log('J-Quants response received:', { hasIdToken: !!id_token });
    
    if (!id_token) {
      console.log('No ID token received');
      return res.status(500).json({ message: "IDトークンの取得に失敗しました" });
    }

    // Supabaseのデータベースに保存（テーブル名: jquants_tokens）
    const { error } = await supabase
      .from("jquants_tokens")
      .upsert([{
        user_id: user.id,
        refresh_token: refresh_token,
        api_token: id_token,
        plan: plan
      }]);
      
    if (error) {
      console.error("Supabase upsert error:", error);
      return res.status(500).json({ message: "supabaseへの保存に失敗しました" });
    }
    
    return res.json({ message: "登録成功", api_token: id_token });
  } catch (err: any) {
    console.error("J-Quantsトークン取得エラー:", err.response?.data || err.message);
    return res.status(500).json({
      message: "J-Quantsへの接続に失敗しました",
      details: err.response?.data || err.message,
    });
  }
});