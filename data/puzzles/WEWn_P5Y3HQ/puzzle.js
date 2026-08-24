// Title: Duplicate Bridge
// Author: Ed Pegg Jr
// Video: https://www.youtube.com/watch?v=WEWn_P5Y3HQ
// Source: https://app.crackingthecryptic.com/sudoku/8GM2gn2H6M

// Rules: Normal sudoku rules apply. Digits cannot repeat along diagonals,
// except when a digit sits in a cell carrying a drawn arrow -- then it must
// repeat, along that same diagonal, in the direction the arrow points, in
// the cell that many steps away (the digit itself gives the direction and
// distance). Every digit 1-8 must appear on at least one of the 12 arrows.
//
// "Diagonals" is unqualified in the rules text, and the drawn arrows force
// the unqualified reading -- every "\" and "/" diagonal line in the grid,
// not just the two main long ones: 8 of the 12 arrow cells lie on neither
// main diagonal, so a "main diagonals only" reading would leave those
// arrows sitting on no diagonal for their own rule to apply to.
//
// Modelled as: every diagonal line of length >= 2 (both slopes) is
// all-different, except that for each arrow cell P with drawn direction
// (dRow, dCol), and for each other cell Q on P's own diagonal at signed
// step distance v in that direction, P and Q are equal exactly when P's
// digit equals v. That reified relation forces the repeat when P's digit
// is the matching distance and preserves plain distinctness otherwise; it
// is derived once per (arrow, other-cell-on-its-diagonal) pair below. An
// arrow cell's own Given candidates are restricted to distances its arrow
// can actually reach without leaving the grid, since the rule requires the
// repeat cell to exist -- this is what makes an unreachable digit (e.g. 9,
// from every arrow position) illegal there.

const N = 9;

// Arrows: [row, col, dRow, dCol], 1-indexed cell (printed R/C numbering) and
// direction of the drawn stroke -- each arrow is a short diagonal segment
// drawn entirely inside one cell, from one corner to the opposite corner.
const ARROWS = [
  [2, 2, 1, 1],   // R2C2 down-right
  [3, 3, 1, -1],  // R3C3 down-left
  [2, 5, 1, -1],  // R2C5 down-left
  [4, 2, -1, -1], // R4C2 up-left
  [4, 3, 1, 1],   // R4C3 down-right
  [4, 4, 1, 1],   // R4C4 down-right
  [4, 5, 1, 1],   // R4C5 down-right
  [6, 3, 1, 1],   // R6C3 down-right
  [7, 1, -1, 1],  // R7C1 up-right
  [7, 2, -1, 1],  // R7C2 up-right
  [7, 4, -1, 1],  // R7C4 up-right
  [9, 1, -1, 1],  // R9C1 up-right
];

const inBounds = (r, c) => r >= 1 && r <= N && c >= 1 && c <= N;
const range = (lo, hi) => Array.from({ length: hi - lo + 1 }, (_, i) => lo + i);

// The furthest distance an arrow can point before its target leaves the
// grid -- an arrow cell's digit can never legally be more than this, since
// the rule requires the repeat cell to exist.
function maxDistance(r, c, dr, dc) {
  const rowLimit = dr > 0 ? (N - r) : (r - 1);
  const colLimit = dc > 0 ? (N - c) : (c - 1);
  return Math.min(rowLimit, colLimit);
}

// Every diagonal line of the given canonical slope (dr, dc must be (1, 1) or
// (1, -1)), as an ordered list of [row, col], increasing row. Only length >=
// 2 lines carry a constraint.
function diagonalsForSlope(dr, dc) {
  const seen = new Set();
  const diagonals = [];
  for (let r = 1; r <= N; r++) {
    for (let c = 1; c <= N; c++) {
      const key = dr === dc ? `\\${r - c}` : `/${r + c}`;
      if (seen.has(key)) continue;
      seen.add(key);
      let sr = r, sc = c;
      while (inBounds(sr - dr, sc - dc)) { sr -= dr; sc -= dc; }
      const cells = [];
      while (inBounds(sr, sc)) { cells.push([sr, sc]); sr += dr; sc += dc; }
      if (cells.length >= 2) diagonals.push(cells);
    }
  }
  return diagonals;
}

// All-different + arrow-repeat exceptions for one diagonal's ordered cell
// list. Cells not on any arrow's own diagonal get a single bulk
// AllDifferent; each arrow cell gets one relation per other cell on the
// diagonal (reified repeat where that cell is the arrow's own-direction
// target, plain inequality otherwise).
function diagonalConstraints(cells) {
  const dr = cells[1][0] - cells[0][0];
  const dc = cells[1][1] - cells[0][1];
  const idxOf = new Map(cells.map(([r, c], i) => [`${r},${c}`, i]));

  const arrowsHere = ARROWS
    .filter(([ar, ac, adr, adc]) => idxOf.has(`${ar},${ac}`) && adr * dc === adc)
    .map(([ar, ac, adr]) => ({ idx: idxOf.get(`${ar},${ac}`), adr }));

  const out = [];
  const arrowIdxSet = new Set(arrowsHere.map(a => a.idx));
  const plainCells = cells
    .filter((_, i) => !arrowIdxSet.has(i))
    .map(([r, c]) => makeCellId(r, c));
  if (plainCells.length >= 2) out.push(new AllDifferent(...plainCells));

  const handled = new Set();
  for (const { idx, adr } of arrowsHere) {
    for (let j = 0; j < cells.length; j++) {
      if (j === idx) continue;
      const key = idx < j ? `${idx}_${j}` : `${j}_${idx}`;
      if (handled.has(key)) continue;
      handled.add(key);

      const v = (j - idx) * adr;
      const arrowCell = makeCellId(...cells[idx]);
      const otherCell = makeCellId(...cells[j]);
      if (v >= 1) {
        // Only this arrow's own forward direction ever yields v >= 1 for
        // this pair on this diagonal (checked against the drawn geometry
        // above); the other endpoint is never itself an arrow pointing
        // back, so there is no competing claim on the same pair.
        out.push(new Pair(
          Pair.fnToKey((x, y) => (x === y) === (x === v), 9),
          `diag-repeat_${arrowCell}_${v}`,
          arrowCell, otherCell));
      } else {
        out.push(new AllDifferent(arrowCell, otherCell));
      }
    }
  }
  return out;
}

const diagonals = [
  ...diagonalsForSlope(1, 1),
  ...diagonalsForSlope(1, -1),
];

const arrowCells = ARROWS.map(([r, c]) => makeCellId(r, c));

return [
  new Shape('9x9'),

  // An arrow cell's digit must be a distance its own arrow can actually
  // reach (the rule requires the repeat cell to exist on the grid).
  ...ARROWS.map(([r, c, dr, dc]) =>
    new Given(makeCellId(r, c), ...range(1, maxDistance(r, c, dr, dc)))),

  // "All of the numbers 1 to 8 must appear on (at least) one arrow."
  new ContainAtLeast('1_2_3_4_5_6_7_8', ...arrowCells),

  // Every diagonal (both slopes, length >= 2): all-different except the
  // arrow-forced repeats.
  ...diagonals.flatMap(diagonalConstraints),
];
