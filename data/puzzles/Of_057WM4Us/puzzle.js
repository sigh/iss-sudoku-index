// Title: Broken X-Sums Sudoku
// Author: Richard Stolk
// Video: https://www.youtube.com/watch?v=Of_057WM4Us
// Source: https://app.crackingthecryptic.com/sudoku/LfpB98Jrt6

// Normal sudoku rules apply: default 9x9 grid with default row/column/box
// all-different (the drawn regions are the standard nine 3x3 boxes, so no
// explicit region constraint is needed). No given digits.
//
// Rule: "A clue outside the grid indicates the sum of the first digits from
// that side. The number of digits to count is (X-1) or (X+1) where X is the
// digit in the first cell from that side." So for a lane with first-cell
// value X, the clue total equals the sum of either the first (X-1) or the
// first (X+1) cells read from that side -- whichever stays within the
// lane's 9 cells -- never the plain X-sum reading. Which of the two counts
// applies is left to the solver, per clue; both options are encoded.

// Outside clues, transcribed from the puzzle's drawn corner badges.
// axis/index use 1-indexed row or column; `from` is the side the clue
// reads inward from.
const CLUES = [
  { axis: 'col', index: 1, from: 'start', target: 10 }, // top C1 -> 10
  { axis: 'col', index: 6, from: 'start', target: 4 },  // top C6 -> 4
  { axis: 'col', index: 7, from: 'start', target: 28 }, // top C7 -> 28
  { axis: 'col', index: 3, from: 'end', target: 27 },   // bottom C3 -> 27
  { axis: 'col', index: 4, from: 'end', target: 30 },   // bottom C4 -> 30
  { axis: 'col', index: 9, from: 'end', target: 7 },    // bottom C9 -> 7
  { axis: 'row', index: 1, from: 'start', target: 14 }, // left R1 -> 14
  { axis: 'row', index: 3, from: 'start', target: 14 }, // left R3 -> 14
  { axis: 'row', index: 4, from: 'start', target: 34 }, // left R4 -> 34
  { axis: 'row', index: 7, from: 'start', target: 18 }, // left R7 -> 18
  { axis: 'row', index: 3, from: 'end', target: 32 },   // right R3 -> 32
  { axis: 'row', index: 6, from: 'end', target: 18 },   // right R6 -> 18
  { axis: 'row', index: 7, from: 'end', target: 10 },   // right R7 -> 10
  { axis: 'row', index: 9, from: 'end', target: 28 },   // right R9 -> 28
];

// A lane's 9 cells, ordered starting from the clue's side.
const laneCells = ({ axis, index, from }) => {
  const cells = [];
  for (let i = 1; i <= 9; i++) {
    const pos = from === 'start' ? i : 10 - i;
    cells.push(axis === 'col' ? makeCellId(pos, index) : makeCellId(index, pos));
  }
  return cells;
};

// One "broken X-sum" clue: Or, over every possible first-cell value x, of
// (first cell == x) AND (sum of the first (x-1) or (x+1) cells == target).
// A branch whose count falls outside the 1..9 cell lane is omitted (it can
// never be satisfied).
const brokenXSum = (target, cells) => {
  const orParts = [];
  for (let x = 1; x <= 9; x++) {
    const sumParts = [];
    for (const count of [x - 1, x + 1]) {
      if (count >= 1 && count <= 9) {
        sumParts.push(new Sum(target, ...cells.slice(0, count)));
      }
    }
    orParts.push(new And([
      new Given(cells[0], x),
      sumParts.length === 1 ? sumParts[0] : new Or(sumParts),
    ]));
  }
  return new Or(orParts);
};

const outsideClues = CLUES.map(clue => brokenXSum(clue.target, laneCells(clue)));

return [
  new Shape('9x9'),
  ...outsideClues,
];
