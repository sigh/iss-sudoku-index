// Title: Trees of Green
// Author: Sir Algee
// Video: https://www.youtube.com/watch?v=hG78DysLCC8
// Source: https://sudokupad.app/c0bi1ltgtf

// Sudoku; a single orthogonal non-self-touching whisper loop visits every box.
// Off-loop circles count surrounding loop cells; black dots have ratio 1:2,
// and V marks sum to five. No rules are omitted.
const shape = new Shape('9x9');
const graph = cellGraph(shape);
const loop = graph.makeOverlay('VL');
const OFF = 1, ON = 2;
// The drawn circle, dot and V positions.
const circles = ['R1C5','R3C3','R3C6','R4C3','R4C8','R5C4','R7C2','R8C5'];
const dots = [['R9C1','R9C2'],['R2C5','R3C5'],['R2C6','R3C6']];
const vees = [['R6C4','R7C4'],['R6C3','R6C4'],['R5C3','R6C3'],['R1C3','R2C3']];
// The first symbol selects on/off; subsequent symbols count on neighbours.
const degree = NFA.encodeSpec({
 startState: {mode:0, count:0},
 transition: (s,v) => {
  if (!s.mode) return {mode:v === ON ? 2 : 1, count:0};
  if (s.mode === 1) return s;
  const count = s.count + (v === ON ? 1 : 0);
  return count <= 2 ? {mode:2,count} : undefined;
 },
 accept: s => s.mode === 1 || (s.mode === 2 && s.count === 2),
}, shape);
// A four-bit scan rejects the two diagonal-only patterns; L-turns are allowed.
const noTouch = NFA.encodeSpec({
 startState: {n:0, bits:0},
 transition: (s,v) => s.n < 4 ? {n:s.n+1,bits:s.bits*2+(v === ON ? 1:0)} : undefined,
 accept: s => s.n === 4 && s.bits !== 9 && s.bits !== 6,
 maxDepth:4,
}, shape);
const whisper = Pair.fnToKey((a,b) => Math.abs(a-b) >= 5,shape);
return [
 shape,
 loop.toVar('loop'),
 loop.makeReplicate(new Given(loop.cells()[0],OFF,ON)),
 new ConnectedValues('VL',ON),
 ...circles.map(c => new Given(loop.at(c),OFF)),
 ...graph.cells().map(c => new NFA(degree,'loop degree',...loop.at([c,...graph.neighbours(c)]))),
 loop.makeReplicate(new NFA(noTouch,'no diagonal touch',...loop.at(graph.block('R1C1',2,2))),loop.at(graph.cells().filter(c => graph.block(c,2,2)))),
 ...graph.boxes().map(b => new ContainAtLeast([ON],...loop.at(b))),
 ...circles.map(c => new Sum(graph.kingNeighbours(c).length,...loop.at(graph.kingNeighbours(c)),[c,-1])),
 ...graph.cells().flatMap(a => graph.neighbours(a).filter(b => a < b).map(b => new Or([
  new Given(loop.at(a),OFF),new Given(loop.at(b),OFF),new Pair(whisper,'loop whisper',a,b)
 ]))),
 ...dots.map(p => new BlackDot(...p)),
 ...vees.map(p => new V(...p)),
];
