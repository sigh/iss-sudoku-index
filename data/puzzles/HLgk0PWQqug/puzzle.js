// Title: Feeding Friendsy: The Sincerest Form Of Flattery
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=HLgk0PWQqug
// Source: https://sudokupad.app/nh9ef1t01i

// Digits 1-9 do not repeat in rows, columns or overlapping 3x3 boxes.
// Fletcher follows a non-repeating, non-crossing route from flamingo to bed,
// respecting crust walls and rounded corners; teleports transfer immediately
// and contain equal digits. Each maximal in-box route segment is an index line.
const shape = new Shape('7x7', '0-10');
const cells = Array.from({length: 49}, (_, i) => makeCellId(1 + Math.floor(i / 7), 1 + i % 7));
const coord = i => [Math.floor(i / 7), i % 7];
const field = (prefix, i) => prefix + (i + 1);
const pred = i => field('VP', i), succ = i => field('VS', i);
const hi = i => field('VH', i), lo = i => field('VL', i);
const digits = Array.from({length: 9}, (_, i) => i + 1);
const ports = Array.from({length: 10}, (_, i) => i + 1);
// Codes 1..8 are clockwise compass directions from north, 9 teleport,
// 10 the external endpoint; 0 means this cell is not on the route.
const deltas = [[-1,0],[-1,1],[0,1],[1,1],[1,0],[1,-1],[0,-1],[-1,-1]];
const opposite = code => (code + 3) % 8 + 1;
// Dashed box starts and red A cells from the drawing.
const starts = [0,2,4];
const boxes = starts.flatMap(r => starts.map(c => Array.from({length: 9}, (_, k) => (r + Math.floor(k / 3)) * 7 + c + k % 3)));
const teleport = new Map([[13,39],[39,13]]);
const start = 41, end = 6;
// Thick brown wall polylines and the rounded obstacle discs, in lattice units.
const walls = [
  [[5,5],[7,5],[7,7],[0,7],[0,0],[7,0],[7,5]],
  [[5,7],[5,6],[6,6]], [[3,7],[3,6]], [[3,5],[4,5]],
  [[3,4],[4,4]], [[3,1],[4,1],[4,2]],
];
const discs = [[6,6],[5,6],[4,4],[4,5],[5,5],[3,5],[3,4],[4,1],[3,1],[2,2],[6,3],[2,1],[4,2],[3,6]];
const blockedVertices = new Set(discs.map(p => p.join(',')));
const blockedEdges = new Set();
const edgeKey = (a,b) => [Math.min(a,b), Math.max(a,b)].join(',');
// A wall blocks the orthogonal step through each unit edge and both diagonals
// through its endpoint vertices, including its rounded ends.
for (const poly of walls) for (let k = 1; k < poly.length; k++) {
  const [r,c] = poly[k-1], [rr,cc] = poly[k];
  const dr = Math.sign(rr-r), dc = Math.sign(cc-c);
  const length = Math.abs(rr-r) + Math.abs(cc-c);
  for (let t = 0; t <= length; t++) blockedVertices.add([r+t*dr,c+t*dc].join(','));
  for (let t = 0; t < length; t++) {
    const y = r+t*dr, x = c+t*dc;
    if (dc && y > 0 && y < 7) {
      const col = Math.min(x,x+dc);
      blockedEdges.add(edgeKey((y-1)*7+col,y*7+col));
    }
    if (dr && x > 0 && x < 7) {
      const row = Math.min(y,y+dr);
      blockedEdges.add(edgeKey(row*7+x-1,row*7+x));
    }
  }
}
const moves = cells.map((_, i) => {
  const [r,c] = coord(i);
  return deltas.flatMap(([dr,dc], k) => {
    const rr = r+dr, cc = c+dc;
    if (rr < 0 || rr >= 7 || cc < 0 || cc >= 7) return [];
    const j = rr*7+cc;
    if (dr && dc ? blockedVertices.has([Math.max(r,rr),Math.max(c,cc)].join(',')) : blockedEdges.has(edgeKey(i,j))) return [];
    return [{j,code:k+1,reverse:opposite(k+1)}];
  }).concat(teleport.has(i) ? [{j:teleport.get(i),code:9,reverse:9}] : []);
});
const eq = (a,b) => new SameValues(2,a,b);
const not = (cell, code) => new Given(cell,...Array.from({length:11},(_,i)=>i).filter(x=>x!==code));
const pair = (fn,name,a,b) => new Pair(Pair.fnToKey(fn,shape),name,a,b);
const routeDomains = cells.flatMap((_,i) => [
  new Given(cells[i],...digits), new Given(hi(i),0,1,2,3,4,5,6),
  new Given(lo(i),0,1,2,3,4,5,6,7),
  new Given(pred(i),0,...moves[i].map(m=>m.code),...(i===start?[10]:[])),
  new Given(succ(i),0,...moves[i].map(m=>m.code),...(i===end?[10]:[])),
  // The off-route sentinel pins all rank fields; active ranks are nonzero.
  new Or([new And([new Given(pred(i),0),new Given(succ(i),0),new Given(hi(i),0),new Given(lo(i),0)]),
    new And([new Given(pred(i),...ports),new Given(succ(i),...ports),new Or([new Given(hi(i),1,2,3,4,5,6),new Given(lo(i),1,2,3,4,5,6,7)])])])
]);
// Selected successor/predecessor ports must agree at both ends. Base-8 ranks
// increase at every selected edge, so disconnected cycles cannot survive.
const edges = cells.flatMap((_,i) => moves[i].flatMap(({j,code,reverse}) => [
  pair((a,b)=>(a===code)===(b===reverse),'port agreement',succ(i),pred(j)),
  new Or([not(succ(i),code),new Sum(1,[hi(j),8],lo(j),[hi(i),-8],[lo(i),-1])])
]));
const teleportRules = [...teleport.keys()].map(i =>
  // A teleport has one transport edge and one local edge when visited.
  pair((a,b)=>(a===0&&b===0)||(a===9&&b>=1&&b<=8)||(b===9&&a>=1&&a<=8),
    'immediate teleport',pred(i),succ(i)));
