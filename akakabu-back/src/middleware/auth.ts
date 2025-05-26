import jwt from "jsonwebtoken";
import { Request, Response, NextFunction } from "express";

export const authenticateUser = (req: Request, res: Response, next: NextFunction) => {
  const token = req.cookies["sb-access-token"];
  if (!token) {
    return res.status(401).json({ message: "未認証" });
  }

  try {
    const user = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
    res.locals.userId = user.sub; // ← 後続のルートで使うために保存
    next(); // 認証OKなので次へ
  } catch (err) {
    return res.status(401).json({ message: "トークンエラー" });
  }
};