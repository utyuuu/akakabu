import { Router, Request, Response } from "express";
import supabase from "./../supabaseClient.js";
import axios from 'axios';
import { authenticateSupabaseUser } from "../middleware/supabaseAuth.js";

export const JRegisterRouter = Router();
// POST /api/jquants/register
JRegisterRouter.post("/register", authenticateSupabaseUser, async (req: Request, res: Response) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "認証されていません" });
  }

  const { refresh_token, plan } = req.body;

  if(!refresh_token || !plan){
    return res.status(400).json({ error: "リフレッシュトークンとプランは必須です" });
  }

   try{
    // J-Quantsからaccess_tokenを取得
    const response = await axios.post(`https://api.jquants.com/v1/token/auth_refresh?refreshtoken=${encodeURIComponent(refresh_token)}`
      );
    const id_token = response.data.idToken;
    if(!id_token){
      return res.status(500).json({error: "IDトークンの取得に失敗しました"})
    }

    // Supabaseのデータベースに保存（テーブル名: jquants_tokens）
    const {error} = await supabase
      .from("jquants_tokens")
      .upsert([{
        user_id: user.id,
        refresh_token: refresh_token,
        api_token: id_token,
        plan: plan
      }]);
      if (error) {
        console.error(error);
        return res.status(500).json({ error: "supabaseへの保存に失敗しました" });
      }
    
      return res.json({ message: "登録成功", api_token: id_token });
  } catch (err: any) {
    console.error("J-Quantsトークン取得エラー:", err.response?.data || err.message);
    return res.status(500).json({
      error: "J-Quantsへの接続に失敗しました",
      details: err.response?.data || err.message,
    });
  }
});