// Title: Beaded Thread
// Author: saltviolet
// Video: https://www.youtube.com/watch?v=kOHLjPuhxY0
// Source: https://sudokupad.app/by5mckerp5

// Kropki absence is negative information only on edges directly covered by a line.
const violetLine = [
  'R9C4', 'R8C4', 'R7C4', 'R6C5', 'R5C5',
  'R4C5', 'R3C6', 'R2C6', 'R1C6',
];

const entropicLines = [
  ['R4C1', 'R4C2', 'R4C3', 'R4C4', 'R4C5'],
  ['R6C9', 'R5C9', 'R4C9', 'R3C9', 'R2C9', 'R1C9'],
  ['R9C6', 'R9C5', 'R9C4', 'R9C3', 'R9C2', 'R9C1'],
  ['R8C7', 'R8C8', 'R8C9'],
];

const modularLines = [
  ['R6C5', 'R6C6', 'R6C7', 'R6C8', 'R6C9'],
  ['R1C4', 'R1C5', 'R1C6', 'R1C7', 'R1C8', 'R1C9'],
  ['R9C1', 'R8C1', 'R7C1', 'R6C1', 'R5C1', 'R4C1'],
  ['R2C3', 'R2C2', 'R2C1'],
];

const blackDots = [
  ['R5C9', 'R4C9'],
  ['R1C9', 'R2C9'],
  ['R4C3', 'R4C4'],
  ['R5C1', 'R4C1'],
  ['R9C3', 'R9C4'],
  ['R8C4', 'R9C4'],
];

const whiteDots = [
  ['R6C1', 'R5C1'],
  ['R9C1', 'R8C1'],
  ['R1C6', 'R2C6'],
  ['R1C7', 'R1C6'],
  ['R8C8', 'R8C7'],
  ['R6C5', 'R6C6'],
  ['R6C7', 'R6C6'],
  ['R6C9', 'R6C8'],
];

const edgeKey = (a, b) => [a, b].sort().join('-');
const markedEdges = new Set([...blackDots, ...whiteDots].map(cells => edgeKey(...cells)));
const lineEdges = [violetLine, ...entropicLines, ...modularLines]
  .flatMap(line => line.slice(1).map((cell, index) => [line[index], cell]));
const unmarkedLineEdges = lineEdges.filter(cells => !markedEdges.has(edgeKey(...cells)));
const notKropki = Pair.fnToKey(
  (a, b) => Math.abs(a - b) !== 1 && a !== 2 * b && b !== 2 * a,
  9,
);

const violetConstraints = [
  new Renban(...violetLine),
  new RegionSumLine(...violetLine),
];
const entropyConstraints = entropicLines.map(line => new Entropic(...line));
const modularConstraints = modularLines.map(line => new Modular(3, ...line));
const blackDotConstraints = blackDots.map(cells => new BlackDot(...cells));
const whiteDotConstraints = whiteDots.map(cells => new WhiteDot(...cells));
const negativeThreadConstraints = unmarkedLineEdges.map(
  cells => new Pair(notKropki, 'not Kropki', ...cells),
);

return [
  new Shape('9x9'),
  ...violetConstraints,
  ...entropyConstraints,
  ...modularConstraints,
  ...blackDotConstraints,
  ...whiteDotConstraints,
  ...negativeThreadConstraints,
];
