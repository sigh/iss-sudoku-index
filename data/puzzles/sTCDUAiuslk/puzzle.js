// Title: The Path Through Life
// Author: Tobias
// Video: https://www.youtube.com/watch?v=sTCDUAiuslk
// Source: https://app.crackingthecryptic.com/TQdQfrd2HB

// Normal Sudoku; one non-branching, orthogonally non-touching path;
// exactly one complementary region of each size 2 through 8; letter equality
// and distinctness with printed letters off-path; conditional circles and sums.
// The selected first cage fixes the E,M,V,A,M itinerary and its orientation.
const shape = new Shape('9x9');
const graph = cellGraph('9x9');
const cells = graph.cells();
const regions = graph.makeOverlay('VR');
const path = graph.makeOverlay('VP');
// VR: 1 = path, 2..8 = complementary region size.
// VP: 1 = path body, 2 = endpoint, 3 = off-path.
// Drawn givens, letters, circles and blue-square cell pairs.
const letters = ['R6C9','R5C9','R9C9','R1C1']; // E,M,V,A
const circles = ['R2C4','R9C9','R7C7','R1C5','R2C7','R7C4','R9C3','R4C3','R1C3','R6C1'];
const squares = [['R2C4','R2C5'],['R1C7','R2C7'],['R1C8','R1C9'],['R5C9','R6C9'],['R7C9','R8C9'],['R9C6','R9C7'],['R4C7','R5C7'],['R4C6','R5C6'],['R7C4','R7C5'],['R7C2','R7C3'],['R8C1','R9C1'],['R9C2','R9C3'],['R4C1','R5C1'],['R3C2','R4C2'],['R4C3','R4C4']];
const relation = (fn,a,b,name) => new Pair(Pair.fnToKey(fn,shape),name,a,b);
const edges = cells.flatMap(a => [[0,1],[1,0]].map(([r,c]) => graph.step(a,r,c)).filter(Boolean).map(b => [a,b]));
// Degree state records the cell code and number of on-path neighbours.
const degreeSpec = NFA.encodeSpec({
 startState:{own:0,count:0},
 transition:({own,count},v) => {
  if (!own) return {own:v,count:0};
  if (own===3) return {own,count:0};
  const n=count+(v!==3?1:0);
  return n>2?undefined:{own,count:n};
 },
 accept:({own,count}) => own===3 || count===(own===2?1:2),
},shape);
// Square state reads region-membership codes, then digits; equal membership
// is required and chooses the sum target.
const squareSpec = NFA.encodeSpec({
 startState:{phase:0},
 transition:(s,v) => {
  if(s.phase===0) return {phase:1,on:v===1};
  if(s.phase===1) return (v===1)===s.on?{phase:2,total:s.on?10:5}:undefined;
  if(s.phase===2) return {phase:3,want:s.total-v};
  if(s.phase===3) return v===s.want?{phase:4}:undefined;
  return undefined;
 },accept:s=>s.phase===4,
},shape);
// A circle sets its region code and digit. Off-path circles equate those;
// path circles count their own cell plus uninterrupted on-path ray cells.
const circleSpec = NFA.encodeSpec({
 startState:{phase:'region'},
 transition:(s,v) => {
  if(v===SEGMENT_BREAK) return s.phase==='rays'?{...s,blocked:false}:undefined;
  if(s.phase==='region') return {phase:'digit',region:v};
  if(s.phase==='digit') {
   if(s.region!==1) return v===s.region?{phase:'rays',off:true}:undefined;
   return {phase:'rays',off:false,target:v,count:1,blocked:false};
  }
  if(s.off) return s;
  if(s.blocked || v!==1) return {...s,blocked:true};
  return s.count>=s.target?undefined:{...s,count:s.count+1};
 },accept:s=>s.phase==='rays' && (s.off || s.count===s.target),
},shape,{multiSegment:true});
const circleRules = circles.map(cell => {
 const rays = [[-1,0],[1,0],[0,-1],[0,1]].map(([dr,dc])=>{
  const ray=[]; let next=graph.step(cell,dr,dc);
  while(next){ray.push(regions.at(next));next=graph.step(next,dr,dc);}
  return ray;
 }).filter(ray=>ray.length);
 return new NFA(circleSpec,'circle',[regions.at(cell),cell],...rays);
});

