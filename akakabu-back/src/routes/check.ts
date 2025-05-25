import {Router} from "express";
import jwt from "jsonwebtoken";
const checkRouter = Router();

checkRouter.get("/check", async (req,res) => {
  const token = req.cookies["sb-access-token"];
  if (!token) {
    console.log("トークンが存在しません");
    return res.status(401).json({ message: "未ログイン" });
  }

  try {
    console.log("トークンを検証中...");
    const user = jwt.verify(token, process.env.SUPABASE_JWT_SECRET!);
    res.status(200).json(user);
  } catch (err) {
    console.log("JWT 検証エラー:", err);
    return res.status(401).json({ message: "期限切れです" });
  }
});

export default checkRouter;