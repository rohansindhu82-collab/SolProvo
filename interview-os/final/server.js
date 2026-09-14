import http from 'node:http';
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreAnswer, chooseFollowUp } from './engine.js';
const __dirname=path.dirname(fileURLToPath(import.meta.url));
const PORT=Number(process.env.PORT||8787);
const MIME={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json; charset=utf-8'};
const json=(res,status,data)=>{res.writeHead(status,{'content-type':'application/json; charset=utf-8','access-control-allow-origin':'*'});res.end(JSON.stringify(data));};
const body=req=>new Promise((resolve,reject)=>{let b='';req.on('data',c=>{b+=c;if(b.length>1e6)req.destroy()});req.on('end',()=>{try{resolve(JSON.parse(b||'{}'))}catch(e){reject(e)}});req.on('error',reject)});
function staticFile(req,res){const raw=decodeURIComponent((req.url||'/').split('?')[0]);const rel=raw==='/'?'index.html':raw.replace(/^\/+/, '');const file=path.resolve(__dirname,rel);if(!file.startsWith(__dirname+path.sep))return json(res,403,{error:'Forbidden'});fs.stat(file,(err,s)=>{if(err||!s.isFile())return json(res,404,{error:'Not found'});res.writeHead(200,{'content-type':MIME[path.extname(file)]||'application/octet-stream','cache-control':'no-cache'});fs.createReadStream(file).pipe(res);});}
const server=http.createServer(async(req,res)=>{if(req.method==='OPTIONS'){res.writeHead(204,{'access-control-allow-origin':'*','access-control-allow-methods':'GET,POST,OPTIONS','access-control-allow-headers':'content-type'});return res.end()}const u=(req.url||'/').split('?')[0];if(req.method==='GET'&&u==='/api/health')return json(res,200,{ok:true,service:'interview-os',provider:process.env.AI_PROVIDER||'deterministic'});if(req.method==='POST'&&u==='/api/evaluate'){try{const b=await body(req);const result=scoreAnswer(b.answer||'',b.question||'',Array.isArray(b.keywords)?b.keywords:[],Number(b.duration)||0);return json(res,200,{result,followUp:chooseFollowUp(b.question||'',result)})}catch{return json(res,400,{error:'Invalid evaluation payload'})}}if(req.method==='GET')return staticFile(req,res);return json(res,405,{error:'Method not allowed'})});
server.listen(PORT,()=>console.log(`Interview OS ready at http://localhost:${PORT}`));
