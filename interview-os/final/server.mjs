import http from 'node:http';
import { readFile } from 'node:fs/promises';
import { extname, join, normalize } from 'node:path';
import { fileURLToPath } from 'node:url';
import { scoreAnswer, chooseFollowUp } from './engine.js';

const root=fileURLToPath(new URL('.',import.meta.url));
const port=Number(process.env.PORT||8787);
const mime={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.json':'application/json'};

async function evaluate(body){
 const deterministic=scoreAnswer(body.answer||'',body.question||'',body.keywords||[],Number(body.duration)||0);
 let ai=null;
 if(process.env.OPENAI_API_KEY){
  const prompt=`You are an interview coach. Evaluate the candidate answer against the question and return ONLY valid JSON with keys: overall, relevance, knowledge, structure, specificity, communication, completeness, strengths, improvements, followUp. Scores are 0-100. Do not infer personality, emotion, honesty, protected traits, or hiring suitability. Question: ${body.question}\nAnswer: ${body.answer}`;
  try{
   const r=await fetch('https://api.openai.com/v1/responses',{method:'POST',headers:{'Content-Type':'application/json','Authorization':`Bearer ${process.env.OPENAI_API_KEY}`},body:JSON.stringify({model:process.env.OPENAI_MODEL||'gpt-5.6-luna',input:prompt})});
   const j=await r.json();
   const text=j.output_text||j.output?.flatMap(x=>x.content||[]).map(x=>x.text||'').join('')||'';
   ai=JSON.parse(text.replace(/^```json\s*/,'').replace(/```$/,'').trim());
  }catch(e){ ai=null; }
 }
 return {deterministic,ai,followUp:ai?.followUp||chooseFollowUp(body.question||'',deterministic)};
}

const server=http.createServer(async(req,res)=>{
 try{
  if(req.url==='/api/health'){res.writeHead(200,{'Content-Type':'application/json'});return res.end(JSON.stringify({ok:true,ai:Boolean(process.env.OPENAI_API_KEY)}));}
  if(req.method==='POST'&&req.url==='/api/evaluate'){
   let raw=''; for await(const c of req) raw+=c; const result=await evaluate(JSON.parse(raw||'{}'));
   res.writeHead(200,{'Content-Type':'application/json','Cache-Control':'no-store'});return res.end(JSON.stringify(result));
  }
  if(req.method!=='GET'){res.writeHead(405);return res.end('Method Not Allowed');}
  let path=normalize(new URL(req.url,'http://localhost').pathname); if(path==='/' )path='/index.html';
  if(path.includes('..')){res.writeHead(403);return res.end('Forbidden');}
  const file=join(root,path.slice(1)); const data=await readFile(file); res.writeHead(200,{'Content-Type':mime[extname(file)]||'application/octet-stream'});res.end(data);
 }catch(e){res.writeHead(404,{'Content-Type':'text/plain'});res.end('Not found');}
});
server.listen(port,()=>console.log(`Interview OS running on http://localhost:${port}`));
