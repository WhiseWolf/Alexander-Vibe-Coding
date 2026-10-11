// Headless simulation tests. Run: node test-game.cjs
const vm=require('node:vm'),fs=require('node:fs'),assert=require('node:assert/strict');
const elements=new Map(),tools=['water','foam','powder','additive','rescue'].map(tool=>({dataset:{tool},classList:{toggle(){}},disabled:false}));
function el(id){if(!elements.has(id))elements.set(id,{value:({mission:'car',count:'1',vehicle:'engine'})[id]||'',style:{},dataset:{},children:[],classList:{toggle(){}},setAttribute(){},addEventListener(n,fn){this[n]=fn},append(v){this.children.push(v)},replaceChildren(){this.children=[]},getContext(){return new Proxy({},{get:(_,key)=>key.startsWith('create')?()=>({addColorStop(){}}):()=>{}})},getBoundingClientRect(){return{x:0,y:0,left:0,top:0,width:1000,height:680}}});return elements.get(id);}
const document={getElementById:el,querySelectorAll:()=>tools,addEventListener(){},createElement:()=>({style:{},classList:{toggle(){}}})};
const c=vm.createContext({document,window:{},requestAnimationFrame(){},console});vm.runInContext(fs.readFileSync(__dirname+'/game.js','utf8'),c);const run=s=>vm.runInContext(s,c);const advance=n=>run(`for(let i=0;i<${n*10};i++)tick(.1)`);const tap=(x,y)=>el('map').pointerdown({button:0,clientX:x,clientY:y});

for(const mission of ['warehouse','accident']){
 el('mission').value=mission;run('reset();start()');el('vehicle').value='engine';el('count').value='3';run('dispatch()');advance(110);
 if(mission==='warehouse'){assert.equal(run('S.hazard.exploded'),true);assert.equal(run('S.fires.length'),5);}
 run('draw()');
 for(let ci=0;ci<run('S.civilians.length');ci++){
 run(`select('person',S.people.find(p=>p.truckId===S.trucks[0].id).id);equip(S.mission==='accident'?'cutter':'rescue')`);const c=run(`({x:S.civilians[${ci}].x,y:S.civilians[${ci}].y})`);tap(c.x,c.y);advance(50);assert.ok(run(`S.civilians[${ci}].saved`));
 }
 for(let fi=0;fi<run('S.fires.length');fi++){
 for(let attempts=0;attempts<8&&run(`S.fires[${fi}].hp>0`);attempts++){
 run('select("person",S.people.find(p=>p.truckId===S.trucks[0].id).id);equip("water")');const f=run(`({x:S.fires[${fi}].x,y:S.fires[${fi}].y})`);tap(f.x,f.y);advance(190);
 if(!run('S.done')&&run('S.trucks[0].water<20')){run('sendBack(S.trucks[0])');advance(100);}
 }
 assert.ok(run(`S.fires[${fi}].hp===0`));
 }
 assert.ok(run('S.done'));advance(100);assert.ok(run('S.trucks.every(t=>t.state==="finished")'));console.log('PASS '+mission+': rescue, all fires extinguished, refilling, completion, return and drawing');
}
el('mission').value='warehouse';run('reset();start();S.fires[0].hp=0');advance(110);assert.equal(run('S.fires.length'),3);assert.ok(run('S.hazard.resolved&&!S.hazard.exploded'));console.log('PASS: cooling the warehouse crates prevents explosion');
