// Title: Shortsighted X-Sums Sudoku
// Author: J. Quincy Magoo
// Video: https://www.youtube.com/watch?v=GA81BlyWqxs
// Source: https://tinyurl.com/mrwhzrxt

// Normal sudoku rules apply: default 9x9 grid with default row/column/box
// all-different (the drawn regions are the standard nine 3x3 boxes).
//
// Rule: "Outside clues show the sum of the nearest X or (X-1) numbers, where
// X is the number in the first cell from that direction." For a lane whose
// first cell (nearest the clue) has value X, the clue total equals the sum
// of either the first X cells or the first (X-1) cells read from that
// direction -- the rule leaves the choice between the two counts to the
// solver, per clue.

// Given digits, transcribed from the puzzle's drawn grid (1-indexed rows/cols).
const GIVENS = [
  { row: 4, col: 5, value: 9 },
  { row: 6, col: 2, value: 7 },
  { row: 6, col: 8, value: 6 },
];

// Outside clues, transcribed from the puzzle's drawn corner/edge badges.
// axis/index use 1-indexed row or column; `from` is the side the clue
// reads inward from.
const CLUES = [
  { axis: 'col', index: 6, from: 'start', target: 13 }, // top C6 -> 13
  { axis: 'col', index: 8, from: 'start', target: 18 }, // top C8 -> 18
  { axis: 'row', index: 1, from: 'start', target: 32 }, // left R1 -> 32
  { axis: 'row', index: 3, from: 'start', target: 5 },  // left R3 -> 5
  { axis: 'row', index: 5, from: 'start', target: 8 },  // left R5 -> 8
  { axis: 'row', index: 7, from: 'start', target: 15 }, // left R7 -> 15
  { axis: 'row', index: 9, from: 'start', target: 40 }, // left R9 -> 40
  { axis: 'row', index: 1, from: 'end', target: 13 },   // right R1 -> 13
  { axis: 'row', index: 3, from: 'end', target: 1 },    // right R3 -> 1
  { axis: 'row', index: 5, from: 'end', target: 7 },    // right R5 -> 7
  { axis: 'row', index: 7, from: 'end', target: 15 },   // right R7 -> 15
  { axis: 'row', index: 9, from: 'end', target: 15 },   // right R9 -> 15
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

// One "X or (X-1)" outside clue: Or, over every possible first-cell value x,
// of (first cell == x) AND (sum of the first x cells or the first (x-1)
// cells == target). A count of 0 (x == 1) means an empty sum, satisfied by
// the Given alone exactly when target == 0; none of this puzzle's targets
// are 0, so that branch drops for every clue as unsatisfiable, same as the
// count-out-of-range branches.
const shortsightedXSum = (target, cells) => {
  const orParts = [];
  for (let x = 1; x <= 9; x++) {
    const sumParts = [];
    for (const count of [x - 1, x]) {
      if (count === 0) {
        if (target === 0) sumParts.push(new Given(cells[0], x));
      } else if (count >= 1 && count <= 9) {
        sumParts.push(new Sum(target, ...cells.slice(0, count)));
      }
    }
    if (sumParts.length === 0) continue;
    orParts.push(new And([
      new Given(cells[0], x),
      sumParts.length === 1 ? sumParts[0] : new Or(sumParts),
    ]));
  }
  return new Or(orParts);
};

const outsideClues = CLUES.map(clue => shortsightedXSum(clue.target, laneCells(clue)));

return [
  new Shape('9x9'),
  ...GIVENS.map(g => new Given(makeCellId(g.row, g.col), g.value)),
  ...outsideClues,
];
