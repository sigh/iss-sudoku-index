// Title: Squiggles
// Author: Ratfinkz
// Video: https://www.youtube.com/watch?v=75Ht8YUekbE
// Source: https://sudokupad.app/sib54u6n6p

// Normal sudoku (default rows/columns/boxes; the source's own `regions` array
// is exactly the default box partition). Consecutive digits along each green
// line differ by at least 5 (German Whisper).
//
// The puzzle is drawn on an 11x11 canvas whose outer ring is not part of the
// 9x9 grid. Several green strokes dip out of the grid into that ring, mid-path
// or at an end, before returning or terminating. Per the rules text ("Values
// on the whisper outside the main grid provide a hit points clue for their
// respective row or column ... All Hitpoint clues are a minimum of 1"), every
// such border touch marks a "hit points" clue for the touched row (touch on
// the left/right ring) or column (touch on the top/bottom ring), and that
// clue must be >= 1. A row/column's hit points value is defined by the rules
// as the sum, over its 9 cells, of the digit in any cell whose digit equals
// that cell's own column (for a row clue) or row (for a column clue) index;
// so "minimum of 1" means at least one such self-matching cell exists. No
// numeric hit-points target is printed anywhere in the source (there are no
// givens at all), so only this existence half of the rule is decidable by
// hand; seeing every touch point required interpolating each stroke's drawn
// waypoints against the grid boundary. The whisper lists below are each
// stroke's cells restricted to the 9x9 grid, split at every point a stroke
// leaves it, since only those cells hold a sudoku digit.

const whispers = [
  ['R1C3', 'R2C3', 'R3C3', 'R3C2', 'R3C1', 'R2C1', 'R2C2', 'R1C2'],
  ['R2C9', 'R1C9', 'R2C8', 'R1C8', 'R1C7'],
  ['R2C4', 'R1C4', 'R1C5', 'R1C6', 'R2C7', 'R3C8'],
  ['R6C3', 'R5C3', 'R4C3', 'R4C2', 'R4C1'],
  ['R5C1', 'R6C1'],
  ['R5C6', 'R4C7', 'R5C8', 'R6C8'],
  ['R9C1', 'R8C1'],
];

// Rows and columns whose border ring is touched by a green stroke (derived by
// interpolating every stroke's waypoints across the whole canvas, not just its
// in-grid portion): rows 1, 4, 5, 9 (left-ring touches) and columns 2, 3, 5,
// 7, 8 (top-ring touches). Each carries a "hit points clue >= 1" requirement:
// at least one of its 9 cells must hold a digit equal to its own
// column-within-the-row (for a row) or row-within-the-column (for a column).
const hitPointRows = [1, 4, 5, 9];
const hitPointCols = [2, 3, 5, 7, 8];

// "At least one cell in the 9-cell scan has digit == its 1-indexed position
// along the scan." Reused for both row and column clues by choosing the cell
// order (across columns for a row; down rows for a column) so `pos` tracks
// the index the rule compares against.
const hasFixedPointSpec = NFA.encodeSpec({
  startState: { pos: 0, found: false },
  transition: ({ pos, found }, value) => {
    const next = pos + 1;
    return { pos: next, found: found || value === next };
  },
  accept: ({ found }) => found,
  maxDepth: 9,
}, 9);

const rowHitPoints = hitPointRows.map(r => new NFA(
  hasFixedPointSpec, `hp_row${r}`,
  ...Array.from({ length: 9 }, (_, i) => makeCellId(r, i + 1))));

const colHitPoints = hitPointCols.map(c => new NFA(
  hasFixedPointSpec, `hp_col${c}`,
  ...Array.from({ length: 9 }, (_, i) => makeCellId(i + 1, c))));

return [
  ...whispers.map(cells => new Whisper(5, ...cells)),
  ...rowHitPoints,
  ...colHitPoints,
];
