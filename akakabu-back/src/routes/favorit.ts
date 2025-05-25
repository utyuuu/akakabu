import {Router, Request, Response} from "express";
import supabase from "./../supabaseClient.js"

const favoritesRouter = Router();

favoritesRouter.post("/favorites", async(req:Request, res:Response)=> {
    try{
        const { Item }=req.body;
        if (!Item){return res.status(400).json({ message: "Itemが送られていません" });}
        const { error: insertError } = await supabase
        .from("favorites")
        .insert([Item]);
        if (insertError) {
            console.error("Supabase Insert Error:", insertError);
            return res.status(500).json({ message: "DB登録エラー" });
          }
      
          return res.status(200).json({ message: "お気に入り登録成功！" });
        } catch (error) {
          console.error("サーバーエラー:", error);
          return res.status(500).json({ message: "サーバー内部エラー" });
        }
});


export default favoritesRouter;