// Title: Wet Blankets 3: Shh!
// Author: Jorava
// Video: https://www.youtube.com/watch?v=N51b0Yr7oGk
// Source: https://sudokupad.app/vk2j4x4ynk

// Normal Sudoku on the upper 9x9. One negative digit in every house,
// with distinct magnitudes. Cages sum signed values; whispers compare signed
// values. The extra bottom row is a notes area and has no puzzle constraints.
const shape = new Shape('9x9');
const graph = cellGraph(shape);
const flags = graph.makeOverlay('VN');
const flag = cell => flags.at(cell);
const interleave = cells => cells.flatMap(c => [c, flag(c)]);
// Flag 1 is positive; flag 2 negates the digit.
const placements = graph.rowsColumnsBoxes().map(cells =>
  new ContainExact('2', ...flags.at(cells)));
const selectors = graph.makeOverlay('VD', graph.column(1));
// A row selector equals the digit at its negative cell. One flag=2 per row
// makes the nine-way disjunction single-valued.
const links = graph.rows().map((row, i) => new Or(row.map(c => new And([
  new Given(flag(c), 2), new SameValues(2, c, selectors.at(graph.column(1)[i]))
]))));
// Read digit/flag pairs, accumulating their signed sum.
const signedSum = (total, cells, i) => new NFA(NFA.encodeSpec({
  startState: {phase:'digit', sum:0},
  transition: (s,v) => {
    if(s.phase === 'digit') return {phase:'flag', sum:s.sum, digit:v};
    if(v !== 1 && v !== 2) return undefined;
    return {phase:'digit', sum:s.sum + (v === 2 ? -s.digit : s.digit)};
  },
  accept: s => s.phase === 'digit' && s.sum === total,
  maxDepth: cells.length * 2,
}, shape), `signed-cage-${i}`, ...interleave(cells));
// Each four-symbol scan compares signed values of one drawn whisper edge.
const whisperSpec = NFA.encodeSpec({
  startState:{phase:'first'},
  transition:(s,v) => {
    if(s.phase === 'first') return {phase:'firstFlag', digit:v};
    if(s.phase === 'firstFlag') {
      if(v !== 1 && v !== 2) return undefined;
      return {phase:'second', first:v === 2 ? -s.digit : s.digit};
    }
    if(s.phase === 'second') return {phase:'secondFlag', first:s.first, digit:v};
    if(s.phase === 'secondFlag' && (v === 1 || v === 2) &&
       Math.abs(s.first - (v === 2 ? -s.digit : s.digit)) >= 5) return {phase:'done'};
    return undefined;
  },
  accept:s => s.phase === 'done', maxDepth:4,
}, shape);
// Givens printed in the Sudoku grid.
const givens = [["R6C4", 4], ["R6C5", 9], ["R7C4", 5], ["R9C2", 4], ["R9C8", 5]];
// Dashed cage outlines and printed totals.
const cages = [[10, ["R1C1", "R1C2", "R2C1", "R2C2"]], [11, ["R7C1", "R7C2", "R8C1", "R8C2"]], [11, ["R8C7", "R8C8", "R8C9", "R9C8"]], [20, ["R1C8", "R1C9", "R2C9"]], [0, ["R1C4", "R1C5", "R2C4", "R3C4"]], [23, ["R1C6", "R2C5", "R2C6", "R3C6", "R4C6"]], [8, ["R5C9", "R6C9"]], [10, ["R5C7", "R6C7", "R6C8"]], [8, ["R4C1", "R4C2", "R4C3"]], [-1, ["R8C5", "R9C5", "R9C6"]], [15, ["R4C4", "R5C4"]], [6, ["R4C5", "R5C5", "R5C6"]], [6, ["R7C6", "R8C6"]]];
// The eight green strokes, in waypoint order.
const lines = [["R5C1", "R5C2"], ["R9C2", "R9C3", "R9C4", "R9C5"], ["R7C8", "R7C9"], ["R3C4", "R4C5"], ["R2C5", "R3C6"], ["R3C5", "R4C6", "R5C7", "R5C8", "R5C9"], ["R3C7", "R2C7", "R3C8", "R3C9"], ["R8C1", "R7C2", "R6C3", "R6C4", "R6C5"]];
return [shape,
  ...givens.map(([c,v]) => new Given(c,v)),
  flags.toVar('negative flags'),
  flags.makeReplicate(new Given(flag(graph.cells()[0]),1,2)),
  ...placements,
  selectors.toVar('negative magnitudes'),
  ...links, new AllDifferent(...selectors.cells()),
  ...cages.map(([total,cells],i) => signedSum(total,cells,i)),
  ...lines.flatMap((line,i) => line.slice(1).map((c,j) =>
    new NFA(whisperSpec,`whisper-${i}-${j}`, ...interleave([line[j],c])))),
];
