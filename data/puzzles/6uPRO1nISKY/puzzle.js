// Title: One for the New Year
// Author: Fool on Hill
// Video: https://www.youtube.com/watch?v=6uPRO1nISKY
// Source: https://sudokupad.app/rit0vqqp1o

// Normal sudoku, plus anti-king (no repeat a king's move apart), killer
// cages (distinct, sum to the shown total; two of the cages show no total
// and are distinct-only), a closed German Whisper loop (adjacent cells
// differ by >= 5), Kropki white dots (consecutive) and black dots (1:2
// ratio). "Not all dots are necessarily given" means an undotted edge
// carries no information, so no negative Kropki constraint is added.
const givens = [
  new Given('R1C1', 2),
  new Given('R9C9', 5),
];

// Two 9-cell decorative cages with no printed total: only "no repeat"
// applies (catalog: a no-total killer cage is `AllDifferent`).
const noTotalCages = [
  new AllDifferent(
    'R3C2', 'R3C3', 'R4C3', 'R5C1', 'R5C2', 'R5C3', 'R6C1', 'R7C1', 'R7C2'),
  new AllDifferent(
    'R3C7', 'R3C8', 'R4C7', 'R5C7', 'R5C8', 'R5C9', 'R6C9', 'R7C8', 'R7C9'),
];

const cages = [
  new Cage(20, 'R1C4', 'R1C5', 'R2C5', 'R3C5', 'R3C6'),
  new Cage(20, 'R9C1', 'R9C2', 'R9C3', 'R9C4'),
  new Cage(25, 'R1C6', 'R1C7', 'R1C8', 'R1C9'),
];

// Closed 4-cell loop around R7C5; repeat the first cell to cover the
// wrap-around edge (catalog: closed loops need the first cell repeated).
const whisperLoop = new Whisper(
  5, 'R6C5', 'R7C4', 'R8C5', 'R7C6', 'R6C5');

const whiteDots = [
  new WhiteDot('R2C2', 'R3C2'),
  new WhiteDot('R2C8', 'R3C8'),
  new WhiteDot('R5C5', 'R6C5'),
  new WhiteDot('R8C5', 'R9C5'),
  new WhiteDot('R7C8', 'R8C8'),
  new WhiteDot('R7C2', 'R8C2'),
  new WhiteDot('R3C5', 'R4C5'),
  new WhiteDot('R9C5', 'R9C6'),
];

const blackDots = [
  new BlackDot('R2C2', 'R2C3'),
  new BlackDot('R3C2', 'R4C2'),
  new BlackDot('R1C9', 'R2C9'),
  new BlackDot('R2C9', 'R3C9'),
];

return [
  new Shape('9x9'),
  ...givens,
  new AntiKing(),
  ...noTotalCages,
  ...cages,
  whisperLoop,
  ...whiteDots,
  ...blackDots,
];