// Two diagonals crossing the same 2x2 cannot both be used, in either direction.
const crossings = Array.from({length:36},(_,k) => {
  const r=Math.floor(k/6),c=k%6, nw=r*7+c, ne=nw+1, sw=nw+7,se=sw+1;
  const first=[[nw,se],[se,nw]], second=[[ne,sw],[sw,ne]];
  return first.flatMap(([a,b])=>second.flatMap(([c,d])=>{
    const ab=moves[a].find(m=>m.j===b), cd=moves[c].find(m=>m.j===d);
    return ab&&cd?[new Or([not(succ(a),ab.code),not(succ(c),cd.code)])]:[];
  }));
}).flat();
// Each box has its own run-entry identity (local cell 1..9) and position.
// A step from outside starts a new run; a step inside continues the same run.
// These local fields retain separate simultaneous runs in overlapping boxes.
const runVars = boxes.flatMap((_,b)=>[new Var('E'+String.fromCharCode(65+b),'box run entry',9),new Var('T'+String.fromCharCode(65+b),'box run position',9)]);
const runRules = boxes.flatMap((box,b)=>{
  const root = k=>field('VE'+String.fromCharCode(65+b),k), pos = k=>field('VT'+String.fromCharCode(65+b),k);
  return box.flatMap((a,k)=>[
    new Given(root(k),0,...digits),new Given(pos(k),0,...digits),
    new Or([
      new And([new Given(pred(a),0),new Given(root(k),0),new Given(pos(k),0)]),
      ...(a===start?[new And([new Given(pred(a),10),new Given(root(k),k+1),new Given(pos(k),1)])]:[]),
      ...moves[a].map(({j,code})=>{
        const previous=box.indexOf(j);
        return new And([new Given(pred(a),code),...(previous<0?
          [new Given(root(k),k+1),new Given(pos(k),1)]:
          [eq(root(k),root(previous)),new Sum(1,pos(k),[pos(previous),-1])])]);
      })
    ]),
    // Index-line involution: digit at position p points to position d,
    // where digit p occurs. Run identity excludes all other visits to the box.
    new Or([new Given(pred(a),0),...box.map((other,l)=>new And([
      eq(root(k),root(l)),eq(cells[a],pos(l)),eq(cells[other],pos(k))
    ]))])
  ]);
});
return [shape,new NoBoxes(),...boxes.map(box=>new AllDifferent(...box.map(i=>cells[i]))),
  new Var('P','predecessor ports',49),new Var('S','successor ports',49),
  new Var('H','route rank high',49),new Var('L','route rank low',49),
  ...routeDomains,new Given(pred(start),10),new Given(succ(end),10),
  new Given(hi(start),0),new Given(lo(start),1),
  ...edges,...teleportRules,...crossings,...runVars,...runRules,
  eq(cells[13],cells[39])];
