// Title: Nanro (Signpost)
// Author: Unknown
// Video: https://www.youtube.com/watch?v=jjG7BOXbjkg
// Source: https://cracking-the-cryptic.web.app/sudoku/n2JjQQTtpB
//
// Nanro. No rules text accompanies this puzzle; the canonical Nikoli Nanro
// ruleset is encoded, per the video's own genre title. Standard Nanro rules:
//   1. Each cell is blank or holds a digit N with 1 <= N <= (its region's
//      size).
//   2. If digit N appears anywhere in a region, that region contains
//      exactly N cells holding N, and those N cells are orthogonally
//      connected to each other.
//   3. Every region holds at least one digit (no region is entirely blank).
// This is a "Raw" 8x8 grid: no row/column/box all-different -- Nanro
// digits repeat freely across rows and columns. Equal digits are free to sit
// in adjacent cells of different regions (unlike Fillomino's matching same-
// size-region rule, which Nanro does not share): the puzzle's own givens
// place two 3s at adjacent R2C3/R3C3 in different regions, so a same-digit
// no-touch-across-regions rule would already contradict them.

// Regions: the puzzle's drawn region partition, each cell a 1-indexed
// [row, col] pair (the source geometry is 0-indexed; 1 added to each
// coordinate while transcribing). One further region entry in the source
// carries no coordinates (an empty stub object); the eighteen regions below
// already partition all 64 grid cells with no overlaps (checked), so that
// stub is a dead entry -- omitted here.
const REGION_COORDS = [
  [[1, 1], [1, 2], [2, 2], [2, 1]],
  [[1, 3], [1, 4], [1, 5]],
  [[1, 6], [2, 6], [2, 7], [1, 7], [1, 8], [2, 8]],
  [[2, 3], [2, 4], [2, 5]],
  [[3, 1]],
  [[3, 2], [4, 2], [4, 1], [5, 1]],
  [[5, 2]],
  [[3, 3], [4, 3], [5, 3], [5, 4], [4, 4], [3, 5], [3, 4], [4, 5], [5, 5]],
  [[3, 6], [4, 6], [5, 6]],
  [[3, 8], [4, 8], [5, 8]],
  [[3, 7], [4, 7], [5, 7]],
  [[6, 1], [7, 1], [6, 2]],
  [[7, 2], [8, 2], [8, 1]],
  [[6, 3], [7, 3], [8, 3], [7, 4], [6, 4]],
  [[8, 4]],
  [[7, 5], [8, 5]],
  [[6, 5]],
  [[6, 6], [7, 6], [8, 6], [8, 7], [7, 7], [6, 7], [6, 8], [7, 8], [8, 8]],
];

// Givens: the puzzle's 9 drawn text markers, each a plain unhighlighted
// digit (white fill/border, not a shaded clue) whose fractional position
// falls inside exactly one cell; [row, col] 1-indexed, converted the same
// way as the regions. Every marker prints the same digit, 3.
const GIVEN_COORDS = [
  [[1, 1], 3],
  [[1, 6], 3],
  [[2, 3], 3],
  [[3, 3], 3],
  [[3, 6], 3],
  [[3, 8], 3],
  [[6, 6], 3],
  [[6, 1], 3],
  [[6, 3], 3],
];

function cellOf([row, col]) {
  return makeCellId(row, col);
}

const REGIONS = REGION_COORDS.map(coords => coords.map(cellOf));
const GIVENS = GIVEN_COORDS.map(([coord, value]) => [cellOf(coord), value]);

const shape = new Shape('8x8', '0-9', 'Raw');
const graph = cellGraph(shape);

const ALL_VALUES = Array.from({ length: 10 }, (_, i) => i);
const notValue = value => ALL_VALUES.filter(v => v !== value);

function combinations(arr, size) {
  const results = [];
  function go(start, chosen) {
    if (chosen.length === size) { results.push(chosen.slice()); return; }
    for (let i = start; i < arr.length; i++) {
      chosen.push(arr[i]);
      go(i + 1, chosen);
      chosen.pop();
    }
  }
  go(0, []);
  return results;
}

// Every connected subset of a region's own cells with exactly `size` cells,
// using the grid's real orthogonal adjacency -- this is what "N cells hold
// N, connected" (rule 2) means for one region and one candidate value N.
// Region sizes here are at most 9, so brute-force subset enumeration
// (<= 2^9 - 1 candidates) is cheap; no shape-specific table is hand-built.
function connectedSubsetsOfSize(cells, size) {
  return combinations(cells, size).filter(subset => graph.connected(subset));
}

// One region's full Nanro rule (rules 1, 2 and 3): one clause per candidate
// value 1..9 covering "absent, or present as exactly one connected group of
// that size" (rule 2), and a clause requiring at least one nonzero cell
// (rule 3). A value greater than the region's own size has no connected
// subset of that size at all (`connectedSubsetsOfSize` returns none), so its
// clause reduces to "absent" and the loop running to 9 on every region is
// what caps a smaller region's cells at its own size (rule 1) -- no separate
// domain constraint is needed.
function regionValueConstraints(cells) {
  const size = cells.length;
  const maxValue = ALL_VALUES[ALL_VALUES.length - 1];
  const valueClauses = [];
  for (let value = 1; value <= maxValue; value++) {
    const absent = new And(cells.map(c => new Given(c, ...notValue(value))));
    const present = connectedSubsetsOfSize(cells, value).map(subset => {
      const rest = cells.filter(c => !subset.includes(c));
      return new And([
        ...subset.map(c => new Given(c, value)),
        ...rest.map(c => new Given(c, ...notValue(value))),
      ]);
    });
    valueClauses.push(new Or([absent, ...present]));
  }

  const nonzeroValues = ALL_VALUES.filter(v => v >= 1 && v <= size);
  const notAllBlank = new Or(cells.map(c => new Given(c, ...nonzeroValues)));

  return [...valueClauses, notAllBlank];
}

return [
  shape,
  ...GIVENS.map(([cell, value]) => new Given(cell, value)),
  ...REGIONS.flatMap(regionValueConstraints),
];
