// Title: Alien X-Sums
// Author: Christoph Seeliger & The Friendly Aliens
// Video: https://www.youtube.com/watch?v=2CHe1BVE1p8
// Source: https://app.crackingthecryptic.com/sudoku/8DMFt79hNB

// Rules encoded here:
//   Normal sudoku rules apply. Clues outside the grid are X-Sum clues: they
//   give the sum of the first X digits, where X is the first digit from that
//   direction. Each alien used its own number system with an unknown base, and
//   which alien wrote which clue is unknown.
// Every clue printed on the board -- thirteen in the margin and three inside
// cells -- reads "1000". The rules scope the X-Sum reading to the clues outside
// the grid, so the three drawn inside cells are ordinary given digits, written
// in their alien's base like every other clue.

const graph = cellGraph('9x9');
const geometry = cellGeometry('9x9');

// "1000" in base b is b^3, and a positional base is at least 2.
// Outside: an X-sum runs over at most the nine distinct digits 1-9, so it is at
// most 45, and 4^3 = 64 > 45; each outside clue is therefore 8 or 27, chosen
// independently per clue.
// Inside: a given is a single digit 1-9, and 2^3 = 8 is the only cube in range.
// Those two ranges are the whole of the unknown-base rule; nothing else in the
// ruleset depends on which base a clue used.
const OUTSIDE_TOTALS = [8, 27];  // 1000 base 2, 1000 base 3
const GIVEN_DIGIT = 8;           // 1000 base 2

// The thirteen margin clues, as the grid cell each one sits against and the
// direction its line is read in: three above columns 1, 5 and 9; two left of
// rows 1 and 9; three right of rows 5, 7 and 8; five below columns 1 to 5.
const MARGIN_CLUES = [
  ['R1C1', 1, 0], ['R1C5', 1, 0], ['R1C9', 1, 0],
  ['R1C1', 0, 1], ['R9C1', 0, 1],
  ['R5C9', 0, -1], ['R7C9', 0, -1], ['R8C9', 0, -1],
  ['R9C1', -1, 0], ['R9C2', -1, 0], ['R9C3', -1, 0],
  ['R9C4', -1, 0], ['R9C5', -1, 0],
];

// The three clues drawn inside cells, in a smaller font that fits within a cell.
const GIVEN_CELLS = ['R1C3', 'R3C9', 'R9C7'];

return [
  new Shape('9x9'),
  ...MARGIN_CLUES.map(([start, dRow, dCol]) => {
    const cells = graph.ray(start, dRow, dCol);
    return new Or(
      OUTSIDE_TOTALS.map(total => XSum.fromCells(total, cells, geometry)));
  }),
  ...GIVEN_CELLS.map(cell => new Given(cell, GIVEN_DIGIT)),
];
