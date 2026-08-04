// Title: I Love You Dad!
// Author: Panthera
// Video: https://www.youtube.com/watch?v=_HqqzC5G8rY
// Source: https://app.crackingthecryptic.com/sudoku/8B6JdHDNpf

// Normal sudoku rules apply. The puzzle is drawn on a 14x14 canvas where the 9
// boxes sit apart from each other (2-cell gaps, plus a 1-cell margin on the
// top/left) to give a "torn apart" look. Each box-row-band's three boxes still
// share the same three grid rows, and each box-col-band's three boxes still
// share the same three grid columns, so the puzzle is exactly a normal 9x9
// grid with default 3x3 boxes once the gap/margin cells (never a sudoku cell)
// are dropped; box (rowBand, colBand) maps to rows (rowBand-1)*3+1..3, cols
// (colBand-1)*3+1..3 below.
//
// Box numbering: boxes are numbered 1-9 left-to-right, top-to-bottom (top-left
// box is 1, top-middle is 2, ... bottom-right is 9). Within a box, cells are
// numbered 1-9 the same way (position 1 = box's own top-left cell, ...,
// position 9 = box's own bottom-right cell). Box k must hold digit k at its
// own position k, and no box may hold digit p at its own position p unless
// that box is box p.
//
// Omitted: the puzzle's outside-grid shading-run-sum clues (which digits in
// each box's own row/column form a shaded run whose sum matches an outside
// number) are not encoded here -- the reading that best fits the drawn
// geometry produces a set of clues with no consistent digit assignment.

const shape = new Shape('9x9');

const cell = (r, c) => makeCellId(r, c);

// Box-numbering rule (see above); purely a formula, no drawn data.
const boxNumberConstraints = [];
for (let rb = 0; rb < 3; rb++) {
  for (let cb = 0; cb < 3; cb++) {
    const k = rb * 3 + cb + 1; // this box's own number
    for (let s = 0; s < 3; s++) {
      for (let t = 0; t < 3; t++) {
        const p = s * 3 + t + 1; // this cell's position number within its box
        const posCell = cell(rb * 3 + s + 1, cb * 3 + t + 1);
        if (p === k) {
          boxNumberConstraints.push(new Given(posCell, k));
        } else {
          // Forbid this box's own position-p cell from holding digit p.
          const allowed = [1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => v !== p);
          boxNumberConstraints.push(new Given(posCell, ...allowed));
        }
      }
    }
  }
}

return [
  shape,
  ...boxNumberConstraints,
];
