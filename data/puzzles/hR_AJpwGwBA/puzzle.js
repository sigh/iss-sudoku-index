// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=hR_AJpwGwBA
// Source: https://cracking-the-cryptic.web.app/sudoku/mbpTBgtRmj

// Standard Sudoku, sandwich sums between 1 and 9, and an ant route from
// R1C9 to R2C9. Each straight run has length equal to its starting digit;
// successive runs turn 90 degrees and the traced route never crosses itself.
const shape = new Shape('9x9', 11);
const graph = cellGraph(shape);
const cells = graph.cells();
const input = graph.makeOverlay('VI');
const output = graph.makeOverlay('VO');
const remaining = graph.makeOverlay('VR');
const mod9 = graph.makeOverlay('VA');
const mod10 = graph.makeOverlay('VB');
const start = 'R1C9', end = 'R2C9';
// Direction codes 2,3,4,5 mean north,east,south,west; 1 is absent.
const directions = [[2,-1,0], [3,0,1], [4,1,0], [5,0,-1]];
const perpendicular = (a,b) => a > 1 && b > 1 && (a-b)%2 !== 0;
const machine = (spec) => NFA.encodeSpec(spec, shape);
const done = {phase:'done'};
// Local states remember incoming/outgoing directions and the run countdown.
// At a turn (including the start) the countdown equals the digit. Off-route
// cells and the end have countdown 1; other route cells cannot reverse.
const localSpec = (kind) => machine({
  startState:{phase:'input'}, maxDepth:4,
  transition:(s,v) => {
    if(s.phase==='input') return v<=5 ? {phase:'output',i:v} : undefined;
    if(s.phase==='output') {
      const valid = kind==='start' ? s.i===1 && v>1 && v<=5
        : kind==='end' ? s.i>1 && v===1
        : (s.i===1 && v===1) || (s.i>1 && v>1 && v<=5 && (s.i===v || perpendicular(s.i,v)));
      return valid ? {phase:'remaining',i:s.i,o:v} : undefined;
    }
    if(s.phase==='remaining') return v<=9 && ((s.o!==1)||v===1)
      ? {phase:'digit',i:s.i,o:s.o,r:v} : undefined;
    if(s.phase==='digit') return v<=9 && (s.o===1 || s.i===s.o || s.r===v) ? done : undefined;
    return undefined;
  }, accept:s=>s.phase==='done'
});
const localSpecs = {start:localSpec('start'),end:localSpec('end'),body:localSpec('body')};
const local = cells.map(c=>new NFA(localSpecs[c===start?'start':c===end?'end':'body'],
  'ant cell', [input.at(c),output.at(c),remaining.at(c),c]));
// For a used edge, a positive countdown continues straight and decreases.
// Countdown 1 ends the run: the next cell turns or is the red endpoint.
const stepSpec = d => machine({
  startState:{phase:'direction'}, maxDepth:4,
  transition:(s,v)=>{
    if(s.phase==='direction') return v===d ? {phase:'remaining'} : done;
    if(s.phase==='done') return done;
    if(s.phase==='remaining') return v<=9 ? {phase:'nextDirection',r:v} : undefined;
    if(s.phase==='nextDirection') return (s.r>1 ? v===d : v===1 || perpendicular(d,v))
      ? {phase:'nextRemaining',r:s.r,o:v} : undefined;
    if(s.phase==='nextRemaining') return (s.r>1 ? v===s.r-1 : s.o!==1 || v===1) ? done : undefined;
    return undefined;
  }, accept:s=>s.phase==='done'
});
// A used edge increments both position residues. Their lcm is 90, larger
// than the 81-cell board, so no separate directed cycle can survive.
const residueSpec = (d,m) => machine({
  startState:{phase:'direction'},maxDepth:3,
  transition:(s,v)=>{
    if(s.phase==='direction') return v===d ? {phase:'previous'} : done;
    if(s.phase==='done') return done;
    if(s.phase==='previous') return v<=m ? {phase:'next',p:v} : undefined;
    if(s.phase==='next') return v===s.p%m+1 ? done : undefined;
    return undefined;
  },accept:s=>s.phase==='done'
});
const edgeSpecs = directions.map(([d])=>({d,step:stepSpec(d),a:residueSpec(d,9),b:residueSpec(d,10),
  agreement:Pair.fnToKey((a,b)=>(a===d)===(b===d),shape)}));
