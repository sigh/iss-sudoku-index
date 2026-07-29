// Title: RAT RUN 10: Sensored
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=aonJknbuSdU
// Source: https://sudokupad.app/fjayk4klcz

// Normal sudoku. Finkz walks from R4C4 to R9C9 without revisiting a cell,
// crossing herself, or passing through yellow-green maze walls. Orthogonal
// moves cross no wall; diagonal moves cross no wall or round wall-spot at the
// 2x2 block's shared corner. Blackcurrants are 1:2 digit pairs. Pink sensors
// Cage digits are distinct; a cage whose electricity-symbol digit is 5 or more
// is not entered.
//
// Omitted: motion sensors and the TEST CONSTRAINT's successive solver-chosen
// cage-entry totals.

const NV = 16, OFF = 1, FIRST = 2, UNUSED = 1, FWD = 2, BWD = 3;
const MOD_A = 15, MOD_B = 11;
const RAT = 'R4C4', CUPCAKE = 'R9C9';
const WALLS = [
  [[7,1],[8,1]], [[7,2],[9,2],[9,9],[0,9],[0,6],[1,6]],
  [[9,2],[9,0],[0,0],[0,6]], [[9,5],[7,5]], [[8,7],[8,8]],
  [[6,1],[6,4]], [[7,3],[7,4],[8,4]], [[7,8],[7,7],[5,7]],
  [[7,6],[5,6]], [[5,8],[2,8]], [[4,7],[1,7]], [[1,4],[1,5]],
  [[2,4],[2,6]], [[3,6],[4,6]], [[3,4],[3,5],[6,5]], [[3,3],[4,3]],
  [[4,1],[4,2]], [[5,1],[5,2]], [[3,2],[1,2]], [[1,3],[2,3]], [[4,4],[5,4]],
];
const SPOTS = [[5,1],[5,2],[4,1],[4,2],[3,2],[2,1],[1,2],[1,3],[2,3],[1,4],[1,5],[1,6],[2,4],[2,6],[1,7],[2,8],[5,8],[4,7],[5,7],[7,8],[8,7],[7,6],[5,6],[6,5],[7,5],[8,4],[7,3],[7,2],[7,1],[6,1],[6,4],[5,4],[4,4],[4,3],[3,3],[3,4],[8,1],[7,7],[7,4],[3,5],[3,6],[4,6],[8,8]];
const BLACK = [['R4C4','R5C4'],['R4C5','R5C5'],['R7C3','R7C4'],['R7C6','R8C6'],['R3C6','R4C6']];
const SENSORS = ['R1C2','R1C8','R2C1','R3C5','R5C2','R5C5','R5C6','R6C1','R6C9','R7C6','R8C1','R8C2','R8C3','R8C5','R9C1','R9C2'];
const CAGES = [
  { cells:['R9C3','R9C4'], shock:'R9C4' }, { cells:['R6C1','R6C2'], shock:'R6C2' },
  { cells:['R6C3'], shock:'R6C3' }, { cells:['R6C5'], shock:'R6C5' },
  { cells:['R3C1'], shock:'R3C1' }, { cells:['R3C3','R3C4'], shock:'R3C4' },
  { cells:['R1C5','R1C6'], shock:'R1C6' }, { cells:['R2C5','R2C6','R2C7'], shock:'R2C6' },
  { cells:['R4C9'], shock:'R4C9' }, { cells:['R8C7','R8C8'], shock:'R8C8' },
  { cells:['R5C7'], shock:'R5C7' }, { cells:['R3C7'], shock:'R3C7' },
  { cells:['R7C2','R7C3'], shock:'R7C3' },
];

const shape = new Shape('9x9', NV), graph = cellGraph(shape), cells = graph.cells();
const posA = graph.makeOverlay('VA'), posB = graph.makeOverlay('VB');
const memo = new Map();
const cached = (key, build) => { if (!memo.has(key)) memo.set(key, build()); return memo.get(key); };
const wallH = new Set(), wallV = new Set();
for (const line of WALLS) for (let n = 1; n < line.length; n++) {
  const [a,b] = [line[n-1],line[n]];
  if (a[0] === b[0]) for (let c = Math.min(a[1],b[1]); c < Math.max(a[1],b[1]); c++) wallH.add(`${a[0]}|${c}`);
  else for (let r = Math.min(a[0],b[0]); r < Math.max(a[0],b[0]); r++) wallV.add(`${r}|${a[1]}`);
}
const spots = new Set(SPOTS.map(x => x.join('|')));
const legal = (r,c,dr,dc) => {
  if (dr === 0) return !wallV.has(`${r}|${c + Math.max(dc,0)}`);
  if (dc === 0) return !wallH.has(`${r + Math.max(dr,0)}|${c}`);
  const i = r + 1, j = c + Math.max(dc,0);
  return !spots.has(`${i}|${j}`) && !wallV.has(`${i-1}|${j}`) && !wallV.has(`${i}|${j}`) && !wallH.has(`${i}|${j-1}`) && !wallH.has(`${i}|${j}`);
};

