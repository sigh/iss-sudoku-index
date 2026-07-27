// Title: German Indeuxers
// Author: Donatello_86
// Video: https://www.youtube.com/watch?v=f-5NbaMact8
// Source: https://sudokupad.app/420917reil

// Killer cages (dashed boxes): sum shown at the top-left corner, digits
// distinct within the cage.
const cages = [
  [10, 'R2C3', 'R2C4', 'R2C5'],
  [15, 'R8C1', 'R8C2', 'R8C3'],
  [14, 'R6C9', 'R7C8', 'R7C9'],
];

// "X" markers: adjacent cells sum to 10.
const xPairs = [
  ['R7C1', 'R7C2'],
  ['R4C4', 'R5C4'],
  ['R5C5', 'R6C5'],
  ['R5C1', 'R5C2'],
];

// White dot: adjacent cells are consecutive.
const whiteDots = [
  ['R5C4', 'R5C5'],
];

// Arrow: the white circle overlay at R7C5 is the bulb; the arrow's other end
// is the single arm cell R6C6.
const arrow = ['R7C5', 'R6C6'];

// Green lines, each listed from position 1 (the cell under the attached
// green-bordered circle) onward, grouped by length because the "references
// one other line" rule only ever relates lines of equal length.
const linesLen2 = [
  ['R2C1', 'R2C2'],
  ['R2C3', 'R2C4'],
  ['R9C6', 'R9C7'],
  ['R4C9', 'R5C9'],
];
const linesLen3 = [
  ['R2C6', 'R2C7', 'R2C8'],
  ['R8C8', 'R7C7', 'R6C6'],
  ['R6C4', 'R7C3', 'R7C4'],
  ['R8C6', 'R7C6', 'R8C5'],
];
const linesLen4 = [
  ['R5C3', 'R4C2', 'R4C1', 'R3C1'],
  ['R5C7', 'R4C8', 'R5C8', 'R6C9'],
  ['R2C5', 'R3C5', 'R4C4', 'R5C5'],
  ['R9C4', 'R9C3', 'R9C2', 'R9C1'],
];
const allLines = [...linesLen2, ...linesLen3, ...linesLen4];

// The 3 ways to partition 4 same-length lines into two reference pairs.
const matchings = [
  [[0, 1], [2, 3]],
  [[0, 2], [1, 3]],
  [[0, 3], [1, 2]],
];

// "Each green line references one other green line of the same length.
// Position X of both green lines sum to ten." Nothing in the drawing (every
// line shares one colour, no labels) identifies which same-length line
// partners which other. That partner assignment is therefore encoded, not
// assumed: a disjunction over the 3 possible perfect matchings of each
// same-length group, each branch requiring a position-wise sum of 10 for
// both pairs in that matching.
function referencePairing(group) {
  return new Or(matchings.map(matching => new And(
    matching.flatMap(([i, j]) => {
      const a = group[i], b = group[j];
      return a.map((cell, pos) => new Sum(10, cell, b[pos]));
    })
  )));
}

return [
  new Shape('9x9'),

  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  ...xPairs.map(pair => new X(...pair)),
  ...whiteDots.map(pair => new WhiteDot(...pair)),
  new Arrow(...arrow),
  ...allLines.map(line => new Whisper(5, ...line)),

  referencePairing(linesLen2),
  referencePairing(linesLen3),
  referencePairing(linesLen4),
];
