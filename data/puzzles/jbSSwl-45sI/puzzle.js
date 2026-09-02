// Title: unknown
// Author: Unknown
// Video: https://www.youtube.com/watch?v=jbSSwl-45sI
// Source: https://cracking-the-cryptic.web.app/sudoku/3hMqHMBMP4

// Rules encoded here:
//  - Normal sudoku.
//  - Killer cages are hidden in the grid; their sizes and boundaries are to be
//    determined. A cage is an orthogonally connected set of cells and its
//    digits do not repeat.
//  - A number printed in a cell is the total of the digits of the cage that
//    contains that cell. Unlike normal killer, that number need not sit in the
//    cage's top-left cell; it may sit anywhere in its cage.
//  - Cages may not overlap.
// Nothing is omitted.
//
// Two facts about the clue set, both read off the printed totals alone.
//
// (1) The twenty totals belong to twenty different cages. Two printed numbers
// in one cage would have to be equal, and the only repeats are 1 (R1C7, R6C9),
// 6 (R9C3, R2C9) and 14 (R7C5, R4C7). A cage totalling 1 holds just the digit
// 1, so it is a single cell and cannot hold two clues; R9C3 and R2C9 are 13
// orthogonal steps apart, so a cage holding both spans at least 14 cells and
// totals at least 105; R7C5 and R4C7 are 5 steps apart, needing at least 6
// cells and a total of at least 21.
//
// (2) Those twenty cages cover the whole grid, and there is no unclued cage.
// The totals sum to 405, which is also the digit total of a filled 9x9 grid
// (nine rows of 45). The cages do not overlap, so the digits outside them sum
// to 405 - 405 = 0, and every digit is at least 1.

// The twenty printed totals, as [cell, total]: the small number drawn in that
// cell's top-left corner. Nothing else is drawn on the grid, and there are no
// given digits.
const clues = [
  ['R1C1', 35], ['R1C3', 45], ['R1C4', 26], ['R1C6', 12], ['R1C7', 1],
  ['R2C8', 42], ['R2C9', 6],
  ['R3C1', 43],
  ['R4C4', 36], ['R4C6', 19], ['R4C7', 14], ['R4C9', 30],
  ['R5C6', 16],
  ['R6C1', 9], ['R6C9', 1],
  ['R7C5', 14],
  ['R8C6', 22], ['R8C7', 10],
  ['R9C3', 6], ['R9C4', 18],
];

// Ten cage labels are needed below, one more than the nine digits, so the
// alphabet is widened to 1-10 and the playable cells are restricted back to
// 1-9. The boxes are unaffected by the widening and stay 3x3.
const shape = new Shape('9x9', 10);
const graph = cellGraph(shape);
const anchors = clues.map(([cell]) => cell);
const anchorSet = new Set(anchors);

// A cage of k cells holds k different digits from 1-9, so its total runs from
// 1+...+k up to (10-k)+...+9 = k*(19-k)/2.
const feasibleSizes = (total) => {
  const sizes = [];
  for (let k = 1; k <= 9; k++) {
    if (k * (k + 1) / 2 <= total && total <= k * (19 - k) / 2) sizes.push(k);
  }
  return sizes;
};

// Every cell set that could be the cage of `anchor`: orthogonally connected,
// containing the anchor, of a size the total can be made from, and holding no
// other clue cell -- by fact (1) each of the twenty clue cells sits in its own
// cage, and the cages are disjoint. Sets are grown a cell at a time and keyed
// on their sorted cell list, so each set is produced once however many growth
// orders reach it. Growth reaches every connected set: dropping a non-anchor,
// non-cut cell from one leaves a smaller connected set that still holds the
// anchor.
const candidateCages = (anchor, total) => {
  const sizes = new Set(feasibleSizes(total));
  const maxSize = Math.max(...sizes);
  const found = [];
  let sets = new Map([[anchor, [anchor]]]);
  if (sizes.has(1)) found.push([anchor]);
  for (let size = 2; size <= maxSize; size++) {
    const grown = new Map();
    for (const cells of sets.values()) {
      for (const cell of cells) {
        for (const neighbour of graph.neighbours(cell)) {
          if (anchorSet.has(neighbour) || cells.includes(neighbour)) continue;
          const next = cells.concat([neighbour]).sort();
          grown.set(next.join(','), next);
        }
      }
    }
    sets = grown;
    if (sizes.has(size)) found.push(...sets.values());
  }
  return found;
};

