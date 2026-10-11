// Title: Sudoku Express
// Author: mbumbee and Synergenesis
// Video: https://www.youtube.com/watch?v=LUsotTGtY8A
// Source: https://sudokupad.app/ui5rcvo0p1

// Normal sudoku, quadruples, XV sums and even homes apply. The directed simple
// train path runs from R9C1 to R5C9, avoiding aliens/homes and marked XV cells.
// Capacity is two; adjacent waiting aliens board automatically and matching
// empty homes receive passengers automatically. All three aliens are delivered.
// Each visited box's path digit total equals the product of the alien digits.
// Unmarked adjacent off-path cells sum to neither 5 nor 10. No rules omitted.
// Binary keys encode the stated predicates on the 12-value alphabet.
const pair = (fn,name,...cs) => new Pair(Pair.fnToKey(fn,12),name,...cs);
const graph = cellGraph('9x9');
const cells = graph.cells();
const prefixes = ['VP','VS','VR','VT','VA','VB','VC','VM'];
const layers = prefixes.map(p => graph.makeOverlay(p));
const [pred,succ,rank8,rank11,a,b,o,mask] = layers;
const at = (layer, c) => layer.at(c);
const dirs = [[-1,0],[0,1],[1,0],[0,-1]];
const opposite = [4,5,2,3];
// Alien and home positions are specified in the rules and shown by the art.
const aliens = ['R4C5','R6C5','R5C5'];
const homes = ['R1C1','R1C9','R9C5'];
const start='R9C1', end='R5C9';
// XV edge letters drawn on the grid.
const xv = [[5,'R3C5','R3C6'],[10,'R3C6','R3C7'],[10,'R3C5','R4C5'],
 [10,'R5C4','R5C5'],[10,'R5C7','R5C8'],[10,'R2C1','R3C1'],
 [5,'R6C1','R6C2'],[5,'R6C2','R7C2'],[5,'R7C2','R7C3']];
const forbidden = new Set([...aliens,...homes,...xv.flatMap(e=>e.slice(1))]);
const adjacent = (c,t) => graph.neighbours(c).includes(t);
const neighbours = c => dirs.map(([r,k],i)=>({c:graph.step(c,r,k),code:i+2,opp:opposite[i]})).filter(n=>n.c);
const rawDomains = cells.flatMap(c => {
 const codes=neighbours(c).map(n=>n.code);
 const p=forbidden.has(c)?[1]:c===start?[6]:c===end?codes:[1,...codes];
 const s=forbidden.has(c)?[1]:c===end?[6]:c===start?codes:[1,...codes];
 return [new Given(c,1,2,3,4,5,6,7,8,9),new Given(at(pred,c),...p),new Given(at(succ,c),...s),
 new Given(at(rank8,c),1,2,3,4,5,6,7,8,9),new Given(at(rank11,c),1,2,3,4,5,6,7,8,9,10,11,12),
 new Given(at(a,c),1,2,3,4,5),new Given(at(b,c),1,2,3,4,5),new Given(at(o,c),1,2,3,4),new Given(at(mask,c),1,2,3,4,5,6,7,8,9,10)];
});
// Group repeated domain restrictions by layer and value set for translated stamps.
const domainRules = [graph,...layers].flatMap(locator => {
 const own=new Set(locator.cells());
 const grouped=new Map();
 for(const given of rawDomains){
  if(!own.has(given.cell))continue;
  const key=given.values.join(',');
  if(!grouped.has(key))grouped.set(key,{values:given.values,targets:[]});
  grouped.get(key).targets.push(given.cell);
 }
 const entries=[...grouped.values()];
 const largest={values:[...new Set(entries.flatMap(e=>e.values))],targets:locator.cells()};
 entries.push(largest);
 const pins = locator===rank8||locator===rank11?[[start,[2]]]:locator===a||locator===b?[[start,[2]],[end,[4,5]]]:locator===o?[[start,[2]],[end,[4]]]:[];
 return entries.map(({values,targets})=>{
  const narrower=rawDomains.filter(g=>own.has(g.cell)&&g.values.length<values.length&&g.values.every(v=>values.includes(v))).map(g=>g.cell);
  const extra=pins.filter(([,vs])=>vs.length<values.length&&vs.every(v=>values.includes(v))).map(([c])=>locator.at(c));
  return locator.makeReplicate(new Given(locator.cells()[0],...values),values===largest.values?locator.cells():[...new Set([...targets,...extra,...narrower])]);
 });
});
// Codes: 1 off; 2..5 point N,E,S,W; 6 marks the appropriate terminal.
const local = cells.flatMap(c => [
 pair((p,s)=>(p===1)===(s===1) && (p===1||p!==s), 'path degree',at(pred,c),at(succ,c)),
 ...[rank8,rank11,a,b,o,mask].map(layer=>pair((p,v)=>(p===1)===(v===1),'off sentinel',at(pred,c),at(layer,c)))
]);
// Edge agreement gives one predecessor and one successor per used cell.
const edges = cells.flatMap(c=>neighbours(c).map(n=>pair((s,p)=>(s===n.code)===(p===n.opp),'directed edge',at(succ,c),at(pred,n.c))));
// Coprime residues 8 and 11 rule out every subtour: 88 exceeds 81 cells.
const ranks = cells.filter(c=>c!==start).flatMap(c=>neighbours(c).map(n=>new Or([
 pair(p=>p!==n.code,'other predecessor',at(pred,c),at(pred,c)),
 new And([pair((u,v)=>u>1&&v===2+(u-1)%8,'position mod 8',at(rank8,n.c),at(rank8,c)),
 pair((u,v)=>u>1&&v===2+(u-1)%11,'position mod 11',at(rank11,n.c),at(rank11,c))])
])));
// Cargo status: 1 off, 2 waiting, 3 aboard, 4 delivered left (or orange),
// 5 delivered right. If both purple passengers are aboard, deliver upper first:
// their colours and capacity effect are identical, so this fixes identity only.
function updated(old,c) {
 const next=old.slice();
 const aboard=old.filter(v=>v===3).length;
 if(aboard>2)return undefined;
 aliens.forEach((alien,i)=>{if(adjacent(c,alien)&&next[i]===2&&next.filter(v=>v===3).length<2)next[i]=3;});
 homes.forEach((home,i)=>{
  if(!adjacent(c,home))return;
  if(i===2){if(next[2]===3)next[2]=4;return;}
  const delivered=i+4;
  if(next[0]===delivered||next[1]===delivered)return;
  const passenger=[0,1].find(j=>next[j]===3);
  if(passenger!==undefined)next[passenger]=delivered;
 });
 return next;
}
const cargoSpec = c => NFA.encodeSpec({
 startState:{phase:0,old:[]},
 transition:(s,v)=>{
  if(s.phase<3){if(v<2||v>(s.phase===2?4:5))return undefined;
   const old=[...s.old,v];if(old.filter(x=>x===3).length>2)return undefined;
   if(old.length===3){const expected=updated(old,c);return expected?{phase:3,expected}:undefined;}
   return {phase:s.phase+1,old};}
  if(v!==s.expected[s.phase-3])return undefined;
  return {phase:s.phase+1,expected:s.expected};
 },accept:s=>s.phase===6,maxDepth:6},12);
