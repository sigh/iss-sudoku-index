// Title: Red Colour
// Author: Apiyo
// Video: https://www.youtube.com/watch?v=B0ZGFMHGkeI
// Source: https://app.crackingthecryptic.com/sudoku/6rGgFPT8GN

// Normal sudoku rules apply on a 9x9 grid (default rows/cols/boxes).
// Givens: R2C1=4, R8C9=4.
// Cue (thermometer-style line): digits increase from the bulb at R5C2
// through R5C3, R5C4, R5C5, R5C6.
// Black dots: cells joined by a black dot are in a 1:2 ratio (Kropki black
// dot, adjacent cells).
// White circle (cueball) at R3C6: odd digit. Blue square (chalk) at R2C9:
// even digit.
// The two 2-cell cages (R1C6-R1C7 and R2C6-R2C7, no printed total) are
// horizontally adjacent pairs, each read left-to-right as a 2-digit number
// (tens digit = left cell, ones digit = right cell -- the only order the
// horizontal layout draws). The two numbers sum to 147. Each cage's cells
// share a row, so row all-different already forces the two digits apart;
// no separate AllDifferent is added.
// The grid's perimeter (row 1, row 9, column 1, column 9) sums to 147.
// Each of boxes 2-7 contains, somewhere inside it, a horizontal domino
// reading "1N" left-to-right (1 in the left cell, N = box number in the
// right cell). The rules do not say where in the box, so every horizontal
// domino position within the box is an Or branch.

const givens = [
  new Given('R2C1', 4),
  new Given('R8C9', 4),
];

const cueLine = new Thermo('R5C2', 'R5C3', 'R5C4', 'R5C5', 'R5C6');

const blackDots = [
  ['R3C3', 'R4C3'],
  ['R3C5', 'R4C5'],
  ['R3C7', 'R4C7'],
  ['R7C5', 'R8C5'],
  ['R8C4', 'R9C4'],
  ['R8C6', 'R9C6'],
].map(([a, b]) => new BlackDot(a, b));

const cueball = new Given('R3C6', 1, 3, 5, 7, 9);
const chalk = new Given('R2C9', 2, 4, 6, 8);

const cageTotal = new Sum(
  147,
  ['R1C6', 10], ['R1C7', 1],
  ['R2C6', 10], ['R2C7', 1]);

function perimeterCells() {
  const cells = [];
  for (let c = 1; c <= 9; c++) cells.push(makeCellId(1, c), makeCellId(9, c));
  for (let r = 2; r <= 8; r++) cells.push(makeCellId(r, 1), makeCellId(r, 9));
  return cells;
}
const perimeterTotal = new Sum(147, ...perimeterCells());

// Every horizontal 2-cell slot inside a 3x3 box: 3 rows x 2 column-pairs
// each = 6 candidate positions for the box's "1N" domino.
function boxDominoRule(topRow, leftCol, n) {
  const branches = [];
  for (let dr = 0; dr < 3; dr++) {
    for (let dc = 0; dc < 2; dc++) {
      const left = makeCellId(topRow + dr, leftCol + dc);
      const right = makeCellId(topRow + dr, leftCol + dc + 1);
      branches.push(new And([
        new Given(left, 1),
        new Given(right, n),
      ]));
    }
  }
  return new Or(branches);
}

const boxDominoes = [
  boxDominoRule(1, 4, 2), // box 2: R1-3,C4-6
  boxDominoRule(1, 7, 3), // box 3: R1-3,C7-9
  boxDominoRule(4, 1, 4), // box 4: R4-6,C1-3
  boxDominoRule(4, 4, 5), // box 5: R4-6,C4-6
  boxDominoRule(4, 7, 6), // box 6: R4-6,C7-9
  boxDominoRule(7, 1, 7), // box 7: R7-9,C1-3
];

return [
  new Shape('9x9'),
  ...givens,
  cueLine,
  ...blackDots,
  cueball,
  chalk,
  cageTotal,
  perimeterTotal,
  ...boxDominoes,
];
