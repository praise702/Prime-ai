const express = require("express");
const store = require("./chatStore");
const router = express.Router();
router.get("/", (req,res) => res.json({ success:true, chats: store.list(req.user.id) }));
router.get("/:chatId", (req,res) => { const chat = store.get(req.user.id, req.params.chatId); if(!chat) return res.status(404).json({success:false,error:"Chat not found."}); res.json({success:true,chat}); });
router.put("/:chatId", (req,res) => { if(String(req.body?.id || req.params.chatId)!==req.params.chatId) return res.status(400).json({success:false,error:"Chat ID mismatch."}); try { const chat=store.save(req.user.id,{...req.body,id:req.params.chatId}); res.json({success:true,chat}); } catch(e){res.status(400).json({success:false,error:e.message});} });
router.delete("/:chatId", (req,res) => { if(!store.remove(req.user.id,req.params.chatId)) return res.status(404).json({success:false,error:"Chat not found."}); res.json({success:true}); });
module.exports=router;