const cargo = cells.filter(c=>c!==start&&!forbidden.has(c)).flatMap(c=>{
 const spec=cargoSpec(c);
 return neighbours(c).map(n=>new Or([pair(p=>p!==n.code,'other predecessor',at(pred,c),at(pred,c)),
 new NFA(spec,'automatic boarding and delivery',...[a,b,o].map(l=>at(l,n.c)),...[a,b,o].map(l=>at(l,c)))]));
});
// Mask is digit+1 on the route and 1 elsewhere, permitting sums without a zero.
const maskSpec=NFA.encodeSpec({startState:{phase:0},transition:(s,v)=>{
 if(s.phase===0)return {phase:1,on:v!==1};
 if(s.phase===1)return {phase:2,expected:s.on?v+1:1};
 if(s.phase===2&&v===s.expected)return {phase:3};
 return undefined;
},accept:s=>s.phase===3,maxDepth:3},12);
const masked=cells.map(c=>new NFA(maskSpec,'path digit mask',at(pred,c),c,at(mask,c)));
// T = 12*(high-1)+(low-1). Nine mask offsets turn each box equation into -4.
const totals=graph.boxes().map(box=>new Or([
 new And(box.map(c=>new Given(at(mask,c),1))),
 new Sum(-4,...box.map(c=>at(mask,c)),['VH',-12],['VL',-1])
]));
const productSpec=NFA.encodeSpec({startState:{phase:0,product:1},transition:(s,v)=>{
 if(s.phase<3){const product=s.product*v;return product<=45?{phase:s.phase+1,product}:undefined;}
 if(s.phase===3)return {phase:4,product:s.product,high:v};
 if(s.phase===4&&12*(s.high-1)+v-1===s.product)return {phase:5};
 return undefined;
},accept:s=>s.phase===5,maxDepth:5},12);
// Negative XV is conditional on BOTH cells being off the path.
const negativeSpec=NFA.encodeSpec({startState:{phase:0},transition:(s,v)=>{
 if(s.phase===0)return {phase:1,off:v===1};
 if(s.phase===1)return {phase:2,off:s.off&&v===1};
 if(s.phase===2)return {phase:3,off:s.off,first:v};
 if(s.phase===3&&(!s.off||![5,10].includes(s.first+v)))return {phase:4};
 return undefined;
},accept:s=>s.phase===4,maxDepth:4},12);
const marked=new Set(xv.map(e=>e.slice(1).sort().join(',')));
const negatives=cells.flatMap(c=>[graph.step(c,0,1),graph.step(c,1,0)].filter(n=>n&&!marked.has([c,n].sort().join(','))).map(n=>new NFA(negativeSpec,'off-path negative XV',at(pred,c),at(pred,n),c,n)));
// Four corner circles and their printed multisets.
const quads=[[[3,3],[4,4,8,9]],[[3,6],[3,3,7,7]],[[6,3],[1,2,7,8]],[[6,6],[2,5,6,6]]].map(([[r,c],digits])=>new Quad(makeCellId(r,c),...digits));
return [new Shape('9x9','1-12'),...layers.map(l=>l.toVar()),new Var('H','total high',1),new Var('L','total low',1),new Given('VH',1,2,3,4),
 ...domainRules,...local,...edges,...ranks,...cargo,...masked,...totals,...negatives,...quads,
 ...xv.map(([sum,c,d])=>new Sum(sum,c,d)),...homes.map(c=>new Given(c,2,4,6,8)),
 new Given(at(rank8,start),2),new Given(at(rank11,start),2),...[a,b,o].map(l=>new Given(at(l,start),2)),
 new Given(at(a,end),4,5),new Given(at(b,end),4,5),new Given(at(o,end),4),
 new NFA(productSpec,'alien product',...aliens,'VH','VL')];
