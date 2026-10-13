const fs=require('node:fs'),vm=require('node:vm'),assert=require('node:assert/strict');
const elements=new Map(),events={};
function el(id){if(!elements.has(id))elements.set(id,{value:id==='mission'?'house':id==='count'?'1':id==='vehicle'?'engine':'',style:{},classList:{toggle(){}},setAttribute(){},replaceChildren(){},append(){},querySelector(){return el('panther-option');},addEventListener(name,fn){events[name]=fn;},getContext(){return {};}});return elements.get(id);}
const sandbox={document:{getElementById:el,querySelectorAll:()=>[],addEventListener(){},hidden:false,createElement:()=>el('temp')},window:{},requestAnimationFrame(){},console,Math};vm.createContext(sandbox);vm.runInContext(fs.readFileSync(require('node:path').join(__dirname,'../game.js'),'utf8'),sandbox);
const run=s=>vm.runInContext(s,sandbox);
run(`reset('schwer');start();`);
assert.equal(run('S.civilians.length'),2);
assert.equal(run('houseVisible(S.fires[0])'),false);
run('S.house.powerOff=true;S.house.doorOpen=true;S.house.discovered.hall=true;');
assert.equal(run('houseVisible(S.civilians[0])'),false);
run(`S.people.push({id:101,truckId:1,x:590,y:390,state:'idle'});discoverHouse();`);
assert.equal(run('S.house.discovered.left'),false);
run('S.people[0].y=340;discoverHouse();');
assert.equal(run('S.house.discovered.left'),true);
assert.equal(run('S.house.discovered.right'),false);
run('S.people[0].x=740;discoverHouse();');assert.equal(run('houseVisible(S.civilians[0])'),true);
run(`S.people=[];const walker={truckId:1,x:590,y:300};const goal={x:780,y:225};let guard=0;while(!move(walker,goal,.1,70)&&guard++<1000){if(walker.x>650&&walker.x<680)assertWall(walker.y);} globalThis.walkerResult=walker;` .replace('assertWall(walker.y)',`(()=>{if(walker.y<365)throw Error('Crossed wall')})()`));
assert.equal(run('walkerResult.x'),780);
run(`$('vehicle').value='panther';dispatch();`);assert.equal(run('S.trucks.length'),0);
run(`$('vehicle').value='engine';$('count').value='4';dispatch();`);assert.equal(run('S.trucks.length'),0);
run(`$('count').value='3';dispatch();$('vehicle').value='ambulance';$('count').value='1';dispatch();`);assert.equal(run('activeVehicles().length'),4);
run('dispatch()');assert.equal(run('S.trucks.length'),4);
run(`S.trucks[0].state='ready';sendBack(S.trucks[0],false,true);`);assert.equal(run('activeVehicles().length'),4);
run('for(let i=0;i<200;i++)tick(.1);');assert.equal(run('activeVehicles().length'),3);
run(`$('vehicle').value='engine';dispatch();`);assert.equal(run('activeVehicles().length'),4);
run(`$('mission').value='airport';reset('normal');start();$('vehicle').value='panther';$('count').value='2';dispatch();`);assert.equal(run('S.trucks.length'),0);
run(`$('count').value='1';dispatch();$('vehicle').value='panther';dispatch();`);assert.equal(run('S.trucks.length'),1);
// A single ambulance must still transport both patients under the limit.
run(`$('mission').value='house';reset('schwer');start();$('vehicle').value='ambulance';dispatch();S.fires.forEach(f=>f.hp=0);S.civilians.forEach((c,i)=>{c.saved=true;c.care='waiting';c.x=850+i*40;c.y=460;});for(let i=0;i<2500&&!S.done;i++)tick(.1);`);
assert.equal(run('S.civilians.every(c=>c.care==="hospital")'),true);assert.equal(run('S.done'),true);
for(const mission of ['car','forest','airport','warehouse','accident','river','tunnel','house']){el('mission').value=mission;run(`reset('normal');start();`);assert.equal(run('activeVehicles().length'),0);}
console.log('PASS: room visibility, wall-safe routes, four-vehicle limit, reserved ambulance slot, withdrawal, Panther restrictions, two-patient ambulance transport and all eight mission resets.');
