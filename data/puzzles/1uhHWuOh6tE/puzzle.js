// Title: Streaming Water
// Author: Jaega
// Video: https://www.youtube.com/watch?v=1uhHWuOh6tE
// Source: https://app.crackingthecryptic.com/sudoku/JNB9hBhbFP

// Normal sudoku rules apply (default row/col/box all-different).
// White dot: consecutive digits. Black dot: 1:2 ratio. "Not all dots are
// given" means the absence of a dot elsewhere carries no information, so
// no negative (StrictKropki) constraint is added.
// Killer cages show sums where printed; two cages have no total but are
// still real (digits do not repeat within them).
// Thermo: digits increase from the bulb.
// All odd digits form a single orthogonally-connected region ("body of
// water") that never fills a 2x2 square.

const ODD = [1, 3, 5, 7, 9];

// Killer cages, sum + no-repeat.
const summedCages = [
  new Cage(15, 'R1C1', 'R2C1', 'R3C1'),
  new Cage(15, 'R1C7', 'R1C8', 'R1C9'),
  new Cage(15, 'R9C1', 'R9C2', 'R9C3'),
  new Cage(15, 'R7C9', 'R8C9', 'R9C9'),
];

// No-total cages: still real cages, no-repeat only.
const unsummedCages = [
  new AllDifferent(
    'R3C4', 'R3C3', 'R4C3', 'R4C4', 'R5C3', 'R6C3', 'R7C3', 'R7C4'),
  new AllDifferent(
    'R3C5', 'R4C5', 'R5C5', 'R6C5', 'R7C5', 'R6C4', 'R6C6', 'R4C6'),
  new AllDifferent(
    'R3C6', 'R3C7', 'R4C7', 'R5C7', 'R5C6', 'R7C6', 'R7C7', 'R6C7'),
];

const whiteDots = [
  ['R1C1', 'R1C2'],
  ['R8C1', 'R9C1'],
  ['R9C8', 'R9C9'],
].map(cells => new WhiteDot(...cells));

const blackDots = [
  ['R9C6', 'R9C7'],
  ['R9C5', 'R9C6'],
  ['R6C1', 'R7C1'],
  ['R5C1', 'R6C1'],
  ['R1C3', 'R1C4'],
  ['R1C4', 'R1C5'],
  ['R3C9', 'R4C9'],
  ['R4C9', 'R5C9'],
].map(cells => new BlackDot(...cells));

// No 2x2 square may be all odd: every 2x2 block must contain at least one
// even digit somewhere among its four cells (order-independent, so a plain
// "contains an even digit" wildcard match suffices).
const graph = cellGraph('9x9');
const noOddSquares = [];
for (let r = 1; r <= 8; r++) {
  for (let c = 1; c <= 8; c++) {
    noOddSquares.push(
      new Regex('.*[2468].*', ...graph.block(makeCellId(r, c), 2, 2)));
  }
}

return [
  new Shape('9x9'),
  ...summedCages,
  ...unsummedCages,
  ...whiteDots,
  ...blackDots,
  new Thermo('R6C4', 'R6C5'),
  ...noOddSquares,
  // Whole-grid connectivity: all odd digits form exactly one orthogonal
  // region.
  new ConnectedValues('', ODD),
];