const edges = cells.flatMap(c=>directions.flatMap(([d,dr,dc],k)=>{
  const next=graph.step(c,dr,dc);
  if(!next) return [];
  const spec=edgeSpecs[k];
  return [new Pair(spec.agreement,'ant edge agreement',output.at(c),input.at(next)),
    new NFA(spec.step,'ant run',[output.at(c),remaining.at(c),output.at(next),remaining.at(next)]),
    new NFA(spec.a,'ant position mod 9',[output.at(c),mod9.at(c),mod9.at(next)]),
    new NFA(spec.b,'ant position mod 10',[output.at(c),mod10.at(c),mod10.at(next)])];
}));
const boundaries = directions.flatMap(([d,dr,dc])=>{
  const border=cells.filter(c=>!graph.step(c,dr,dc));
  return [output.makeReplicate(new Given(output.at(cells[0]),...[1,2,3,4,5].filter(v=>v!==d)),output.at(border)),
    input.makeReplicate(new Given(input.at(cells[0]),...[1,2,3,4,5].filter(v=>v!==((d-2+2)%4+2))),input.at(border))];
});
// Non-route sentinels fix all auxiliary state; route residues use 1..m.
const membership = cells.flatMap(c=>{
  const active = c===end ? input.at(c) : output.at(c);
  return [[mod9,9],[mod10,10]].map(([layer,m])=>new Pair(
    Pair.fnToKey((d,p)=>d===1 ? p===m+1 : p<=m,shape),'ant membership',active,layer.at(c)));
});
// Sandwich machine phases are before/between/after its two endpoint digits.
// Explicit endpoints 1 and 9 preserve the clue on the widened alphabet.
const sandwichSpec = total => machine({
  startState:{phase:'before'},maxDepth:9,
  transition:(s,v)=>{
    if(v>9) return undefined;
    if(s.phase==='before') return v===1||v===9 ? {phase:'between',first:v,sum:0} : s;
    if(s.phase==='between') {
      if(v===s.first) return undefined;
      if(v===1||v===9) return s.sum===total ? {phase:'after'} : undefined;
      return s.sum+v<=total ? {...s,sum:s.sum+v} : undefined;
    }
    return v!==1&&v!==9 ? s : undefined;
  },accept:s=>s.phase==='after'
});
// Outside numbers as drawn: left row clues, then top column clues.
const rowSums=[7,5,7,22,5,30,35,0,14];
const colSums=[0,18,7,13,31,3,31,2,23];
const sandwiches=[...graph.rows().map((line,i)=>new NFA(sandwichSpec(rowSums[i]),'sandwich',line)),
  ...graph.columns().map((line,i)=>new NFA(sandwichSpec(colSums[i]),'sandwich',line))];
return [shape,graph.makeReplicate(new Given(cells[0],1,2,3,4,5,6,7,8,9)),
  // Printed givens in the grid.
  new Given('R1C9',2),new Given('R6C5',6),
  ...[input,output,remaining,mod9,mod10].map((layer)=>layer.toVar('ant route')),
  ...[input,output].map(layer=>layer.makeReplicate(new Given(layer.at(cells[0]),1,2,3,4,5))),
  remaining.makeReplicate(new Given(remaining.at(cells[0]),1,2,3,4,5,6,7,8,9)),
  mod9.makeReplicate(new Given(mod9.at(cells[0]),1,2,3,4,5,6,7,8,9,10)),
  new Given(mod9.at(start),1),new Given(mod10.at(start),1),
  ...local,...membership,...boundaries,...edges,...sandwiches];
