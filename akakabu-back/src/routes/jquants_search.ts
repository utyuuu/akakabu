import {Router} from "express";
import supabase from "./../supabaseClient.js";
import {searchAndSummarize} from "./../jquants/stockSearchService.js"
import type { JQuantsUserConfig } from "./../jquants/jquants.js";
import { authenticateSupabaseUser } from "../middleware/supabaseAuth.js";

export const searchRouter = Router();
// POST /api/jquants/search
searchRouter.post("/search", authenticateSupabaseUser, async (req, res) => {
  const user = req.user;
  if (!user) {
    return res.status(401).json({ error: "無効なユーザー" });
  }

  const userId = user.id;
// フロントからの情報を受け取り
  const { keywords } = req.body;

  if (!userId || !keywords) {
    return res.status(400).json({ error: "keywordsは必須です" });
  }

  if (!keywords || keywords.trim() === "") {
    return res.status(400).json({ error: "検索キーワードは必須です" });
  }

// Supabase からユーザーのトークン情報を取得
  const { data: tokenData, error: tokenError } = await supabase
    .from("jquants_tokens")
    .select("api_token, refresh_token, plan, user_id")
    .eq("user_id", userId)
    .single();

  if (tokenError || !tokenData) {
    return res.status(401).json({ error: "J-Quantsトークンが登録されていません" });
  }

  const config: JQuantsUserConfig = {
    token: tokenData.api_token,
    refreshToken: tokenData.refresh_token,
    plan: tokenData.plan,
    user_id: tokenData.user_id,
  };


  try {
    const result = await searchAndSummarize(config, keywords);
    console.log(result); 
    res.json(result);
  } catch (err: any) {
    console.error("JQuants API 呼び出しエラー:", err);
    res.status(500).json({ error: err.message || "JQuants fetch failed" });
  }
});