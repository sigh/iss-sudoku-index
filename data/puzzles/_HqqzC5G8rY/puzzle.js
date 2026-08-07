// Title: I Love You Dad!
// Author: Panthera
// Video: https://www.youtube.com/watch?v=_HqqzC5G8rY
// Source: https://app.crackingthecryptic.com/sudoku/8B6JdHDNpf

// This script solves the reassembled ("untorn") 9x9 grid. The drawing shows that
// grid cut into its nine 3x3 boxes and scrambled, so a piece's drawn position
// does not say which box of the untorn grid it is.
//
// Rules encoded:
//  - Normal sudoku on the untorn grid.
//  - Boxes of the untorn grid are numbered 1-9 left to right then top to bottom,
//    and the cells within a box are numbered 1-9 the same way. Box k holds digit
//    k in its own position k; for every other position p, box k does not hold
//    digit p in its position p.
//  - Each piece carries outside clues on its own three rows and three columns.
//    In a clued lane the shaded cells form as many maximal runs as the lane has
//    clue numbers (so consecutive runs are separated by an unshaded cell), and
//    those runs' digit sums are the clue numbers in order. An unclued lane has
//    no shaded cells.
//
// Not encoded: "the shaded cells create a picture if put together in the correct
// order" -- the picture carries no stated arithmetic condition on the digits.

const shape = new Shape('9x9');

// The outside clues as drawn, piece by piece in the drawing's own reading order
// (piece 1 = the drawing's top-left 3x3 block, piece 9 = its bottom-right).
// `rows` runs top to bottom; each entry is the clue drawn in the gap to the left
// of that row, read left to right. `cols` runs left to right; each entry is the
// clue drawn in the gap above that column, read top to bottom. null = no clue
// drawn against that lane. A two-element entry is a clue cell holding two
// stacked numbers.
const pieces = [
  { rows: [null, [7], [1]], cols: [[8], null, null] },
  { rows: [[5], [1], null], cols: [null, [3], [3]] },
  { rows: [[12], [18], [15]], cols: [[15], [24], [6]] },
  { rows: [[11], [2], null], cols: [[7], [6], null] },
  { rows: [[12], [10], null], cols: [[6], [11], [5]] },
  { rows: [[6], [14], [13]], cols: [[2], [9], [22]] },
  { rows: [[16], [5], [14]], cols: [[7], [15], [7, 6]] },
  { rows: [[7], [7], [18]], cols: [[19], [3, 9], [1]] },
  { rows: [null, null, null], cols: [null, null, null] },
];

// Cell of the untorn grid at position `pos` (0-based, reading order) of box
// `box` (1-based, reading order).
const cellOf = (box, pos) => makeCellId(
  3 * Math.floor((box - 1) / 3) + Math.floor(pos / 3) + 1,
  3 * ((box - 1) % 3) + (pos % 3) + 1);

// Box-numbering rule; a formula over the box/cell numbering, with no drawn data.
const boxNumbers = [];
for (let box = 1; box <= 9; box++) {
  for (let pos = 0; pos < 9; pos++) {
    const p = pos + 1;
    boxNumbers.push(p === box
      ? new Given(cellOf(box, pos), box)
      : new Given(cellOf(box, pos), ...[1, 2, 3, 4, 5, 6, 7, 8, 9].filter(v => v !== p)));
  }
}

// Maximal runs of shaded cells in a 3-cell lane, in lane reading order.
const runsOf = (mask) => {
  const out = [];
  let run = [];
  for (let i = 0; i < 3; i++) {
    if (mask[i]) {
      run.push(i);
    } else if (run.length) {
      out.push(run);
      run = [];
    }
  }
  if (run.length) out.push(run);
  return out;
};

// A run of n cells lies inside one box, so it holds n different digits from 1-9:
// its total is at least the n smallest and at most the n largest.
const minTotal = (n) => n * (n + 1) / 2;
const maxTotal = (n) => n * (19 - n) / 2;

// Every way a piece's nine cells can be shaded consistently with its clues,
// expressed as the resulting [positions, total] sum equations. A lane's shaded
// cells must break into exactly one run per clue number, so enumerating the 512
// shadings and keeping those whose run counts match every lane gives them all.
// Two branches of the same piece differ only in these equations, so the shading
// itself needs no solver state.
const branchesFor = (piece) => {
  const out = [];
  for (let bits = 0; bits < 512; bits++) {
    const shaded = (s, t) => (bits >> (3 * s + t)) & 1;
    const lanes = [];
    let ok = true;
    for (let s = 0; s < 3 && ok; s++) {
      const runs = runsOf([0, 1, 2].map(t => shaded(s, t)));
      const clue = piece.rows[s];
      if (runs.length !== (clue ? clue.length : 0)) ok = false;
      else if (clue) lanes.push([runs.map(run => run.map(t => 3 * s + t)), clue]);
    }
    for (let t = 0; t < 3 && ok; t++) {
      const runs = runsOf([0, 1, 2].map(s => shaded(s, t)));
      const clue = piece.cols[t];
      if (runs.length !== (clue ? clue.length : 0)) ok = false;
      else if (clue) lanes.push([runs.map(run => run.map(s => 3 * s + t)), clue]);
    }
    if (!ok) continue;

    // The shaded cells are n different digits of the piece, and their total is
    // the sum of the piece's row clues (equally, of its column clues).
    const n = [...Array(9).keys()].filter(pos => shaded(Math.floor(pos / 3), pos % 3)).length;
    const total = piece.rows.flat().reduce((a, b) => a + (b || 0), 0);
    if (total < minTotal(n) || total > maxTotal(n)) continue;

    // A clue cell holding two numbers gives no drawn indication of which run is
    // which, so both readings become branches.
    const twoRun = lanes.filter(([, clue]) => clue.length === 2).length;
    for (let flips = 0; flips < (1 << twoRun); flips++) {
      let seen = 0;
      const equations = [];
      for (const [runs, clue] of lanes) {
        let values = clue;
        if (values.length === 2) {
          if ((flips >> seen) & 1) values = [...values].reverse();
          seen++;
        }
        runs.forEach((run, i) => equations.push([run, values[i]]));
      }
      if (equations.every(([run, v]) => v >= minTotal(run.length) && v <= maxTotal(run.length))) {
        out.push(equations);
      }
    }
  }
  return out;
};

const pieceBranches = pieces.map(branchesFor);

// VW<k> names which drawn piece became box k of the untorn grid; the pieces
// reassemble one to one, so the nine VW cells are all different. Each box then
// satisfies the clue set of whichever piece it is.
const pieceSlots = new Var('W', 'drawn piece in this box', 9);
const oneToOne = new AllDifferent(...pieceSlots.cells());

const shadingClues = [];
for (let box = 1; box <= 9; box++) {
  shadingClues.push(new Or(pieceBranches.flatMap((branches, d) => branches.map(
    equations => new And([
      new Given(pieceSlots.cell(box), d + 1),
      ...equations.map(([run, total]) => new Sum(total, ...run.map(pos => cellOf(box, pos)))),
    ])))));
}

return [
  shape,
  pieceSlots,
  oneToOne,
  ...boxNumbers,
  ...shadingClues,
];
