// Title: Balanced X-Sums
// Author: Ambrose
// Video: https://www.youtube.com/watch?v=AreE1plfGYQ
// Source: https://sudokupad.app/g0gb6ifc1r

// Rules encoded:
// - Balanced Latin square: each row and column holds each of -3..3 exactly once.
// - X-Sums: for an outside clue, X is the value of the nearest cell. X=0 requires the clue to be 0.
//   X>0: the clue is the sum of the first X cells starting next to the clue.
//   X<0: the clue is the sum of the first |X| cells starting from the opposite end.
// - The answer check uses absolute values (1 stands for 1 or -1).
//
// The board cells hold the absolute value (0-3, as in the answer check). The signed number lives
// on a parallel overlay S, stored shifted by 3: a stored s stands for the number s-3, so the
// board cell equals |s-3|. The sum of k numbers equal to T is a sum of k stored values equal to
// T + 3k. All Latin and X-Sum rules are stated on S.
const shape = new Shape('7x7', '0-6', 'Raw');
const graph = cellGraph(shape);
const signed = new Var('S', 'signed value, shifted by 3', '7x7');
const at = cell => signed.cell(parseCellId(cell).row, parseCellId(cell).col);
const SHIFT = 3;

const absKey = Pair.fnToKey((abs, s) => abs === Math.abs(s - SHIFT), shape);

// Outside clues as [side, index (1-7), value], read from the drawn clue boxes.
const clues = [
  ['top', 1, 2], ['top', 3, 5], ['top', 5, 5], ['top', 7, 2],
  ['bottom', 3, 3], ['bottom', 5, 2],
  ['left', 4, -4], ['left', 7, 6],
  ['right', 2, 2], ['right', 4, 2], ['right', 6, -1],
];

// Overlay cells of the clue's row/column ordered from the clue side inward.
function lane([side, i]) {
  const idx = [1, 2, 3, 4, 5, 6, 7];
  switch (side) {
    case 'top': return idx.map(r => signed.cell(r, i));
    case 'bottom': return idx.map(r => signed.cell(8 - r, i));
    case 'left': return idx.map(c => signed.cell(i, c));
    default: return idx.map(c => signed.cell(i, 8 - c));
  }
}

const xsums = clues.map(clue => {
  const cells = lane(clue);
  const total = clue[2];
  const branches = [];
  // X = 0 requires clue 0.
  if (total === 0) branches.push(new Given(cells[0], SHIFT));
  for (let k = 1; k <= 3; k++) {
    // X = +k: first k cells from the clue side.
    branches.push(new And([new Given(cells[0], SHIFT + k),
      new Sum(total + SHIFT * k, ...cells.slice(0, k))]));
    // X = -k: first k cells from the opposite end, i.e. the last k cells of the lane.
    branches.push(new And([new Given(cells[0], SHIFT - k),
      new Sum(total + SHIFT * k, ...cells.slice(7 - k))]));
  }
  return new Or(branches);
});

return [
  shape,
  signed,
  // Board cells carry the absolute value 0-3.
  ...graph.cells().map(cell => new Given(cell, 0, 1, 2, 3)),
  ...graph.cells().map(cell => new Pair(absKey, 'abs of signed', cell, at(cell))),
  // Balanced Latin square on the signed values.
  ...graph.rows().map(row => new AllDifferent(...row.map(at))),
  ...graph.columns().map(col => new AllDifferent(...col.map(at))),
  ...xsums,
];
