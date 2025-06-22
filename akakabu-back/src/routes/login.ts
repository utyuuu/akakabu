import {Router} from "express";
import supabase from "./../supabaseClient.js"
const loginRouter = Router();

loginRouter.post("/login", async (req,res) => {
   const {email, password}=req.body;

   if (!password) {
    return res.status(400).json({ message: "パスワードが必要です" });
  }

    // ログイン
   const{ data:authData, error:authError} = await supabase.auth.signInWithPassword({
    email,
    password,
   })

   if(authError || !authData.user){
     return res.status(400).json({message: "認証失敗", error: authError})
   }
   console.error("authError", authError)

   const token = authData.session?.access_token;

   res.cookie("sb-access-token", token, {
    httpOnly: true,
    secure: true,
    sameSite: "none",
    maxAge: 60 * 60 * 0.5 * 1000,
  });
  console.log("NODE_ENV:", process.env.NODE_ENV);

  return res.status(200).json({data: authData.user});

});

export default loginRouter;