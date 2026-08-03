// Title: June 3, 2023: Difference
// Author: clover!
// Video: https://www.youtube.com/watch?v=AaC7ehqB3MI
// Source: https://tinyurl.com/3cp6ejr3

// Normal sudoku rules apply. Each white dot is printed with a digit; the two
// digits it joins must have that exact absolute difference (not the usual
// unmarked-Kropki convention of difference 1). Dots below are transcribed
// from the drawn geometry (cell pair, printed value).
const dots = [
  ['R4C5', 'R5C5', 4], ['R5C5', 'R6C5', 4],
  ['R5C4', 'R5C5', 2], ['R5C5', 'R5C6', 2],
  ['R3C4', 'R4C4', 7], ['R4C3', 'R4C4', 7],
  ['R6C6', 'R7C6', 5], ['R6C6', 'R6C7', 5],
  ['R6C3', 'R6C4', 3], ['R6C4', 'R7C4', 3],
  ['R3C6', 'R4C6', 1], ['R4C6', 'R4C7', 1],
  ['R4C3', 'R5C3', 7], ['R3C5', 'R3C6', 1],
  ['R5C7', 'R6C7', 5], ['R7C4', 'R7C5', 3],
  ['R8C3', 'R9C3', 2], ['R9C3', 'R9C4', 2],
  ['R1C6', 'R1C7', 4], ['R1C7', 'R2C7', 4],
  ['R4C1', 'R4C2', 5], ['R3C2', 'R4C2', 5],
  ['R6C8', 'R6C9', 4], ['R6C8', 'R7C8', 4],
  ['R5C8', 'R6C8', 1], ['R4C2', 'R5C2', 1],
  ['R7C1', 'R8C1', 1], ['R8C1', 'R9C1', 1],
  ['R1C9', 'R2C9', 2], ['R2C9', 'R3C9', 2],
];

// Difference-1 dots are exactly the native WhiteDot ("consecutive") relation;
// one WhiteDot per edge, since these are independent dominoes, not a chain.
// The remaining values have no native class, so they get one Pair per dot
// (each dot is an independent two-cell edge, so grouping them by shared array
// position would wrongly bind unrelated dots to each other -- see
// iss-constraints catalog's "Pairs And Small Clues"). Dots that print the
// same difference value share one relation key, built once via Pair.fnToKey.
const whiteDots = dots.filter(([, , value]) => value === 1);
const otherDots = dots.filter(([, , value]) => value !== 1);

const keyForValue = {};
for (const [, , value] of otherDots) {
  if (!(value in keyForValue)) {
    keyForValue[value] = Pair.fnToKey((a, b) => Math.abs(a - b) === value, 9);
  }
}

return [
  new Given('R3C3', 7),
  new Given('R3C7', 3),
  new Given('R7C3', 9),
  new Given('R7C7', 1),
  ...whiteDots.map(([a, b]) => new WhiteDot(a, b)),
  ...otherDots.map(([a, b, value]) =>
    new Pair(keyForValue[value], `diff ${value}`, a, b)),
];
