// Title: Don't Fill in the 1s
// Author: PrimeWeasel
// Video: https://www.youtube.com/watch?v=5eGIyTqNwhI
// Source: https://app.crackingthecryptic.com/sudoku/2TBjp2hhbh
//
// Normal sudoku rules apply (regions are the standard 3x3 boxes).
// Digits in each cage contain no repeats and sum to 44.
// Clues outside the grid show the sum of digits between the 1 and the 9 in
// that row.
// Clues in the grid (outside cages) show the total of all surrounding
// digits.
//
// The video's "don't fill in the 1s" framing is a presenter solving
// challenge, not a grid rule -- the rules text never restricts digit 1, so
// it is left unencoded. It follows from the cages themselves: each cage has
// 8 all-different cells drawn from 1-9, so by pigeonhole exactly one digit
// per cage is absent, and summing to 44 (45 minus 1) forces that absent
// digit to always be 1.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// Cages (9): 8 cells each, sum 44, no repeats -- transcribed from the
// payload's drawn cage cell lists.
const cages = [
  ['R1C2', 'R2C2', 'R2C1', 'R3C1', 'R3C2', 'R3C3', 'R3C4', 'R4C2'],
  ['R4C1', 'R5C1', 'R5C2', 'R6C2', 'R6C1', 'R7C1', 'R8C1', 'R9C1'],
  ['R9C2', 'R8C2', 'R8C3', 'R7C3', 'R6C3', 'R7C4', 'R7C5', 'R6C5'],
  ['R5C3', 'R5C4', 'R4C4', 'R4C5', 'R3C5', 'R3C6', 'R3C7', 'R4C7'],
  ['R1C3', 'R2C3', 'R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C6', 'R1C7'],
  ['R2C7', 'R2C8', 'R1C8', 'R1C9', 'R2C9', 'R3C9', 'R4C9', 'R4C8'],
  ['R9C3', 'R9C4', 'R9C5', 'R8C5', 'R8C4', 'R8C6', 'R8C7', 'R9C7'],
  ['R9C9', 'R9C8', 'R8C8', 'R7C8', 'R7C7', 'R7C6', 'R7C9', 'R6C9'],
  ['R5C5', 'R4C6', 'R5C6', 'R6C6', 'R6C7', 'R6C8', 'R5C8', 'R5C9'],
];

// In-grid "surrounding total" clues: cell -> printed value, transcribed from
// the payload's drawn overlays inside the grid. None of these 9 cells
// belongs to any cage, matching "outside cages" in the rule.
const surroundingClues = {
  R1C1: 12,
  R7C2: 35,
  R4C3: 54,
  R2C5: 44,
  R3C8: 39,
  R5C7: 44,
  R6C4: 46,
  R9C6: 30,
  R8C9: 21,
};

// Row sandwich clues (left of each row), transcribed from the payload's
// drawn overlays outside the grid, one per row, printed top to bottom.
const rowSandwichClues = [30, 0, 26, 9, 13, 26, 7, 4, 24];

return [
  new Shape('9x9'),

  ...cages.map(cells => new Cage(44, ...cells)),

  // Sum of the up-to-8 king-adjacent cells (own cell excluded, matching
  // "surrounding" and the clue cell's own absence from every cage).
  ...Object.entries(surroundingClues).map(
    ([cell, value]) => new Sum(value, ...graph.kingNeighbours(cell))),

  // Sandwich semantics are literally the rule text: "sum of digits between
  // the 1 and the 9" in that row.
  ...rowSandwichClues.map(
    (value, i) => Sandwich.fromCells(value, graph.row(i + 1), geometry)),
];
