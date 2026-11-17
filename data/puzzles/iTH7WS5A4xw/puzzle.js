// Title: Bits of Whispers
// Author: Marty Sears
// Video: https://www.youtube.com/watch?v=iTH7WS5A4xw
// Source: https://sudokupad.app/g372z0dhli

// Four orthogonally connected 1-9 regions, row/column nonrepetition,
// green whispers, a nonconsecutive yellow dot, and regional green-cell counts.
const shape = new Shape('6x6', 9);
const graph = cellGraph(shape);
const cc = graph.makeOverlay('CC');
// Green center-to-center strokes, excluding their duplicate white outlines.
const paths = [
  ['R4C6','R3C5','R2C4','R2C3','R1C2','R1C3','R1C4','R1C5','R1C6'],
  ['R6C5','R6C4','R6C3','R6C2','R6C1','R5C1','R4C1','R5C2','R4C3','R5C3'],
  ['R5C4','R5C5'],
  ['R3C3','R4C4','R4C5'],
  ['R5C6','R6C6'],
];
const green = [...new Set(paths.flat())];
// Four turquoise circle centers in row 3.
const circles = ['R3C1','R3C2','R3C5','R3C6'];
const counts = circles.map(cell => new ChaosCount(
  cell,
  // A non-green reference cell adds one to the internal count.
  green.includes(cell) ? 0 : 1,
  cc.at(cell), ...cc.at(green.filter(g => g !== cell)),
));
// Yellow edge dot at the R1C1/R2C1 boundary; the predicate forbids difference 1.
const nonconsecutive = Pair.fnToKey((a,b) => Math.abs(a-b) !== 1, shape);
return [
  shape,
  new NoBoxes(),
  new RegionSize(9),
  new ChaosConstruction(),
  ...paths.map(path => new Whisper(5, ...path)),
  new Pair(nonconsecutive, 'Nonconsecutive', 'R1C1', 'R2C1'),
  ...counts,
];
