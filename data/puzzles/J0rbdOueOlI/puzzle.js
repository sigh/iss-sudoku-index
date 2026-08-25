// Title: unknown
// Author: Stefan Heine
// Video: https://www.youtube.com/watch?v=J0rbdOueOlI
// Source: https://app.crackingthecryptic.com/webapp/3nt2JnrRPL

// Normal sudoku rules apply. The nine grey cells and each main diagonal must
// also contain the digits 1 to 9. Clues outside the grid give the sum of the
// digits along the indicated diagonal; digits may repeat along these
// diagonals. Four cells touched by a red diamond must sum to an even number.
//
// The two length-9 diagonals have no outside sum badge (their content rule
// fixes the total at 45 without one); a Diagonal all-different plus the
// default row/col/box all-different is what "contain 1-9" means for a 9-cell
// group on this grid, so the nine grey cells only need AllDifferent too.
//
// Two of the 30 outside diagonal clues run only one cell deep (the two grid
// corners not already claimed by a main diagonal), so they are plain Givens;
// LittleKiller.fromCells throws on a length-1 diagonal. Every other clue is
// built from cellGraph().ray(entryCell, dRow, dCol) so the summed cell list
// is derived, not hand-typed twice.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// [entry cell, dRow, dCol, total] for every diagonal clue longer than one
// cell, grouped by the grid edge the ray enters from. Values transcribed from
// the outside-clue text overlays drawn beside each diagonal's entry cell.
const littleKillers = [
  // Top edge, down-left (dRow +1, dCol -1).
  ['R1C2', 1, -1, 10], ['R1C3', 1, -1, 22], ['R1C4', 1, -1, 14],
  ['R1C5', 1, -1, 18], ['R1C6', 1, -1, 34], ['R1C7', 1, -1, 36],
  ['R1C8', 1, -1, 36],
  // Left edge, down-right (dRow +1, dCol +1).
  ['R2C1', 1, 1, 27], ['R3C1', 1, 1, 39], ['R4C1', 1, 1, 39],
  ['R5C1', 1, 1, 19], ['R6C1', 1, 1, 22], ['R7C1', 1, 1, 6],
  ['R8C1', 1, 1, 15],
  // Bottom edge, up-right (dRow -1, dCol +1).
  ['R9C2', -1, 1, 50], ['R9C3', -1, 1, 33], ['R9C4', -1, 1, 31],
  ['R9C5', -1, 1, 24], ['R9C6', -1, 1, 28], ['R9C7', -1, 1, 15],
  ['R9C8', -1, 1, 5],
  // Right edge, up-left (dRow -1, dCol -1).
  ['R2C9', -1, -1, 16], ['R3C9', -1, -1, 8], ['R4C9', -1, -1, 15],
  ['R5C9', -1, -1, 30], ['R6C9', -1, -1, 31], ['R7C9', -1, -1, 33],
  ['R8C9', -1, -1, 43],
].map(([entry, dr, dc, total]) =>
  LittleKiller.fromCells(total, graph.ray(entry, dr, dc), geometry));

// The two 1-cell diagonals (top-left and bottom-right grid corners not on a
// main diagonal): the outside total is just that corner's digit.
const cornerGivens = [
  new Given('R1C1', 3),
  new Given('R9C9', 1),
];

// Nine shaded cells, taken as one set that must contain 1-9: on an
// otherwise-constrained 9x9 grid that is exactly AllDifferent over the nine
// cells.
const greyRegion = new AllDifferent(
  'R1C1', 'R2C2', 'R1C8', 'R6C9', 'R8C7', 'R9C9', 'R9C4', 'R8C2', 'R9C1');

// Each main diagonal must contain 1-9; Diagonal(-1) is the '\' (R1C1-R9C9),
// Diagonal(1) is the '/' (R1C9-R9C1).
const diagonals = [new Diagonal(-1), new Diagonal(1)];

// Red diamonds: four cells touching one drawn diamond marker sum to an even
// number. There is no named even-sum class, so a 2-state NFA tracks the
// running sum's parity across the four cells (order doesn't matter for a
// sum) and accepts only when it ends even.
const evenSumSpec = NFA.encodeSpec({
  startState: 0,
  transition: (state, value) => (state + (value % 2)) % 2,
  accept: (state) => state === 0,
}, 9);

const evenDiamonds = [
  new NFA(evenSumSpec, 'evenDiamond', ['R7C1', 'R7C2', 'R8C1', 'R8C2']),
  new NFA(evenSumSpec, 'evenDiamond', ['R8C8', 'R8C9', 'R9C8', 'R9C9']),
];

return [
  new Shape('9x9'),
  ...diagonals,
  greyRegion,
  ...cornerGivens,
  ...littleKillers,
  ...evenDiamonds,
];
