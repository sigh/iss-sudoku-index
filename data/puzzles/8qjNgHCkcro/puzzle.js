// Title: Four Fifty
// Author: WombatBreath
// Video: https://www.youtube.com/watch?v=8qjNgHCkcro
// Source: https://app.crackingthecryptic.com/sudoku/gN79Qm9HfT
//
// Normal sudoku rules apply. Digits may not repeat in cages or on the
// ampersand (which therefore forms an additional region). All cages
// contain digits summing to the same total, which is to be determined.
// Letters represent the digits 1-9 in alphabetical order (so A=1, E=2, ...,
// R=9). Cells separated by a white dot contain consecutive digits. Not all
// possible dots are given (so the absence of a dot elsewhere is not
// negative information -- no AntiConsecutive is encoded).
//
// Givens are drawn as single-letter center pencil-marks rather than
// numeric values; the letters used (A,E,G,I,M,N,O,P,R) are exactly nine
// distinct letters whose alphabetical order matches the rule's own stated
// endpoints (A first =1, R last =9), decoded here to digits and emitted as
// Given.
//
// Cages have no printed total, so each is AllDifferent (a no-total killer
// cage is distinct-only, per iss-constraints catalog); EqualSum ties all
// six cage segments to one common (solver-determined) total.
//
// The ampersand is the 9-cell path traced by the single grey line,
// interpolated through its one diagonal two-cell jump -- AllDifferent
// only; the rules do not require its sum to match the cages.

const GIVENS = [
  ['R1C4', 8], // P
  ['R2C5', 4], // I
  ['R3C1', 5], // M
  ['R3C6', 2], // E
  ['R4C2', 9], // R
  ['R4C7', 5], // M
  ['R5C3', 5], // M
  ['R5C8', 1], // A
  ['R6C4', 1], // A
  ['R6C9', 6], // N
  ['R7C5', 3], // G
  ['R8C6', 7], // O
  ['R9C7', 7], // O
];

const CAGES = [
  ['R3C3', 'R4C3', 'R4C2', 'R5C2', 'R5C1', 'R6C1'],
  ['R2C6', 'R2C5', 'R2C4', 'R3C4', 'R4C4', 'R5C4', 'R5C5'],
  ['R5C6', 'R6C6', 'R7C6', 'R8C6', 'R8C5', 'R8C4'],
  ['R2C7', 'R2C8', 'R1C8', 'R2C9', 'R3C9', 'R4C9', 'R5C9'],
  ['R3C7', 'R4C7', 'R5C7', 'R6C7', 'R6C8', 'R6C9', 'R7C8'],
  ['R7C1', 'R7C2', 'R7C3', 'R6C3', 'R8C3', 'R9C3'],
];

// The "&" shape, in drawn path order (the diagonal-jump interpolation
// inserts R5C6 between R4C5 and R6C7).
const AMPERSAND = [
  'R5C7', 'R6C6', 'R6C5', 'R5C5', 'R4C6', 'R3C5', 'R4C5', 'R5C6', 'R6C7',
];

const DOTS = [
  ['R1C3', 'R1C4'],
  ['R5C7', 'R6C7'],
];

const givens = GIVENS.map(([cell, value]) => new Given(cell, value));
const cageDistinct = CAGES.map(cells => new AllDifferent(...cells));
const cageEqualSum = new EqualSum(...CAGES);
const ampersand = new AllDifferent(...AMPERSAND);
const dots = DOTS.map(([a, b]) => new WhiteDot(a, b));

return [
  new Shape('9x9'),
  ...givens,
  ...cageDistinct,
  cageEqualSum,
  ampersand,
  ...dots,
];
