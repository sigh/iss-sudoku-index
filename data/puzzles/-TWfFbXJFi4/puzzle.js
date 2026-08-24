// Title: Chaos Construction: Minesweeper
// Author: Phistomefel
// Video: https://www.youtube.com/watch?v=-TWfFbXJFi4
// Source: https://app.crackingthecryptic.com/sudoku/9DN7gg4mMb
//
// Chaos Construction: the grid divides into 9 orthogonally-connected 9-cell
// regions (ISS's built-in ChaosConstruction default), each holding every
// digit once, replacing the fixed 3x3 boxes. Normal sudoku row/column rules
// apply. "A number in a circle indicates how many of the 9 surrounding
// cells (including the circled cell itself) belong to the same region as
// the circled cell. Not all possible circles are given" -- so only the 17
// marked cells carry the rule; the number shown is that cell's own sudoku
// digit (two circled cells are also given digits; the rest are solved for).
//
// Circled-cell coordinates read from the source's underlay markers, format
// [row+0.5, col+0.5] -- confirmed against the two circled cells that are
// also givens: the underlay at row1/col0 and R2C1's given digit 2 coincide,
// and the underlay at row5/col1 and R6C2's given digit 7 coincide.

const base = [
  new Shape('9x9'),
  new NoBoxes(),
  new ChaosConstruction(),
];

// --- Givens (payload cells[][].value). ---
const givens = [
  new Given('R2C1', 2),
  new Given('R3C9', 1),
  new Given('R6C1', 5),
  new Given('R6C2', 7),
  new Given('R6C5', 1),
  new Given('R7C6', 1),
  new Given('R8C2', 2),
];

// --- Minesweeper circles: the control cell's own digit equals the count of
// same-region cells among itself plus its up-to-8 neighbours. ChaosCount's
// single-argument form auto-expands to that 3x3 area (offset 0 = include
// the reference cell itself), which is exactly the drawn rule.
const CIRCLED_CELLS = [
  'R1C1', 'R1C2', 'R2C1', 'R2C2', 'R3C2',
  'R1C6', 'R1C8', 'R3C4', 'R4C4', 'R5C4', 'R4C5',
  'R6C2', 'R9C5', 'R9C4', 'R9C8', 'R7C8', 'R7C2',
];
const circles = CIRCLED_CELLS.map(cell => new ChaosCount(cell));

return [
  ...base,
  ...givens,
  ...circles,
];
