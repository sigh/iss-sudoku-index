// Title: SVS400 - Sudoku Upper Right Heavy Killer
// Author: Richard
// Video: https://www.youtube.com/watch?v=J82BCuqheSE
// Source: https://sudokupad.app/zjoztx1fbb

// Normal sudoku (rows, columns, 3x3 boxes) plus one rule about every
// diagonally-adjacent upper-right pair of cells: if the lower-left cell's
// digit is smaller than the upper-right cell's digit, a marker is shown near
// the lower-left cell giving their sum, or "?" if any sum (3-17, i.e.
// unconstrained) is allowed. An unmarked pair means the lower-left digit is
// NOT smaller than the upper-right digit (>=) -- the rule places a marker on
// every pair where "smaller" holds, so its absence is itself information.
// Every cell outside row 1 / column 9 has such a neighbour: 64 pairs total,
// 16 of them marked (below), 48 unmarked.

// Marker text keyed by the lower-left cell of each pair, transcribed from
// the drawn overlay near that cell: a number is the given sum, '?' marks a
// pair with an unconstrained sum, and a cell with no entry here is unmarked.
const markers = {
  'R2C6': '?', 'R3C1': 6, 'R3C2': '?', 'R3C8': '?',
  'R4C4': '?', 'R4C8': '?', 'R5C1': '?', 'R5C2': '?',
  'R6C1': '?', 'R6C5': '?', 'R7C5': '?', 'R7C7': '?',
  'R8C1': 15, 'R8C7': 9, 'R9C7': '?', 'R9C8': '?',
};

// Every diagonally-adjacent upper-right pair in the grid: (r, c) with its
// neighbour (r-1, c+1), for every cell that has one.
const diagPairs = [];
for (let r = 2; r <= 9; r++) {
  for (let c = 1; c <= 8; c++) {
    diagPairs.push([makeCellId(r, c), makeCellId(r - 1, c + 1)]);
  }
}

// One Pair per diagonal pair, applied in (lower-left, upper-right) order so
// the predicate's (a, b) match (lower-left value, upper-right value).
const diagonalConstraints = diagPairs.map(([lower, upper]) => {
  const marker = markers[lower];
  let fn, name;
  if (marker === undefined) {
    fn = (a, b) => a >= b;
    name = 'not-smaller';
  } else if (marker === '?') {
    fn = (a, b) => a < b;
    name = 'smaller-any-sum';
  } else {
    fn = (a, b) => a < b && a + b === marker;
    name = `smaller-sum-${marker}`;
  }
  return new Pair(Pair.fnToKey(fn, 9), name, lower, upper);
});

return [
  new Shape('9x9'),
  ...diagonalConstraints,
];
