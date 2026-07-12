// Title: RAT RUN 31: Equivalence
// Author: Marty Sears and Justin Vitanza
// Video: https://www.youtube.com/watch?v=Qa9r_bEjVfk
// Source: https://sudokupad.app/37wqeifgzs

// Normal sudoku rules apply (standard 9x9 boxes, no givens).

// Blackcurrants: one digit is double the other. Kropki's BlackDot has the
// exact same 2:1-ratio semantics.
const blackcurrants = [
  ['R3C2', 'R3C3'],
  ['R4C7', 'R4C8'],
  ['R4C8', 'R5C8'],
  ['R7C3', 'R7C4'],
  ['R7C8', 'R7C9'],
  ['R6C1', 'R6C2'],
];

// Redcurrants: the two digits have opposite parity (one odd, one even).
const redcurrantKey = Pair.fnToKey((a, b) => (a % 2) !== (b % 2), 9);
const redcurrants = [
  ['R3C7', 'R4C7'],
  ['R6C2', 'R7C2'],
  ['R6C6', 'R6C7'],
];

return [
  new Shape('9x9'),
  ...blackcurrants.map(cells => new BlackDot(...cells)),
  ...redcurrants.map(cells => new Pair(redcurrantKey, 'redcurrant', ...cells)),
  // Teleports: "the teleports have identical digits" holds regardless of the
  // (unencoded) rat paths, so it is a plain same-value constraint.
  new SameValues(2, 'R3C5', 'R9C1'),
];
