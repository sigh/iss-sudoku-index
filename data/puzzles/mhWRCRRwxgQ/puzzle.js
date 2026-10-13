// Title: Dual Summits
// Author: Vythic
// Video: https://www.youtube.com/watch?v=mhWRCRRwxgQ
// Source: https://sudokupad.app/0o34f0060w

// Normal Sudoku; two connected orthogonal branching summit lines cover all
// non-cage cells. Visible pieces include a tip and all tips are visible.
// Every used-edge triple is monotone except at 1/9. The ambiguous 2x2
// traversal prohibition is omitted. White dots are consecutive and separate the lines;
// each thermometer lies on one line, and cage cells lie on neither line.
const or = (...cs)=>new Or(cs);
const and = (...cs)=>new And(cs);
const graph = cellGraph('9x9');
const cells = graph.cells();
// Drawn cages, blue pieces, thermometers (bulb first), and white dots.
const cages = [[35,['R4C4','R4C5','R4C6','R5C6','R6C4','R6C5','R6C6']], [8,['R4C2']]];
const pieces = [['R5C7','R6C7'],['R1C1','R1C2'],['R7C6','R7C7'],['R5C4','R5C5'],['R2C1','R2C2'],['R5C2','R6C2']];
const thermos = [['R2C8','R3C8','R2C7'],['R8C5','R8C6'],['R4C1','R5C1'],['R2C4','R2C5'],['R9C1','R9C2','R8C1'],['R3C2','R4C3','R3C4','R3C3']];
const dots = [['R5C8','R5C9'],['R7C1','R7C2'],['R8C4','R9C4'],['R6C7','R6C8'],['R7C6','R8C6'],['R7C3','R8C3'],['R7C2','R7C3'],['R6C2','R6C3'],['R2C6','R3C6'],['R2C4','R3C4'],['R2C1','R3C1'],['R2C7','R3C7']];
const excluded = new Set(cages.flatMap(([,cs])=>cs));
const active = cells.filter(c=>!excluded.has(c));
const tipCells = new Set(pieces.flat());
const label = graph.makeOverlay('VL');
const mask = graph.makeOverlay('VM');
const parent = graph.makeOverlay('VP');
const high = graph.makeOverlay('VH');
const low = graph.makeOverlay('VO');
// Mask value minus one is an N/E/S/W bitset. Parent 1 is root, 2..5
// select N/E/S/W; ranks are 9*(high-1)+(low-1), bounded by 72.
const dirs = [[-1,0,1],[0,1,2],[1,0,4],[0,-1,8]];
const uses = (m,d)=>Boolean((m-1)&dirs[d][2]);
const degree = m=>dirs.filter((_,d)=>uses(m,d)).length;
const key = fn=>Pair.fnToKey(fn,16);
const binary = (fn,name,a,b)=>new Pair(key(fn),name,a,b);
const nfa = (name,cs,transition,startState={p:0},accept=s=>s.ok===true)=>new NFA(NFA.encodeSpec({startState,transition,accept,maxDepth:cs.length},16),name,...cs);
const inactive = (c,d)=>new Given(mask.at(c),...Array.from({length:16},(_,i)=>i+1).filter(m=>!uses(m,d)));
const neighbour = (c,d)=>graph.step(c,dirs[d][0],dirs[d][1]);
const direction = (a,b)=>dirs.findIndex((_,d)=>neighbour(a,d)===b);
const domains = cells.flatMap(c=>excluded.has(c)
  ? [label,mask,parent,high,low].map(o=>new Given(o.at(c),1))
  : [new Given(label.at(c),1,2),new Given(high.at(c),...Array.from({length:9},(_,i)=>i+1)),new Given(low.at(c),...Array.from({length:9},(_,i)=>i+1)),
      new Given(parent.at(c),1,...dirs.flatMap((_,d)=>{const b=neighbour(c,d);return b&&!excluded.has(b)?[d+2]:[];})),
      new Given(mask.at(c),...Array.from({length:16},(_,i)=>i+1).filter(m=>degree(m)>0 && (degree(m)!==1||tipCells.has(c)) && dirs.every((_,d)=>!uses(m,d)||(neighbour(c,d)&&!excluded.has(neighbour(c,d))))))]);
