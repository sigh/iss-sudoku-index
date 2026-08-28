// Title: September 19, 2021: Quad Max
// Author: clover!
// Video: https://www.youtube.com/watch?v=v_YvOgNiUks
// Source: https://tinyurl.com/22jhd43j

// Normal sudoku rules apply. Each white circle sits at the corner junction of
// four cells; its value is the largest digit among those four cells, and
// digits may repeat around a circle.
//
// A circle of value N is encoded as two pieces: every one of its four cells
// is capped to candidates 1..N (a `Given` restriction; overlapping circles on
// a shared cell intersect automatically; the cap is skipped when N is 9,
// since that allows every value the grid already allows and would do
// nothing), and `Quad` requires N to be present at least once among the four
// cells of the 2x2 square. Together: all four cells <= N, and at least one
// equals N -- exactly "N is the max".

const shape = new Shape('9x9');
const at = (r, c) => makeCellId(r, c);

// Givens, from the payload's per-cell grid array.
const givens = [
  [1, 7, 6], [1, 9, 2], [2, 6, 3], [3, 1, 6], [3, 5, 1],
  [4, 2, 5], [5, 3, 1], [5, 7, 2], [6, 8, 3], [7, 5, 2],
  [7, 9, 3], [8, 4, 4], [9, 1, 7], [9, 3, 8],
].map(([r, c, v]) => new Given(at(r, c), v));

// White circles: [[r,c] x4, maxValue]. Cell order and values transcribed
// from the payload's `circle` array.
const circles = [
  [[[5, 4], [5, 5], [4, 4], [4, 5]], 7],
  [[[6, 6], [6, 5], [5, 6], [5, 5]], 7],
  [[[6, 6], [6, 5], [7, 6], [7, 5]], 7],
  [[[3, 4], [3, 5], [4, 4], [4, 5]], 7],
  [[[3, 5], [3, 6], [2, 5], [2, 6]], 4],
  [[[8, 4], [8, 5], [7, 4], [7, 5]], 4],
  [[[4, 8], [4, 7], [5, 8], [5, 7]], 5],
  [[[5, 3], [5, 2], [6, 3], [6, 2]], 6],
  [[[3, 8], [3, 7], [4, 8], [4, 7]], 4],
  [[[6, 2], [6, 3], [7, 2], [7, 3]], 6],
  [[[2, 8], [2, 9], [3, 8], [3, 9]], 8],
  [[[7, 1], [7, 2], [8, 1], [8, 2]], 9],
];

const maxCaps = circles
  .filter(([, max]) => max < 9)
  .flatMap(([cells, max]) =>
    cells.map(([r, c]) =>
      new Given(at(r, c), ...Array.from({ length: max }, (_, i) => i + 1))));

// Quad anchors at the 2x2 square's top-left cell (min row, min col of its
// four cells).
const maxPresent = circles.map(([cells, max]) => {
  const topLeft = at(
    Math.min(...cells.map(([r]) => r)),
    Math.min(...cells.map(([, c]) => c)));
  return new Quad(topLeft, max);
});

return [shape, ...givens, ...maxCaps, ...maxPresent];
