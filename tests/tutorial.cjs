const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const els=new Map(),events={};function el(id){if(!els.has(id))els.set(id,{value:({mission:'car',count:'1',vehicle:'engine'})[id]||'',style:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},replaceChildren(){},append(){},querySelector(){return el('panther-option')},addEventListener(n,f){events[id+n]=f},getContext(){return {}},getBoundingClientRect(){return {left:0,top:0,width:1000,height:680}}});return els.get(id)}
const c=vm.createContext({document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},createElement:()=>el('tmp'),body:{classList:{add(){},remove(){}}}},window:{},requestAnimationFrame(){},setTimeout(){return 1},clearTimeout(){},URLSearchParams,fitMap(){},console});vm.runInContext(fs.readFileSync('game.js','utf8'),c);const run=s=>vm.runInContext(s,c);
assert.equal(run('typeof tutorialChecklist'),'function','Tutorial must track actual actions');
assert.equal(run('LESSONS.length'),9);
for(const id of run('LESSONS.map(l=>l.id)')){
 run(`career.tutorial=true;career.practice=true;career.lesson='${id}';$('mission').value=LESSONS.find(l=>l.id==='${id}').mission;reset(careerDifficulty());start()`);
 assert(run('S.tutorial'));assert.equal(run('S.difficulty'),'leicht');assert(run('tutorialChecklist().length>=3'));assert.equal(run('tutorialReady()'),false);
}
run("career.lesson='basics';$('mission').value='car';reset('leicht');start();dispatch();for(let i=0;i<150;i++)tick(.1);select('person',S.people[0].id);equip('foam');extendHose();extendHose()");
run('selected().x=650;selected().y=350;attack(selected(),S.fires[0],1,1)');assert(run('S.stats.toolsUsed.includes("foam")'));
run('S.fires.forEach(f=>f.hp=0);S.civilians.forEach(c=>{c.saved=true;c.care="hospital"});tick(.1)');assert.equal(run('S.done'),false,'Tutorial waits for its actual objectives');assert(run('S.fires.some(f=>f.hp>0)'),'An explicit practice flame remains for untried tools');
run('S.stats.toolsUsed=["water","foam","powder","additive"];S.stats.moved=true;S.stats.refills=1;S.stats.withdrawn=1;S.stats.paused=true;S.trucks.push({type:"police",state:"finished"});S.fires.forEach(f=>f.hp=0);tick(.1)');
assert(run('S.done'));assert.equal(run('career.wins'),0);assert(run('career.lessons.includes("basics")'));
// The center can launch each lesson directly, instead of waiting for random calls.
const script=[...fs.readFileSync('index.html','utf8').matchAll(/<script>([\s\S]*?)<\/script>/g)].find(m=>m[1].includes('const emergencyCalls='))[1];vm.runInContext(script,c);
for(const lesson of run('LESSONS.map(l=>({id:l.id,mission:l.mission}))')){run(`chooseTutorial('${lesson.id}')`);assert.equal(run('pendingCall.mission'),lesson.mission);el('accept-call').onclick();assert.equal(run('S.lesson'),lesson.id);assert(run('S.tutorial'));run('openCenter()')}
run("career.lesson='warehouse';$('mission').value='warehouse';reset('leicht');start();for(let i=0;i<6100;i++)tick(.1)");assert(run('S.hazard.exploded'));el('tutorial-restart').onclick();assert(run('S.active&&!S.hazard.exploded&&S.hazard.remaining===600'));
assert.equal(run('career.wins'),0);
console.log('PASS: all nine selectable tutorials, real-action checklists, practice flame, lesson completion, no career advancement and direct lesson launch');
