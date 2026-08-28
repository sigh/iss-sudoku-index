// Title: August 28, 2021: Even Sandwich
// Author: clover!
// Video: https://www.youtube.com/watch?v=O1vAKJyVvG0
// Source: https://tinyurl.com/akbj9crm
//
// Normal sudoku rules apply. Whenever a digit is shown outside of a row or
// column, that digit is "sandwiched" between two even digits in that row
// or column: wherever the outside digit sits, its immediate left/right (row
// clue) or up/down (column clue) neighbours must both be even. A digit with
// no such pair of neighbours (i.e. sitting in the first or last cell of its
// line) cannot satisfy this, so it is excluded from the two end cells. Not
// every possible sandwiched digit is given outside the grid -- that phrase
// only says the printed set of outside clues is not exhaustive; it adds no
// constraint of its own.

const graph = cellGraph('9x9');

// One state machine per outside digit `target`, scanned along its row or
// column in line order. State carries only the previous cell's raw value
// (or null before the first cell), which is enough to test both neighbour
// conditions directly against `target`:
//  - previous cell held `target` -> this cell (its right/below neighbour)
//    must be even;
//  - this cell holds `target` -> the previous cell (its left/above
//    neighbour) must be even, and there must have been a previous cell at
//    all (rejected via the null-prev branch).
// `accept` rejects a scan ending on `target`, since the last cell has no
// following neighbour either.
function sandwichSpec(target) {
  return NFA.encodeSpec({
    startState: { prev: null },
    transition: ({ prev }, value) => {
      if (prev === null) {
        if (value === target) return undefined;
        return { prev: value };
      }
      if (prev === target && value % 2 !== 0) return undefined;
      if (value === target && prev % 2 !== 0) return undefined;
      return { prev: value };
    },
    accept: ({ prev }) => prev !== target,
  }, 9);
}

// Outside column clues (drawn above the grid), from the payload's `text`
// entries at R0C<col>: {column: digit}.
const columnClues = { 2: 1, 4: 7, 5: 5, 6: 9, 8: 3 };

// Outside row clues (drawn left of the grid), from the payload's `text`
// entries at R<row>C0: {row: digit}.
const rowClues = { 1: 1, 3: 3, 4: 1, 5: 5, 6: 3, 7: 5, 9: 3 };

const sandwichConstraints = [
  ...Object.entries(columnClues).map(([col, target]) =>
    new NFA(sandwichSpec(target), 'sandwich', ...graph.column(Number(col)))),
  ...Object.entries(rowClues).map(([row, target]) =>
    new NFA(sandwichSpec(target), 'sandwich', ...graph.row(Number(row)))),
];

// Givens, from the payload's grid (values already 1-indexed cell ids).
const givens = [
  ['R1C1', 7], ['R1C6', 6], ['R1C7', 3], ['R2C8', 8],
  ['R3C4', 9], ['R3C8', 6], ['R4C8', 2], ['R5C4', 2],
  ['R5C6', 8], ['R6C2', 2], ['R7C2', 4], ['R7C6', 7],
  ['R8C2', 6], ['R9C3', 5], ['R9C4', 4], ['R9C9', 9],
];

return [
  new Shape('9x9'),
  ...givens.map(([cell, value]) => new Given(cell, value)),
  ...sandwichConstraints,
];
