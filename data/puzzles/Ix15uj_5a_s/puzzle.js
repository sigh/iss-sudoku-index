// Title: Snout's Wall
// Author: Coyote
// Video: https://www.youtube.com/watch?v=Ix15uj_5a_s
// Source: https://app.crackingthecryptic.com/sudoku/32Jn9qmHHD

// Rules encoded here:
//  - Normal sudoku.
//  - The grid is partitioned into cages: every cell is in exactly one cage,
//    each cage is an orthogonally connected set of cells, digits do not repeat
//    within a cage, and a cage's digits sum to its printed total.
//  - Every printed total sits in the leftmost cell of the top row of its cage,
//    i.e. at the cage's first cell in reading order.
// No cage outlines are drawn, so the partition itself is solved for.
// Nothing is omitted.
//
// The clue set has exactly one cage per printed total: the 35 totals sum to
// 405, which is also a filled 9x9 grid's digit total (nine rows of 45), so with
// every cell in a cage there is no room for an unclued extra cage.

// The 35 drawn totals, as [anchor cell, total]. Each is the small number
// printed in the top-left corner of that cell; nothing else is drawn.
const clues = [
  ['R1C1', 13], ['R1C4', 11], ['R1C5', 12], ['R1C7', 11], ['R1C8', 17],
  ['R2C1', 16], ['R2C3', 13], ['R2C5', 5],
  ['R3C1', 3], ['R3C5', 17], ['R3C7', 17],
  ['R4C1', 20], ['R4C2', 7], ['R4C4', 13], ['R4C6', 9], ['R4C7', 17],
  ['R4C8', 17],
  ['R5C2', 12], ['R5C4', 3], ['R5C9', 8],
  ['R6C3', 8], ['R6C4', 16], ['R6C5', 13], ['R6C7', 8], ['R6C8', 6],
  ['R7C1', 7], ['R7C2', 23], ['R7C5', 8], ['R7C9', 5],
  ['R8C4', 9], ['R8C5', 5], ['R8C7', 10], ['R8C8', 19],
  ['R9C1', 13], ['R9C5', 14],
];

const graph = cellGraph('9x9');
const anchors = clues.map(([anchor]) => anchor);
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

// Every cell set that could be the cage of `anchor`. Four conditions, each read
// straight off the rules:
//  - orthogonally connected and containing the anchor;
//  - the anchor comes first in reading order, since the total is drawn in the
//    leftmost cell of the cage's top row;
//  - no other anchor is inside, because each of the 35 anchors is the top-left
//    cell of its own cage and the cages are disjoint;
//  - the size is one the total can be made from.
// Sets are grown a cell at a time and keyed on their sorted cell list, so each
// set is produced once however many growth orders reach it. Growth reaches
// every connected set: dropping a non-anchor, non-cut cell from one leaves a
// smaller connected set that still holds the anchor.
const candidateCages = (anchor, total) => {
  const sizes = new Set(feasibleSizes(total));
  const maxSize = Math.max(...sizes);
  const { row: anchorRow, col: anchorCol } = parseCellId(anchor);
  const usable = (cell) => {
    if (anchorSet.has(cell)) return false;
    const { row, col } = parseCellId(cell);
    return row > anchorRow || (row === anchorRow && col > anchorCol);
  };

  const found = [];
  let sets = new Map([[anchor, [anchor]]]);
  if (sizes.has(1)) found.push([anchor]);
  for (let size = 2; size <= maxSize; size++) {
    const grown = new Map();
    for (const cells of sets.values()) {
      for (const cell of cells) {
        for (const neighbour of graph.neighbours(cell)) {
          if (!usable(neighbour) || cells.includes(neighbour)) continue;
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

const candidates = clues.map(([anchor, total]) => candidateCages(anchor, total));

// Cage labels, so two cages can never claim the same cell: a shared cell would
// need to carry two labels. Two cages need different labels only if some
// candidate of one meets some candidate of the other; where no candidate pair
// meets, the cages are disjoint by geometry and one shared label loses nothing.
// Colouring that conflict graph greedily (densest cage first) needs 6 labels,
// which fit the grid's own 1-9 range, so no widened Shape is required.
const candidateSets = candidates.map(list => list.map(cells => new Set(cells)));
const canMeet = (i, j) => candidateSets[i].some(
  a => candidateSets[j].some(b => [...b].some(cell => a.has(cell))));
const conflicts = clues.map(
  (_, i) => clues.map((_, j) => i !== j && canMeet(i, j)));
const degrees = conflicts.map(row => row.filter(Boolean).length);
const labels = new Array(clues.length);
for (const i of clues.map((_, i) => i).sort((a, b) => degrees[b] - degrees[a])) {
  const used = new Set(conflicts[i].map((meets, j) => meets ? labels[j] : null));
  let label = 1;
  while (used.has(label)) label++;
  labels[i] = label;
}
if (Math.max(...labels) > 9) throw new Error('too many cage labels');

// One label cell per grid cell, and one cell-count cell per cage.
const region = graph.makeOverlay('VR');
const cageSize = graph.makeOverlay('VK', anchors);

return [
  new Shape('9x9'),
  region.toVar('Cage label'),
  cageSize.toVar('Cage size'),

  // Pick one cell set per printed total: its digits are distinct and sum to the
  // total, its label is stamped on every cell it covers, and its cell count is
  // recorded for the coverage sum below.
  ...clues.map(([anchor, total], i) => new Or(
    candidates[i].map(cells => new And([
      new Cage(total, ...cells),
      new Given(cageSize.at(anchor), cells.length),
      ...cells.map(cell => new Given(region.at(cell), labels[i])),
    ]))
  )),

  // The cages are pairwise disjoint by the labels above, so requiring their 35
  // cell counts to total 81 is what makes them cover every cell of the grid.
  new Sum(81, ...cageSize.at(anchors)),
];
