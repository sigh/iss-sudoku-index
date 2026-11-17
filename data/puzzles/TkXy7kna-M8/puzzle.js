// Title: The Greatest Loop
// Author: ThePedallingPianist
// Video: https://www.youtube.com/watch?v=TkXy7kna-M8
// Source: https://sudokupad.app/1xuvxocdoi

// Sudoku with 2-row by 3-column boxes. A single orthogonal loop visits cells
// at most once. Each turn exceeds the sum of its two loop neighbours.
// Circled cells are off the loop and count visited king-neighbours.
const any = (...constraints) => new Or(constraints);
const all = (...constraints) => new And(constraints);
const board = new Shape('6x6', 7);
const graph = cellGraph(board), cells = graph.cells();
const route = graph.makeOverlay('VL');
const high = graph.makeOverlay('VH'), low = graph.makeOverlay('VD');
// Codes: off, horizontal, vertical, up-left, up-right, down-left, down-right.
const masks = [0, 0, 12, 3, 5, 9, 6, 10];
const codes = [1,2,3,4,5,6,7];
const dirs = [[-1,0,1,2],[1,0,2,1],[0,-1,4,8],[0,1,8,4]];
// The four green circles drawn in the grid.
const circles = ['R1C2','R2C2','R3C4','R6C1'];
const domain = cells.map(c => new Given(route.at(c), ...codes.filter(s =>
  dirs.every(([dr,dc,bit]) => !(masks[s]&bit) || graph.step(c,dr,dc)))));
const near = comparison(d=>Math.abs(d)<=1), descent = comparison(d=>d===1);
const edges = cells.flatMap(c => dirs.slice(1).filter(d => d[0]===1 || d[1]===1).flatMap(([dr,dc,bit,op]) => {
  const n = graph.step(c,dr,dc);
  if (!n) return [];
  // Both endpoint masks must select the same shared edge.
  const key = Pair.fnToKey((a,b) => Boolean(masks[a]&bit) === Boolean(masks[b]&op), board);
  return [new Pair(key,'edge agreement',route.at(c),route.at(n)),
    any(new Given(route.at(c),...codes.filter(s=>!(masks[s]&bit))),
      new NFA(near,'BFS edge',high.at(c),low.at(c),high.at(n),low.at(n)))];
}));
// BFS distances are base-6 numbers (high-1)*6+(low-1). Selected edges
// change distance by at most one; descent to the first visited cell proves
// connectivity and makes every distance uniquely determined by the loop.
function comparison(predicate) {
  return NFA.encodeSpec({startState:{phase:0,acc:0},
    transition:(s,v)=> {
      if(v>6) return undefined;
      if(s.phase===0) return {phase:1,acc:6*(v-1)};
      if(s.phase===1) return {phase:2,acc:s.acc+v-1};
      if(s.phase===2) return {phase:3,acc:s.acc-6*(v-1)};
      if(s.phase===3 && predicate(s.acc-v+1)) return {phase:4,acc:0};
      return undefined;
    },accept:s=>s.phase===4,maxDepth:4},board);
}
const connectivity = cells.map((c,i) => any(
  all(new Given(route.at(c),1),new Given(high.at(c),1),new Given(low.at(c),1)),
  all(new Given(route.at(c),2,3,4,5,6,7),new Given(high.at(c),1),new Given(low.at(c),1),
    ...cells.slice(0,i).map(p=>new Given(route.at(p),1))),
  ...dirs.flatMap(([dr,dc,bit])=>{
    const n=graph.step(c,dr,dc);
    return n ? [all(new Given(route.at(c),...codes.filter(s=>masks[s]&bit)),
      new NFA(descent,'BFS descent',high.at(c),low.at(c),high.at(n),low.at(n)))] : [];
  })
));
const turns = cells.flatMap(c=>codes.slice(3).flatMap(code=>{
  const ns=dirs.filter(d=>masks[code]&d[2]).map(([dr,dc])=>graph.step(c,dr,dc));
  if(ns.some(n=>!n)) return [];
  // Read corner then its neighbours; retain the remaining positive allowance.
  const spec=NFA.encodeSpec({startState:{phase:0,left:0},
    transition:(s,v)=>s.phase<3 && (s.phase===0 || s.left>v)
      ? {phase:s.phase+1,left:s.phase===0?v:s.left-v} : undefined,
    accept:s=>s.phase===3,maxDepth:3},board);
  return [any(new Given(route.at(c),...codes.filter(s=>s!==code)),
    new NFA(spec,'corner greater than neighbour sum',c,...ns))];
}));
// The first symbol is the circled digit; subsequent symbols count route masks.
const circleCount=NFA.encodeSpec({startState:{target:null,count:0},
  transition:(s,v)=>s.target===null ? {target:v,count:0}
    : s.count+(v!==1)>s.target ? undefined : {target:s.target,count:s.count+(v!==1)},
  accept:s=>s.target===s.count,maxDepth:9},board);
return [board,route.toVar('loop shapes'),high.toVar('distance high'),low.toVar('distance low'),
  ...cells.map(c=>new Given(c,1,2,3,4,5,6)),
  ...cells.flatMap(c=>[new Given(high.at(c),1,2,3,4,5,6),new Given(low.at(c),1,2,3,4,5,6)]),
  ...domain,...edges,...connectivity,...turns,
  ...circles.flatMap(c=>[new Given(route.at(c),1),
    new NFA(circleCount,'circle visited count',c,...route.at(graph.kingNeighbours(c)))]),
  any(...route.cells().map(c=>new Given(c,2,3,4,5,6,7)))];
