// Title: Ride of the Rohirrim
// Author: Twototenth
// Video: https://www.youtube.com/watch?v=dBaAPzH-gYQ
// Source: https://tinyurl.com/j9d5njra

// Normal sudoku rules (default rows/cols/boxes). Eight killer cages (distinct
// + sum, total printed in the top-left cell). One cage carries "<13" instead
// of a printed total: still a real cage (digits distinct), whose sum must be
// 12 or less -- encoded as AllDifferent plus an equality Sum against a slack
// cell holding (13 - sum), restricted to the range that bound forces (1-3,
// since 4 distinct digits sum to at least 10).
// "Elephant's move" (rules text: one or two cells diagonally, in any
// direction) forbids a repeat between the two cells it joins. The payload's
// `antiking` flag is set, but that toggle's usual meaning -- one step in any
// of the 8 directions, including orthogonal -- is not what the rules text
// defines: elephant's move is diagonal-only and reaches two cells away, so
// the flag is not encoded; the prose is, directly.

// Every unordered cell pair at a fixed relative offset, or set of offsets.
// Only offsets with dr > 0 are passed in, so each pair is produced exactly
// once (iterating the full grid covers both diagonal directions via dc's
// sign). Out-of-range offsets silently contribute no pairs.
function leaperPairs(offsets) {
  const pairs = [];
  for (const [dr, dc] of offsets) {
    for (let r = 1; r <= 9 - dr; r++) {
      for (let c = 1; c <= 9; c++) {
        const c2 = c + dc;
        if (c2 < 1 || c2 > 9) continue;
        pairs.push([makeCellId(r, c), makeCellId(r + dr, c2)]);
      }
    }
  }
  return pairs;
}

// Elephant's move: one or two cells diagonally, per the rules text.
const elephantOffsets = [[1, 1], [1, -1], [2, 2], [2, -2]];
const elephantPairs = leaperPairs(elephantOffsets);

// Killer cages: [total, ...cells], transcribed from the drawn `killercage`
// array.
const cages = [
  [14, 'R4C3', 'R5C2', 'R5C3', 'R6C3'],
  [14, 'R5C5', 'R5C6'],
  [19, 'R7C6', 'R8C6', 'R9C6'],
  [24, 'R1C5', 'R1C6', 'R2C6', 'R3C6'],
  [9, 'R8C2', 'R8C3', 'R9C3'],
  [11, 'R1C3', 'R2C2', 'R2C3'],
  [10, 'R2C4', 'R3C4'],
  [10, 'R1C8', 'R2C8'],
];

// The "<13" cage, transcribed from the drawn `cage` array: 4 distinct
// digits, sum <= 12.
const ltCells = ['R5C7', 'R5C8', 'R5C9', 'R6C8'];
const ltSlack = new Var('LT', 'less-than-13 cage slack (13 - sum)', 1);

return [
  new Shape('9x9'),
  ...cages.map(([sum, ...cells]) => new Cage(sum, ...cells)),
  new AllDifferent(...ltCells),
  ltSlack,
  new Given(ltSlack.cell(1), 1, 2, 3),
  new Sum(13, ...ltCells, ltSlack.cell(1)),
  ...elephantPairs.map(([a, b]) => new AllDifferent(a, b)),
];
