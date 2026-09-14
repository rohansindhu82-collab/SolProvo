/* Interview OS — deterministic coaching engine
 * Keeps evaluation transparent and independent from any AI provider.
 */
export const RUBRIC={
  relevance:{label:'Relevance',weight:.20},
  knowledge:{label:'Subject knowledge',weight:.25},
  structure:{label:'Structure',weight:.15},
  specificity:{label:'Specificity & evidence',weight:.15},
  communication:{label:'Communication',weight:.15},
  completeness:{label:'Completeness',weight:.10}
};
const STOP=new Set('the a an and or but to of in on for with is are was were this that it i you we they he she'.split(' '));
const words=t=>t.toLowerCase().replace(/[^a-z0-9\s-]/g,' ').split(/\s+/).filter(Boolean);
export function scoreAnswer(text,question,keywords=[],duration=0){
 const w=words(text), lower=text.toLowerCase(), unique=new Set(w.filter(x=>!STOP.has(x)));
 const hits=keywords.filter(k=>lower.includes(k.toLowerCase())).length;
 const relevance=Math.min(100,45+(w.length>=35?20:10)+Math.min(25,hits*8));
 const knowledge=Math.min(100,42+Math.min(48,hits*12));
 const structure=Math.min(100,42+(lower.match(/first|second|finally|because|example|therefore|impact|result/g)||[]).length*8);
 const specificity=Math.min(100,40+(lower.match(/for example|in my|i would|when i|because|result|outcome/g)||[]).length*10);
 const communication=Math.min(100,62+(duration>=20&&duration<=110?20:8)+(w.length>=45?10:0));
 const completeness=Math.min(100,40+(w.length>=70?35:w.length>=40?22:w.length>=20?12:0));
 const dimensions={relevance,knowledge,structure,specificity,communication,completeness};
 const overall=Math.round(Object.entries(RUBRIC).reduce((s,[k,r])=>s+dimensions[k]*r.weight,0));
 return {overall,dimensions,wordCount:w.length,keywordHits:hits};
}
export function chooseFollowUp(question,score){
 if(score.dimensions.knowledge<65)return `You mentioned the main idea. Now give one technically correct example and explain why it works.`;
 if(score.dimensions.specificity<65)return `Give us a concrete example from your experience or a realistic school situation. What did you do and what was the result?`;
 if(score.dimensions.structure<65)return `Please answer that again in a clear sequence: situation, action, result, and what you learned.`;
 if(score.dimensions.completeness<65)return `What important point have you not covered yet? Please add it briefly.`;
 return `Good. What would you do differently if your first approach did not work?`;
}
export function readiness(scores){if(!scores.length)return 0;return Math.round(scores.reduce((s,x)=>s+x.overall,0)/scores.length)}
