// Title: Red + Blue = Purple
// Author: Kaktuslav
// Video: https://www.youtube.com/watch?v=4bri-zC18Ps
// Source: https://sudokupad.app/7wf14f41d2

// The shading is the YinYang constraint's YY cell group, using 1 for red and 2
// for blue. Each line's color-dependent rules are disjunctions with the
// corresponding monochromatic exception.

const RED = 1;
const BLUE = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

const lines = [
  ['R5C9', 'R6C9', 'R7C9', 'R8C9', 'R9C9', 'R9C8', 'R9C7', 'R9C6', 'R9C5'],
  ['R9C4', 'R8C5', 'R8C6', 'R8C7', 'R8C8', 'R7C8', 'R6C8', 'R5C8'],
  ['R5C7', 'R6C7', 'R7C7', 'R7C6', 'R7C5', 'R8C4'],
  ['R1C8', 'R1C7', 'R1C6', 'R1C5', 'R1C4', 'R1C3', 'R1C2', 'R1C1'],
  ['R2C1', 'R2C2', 'R2C3', 'R2C4', 'R2C5', 'R2C6'],
  ['R3C5', 'R3C4', 'R3C3', 'R3C2', 'R3C1'],
  ['R3C6', 'R3C7', 'R2C7'],
  ['R6C4', 'R5C4', 'R5C3', 'R4C3'],
  ['R7C4', 'R6C5', 'R6C6'],
  ['R4C8', 'R4C7', 'R4C6', 'R5C5'],
  ['R6C2', 'R7C2', 'R8C2'],
];

const alternatingParityKey = Pair.fnToKey(
  (a, b) => (a + b) % 2 === 1,
  geometry.numValues);

const allShade = (cells, color) => new And(
  shade.at(cells).map(cell => new Given(cell, color)));

const lineRules = lines.flatMap(cells => [
  // If the line contains red, consecutive digits alternate parity.
  new Or([
    allShade(cells, BLUE),
    new Pair(alternatingParityKey, 'alternating parity', ...cells),
  ]),
  // If the line contains blue, its box-separated segments have equal sums.
  new Or([
    allShade(cells, RED),
    new RegionSumLine(...cells),
  ]),
  // A line containing both colors is a renban.
  new Or([
    allShade(cells, RED),
    allShade(cells, BLUE),
    new Renban(...cells),
  ]),
]);

return [
  new Shape('9x9'),
  new YinYang(),
  ...lineRules,
];
