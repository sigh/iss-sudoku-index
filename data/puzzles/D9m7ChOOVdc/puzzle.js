// Title: A + N Infinity
// Author: Aspartagcus
// Video: https://www.youtube.com/watch?v=D9m7ChOOVdc
// Source: https://app.crackingthecryptic.com/sudoku/3GD4Fp9RGr

// Normal sudoku, ordinary 3x3 boxes, no givens.
// White dots: consecutive digits. Black dots: 1:2 ratio. Not all dots are
// given, so undrawn pairs carry no claim (no StrictKropki).
// The red line is drawn as one closed stroke (lines[0] in the payload; first
// and last waypoint coincide) that crosses itself at three cells lying on
// the grid's own diagonal (R4C6, R5C5 the grid centre, R6C4): walking the
// drawn order visits those three twice each and the other 20 line cells
// once, 26 steps total. Every one of those 26 drawn adjacent-cell pairs is a
// "neighbouring digit along the line" for the +/-2-step (circular, 1&9
// consecutive) rule below -- that part of the rule needs no path, just the
// drawn ink, so it is unaffected by the ambiguity next.
// For the palindrome the closed walk must be cut open into a start and an
// end ("the start cell and end cell must be determined", per the rules).
// Cutting at an arbitrary point mirror-pairs two cells sharing a row,
// column or box for 22 of the 26 possible cuts -- an immediate Sudoku
// contradiction, so those cuts are not live candidates. Exactly two cuts
// (up to the reversal a palindrome reads the same either way, which halves
// them from four) avoid every such contradiction, encoded as Or below.
const walk = [
  'R2C6', 'R1C7', 'R1C8', 'R2C8', 'R3C7', 'R4C6', 'R5C5', 'R6C4', 'R7C3',
  'R8C2', 'R9C2', 'R9C3', 'R8C4', 'R7C4', 'R6C4', 'R5C3', 'R4C3', 'R3C3',
  'R4C4', 'R5C5', 'R6C6', 'R7C7', 'R6C7', 'R5C7', 'R4C6', 'R3C6',
];
const lineEdges = walk.map((cell, i) => [cell, walk[(i + 1) % walk.length]]);
const withinTwoStepsCircular = Pair.fnToKey(
  (a, b) => Math.min(Math.abs(a - b), 9 - Math.abs(a - b)) <= 2, 9);
const lineNeighbourPairs = lineEdges.map(
  ([a, b], i) => new Pair(withinTwoStepsCircular, `line-nb-${i}`, a, b));

const rotate = (arr, start) => [...arr.slice(start), ...arr.slice(0, start)];
const readingA = new Palindrome(...rotate(walk, walk.indexOf('R4C6')));
const readingB = new Palindrome(...rotate(walk, walk.indexOf('R7C3')));

const whiteDots = [
  ['R1C9', 'R2C9'], ['R2C4', 'R2C5'], ['R4C8', 'R4C9'], ['R6C1', 'R6C2'],
  ['R8C1', 'R9C1'], ['R9C2', 'R9C3'], ['R8C5', 'R8C6'], ['R5C7', 'R6C7'],
  ['R4C3', 'R5C3'],
].map(([a, b]) => new WhiteDot(a, b));
const blackDots = [
  ['R7C4', 'R8C4'], ['R2C6', 'R3C6'], ['R1C7', 'R1C8'],
].map(([a, b]) => new BlackDot(a, b));

return [
  new Shape('9x9'),
  ...lineNeighbourPairs,
  new Or([readingA, readingB]),
  ...whiteDots,
  ...blackDots,
];
