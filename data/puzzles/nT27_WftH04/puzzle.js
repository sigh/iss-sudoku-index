// Title: Through the Looking Glass
// Author: Cam
// Video: https://www.youtube.com/watch?v=nT27_WftH04
// Source: https://app.crackingthecryptic.com/sudoku/rg6ptPrtBF

// Rules encoded:
// - Normal sudoku rules apply.
// - Nine outside clues each give the sum of the diagonal ray running into the
//   grid from that clue, and digits along the diagonal may repeat. This is
//   LittleKiller's own semantics ("Values along diagonal must add to the
//   given sum. Values may repeat."); each ray below is the entry cell and
//   direction the arrow is drawn with.
// - Each digit 1-9 has a fixed "buddy" digit (a digit may be its own buddy,
//   per the rules text). For every grid cell (R,C) holding value V, the
//   transposed cell (C,R) must hold buddy(V); this holds for every cell,
//   including the diagonal cells R=C, where it forces a self-buddied digit.
//   The buddy table is unknown and part of the solve, so it is modelled as
//   nine auxiliary cells VB1..VB9 (VBn = buddy(n), domain 1-9 by default
//   since the grid's Shape is also 1-9). ValueIndexing(valueCell, controlCell,
//   ...indexedCells) enforces valueCell == indexedCells[controlCell - 1].
//   Applying it once per grid cell -- transpose cell as valueCell, the cell
//   itself as controlCell indexing into VB1..VB9 -- reproduces the rule
//   exactly once per cell (81 constraints total) with no separate involution
//   axiom needed: applying the same rule at both (R,C) and (C,R) already
//   forces buddy(buddy(v)) = v for every value v that occurs off-diagonal.

const buddy = new Var('B', 'Buddy table', 9); // VB1..VB9 = buddy(1)..buddy(9)

const buddyConstraints = [];
for (let r = 1; r <= 9; r++) {
  for (let c = 1; c <= 9; c++) {
    const cell = makeCellId(r, c);
    const transposed = makeCellId(c, r);
    buddyConstraints.push(
      new ValueIndexing(transposed, cell, ...buddy.cells()));
  }
}

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');
const outsideDiagonals = [
  ['R1C7', 1, -1, 38],
  ['R1C4', 1, -1, 10],
  ['R1C1', 1, 1, 24],
  ['R5C1', 1, 1, 33],
  ['R6C1', 1, 1, 32],
  ['R9C5', -1, 1, 25],
  ['R9C8', -1, 1, 16],
  ['R4C9', -1, -1, 29],
  ['R3C9', -1, -1, 9],
];

return [
  new Shape('9x9'),
  new Given('R3C5', 3),

  ...outsideDiagonals.map(([start, dRow, dCol, sum]) =>
    LittleKiller.fromCells(sum, graph.ray(start, dRow, dCol), geometry)),

  buddy,
  ...buddyConstraints,
];
