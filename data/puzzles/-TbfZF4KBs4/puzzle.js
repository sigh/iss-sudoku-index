// Title: RAT RUN 8: Discontinuous
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=-TbfZF4KBs4
// Source: https://sudokupad.app/etuf5ak2y4

// Normal sudoku; Finkz walks from the rat to the cupcake without repeating a
// cell, crossing herself, a thick wall, a round wall-spot, or a red-X door.
// Doublers occur once in every row, column and box and carry distinct digits.
// Blackcurrants are 1:2 value pairs; red Xs sum to 10 in values.
// The box-segment Nabner rule is omitted: its solver-chosen segment identity
// needs an unbounded route-order layer.

const NV = 16;
const OFF = 1, FIRST = 2;
const UNUSED = 1, FWD = 2, BWD = 3;
const RAT = 'R2C1', CUPCAKE = 'R1C8';
const MOD_A = 15, MOD_B = 11;

const WALLS = [
  [[8,1],[6,1],[6,2],[3,2],[3,8]], [[4,2],[4,1]], [[3,4],[4,4]],
  [[2,4],[0,4],[0,9],[9,9],[9,0],[5,0],[5,1]], [[0,4],[0,0],[5,0]],
  [[9,3],[8,3]], [[2,0],[2,3],[1,3]], [[3,0],[3,1]], [[1,1],[1,2]],
  [[4,7],[4,8]], [[4,6],[6,6]], [[4,5],[6,5]], [[5,5],[5,4]],
  [[6,3],[4,3]], [[7,3],[7,4],[8,4]], [[7,4],[7,5]],
  [[7,8],[7,6],[8,6],[8,5]], [[7,2],[8,2]], [[6,7],[6,8]], [[1,5],[2,5]],
];
const SPOTS = [[6,4],[2,6],[2,7],[1,6],[1,7],[2,5],[1,5],[4,7],[4,8],[6,7],[6,8],[7,8],[7,6],[8,6],[8,5],[8,3],[8,2],[8,1],[7,2],[7,3],[8,4],[7,5],[6,5],[6,6],[4,6],[4,5],[4,3],[6,3],[6,2],[6,1],[5,1],[4,1],[3,1],[3,2],[4,4],[3,8],[2,4],[1,3],[2,3],[1,2],[1,1],[5,4]];
const BLACKS = [['R8C2','R9C2'],['R3C1','R3C2'],['R7C3','R8C3'],['R8C7','R8C8'],['R8C3','R8C4'],['R8C8','R8C9'],['R8C8','R9C8'],['R6C4','R7C4'],['R6C4','R6C5'],['R7C4','R7C5'],['R6C5','R7C5'],['R6C6','R7C6'],['R5C8','R5C9'],['R4C6','R4C7'],['R1C1','R1C2'],['R2C7','R2C8'],['R1C8','R1C9']];
const DOORS = [['R4C9','R5C9'],['R4C6','R5C6'],['R3C5','R3C6']];

const wallSeg = new Set();
for (const poly of WALLS) for (let i = 1; i < poly.length; i++) {
  const [r0,c0] = poly[i - 1], [r1,c1] = poly[i];
  if (r0 === r1) for (let c = Math.min(c0,c1); c < Math.max(c0,c1); c++) wallSeg.add(`H|${r0}|${c}`);
  else for (let r = Math.min(r0,r1); r < Math.max(r0,r1); r++) wallSeg.add(`V|${r}|${c0}`);
}
const spotSet = new Set(SPOTS.map(([r,c]) => `${r}|${c}`));
const orthBlocked = (r0,c0,r1,c1) => r0 === r1
  ? wallSeg.has(`V|${r0}|${Math.min(c0,c1)+1}`)
  : wallSeg.has(`H|${Math.min(r0,r1)+1}|${c0}`);
const cornerOpen = (r,c) => !spotSet.has(`${r}|${c}`) && !wallSeg.has(`V|${r-1}|${c}`)
  && !wallSeg.has(`V|${r}|${c}`) && !wallSeg.has(`H|${r}|${c-1}`) && !wallSeg.has(`H|${r}|${c}`);

const shape = new Shape('9x9', NV);
const graph = cellGraph(shape);
const cells = graph.cells();
const flags = graph.makeOverlay('VD');
const posA = graph.makeOverlay('VA'), posB = graph.makeOverlay('VB');
const flag = c => flags.at(c);
const interleave = cs => cs.flatMap(c => [c, flag(c)]);

const steps = [];
for (const cell of cells) {
  const {row,col} = parseCellId(cell), r = row - 1, c = col - 1;
  for (const [dr,dc] of [[0,1],[1,0],[1,1],[1,-1]]) {
    const other = graph.step(cell,dr,dc); if (!other) continue;
    if ((dr === 0 || dc === 0) ? orthBlocked(r,c,r+dr,c+dc) : !cornerOpen(r+1, dc === 1 ? c+1 : c)) continue;
    if (DOORS.some(([a,b]) => (a === cell && b === other) || (a === other && b === cell))) continue;
    steps.push({a:cell,b:other});
  }
}
const stepVar = new Var('S','path steps',steps.length);
steps.forEach((s,i) => { s.id = stepVar.cell(i+1); });
const stepByPair = new Map(steps.map(s => [s.a+'|'+s.b,s]));
const between = (a,b) => stepByPair.get(a+'|'+b) || stepByPair.get(b+'|'+a);
const incident = new Map(cells.map(c => [c,[]]));
for (const s of steps) { incident.get(s.a).push({id:s.id,out:FWD,in:BWD}); incident.get(s.b).push({id:s.id,out:BWD,in:FWD}); }

