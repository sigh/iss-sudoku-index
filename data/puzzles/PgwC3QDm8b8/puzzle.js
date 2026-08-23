// Title: Slice of Balance (YY Sandwich)
// Author: PuzzleTank
// Video: https://www.youtube.com/watch?v=PgwC3QDm8b8
// Source: https://sudokupad.app/gh20vntsxl

// Full encoding: Yin-Yang shading (global connectivity plus local
// no-monochrome-2x2), Kropki white dots, and outside Sandwich clues whose
// full span -- the 1, the 9, and everything between -- must be entirely
// shaded whenever a clue is given.

const SHADED = 1;
const UNSHADED = 2;

const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');
const shadeCell = cell => shade.at(cell);

// White Kropki dots: consecutive digits, opposite shades are not implied by
// the rules text (only ordinary Yin-Yang shading applies), so just the
// consecutive relation is encoded.
const whiteDots = [
  ['R5C1', 'R5C2'],
  ['R5C6', 'R5C7'],
  ['R2C4', 'R3C4'],
].map(cells => new WhiteDot(...cells));

// Sandwich clues: the sum of the digits strictly between the 1 and the 9.
const sandwichClues = [
  { line: graph.column(1), value: 10 },
  { line: graph.column(2), value: 0 },
  { line: graph.column(3), value: 17 },
  { line: graph.column(5), value: 15 },
  { line: graph.column(7), value: 22 },
  { line: graph.column(9), value: 35 },
  { line: graph.row(1), value: 20 },
  { line: graph.row(3), value: 14 },
  { line: graph.row(9), value: 35 },
];
const sandwiches = sandwichClues.map(
  ({ line, value }) => Sandwich.fromCells(value, line, geometry));

// Whenever a sandwich clue is given, the full sandwich -- the 1, the 9, and
// every digit between them -- must be shaded. The 1 and 9 can sit in either
// order along the line, so enumerate every window [lo, hi] and every order
// of the two endpoint digits, and require the whole window shaded. Exactly
// one window/order pair is the true placement, so the clue is their Or.
function fullSandwichShaded(line) {
  const n = line.length;
  const options = [];
  for (let lo = 0; lo < n; lo++) {
    for (let hi = lo + 1; hi < n; hi++) {
      const windowShaded =
        line.slice(lo, hi + 1).map(cell => new Given(shadeCell(cell), SHADED));
      const endpoints = new Or([
        new And([new Given(line[lo], 1), new Given(line[hi], 9)]),
        new And([new Given(line[lo], 9), new Given(line[hi], 1)]),
      ]);
      options.push(new And([endpoints, ...windowShaded]));
    }
  }
  return new Or(options);
}
const sandwichShading = sandwichClues.map(({ line }) => fullSandwichShaded(line));

return [
  new Shape('9x9'),
  new Given('R1C1', 3),
  new Given('R1C7', 8),
  new Given('R4C4', 7),
  new Given('R5C6', 3),
  new Given('R7C2', 4),
  new Given('R9C5', 8),
  new Given('R9C9', 9),
  new YinYang(),
  ...whiteDots,
  ...sandwiches,
  ...sandwichShading,
];
