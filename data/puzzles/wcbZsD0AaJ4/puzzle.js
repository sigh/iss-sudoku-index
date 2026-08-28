// Title: Princess Sudoku
// Author: Cam Dennis
// Video: https://www.youtube.com/watch?v=wcbZsD0AaJ4
// Source: https://cracking-the-cryptic.web.app/sudoku/MFRjh3MF9t

// Rules encoded:
// - Row/column/box all-different come from Shape('9x9').
// - "Digits represent the minimum distance they can be away from an
//   identical digit diagonally": for every pair of cells that share a
//   diagonal (any distance, either diagonal direction -- a bishop's reach),
//   if both hold the same digit v then their diagonal distance must be
//   >= v. Read as a minimum-separation (repulsion) rule, not as asserting a
//   same-digit cell exists at exactly the stated distance: the exact-match
//   reading would require digit 9's nearest same-digit diagonal neighbour to
//   sit exactly 9 steps away, which no two cells of a 9x9 grid can ever be
//   (the longest diagonal spans 8 steps), making every 9 unplaceable. The
//   minimum-separation reading has no such degenerate case.

const graph = cellGraph('9x9');
const allCells = graph.cells();

// One Pair key per possible diagonal distance (1-8 on a 9x9 grid): allowed
// unless both cells hold the same value v and the pair's distance k is
// smaller than v.
const minDistKeys = [];
for (let k = 1; k <= 8; k++) {
  minDistKeys[k] = Pair.fnToKey((a, b) => a !== b || a <= k, 9);
}

// Every diagonal-sharing cell pair, grouped by its fixed (rowOffset,
// colOffset) into one Replicate per offset instead of stamping 128 copies of
// the same two Pair templates. (k, k) is the down-right offset and (k, -k)
// the down-left offset, k = 1..8; each is applied at every origin cell whose
// shifted partner stays on the grid. `allCells` is in reading order, so
// `targets[0]` is always the origin's own copy, satisfying Replicate's
// "origin must not come after any target" requirement.
const diagonalMinDistance = [];
for (let k = 1; k <= 8; k++) {
  for (const dCol of [k, -k]) {
    const targets = allCells.filter(cell => graph.step(cell, k, dCol) !== null);
    const origin = targets[0];
    const other = graph.step(origin, k, dCol);
    diagonalMinDistance.push(new Replicate(
      [new Pair(minDistKeys[k], 'diag-min-dist', origin, other)],
      Replicate.encodeTargetCells(targets, origin, graph),
      origin,
    ));
  }
}

return [
  new Shape('9x9'),
  new Given('R1C8', 6),
  new Given('R2C3', 8),
  new Given('R3C5', 2),
  new Given('R3C6', 7),
  new Given('R4C4', 6),
  new Given('R4C6', 8),
  new Given('R4C8', 1),
  new Given('R5C4', 4),
  new Given('R6C6', 9),
  new Given('R8C3', 7),
  ...diagonalMinDistance,
];
