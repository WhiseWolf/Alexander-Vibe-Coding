const fs=require('fs'),vm=require('vm'),assert=require('assert');
const elements=new Map();function el(id){if(!elements.has(id))elements.set(id,{value:'',disabled:false,textContent:'',classList:{add(){},remove(){}},onclick:null});return elements.get(id);}
let timer,mission,starts=0,resets=0;const body={classList:{add(){},remove(){}}};
const career={wins:0,practice:false,lastReport:null};
const c=vm.createContext({career,careerDifficulty:()=> 'leicht',careerRank:()=> 'Nachwuchs-Einsatzleiter',flightLimit:()=>3,S:{difficulty:'leicht'},document:{body,getElementById:el},window:{},setTimeout(fn){timer=fn;return 1},clearTimeout(){timer=null},requestAnimationFrame(){},reset(){resets++},start(){mission=el('mission').value;starts++},fitMap(){},radio(){},URLSearchParams,Math});
const html=fs.readFileSync('index.html','utf8');const script=[...html.matchAll(/<script>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes('const emergencyCalls='))[1];vm.runInContext(script,c);
assert.equal(starts,0);assert.equal(timer,null);assert.equal(el('intro-screen').hidden,false);el('intro-start').onclick();assert.equal(el('accept-call').disabled,true);timer();assert.equal(el('accept-call').disabled,false);
const seen=new Set();let previous;
for(let i=0;i<80;i++){const call=vm.runInContext('pendingCall',c);assert.notEqual(call.mission,previous);el('accept-call').onclick();assert.equal(mission,call.mission);assert.equal(el('dispatch-center').hidden,true);seen.add(mission);previous=mission;el('restart').onclick();assert.equal(el('dispatch-center').hidden,false);assert.equal(el('accept-call').disabled,true);timer();}
assert.equal(seen.size,8);assert.equal(starts,80);assert.ok(resets>=160);console.log('PASS: waiting, incoming call, random scenario mapping, no consecutive repeats, accepting, returning and resetting');
