// Title: Anticamel Coloring Book
// Author: gdc
// Video: https://www.youtube.com/watch?v=ir-mp3AUG0M
// Source: https://sudokupad.app/tiea0253j6

// Chaos Construction: the solver deduces 9 orthogonally-connected, size-9
// regions, each holding every digit once (standard boxes are replaced by
// these regions). Anti-Camel: cells a (3,1)-leaper move apart (in any of
// its 8 orientations) may not repeat a digit.
//
// Omitted: Internal X-Sums (a digit in a circle equals how many of its own
// region's cells it sees along its row+column, with region borders and
// drawn "elephant" edge marks blocking vision; 5 circles also disclose the
// sum of the seen digits) is not encoded.

// Camel-move pairs: every unordered cell pair separated by a (3,1)-leaper
// offset, generated from the rule text's "3 forward, 1 to the side" in all
// 8 orientations rather than hand-transcribed from the payload's 192
// invisible pairing cages.
const CAMEL_OFFSETS = [
  [3, 1], [3, -1], [-3, 1], [-3, -1],
  [1, 3], [1, -3], [-1, 3], [-1, -3],
];

const seenPairs = new Set();
const camelPairs = [];
for (let row = 1; row <= 9; row++) {
  for (let col = 1; col <= 9; col++) {
    for (const [dr, dc] of CAMEL_OFFSETS) {
      const r2 = row + dr, c2 = col + dc;
      if (r2 < 1 || r2 > 9 || c2 < 1 || c2 > 9) continue;
      const a = makeCellId(row, col);
      const b = makeCellId(r2, c2);
      const key = [a, b].sort().join('-');
      if (seenPairs.has(key)) continue;
      seenPairs.add(key);
      camelPairs.push([a, b]);
    }
  }
}

const antiCamel = camelPairs.map(([a, b]) => new AllDifferent(a, b));

return [
  new Shape('9x9'),
  new ChaosConstruction(),
  new NoBoxes(),
  ...antiCamel,
];
