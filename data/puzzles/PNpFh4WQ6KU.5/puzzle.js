// Title: Dec. 19, 2022: Before 9 Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=PNpFh4WQ6KU
// Source: https://tinyurl.com/5erjv3e7

// Normal sudoku rules apply (default row/column/box all-different).
//
// Each outside clue gives the sum of the digits that appear before the 9 in
// its row/column, counted from the clue's own side of the grid. Every clued
// line is scanned as an ordered cell list starting at the clue's edge and
// walking inward; digits are accumulated until the 9 is reached, and the
// accumulated sum at that point must equal the clue.
//
// beforeNine(target) builds one such scan as an NFA: `sum` accumulates
// digits seen so far (clamped at target+1, a dead sink once the sum can only
// fail); `done` freezes accumulation the instant a 9 is read, since digits
// after the 9 are irrelevant to the clue. Accept only once `done` and the
// frozen sum equals the target.
const beforeNine = (target) => NFA.encodeSpec({
  startState: { sum: 0, done: false },
  transition: ({ sum, done }, value) => {
    if (done) return { sum, done };
    if (value === 9) return { sum, done: true };
    return { sum: Math.min(sum + value, target + 1), done: false };
  },
  accept: ({ sum, done }) => done && sum === target,
  maxDepth: 9,
}, 9);

// Outside-clue cell orders, each starting at the clue's own edge:
//   left/above clues walk in increasing row/col order (edge -> far side);
//   right/below clues walk in decreasing row/col order (edge -> far side).
// Row/column membership and clue values are read from the drawn outside-clue
// text positions (left of row r, above column c, etc.).
const rowCells = (r, cols) => cols.map(c => makeCellId(r, c));
const colCells = (c, rows) => rows.map(r => makeCellId(r, c));

const LEFT = [
  [1, 9], [2, 1], [5, 11], [7, 7],
].map(([r, target]) => new NFA(beforeNine(target), 'BeforeNine',
  ...rowCells(r, [1, 2, 3, 4, 5, 6, 7, 8, 9])));

const RIGHT = [
  [8, 5], [9, 11],
].map(([r, target]) => new NFA(beforeNine(target), 'BeforeNine',
  ...rowCells(r, [9, 8, 7, 6, 5, 4, 3, 2, 1])));

const ABOVE = [
  [1, 9], [2, 2], [5, 10], [7, 7],
].map(([c, target]) => new NFA(beforeNine(target), 'BeforeNine',
  ...colCells(c, [1, 2, 3, 4, 5, 6, 7, 8, 9])));

const BELOW = [
  [8, 6], [9, 13],
].map(([c, target]) => new NFA(beforeNine(target), 'BeforeNine',
  ...colCells(c, [9, 8, 7, 6, 5, 4, 3, 2, 1])));

return [
  new Shape('9x9'),

  new Given('R3C4', 7),
  new Given('R3C6', 4),
  new Given('R4C3', 6),
  new Given('R4C7', 7),
  new Given('R5C5', 9),
  new Given('R6C3', 5),
  new Given('R6C7', 1),
  new Given('R7C4', 6),
  new Given('R7C6', 1),

  ...LEFT,
  ...RIGHT,
  ...ABOVE,
  ...BELOW,
];
