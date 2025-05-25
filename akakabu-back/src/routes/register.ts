import {Router} from "express";
import supabase from "./../supabaseClient.js";
import  { JQuantsClient } from "./../jquants/jquantsClient.js"
import {searchByKeyword} from "./../jquants/stockSearchService.js"
import type { JQuantsUserConfig } from "./../jquants/jquants.js"

const searchRouter = Router();
// POST /api/jquants/search
searchRouter.post("/search", async (req, res) => {
  const { userId, keywords } = req.body;

  if (!userId || !keywords) {
    return res.status(400).json({ error: "userIdとkeywordは必須です" });
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
 
  //  const client = new JQuantsClient(config);
 
   try {
     const result = await searchByKeyword(config, keywords);
    res.json(result);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

export default searchRouter;