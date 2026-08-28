// Title: Between the Head and the Tip
// Author: Niverio
// Video: https://www.youtube.com/watch?v=zbeJdFutCF8
// Source: https://bit.ly/3yXE5Ph
//
// Normal sudoku (9x9, default 3x3 boxes). Twelve between/arrow lines: digits
// on a line must be strictly between the digits in its two circled end
// cells (Between), and additionally one of the two end circles equals the
// sum of every other digit on the line, including the other circle (Arrow).
// The rules state only that "one circle" is the sum -- neither end carries
// an arrowhead or other mark distinguishing which one, and the drawn art
// gives no fixed direction, so each line is encoded as either end being the
// sum head: Or(Arrow(end0, ...mids, end1), Arrow(end1, ...mids, end0)).
//
// Line cell paths are hand-transcribed from the puzzle's drawn between-line
// geometry (drawn order, endpoints first/last).
const lines = [
  ['R3C3', 'R4C3', 'R4C2', 'R4C1'],
  ['R5C1', 'R6C1', 'R6C2', 'R6C3'],
  ['R3C1', 'R2C1', 'R1C2', 'R1C3'],
  ['R3C6', 'R3C7', 'R2C7', 'R1C7'],
  ['R3C8', 'R3C9', 'R2C9', 'R1C9'],
  ['R2C4', 'R2C5', 'R2C6'],
  ['R7C2', 'R8C2', 'R9C2'],
  ['R9C8', 'R8C8', 'R8C7', 'R7C7'],
  ['R8C4', 'R8C5', 'R8C6'],
  ['R6C5', 'R5C5', 'R4C5'],
  ['R6C7', 'R5C8', 'R5C9', 'R6C9'],
  ['R7C5', 'R7C4', 'R6C4'],
];

const betweenAndArrow = lines.flatMap(cells => {
  const first = cells[0];
  const last = cells[cells.length - 1];
  const mids = cells.slice(1, -1);
  return [
    new Between(...cells),
    new Or([
      new Arrow(first, ...mids, last),
      new Arrow(last, ...mids, first),
    ]),
  ];
});

return [
  new Shape('9x9'),
  ...betweenAndArrow,
];
