// Exercises game completion and a new page context sharing only browser storage.
const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const code=fs.readFileSync('game.js','utf8');
function boot(memory=new Map(),blocked=false){
 const els=new Map();function el(id){if(!els.has(id))els.set(id,{value:({mission:'car',vehicle:'engine',count:'1'})[id]||'',style:{},classList:{toggle(){}},setAttribute(){},replaceChildren(){},append(){},querySelector(){return el('panther-option')},addEventListener(){},getContext(){return {}}});return els.get(id)}
 const window={};Object.defineProperty(window,'localStorage',{get(){if(blocked==='read')throw Error('Storage blocked');return {getItem:k=>memory.get(k)??null,setItem(k,v){if(blocked==='write')throw Error('Quota exceeded');memory.set(k,v)}}}});
 const c=vm.createContext({document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},createElement:()=>el('tmp')},window,requestAnimationFrame(){},console});vm.runInContext(code,c);
 const run=s=>vm.runInContext(s,c);
 function complete({mission='car',difficulty='normal',seconds=60,vehicles=2,incident=false}={}){
  el('mission').value=mission;run(`reset('${difficulty}');start()`);
  el('vehicle').value='engine';el('count').value=String(Math.min(3,vehicles));run('dispatch()');
  if(vehicles===4){el('vehicle').value='ambulance';el('count').value='1';run('dispatch()')}
  run(`S.elapsed=${seconds-.1};S.stats.spreadCount=${incident?1:0};S.fires.forEach(f=>f.hp=0);S.civilians.forEach(c=>{c.saved=true;c.care='hospital'});if(S.river)S.river.barrels.forEach(b=>b.secured=true);if(S.tunnel)S.tunnel.powerOff=true;tick(.1)`);
  assert(run('S.done'));
 }
 return {run,complete,memory};
}
const memory=new Map([['unrelated-game','keep me']]);let game=boot(memory);
game.complete();let reloaded=boot(memory);
assert.equal(reloaded.run('career.wins'),1,'Successful progress must survive a new page');
assert.equal(reloaded.run('career.records["career:car:normal"].bestSeconds'),60);
assert.equal(reloaded.run('career.records["career:car:normal"].bestVehicles'),2);
assert.equal(reloaded.run('career.records["career:car:normal"].bestStars'),3);
assert.equal(memory.get('unrelated-game'),'keep me');
reloaded.complete({seconds:80,vehicles:1});reloaded.complete({seconds:40,vehicles:4,incident:true});
game=boot(memory);assert.equal(game.run('career.records["career:car:normal"].bestSeconds'),40);
assert.equal(game.run('career.records["career:car:normal"].bestVehicles'),1);
assert.equal(game.run('career.records["career:car:normal"].bestStars'),3);
assert.equal(game.run('career.records["career:car:normal"].runs'),3);
game.complete({seconds:80,vehicles:2});assert.equal(game.run('S.report.recordChanges.length'),0,'Worse attempts cannot replace records');
game.run('career.practice=true');game.complete({seconds:20});game.complete({difficulty:'leicht',seconds:15});
game=boot(memory);assert.equal(game.run('career.wins'),4,'Practice must not advance career');
assert.equal(game.run('career.records["practice:car:normal"].bestSeconds'),20);
assert.equal(game.run('career.records["practice:car:leicht"].bestSeconds'),15);
assert.equal(game.run('career.records["career:car:normal"].bestSeconds'),40);
game.complete({mission:'forest',seconds:120});assert.equal(game.run('career.records["career:forest:normal"].bestSeconds'),120);
game.run("career.tutorial=true;career.practice=true;career.lesson='accident'");game.complete({mission:'accident'});
game=boot(memory);assert(game.run('career.lessons.includes("accident")'));assert.equal(game.run('Object.keys(career.records).length'),4,'Tutorials earn no competitive record');
const stored=memory.get(game.run('PROGRESS_KEY'));game.run('start();tick(1);reset()');assert.equal(memory.get(game.run('PROGRESS_KEY')),stored,'Aborts cannot create records');
for(const blocked of ['read','write']){const fallback=boot(new Map(),blocked);fallback.complete();assert.equal(fallback.run('career.wins'),1);assert.equal(fallback.run('deviceStorageState'),'blocked','Storage failures must preserve play and be visible')}
const broken=new Map([[game.run('PROGRESS_KEY'),'{not valid JSON']]);const recovered=boot(broken);assert.equal(recovered.run('career.wins'),0);recovered.complete();assert.equal(boot(broken).run('career.wins'),1);
const invalid=new Map([[game.run('PROGRESS_KEY'),JSON.stringify({version:1,wins:-5,lessons:['accident','unknown','accident'],records:{'career:car:normal':{bestSeconds:-1,bestVehicles:2,bestStars:3,runs:1},'anything':{}}})]]);
const sanitized=boot(invalid);assert.equal(sanitized.run('career.wins'),0);assert.equal(sanitized.run('career.lessons.length'),1);assert.equal(sanitized.run('Object.keys(career.records).length'),0);
const shared=new Map(),tabOne=boot(shared),tabTwo=boot(shared);
tabOne.complete({seconds:40,vehicles:1});tabTwo.complete({seconds:80,vehicles:3});
const merged=boot(shared);assert.equal(merged.run('career.records["career:car:normal"].bestSeconds'),40,'An older tab must not overwrite a better record');assert.equal(merged.run('career.wins'),2);
console.log('PASS: persistent progress/lessons, independent records, mode/difficulty/mission separation, aborts, storage failure and malformed data recovery');
