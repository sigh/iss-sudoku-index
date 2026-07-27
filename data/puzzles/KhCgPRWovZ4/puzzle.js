// Title: Boxed Out
// Author: Kedad
// Video: https://www.youtube.com/watch?v=KhCgPRWovZ4
// Source: https://sudokupad.app/ojjns7qa7b

// Rules encoded: normal Sudoku, antiknight, both marked diagonals
// non-repeating, German Whisper lines (diff >= 5), X markers (sum to 10),
// parity-marked cells (square = even, circle = odd), white dots (consecutive),
// black dots (1:2 ratio). "Not all dots are necessarily given" is the
// standard negative disclaimer: absence of a dot implies nothing, so no
// negative constraint is added for un-marked adjacent pairs.

// Both long diagonals are drawn (thin blue lines) and backed by hidden
// "unique" cages over the same cell lists, so both diagonals -- not just one
// -- carry the "do not repeat" rule.
const diagonals = [
  new Diagonal(-1), // R1C1-R9C9 ('\\')
  new Diagonal(1), // R9C1-R1C9 ('/')
];

const whispers = [
  new Whisper(5, 'R7C6', 'R6C6', 'R5C6', 'R4C6', 'R3C6'),
  new Whisper(5, 'R3C4', 'R4C4', 'R5C4', 'R6C4', 'R7C4'),
  new Whisper(5, 'R1C7', 'R2C7'),
];

const xMarkers = [
  new X('R3C8', 'R3C9'),
  new X('R8C7', 'R9C7'),
];

// Square-marked cells are even; circle-marked cells are odd. There is no
// dedicated parity class, so these are encoded as candidate-restricted Givens.
const parityGivens = [
  new Given('R7C8', 2, 4, 6, 8),
  new Given('R7C9', 2, 4, 6, 8),
  new Given('R7C2', 1, 3, 5, 7, 9),
  new Given('R2C7', 1, 3, 5, 7, 9),
];

const whiteDots = [
  new WhiteDot('R5C5', 'R6C5'),
  new WhiteDot('R7C1', 'R7C2'),
  new WhiteDot('R7C2', 'R7C3'),
];

const blackDots = [
  new BlackDot('R7C4', 'R8C4'),
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  ...diagonals,
  ...whispers,
  ...xMarkers,
  ...parityGivens,
  ...whiteDots,
  ...blackDots,
];
