// Real touch commands at the painted doors, through the complete patient handover.
const {chromium}=require('playwright'),assert=require('node:assert/strict'),fs=require('node:fs'),http=require('node:http');
(async()=>{
 const server=http.createServer((req,res)=>{const file=req.url.split('?')[0]==='/game.js'?'game.js':'index.html';res.setHeader('Content-Type',file.endsWith('.js')?'text/javascript':'text/html');res.end(fs.readFileSync(file));});
 await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve));
 const browser=await chromium.launch({headless:true,...(process.env.CHROMIUM_EXECUTABLE?{executablePath:process.env.CHROMIUM_EXECUTABLE,args:['--no-sandbox','--disable-dev-shm-usage','--use-gl=angle','--use-angle=swiftshader','--enable-unsafe-swiftshader']}: {})});
 try{
  for(const [viewport,wins,difficulty] of [[{width:390,height:844},0,'leicht'],[{width:844,height:390},2,'normal'],[{width:820,height:1180},4,'schwer']]){
   const context=await browser.newContext({viewport,hasTouch:true,isMobile:true}),page=await context.newPage(),errors=[];page.on('pageerror',e=>errors.push(e.message));
   await page.goto('http://127.0.0.1:'+server.address().port+'/?einsatz=tunnel');await page.locator('#intro-start').tap();await page.waitForFunction(()=>pendingCall?.mission==='tunnel');
   await page.evaluate(value=>{career.wins=value},wins);await page.locator('#accept-call').tap();assert.equal(await page.evaluate(()=>S.difficulty),difficulty);
   const advance=async seconds=>page.evaluate(n=>{for(let i=0;i<n*10;i++)tick(.1)},seconds);
   const tapMap=async(x,y)=>{const b=await page.locator('#map').boundingBox();await page.touchscreen.tap(b.x+x*b.width/1000,b.y+y*b.height/680)};
   await page.locator('#dispatch').tap();await advance(15);await page.locator('#units button').filter({hasText:'Feuerwehrmann 1 ·'}).tap();
   await page.locator('[data-tool="cutter"]').tap();await tapMap(725,322);assert((await page.locator('#radio').innerText()).includes('Notabschaltung'));
   await page.locator('[data-tool="switch"]').tap();await tapMap(440,230);await advance(20);assert(await page.evaluate(()=>S.tunnel.powerOff));
   await page.locator('[data-tool="rescue"]').tap();await tapMap(725,322);assert((await page.locator('#radio').innerText()).includes('Rettungsschere'));
   await page.locator('[data-tool="cutter"]').tap();await tapMap(725,322);assert.equal(await page.evaluate(()=>selected().target?.index),0);
   await page.evaluate(()=>{for(let i=0;i<300&&selected().state!=='working';i++)tick(.1)});await advance(1);
   assert((await page.locator('#hint').innerText()).includes('Sekunden'));const job=await page.evaluate(()=>selected().job);await tapMap(725,322);assert((await page.evaluate(()=>selected().job))>=job,'A repeated touch preserves rescue progress');
   await page.locator('#pause').tap();const held=await page.evaluate(()=>selected().job);await advance(20);assert.equal(await page.evaluate(()=>selected().job),held);await page.locator('#pause').tap();
   await page.screenshot({path:'/tmp/tunnel-rescue-'+viewport.width+'.png'});await advance(12);assert(await page.evaluate(()=>S.civilians[0].saved&&S.civilians[0].care==='waiting'));
   await page.locator('[data-tool="cutter"]').tap();await tapMap(855,322);await advance(35);assert(await page.evaluate(()=>S.civilians[1].saved));
   await page.selectOption('#vehicle','ambulance');await page.locator('#dispatch').tap();await advance(180);assert(await page.evaluate(()=>S.civilians.every(c=>c.care==='hospital')));
   assert.deepEqual(errors,[]);await context.close();console.log('PASS tunnel touch:',difficulty,viewport.width,viewport.height);
  }
 }finally{await browser.close();server.close()}
})().catch(error=>{console.error(error);process.exit(1)});