const cache = new Map();
const spec = (key, build) => { if (!cache.has(key)) cache.set(key, build()); return cache.get(key); };
const degree = (edges, role) => spec(`degree|${role}|${edges.map(e => e.out).join('')}`, () => NFA.encodeSpec({
  startState:{k:0},
  transition:(s,v) => {
    if (s.k === 0) return {k:1,visited:v !== OFF};
    if (s.k === 1) return (v !== OFF) === s.visited ? {k:2,visited:s.visited,inn:0,out:0} : undefined;
    const e = edges[s.k-2]; if (!e) return undefined;
    const inn = s.inn + (v === e.in), out = s.out + (v === e.out);
    if (v !== UNUSED && v !== e.in && v !== e.out || inn > 1 || out > 1) return undefined;
    return {k:s.k+1,visited:s.visited,inn,out};
  },
  accept:s => s.k === edges.length+2 && (role === 'rat' ? s.visited && s.inn === 0 && s.out === 1 : role === 'cake' ? s.visited && s.inn === 1 && s.out === 0 : s.visited ? s.inn === 1 && s.out === 1 : s.inn === 0 && s.out === 0),
},NV));
const next = (v,m) => FIRST + ((v-FIRST+1)%m);
const counter = m => spec(`counter|${m}`, () => NFA.encodeSpec({
  startState:{k:0}, transition:(s,v) => s.k === 0 ? {k:1,d:v} : s.k === 1 ? {k:2,d:s.d,a:v} : s.d === UNUSED ? {done:true} : s.a === OFF || v === OFF ? undefined : s.d === FWD ? (v === next(s.a,m) ? {done:true} : undefined) : (s.a === next(v,m) ? {done:true} : undefined), accept:s => s.done === true,
},NV));
const noCrossKey = Pair.fnToKey((a,b) => a === UNUSED || b === UNUSED,NV);

const oneDoubler = digit => spec(`doubler|${digit}`, () => NFA.encodeSpec({
  startState:{phase:'digit',count:0}, transition:(s,v) => {
    if (s.phase === 'digit') return {phase:'flag',digit:v,count:s.count};
    if (v !== 1 && v !== 2) return undefined;
    const count = s.count + (s.digit === digit && v === 2); return count > 1 ? undefined : {phase:'digit',count};
  }, accept:s => s.phase === 'digit' && s.count === 1,
},NV));
const effectivePair = (name,pred) => spec(name, () => NFA.encodeSpec({
  startState:{phase:'d1'}, transition:(s,v) => {
    if (s.phase === 'd1') return {phase:'f1',d:v}; if (s.phase === 'f1') return v === 1 || v === 2 ? {phase:'d2',a:s.d*v} : undefined;
    if (s.phase === 'd2') return {phase:'f2',a:s.a,d:v}; return v === 1 || v === 2 && pred(s.a,s.d*v) ? {done:true} : undefined;
  }, accept:s => s.done === true,
},NV));
const ratio = effectivePair('blackcurrant',(a,b) => a === 2*b || b === 2*a);
const ten = effectivePair('red-x',(a,b) => a+b === 10);

return [
  shape, flags.toVar('doublers'), flags.makeReplicate(new Given(flag(cells[0]),1,2),flags.at(cells)),
  ...graph.rows().map(x => new Sum(10,...flags.at(x))), ...graph.columns().map(x => new Sum(10,...flags.at(x))), ...graph.boxes().map(x => new Sum(10,...flags.at(x))),
  ...Array.from({length:9},(_,i) => new NFA(oneDoubler(i+1),`doubler digit ${i+1}`,...interleave(cells))),
  ...BLACKS.map(([a,b]) => new NFA(ratio,'blackcurrant',...interleave([a,b]))), ...DOORS.map(([a,b]) => new NFA(ten,'red-x',...interleave([a,b]))),
  stepVar, posA.toVar('path position mod 15'), posB.toVar('path position mod 11'),
  posA.makeReplicate(new Given(posA.cells()[0],OFF,...Array.from({length:15},(_,i) => FIRST+i)),posA.at(cells)), posB.makeReplicate(new Given(posB.cells()[0],OFF,...Array.from({length:11},(_,i) => FIRST+i)),posB.at(cells)),
  new Given(posA.at(RAT),FIRST), new Given(posB.at(RAT),FIRST),
  ...cells.map(c => new NFA(degree(incident.get(c),c === RAT ? 'rat' : c === CUPCAKE ? 'cake' : 'plain'),'path-cell',posA.at(c),posB.at(c),...incident.get(c).map(e => e.id))),
  ...steps.flatMap(s => [new NFA(counter(MOD_A),'path-order',s.id,posA.at(s.a),posA.at(s.b)),new NFA(counter(MOD_B),'path-order',s.id,posB.at(s.a),posB.at(s.b))]),
  ...cells.flatMap(c => { const r=graph.step(c,0,1),d=graph.step(c,1,0),x=graph.step(c,1,1); const a=x&&between(c,x),b=r&&d&&between(r,d); return a&&b?[new Pair(noCrossKey,'no-crossing',a.id,b.id)]:[]; }),
];
