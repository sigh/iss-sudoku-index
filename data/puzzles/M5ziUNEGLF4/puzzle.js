// Title: Counting on Quiet Knights
// Author: Jolly Rogers
// Video: https://www.youtube.com/watch?v=M5ziUNEGLF4
// Source: https://sudokupad.app/rfb5h314eq

// Normal sudoku. A digit in a circle counts how many circles (over the whole
// grid) hold that same digit. A circled cell must also differ by at least 5
// from every cell a knight's move away from it, whether or not that cell is
// itself circled. A grey-square cell must hold an even digit.

const graph = cellGraph('9x9');

// Circled cells -- underlay circles (border=#000000), R#C# derived from each
// underlay's center via center = [row-1, col-1] + 0.5.
const circles = [
  'R1C1', 'R2C1', 'R4C2', 'R7C3', 'R5C5', 'R2C4',
  'R3C6', 'R3C9', 'R6C8', 'R7C8', 'R8C6', 'R9C7',
];

// Grey-square cells -- underlay squares (backgroundColor=#0003), same center
// conversion.
const greySquares = ['R5C4', 'R4C9', 'R7C2'];

// Grey square -> even digit only, as a candidate restriction (ISS has no
// dedicated Odd/Even class).
const evenGivens = greySquares.map(cell => new Given(cell, 2, 4, 6, 8));

// Circle self-count: the digit placed in a circle equals the number of
// circles (of the 12 above) sharing that digit.
const countingCircles = new CountingCircles(...circles);

// Knight-move difference: for every circled cell and every cell a knight's
// move from it, the two must differ by >= 5. Only one endpoint needs to be
// circled, so this is built as one Pair per (circle, knight-neighbour) pair
// rather than a grid-wide AntiKnight-style relation. Pairs are deduped so two
// mutually knight-adjacent circles are only constrained once.
const KNIGHT_DELTAS = [
  [1, 2], [1, -2], [-1, 2], [-1, -2],
  [2, 1], [2, -1], [-2, 1], [-2, -1],
];
const diff5Key = Pair.fnToKey((a, b) => Math.abs(a - b) >= 5, 9);
const seenPairs = new Set();
const knightDiffs = [];
for (const circle of circles) {
  for (const [dRow, dCol] of KNIGHT_DELTAS) {
    const neighbour = graph.step(circle, dRow, dCol);
    if (neighbour === null) continue;
    const pairKey = [circle, neighbour].sort().join('-');
    if (seenPairs.has(pairKey)) continue;
    seenPairs.add(pairKey);
    knightDiffs.push(
      new Pair(diff5Key, 'circle knight diff>=5', circle, neighbour));
  }
}

return [
  new Shape('9x9'),
  ...evenGivens,
  countingCircles,
  ...knightDiffs,
];
