// Title: Circuit Breaker
// Author: fritzdis
// Video: https://www.youtube.com/watch?v=3LLSdIL5l_Q
// Source: https://app.crackingthecryptic.com/sudoku/D7fqF9rbgg

// Normal sudoku rules apply.
//
// Each purple line connects two circled cells. Digits on a line must lie
// strictly between the two circled digits (greater than the lower one, less
// than the higher one), and the digits on the line must realize the smallest
// possible difference between the two circled digits -- a difference of zero
// is allowed.
//
// "Smallest possible difference" is fixed per line by the interior cells'
// own row/column/box overlaps, which are drawn (fixed) geometry, not
// solution-dependent: two interior cells that share a row, column or box can
// never hold the same digit, so they always need two of the values strictly
// between the circles; interior cells that share no house with any other
// interior cell on the line can all repeat a single shared value. The
// circles' forced difference is therefore (largest such same-house group
// size) + 1 -- just enough room to fit that many required distinct values,
// and no more, matching "smallest possible". A first attempt tried Renban
// (fully distinct, no-gap digits) across each whole line; that is refuted by
// arithmetic alone, since the two 12-cell lines below would need 12 distinct
// consecutive digits and only 9 exist -- interior cells that do not share a
// house are allowed to repeat, they are not all mutually distinct.
//
// Per line (interior cells only, listed in line order):
// - line A (R1C2..R8C9): R1C3/R2C3 share col3; R2C3/R2C4 share row2;
//   R2C4/R3C5 share box; R3C5/R4C5 share col5; R4C5/R5C6 share box;
//   R5C6/R5C7 share row5; R5C7/R6C8 share box; R6C8/R7C8 share col8;
//   R7C8/R7C9 share row7 -- a chain of pairwise ties and nothing larger
//   (each interior cell shares a house with only its chain neighbour(s)),
//   so the largest same-house group is 2 -> circles differ by 3.
// - line B (R2C1..R9C8): the mirrored chain (R3C1/R3C2 row3; R3C2/R4C2
//   col2; R4C2/R5C3 box; R5C3/R5C4 row5; R5C4/R6C5 box; R6C5/R7C5 col5;
//   R7C5/R8C6 box; R8C6/R8C7 row8; R8C7/R9C7 col7) -- same shape, largest
//   same-house group 2 -> circles differ by 3.
// - line C (R6C6-R7C7): no interior cell at all, so nothing forces any gap
//   between the circles -- the smallest realized difference is 0, i.e. the
//   two circles hold equal digits. This is the case "a difference of zero
//   is possible" names.
// - line D (R1C5-R1C6-R2C6): one interior cell, no house-mate -> group
//   size 1 -> circles differ by 2.
// - line E (R1C8-R2C7-R3C8-R2C9): interior R2C7/R3C8 share a box -> group
//   size 2 -> circles differ by 3.
// - line F (R6C2-R6C3-R7C3): one interior cell, no house-mate -> group
//   size 1 -> circles differ by 2.
// - line G (R8C1-R8C2-R9C2): one interior cell, no house-mate -> group
//   size 1 -> circles differ by 2.

const shape = new Shape('9x9');

const given = new Given('R9C1', 4);

// [circle1, ...interior cells in order..., circle2, requiredDifference]
// Each row is one drawn purple line; circles are the drawn cfcfcf-filled
// underlay circles at that line's two ends.
const lines = [
  ['R1C2', 'R1C3', 'R2C3', 'R2C4', 'R3C5', 'R4C5', 'R5C6', 'R5C7', 'R6C8', 'R7C8', 'R7C9', 'R8C9', 3],
  ['R2C1', 'R3C1', 'R3C2', 'R4C2', 'R5C3', 'R5C4', 'R6C5', 'R7C5', 'R8C6', 'R8C7', 'R9C7', 'R9C8', 3],
  ['R1C5', 'R1C6', 'R2C6', 2],
  ['R1C8', 'R2C7', 'R3C8', 'R2C9', 3],
  ['R6C2', 'R6C3', 'R7C3', 2],
  ['R8C1', 'R8C2', 'R9C2', 2],
];

const betweens = lines.map(row => new Between(...row.slice(0, -1)));

const diffKeys = new Map();
const diffKey = (d) => {
  if (!diffKeys.has(d)) {
    diffKeys.set(d, Pair.fnToKey((a, b) => Math.abs(a - b) === d, shape));
  }
  return diffKeys.get(d);
};
const circleDiffs = lines.map(row => {
  const cells = row.slice(0, -1);
  const diff = row[row.length - 1];
  return new Pair(diffKey(diff), `circle diff ${diff}`, cells[0], cells[cells.length - 1]);
});

// line C: two circles, no interior cell -- forced equal (see header note).
const zeroDiffCircles = new SameValues(2, 'R6C6', 'R7C7');

return [
  shape,
  given,
  ...betweens,
  ...circleDiffs,
  zeroDiffCircles,
];
