// Title: 2 Truths and a Quibble
// Author: Zombie Hunter
// Video: https://www.youtube.com/watch?v=MAL2QLszGjE
// Source: https://sudokupad.app/9tt24bqtnq

// Normal sudoku rules apply.
//
// QuibTruples: each circle sits at the meeting point of 4 cells, all within
// one box, and names 3 candidate digits. Exactly 2 of the 3 are "true" and
// each must appear in one of the 4 marked cells. The third "quibbling" digit
// must NOT appear in any of the 4 marked cells; instead it occupies the cell
// at the reading-order position (1-9, left to right then top to bottom)
// within that same box equal to its own value.
//
// Each circle is encoded as a disjunction over which of its 3 digits is the
// quibbling one. For the candidate x taken as quibbling: pin x's fixed home
// cell to x (box all-different then forces x out of the other 8 box cells,
// including the 4 marked cells, satisfying "must not appear" without a
// separate exclusion), and require each of the other two digits to appear in
// at least one of the 4 marked cells. A candidate whose own home cell is one
// of the circle's 4 marked cells is omitted from the disjunction: pinning it
// there would place it inside the circle, contradicting "must not appear",
// so that candidate can provably never be the quibbling digit for this
// circle -- this is arithmetic on the fixed box-position geometry, not a
// deduction from the solution.

// The 16 QuibTruples circles: `cells` are the 4 surrounding squares, `values`
// the 3 candidate digits, transcribed from the puzzle's quadruple-circle
// clue entries.
const quibCircleData = [
  { cells: ['R1C1', 'R1C2', 'R2C1', 'R2C2'], values: [1, 7, 9] },
  { cells: ['R5C5', 'R5C6', 'R6C5', 'R6C6'], values: [1, 7, 9] },
  { cells: ['R2C2', 'R2C3', 'R3C2', 'R3C3'], values: [3, 4, 8] },
  { cells: ['R1C5', 'R1C6', 'R2C5', 'R2C6'], values: [6, 7, 9] },
  { cells: ['R1C8', 'R1C9', 'R2C8', 'R2C9'], values: [1, 4, 7] },
  { cells: ['R2C7', 'R2C8', 'R3C7', 'R3C8'], values: [2, 5, 9] },
  { cells: ['R4C4', 'R4C5', 'R5C4', 'R5C5'], values: [2, 4, 8] },
  { cells: ['R4C5', 'R4C6', 'R5C5', 'R5C6'], values: [2, 5, 9] },
  { cells: ['R5C4', 'R5C5', 'R6C4', 'R6C5'], values: [1, 4, 7] },
  { cells: ['R4C8', 'R4C9', 'R5C8', 'R5C9'], values: [1, 4, 7] },
  { cells: ['R5C1', 'R5C2', 'R6C1', 'R6C2'], values: [3, 4, 6] },
  { cells: ['R8C1', 'R8C2', 'R9C1', 'R9C2'], values: [2, 5, 9] },
  { cells: ['R7C2', 'R7C3', 'R8C2', 'R8C3'], values: [1, 7, 9] },
  { cells: ['R8C4', 'R8C5', 'R9C4', 'R9C5'], values: [3, 6, 8] },
  { cells: ['R8C8', 'R8C9', 'R9C8', 'R9C9'], values: [2, 4, 8] },
  { cells: ['R7C7', 'R7C8', 'R8C7', 'R8C8'], values: [1, 7, 9] },
];

// Each box, in reading order, as an array of its 9 cells also in reading
// order -- box[value - 1] is the cell at box-position `value`.
const boxes = cellGraph('9x9').boxes();

const quibCircles = quibCircleData.map(({ cells, values }) => {
  const box = boxes.find((b) => cells.every((cell) => b.includes(cell)));
  const cases = [];
  for (const x of values) {
    const homeCell = box[x - 1];
    if (cells.includes(homeCell)) continue;
    const trueDigits = values.filter((v) => v !== x);
    cases.push(new And([
      new Given(homeCell, x),
      ...trueDigits.map(
        (y) => new Or(cells.map((cell) => new Given(cell, y)))),
    ]));
  }
  return new Or(cases);
});

return [
  new Shape('9x9'),
  new Given('R2C4', 5),
  ...quibCircles,
];
