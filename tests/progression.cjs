const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),handlers={};
function el(id){if(!elements.has(id))elements.set(id,{value:({mission:'forest',vehicle:'engine',count:'1'})[id]||'',style:{},classList:{toggle(){},add(){},remove(){}},setAttribute(){},replaceChildren(){},append(){},querySelector(){return el('panther-option')},addEventListener(n,fn){handlers[id+n]=fn},getContext(){return {}},getBoundingClientRect(){return {left:0,top:0,width:1000,height:680}}});return elements.get(id)}
const c=vm.createContext({document:{hidden:false,getElementById:el,querySelectorAll:()=>[],addEventListener(){},createElement:()=>el('temp')},window:{},requestAnimationFrame(){},console,Math});
vm.runInContext(fs.readFileSync('game.js','utf8'),c);const run=s=>vm.runInContext(s,c);
assert.equal(run('typeof careerDifficulty'),'function','Session progression must exist');
assert.equal(run('careerDifficulty()'),'leicht');
function complete(){run(`start();S.fires.forEach(f=>f.hp=0);S.civilians.forEach(c=>{c.saved=true;c.care='hospital'});if(S.river)S.river.barrels.forEach(b=>b.secured=true);if(S.tunnel)S.tunnel.powerOff=true;tick(.1)`)}
complete();assert.equal(run('career.wins'),1);const time=run('S.report.seconds');run('tick(3)');assert.equal(run('S.report.seconds'),time);assert.equal(run('career.wins'),1);
run("reset(careerDifficulty())");complete();assert.equal(run('careerDifficulty()'),'normal');
run("reset(careerDifficulty())");complete();run("reset(careerDifficulty())");complete();assert.equal(run('careerDifficulty()'),'schwer');
run("career.practice=true;reset(careerDifficulty())");assert.equal(run('S.difficulty'),'leicht');complete();assert.equal(run('career.wins'),4,'Practice must not advance career');
run("career.practice=false;reset('normal');start()");const wins=run('career.wins');run('reset()');assert.equal(run('career.wins'),wins,'Aborting must not advance career');
// Actual dispatches count even after a withdrawn vehicle frees a slot. Refills reuse a vehicle.
run("reset('normal');start();dispatch();S.trucks[0].state='finished';dispatch()");assert.equal(run('S.trucks.length'),2);
complete();assert.equal(run('S.report.vehicles'),2);
// Flight budget is consumed on a valid target, never by opening/cancelling target selection.
for(const [difficulty,budget] of [['leicht',3],['normal',2],['schwer',1]]){
 run(`reset('${difficulty}');start()`);el('air').onclick();el('air').onclick();assert.equal(run('S.airUsed'),0);
 for(let i=0;i<budget;i++){el('air').onclick();handlers.mappointerdown({button:0,clientX:run('S.fires[0].x'),clientY:run('S.fires[0].y')});assert.equal(run('S.airUsed'),i+1);run('S.air=null;S.airCooldown=0')}
 el('air').onclick();assert.equal(run('S.airAim'),false,'Flight cap blocks further targeting');assert.equal(el('air').disabled,true);
}
// A bonus requires outcomes, never a count of clicks. Every completed rescue earns a star.
run("reset('normal');start();S.spread.fuel=[{x:500,y:200,used:false,heat:0,source:0}];S.spread.pending=0;S.fires[0].hp=0;updateSpread(.1)");assert.equal(run('S.stats.spreadStopped'),1);
run("S.stats.spreadCount=2;S.trucks=Array.from({length:8},()=>({state:'finished'}))");complete();assert.equal(run('S.report.stars'),1);assert.equal(run('S.report.vehicles'),8);
run("$('mission').value='warehouse';reset('normal');start();S.fires[0].hp=0;updateHazard(.1)");complete();assert(run('S.report.badges.includes("Explosion verhindert")'));
run("$('mission').value='river';reset('normal');start();S.river.barrels[0].x=885;tick(.1)");assert.equal(run('S.stats.oilLeaked'),true);
console.log('PASS: session progression, practice, aborts, immutable result, dispatch accounting, flight budget and outcome-based rewards');
