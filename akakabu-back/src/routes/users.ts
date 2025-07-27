import express from "express";
import supabase from "./../supabaseClient.js";
import { authenticateSupabaseUser } from "../middleware/supabaseAuth.js";

export const usersRouter = express.Router();

// ユーザー名変更
usersRouter.patch("/users", authenticateSupabaseUser, async (req, res) => {
  const userId = req.user.id;
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
usersRouter.delete("/users", authenticateSupabaseUser, async (req, res) => {
  const userId = req.user.id;
  
    // Supabase Admin API を使って削除
    const { error } = await supabase.auth.admin.deleteUser(userId);
  
    if (error) {
      return res.status(500).json({ message: "退会に失敗しました", error });
    }
  
    return res.status(200).json({ message: "退会完了" });
  }); 