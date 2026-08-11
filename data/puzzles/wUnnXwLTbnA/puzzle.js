// Title: The Dutch Miracle
// Author: Aad van de Wetering
// Video: https://www.youtube.com/watch?v=wUnnXwLTbnA
// Source: https://app.crackingthecryptic.com/sudoku/hfpFTGNLrr

// Normal sudoku rules apply (default 3x3 boxes -- the source's region list
// is exactly the nine standard boxes, just enumerated column-major).
// Two givens: R9C1=1, R9C3=2.
//
// "Along each positive diagonal (ie from SW to NE): 1) all the digits are
// different; and 2) adjacent digits (ie those touching at a corner) must
// have a difference of at least 4."
//
// This is stated for EVERY diagonal running SW to NE, i.e. every broken
// diagonal of cells with row+col constant (using 0-indexed row/col; the SW
// and NE grid corners both sit on the row+col=8 diagonal, which fixes the
// direction) -- not only the full 9-cell main diagonal. ISS's built-in
// `Diagonal` class covers only the single main/anti diagonal, so each of
// the 17 broken diagonals is built here from its own cells. Diagonals of
// length 1 need no constraint. Rule 1 (AllDifferent over the whole
// diagonal) is not implied by rule 2 (Whisper only binds adjacent pairs in
// the list), so both are emitted per diagonal.
//
// Cells within one diagonal are listed in increasing-row order, so
// consecutive list entries are the actual corner-touching neighbours rule 2
// describes; Whisper binds consecutive pairs by list order.

const diagonalAllDifferents = [];
const diagonalWhispers = [];
for (let k = 0; k <= 16; k++) {
  const cells = [];
  for (let row = Math.max(0, k - 8); row <= Math.min(8, k); row++) {
    const col = k - row;
    cells.push(makeCellId(row + 1, col + 1));
  }
  if (cells.length < 2) continue;
  diagonalAllDifferents.push(new AllDifferent(...cells));
  diagonalWhispers.push(new Whisper(4, ...cells));
}

return [
  new Shape('9x9'),
  new Given('R9C1', 1),
  new Given('R9C3', 2),
  ...diagonalAllDifferents,
  ...diagonalWhispers,
];
