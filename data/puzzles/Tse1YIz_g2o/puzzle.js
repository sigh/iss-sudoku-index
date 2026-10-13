// Title: What's Literally Eating Gilbert Grape?
// Author: Oyvind Thorsby
// Video: https://www.youtube.com/watch?v=Tse1YIz_g2o
// Source: https://app.crackingthecryptic.com/sudoku/qnjrtqbr7j

// Standard Sudoku. Each cell is human or zombie, with no monochrome 2x2.
// Zombies infect smaller orthogonal neighbours, and 1 infects 9.
// R3C5 is patient zero; all zombies are reached by directed infection steps.
const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const shade = graph.makeOverlay('VZ');
const high = graph.makeOverlay('VH');
const low = graph.makeOverlay('VL');
// Printed givens, in row order.
const givens = [
 ['R5C3',6],['R5C6',3],['R5C8',2],
 ['R6C1',9],['R6C2',5],['R6C3',8],['R6C4',7],['R6C5',2],['R6C6',6],['R6C7',3],['R6C8',4],['R6C9',1],
 ['R7C1',7],['R7C2',8],['R7C3',5],['R7C4',9],['R7C5',4],['R7C6',2],['R7C7',6],['R7C8',1],['R7C9',3]
];
const givenConstraints = givens.map(([cell,value])=>new Given(cell,value));
const HUMAN=1, ZOMBIE=2;
const infects = (a,b) => a>b || (a===1 && b===9);
// Pair predicates encode the directed digit relation and its complement.
const infectionKey=Pair.fnToKey(infects,shape);
const noInfectionKey=Pair.fnToKey((a,b)=>!infects(a,b),shape);
// A distance is 9*(high-1)+(low-1), covering 0..80. States collect
// the first distance then the high component of the second; the final
// transition checks either a predecessor step or a shortest-distance bound.
function distanceSpec(exact) {
 return NFA.encodeSpec({
  startState:{phase:0,a:0},
  transition:(s,v)=>{
   if(s.phase===0) return {phase:1,a:9*(v-1)};
   if(s.phase===1) return {phase:2,a:s.a+v-1};
   if(s.phase===2) return {phase:3,a:s.a,b:9*(v-1)};
   if(s.phase===3 && (exact ? s.b+v-1===s.a+1 : s.b+v-1<=s.a+1)) return {phase:4};
   return undefined;
  },
  accept:s=>s.phase===4,
  maxDepth:4
 },shape);
}
const stepSpec=distanceSpec(true), boundSpec=distanceSpec(false);
const distance=(spec,a,b)=>new NFA(spec,'infection distance',[high.at(a),low.at(a),high.at(b),low.at(b)]);
// The white circle marks patient zero at R3C5.
const root='R3C5';
const rootConstraints=[new Given(shade.at(root),ZOMBIE),new Given(high.at(root),1),new Given(low.at(root),1)];
const shadeDomain=shade.makeReplicate(new Given(shade.at('R1C1'),HUMAN,ZOMBIE));
const reachability=graph.cells().filter(cell=>cell!==root).map(cell=>{
 const z=shade.at(cell), h=high.at(cell), l=low.at(cell);
 const human=new And([new Given(z,HUMAN),new Given(h,1),new Given(l,1)]);
 const predecessors=graph.neighbours(cell).map(n=>new And([
  new Given(z,ZOMBIE),new Given(shade.at(n),ZOMBIE),
  new Pair(infectionKey,'infection',n,cell),distance(stepSpec,n,cell)
 ]));
 return new Or([human,...predecessors]);
});
// Every infection edge forces a zombie target and bounds its distance.
// Together with predecessor descent, the bounds fix true BFS distance,
// so auxiliary depths introduce no additional choices for a digit grid.
const propagation=graph.cells().flatMap(cell=>graph.neighbours(cell).map(n=>new Or([
 new Given(shade.at(cell),HUMAN),new Pair(noInfectionKey,'no infection',cell,n),
 new And([new Given(shade.at(n),ZOMBIE),distance(boundSpec,cell,n)])
])));
const blocks=Array.from({length:8},(_,r)=>Array.from({length:8},(_,c)=>
 new ContainAtLeast('1_2',...shade.at(graph.block(makeCellId(r+1,c+1),2,2)))
)).flat();
return [shape,shade.toVar('human or zombie'),high.toVar('distance high'),low.toVar('distance low'),
 ...givenConstraints,...rootConstraints,shadeDomain,...reachability,...propagation,...blocks];