// Drawn cage cells define the two itinerary zones, not killer-cage restrictions.
const cages = [graph.block('R1C4',2,4),graph.block('R7C3',3,2)];
const direction = graph.makeOverlay('VD');
const phase = graph.makeOverlay('VF');
// VD: 1 off; 2 start; 3/4/5/6 predecessor up/down/left/right.
// VF: 1 awaiting E, 2 awaiting M, 3 awaiting V, 4 awaiting A,
// 5 awaiting the final M, 6 complete. Off-path cells use 1.
const moves = [[-1,0,3],[1,0,4],[0,-1,5],[0,1,6]];
const targetLetters = ['R6C9','R5C9','R9C9','R1C1','R5C9'];
// The itinerary phases choose their earliest eligible next visit. Greedy earliest
// visits certify existence of an ordered subsequence without guessing event cells.
const itinerary = (previous,cell,first)=>{
 const branches=[new And([new Given(previous,6),new Given(phase.at(cell),6)])];
 for(let k=1;k<=5;k++){
  const cage = cages[k===3||k===4?1-first:first];
  if(cage.includes(cell)){
   branches.push(new And([new Given(previous,k),new Or([
    new And([relation((a,b)=>a!==b,cell,targetLetters[k-1],'await letter'),new Given(phase.at(cell),k)]),
    new And([new SameValues(2,cell,targetLetters[k-1]),new Given(phase.at(cell),k+1)])
   ])]));
  }else branches.push(new And([new Given(previous,k),new Given(phase.at(cell),k)]));
 }
 return new Or([...branches]);
};
const initialPhase = (cell)=>new Or([
 new And([new SameValues(2,cell,'R6C9'),new Given(phase.at(cell),2)]),
 new And([relation((a,b)=>a!==b,cell,'R6C9','await E'),new Given(phase.at(cell),1)])
]);
const choiceVar = new Var('C','first cage','1x1');
// Every adjacent pair of path cells has exactly one predecessor relation.
const orientedEdges = [[0,1,6,5],[1,0,4,3]].map(([dr,dc,ab,ba])=>direction.makeReplicate(
 relation((x,y)=>x===1||y===1||(x===ab)!==(y===ba),direction.at('R1C1'),direction.at(graph.step('R1C1',dr,dc)),'orientation'),
 direction.at(cells.filter(c=>graph.step(c,dr,dc)))
));
const directedCells = cells.map(cell=>new Or([
 new And([new Given(path.at(cell),3),new Given(direction.at(cell),1),new Given(phase.at(cell),1)]),
 ...[0,1].flatMap(first=>[
  ...(cages[first].includes(cell)?[new And([new Given('VC',first+1),new Given(direction.at(cell),2),new Given(path.at(cell),2),initialPhase(cell)])]:[]),
  ...moves.map(([dr,dc,code])=>({previous:graph.step(cell,dr,dc),code})).filter(x=>x.previous).map(({previous,code})=>new And([
   new Given('VC',first+1),new Given(direction.at(cell),code),new Given(path.at(cell),1,2),new Given(path.at(previous),1,2),
   itinerary(phase.at(previous),cell,first),
   new Or([new Given(path.at(cell),1),new Given(phase.at(cell),6)])
  ]))
 ])
]));

return [shape,
 new Given('R4C8',5),new Given('R5C2',5),
 regions.toVar('region size'),path.toVar('path role'),
 direction.toVar('predecessor'),phase.toVar('itinerary phase'),choiceVar,new Given('VC',1,2),
 direction.makeReplicate(new Given(direction.cells()[0],1,2,3,4,5,6)),
 phase.makeReplicate(new Given(phase.cells()[0],1,2,3,4,5,6)),
 new ContainExact('2',...direction.cells()),...orientedEdges,...directedCells,
 regions.makeReplicate(new Given(regions.cells()[0],1,2,3,4,5,6,7,8)),
 path.makeReplicate(new Given(path.cells()[0],1,2,3)),
 ...cells.map(c=>relation((r,p)=>(r===1)===(p!==3),regions.at(c),path.at(c),'membership')),
 ...[2,3,4,5,6,7,8].map(size=>new ConnectedValues('VR',size,size)),
 // The complementary sizes total 35, leaving 46 path cells.
 new ConnectedValues('VP',[1,2],46),new ContainExact('2_2',...path.cells()),
 ...[[0,1],[1,0]].map(([dr,dc])=>regions.makeReplicate(relation((x,y)=>x===1||y===1||x===y,regions.at('R1C1'),regions.at(graph.step('R1C1',dr,dc)),'maximal regions'),regions.at(cells.filter(c=>graph.step(c,dr,dc))))),
 ...cells.map(c=>new NFA(degreeSpec,'path degree',...path.at([c,...graph.neighbours(c)]))),
 new SameValues(2,'R5C9','R6C3'),new AllDifferent(...letters),
 ...[...letters,'R6C3'].map(c=>new Given(path.at(c),3)),
 ...squares.map(([a,b])=>new NFA(squareSpec,'blue square',regions.at(a),regions.at(b),a,b)),
 ...circleRules,
];
