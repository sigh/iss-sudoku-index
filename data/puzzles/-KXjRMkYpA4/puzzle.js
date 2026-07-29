// Title: RAT RUN 7: Multiple Choice
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=-KXjRMkYpA4
// Source: https://sudokupad.app/yp87tkg99m

// Normal sudoku. Finkz walks from R1C1 to R3C4 without revisiting or crossing
// herself. Orthogonal steps cannot cross a thick wall; diagonal steps need a
// wall-free 2x2 corner and cannot use a round wall-spot. Teleport pairs have
// equal digits, different pairs have different digits, and entering one forces
// the matching teleport step. Purple arrows point to the smaller digit and may
// only be crossed in their direction. Consecutive physical path digits divide
// exactly in one direction. Nothing is omitted.

const NV = 16, OFF = 1, FIRST = 2, UNUSED = 1, FWD = 2, BWD = 3;
const MOD_A = 15, MOD_B = 11;
const RAT = 'R1C1', CUPCAKE = 'R3C4';
const TELEPORTS = [['R1C7','R5C2'],['R1C8','R4C9'],['R1C9','R4C5'],['R2C4','R7C3'],['R3C8','R7C5'],['R9C1','R8C8']];
// Thick black wall polylines, transcribed from the maze drawing in lattice coordinates.
const WALLS = [
 [[2,1],[0,1],[0,9],[9,9],[9,0],[3,0],[3,2],[1,2]], [[0,1],[0,0],[3,0]],
 [[0,6],[3,6],[3,9]], [[0,7],[2,7]], [[0,8],[2,8]], [[2,6],[2,5]],
 [[6,9],[6,6],[7,6]], [[9,6],[8,6]], [[9,3],[6,3],[6,2],[8,2]],
 [[9,1],[8,1]], [[6,6],[6,5],[5,5]], [[6,5],[6,4],[7,4]], [[6,1],[7,1]],
 [[2,3],[2,4],[1,4],[1,5]], [[1,4],[1,3]], [[7,7],[7,8]], [[8,7],[8,8]],
 [[4,1],[4,2],[5,2],[5,1]], [[4,3],[5,3]], [[8,4],[8,5]],
];
// Every black round wall-spot in the drawing, in the same lattice coordinates.
const SPOTS = [[3,2],[1,2],[2,1],[1,3],[1,5],[2,3],[2,4],[2,5],[3,6],[2,7],[2,8],[4,7],[5,5],[5,4],[5,3],[4,3],[4,4],[4,1],[5,1],[5,2],[4,2],[6,4],[6,3],[6,2],[6,1],[7,1],[8,1],[8,2],[8,4],[7,4],[8,5],[8,6],[7,6],[7,7],[8,7],[8,8],[7,8],[7,5]];
// Each entry is [from,to], where the arrow points to `to`, its smaller endpoint.
const DOORS = [['R1C3','R2C3'],['R7C1','R8C1'],['R7C2','R8C2'],['R6C9','R7C9'],['R9C9','R8C9'],['R1C6','R2C6'],['R2C5','R2C6'],['R4C5','R3C5']];

const shape = new Shape('9x9', NV), graph = cellGraph(shape), cells = graph.cells();
const posA = graph.makeOverlay('VA'), posB = graph.makeOverlay('VB');
const walls = new Set();
for (const line of WALLS) for (let n=1;n<line.length;n++) {
 const [r0,c0]=line[n-1], [r1,c1]=line[n];
 if (r0===r1) for(let c=Math.min(c0,c1);c<Math.max(c0,c1);c++) walls.add(`H|${r0}|${c}`);
 else for(let r=Math.min(r0,r1);r<Math.max(r0,r1);r++) walls.add(`V|${r}|${c0}`);
}
const spots = new Set(SPOTS.map(([r,c])=>`${r}|${c}`));
const cornerOpen = (r,c) => !spots.has(`${r}|${c}`) && !walls.has(`V|${r-1}|${c}`) && !walls.has(`V|${r}|${c}`) && !walls.has(`H|${r}|${c-1}`) && !walls.has(`H|${r}|${c}`);
const allowed = (cell,dr,dc) => { const {row,col}=parseCellId(cell), r=row-1,c=col-1;
 if (!dr) return !walls.has(`V|${r}|${c+Math.max(dc,0)}`);
 if (!dc) return !walls.has(`H|${r+Math.max(dr,0)}|${c}`);
 return cornerOpen(r+Math.max(dr,0),c+Math.max(dc,0));
};
const steps=[], at=new Map(cells.map(c=>[c,[]]));
for (const cell of cells) for (const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
 const other=graph.step(cell,dr,dc); if (!other || !allowed(cell,dr,dc)) continue;
 const id='VS'+(steps.length+1); steps.push({id,a:cell,b:other,tele:false});
 at.get(cell).push({id,out:FWD,in:BWD,tele:false}); at.get(other).push({id,out:BWD,in:FWD,tele:false});
}
for (const [a,b] of TELEPORTS) { const id='VS'+(steps.length+1); steps.push({id,a,b,tele:true}); at.get(a).push({id,out:FWD,in:BWD,tele:true}); at.get(b).push({id,out:BWD,in:FWD,tele:true}); }
const byEdge = new Map(steps.map(s=>[s.a+'|'+s.b,s]));
const memo=new Map(), cached=(k,f)=>memo.has(k)?memo.get(k):(memo.set(k,f()),memo.get(k));
function cellSpec(incident,role) { const tele=incident.some(x=>x.tele), key='c|'+role+'|'+incident.map(x=>x.out+(x.tele?'t':'')).join(); return cached(key,()=>NFA.encodeSpec({
 startState:{k:0}, transition:(s,v)=>{ if(s.k===0)return{k:1,vis:v!==OFF}; if(s.k===1){if((v!==OFF)!==s.vis)return;return{k:2,vis:s.vis,i:0,o:0,t:false};} const n=s.k-2;if(n>=incident.length)return; const e=incident[n],q={k:s.k+1,vis:s.vis,i:s.i,o:s.o,t:s.t}; if(v===e.in){q.i++;if(e.tele)q.t=true;} else if(v===e.out){q.o++;if(e.tele)q.t=true;} else if(v!==UNUSED)return; return q.i>1||q.o>1?undefined:q; },
 accept:s=>s.k===2+incident.length && (role==='rat'?s.vis&&s.o===1&&s.i===0:role==='cake'?s.vis&&s.i===1&&s.o===0:!s.vis?s.i===0&&s.o===0:s.i===1&&s.o===1&&(!tele||s.t)),
 },NV)); }
