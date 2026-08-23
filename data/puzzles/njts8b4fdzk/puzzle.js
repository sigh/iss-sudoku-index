// Title: Yin Yang Counting Circles
// Author: Dag H
// Video: https://www.youtube.com/watch?v=njts8b4fdzk
// Source: https://sudokupad.app/8uefwr5pkz

// Normal Sudoku; two connected Yin-Yang shades; no monochromatic 2x2; counting
// circles; circled odds/even digits have opposite shades; and white dots are
// consecutive digit pairs of opposite shades.

const SHADED = 1;
const UNSHADED = 2;
const graph = cellGraph('9x9');
const geometry = graph.gridGeometry();
const shade = graph.makeOverlay('YY');

// Drawn counting circles, in source-array order.
const circles = [
  'R1C2', 'R1C1', 'R2C1', 'R2C4', 'R2C5', 'R2C7', 'R2C8',
  'R5C2', 'R8C2', 'R9C2', 'R8C8', 'R8C7', 'R9C9', 'R7C8',
  'R2C2', 'R4C2', 'R4C7', 'R4C5', 'R6C6', 'R5C5', 'R7C5',
];

// Drawn white-dot pairs, in source-array order.
const dots = [
  ['R1C1', 'R1C2'], ['R8C2', 'R9C2'], ['R2C7', 'R2C8'],
  ['R4C2', 'R5C2'], ['R2C3', 'R3C3'], ['R7C3', 'R7C2'],
  ['R3C8', 'R4C8'], ['R3C8', 'R3C9'], ['R8C1', 'R8C2'],
  ['R4C2', 'R4C3'],
];

const dotRules = dots.flatMap(([a, b]) => [
  new WhiteDot(a, b),
  new AllDifferent(...shade.at([a, b])),
]);

// Map circled odd digits to one arbitrary colour-name and circled evens to the
// other; swapping the two colour names has no puzzle meaning.
const parityShadeKey = Pair.fnToKey(
  (digit, shadeValue) => (digit % 2 === 1) === (shadeValue === SHADED),
  geometry);
const circleParity = circles.map(cell => new Pair(
  parityShadeKey, 'circled digit parity and shade', cell, shade.at(cell)));

return [
  new Shape('9x9'),
  new YinYang(),
  new Given('R7C4', 7),
  new CountingCircles(...circles),
  ...circleParity,
  ...dotRules,
];
