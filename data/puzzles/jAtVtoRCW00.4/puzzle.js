// Title: Nov. 17, 2021: Fourshadowing
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=jAtVtoRCW00
// Source: https://tinyurl.com/5n543vv2

// Normal sudoku rules apply (Shape('9x9') adds row/column/box all-different).
// "Digits in cells separated by a black dot must have the ratio given" and
// "digits in cells separated by a white dot must have the difference given":
// every dot in the diagram carries a printed number, so each dot is encoded
// with its own labelled ratio/difference rather than the unlabelled Kropki
// defaults (2:1 / consecutive). There is no class for a parameterised
// ratio/difference, so each label gets a `Pair.fnToKey` relation, one `Pair`
// per drawn dot (never flattening separate dominoes into one multi-cell call).

const ratio4 = Pair.fnToKey((a, b) => a === 4 * b || b === 4 * a, 9);
const diff4 = Pair.fnToKey((a, b) => Math.abs(a - b) === 4, 9);
const diff5 = Pair.fnToKey((a, b) => Math.abs(a - b) === 5, 9);

// Black dots (ratio 4)
const ratioDots = [
  ['R2C8', 'R2C9'],
  ['R1C8', 'R1C7'],
  ['R9C2', 'R9C3'],
  ['R8C2', 'R8C1'],
  ['R4C4', 'R5C4'],
  ['R8C6', 'R8C5'],
  ['R7C9', 'R6C9'],
];

// White dots (difference 4 unless noted)
const diff4Dots = [
  ['R1C8', 'R2C8'],
  ['R2C9', 'R3C9'],
  ['R8C1', 'R7C1'],
  ['R8C2', 'R9C2'],
  ['R6C1', 'R7C1'],
  ['R9C4', 'R9C3'],
  ['R1C7', 'R1C6'],
  ['R4C9', 'R3C9'],
  ['R6C5', 'R6C6'],
  ['R6C6', 'R5C6'],
  ['R4C4', 'R4C5'],
  ['R6C3', 'R6C4'],
  ['R3C6', 'R4C6'],
  ['R6C2', 'R7C2'],
  ['R2C7', 'R2C6'],
  ['R2C5', 'R2C4'],
  ['R9C5', 'R9C6'],
  ['R1C3', 'R1C4'],
  ['R1C2', 'R1C3'],
  ['R2C4', 'R1C4'],
  ['R8C8', 'R9C8'],
  ['R3C7', 'R3C6'],
];

// The one white dot printed "5"
const diff5Dots = [
  ['R4C2', 'R4C1'],
];

return [
  new Shape('9x9'),

  new Given('R1C1', 4),
  new Given('R3C4', 4),
  new Given('R4C3', 4),
  new Given('R6C7', 4),
  new Given('R7C6', 4),
  new Given('R9C9', 4),

  ...ratioDots.map(([a, b]) => new Pair(ratio4, 'black dot 4', a, b)),
  ...diff4Dots.map(([a, b]) => new Pair(diff4, 'white dot 4', a, b)),
  ...diff5Dots.map(([a, b]) => new Pair(diff5, 'white dot 5', a, b)),
];
