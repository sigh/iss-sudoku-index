// Title: July 25, 2023: Big and Small
// Author: clover!
// Video: https://www.youtube.com/watch?v=JrBPy-kJ7dg
// Source: https://tinyurl.com/yc4u57kj

// Normal sudoku rules apply.
// Each outside clue gives the largest of the three digits nearest the clue in
// that row/column; the other two of those three cells are smaller, and the
// clue says nothing about the row/column's other six cells.
//
// Encoded per clue as: restrict its 3 nearest cells to 1..value (a Given
// candidate list) and require value to be present at least once among them
// (ContainAtLeast) -- together this pins the max of the three to exactly
// value.

// Outside clues, cells ordered nearest-to-farthest from the clue's side.
// Provenance: the drawn outside-clue badges (above/below a column,
// left/right of a row).
const outsideClues = [
  { cells: ['R2C1', 'R2C2', 'R2C3'], value: 5 }, // left of row 2
  { cells: ['R3C1', 'R3C2', 'R3C3'], value: 8 }, // left of row 3
  { cells: ['R4C1', 'R4C2', 'R4C3'], value: 4 }, // left of row 4
  { cells: ['R5C1', 'R5C2', 'R5C3'], value: 6 }, // left of row 5
  { cells: ['R5C9', 'R5C8', 'R5C7'], value: 9 }, // right of row 5
  { cells: ['R6C9', 'R6C8', 'R6C7'], value: 4 }, // right of row 6
  { cells: ['R7C9', 'R7C8', 'R7C7'], value: 8 }, // right of row 7
  { cells: ['R8C9', 'R8C8', 'R8C7'], value: 5 }, // right of row 8
  { cells: ['R1C5', 'R2C5', 'R3C5'], value: 9 }, // above column 5
  { cells: ['R1C6', 'R2C6', 'R3C6'], value: 5 }, // above column 6
  { cells: ['R1C7', 'R2C7', 'R3C7'], value: 7 }, // above column 7
  { cells: ['R1C8', 'R2C8', 'R3C8'], value: 5 }, // above column 8
  { cells: ['R9C2', 'R8C2', 'R7C2'], value: 5 }, // below column 2
  { cells: ['R9C3', 'R8C3', 'R7C3'], value: 9 }, // below column 3
  { cells: ['R9C4', 'R8C4', 'R7C4'], value: 5 }, // below column 4
  { cells: ['R9C5', 'R8C5', 'R7C5'], value: 6 }, // below column 5
];

// Candidate-restriction half of each clue. Skipped when value === 9, since
// restricting a cell to 1..9 is a no-op on this grid's native domain.
const clueUpperBounds = outsideClues
  .filter(({ value }) => value < 9)
  .flatMap(({ cells, value }) => cells.map(
    cell => new Given(cell, ...Array.from({ length: value }, (_, i) => i + 1))));

// Presence half of each clue: the stated value must occur at least once
// among its 3 nearest cells.
const clueMaxima = outsideClues.map(
  ({ cells, value }) => new ContainAtLeast(String(value), ...cells));

return [
  new Shape('9x9'),

  // Givens. Provenance: the puzzle's drawn given digits.
  new Given('R1C1', 1),
  new Given('R1C9', 2),
  new Given('R3C3', 2),
  new Given('R3C5', 4),
  new Given('R3C7', 3),
  new Given('R5C3', 3),
  new Given('R5C7', 1),
  new Given('R7C3', 1),
  new Given('R7C5', 2),
  new Given('R7C7', 4),
  new Given('R9C1', 4),
  new Given('R9C9', 3),

  ...clueUpperBounds,
  ...clueMaxima,
];
