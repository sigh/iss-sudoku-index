// Title: 4/4/23: Difference Arrow
// Author: clover!
// Video: https://www.youtube.com/watch?v=FN3oEZZizb0
// Source: https://tinyurl.com/2wnccz4e

// Normal sudoku rules apply. Six circles each have several arrow arms drawn
// from them; every arm independently sums to its own circle's digit (a
// single-cell arm forces that cell to equal the circle). Four white dots
// each show the absolute difference between their two cells (the rules'
// own worked example gives values other than 1, so these are not
// consecutive/Kropki dots).

const arrows = [
  // Circle, then each arm's cells (bulb excluded).
  { circle: 'R3C7', arms: [['R3C6', 'R3C5', 'R3C4'], ['R2C7', 'R1C7'], ['R2C8', 'R1C9'], ['R2C6']] },
  { circle: 'R7C7', arms: [['R6C7', 'R5C7', 'R4C7'], ['R7C8', 'R7C9'], ['R8C8', 'R9C9'], ['R6C8']] },
  { circle: 'R7C3', arms: [['R7C4', 'R7C5', 'R7C6'], ['R8C3', 'R9C3'], ['R8C2', 'R9C1'], ['R8C4']] },
  { circle: 'R3C3', arms: [['R4C3', 'R5C3', 'R6C3'], ['R3C2', 'R3C1'], ['R2C2', 'R1C1'], ['R4C2']] },
  { circle: 'R2C3', arms: [['R2C4', 'R2C5'], ['R1C4']] },
  { circle: 'R8C7', arms: [['R8C6', 'R8C5'], ['R9C6']] },
];

const arrowConstraints = arrows.flatMap(
  ({ circle, arms }) => arms.map(arm => new Arrow(circle, ...arm)));

const diffDots = [
  { cells: ['R6C7', 'R5C7'], value: 4 },
  { cells: ['R5C3', 'R4C3'], value: 4 },
  { cells: ['R3C5', 'R3C6'], value: 3 },
  { cells: ['R7C4', 'R7C5'], value: 3 },
];

// Keyed per distinct difference value so equal-value dots share one Pair key.
const diffKeys = new Map();
function diffKey(value) {
  if (!diffKeys.has(value)) {
    diffKeys.set(value, Pair.fnToKey((a, b) => Math.abs(a - b) === value, 9));
  }
  return diffKeys.get(value);
}

const diffConstraints = diffDots.map(
  ({ cells, value }) => new Pair(diffKey(value), `diff ${value}`, ...cells));

return [
  new Shape('9x9'),
  new Given('R4C7', 2),
  new Given('R6C3', 1),
  ...arrowConstraints,
  ...diffConstraints,
];
