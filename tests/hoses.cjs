const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),events={};
function el(id){if(!elements.has(id))elements.set(id,{value:({mission:'forest',vehicle:'engine',count:'1'})[id]||'',style:{},classList:{toggle(){}},setAttribute(){},replaceChildren(){},append(){},querySelector(){return el('panther-option')},addEventListener(n,f){events[id+n]=f},getContext(){return {}},getBoundingClientRect(){return {left:0,top:0,width:1000,height:680}}});return elements.get(id)}
const c=vm.createContext({document:{hidden:false,getElementById:el,querySelectorAll:()=>[],addEventListener(){},createElement:()=>el('temp')},window:{},requestAnimationFrame(){},console});
vm.runInContext(fs.readFileSync('game.js','utf8'),c);const run=s=>vm.runInContext(s,c),tap=(x,y)=>events.mappointerdown({button:0,clientX:x,clientY:y});
assert.equal(run('typeof hoseLengthNeeded'),'function','Hose reach must be enforced');
function step(n){run(`for(let i=0;i<${n*10};i++)tick(.1)`)}
run("reset('leicht');start();dispatch()");step(15);run("select('person',S.people[0].id);equip('water')");
assert.equal(run('selected().hoseLength'),80);
run('S.fires[0].x=900;S.fires[0].y=150');tap(900,150);assert.equal(run('selected().target'),null,'An out-of-range command is rejected');
run('extendHose();extendHose();extendHose()');assert.equal(run('selected().hoseLength'),160,'Two actual couplings extend the line up to 160m');tap(900,150);assert.equal(run('selected().target.kind'),'fire');
// A dry tank stops attacks, while a connected hydrant replenishes the actual tank.
run("equip('hydrant')");const h=run('S.hydrants[1]');tap(h.x,h.y);step(20);assert.equal(run('S.trucks[0].hydrantId'),h.id);
run('S.trucks[0].water=10;tick(1)');assert(run('S.trucks[0].water>10'));assert.equal(run('S.stats.hydrantUsed'),true);
run('S.paused=true');const water=run('S.trucks[0].water');step(5);assert.equal(run('S.trucks[0].water'),water);run('S.paused=false');
// A second truck cannot steal an occupied hydrant.
run("dispatch()");step(15);run("select('person',S.people.find(p=>p.truckId===S.trucks[1].id).id);equip('hydrant')");tap(h.x,h.y);assert.equal(run('selected().target'),null);
// Deploy an actual Y with a crew, then use its two outlets, including a range improvement.
run("select('person',S.people[0].id);equip('splitter')");tap(500,450);step(20);assert.equal(run('S.splitters.length'),1);
run("equip('water')");tap(500,450);assert.equal(run('selected().splitterId'),run('S.splitters[0].id'));
run("select('person',S.people[1].id);equip('water')");tap(500,450);assert.equal(run('S.people.filter(p=>p.splitterId===S.splitters[0].id).length'),2);
run("S.people.push({...S.people[1],id:999,splitterId:null});select('person',999);connectBranch(selected(),S.splitters[0])");assert.equal(run('selected().splitterId'),null,'A Y has only two outlets');
run("select('person',S.people[0].id);selected().hoseLength=80;selected().x=700;selected().y=250;S.fires[0].x=785;S.fires[0].y=225");
assert(run('hoseLengthNeeded(selected(),{x:700,y:250})<80'));const before=run('S.fires[0].hp');run('attack(selected(),S.fires[0],1,1)');assert(run('S.fires[0].hp')<before);assert.equal(run('S.stats.splitterUsed'),true);
run('disconnectBranch()');assert.equal(run('selected().splitterId'),null);
// Returning a vehicle disconnects its entire supply tree and frees the hydrant.
run('sendBack(S.trucks[0])');assert.equal(run('S.hydrants[1].truckId'),null);assert.equal(run('S.splitters.length'),0);assert(run('S.people.every(p=>!p.splitterId)'));
run("$('mission').value='house';reset('normal');S.house.doorOpen=true;S.house.discovered.hall=true;S.house.discovered.left=true;S.house.discovered.right=true;start();dispatch()");step(15);run("select('person',S.people[0].id);equip('water')");
assert(run('hoseLengthNeeded(selected(),{x:780,y:225})>Math.hypot(780-S.trucks[0].x,225-(S.trucks[0].y-22))*.2'),'Indoor hose length follows doors, not walls');
run("reset('leicht')");assert.equal(run('S.splitters.length'),0);assert(run('S.hydrants.every(h=>h.truckId===null)'));
console.log('PASS: reach gates, couplings/cap, hydrant work/refill/pause/ownership, Y deployment/two outlets/supply, disconnection and room-aware hose length');