// Labels first appear in order; each label's first cell is its only root.
const roots = nfa('canonical-roots',active.flatMap(c=>[label.at(c),parent.at(c)]),(s,v)=>{
  if(s.p===0){if(v>2)return undefined;return {p:1,seen:s.seen||0,label:v};}
  if(v>5)return undefined;
  const first=!(s.seen&(1<<(s.label-1)));
  if((v===1)!==first || (first&&s.label===2&&!(s.seen&1)))return undefined;
  return {p:0,seen:s.seen|(1<<(s.label-1))};
},{p:0,seen:0},s=>s.p===0&&s.seen===3);
// Split-rank comparisons read the first rank then check the expected high
// digit before reading the second low digit, so no pair of full ranks is stored.
const rankRelation = (a,b,relation,name)=>nfa(name,[high.at(a),low.at(a),high.at(b),low.at(b)],(s,v)=>{
  if(v>9)return undefined;
  if(s.p===0)return {p:1,h:v-1};
  if(s.p===1)return {p:2,a:9*s.h+v-1};
  if(s.p===2)return {p:3,a:s.a,h:v-1};
  return relation(s.a,9*s.h+v-1)?{ok:true}:undefined;
});
const zero = c=>and(new Given(high.at(c),1),new Given(low.at(c),1));
const nonzero = c=>or(new Given(high.at(c),2,3,4,5,6,7,8,9),new Given(low.at(c),2,3,4,5,6,7,8,9));
const descent = active.map(c=>or(
  and(new Given(parent.at(c),1),zero(c)),
  ...dirs.flatMap((_,d)=>{
    const b=neighbour(c,d);if(!b||excluded.has(b))return [];
    return [and(new Given(parent.at(c),d+2),nonzero(c),new Given(mask.at(c),...Array.from({length:16},(_,i)=>i+1).filter(m=>uses(m,d))),
      rankRelation(c,b,(a,b)=>a===b+1,'parent-descent'),
      ...dirs.slice(0,d).flatMap((_,earlier)=>{const q=neighbour(c,earlier);return q&&!excluded.has(q)?[or(inactive(c,earlier),rankRelation(c,q,(a,b)=>a!==b+1,'first-parent'))]:[];}) )];
  })
));
const edges = active.flatMap(c=>[1,2].flatMap(d=>{const b=neighbour(c,d);return b&&!excluded.has(b)?[{a:c,b,d}]:[];}));
const edgeAgreement = [1,2].map(d=>mask.makeReplicate(binary((x,y)=>uses(x,d)===uses(y,(d+2)%4),'edge-agreement',mask.at('R1C1'),mask.at(neighbour('R1C1',d))),edges.filter(e=>e.d===d).map(e=>mask.at(e.a))));
const edgeRules = edges.flatMap(({a,b,d})=>[

  or(inactive(a,d),new SameValues(2,label.at(a),label.at(b))),
  or(inactive(a,d),rankRelation(a,b,(x,y)=>Math.abs(x-y)<=1,'bfs-distance')),
]);
// On a used neighbour-centre-neighbour triple, an interior digit has one
// smaller and one larger neighbour; 1 or 9 reverses the direction.
const summit = NFA.encodeSpec({startState:{p:0},transition:(s,v)=>{
  if(v>9)return undefined;
  if(s.p===0)return {p:1,a:v};
  if(s.p===1)return {p:2,a:s.a,b:v};
  return (s.b===1||s.b===9||(s.a<s.b&&s.b<v)||(s.a>s.b&&s.b>v))?{ok:true}:undefined;
},accept:s=>s.ok===true,maxDepth:3},16);
const summitRules = active.flatMap(c=>dirs.flatMap((_,d)=>dirs.slice(d+1).flatMap((_,j)=>{
  const e=d+j+1,a=neighbour(c,d),b=neighbour(c,e);
  return a&&b&&!excluded.has(a)&&!excluded.has(b)?[or(inactive(c,d),inactive(c,e),new NFA(summit,'summit-triple',a,c,b))]:[];
})));
const visible = pieces.flatMap(([a,b])=>[
  new Given(mask.at(a),...Array.from({length:16},(_,i)=>i+1).filter(m=>uses(m,direction(a,b)))),
  or(new Given(mask.at(a),...Array.from({length:16},(_,i)=>i+1).filter(m=>degree(m)===1)),new Given(mask.at(b),...Array.from({length:16},(_,i)=>i+1).filter(m=>degree(m)===1))),
]);
// Stamp identical candidate domains within each overlay.
const stampedDomains = [
  label.makeReplicate(new Given(label.cells()[0],1,2)),
  high.makeReplicate(new Given(high.cells()[0],1,2,3,4,5,6,7,8,9)),
  low.makeReplicate(new Given(low.cells()[0],1,2,3,4,5,6,7,8,9)),
  ...domains.filter(g=>excluded.has(label.gridAt(g.cell)) || excluded.has(high.gridAt(g.cell)) || excluded.has(low.gridAt(g.cell)) || mask.gridAt(g.cell) || parent.gridAt(g.cell)),
];
return [new Shape('9x9','1-16'),graph.makeReplicate(new Given('R1C1',1,2,3,4,5,6,7,8,9)),
  label.toVar('line'),mask.toVar('selected edges'),parent.toVar('canonical spanning parent'),high.toVar('BFS high'),low.toVar('BFS low'),
  ...stampedDomains,roots,...descent,...edgeAgreement,...edgeRules,...summitRules,...visible,
  ...dots.flatMap(([a,b])=>[new WhiteDot(a,b),new AllDifferent(label.at(a),label.at(b))]),
  ...thermos.flatMap(cs=>[new Thermo(...cs),new SameValues(cs.length,...label.at(cs))]),
  ...cages.map(([total,cs])=>new Cage(total,...cs))];