// Cell sets as 81-bit masks in three 27-bit words, so "these two cages could
// share a cell" is three ANDs.
const cellIndex = (cell) => {
  const { row, col } = parseCellId(cell);
  return (row - 1) * 9 + (col - 1);
};
const toMask = (cells) => {
  const mask = [0, 0, 0];
  for (const cell of cells) {
    const i = cellIndex(cell);
    mask[(i / 27) | 0] |= 1 << (i % 27);
  }
  return mask;
};
const disjoint = (a, b) =>
  (a[0] & b[0]) === 0 && (a[1] & b[1]) === 0 && (a[2] & b[2]) === 0;
const union = (masks) => masks.reduce(
  (a, b) => [a[0] | b[0], a[1] | b[1], a[2] | b[2]], [0, 0, 0]);
const holds = (mask, i) => ((mask[(i / 27) | 0] >> (i % 27)) & 1) === 1;

// Trim the catalogues with two rules already stated above, so nothing the
// solver would have accepted is dropped:
//  - cages do not overlap, so a candidate that meets every surviving candidate
//    of some other cage cannot be used;
//  - by fact (2) every cell is caged, so a cell only one cage can still reach
//    belongs to that cage, and that cage's candidates missing it cannot be used.
// Both shrink the catalogues, which shrinks the reachable sets, so they are
// applied alternately until neither removes anything.
let catalogues = clues.map(([anchor, total]) =>
  candidateCages(anchor, total).map(cells => ({ cells, mask: toMask(cells) })));
for (;;) {
  const before = catalogues.reduce((n, list) => n + list.length, 0);

  const reach = catalogues.map(list => union(list.map(c => c.mask)));
  for (let i = 0; i < 81; i++) {
    const owners = clues.map((_, j) => j).filter(j => holds(reach[j], i));
    if (owners.length !== 1) continue;
    catalogues[owners[0]] = catalogues[owners[0]].filter(c => holds(c.mask, i));
  }

  catalogues = catalogues.map((list, i) => list.filter(c =>
    catalogues.every((other, j) =>
      j === i || other.some(d => disjoint(c.mask, d.mask)))));

  if (catalogues.some(list => list.length === 0)) {
    throw new Error('a printed total has no possible cage');
  }
  if (catalogues.reduce((n, list) => n + list.length, 0) === before) break;
}

// Cage labels, so two cages can never claim the same cell: a shared cell would
// have to carry two labels. Two cages need different labels only where some
// candidate of one meets some candidate of the other; where no candidate pair
// meets, the cages are disjoint by geometry and one shared label loses nothing.
// Colouring that conflict graph greedily (densest cage first) needs 10 labels.
const reachAll = catalogues.map(list => union(list.map(c => c.mask)));
const conflicts = clues.map((_, i) => clues.map((_, j) =>
  i !== j && !disjoint(reachAll[i], reachAll[j])));
const degrees = conflicts.map(row => row.filter(Boolean).length);
const labels = new Array(clues.length);
for (const i of clues.map((_, i) => i).sort((a, b) => degrees[b] - degrees[a])) {
  const used = new Set(conflicts[i].map((meets, j) => meets ? labels[j] : null));
  let label = 1;
  while (used.has(label)) label++;
  labels[i] = label;
}
if (Math.max(...labels) > 10) throw new Error('too many cage labels');

// One label cell per grid cell, and one cell-count cell per cage.
const region = graph.makeOverlay('VR');
const cageSize = graph.makeOverlay('VK', anchors);

return [
  shape,
  // The widened alphabet is for the labels; the grid itself holds 1-9.
  graph.makeReplicate(new Given(graph.cells()[0], 1, 2, 3, 4, 5, 6, 7, 8, 9)),
  region.toVar('Cage label'),
  cageSize.toVar('Cage size'),

  // Pick one cell set per printed total: its digits are distinct and sum to the
  // total, its label is stamped on every cell it covers, and its cell count is
  // recorded for the coverage sum below.
  ...clues.map(([anchor, total], i) => new Or(
    catalogues[i].map(({ cells }) => new And([
      new Cage(total, ...cells),
      new Given(cageSize.at(anchor), cells.length),
      ...cells.map(cell => new Given(region.at(cell), labels[i])),
    ]))
  )),

  // The cages are pairwise disjoint by the labels above, so requiring their
  // twenty cell counts to total 81 is fact (2): they cover every cell.
  new Sum(81, ...cageSize.at(anchors)),
];
