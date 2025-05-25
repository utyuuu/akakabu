import express from "express";
import supabase from "./../supabaseClient.js";
import { authenticateUser } from "./../middleware/auth.js"

const usersRouter = express.Router();

usersRouter.patch("/users", authenticateUser, async (req, res) => {
    const userId = res.locals.userId;
    const { user_name } = req.body;
  
    const { error } = await supabase
      .from("users")
      .update({ user_name })
      .eq("id", userId);
  
    if (error) {
      return res.status(500).json({ message: "ユーザー名変更に失敗しました", error });
    }
  
    return res.status(200).json({ message: "ユーザー名変更成功" });
  });
  
  // アカウント削除
  usersRouter.delete("/users", authenticateUser, async (req, res) => {
    const userId = res.locals.userId;
  
    // Supabase Admin API を使って削除
    const { error } = await supabase.auth.admin.deleteUser(userId);
  
    if (error) {
      return res.status(500).json({ message: "退会に失敗しました", error });
    }
  
    return res.status(200).json({ message: "退会完了" });
  });

export default usersRouter;