const steps = [], at = new Map(cells.map(x => [x,[]])), byOrigin = new Map();
for (let r=0;r<9;r++) for (let c=0;c<9;c++) for (const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
  const r2=r+dr,c2=c+dc; if (r2<0||r2>8||c2<0||c2>8||!legal(r,c,dr,dc)) continue;
  const a=makeCellId(r+1,c+1), b=makeCellId(r2+1,c2+1), id='VS'+(steps.length+1), s={id,a,b};
  steps.push(s); at.get(a).push({id,in:BWD,out:FWD}); at.get(b).push({id,in:FWD,out:BWD}); byOrigin.set(`${r},${c},${dr},${dc}`,s);
}
const sig = incident => incident.map(s => s.in+'/'+s.out).join(',');
const degreeSpec = (incident, role) => cached(`degree|${role}|${sig(incident)}`, () => NFA.encodeSpec({
  startState:{k:0}, transition:(s,v) => {
    if (s.k===0) return {k:1,vis:v!==OFF,ins:0,outs:0};
    const n=s.k-1; if(n>=incident.length) return undefined; const e=incident[n], q={...s,k:s.k+1};
    if(v===e.in) q.ins++; else if(v===e.out) q.outs++; else if(v!==UNUSED) return undefined;
    return q.ins<=1&&q.outs<=1?q:undefined;
  }, accept:s => s.k===incident.length+1 && (role==='rat' ? s.vis&&s.ins===0&&s.outs===1 : role==='cake' ? s.vis&&s.ins===1&&s.outs===0 : !s.vis ? s.ins===0&&s.outs===0 : s.ins===1&&s.outs===1),
},NV));
const path = cells.map(cell => new NFA(degreeSpec(at.get(cell),cell===RAT?'rat':cell===CUPCAKE?'cake':'plain'),'path-cell',posA.at(cell),...at.get(cell).map(x=>x.id)));
const next = (v,m) => FIRST + ((v-FIRST+1)%m);
const counterSpec = m => cached('counter'+m,()=>NFA.encodeSpec({startState:{k:0},transition:(s,v)=>{
  if(s.k===0)return{k:1,d:v}; if(s.k===1)return{k:2,d:s.d,a:v}; if(s.k!==2)return undefined;
  if(s.d===UNUSED)return{done:true}; if(s.a===OFF||v===OFF)return undefined;
  return s.d===FWD ? (v===next(s.a,m)?{done:true}:undefined) : (s.a===next(v,m)?{done:true}:undefined);
},accept:s=>s.done===true},NV));
const counters=steps.flatMap(s=>[new NFA(counterSpec(MOD_A),'path-order',s.id,posA.at(s.a),posA.at(s.b)),new NFA(counterSpec(MOD_B),'path-order',s.id,posB.at(s.a),posB.at(s.b))]);
const crossKey=cached('cross',()=>Pair.fnToKey((a,b)=>a===UNUSED||b===UNUSED,NV)); const crosses=[];
for(let r=0;r<8;r++)for(let c=0;c<8;c++){const a=byOrigin.get(`${r},${c},1,1`),b=byOrigin.get(`${r},${c+1},1,-1`);if(a&&b)crosses.push(new Pair(crossKey,'no-crossing',a.id,b.id));}
const black=BLACK.map(x=>new BlackDot(...x));
const sensorSpec=n=>cached('sensor'+n,()=>NFA.encodeSpec({startState:{k:0,count:0},transition:(s,v)=>{
  if(s.k<n)return{k:s.k+1,count:s.count+(v!==OFF?1:0)}; return s.k===n&&v===s.count?{done:true}:undefined;
},accept:s=>s.done===true},NV));
const sensors=SENSORS.map(cell=>{const box=[cell,...graph.kingNeighbours(cell)];return new NFA(sensorSpec(box.length),'motion-sensor',...posA.at(box),cell);});
const shockSpec=n=>cached('shock'+n,()=>NFA.encodeSpec({startState:{k:-1},transition:(s,v)=>{
  if(s.k===-1)return{k:0,blocked:v>=5}; if(s.k>=n||s.blocked&&v!==OFF)return undefined; return{k:s.k+1,blocked:s.blocked};
},accept:s=>s.k===n},NV));
const singleShockKey=cached('single-shock',()=>Pair.fnToKey((digit,pos)=>digit<5||pos===OFF,NV));
const cages=CAGES.flatMap(c=>c.cells.length===1
  ? [new Pair(singleShockKey,'shock-value',c.shock,posA.at(c.cells[0]))]
  : [new AllDifferent(...c.cells),new NFA(shockSpec(c.cells.length),'shock-value',c.shock,...posA.at(c.cells))]);
const range=(a,b)=>Array.from({length:b-a+1},(_,i)=>a+i);
return [shape,posA.toVar('path position mod '+MOD_A),posB.toVar('path position mod '+MOD_B),new Var('S','path steps',steps.length),graph.makeReplicate(new Given(cells[0],...range(1,9))),posB.makeReplicate(new Given(posB.at(cells[0]),...range(1,MOD_B))),new Given(posA.at(RAT),FIRST),new Given(posB.at(RAT),FIRST),...path,...counters,...crosses,...black,...cages];
