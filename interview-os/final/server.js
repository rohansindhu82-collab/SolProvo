import http from 'node:http';
import {scoreAnswer,chooseFollowUp} from './engine.js';

const PORT=process.env.PORT||8787;
const send=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json','access-control-allow-origin':'*'});res.end(JSON.stringify(data));};
const readBody=req=>new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(b.length>1e6)req.destroy()});req.on('end',()=>{try{resolve(JSON.parse(b||'{}'))}catch(e){reject(e)}});req.on('error',reject)});

const server=http.createServer(async(req,res)=>{
 if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-methods':'POST,GET,OPTIONS','access-control-allow-headers':'content-type'});return res.end()}
 if(req.method==='GET'&&req.url==='/api/health')return send(res,200,{ok:true,service:'interview-os',provider:process.env.AI_PROVIDER||'deterministic'});
 if(req.method==='POST'&&req.url==='/api/evaluate'){
  try{const b=await readBody(req);const result=scoreAnswer(b.answer||'',b.question||'',b.keywords||[],Number(b.duration)||0);return send(res,200,{result,followUp:chooseFollowUp(b.question||'',result)});}catch{return send(res,400,{error:'Invalid evaluation payload'})}
 }
 send(res,404,{error:'Not found'});
});
server.listen(PORT,()=>console.log(`Interview OS API listening on ${PORT}`));
