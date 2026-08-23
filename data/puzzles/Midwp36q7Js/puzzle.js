// Title: Doubling Lines
// Author: jovi_al
// Video: https://www.youtube.com/watch?v=Midwp36q7Js
// Source: https://app.crackingthecryptic.com/sudoku/jrdBR9H43F

// Normal sudoku rules apply (standard 3x3 boxes, per the payload's regions).
// Digits along a grey line must appear exactly twice along that line
// (each drawn line has exactly 4 cells, so this means the line's digits
// form two pairs of equal, mutually distinct values). Cages sum to the
// small total in the top-left corner when a total is printed; two cages
// carry no total and are all-different only, per the rules text's
// "(if given)".

const at = (r, c) => makeCellId(r, c);

// Cages: [total-or-'' , cells...], transcribed from the drawn cage outlines
// and top-left totals.
const cages = [
  [22, [1, 1], [1, 2], [2, 1], [2, 2]],
  [12, [1, 3], [1, 4], [2, 3], [2, 4]],
  [18, [3, 1], [3, 2], [4, 1], [4, 2]],
  [14, [2, 8], [2, 9], [3, 8], [3, 9]],
  [16, [3, 6], [3, 7], [4, 6], [4, 7]],
  [21, [4, 4], [4, 5], [5, 4], [5, 5]],
  [19, [6, 3], [6, 4], [7, 3], [7, 4]],
  [15, [8, 2], [8, 3], [9, 2], [9, 3]],
  ['', [8, 6], [8, 7], [9, 6], [9, 7]],   // no printed total: all-different only
  [10, [8, 8], [8, 9], [9, 8], [9, 9]],
  ['', [6, 8], [6, 9], [7, 8], [7, 9]],   // no printed total: all-different only
].map(([sum, ...cells]) => new Cage(sum, ...cells.map(([r, c]) => at(r, c))));

// Doubling lines: 4 cells each, transcribed from the drawn line paths (a
// 7th styled line entry carries no coordinates and renders nothing, so it
// is omitted).
const lineCoords = [
  [[4, 1], [3, 2], [2, 3], [1, 4]],
  [[1, 5], [2, 6], [2, 7], [1, 8]],
  [[2, 9], [3, 8], [4, 8], [5, 9]],
  [[6, 9], [7, 8], [8, 7], [9, 6]],
  [[9, 2], [8, 3], [8, 4], [9, 5]],
  [[8, 1], [7, 2], [6, 2], [5, 1]],
];

// A "doubling line" of 4 cells accepts exactly the readings where the
// digits split into two equal-valued pairs with distinct values (e.g.
// AABB, ABAB, ABBA): enumerate the 3 ways to partition 4 cells into two
// pairs, and require, for at least one partition, that each pair's cells
// match and the two pairs differ.
const eqKey = Pair.fnToKey((a, b) => a === b, 9);
const neqKey = Pair.fnToKey((a, b) => a !== b, 9);
const partitions = [
  [[0, 1], [2, 3]],
  [[0, 2], [1, 3]],
  [[0, 3], [1, 2]],
];
const doublingLines = lineCoords.map(coords => {
  const cells = coords.map(([r, c]) => at(r, c));
  const options = partitions.map(([[a, b], [c, d]]) => new And([
    new Pair(eqKey, 'pair', cells[a], cells[b]),
    new Pair(eqKey, 'pair', cells[c], cells[d]),
    new Pair(neqKey, 'pair-differ', cells[a], cells[c]),
  ]));
  return new Or(options);
});

return [
  new Shape('9x9'),
  ...cages,
  ...doublingLines,
];
