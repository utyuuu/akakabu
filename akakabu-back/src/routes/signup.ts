import {Router} from "express";
import supabase from "./../supabaseClient.js"
import bcrypt from "bcryptjs";
const signupRouter = Router();

signupRouter.post("/signup", async (req,res) => {
  try {
    const {email, password, user_name} = req.body;

    if (!password) {
      return res.status(400).json({ message: "パスワードが必要です" });
    }

    if (password.length < 6) {
      return res.status(400).json({ message: "6文字以上のパスワードが必要です" });
    }

    // サインアップ
    const { data:authData, error:authError } = await supabase.auth.signUp({
      email,
      password,
    });

    if (authError || !authData.user) {
      return res.status(400).json({message: "認証失敗", error: authError});
    }
    console.log("authError", authError);

    const user_id = authData.user.id;
    const token = authData.session?.access_token;

    const saltRounds = 10;
    const password_hash = await bcrypt.hash(password, saltRounds);

    // 任意データをusersテーブルへ保存
    const { error: insertError } = await supabase.from("users").insert([
      {
        id: user_id,
        email,
        user_name,
        password_hash: password_hash,
      }
    ]);

    if (insertError) {
      return res.status(500).json({ message: "ユーザー情報の保存に失敗", error: insertError });
    }
    console.log("insertError", insertError);

    if (token) {
      res.cookie("sb-access-token", token, {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production",
        sameSite: "none",
        maxAge: 60 * 60 * 0.5 * 1000,
      });
    }

    res.status(200).json({message: "メール確認が必要です"});

  } catch (error:any) {
    console.error("signupRouter catch error:", error);
    res.status(500).json({ message: "サーバーエラー", error: error.message });
  }
});

export default signupRouter;