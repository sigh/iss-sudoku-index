// Title: November 18, 2022: GEology
// Author: Philip Newman
// Video: https://www.youtube.com/watch?v=5i7-TPXuGBA
// Source: https://tinyurl.com/23ty37eu
//
// Normal sudoku rules apply. White dots require a difference of 5; black
// dots require a ratio of 3:1. The ruleset states there is no negative
// constraint, so unmarked adjacent cells are left unrestricted (encoded by
// simply not adding a negative constraint for either relation).

// White dots (difference of 5), read from the puzzle's drawn dot markers.
const whiteDots = [
  ['R1C3', 'R2C3'],
  ['R3C5', 'R4C5'],
  ['R5C7', 'R6C7'],
  ['R7C9', 'R8C9'],
  ['R9C7', 'R9C8'],
  ['R8C6', 'R8C7'],
  ['R7C5', 'R7C6'],
  ['R6C4', 'R6C5'],
  ['R5C3', 'R5C4'],
  ['R4C2', 'R4C3'],
  ['R3C1', 'R3C2'],
  ['R1C5', 'R1C6'],
  ['R2C6', 'R2C7'],
  ['R4C9', 'R4C8'],
  ['R2C7', 'R3C7'],
];

// Black dots (ratio of 3:1), read from the puzzle's drawn dot markers.
const blackDots = [
  ['R1C2', 'R1C3'],
  ['R2C4', 'R2C3'],
  ['R3C4', 'R3C5'],
  ['R4C5', 'R4C6'],
  ['R5C7', 'R5C6'],
  ['R6C7', 'R6C8'],
  ['R7C9', 'R7C8'],
  ['R8C7', 'R9C7'],
  ['R6C5', 'R7C5'],
  ['R5C3', 'R4C3'],
  ['R2C1', 'R3C1'],
  ['R1C9', 'R1C8'],
];

// No built-in dot class matches these relations (WhiteDot is consecutive,
// BlackDot is 2:1), so both are custom Pair relations over digits 1-9.
const diffKey = Pair.fnToKey((a, b) => Math.abs(a - b) === 5, 9);
const ratioKey = Pair.fnToKey((a, b) => a === 3 * b || b === 3 * a, 9);

return [
  new Shape('9x9'),
  ...whiteDots.map(([a, b]) => new Pair(diffKey, 'white dot', a, b)),
  ...blackDots.map(([a, b]) => new Pair(ratioKey, 'black dot', a, b)),
];
