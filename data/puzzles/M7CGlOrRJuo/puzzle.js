// Title: Diagonal Craziness
// Author: Spackie
// Video: https://www.youtube.com/watch?v=M7CGlOrRJuo
// Source: https://app.crackingthecryptic.com/sudoku/RMpmjjj6Tf

// Normal sudoku rules apply (standard 3x3 boxes). "Positive diagonals"
// (plural, row+col constant, rising SW->NE) forbid repeats within every
// such run of length >= 2, not only the corner-to-corner one -- the plural
// wording and the title/video title ("Diagonal Craziness" / "The Craziest
// Diagonals") both point at every diagonal of the direction, matching how
// "positive diagonals" is used elsewhere in this pipeline (V_Fdl024l5U,
// Xv8D0737qfc) for "every diagonal parallel to the marked one".
//
// OMITTED: the "negative diagonals" rule (row-col constant, falling
// NW->SE) -- each such diagonal has one unspecified "priority" digit that
// must occupy every cell it "possibly can... within the rules of sudoku",
// with digits repeating as much as possible overall. Every literal reading
// of "possibly can" either collapses to a no-op (any two cells on one
// diagonal never share a row or column, so "could digit p occupy cell c"
// reduces, via row/column pigeonhole on a completed grid, to "does c
// already hold p" -- true by construction, so the rule adds nothing) or
// requires evaluating candidates at some earlier point in the solve, which
// is not a property of the finished grid. No worked example is given to
// settle which. Left unencoded.

// Every row+col-constant run of length >= 2 (0-indexed k = row+col, k in
// 0..16; k=0 and k=16 are lone corners with no pair to constrain).
const positiveDiagonals = [];
for (let k = 0; k <= 16; k++) {
  const cells = [];
  for (let r = 0; r < 9; r++) {
    const c = k - r;
    if (c >= 0 && c < 9) cells.push(makeCellId(r + 1, c + 1));
  }
  if (cells.length >= 2) positiveDiagonals.push(cells);
}

return [
  new Shape('9x9'),

  // Givens (row, col 1-indexed), from the payload's `cells` array.
  new Given('R1C4', 9),
  new Given('R1C6', 6),
  new Given('R2C9', 3),
  new Given('R3C4', 8),
  new Given('R3C7', 4),
  new Given('R4C1', 5),
  new Given('R4C3', 2),
  new Given('R4C6', 7),
  new Given('R6C1', 4),
  new Given('R6C4', 3),
  new Given('R7C3', 6),
  new Given('R8C8', 5),
  new Given('R9C2', 2),
  new Given('R9C9', 9),

  ...positiveDiagonals.map(cells => new AllDifferent(...cells)),
];
