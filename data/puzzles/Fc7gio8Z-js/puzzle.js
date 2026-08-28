// Title: An Impossible Work Of Genius
// Author: Unknown
// Video: https://www.youtube.com/watch?v=Fc7gio8Z-js
// Source: https://cracking-the-cryptic.web.app/sudoku/MD22p7gMRT

// Rules encoded here:
//  - Normal sudoku: 9x9, standard boxes, no givens.
//  - Each printed number is a killer clue. The cell it is drawn in belongs to a
//    group of connected cells whose digits sum to that number; digits do not
//    repeat within a group; groups of different clues do not overlap; and each
//    group lies entirely inside one coloured orbit. Placement and size of the
//    groups is otherwise unknown, and a cell may belong to no group.
//  - The coloured orbits are the five concentric rings of the drawn shading:
//    the borders of the 9x9, 7x7, 5x5 and 3x3 centred blocks, plus the lone
//    centre cell R5C5, which carries no clue.
// Nothing is omitted.

const graph = cellGraph('9x9');

// Orbit k is the border of the (9-2k)x(9-2k) centred block, walked clockwise so
// consecutive entries -- last to first included -- are orthogonally adjacent.
const orbitRing = (k) => {
  const lo = 1 + k, hi = 9 - k;
  const ring = [];
  for (let c = lo; c <= hi; c++) ring.push(makeCellId(lo, c));
  for (let r = lo + 1; r <= hi; r++) ring.push(makeCellId(r, hi));
  for (let c = hi - 1; c >= lo; c--) ring.push(makeCellId(hi, c));
  for (let r = hi - 1; r > lo; r--) ring.push(makeCellId(r, lo));
  return ring;
};

const ORBITS = [0, 1, 2, 3].map(orbitRing);

// Everything below reads "connected group inside one orbit" as "contiguous arc
// of that orbit's ring". That holds only while each orbit is an induced cycle,
// i.e. a cell's same-orbit orthogonal neighbours are exactly its two ring
// neighbours, so check it rather than assume it.
for (const ring of ORBITS) {
  const inRing = new Set(ring);
  ring.forEach((cell, i) => {
    const neighbours = graph.neighbours(cell).filter(other => inRing.has(other));
    const adjacent = [ring[(i + 1) % ring.length],
    ring[(i + ring.length - 1) % ring.length]];
    if (neighbours.length !== 2 || adjacent.some(c => !neighbours.includes(c))) {
      throw new Error(`orbit ring is not a simple cycle at ${cell}`);
    }
  });
}

// The 18 numbers printed in cell corners, as [total, the cell it is drawn in].
const CLUES = [
  [44, 'R1C4'], [20, 'R1C7'], [12, 'R2C5'], [28, 'R3C2'], [31, 'R3C5'],
  [27, 'R3C9'], [12, 'R4C4'], [5, 'R4C6'], [21, 'R4C8'], [23, 'R5C3'],
  [10, 'R6C4'], [10, 'R6C6'], [19, 'R7C4'], [27, 'R7C7'], [6, 'R8C3'],
  [19, 'R8C8'], [43, 'R9C5'], [40, 'R9C9'],
];

// Two cells per clue hold the extent of the group the solver picks for it:
// VL counts the group's cells from its first up to and including the clue cell,
// VR counts them from the clue cell to its last. Group size is VL + VR - 1.
const before = new Var('L', 'group cells up to the clue', CLUES.length);
const after = new Var('R', 'group cells from the clue', CLUES.length);

// n distinct digits drawn from 1-9 total at least 1+..+n and at most 9+..+(10-n),
// so a clue's total bounds how many cells its group can have.
const minTotal = (n) => (n * (n + 1)) / 2;
const maxTotal = (n) => 9 * n - (n * (n - 1)) / 2;

// Every arc of `ring` covering ring position `pos` that could hold `total`,
// as {cells, back, fwd}: the counts of arc cells at-or-before and at-or-after
// the clue cell, walking the ring's direction.
const candidateArcs = (ring, pos, total) => {
  const n = ring.length;
  const arcs = [];
  for (let size = 1; size <= Math.min(9, n); size++) {
    if (total < minTotal(size) || total > maxTotal(size)) continue;
    for (let back = 1; back <= size; back++) {
      const fwd = size + 1 - back;
      const cells = [];
      for (let i = 1 - back; i <= fwd - 1; i++) cells.push(ring[(pos + i + n) % n]);
      arcs.push({ cells, back, fwd });
    }
  }
  return arcs;
};

const clueIndex = new Map(CLUES.map(([, cell], i) => [cell, i]));

// The clues of each orbit, in ring order.
const orbitClues = ORBITS.map(ring => ring
  .map((cell, pos) => ({ pos, index: clueIndex.get(cell) }))
  .filter(entry => entry.index !== undefined));

// One group per clue: pick an arc, total it, and record its extent.
const groups = ORBITS.flatMap((ring, k) => orbitClues[k].map(({ pos, index }) => {
  const total = CLUES[index][0];
  return new Or(candidateArcs(ring, pos, total).map(({ cells, back, fwd }) => new And([
    // A one-cell group's total is simply its digit, and Cage wants two cells.
    cells.length > 1 ? new Cage(total, ...cells) : new Given(cells[0], total),
    new Given(before.cell(index + 1), back),
    new Given(after.cell(index + 1), fwd),
  ])));
}));

// Groups for different clues cannot overlap. Every group is an arc through its
// own clue cell, so it is enough to separate the clues that neighbour each other
// along the orbit: with their cells `gap` steps apart, the cells the earlier
// group takes past its clue (VR - 1) plus the cells the later group takes before
// its clue (VL - 1) must fit strictly inside that run of `gap` steps. That also
// stops either arc from reaching its neighbour's cell, hence from reaching any
// arc further round the ring, so all pairs are covered.
const noOverlap = ORBITS.flatMap((ring, k) => orbitClues[k].map((entry, t, clues) => {
  const next = clues[(t + 1) % clues.length];
  const gap = (next.pos - entry.pos + ring.length) % ring.length;
  return new Pair(
    Pair.fnToKey((fwd, back) => fwd + back < gap + 2, 9),
    `orbit ${k + 1} gap ${gap}`,
    after.cell(entry.index + 1), before.cell(next.index + 1));
}));

return [
  new Shape('9x9'),
  before,
  after,
  ...groups,
  ...noOverlap,
];
