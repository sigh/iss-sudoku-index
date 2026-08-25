// Title: Missing Arrow Sudoku
// Author: Akash Doulani
// Video: https://www.youtube.com/watch?v=_IaRP84aYUc
// Source: https://app.crackingthecryptic.com/webapp/tNBJqRT2QJ

// Normal sudoku rules apply. The grey lines are incomplete arrows: the digit
// on one end of each line is the sum of the other digits on the same line.
// No bulb marks which end holds the total, so each line is encoded as a
// disjunction between its two endpoints acting as the sum cell (Arrow takes
// the sum cell first, followed by the arm cells).

// Cell lists below are transcribed from the drawn grey lines (source lines[],
// in drawn order).
const lines = [
  ['R1C1', 'R2C2', 'R3C1'],
  ['R2C3', 'R1C4'],
  ['R1C5', 'R2C4', 'R3C3', 'R4C2', 'R5C1', 'R6C2', 'R7C1'],
  ['R9C1', 'R8C2', 'R7C3'],
  ['R9C2', 'R8C3', 'R7C4', 'R6C5', 'R5C6', 'R4C7'],
  ['R1C7', 'R2C6', 'R3C5', 'R4C4', 'R5C3'],
  ['R1C9', 'R2C9', 'R3C9', 'R4C9'],
  ['R6C9', 'R7C8', 'R8C7', 'R9C6'],
  ['R8C6', 'R7C7', 'R6C8'],
  ['R7C6', 'R6C6', 'R5C7', 'R5C8'],
];

function missingArrow(cells) {
  const [first, ...rest] = cells;
  const last = rest[rest.length - 1];
  const middle = rest.slice(0, -1);
  return new Or([
    new Arrow(first, ...middle, last),
    new Arrow(last, ...middle, first),
  ]);
}

return [
  new Shape('9x9'),
  ...lines.map(missingArrow),
];
