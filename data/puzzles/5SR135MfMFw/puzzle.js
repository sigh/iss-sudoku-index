// Title: Joust odd
// Author: Pulsar
// Video: https://www.youtube.com/watch?v=5SR135MfMFw
// Source: https://app.crackingthecryptic.com/q19d8cr03p

// Rules: normal Sudoku; cells a knight's move apart cannot hold the same digit;
// digits in a cage sum to the number in its top-left corner (X can be any digit
// 0-9) and cannot repeat; circled cells hold an odd digit.
//
// Seven cages carry a plain number. Four carry the labels "2X" and "1X": the
// rules define X as a digit 0-9, so those labels spell a two-digit total whose
// units digit is unknown -- 20-29 and 10-19 respectively. Every rule is
// encoded; nothing is omitted.

// Circled cells, from the eleven grey circle underlays.
const oddCells = [
  'R2C2', 'R2C5', 'R3C4', 'R4C3', 'R4C6',
  'R5C2', 'R5C5', 'R6C4', 'R6C7', 'R7C6', 'R8C8',
];

// Cages with a numeric corner label, as drawn.
const numericCages = [
  [16, ['R4C4', 'R4C5', 'R5C4']],
  [14, ['R5C6', 'R6C5', 'R6C6']],
  [15, ['R6C7', 'R7C6', 'R7C7']],
  [22, ['R7C8', 'R7C9', 'R8C9']],
  [15, ['R9C7', 'R9C8', 'R9C9']],
  [12, ['R9C1', 'R9C2', 'R9C3']],
  [32, ['R8C5', 'R8C6', 'R9C4', 'R9C5', 'R9C6']],
];

// Cages whose corner label ends in X, as drawn. Stored as [tens digit, cells].
const xCages = [
  [2, ['R1C1', 'R1C2', 'R2C1']],
  [1, ['R1C4', 'R2C2', 'R2C3', 'R2C4', 'R3C4']],
  [1, ['R1C8', 'R1C9', 'R2C8', 'R2C9', 'R3C9']],
  [1, ['R1C6', 'R2C6', 'R2C7', 'R3C6']],
];

// X is never given, so the total is only known to be one of the ten numbers the
// label can spell: a disjunction over X = 0..9 rather than a single sum. The
// rules do not say whether the four labels share one value of X, so X is left
// free per cage, which admits both readings. Each branch is a full cage, so the
// all-different requirement holds whichever total is taken.
const xCageConstraint = (tens, cells) => new Or(
  Array.from({ length: 10 },
    (_, x) => new Cage(tens * 10 + x, ...cells)));

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...oddCells.map(cell => new Given(cell, 1, 3, 5, 7, 9)),
  ...numericCages.map(([total, cells]) => new Cage(total, ...cells)),
  ...xCages.map(([tens, cells]) => xCageConstraint(tens, cells)),
];
