// Title: Happy 57th
// Author: Blobz
// Video: https://www.youtube.com/watch?v=iIIwaRVDG2c
// Source: https://tinyurl.com/happy-57th-blobz

// Rules encoded:
// - Normal sudoku rules apply (default row/column/box all-different).
// - The grey lines are palindromes: Palindrome.
// - Digits in cages sum to 12: Cage(12, ...cells) per drawn domino.
// - Negative constraint: no unmarked orthogonally-adjacent domino sums to
//   12. Global and unscoped ("unmarked" = every adjacent pair that is not
//   one of the drawn cages), computed from the drawn cage list rather than
//   hand-enumerated, and applied via one Replicate per offset (horizontal,
//   vertical) per the irregular-Replicate pattern.
// - Digits separated by a V sum to 5: V(...) per drawn pair. The rules say
//   "not all V's are shown", so unmarked pairs carry no obligation -- no
//   negative constraint for V.

const graph = cellGraph('9x9');

// Killer cages: each is a two-cell domino summing to 12.
const cageDominoes = [
  ['R1C2', 'R2C2'],
  ['R2C3', 'R3C3'],
  ['R4C1', 'R5C1'],
  ['R6C1', 'R6C2'],
  ['R4C3', 'R5C3'],
  ['R4C5', 'R5C5'],
  ['R3C7', 'R4C7'],
  ['R6C7', 'R6C8'],
  ['R7C7', 'R7C8'],
  ['R7C5', 'R8C5'],
  ['R8C3', 'R8C4'],
  ['R7C1', 'R8C1'],
];

const cages = cageDominoes.map(cells => new Cage(12, ...cells));

// Dotless-cage-edge pattern: unmarked dominoes are every adjacent pair minus
// the drawn cage dominoes (compared as unordered cell-id sets), split by
// offset (horizontal/vertical) so each group can be one Replicate template.
const cageDominoKeys = new Set(
  cageDominoes.map(cells => [...cells].sort().join('|')));
const isUnmarked = pair =>
  pair !== null && !cageDominoKeys.has([...pair].sort().join('|'));

const allCells = graph.cells();
const unmarkedHorizontalStarts = allCells.filter(
  cell => isUnmarked(graph.block(cell, 1, 2)));
const unmarkedVerticalStarts = allCells.filter(
  cell => isUnmarked(graph.block(cell, 2, 1)));

const notTwelveKey = Pair.fnToKey((a, b) => a + b !== 12, 9);
const hOrigin = unmarkedHorizontalStarts[0];
const vOrigin = unmarkedVerticalStarts[0];
const noUnmarkedTwelve = [
  new Replicate(
    [new Pair(
      notTwelveKey, 'not 12 (horizontal)', hOrigin,
      graph.block(hOrigin, 1, 2)[1])],
    Replicate.encodeTargetCells(unmarkedHorizontalStarts, hOrigin, graph),
    hOrigin),
  new Replicate(
    [new Pair(
      notTwelveKey, 'not 12 (vertical)', vOrigin,
      graph.block(vOrigin, 2, 1)[1])],
    Replicate.encodeTargetCells(unmarkedVerticalStarts, vOrigin, graph),
    vOrigin),
];

// Palindrome lines.
const palindromes = [
  new Palindrome(
    'R4C6', 'R3C6', 'R3C7', 'R3C8', 'R3C9', 'R4C9', 'R5C8', 'R6C7', 'R7C7'),
  new Palindrome(
    'R3C4', 'R3C3', 'R3C2', 'R4C2', 'R5C2', 'R5C3', 'R6C4', 'R7C4', 'R8C3',
    'R8C2', 'R8C1'),
];

// V clues: drawn pairs sum to 5. Not all V's are shown, so no negative
// constraint applies here.
const vClues = [
  new V('R8C2', 'R7C2'),
  new V('R5C2', 'R5C3'),
  new V('R8C6', 'R7C6'),
];

return [
  new Shape('9x9'),
  new Given('R1C5', 1),
  new Given('R1C6', 9),
  new Given('R1C7', 6),
  new Given('R1C8', 5),
  ...cages,
  ...noUnmarkedTwelve,
  ...palindromes,
  ...vClues,
];
