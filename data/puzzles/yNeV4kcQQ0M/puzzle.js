// Title: Odd Blockade Runners
// Author: Jeff Wajes
// Video: https://www.youtube.com/watch?v=yNeV4kcQQ0M
// Source: https://app.crackingthecryptic.com/sudoku/bq8jTQjhMd

// Normal sudoku rules apply. Around each of nine circles: the listed digits
// must each appear at least once among the circle's four surrounding cells
// (Quad), and at most one of those four cells may hold an odd digit. All
// cells holding an odd digit, across the whole grid, form one orthogonally
// connected region.

// Each circle, keyed by the top-left cell of the 2x2 block it straddles, with
// its digits -- transcribed from the puzzle's drawn circle overlays (each a
// filled circle centred on a grid corner, labelled with its digits).
const circles = [
  ['R2C3', [4, 6, 7]],
  ['R4C6', [5, 8]],
  ['R5C2', [3, 4, 8]],
  ['R5C5', [2, 4, 5]],
  ['R6C1', [2, 6, 8]],
  ['R6C8', [2, 4, 6]],
  ['R7C4', [1, 2, 8]],
  ['R7C7', [4, 6, 7]],
  ['R8C3', [5, 6, 8]],
];

const ODD = [1, 3, 5, 7, 9];
const EVEN = [2, 4, 6, 8];

const graph = cellGraph('9x9');

// "At most one odd among the four cells" as a Regex over the 2x2 block: any
// run of evens, an optional single odd, then any run of evens. The odd (if
// any) may sit anywhere in the 4-cell list, since EVEN* absorbs both sides --
// list order of the block does not matter to this count.
const charClass = (values) => `[${values.join('')}]`;
const atMostOneOdd =
  `${charClass(EVEN)}*${charClass(ODD)}?${charClass(EVEN)}*`;

const circleRules = circles.flatMap(([topLeft, values]) => [
  new Quad(topLeft, ...values),
  new Regex(atMostOneOdd, ...graph.block(topLeft, 2, 2)),
]);

return [
  new Shape('9x9'),
  ...circleRules,
  // Global odd-cell connectivity, over the main grid's own digit values
  // (empty group prefix) rather than a Var overlay.
  new ConnectedValues('', ODD),
];
