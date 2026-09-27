process.env.NODE_ENV="test";
const assert=require("assert");
const http=require("http");
const fs=require("fs");
const path=require("path");
const {createApp}=require("../src/api/server");
const db=require("../src/storage/database");

function request(server,{method="GET",path="/",headers={},body}={}){return new Promise((resolve,reject)=>{const payload=body===undefined?null:typeof body==="string"?body:JSON.stringify(body);const req=http.request({port:server.address().port,method,path,headers:{...(payload?{"Content-Type":"application/json","Content-Length":Buffer.byteLength(payload)}:{}),...headers}},res=>{let raw="";res.on("data",c=>raw+=c);res.on("end",()=>{let parsed=raw;try{parsed=JSON.parse(raw)}catch{};resolve({status:res.statusCode,headers:res.headers,body:parsed});});});req.on("error",reject);if(payload)req.write(payload);req.end();});}
function cookie(res){const set=res.headers["set-cookie"]?.[0]||"";return set.split(";")[0];}
async function run(){
 db.ensure();
 const app=createApp({rateLimit:{ip:{windowMs:60000,max:100},burst:{windowMs:60000,max:10},user:{windowMs:60000,max:20}}});
 const server=await new Promise(r=>{const s=app.listen(0,()=>r(s));});
 try{
  const health=await request(server,{path:"/health"}); assert.equal(health.status,200); assert.equal(health.body.service,"Prime");
  const unauth=await request(server,{method:"GET",path:"/api/auth/me"}); assert.equal(unauth.status,401);
  const email=`test-${Date.now()}@example.test`;
  const signup=await request(server,{method:"POST",path:"/api/auth/signup",body:{name:"Security Alice 🚀 / A+B",email,password:"StrongPass123!"}}); assert.equal(signup.status,201); assert.equal(signup.body.user.name,"Security Alice 🚀 / A+B"); assert.ok(signup.body.user.id); const session=cookie(signup);
  const me=await request(server,{path:"/api/auth/me",headers:{Cookie:session}}); assert.equal(me.status,200); assert.equal(me.body.user.email,email);
  const chat=await request(server,{method:"POST",path:"/chat",headers:{Cookie:session},body:{message:"hello",chatId:"security-chat"}}); assert.equal(chat.status,200);
  const mathChat=await request(server,{method:"POST",path:"/chat",headers:{Cookie:session},body:{message:"54564+554",chatId:"security-math-chat",attachments:[],location:null}}); assert.equal(mathChat.status,200); assert.equal(mathChat.body.message.text,"55118");
  const forged=await request(server,{method:"POST",path:"/chat",headers:{Cookie:session},body:{message:"hello",userId:"another-user"}}); assert.equal(forged.status,400);
  const saved=await request(server,{method:"PUT",path:"/api/chats/security-chat",headers:{Cookie:session},body:{id:"security-chat",title:"Test",messages:[{sender:"user",text:"hello",time:Date.now()}]}}); assert.equal(saved.status,200);
  const chats=await request(server,{path:"/api/chats",headers:{Cookie:session}}); assert.equal(chats.status,200); assert.equal(chats.body.chats.length,1);
  const otherEmail=`other-${Date.now()}@example.test`; const signup2=await request(server,{method:"POST",path:"/api/auth/signup",body:{name:"Other",email:otherEmail,password:"StrongPass123!"}}); assert.equal(signup2.status,201); const session2=cookie(signup2); const isolated=await request(server,{path:"/api/chats",headers:{Cookie:session2}}); assert.equal(isolated.body.chats.length,0);
  const logout=await request(server,{method:"POST",path:"/api/auth/logout",headers:{Cookie:session}}); assert.equal(logout.status,200); const after=await request(server,{path:"/api/auth/me",headers:{Cookie:session}}); assert.equal(after.status,401);
  const frontend=fs.readFileSync(path.join(__dirname,"../src/frontend/chat.js"),"utf8" );
  assert.doesNotMatch(frontend,/firebase/i); assert.doesNotMatch(frontend,/gstatic\.com/);
  const { validateChatRequest } = require("../src/middleware/requestValidation");
  const validationReq = {
      method: "POST",
      headers: { "content-type": "application/json" },
      is: type => type === "application/json",
      body: { message: "54564+554", chatId: "550e8400-e29b-41d4-a716-446655440000", attachments: [], location: null }
  };
  let validationNext = false;
  const validationRes = { statusCode: 200, status(code) { this.statusCode = code; return this; }, json(payload) { this.payload = payload; return this; } };
  validateChatRequest(validationReq, validationRes, () => { validationNext = true; });
  assert.equal(validationNext, true, JSON.stringify(validationRes.payload || {}));

  console.log("Prime own-auth/security regression checks passed");
 }finally{await new Promise(r=>server.close(r));}
}
run().catch(e=>{console.error(e);process.exitCode=1});