const pathShape=cells.map(c=>new NFA(cellSpec(at.get(c),c===RAT?'rat':c===CUPCAKE?'cake':'plain'),'path-cell',posA.at(c),posB.at(c),...at.get(c).map(x=>x.id)));
const next=(v,m)=>FIRST+((v-FIRST+1)%m);
function orderSpec(m) { return cached('o'+m,()=>NFA.encodeSpec({startState:{k:0},transition:(s,v)=>{if(s.k===0)return{k:1,d:v};if(s.k===1)return{k:2,d:s.d,a:v};if(s.k!==2)return;if(s.d===UNUSED)return{z:true};if(s.a===OFF||v===OFF)return;if(s.d===FWD)return v===next(s.a,m)?{z:true}:undefined;return s.a===next(v,m)?{z:true}:undefined;},accept:s=>s.z===true},NV)); }
const order=steps.flatMap(s=>[new NFA(orderSpec(MOD_A),'path-order',s.id,posA.at(s.a),posA.at(s.b)),new NFA(orderSpec(MOD_B),'path-order',s.id,posB.at(s.a),posB.at(s.b))]);
const crossKey=Pair.fnToKey((a,b)=>a===UNUSED||b===UNUSED,NV), crossings=[];
for(const c of cells){const r=graph.step(c,0,1),d=graph.step(c,1,0),z=graph.step(c,1,1);if(!r||!d||!z)continue;const a=byEdge.get(c+'|'+z),b=byEdge.get(r+'|'+d);if(a&&b)crossings.push(new Pair(crossKey,'no-crossing',a.id,b.id));}
// A physical used step must join two digits one of which divides the other exactly.
const multipleSpec=cached('multiple',()=>NFA.encodeSpec({startState:{k:0},transition:(s,v)=>{if(s.k===0)return{k:1,e:v};if(s.k===1)return{k:2,e:s.e,a:v};if(s.k===2){if(s.e===UNUSED)return{z:true};return (s.a%v===0||v%s.a===0)?{z:true}:undefined;}},accept:s=>s.z===true},NV));
const multiples=steps.filter(s=>!s.tele).map(s=>new NFA(multipleSpec,'path-multiple',s.id,s.a,s.b));
const doorRules=DOORS.map(([a,b])=>new GreaterThan(a,b));
// A step variable is FWD from its recorded a to b and BWD from b to a.
// Each door therefore permits only UNUSED plus the state matching its arrow.
const doorSteps=[]; for(const s of steps.filter(s=>!s.tele)) for(const [from,to] of DOORS) {
 if (s.a===from && s.b===to) doorSteps.push(new Given(s.id,UNUSED,FWD));
 if (s.b===from && s.a===to) doorSteps.push(new Given(s.id,UNUSED,BWD));
}
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
return [shape,posA.toVar('position mod 15'),posB.toVar('position mod 11'),new Var('S','path steps',steps.length),graph.makeReplicate(new Given(cells[0],...range(1,9))),posB.makeReplicate(new Given(posB.at(cells[0]),...range(1,12))),new Given(posA.at(RAT),FIRST),new Given(posB.at(RAT),FIRST),...pathShape,...order,...crossings,...TELEPORTS.map(([a,b])=>new SameValues(2,a,b)),new AllDifferent(...TELEPORTS.map(([a])=>a)),...doorRules,...doorSteps,...multiples];
