// Real commands and simulated time; no forced completion flags or fabricated action stats.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const els=new Map(),events={};function el(id){if(!els.has(id))els.set(id,{value:({mission:'car',count:'1',vehicle:'engine'})[id]||'',style:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},replaceChildren(){},append(){},querySelector(){return el('panther-option')},addEventListener(n,f){events[id+n]=f},getContext(){return {}},getBoundingClientRect(){return {left:0,top:0,width:1000,height:680}}});return els.get(id)}
let seed=112;const math=Object.create(Math);math.random=()=>{seed=(seed*1664525+1013904223)>>>0;return seed/4294967296};
const c=vm.createContext({document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},createElement:()=>el('tmp')},window:{},requestAnimationFrame(){},console,Math:math});vm.runInContext(fs.readFileSync('game.js','utf8'),c);
const run=s=>vm.runInContext(s,c),tap=(x,y)=>events.mappointerdown({button:0,clientX:x,clientY:y}),step=n=>run(`for(let i=0;i<${n*10};i++)tick(.1)`);
function request(type){el('vehicle').value=type;el('count').value='1';run('dispatch()');step(15)}
function crew(index=0){run(`select('person',S.people.filter(p=>S.trucks.find(t=>t.id===p.truckId&&t.type==='engine')?.state==='ready')[${index}].id)`)}
function gear(tool,index=0){crew(index);run(`equip('${tool}')`);if(['water','foam','additive'].includes(tool))run('extendHose();extendHose()')}
function aimFire(i=0){tap(run(`S.fires[${i}].x`),run(`S.fires[${i}].y`))}
function ensureTank(){if(run("S.trucks.some(t=>t.type==='engine'&&t.state==='ready'&&t.water<20)")){run("sendBack(S.trucks.find(t=>t.type==='engine'&&t.state==='ready'&&t.water<20))");step(80)}}
function extinguish(){for(let i=0;i<run('S.fires.length');i++){for(let tries=0;tries<10&&run(`S.fires[${i}].hp>0`);tries++){ensureTank();gear('foam');aimFire(i);step(170)}assert.equal(run(`S.fires[${i}].hp`),0,'Fire remains reachable and extinguishable')}}
function rescue(){for(let i=0;i<run('S.civilians.length');i++){gear(run(`S.civilians[${i}].underwater?'diver':S.civilians[${i}].trapped?'cutter':'rescue'`));tap(run(`S.civilians[${i}].x`),run(`S.civilians[${i}].y`));step(45);assert(run(`S.civilians[${i}].saved`),'Actual rescue succeeds')}}
for(const lesson of run('LESSONS.map(l=>({id:l.id,mission:l.mission}))')){
 run(`career.tutorial=true;career.practice=true;career.lesson='${lesson.id}';$('mission').value='${lesson.mission}';reset('leicht');start()`);request('engine');
 if(lesson.id==='basics'){
  crew();tap(400,440);step(8);el('pause').onclick();el('pause').onclick();
  for(const tool of ['water','foam','powder','additive']){gear(tool);aimFire();step(16)}
  run('sendBack(S.trucks[0])');step(80);run('sendBack(S.trucks[0],false,true)');step(35);request('engine');request('police');
 }
 if(lesson.id==='water'){
  gear('hydrant');tap(440,470);step(25);gear('splitter');tap(500,450);step(25);
  for(const index of [0,1]){gear('water',index);tap(500,450);aimFire();step(25)}
  assert(run('S.stats.hydrantUsed'));assert.equal(run('S.stats.splitterUsers.length'),2);
 }
 if(['house','tunnel'].includes(lesson.id)){gear('switch');const panel=run('(S.house||S.tunnel).panel');tap(panel.x,panel.y);step(25)}
 if(lesson.id==='house'){gear('rescue');tap(625,425);step(25);crew();tap(740,320);step(25);tap(590,320);step(25)}
 if(lesson.id==='warehouse'){gear('foam');aimFire();step(60);assert(run('S.hazard.resolved&&!S.hazard.exploded'))}
 if(lesson.id==='river'){for(let i=0;i<3;i++){gear('boom');tap(run(`S.river.barrels[${i}].x`),run(`S.river.barrels[${i}].y`));step(30);assert(run(`S.river.barrels[${i}].secured`))}}
 if(lesson.id==='forest'){request('scout');el('air').onclick();aimFire();step(10);assert.equal(run('S.airUsed'),1)}
 if(lesson.id==='airport'){request('panther');run("select('truck',S.trucks.find(t=>t.type==='panther').id);equip('foam')");aimFire();step(15);assert(run('S.stats.pantherUsed'))}
 rescue();extinguish();request('ambulance');step(180);
 assert(run('S.done'),lesson.id+': '+run('JSON.stringify(tutorialChecklist().filter(t=>!t.done))'));
 assert(run(`career.lessons.includes('${lesson.id}')`));assert.equal(run('career.wins'),0);
 console.log('PASS full tutorial',lesson.id);
}
