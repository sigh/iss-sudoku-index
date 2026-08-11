// Title: Roll Out The Red Carpets
// Author: Arlo Lipof
// Video: https://www.youtube.com/watch?v=xg0jC9uGrZ0
// Source: https://app.crackingthecryptic.com/sudoku/7L6tHTrdBq

// Normal sudoku rules (rows, columns, boxes) apply -- default Shape('9x9').
//
// Four red spiral lines, one per corner box, each covering all 9 cells of
// its box. A red circle marks the bulbed end of each line (its first
// cell). Rule: "Digits along a red line must repeat in the same order
// when the carpet is 'rolled out' starting from the bulbed end (e.g. the
// digits along the line in box 7 will unroll up column 3, duplicating eg
// R8C2 in R1C3)." The worked example fixes what "roll out" means: the
// bulb's first step along the spiral (bulb -> second cell) is "up column
// 3" for the box-7 line, and pulling the whole 9-cell spiral straight
// along that same direction sends its 9th cell (R8C2) to the 9th cell of
// that straight run (R1C3) -- exactly the pairing the rules state. The
// other three lines are unrolled the same way, using each line's own
// first step as its straight-out direction. Each spiral's first three
// cells already hug that straight path (before the line turns inward at
// the box corner), so those positions are literally the same cells;
// positions 4-9 pair a spiral cell with a different cell on the straight
// run, and those pairings are the actual constraint.
const spiralLines = [
  // Box 1 (R1-3,C1-3), bulb R3C1 -- geometry from the drawn red line.
  ['R3C1', 'R3C2', 'R3C3', 'R2C3', 'R1C3', 'R1C2', 'R1C1', 'R2C1', 'R2C2'],
  // Box 3 (R1-3,C7-9), bulb R1C7.
  ['R1C7', 'R2C7', 'R3C7', 'R3C8', 'R3C9', 'R2C9', 'R1C9', 'R1C8', 'R2C8'],
  // Box 7 (R7-9,C1-3), bulb R9C3 -- the rules' own worked example.
  ['R9C3', 'R8C3', 'R7C3', 'R7C2', 'R7C1', 'R8C1', 'R9C1', 'R9C2', 'R8C2'],
  // Box 9 (R7-9,C7-9), bulb R7C9.
  ['R7C9', 'R7C8', 'R7C7', 'R8C7', 'R9C7', 'R9C8', 'R9C9', 'R8C9', 'R8C8'],
];

const unrollPairs = spiralLines.flatMap(spiral => {
  const bulb = parseCellId(spiral[0]);
  const next = parseCellId(spiral[1]);
  const dr = next.row - bulb.row;
  const dc = next.col - bulb.col;
  const straight = spiral.map((_, k) =>
    makeCellId(bulb.row + dr * k, bulb.col + dc * k));
  return spiral
    .map((cell, k) => [cell, straight[k]])
    .filter(([a, b]) => a !== b);
});

const unroll = unrollPairs.map(([a, b]) => new SameValues(2, a, b));

// V/X edge markers: V pairs sum to 5, X pairs sum to 10. Not every V/X on
// the grid is drawn (rules text), so undrawn adjacent pairs carry no
// constraint -- no negative/exhaustive reading is encoded.
const vClues = [
  ['R5C3', 'R5C4'], ['R6C1', 'R6C2'], ['R7C1', 'R7C2'],
  ['R8C3', 'R9C3'], ['R9C4', 'R9C5'], ['R7C5', 'R8C5'],
].map(([a, b]) => new V(a, b));

const xClues = [
  ['R1C2', 'R1C3'], ['R2C3', 'R2C4'], ['R1C6', 'R2C6'], ['R5C1', 'R6C1'],
  ['R5C5', 'R5C6'], ['R5C7', 'R6C7'], ['R4C9', 'R5C9'], ['R7C1', 'R8C1'],
  ['R7C2', 'R7C3'], ['R8C2', 'R8C3'], ['R9C2', 'R9C3'], ['R7C6', 'R7C7'],
  ['R7C8', 'R8C8'],
].map(([a, b]) => new X(a, b));

return [
  new Shape('9x9'),
  new Given('R1C4', 6),
  new Given('R4C4', 2),
  ...unroll,
  ...vClues,
  ...xClues,
];
