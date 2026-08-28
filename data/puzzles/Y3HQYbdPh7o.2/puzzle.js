// Title: Dec 15, 2021: Greater Sudoku
// Author: clover!
// Video: https://www.youtube.com/watch?v=Y3HQYbdPh7o
// Source: https://tinyurl.com/5dabncfy
//
// Normal sudoku rules apply. A circled value drawn on the edge between two
// orthogonally adjacent cells gives the greater of the two digits in those
// cells (a circled 4 permits {4,3}, {4,1}, {4,2}, ...). The ruleset gives a
// worked example but states no negative/exhaustiveness clause, so unmarked
// adjacent pairs carry no restriction -- only the drawn circles constrain.
//
// Each circle is a two-cell relation keyed by its printed value: Pair with a
// key built from `Math.max(a, b) === value` accepts exactly the digit pairs
// whose larger member is that value. Cell order in each Pair does not matter
// since the relation is symmetric.

const shape = new Shape('9x9');

const givens = [
  new Given('R1C5', 4),
  new Given('R4C4', 1),
  new Given('R4C6', 2),
  new Given('R5C1', 6),
  new Given('R5C9', 1),
  new Given('R6C4', 3),
  new Given('R6C6', 4),
  new Given('R9C1', 3),
  new Given('R9C5', 7),
  new Given('R9C9', 4),
];

// Circles: [cellA, cellB, circledValue], transcribed from the drawn circles.
const circleClues = [
  ['R2C3', 'R3C3', 5],
  ['R4C5', 'R5C5', 6],
  ['R5C4', 'R5C5', 7],
  ['R6C5', 'R5C5', 8],
  ['R5C5', 'R5C6', 9],
  ['R1C1', 'R1C2', 8],
  ['R2C2', 'R1C2', 7],
  ['R2C2', 'R2C3', 6],
  ['R3C4', 'R3C3', 4],
  ['R1C8', 'R1C9', 2],
  ['R1C8', 'R2C8', 3],
  ['R2C7', 'R2C8', 4],
  ['R3C7', 'R2C7', 5],
  ['R3C7', 'R3C6', 6],
  ['R4C2', 'R4C3', 4],
  ['R5C2', 'R6C2', 2],
  ['R5C8', 'R6C8', 4],
  ['R4C7', 'R4C8', 7],
  ['R7C7', 'R7C6', 2],
  ['R7C3', 'R7C4', 6],
];

const greaterKeys = new Map();
const greaterKey = (value) => {
  if (!greaterKeys.has(value)) {
    greaterKeys.set(
      value, Pair.fnToKey((a, b) => Math.max(a, b) === value, 9));
  }
  return greaterKeys.get(value);
};

const circles = circleClues.map(
  ([a, b, value]) => new Pair(greaterKey(value), `greater=${value}`, a, b));

return [shape, ...givens, ...circles];
