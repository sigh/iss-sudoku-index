// Title: Smoggy Knight
// Author: PotatoHead21
// Video: https://www.youtube.com/watch?v=LRUJaflELhE
// Source: https://sudokupad.app/HmmDgD66rH

// Normal Sudoku; fog clearing is UI-only and is omitted. Encode anti-knight,
// the drawn X, killer cages, parity marks, Kropki dots, and the Phistomefel Ring.
// Cage cells and totals are transcribed from the drawn cage clues.
const cages = [
  new Cage(27, 'R5C5', 'R5C6', 'R5C7', 'R6C5', 'R6C6', 'R7C5'),
  new Cage(11, 'R4C4', 'R5C4'),
  new Cage(28, 'R8C8', 'R8C9', 'R9C8', 'R9C9'),
  new Cage(29, 'R1C8', 'R1C9', 'R2C8', 'R2C9'),
  new Cage(26, 'R1C1', 'R1C2', 'R2C1', 'R2C2'),
  new Cage(26, 'R8C1', 'R8C2', 'R9C1', 'R9C2'),
];

// White and black dot endpoints are transcribed from the drawn edge marks.
const whiteDots = [
  new WhiteDot('R5C8', 'R5C9'),
  new WhiteDot('R1C7', 'R2C7'),
  new WhiteDot('R3C8', 'R3C9'),
  new WhiteDot('R9C3', 'R9C4'),
];
const blackDots = [
  new BlackDot('R5C7', 'R5C8'),
  new BlackDot('R8C7', 'R9C7'),
];

// The 16 cells touching the central 3x3 box form the stated Phistomefel Ring.
const phistomefelRing = [
  'R3C3', 'R3C4', 'R3C5', 'R3C6', 'R3C7',
  'R4C3', 'R4C7', 'R5C3', 'R5C7', 'R6C3', 'R6C7',
  'R7C3', 'R7C4', 'R7C5', 'R7C6', 'R7C7',
];

return [
  new Shape('9x9'),
  new AntiKnight(),
  new X('R2C9', 'R3C9'),
  ...cages,
  new Given('R5C2', 1, 3, 5, 7, 9),
  new Given('R3C7', 2, 4, 6, 8),
  new Given('R9C9', 2, 4, 6, 8),
  ...whiteDots,
  ...blackDots,
  new Sum(109, ...phistomefelRing),
];
