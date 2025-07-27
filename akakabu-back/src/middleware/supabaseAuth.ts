import { Request, Response, NextFunction } from "express";
import { createClient } from "@supabase/supabase-js";
import dotenv from "dotenv";

dotenv.config();

const supabaseUrl = process.env.PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.PUBLIC_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error('Missing Supabase environment variables');
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

export const authenticateSupabaseUser = async (req: Request, res: Response, next: NextFunction) => {
  try {
    // Authorization headerからトークンを取得
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ message: "認証トークンが必要です" });
    }

    const token = authHeader.substring(7); // "Bearer " を除去

    // Supabaseでトークンを検証
    const { data: { user }, error } = await supabase.auth.getUser(token);

    if (error || !user) {
      return res.status(401).json({ message: "無効なトークンです" });
    }

    // ユーザー情報をリクエストに追加
    req.user = user;
    next();
  } catch (error) {
    console.error('Authentication error:', error);
    return res.status(401).json({ message: "認証に失敗しました" });
  }
};

// 型定義の拡張
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
} 